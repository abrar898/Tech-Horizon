/**
 * LearnHub - Custom JavaScript
 * Enhances user experience with interactive features
 */

// Global app object
window.LearnHub = {
    init: function() {
        this.setupEventListeners();
        this.initializeComponents();
        this.setupProgressTracking();
        this.setupNotifications();
    },

    // Setup global event listeners
    setupEventListeners: function() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href && href.length > 1) { // Only proceed if href is more than just "#"
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Form validation enhancements
        const forms = document.querySelectorAll('form[data-validate="true"]');
        forms.forEach(form => {
            form.addEventListener('submit', this.validateForm);
        });

        // Auto-dismiss alerts after 5 seconds
        setTimeout(() => {
            const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
            alerts.forEach(alert => {
                const alertInstance = new bootstrap.Alert(alert);
                alertInstance.close();
            });
        }, 5000);

        // Search functionality
        this.setupSearch();
    },

    // Initialize Bootstrap components
    initializeComponents: function() {
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Initialize popovers
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });

        // Initialize modals with focus management
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('shown.bs.modal', function() {
                const firstInput = this.querySelector('input, textarea, select');
                if (firstInput) {
                    firstInput.focus();
                }
            });
        });
    },

    // Progress tracking for video lessons
    setupProgressTracking: function() {
        const videos = document.querySelectorAll('video[data-lesson-id]');
        
        videos.forEach(video => {
            const lessonId = video.dataset.lessonId;
            let progressTracked = false;

            // Track when video reaches 90% completion
            video.addEventListener('timeupdate', function() {
                const progress = (this.currentTime / this.duration) * 100;
                
                if (progress >= 90 && !progressTracked) {
                    progressTracked = true;
                    LearnHub.updateLessonProgress(lessonId);
                }
            });

            // Save video position
            video.addEventListener('pause', function() {
                localStorage.setItem(`video_${lessonId}_position`, this.currentTime);
            });

            // Restore video position
            const savedPosition = localStorage.getItem(`video_${lessonId}_position`);
            if (savedPosition) {
                video.currentTime = parseFloat(savedPosition);
            }
        });
    },

    // Update lesson progress
    updateLessonProgress: function(lessonId) {
        fetch(`/update-progress/${lessonId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Progress saved!', 'success');
                this.updateProgressBar(data.progress);
            }
        })
        .catch(error => {
            console.error('Error updating progress:', error);
        });
    },

    // Update progress bar
    updateProgressBar: function(progress) {
        const progressBars = document.querySelectorAll('.progress-bar[data-course-progress]');
        progressBars.forEach(bar => {
            bar.style.width = progress + '%';
            bar.setAttribute('aria-valuenow', progress);
            
            // Update text if present
            const progressText = bar.parentElement.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = Math.round(progress) + '%';
            }
        });
    },

    // Setup search functionality
    setupSearch: function() {
        const searchInputs = document.querySelectorAll('input[type="search"], input[name="search"]');
        
        searchInputs.forEach(input => {
            let searchTimeout;
            
            input.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const query = this.value.toLowerCase();
                    LearnHub.filterContent(query);
                }, 300);
            });
        });
    },

    // Filter content based on search query
    filterContent: function(query) {
        const items = document.querySelectorAll('[data-searchable]');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const isVisible = text.includes(query) || query === '';
            
            if (isVisible) {
                item.style.display = '';
                item.classList.remove('d-none');
            } else {
                item.style.display = 'none';
                item.classList.add('d-none');
            }
        });

        // Show/hide "no results" message
        const visibleItems = document.querySelectorAll('[data-searchable]:not([style*="none"])');
        const noResultsElement = document.querySelector('.no-results-message');
        
        if (visibleItems.length === 0 && query !== '') {
            if (noResultsElement) {
                noResultsElement.style.display = 'block';
            }
        } else {
            if (noResultsElement) {
                noResultsElement.style.display = 'none';
            }
        }
    },

    // Form validation
    validateForm: function(event) {
        const form = event.target;
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
                
                // Show error message
                let errorElement = field.nextElementSibling;
                if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
                    errorElement = document.createElement('div');
                    errorElement.className = 'invalid-feedback';
                    field.parentNode.insertBefore(errorElement, field.nextSibling);
                }
                errorElement.textContent = 'This field is required.';
            } else {
                field.classList.remove('is-invalid');
                const errorElement = field.nextElementSibling;
                if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                    errorElement.remove();
                }
            }
        });

        if (!isValid) {
            event.preventDefault();
            event.stopPropagation();
        }

        form.classList.add('was-validated');
    },

    // Notification system
    setupNotifications: function() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
    },

    // Show notification
    showNotification: function(message, type = 'info', duration = 3000) {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(notification);

        // Auto-dismiss after duration
        setTimeout(() => {
            if (notification.parentNode) {
                const alertInstance = new bootstrap.Alert(notification);
                alertInstance.close();
            }
        }, duration);
    },

    // Quiz functionality
    quiz: {
        timeRemaining: null,
        timerInterval: null,

        startTimer: function(minutes) {
            this.timeRemaining = minutes * 60;
            this.updateTimerDisplay();
            
            this.timerInterval = setInterval(() => {
                this.timeRemaining--;
                this.updateTimerDisplay();
                
                if (this.timeRemaining <= 0) {
                    this.timeUp();
                }
            }, 1000);
        },

        updateTimerDisplay: function() {
            const display = document.querySelector('#timeRemaining');
            if (!display) return;

            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Warning colors
            const parent = display.parentElement;
            if (this.timeRemaining <= 300) { // 5 minutes
                parent.className = 'badge bg-warning text-dark fs-6';
            }
            if (this.timeRemaining <= 60) { // 1 minute
                parent.className = 'badge bg-danger text-white fs-6';
            }
        },

        timeUp: function() {
            clearInterval(this.timerInterval);
            LearnHub.showNotification('Time is up! Submitting quiz automatically.', 'warning');
            
            setTimeout(() => {
                const form = document.querySelector('#quizForm');
                if (form) {
                    form.submit();
                }
            }, 2000);
        },

        calculateProgress: function() {
            const questions = document.querySelectorAll('[name^="question_"]');
            const questionNames = [...new Set(Array.from(questions).map(q => q.name))];
            let answered = 0;

            questionNames.forEach(name => {
                const inputs = document.querySelectorAll(`[name="${name}"]`);
                const hasAnswer = Array.from(inputs).some(input => {
                    return (input.type === 'radio' && input.checked) || 
                           (input.type === 'textarea' && input.value.trim() !== '');
                });
                
                if (hasAnswer) answered++;
            });

            return {
                answered: answered,
                total: questionNames.length,
                percentage: (answered / questionNames.length) * 100
            };
        }
    },

    // Video player enhancements
    video: {
        setupCustomControls: function() {
            const videos = document.querySelectorAll('video[data-custom-controls]');
            
            videos.forEach(video => {
                this.addCustomControls(video);
            });
        },

        addCustomControls: function(video) {
            // Add picture-in-picture button
            const pipButton = document.createElement('button');
            pipButton.className = 'btn btn-sm btn-outline-light';
            pipButton.innerHTML = '<i class="fas fa-external-link-alt"></i>';
            pipButton.title = 'Picture in Picture';
            
            pipButton.addEventListener('click', () => {
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture();
                } else {
                    video.requestPictureInPicture();
                }
            });

            // Add speed control
            const speedSelect = document.createElement('select');
            speedSelect.className = 'form-select form-select-sm';
            speedSelect.style.width = 'auto';
            speedSelect.innerHTML = `
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1" selected>1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
            `;

            speedSelect.addEventListener('change', (e) => {
                video.playbackRate = parseFloat(e.target.value);
            });

            // Create controls container
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'd-flex gap-2 mt-2';
            controlsContainer.appendChild(pipButton);
            controlsContainer.appendChild(speedSelect);

            // Insert after video
            video.parentNode.insertBefore(controlsContainer, video.nextSibling);
        }
    },

    // Utility functions
    utils: {
        // Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Format duration
        formatDuration: function(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            if (hours > 0) {
                return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        },

        // Local storage with expiration
        setStorageWithExpiry: function(key, value, ttl) {
            const now = new Date();
            const item = {
                value: value,
                expiry: now.getTime() + ttl
            };
            localStorage.setItem(key, JSON.stringify(item));
        },

        getStorageWithExpiry: function(key) {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            const now = new Date();

            if (now.getTime() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            return item.value;
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    LearnHub.init();
});

// Handle page visibility change (for video pause/resume)
document.addEventListener('visibilitychange', function() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (document.hidden) {
            if (!video.paused) {
                video.dataset.wasPlaying = 'true';
                video.pause();
            }
        } else {
            if (video.dataset.wasPlaying === 'true') {
                video.play();
                delete video.dataset.wasPlaying;
            }
        }
    });
});

// Export for global access
window.LearnHub = LearnHub;
