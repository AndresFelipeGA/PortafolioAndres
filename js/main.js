// Main Application
document.addEventListener('DOMContentLoaded', () => {
    // Check if required libraries are loaded
    if (checkDependencies()) {
        // Initialize application
        const app = new App();
        app.init();
    } else {
        showErrorMessage('Required libraries could not be loaded. Please check your internet connection and try again.');
    }
});

// Check if all required dependencies are loaded
function checkDependencies() {
    if (typeof THREE === 'undefined') {
        console.error('Three.js library not loaded');
        return false;
    }
    
    if (typeof THREE.GLTFLoader === 'undefined') {
        console.error('GLTFLoader not loaded');
        return false;
    }
    
    if (typeof THREE.OrbitControls === 'undefined') {
        console.error('OrbitControls not loaded');
        return false;
    }
    
    if (typeof gsap === 'undefined') {
        console.error('GSAP library not loaded');
        return false;
    }
    
    return true;
}

// Show error message to user
function showErrorMessage(message) {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        const loader = loadingScreen.querySelector('.loader');
        if (loader) loader.style.display = 'none';
        
        const loadingText = loadingScreen.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = '#ff5555';
        }
    } else {
        alert(message);
    }
}

class App {
    constructor() {
        this.threeSetup = null;
        this.interactionsHandler = null;
        this.animationsHandler = null;
    }
    
    init() {
        // Initialize Three.js setup
        this.threeSetup = new ThreeSetup();
        
        // Initialize interactions handler
        this.interactionsHandler = new InteractionsHandler(this.threeSetup);
        
        // Initialize animations handler
        this.animationsHandler = new AnimationsHandler(this.threeSetup);
        
        // Load the 3D model with error handling
        try {
            this.threeSetup.loadModel();
        } catch (error) {
            console.error('Error loading 3D model:', error);
            showErrorMessage('Error loading 3D model. Please check if the file exists and is in the correct format.');
        }
        
        // Add animation frame update
        this.update();
        
        // Log initialization
        console.log('Colombian Portfolio initialized');
    }
    
    update() {
        // Update loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update indicator positions if they exist
            if (this.interactionsHandler && this.interactionsHandler.updateIndicatorPositions) {
                this.interactionsHandler.updateIndicatorPositions();
            }
        };
        
        animate();
    }
}

// Add placeholder images for content
function createPlaceholderImages() {
    // Create assets directory if it doesn't exist
    const assetsDir = 'assets';
    
    // List of placeholder images to create
    const placeholders = [
        'coffee_region.jpg',
        'cartagena.jpg',
        'bogota.jpg',
        'amazon.jpg'
    ];
    
    // Check if images already exist
    // Note: This is just a placeholder function since we can't directly check files
    // In a real application, you would handle this differently
    console.log('Note: You may need to add placeholder images to the assets directory');
    console.log('Required images:', placeholders.join(', '));
    
    // Add a message to check the placeholder.html file
    console.log('Please check assets/placeholder.html for a visual reference of the required images');
}

// Call this function to log required placeholder images
createPlaceholderImages();

// Add event listener for model loading errors
document.addEventListener('DOMContentLoaded', () => {
    const modelErrorHandler = (event) => {
        if (event.type === 'error' && event.target.tagName === 'SCRIPT') {
            const src = event.target.src || '';
            if (src.includes('three.min.js') || src.includes('GLTFLoader') || src.includes('OrbitControls') || src.includes('gsap')) {
                console.error('Failed to load script:', src);
                showErrorMessage('Failed to load required libraries. Please check your internet connection and try again.');
            }
        }
    };
    
    window.addEventListener('error', modelErrorHandler, true);
});