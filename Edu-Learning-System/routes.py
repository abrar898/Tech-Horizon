import os
import stripe
from datetime import datetime
from flask import render_template, request, redirect, url_for, flash, jsonify, current_app, send_from_directory
from flask_login import current_user
from werkzeug.utils import secure_filename
from sqlalchemy import or_

from app import app, db
from models import User, Course, Enrollment, Quiz, QuizQuestion, QuizAttempt, Lesson, Progress
from replit_auth import require_login, make_replit_blueprint

# Configure Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

app.register_blueprint(make_replit_blueprint(), url_prefix="/auth")

@app.before_request
def make_session_permanent():
    from flask import session
    session.permanent = True

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'pdf', 'doc', 'docx', 'ppt', 'pptx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    # Get featured courses for landing page
    featured_courses = Course.query.filter_by(is_published=True).limit(6).all()
    
    return render_template('index.html', featured_courses=featured_courses)

@app.route('/dashboard')
@require_login
def dashboard():
    # Get user's enrolled courses
    enrollments = Enrollment.query.filter_by(user_id=current_user.id).all()
    enrolled_courses = [enrollment.course for enrollment in enrollments]
    
    # Get recent courses
    recent_courses = Course.query.filter_by(is_published=True).order_by(Course.created_at.desc()).limit(4).all()
    
    return render_template('dashboard.html', 
                         enrolled_courses=enrolled_courses, 
                         recent_courses=recent_courses)

@app.route('/courses')
def courses():
    search = request.args.get('search', '')
    difficulty = request.args.get('difficulty', '')
    
    query = Course.query.filter_by(is_published=True)
    
    if search:
        query = query.filter(or_(
            Course.title.contains(search),
            Course.description.contains(search)
        ))
    
    if difficulty:
        query = query.filter_by(difficulty_level=difficulty)
    
    courses_list = query.order_by(Course.created_at.desc()).all()
    
    return render_template('courses.html', courses=courses_list, search=search, difficulty=difficulty)

@app.route('/course/<int:course_id>')
@require_login
def course_detail(course_id):
    course = Course.query.get_or_404(course_id)
    
    # Check if user is enrolled
    enrollment = Enrollment.query.filter_by(user_id=current_user.id, course_id=course_id).first()
    
    # Get course lessons
    lessons = Lesson.query.filter_by(course_id=course_id).order_by(Lesson.order_index).all()
    
    # Get user's progress if enrolled
    user_progress = []
    if enrollment:
        user_progress = Progress.query.filter_by(user_id=current_user.id, course_id=course_id).all()
    
    # Get quizzes
    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    
    return render_template('course_detail.html', 
                         course=course, 
                         enrollment=enrollment,
                         lessons=lessons,
                         user_progress=user_progress,
                         quizzes=quizzes)

@app.route('/enroll/<int:course_id>')
@require_login
def enroll_course(course_id):
    course = Course.query.get_or_404(course_id)
    
    # Check if already enrolled
    existing_enrollment = Enrollment.query.filter_by(user_id=current_user.id, course_id=course_id).first()
    if existing_enrollment:
        flash('You are already enrolled in this course.', 'info')
        return redirect(url_for('course_detail', course_id=course_id))
    
    if course.price > 0:
        # Redirect to payment
        return redirect(url_for('create_checkout_session', course_id=course_id))
    else:
        # Free course - enroll immediately
        enrollment = Enrollment(user_id=current_user.id, course_id=course_id, payment_status='completed')
        db.session.add(enrollment)
        db.session.commit()
        flash('Successfully enrolled in the course!', 'success')
        return redirect(url_for('course_detail', course_id=course_id))

@app.route('/create-checkout-session/<int:course_id>', methods=['POST'])
@require_login
def create_checkout_session(course_id):
    course = Course.query.get_or_404(course_id)
    
    try:
        YOUR_DOMAIN = os.environ.get('REPLIT_DEV_DOMAIN', 'localhost:5000')
        if not YOUR_DOMAIN.startswith('http'):
            YOUR_DOMAIN = 'https://' + YOUR_DOMAIN
            
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': course.title,
                            'description': course.description[:500] if course.description else ''
                        },
                        'unit_amount': int(course.price * 100),  # Stripe expects cents
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=YOUR_DOMAIN + '/payment/success?session_id={CHECKOUT_SESSION_ID}&course_id=' + str(course_id),
            cancel_url=YOUR_DOMAIN + '/payment/cancel?course_id=' + str(course_id),
            metadata={
                'course_id': course_id,
                'user_id': current_user.id
            }
        )
        
        # Save the session ID for later verification
        enrollment = Enrollment(
            user_id=current_user.id, 
            course_id=course_id, 
            payment_status='pending',
            stripe_session_id=checkout_session.id
        )
        db.session.add(enrollment)
        db.session.commit()
        
    except Exception as e:
        flash(f'Error creating payment session: {str(e)}', 'error')
        return redirect(url_for('course_detail', course_id=course_id))
    
    return redirect(checkout_session.url, code=303)

@app.route('/payment/success')
@require_login
def payment_success():
    session_id = request.args.get('session_id')
    course_id = request.args.get('course_id')
    
    if session_id and course_id:
        # Verify payment with Stripe
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == 'paid':
                # Update enrollment status
                enrollment = Enrollment.query.filter_by(
                    stripe_session_id=session_id, 
                    course_id=course_id
                ).first()
                if enrollment:
                    enrollment.payment_status = 'completed'
                    db.session.commit()
                    flash('Payment successful! You are now enrolled in the course.', 'success')
                    return render_template('payment_success.html', course_id=course_id)
        except Exception as e:
            flash(f'Error verifying payment: {str(e)}', 'error')
    
    return redirect(url_for('courses'))

@app.route('/payment/cancel')
@require_login
def payment_cancel():
    course_id = request.args.get('course_id')
    flash('Payment was cancelled.', 'info')
    return render_template('payment_cancel.html', course_id=course_id)

@app.route('/instructor')
@require_login
def instructor_dashboard():
    if not current_user.is_instructor:
        # Make user an instructor if they're not already
        current_user.is_instructor = True
        db.session.commit()
    
    # Get instructor's courses
    courses = Course.query.filter_by(instructor_id=current_user.id).all()
    
    # Calculate stats
    total_students = sum([len(course.enrollments) for course in courses])
    published_courses = len([c for c in courses if c.is_published])
    
    return render_template('instructor_dashboard.html', 
                         courses=courses,
                         total_students=total_students,
                         published_courses=published_courses)

@app.route('/instructor/course/create', methods=['GET', 'POST'])
@require_login
def create_course():
    if not current_user.is_instructor:
        current_user.is_instructor = True
        db.session.commit()
    
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        price = float(request.form.get('price', 0))
        difficulty = request.form.get('difficulty', 'Beginner')
        
        course = Course(
            title=title,
            description=description,
            price=price,
            difficulty_level=difficulty,
            instructor_id=current_user.id
        )
        
        db.session.add(course)
        db.session.commit()
        
        flash('Course created successfully!', 'success')
        return redirect(url_for('edit_course', course_id=course.id))
    
    return render_template('create_course.html')

@app.route('/instructor/course/<int:course_id>/edit')
@require_login
def edit_course(course_id):
    course = Course.query.filter_by(id=course_id, instructor_id=current_user.id).first_or_404()
    lessons = Lesson.query.filter_by(course_id=course_id).order_by(Lesson.order_index).all()
    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    
    return render_template('edit_course.html', course=course, lessons=lessons, quizzes=quizzes)

@app.route('/quiz/<int:quiz_id>')
@require_login
def take_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Check if user is enrolled in the course
    enrollment = Enrollment.query.filter_by(
        user_id=current_user.id, 
        course_id=quiz.course_id,
        payment_status='completed'
    ).first()
    
    if not enrollment:
        flash('You must be enrolled in the course to take this quiz.', 'error')
        return redirect(url_for('course_detail', course_id=quiz.course_id))
    
    questions = QuizQuestion.query.filter_by(quiz_id=quiz_id).order_by(QuizQuestion.order_index).all()
    
    return render_template('quiz.html', quiz=quiz, questions=questions)

@app.route('/quiz/<int:quiz_id>/submit', methods=['POST'])
@require_login
def submit_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    questions = QuizQuestion.query.filter_by(quiz_id=quiz_id).all()
    
    answers = {}
    score = 0
    max_score = 0
    
    for question in questions:
        user_answer = request.form.get(f'question_{question.id}')
        answers[str(question.id)] = user_answer
        max_score += question.points
        
        if user_answer and user_answer.lower() == question.correct_answer.lower():
            score += question.points
    
    percentage = (score / max_score * 100) if max_score > 0 else 0
    passed = percentage >= quiz.passing_score
    
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        max_score=max_score,
        answers=answers,
        completed_at=datetime.now(),
        passed=passed
    )
    
    db.session.add(attempt)
    db.session.commit()
    
    if passed:
        flash(f'Congratulations! You passed with {percentage:.1f}%', 'success')
    else:
        flash(f'You scored {percentage:.1f}%. You need {quiz.passing_score}% to pass.', 'warning')
    
    return redirect(url_for('course_detail', course_id=quiz.course_id))

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/update-progress/<int:lesson_id>')
@require_login
def update_progress(lesson_id):
    lesson = Lesson.query.get_or_404(lesson_id)
    
    # Check enrollment
    enrollment = Enrollment.query.filter_by(
        user_id=current_user.id,
        course_id=lesson.course_id,
        payment_status='completed'
    ).first()
    
    if not enrollment:
        return jsonify({'error': 'Not enrolled'}), 403
    
    # Update or create progress
    progress = Progress.query.filter_by(
        user_id=current_user.id,
        course_id=lesson.course_id,
        lesson_id=lesson_id
    ).first()
    
    if not progress:
        progress = Progress(
            user_id=current_user.id,
            course_id=lesson.course_id,
            lesson_id=lesson_id
        )
        db.session.add(progress)
    
    progress.completed = True
    progress.completed_at = datetime.now()
    
    # Update overall course progress
    total_lessons = Lesson.query.filter_by(course_id=lesson.course_id).count()
    completed_lessons = Progress.query.filter_by(
        user_id=current_user.id,
        course_id=lesson.course_id,
        completed=True
    ).count()
    
    if total_lessons > 0:
        enrollment.progress_percentage = (completed_lessons / total_lessons) * 100
        if enrollment.progress_percentage >= 100:
            enrollment.completed_at = datetime.now()
    
    db.session.commit()
    
    return jsonify({'success': True, 'progress': enrollment.progress_percentage})
