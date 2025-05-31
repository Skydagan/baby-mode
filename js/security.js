class SecurityManager {
    constructor() {
        this.isLocked = false;
        this.parentExitSequence = [];
        this.requiredSequence = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
        this.sequenceTimeout = null;
        this.init();
    }

    init() {
        this.preventNavigation();
        this.disableContextMenu();
        this.preventZoom();
        this.setupParentExit();
        this.enterFullscreen();
    }

    preventNavigation() {
        // Prevent back/forward navigation
        history.pushState(null, null, location.href);
        window.addEventListener('popstate', () => {
            history.pushState(null, null, location.href);
        });

        // Prevent keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Prevent common navigation keys
            if (e.key === 'Escape' || 
                e.key === 'F5' || 
                e.key === 'F11' ||
                e.key === 'Tab' ||
                (e.ctrlKey && (e.key === 'r' || e.key === 'R')) ||
                (e.ctrlKey && (e.key === 'w' || e.key === 'W')) ||
                (e.ctrlKey && (e.key === 't' || e.key === 'T')) ||
                (e.altKey && e.key === 'Tab') ||
                (e.metaKey && (e.key === 'r' || e.key === 'R')) ||
                (e.metaKey && (e.key === 'w' || e.key === 'W')) ||
                (e.metaKey && (e.key === 't' || e.key === 'T'))) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });

        // Prevent right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }

    disableContextMenu() {
        // Disable long press on mobile
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        document.addEventListener('touchend', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault();
            }
        });

        // Disable selection
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });

        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    }

    preventZoom() {
        // Prevent pinch zoom
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Prevent keyboard zoom
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
                e.preventDefault();
            }
        });
    }

    setupParentExit() {
        const corners = this.getScreenCorners();
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const corner = this.getTouchedCorner(touch.clientX, touch.clientY);
                
                if (corner) {
                    this.addToSequence(corner);
                }
            }
        });

        // Setup sequence timeout
        this.resetSequenceTimeout();
    }

    getScreenCorners() {
        const margin = 50; // 50px margin for corner detection
        return {
            'top-left': { x: 0, y: 0, width: margin, height: margin },
            'top-right': { x: window.innerWidth - margin, y: 0, width: margin, height: margin },
            'bottom-left': { x: 0, y: window.innerHeight - margin, width: margin, height: margin },
            'bottom-right': { x: window.innerWidth - margin, y: window.innerHeight - margin, width: margin, height: margin }
        };
    }

    getTouchedCorner(x, y) {
        const corners = this.getScreenCorners();
        
        for (const [corner, bounds] of Object.entries(corners)) {
            if (x >= bounds.x && x <= bounds.x + bounds.width &&
                y >= bounds.y && y <= bounds.y + bounds.height) {
                return corner;
            }
        }
        return null;
    }

    addToSequence(corner) {
        this.parentExitSequence.push(corner);
        
        // Show visual feedback
        const indicator = document.getElementById('parentExit');
        indicator.classList.add('active');
        setTimeout(() => indicator.classList.remove('active'), 200);

        // Check if sequence is complete
        if (this.parentExitSequence.length === this.requiredSequence.length) {
            if (this.isCorrectSequence()) {
                this.exitBabyMode();
            } else {
                this.resetSequence();
            }
        }

        this.resetSequenceTimeout();
    }

    isCorrectSequence() {
        return this.parentExitSequence.every((corner, index) => 
            corner === this.requiredSequence[index]
        );
    }

    resetSequence() {
        this.parentExitSequence = [];
    }

    resetSequenceTimeout() {
        if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
        }
        
        this.sequenceTimeout = setTimeout(() => {
            this.resetSequence();
        }, 3000); // Reset sequence after 3 seconds of inactivity
    }

    exitBabyMode() {
        // Show exit confirmation
        if (confirm('Exit Baby Mode? This will close the app.')) {
            this.disableFullscreen();
            // You could redirect to a parent interface or close the app
            window.location.href = 'about:blank';
        } else {
            this.resetSequence();
        }
    }

    async enterFullscreen() {
        try {
            const element = document.documentElement;
            
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
            
            this.isLocked = true;
        } catch (err) {
            console.log('Fullscreen not supported or denied');
        }

        // Lock orientation to prevent rotation
        if (screen.orientation && screen.orientation.lock) {
            try {
                await screen.orientation.lock('portrait');
            } catch (err) {
                console.log('Orientation lock not supported');
            }
        }
    }

    disableFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        this.isLocked = false;
    }

    // Prevent window focus loss
    preventFocusLoss() {
        window.addEventListener('blur', () => {
            setTimeout(() => {
                window.focus();
            }, 0);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isLocked) {
                setTimeout(() => {
                    window.focus();
                }, 0);
            }
        });
    }
}