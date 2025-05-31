class GestureManager {
    constructor() {
        this.currentScreen = 0;
        this.totalScreens = 5;
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50;
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.querySelector('.screen-container');
        this.setupTouchEvents();
        this.setupElementInteractions();
        this.updateScreenPosition();
    }

    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isDragging = false;
        let startTime = 0;

        // Touch start
        document.addEventListener('touchstart', (e) => {
            if (this.isTransitioning) return;
            
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            currentX = startX;
            startTime = Date.now();
            isDragging = false;
            
            this.container.style.transition = 'none';
        }, { passive: true });

        // Touch move
        document.addEventListener('touchmove', (e) => {
            if (this.isTransitioning) return;
            
            currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const deltaX = currentX - startX;
            const deltaY = Math.abs(currentY - startY);
            
            // Only start dragging if horizontal movement is greater than vertical
            if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
                isDragging = true;
                e.preventDefault();
                
                // Calculate the offset for smooth dragging
                const currentOffset = -this.currentScreen * 20; // 20% per screen
                const dragOffset = (deltaX / window.innerWidth) * 20;
                const newOffset = currentOffset + dragOffset;
                
                // Apply resistance at boundaries
                let constrainedOffset = newOffset;
                if (newOffset > 0) {
                    constrainedOffset = newOffset * 0.3; // Resistance when trying to go before first screen
                } else if (newOffset < -(this.totalScreens - 1) * 20) {
                    const maxOffset = -(this.totalScreens - 1) * 20;
                    const excess = newOffset - maxOffset;
                    constrainedOffset = maxOffset + (excess * 0.3); // Resistance when trying to go past last screen
                }
                
                this.container.style.transform = `translateX(${constrainedOffset}%)`;
            }
        }, { passive: false });

        // Touch end
        document.addEventListener('touchend', (e) => {
            if (this.isTransitioning || !isDragging) return;
            
            const deltaX = currentX - startX;
            const deltaTime = Date.now() - startTime;
            const velocity = Math.abs(deltaX) / deltaTime;
            
            this.container.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            // Determine if swipe was significant enough to change screens
            const shouldSwipe = Math.abs(deltaX) > this.minSwipeDistance || velocity > 0.3;
            
            if (shouldSwipe) {
                if (deltaX > 0 && this.currentScreen > 0) {
                    // Swipe right - go to previous screen
                    this.currentScreen--;
                } else if (deltaX < 0 && this.currentScreen < this.totalScreens - 1) {
                    // Swipe left - go to next screen
                    this.currentScreen++;
                }
            }
            
            this.updateScreenPosition();
            isDragging = false;
        }, { passive: true });
    }

    setupElementInteractions() {
        // Add tap interactions to shapes
        document.querySelectorAll('.interactive-element').forEach(element => {
            element.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                this.animateElement(element);
            }, { passive: true });

            element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.animateElement(element);
            });
        });
    }

    animateElement(element) {
        // Add a bounce animation
        element.style.animation = 'none';
        element.style.transform = 'scale(1.2)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.animation = 'float 4s ease-in-out infinite';
        }, 150);

        // Add ripple effect
        this.createRipple(element);

        // Generate random movement
        this.addRandomMovement(element);
    }

    createRipple(element) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin-top: -10px;
            margin-left: -10px;
        `;

        element.appendChild(ripple);

        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addRandomMovement(element) {
        const rect = element.parentElement.getBoundingClientRect();
        const maxX = rect.width - 100;
        const maxY = rect.height - 100;
        
        const newX = Math.random() * maxX;
        const newY = Math.random() * maxY;
        
        element.style.transition = 'all 1s ease-out';
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
        
        setTimeout(() => {
            element.style.transition = 'all 0.3s ease';
        }, 1000);
    }

    updateScreenPosition() {
        this.isTransitioning = true;
        const offset = -this.currentScreen * 20; // 20% per screen
        this.container.style.transform = `translateX(${offset}%)`;
        
        // Update active screen
        document.querySelectorAll('.screen').forEach((screen, index) => {
            screen.classList.toggle('active', index === this.currentScreen);
        });

        // Update theme color based on current screen
        this.updateThemeColor();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 300);
    }

    updateThemeColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffd93d', '#6bcf7f', '#a8edea'];
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', colors[this.currentScreen]);
        }
    }

    // Public method to navigate to specific screen
    goToScreen(screenIndex) {
        if (screenIndex >= 0 && screenIndex < this.totalScreens && !this.isTransitioning) {
            this.currentScreen = screenIndex;
            this.updateScreenPosition();
        }
    }

    // Public method to get current screen
    getCurrentScreen() {
        return this.currentScreen;
    }
}