// Animations Handler
class AnimationsHandler {
    constructor(threeSetup) {
        this.threeSetup = threeSetup;
        this.timeline = gsap.timeline();
        this.currentSection = 0;
        this.totalSections = 4; // Number of sections/camera positions
        this.cameraPositions = [
            { x: 0, y: 1.5, z: 5, lookAt: { x: 0, y: 0, z: 0 } }, // Initial view
            { x: -3, y: 2, z: 3, lookAt: { x: 0, y: 0, z: 0 } },  // Left side view
            { x: 3, y: 1, z: 3, lookAt: { x: 0, y: 0, z: 0 } },   // Right side view
            { x: 0, y: 3, z: 2, lookAt: { x: 0, y: 0, z: 0 } }    // Top view
        ];
        
        // Event listeners
        document.addEventListener('objectClick', this.onObjectClick.bind(this));
        document.addEventListener('objectHover', this.onObjectHover.bind(this));
        document.addEventListener('modelLoaded', this.onModelLoaded.bind(this));
        
        // Scroll event for camera movement
        window.addEventListener('wheel', this.onScroll.bind(this));
        
        // Setup ScrollTrigger
        this.setupScrollTrigger();
    }
    
    onModelLoaded(event) {
        // Initial animations when model is loaded
        this.playIntroAnimation();
        
        // Store model reference
        this.model = event.detail.model;
        
        // Setup model-specific animations
        this.setupModelAnimations();
    }
    
    playIntroAnimation() {
        // Create intro animation timeline
        const introTimeline = gsap.timeline();
        
        // Fade in the scene
        introTimeline.fromTo(
            this.threeSetup.renderer.domElement,
            { opacity: 0 },
            { opacity: 1, duration: 2, ease: 'power2.inOut' }
        );
        
        // Camera movement
        introTimeline.to(
            this.threeSetup.camera.position,
            {
                x: 0,
                y: 1.5,
                z: 5,
                duration: 3,
                ease: 'power2.inOut',
                onUpdate: () => {
                    this.threeSetup.camera.lookAt(0, 0, 0);
                }
            },
            '-=1.5'
        );
        
        return introTimeline;
    }
    
    setupModelAnimations() {
        // This will be populated once we know the structure of the model
        if (!this.model) return;
        
        // Find all interactive objects
        const interactiveObjects = this.threeSetup.getInteractiveObjects();
        
        // Create subtle animations for each interactive object
        interactiveObjects.forEach(object => {
            // Store original position and rotation
            object.userData.originalPosition = {
                x: object.position.x,
                y: object.position.y,
                z: object.position.z
            };
            
            object.userData.originalRotation = {
                x: object.rotation.x,
                y: object.rotation.y,
                z: object.rotation.z
            };
            
            // Create subtle floating animation
            gsap.to(object.position, {
                y: object.position.y + 0.05,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        });
    }
    
    setupScrollTrigger() {
        // Create a virtual scroll area
        const scrollHeight = window.innerHeight * this.totalSections;
        
        // Create a dummy element for ScrollTrigger
        const scrollElement = document.createElement('div');
        scrollElement.style.height = `${scrollHeight}px`;
        scrollElement.style.position = 'absolute';
        scrollElement.style.top = '0';
        scrollElement.style.left = '0';
        scrollElement.style.width = '1px';
        scrollElement.style.pointerEvents = 'none';
        scrollElement.style.opacity = '0';
        document.body.appendChild(scrollElement);
        
        // Setup ScrollTrigger for camera movement
        gsap.registerPlugin(ScrollTrigger);
        
        // Create scroll-based animations
        for (let i = 0; i < this.totalSections; i++) {
            const sectionStart = i / this.totalSections;
            const sectionEnd = (i + 1) / this.totalSections;
            
            ScrollTrigger.create({
                trigger: scrollElement,
                start: `top+=${sectionStart * scrollHeight} top`,
                end: `top+=${sectionEnd * scrollHeight} top`,
                onEnter: () => this.goToSection(i),
                onEnterBack: () => this.goToSection(i),
                markers: false
            });
        }
    }
    
    goToSection(sectionIndex) {
        if (sectionIndex === this.currentSection) return;
        
        this.currentSection = sectionIndex;
        const position = this.cameraPositions[sectionIndex];
        
        // Animate camera to new position
        gsap.to(this.threeSetup.camera.position, {
            x: position.x,
            y: position.y,
            z: position.z,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.threeSetup.camera.lookAt(
                    position.lookAt.x,
                    position.lookAt.y,
                    position.lookAt.z
                );
            }
        });
        
        // Disable orbit controls during animation
        this.threeSetup.controls.enabled = false;
        
        // Re-enable orbit controls after animation
        setTimeout(() => {
            this.threeSetup.controls.enabled = true;
        }, 2000);
    }
    
    onScroll(event) {
        // Determine scroll direction
        const direction = event.deltaY > 0 ? 1 : -1;
        
        // Calculate next section
        let nextSection = this.currentSection + direction;
        
        // Clamp to valid section range
        nextSection = Math.max(0, Math.min(nextSection, this.totalSections - 1));
        
        // Go to next section if different from current
        if (nextSection !== this.currentSection) {
            this.goToSection(nextSection);
        }
    }
    
    onObjectClick(event) {
        const object = event.detail.object;
        
        // Play click animation
        this.playClickAnimation(object);
        
        // Move camera to focus on the clicked object
        this.focusOnObject(object);
    }
    
    playClickAnimation(object) {
        // Scale animation
        gsap.to(object.scale, {
            x: object.scale.x * 1.2,
            y: object.scale.y * 1.2,
            z: object.scale.z * 1.2,
            duration: 0.3,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
        });
        
        // Rotation animation
        gsap.to(object.rotation, {
            y: object.rotation.y + Math.PI * 2,
            duration: 1.5,
            ease: 'power2.inOut'
        });
    }
    
    focusOnObject(object) {
        // Get object world position
        const position = new THREE.Vector3();
        object.getWorldPosition(position);
        
        // Calculate camera position
        const cameraPosition = {
            x: position.x + 2,
            y: position.y + 1,
            z: position.z + 2
        };
        
        // Animate camera to focus on object
        gsap.to(this.threeSetup.camera.position, {
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.threeSetup.camera.lookAt(position);
            }
        });
        
        // Disable orbit controls during animation
        this.threeSetup.controls.enabled = false;
        
        // Re-enable orbit controls after animation
        setTimeout(() => {
            this.threeSetup.controls.enabled = true;
        }, 1500);
    }
    
    onObjectHover(event) {
        const object = event.detail.object;
        const state = event.detail.state;
        
        if (state === 'enter') {
            // Play hover enter animation
            this.playHoverEnterAnimation(object);
        } else {
            // Play hover leave animation
            this.playHoverLeaveAnimation(object);
        }
    }
    
    playHoverEnterAnimation(object) {
        // Highlight effect
        gsap.to(object.material, {
            emissive: new THREE.Color(0x333333),
            duration: 0.3
        });
        
        // Subtle scale effect
        gsap.to(object.scale, {
            x: object.scale.x * 1.05,
            y: object.scale.y * 1.05,
            z: object.scale.z * 1.05,
            duration: 0.3,
            ease: 'power2.out'
        });
    }
    
    playHoverLeaveAnimation(object) {
        // Remove highlight
        gsap.to(object.material, {
            emissive: new THREE.Color(0x000000),
            duration: 0.3
        });
        
        // Reset scale
        gsap.to(object.scale, {
            x: object.scale.x / 1.05,
            y: object.scale.y / 1.05,
            z: object.scale.z / 1.05,
            duration: 0.3,
            ease: 'power2.out'
        });
    }
}