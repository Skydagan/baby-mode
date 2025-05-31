class BabyModeApp {
    constructor() {
        this.securityManager = null;
        this.gestureManager = null;
        this.isReady = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startApp());
        } else {
            this.startApp();
        }
    }

    startApp() {
        // Initialize managers
        this.securityManager = new SecurityManager();
        this.gestureManager = new GestureManager();
        
        // Setup app-specific features
        this.setupVisibilityHandling();
        this.setupPerformanceOptimizations();
        this.setupAccessibility();
        
        this.isReady = true;
        console.log('Baby Mode PWA initialized');
        
        // Show welcome animation
        this.showWelcomeAnimation();
    }

    setupVisibilityHandling() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // Handle window focus
        window.addEventListener('focus', () => {
            this.resumeAnimations();
        });

        window.addEventListener('blur', () => {
            this.pauseAnimations();
        });
    }

    setupPerformanceOptimizations() {
        // Reduce animations when battery is low
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                const checkBattery = () => {
                    if (battery.level < 0.2 && !battery.charging) {
                        this.enablePowerSaving();
                    } else {
                        this.disablePowerSaving();
                    }
                };

                battery.addEventListener('levelchange', checkBattery);
                battery.addEventListener('chargingchange', checkBattery);
                checkBattery();
            });
        }

        // Optimize for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.reduceMotion();
        }
    }

    setupAccessibility() {
        // Add screen reader support
        document.querySelectorAll('.screen').forEach((screen, index) => {
            screen.setAttribute('role', 'button');
            screen.setAttribute('aria-label', `Color screen ${index + 1}`);
            screen.setAttribute('tabindex', '0');
        });

        // Add high contrast mode support
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }

    showWelcomeAnimation() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach((screen, index) => {
            screen.style.opacity = '0';
            screen.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                screen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                screen.style.opacity = '1';
                screen.style.transform = 'scale(1)';
            }, index * 100);
        });
    }

    pauseAnimations() {
        document.querySelectorAll('.interactive-element').forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        document.querySelectorAll('.interactive-element').forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }

    enablePowerSaving() {
        document.body.classList.add('power-saving');
        document.querySelectorAll('.interactive-element').forEach(element => {
            element.style.animationDuration = '8s'; // Slower animations
        });
    }

    disablePowerSaving() {
        document.body.classList.remove('power-saving');
        document.querySelectorAll('.interactive-element').forEach(element => {
            element.style.animationDuration = '4s'; // Normal animations
        });
    }

    reduceMotion() {
        document.body.classList.add('reduce-motion');
        const style = document.createElement('style');
        style.textContent = `
            .reduce-motion .interactive-element {
                animation: none !important;
            }
            .reduce-motion .screen-container {
                transition: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Public API methods
    getCurrentScreen() {
        return this.gestureManager ? this.gestureManager.getCurrentScreen() : 0;
    }

    goToScreen(index) {
        if (this.gestureManager) {
            this.gestureManager.goToScreen(index);
        }
    }

    isAppReady() {
        return this.isReady;
    }

    // Emergency exit method (for development/testing)
    emergencyExit() {
        if (this.securityManager) {
            this.securityManager.disableFullscreen();
        }
        alert('Emergency exit activated. Baby Mode disabled.');
    }
}

// Initialize the app
let babyModeApp;

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Handle installation prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or prompt
    console.log('PWA installation available');
});

// Start the app
babyModeApp = new BabyModeApp();

// Global error handling
window.addEventListener('error', (e) => {
    console.error('App error:', e.error);
    // Could send error to parent or show simple message
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// Expose app instance for debugging (remove in production)
window.babyModeApp = babyModeApp;