// Interactions Handler
class InteractionsHandler {
    constructor(threeSetup) {
        this.threeSetup = threeSetup;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.intersectedObject = null;
        this.interactiveObjects = [];
        this.indicators = {};
        
        // DOM elements
        this.popupContainer = document.getElementById('popup-container');
        this.popupTitle = document.getElementById('popup-title');
        this.popupBody = document.getElementById('popup-body');
        this.popupClose = document.getElementById('popup-close');
        this.interactiveIndicators = document.getElementById('interactive-indicators');
        
        // Custom cursor
        this.createCustomCursor();
        
        // Event listeners
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('click', this.onClick.bind(this));
        this.popupClose.addEventListener('click', this.closePopup.bind(this));
        
        // Listen for model loaded event
        document.addEventListener('modelLoaded', this.onModelLoaded.bind(this));
    }
    
    createCustomCursor() {
        // Create custom cursor element
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);
        
        // Update cursor position on mouse move
        window.addEventListener('mousemove', (event) => {
            this.cursor.style.left = `${event.clientX}px`;
            this.cursor.style.top = `${event.clientY}px`;
        });
    }
    
    onModelLoaded(event) {
        // Get interactive objects from the model
        this.interactiveObjects = this.threeSetup.getInteractiveObjects();
        console.log('Interactive objects:', this.interactiveObjects);
        
        // Create indicators for interactive objects
        this.createIndicators();
    }
    
    createIndicators() {
        // Clear existing indicators
        this.interactiveIndicators.innerHTML = '';
        this.indicators = {};
        
        // Create new indicators for each interactive object
        this.interactiveObjects.forEach(object => {
            // Get screen position of the object
            const position = this.getScreenPosition(object);
            
            // Create indicator element
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.dataset.objectName = object.name;
            indicator.style.left = `${position.x}px`;
            indicator.style.top = `${position.y}px`;
            
            // Add tooltip with object name
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = object.name.replace('interactive_', '').replace(/_/g, ' ');
            indicator.appendChild(tooltip);
            
            // Add to DOM
            this.interactiveIndicators.appendChild(indicator);
            
            // Store reference
            this.indicators[object.name] = indicator;
            
            // Add click event
            indicator.addEventListener('click', () => {
                this.handleObjectClick(object);
            });
        });
    }
    
    updateIndicatorPositions() {
        // Update position of each indicator based on current camera view
        for (const objectName in this.indicators) {
            const object = this.threeSetup.getObjectByName(objectName);
            if (object) {
                const position = this.getScreenPosition(object);
                const indicator = this.indicators[objectName];
                indicator.style.left = `${position.x}px`;
                indicator.style.top = `${position.y}px`;
            }
        }
    }
    
    getScreenPosition(object) {
        // Get world position
        const position = new THREE.Vector3();
        object.getWorldPosition(position);
        
        // Project to screen space
        position.project(this.threeSetup.camera);
        
        // Convert to screen coordinates
        const x = (position.x * 0.5 + 0.5) * window.innerWidth;
        const y = (position.y * -0.5 + 0.5) * window.innerHeight;
        
        return { x, y };
    }
    
    onMouseMove(event) {
        // Update mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.threeSetup.camera);
        
        // Check for intersections with interactive objects
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        // Handle hover states
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            
            // If hovering a new object
            if (this.intersectedObject !== intersectedObject) {
                // Reset previous hover state
                if (this.intersectedObject) {
                    this.onObjectLeave(this.intersectedObject);
                }
                
                // Set new hover state
                this.intersectedObject = intersectedObject;
                this.onObjectEnter(this.intersectedObject);
            }
        } else {
            // Reset hover state if not hovering any object
            if (this.intersectedObject) {
                this.onObjectLeave(this.intersectedObject);
                this.intersectedObject = null;
            }
        }
    }
    
    onObjectEnter(object) {
        // Update cursor
        this.cursor.classList.add('hover');
        
        // Highlight indicator
        const indicator = this.indicators[object.name];
        if (indicator) {
            indicator.classList.add('active');
        }
        
        // Emit hover event for animations
        const event = new CustomEvent('objectHover', { 
            detail: { 
                object: object,
                state: 'enter'
            } 
        });
        document.dispatchEvent(event);
    }
    
    onObjectLeave(object) {
        // Reset cursor
        this.cursor.classList.remove('hover');
        
        // Reset indicator
        const indicator = this.indicators[object.name];
        if (indicator) {
            indicator.classList.remove('active');
        }
        
        // Emit hover event for animations
        const event = new CustomEvent('objectHover', { 
            detail: { 
                object: object,
                state: 'leave'
            } 
        });
        document.dispatchEvent(event);
    }
    
    onClick(event) {
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.threeSetup.camera);
        
        // Check for intersections with interactive objects
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.handleObjectClick(object);
        }
    }
    
    handleObjectClick(object) {
        console.log('Clicked on:', object.name);
        
        // Get object name without 'interactive_' prefix
        const objectName = object.name.replace('interactive_', '');
        
        // Emit click event for animations
        const event = new CustomEvent('objectClick', { 
            detail: { object: object } 
        });
        document.dispatchEvent(event);
        
        // Show popup with content based on object name
        this.showPopup(objectName);
    }
    
    showPopup(objectName) {
        // Format title (replace underscores with spaces and capitalize)
        const title = objectName.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        // Set popup title
        this.popupTitle.textContent = title;
        
        // Set popup content based on object name
        this.popupBody.innerHTML = this.getContentForObject(objectName);
        
        // Show popup
        this.popupContainer.classList.remove('hidden');
    }
    
    closePopup() {
        this.popupContainer.classList.add('hidden');
    }
    
    getContentForObject(objectName) {
        // This would ideally come from a CMS or data file
        // For now, we'll use a switch statement with sample content
        switch(objectName) {
            case 'coffee_region':
                return `
                    <div class="content-section">
                        <h3>Colombian Coffee Region</h3>
                        <p>Colombia is world-famous for its coffee production, particularly the coffee grown in the "Coffee Triangle" region.</p>
                        <p>The Colombian coffee region, also known as the Coffee Cultural Landscape of Colombia, is a UNESCO World Heritage site.</p>
                        <div class="image-gallery">
                            <img src="assets/coffee_region.jpg" alt="Coffee Region">
                        </div>
                        <h4>Software Solutions for Agriculture</h4>
                        <p>We develop custom software solutions for coffee producers, helping them optimize harvests, track production, and connect directly with international buyers.</p>
                    </div>
                `;
            case 'cartagena':
                return `
                    <div class="content-section">
                        <h3>Cartagena</h3>
                        <p>Cartagena is a historic city on Colombia's Caribbean coast, known for its colonial architecture and vibrant culture.</p>
                        <p>The walled Old Town, founded in the 16th century, features colorful buildings, cobblestone streets, and impressive fortifications.</p>
                        <div class="image-gallery">
                            <img src="assets/cartagena.jpg" alt="Cartagena">
                        </div>
                        <h4>Tourism Technology</h4>
                        <p>Our tourism software solutions help businesses in Cartagena attract visitors, manage bookings, and provide immersive digital experiences.</p>
                    </div>
                `;
            case 'bogota':
                return `
                    <div class="content-section">
                        <h3>Bogotá</h3>
                        <p>Bogotá is Colombia's capital and largest city, a vibrant metropolis set high in the Andes mountains.</p>
                        <p>The city combines modern infrastructure with historic architecture and is Colombia's main economic and cultural hub.</p>
                        <div class="image-gallery">
                            <img src="assets/bogota.jpg" alt="Bogotá">
                        </div>
                        <h4>Enterprise Software Development</h4>
                        <p>We provide enterprise-level software solutions for businesses in Bogotá and throughout Colombia, helping them digitize operations and expand their reach.</p>
                    </div>
                `;
            case 'amazon':
                return `
                    <div class="content-section">
                        <h3>Colombian Amazon</h3>
                        <p>The Colombian Amazon is part of the world's largest rainforest, home to incredible biodiversity and indigenous communities.</p>
                        <p>This region covers almost a third of Colombia's territory and plays a crucial role in global climate regulation.</p>
                        <div class="image-gallery">
                            <img src="assets/amazon.jpg" alt="Colombian Amazon">
                        </div>
                        <h4>Environmental Monitoring Systems</h4>
                        <p>We develop software for environmental monitoring, conservation efforts, and sustainable resource management in sensitive ecosystems.</p>
                    </div>
                `;
            case 'portfolio':
                return `
                    <div class="content-section">
                        <h3>My Portfolio</h3>
                        <p>Welcome to my interactive portfolio showcasing my software development and consulting services.</p>
                        <p>I specialize in creating custom software solutions with a focus on user experience, performance, and scalability.</p>
                        <h4>Services Offered:</h4>
                        <ul>
                            <li>Custom Software Development</li>
                            <li>Web Application Development</li>
                            <li>Mobile App Development</li>
                            <li>3D Interactive Experiences</li>
                            <li>Software Consulting</li>
                        </ul>
                        <h4>Contact Information:</h4>
                        <p>Email: contact@example.com</p>
                        <p>Phone: +57 123 456 7890</p>
                    </div>
                `;
            default:
                return `
                    <div class="content-section">
                        <h3>${objectName.replace(/_/g, ' ')}</h3>
                        <p>Information about this element will be added soon.</p>
                    </div>
                `;
        }
    }
}