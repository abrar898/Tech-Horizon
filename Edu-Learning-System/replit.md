# Overview

LearnHub is an online learning platform built with Flask that enables instructors to create and sell courses while providing students with a comprehensive learning experience. The platform features course management, video content delivery, interactive quizzes, progress tracking, and integrated payment processing through Stripe. Students can enroll in courses, track their progress, and earn certificates upon completion.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Framework
- **Flask**: Core web framework with SQLAlchemy ORM for database operations
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable) with connection pooling for reliability
- **Authentication**: Replit Auth integration using OAuth2 with Flask-Dance for social login
- **Session Management**: Flask-Login for user session handling with permanent sessions

## Database Design
- **User Model**: Stores user profiles with instructor/student roles, OAuth integration support
- **Course Model**: Contains course metadata including title, description, pricing, video content, and publication status
- **Enrollment System**: Tracks student enrollments in courses with progress monitoring
- **Quiz System**: Interactive assessments with questions, attempts, and scoring (models referenced but not fully implemented in current codebase)
- **Progress Tracking**: Monitors student advancement through course materials

## Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive UI
- **Styling**: Bootstrap dark theme with custom CSS overrides for enhanced visual appeal
- **JavaScript**: Custom app.js for interactive features including form validation, smooth scrolling, and progress tracking
- **File Upload**: Support for video and document uploads with 500MB size limit

## Security Features
- **Authentication**: OAuth-based login with Replit Auth integration
- **Authorization**: Role-based access control distinguishing instructors from students
- **File Security**: Secure filename handling for uploads with allowed file type restrictions
- **Session Security**: Permanent sessions with secure key management

## Content Management
- **Course Creation**: Multi-step course creation with media upload capabilities
- **Video Hosting**: Support for video URLs and local file uploads
- **Progress Tracking**: Real-time monitoring of student course completion
- **Quiz Engine**: Interactive assessment system with timed quizzes and scoring

# External Dependencies

## Payment Processing
- **Stripe**: Integrated for course enrollment payments with webhook support for payment verification

## Authentication Service
- **Replit Auth**: OAuth2 provider for user authentication and authorization

## Frontend Libraries
- **Bootstrap 5**: CSS framework with dark theme implementation
- **Font Awesome**: Icon library for UI enhancement
- **jQuery**: JavaScript library for DOM manipulation and AJAX requests

## File Storage
- **Local Storage**: File uploads stored in local uploads directory (configurable for cloud storage)

## Development Tools
- **Werkzeug**: WSGI utilities and development server with proxy fix for HTTPS URL generation
- **Flask Extensions**: SQLAlchemy, Login Manager, and Dance for OAuth integration