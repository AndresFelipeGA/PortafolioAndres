// Three.js Setup
class ThreeSetup {
    constructor() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.set(0, 1.5, 5);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('scene-canvas'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Controls setup
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Lighting setup
        this.setupLights();
        
        // Model container
        this.model = null;
        
        // Resize event listener
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Animation loop
        this.animate = this.animate.bind(this);
        this.animate();
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun-like)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        
        // Point lights for additional illumination
        const pointLight1 = new THREE.PointLight(0xffffff, 1, 10);
        pointLight1.position.set(2, 2, 2);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x0088ff, 1, 10);
        pointLight2.position.set(-2, 1, -2);
        this.scene.add(pointLight2);
    }
    
    loadModel() {
        // Show loading screen
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.style.display = 'flex';
        
        // Create a loading manager for better control
        const loadingManager = new THREE.LoadingManager();
        
        // Set up loading manager events
        loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const percentComplete = (itemsLoaded / itemsTotal) * 100;
            console.log(`Loading progress: ${percentComplete.toFixed(2)}%`);
            
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = `Loading Colombian Experience... ${percentComplete.toFixed(0)}%`;
            }
        };
        
        loadingManager.onError = (url) => {
            console.error('Error loading:', url);
            
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.innerHTML = `
                    <div style="color: red;">
                        Error loading resource: ${url}<br>
                        Please check the console for more details.
                    </div>
                `;
            }
        };
        
        // Create GLTFLoader with the loading manager
        const loader = new THREE.GLTFLoader(loadingManager);
        
        // Add Draco decoder for compression support
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);
        
        // Log the attempt
        console.log('Attempting to load 3D model with progressive loading: PortafolioBlend.glb');
        
        // Add WebGL context lost listener
        this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
            console.error('WebGL context lost:', event);
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.innerHTML = `
                    <div style="color: red;">
                        WebGL context lost. Your browser might not support large 3D models.<br>
                        Try using a different browser or a smaller model.
                    </div>
                `;
            }
        });
        
        // Set timeout for loading
        const loadingTimeout = setTimeout(() => {
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'Loading is taking longer than expected. Please wait...';
                loadingText.innerHTML += '<br><small>The model is very large which may cause loading issues.</small>';
                loadingText.innerHTML += '<br><small>Progressive loading is in progress. This may take several minutes.</small>';
            }
        }, 10000); // 10 seconds timeout
        
        // Try-catch block to catch any immediate errors
        try {
            // Set up progressive loading options
            const modelUrl = 'PortafolioBlend.glb';
            
            // Load the model with progressive loading
            loader.load(
                // Model path
                modelUrl,
            
            // onLoad callback
            (gltf) => {
                // Clear timeout
                clearTimeout(loadingTimeout);
                
                this.model = gltf.scene;
                
                // Check if model has any meshes
                let hasMeshes = false;
                this.model.traverse((node) => {
                    if (node.isMesh) {
                        hasMeshes = true;
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
                
                if (!hasMeshes) {
                    console.warn('Model loaded but contains no meshes');
                }
                
                // Check for interactive objects
                const interactiveObjects = this.getInteractiveObjects();
                if (interactiveObjects.length === 0) {
                    console.warn('No interactive objects found in the model. Make sure object names start with "interactive_"');
                } else {
                    console.log(`Found ${interactiveObjects.length} interactive objects`);
                }
                
                // Center the model
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.x = -center.x;
                this.model.position.y = -center.y;
                this.model.position.z = -center.z;
                
                // Scale the model if needed
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 5) {
                    const scale = 5 / maxDim;
                    this.model.scale.set(scale, scale, scale);
                }
                
                // Add the model to the scene
                this.scene.add(this.model);
                
                // Hide loading screen
                setTimeout(() => {
                    loadingScreen.style.opacity = 0;
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 1000);
                
                // Emit model loaded event
                const event = new CustomEvent('modelLoaded', { detail: { model: this.model } });
                document.dispatchEvent(event);
            },
            
            // onProgress callback
            (xhr) => {
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    console.log(`Model ${percentComplete.toFixed(2)}% loaded`);
                    
                    // Update loading text
                    const loadingText = document.querySelector('.loading-text');
                    if (loadingText) {
                        loadingText.textContent = `Loading Colombian Experience... ${percentComplete.toFixed(0)}%`;
                    }
                } else {
                    console.log(`Loaded ${(xhr.loaded / 1024 / 1024).toFixed(2)} MB`);
                }
            },
            
                // onError callback
                (error) => {
                    // Clear timeout
                    clearTimeout(loadingTimeout);
                    
                    console.error('Error loading model:', error);
                    console.error('Error type:', error.constructor.name);
                    console.error('Error message:', error.message);
                    if (error.stack) console.error('Error stack:', error.stack);
                    
                    // Show detailed error message in loading screen
                    const loadingText = document.querySelector('.loading-text');
                    if (loadingText) {
                        loadingText.innerHTML = `
                            <div style="color: #ff5555; text-align: left;">
                                <h3>Error loading 3D model</h3>
                                <p><strong>Error message:</strong> ${error.message || 'Unknown error'}</p>
                                <p>Possible causes:</p>
                                <ul style="text-align: left; margin-left: 20px;">
                                    <li>The file format may not be compatible with Three.js</li>
                                    <li>The file may be too large</li>
                                    <li>The file may be corrupted</li>
                                    <li>The browser may have limitations on loading large files</li>
                                </ul>
                                <p>Attempting progressive loading may help with large models.</p>
                            </div>
                        `;
                    }
                    
                    // Try alternative loading approach for large models
                    this.loadModelInChunks();
                }
            );
        } catch (e) {
            // Clear timeout
            clearTimeout(loadingTimeout);
            
            console.error('Exception during model loading setup:', e);
            
            // Show error message
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.innerHTML = `
                    <div style="color: #ff5555;">
                        <h3>Exception during model loading</h3>
                        <p>${e.message}</p>
                        <p>Trying alternative loading method...</p>
                    </div>
                `;
            }
            
            // Try alternative loading approach
            this.loadModelInChunks();
        }
    }
    
    // Method to load model in chunks for very large models
    loadModelInChunks() {
        console.log('Attempting to load model in chunks...');
        
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.innerHTML = `
                <div>
                    <h3>Progressive Loading</h3>
                    <p>Attempting to load the large model in chunks...</p>
                    <p>This may take several minutes. Please be patient.</p>
                    <div id="chunk-progress" style="width: 100%; height: 20px; background-color: #333; border-radius: 10px; overflow: hidden;">
                        <div id="chunk-progress-bar" style="width: 0%; height: 100%; background-color: #4CAF50;"></div>
                    </div>
                </div>
            `;
        }
        
        // Create a fetch request with a ReadableStream to process the model in chunks
        fetch('PortafolioBlend.glb')
            .then(response => {
                const contentLength = response.headers.get('content-length');
                const totalSize = parseInt(contentLength, 10);
                let loadedSize = 0;
                
                // Create a reader for the response body stream
                const reader = response.body.getReader();
                const chunks = [];
                
                // Function to read chunks
                const readChunk = () => {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            // All chunks have been read
                            console.log('All chunks loaded, processing model...');
                            
                            // Combine all chunks into a single Uint8Array
                            const chunksAll = new Uint8Array(totalSize);
                            let position = 0;
                            for (const chunk of chunks) {
                                chunksAll.set(chunk, position);
                                position += chunk.length;
                            }
                            
                            // Create a blob from the combined chunks
                            const blob = new Blob([chunksAll], { type: 'model/gltf-binary' });
                            const url = URL.createObjectURL(blob);
                            
                            // Load the model from the blob URL
                            const loader = new THREE.GLTFLoader();
                            const dracoLoader = new THREE.DRACOLoader();
                            dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
                            loader.setDRACOLoader(dracoLoader);
                            
                            if (loadingText) {
                                loadingText.innerHTML += `<p>Processing model data...</p>`;
                            }
                            
                            loader.load(url, (gltf) => {
                                this.model = gltf.scene;
                                
                                // Apply shadows to all meshes
                                this.model.traverse((node) => {
                                    if (node.isMesh) {
                                        node.castShadow = true;
                                        node.receiveShadow = true;
                                    }
                                });
                                
                                // Center the model
                                const box = new THREE.Box3().setFromObject(this.model);
                                const center = box.getCenter(new THREE.Vector3());
                                this.model.position.x = -center.x;
                                this.model.position.y = -center.y;
                                this.model.position.z = -center.z;
                                
                                // Scale the model if needed
                                const size = box.getSize(new THREE.Vector3());
                                const maxDim = Math.max(size.x, size.y, size.z);
                                if (maxDim > 5) {
                                    const scale = 5 / maxDim;
                                    this.model.scale.set(scale, scale, scale);
                                }
                                
                                // Add the model to the scene
                                this.scene.add(this.model);
                                
                                // Hide loading screen
                                const loadingScreen = document.querySelector('.loading-screen');
                                setTimeout(() => {
                                    loadingScreen.style.opacity = 0;
                                    setTimeout(() => {
                                        loadingScreen.style.display = 'none';
                                    }, 500);
                                }, 1000);
                                
                                // Emit model loaded event
                                const event = new CustomEvent('modelLoaded', { detail: { model: this.model } });
                                document.dispatchEvent(event);
                                
                                // Clean up the blob URL
                                URL.revokeObjectURL(url);
                            },
                            // Progress callback
                            (xhr) => {
                                console.log('Processing model: ' + (xhr.loaded / xhr.total * 100) + '% processed');
                            },
                            // Error callback
                            (error) => {
                                console.error('Error processing model chunks:', error);
                                if (loadingText) {
                                    loadingText.innerHTML = `
                                        <div style="color: red;">
                                            <h3>Error Processing Model</h3>
                                            <p>${error.message}</p>
                                            <p>The model may be too complex for your browser to handle.</p>
                                        </div>
                                    `;
                                }
                                this.createPlaceholderModel();
                            });
                            
                            return;
                        }
                        
                        // Process this chunk
                        loadedSize += value.length;
                        chunks.push(value);
                        
                        // Update progress
                        const progress = (loadedSize / totalSize) * 100;
                        console.log(`Loaded ${progress.toFixed(2)}% of model data`);
                        
                        // Update progress bar
                        const progressBar = document.getElementById('chunk-progress-bar');
                        if (progressBar) {
                            progressBar.style.width = `${progress}%`;
                        }
                        
                        if (loadingText) {
                            const progressInfo = document.createElement('div');
                            progressInfo.textContent = `Loaded ${(loadedSize / (1024 * 1024)).toFixed(2)} MB of ${(totalSize / (1024 * 1024)).toFixed(2)} MB (${progress.toFixed(0)}%)`;
                            
                            // Replace the last progress info if it exists
                            const existingInfo = loadingText.querySelector('.progress-info');
                            if (existingInfo) {
                                existingInfo.textContent = progressInfo.textContent;
                            } else {
                                progressInfo.className = 'progress-info';
                                loadingText.appendChild(progressInfo);
                            }
                        }
                        
                        // Read the next chunk
                        readChunk();
                    }).catch(error => {
                        console.error('Error reading chunk:', error);
                        if (loadingText) {
                            loadingText.innerHTML += `
                                <div style="color: red;">
                                    <p>Error reading model data: ${error.message}</p>
                                </div>
                            `;
                        }
                        this.createPlaceholderModel();
                    });
                };
                
                // Start reading chunks
                readChunk();
            })
            .catch(error => {
                console.error('Error fetching model:', error);
                if (loadingText) {
                    loadingText.innerHTML = `
                        <div style="color: red;">
                            <h3>Error Fetching Model</h3>
                            <p>${error.message}</p>
                        </div>
                    `;
                }
                this.createPlaceholderModel();
            });
    }
    
    createPlaceholderModel() {
        // Create a simple placeholder model
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.3,
            roughness: 0.4
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.name = 'placeholder_model';
        
        // Add text to indicate it's a placeholder
        const textDiv = document.createElement('div');
        textDiv.style.position = 'absolute';
        textDiv.style.top = '50%';
        textDiv.style.left = '50%';
        textDiv.style.transform = 'translate(-50%, -50%)';
        textDiv.style.color = 'white';
        textDiv.style.fontSize = '18px';
        textDiv.style.textAlign = 'center';
        textDiv.style.padding = '20px';
        textDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        textDiv.style.borderRadius = '10px';
        textDiv.style.zIndex = '100';
        textDiv.innerHTML = `
            <p>3D model could not be loaded.</p>
            <p>Please check if "PortafolioBlend.glb" exists in the project directory.</p>
            <p>See console for more details.</p>
        `;
        document.body.appendChild(textDiv);
        
        // Add to scene
        this.scene.add(cube);
        
        // Animate the cube
        gsap.to(cube.rotation, {
            x: Math.PI * 2,
            y: Math.PI * 2,
            duration: 5,
            repeat: -1,
            ease: 'none'
        });
    }
    
    onWindowResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(this.animate);
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    // Method to get object by name
    getObjectByName(name) {
        if (!this.model) return null;
        return this.model.getObjectByName(name);
    }
    
    // Method to get all interactive objects
    getInteractiveObjects() {
        const interactiveObjects = [];
        if (!this.model) return interactiveObjects;
        
        this.model.traverse((node) => {
            // Check if the node name starts with "interactive_"
            if (node.isMesh && node.name.startsWith('interactive_')) {
                interactiveObjects.push(node);
            }
        });
        
        return interactiveObjects;
    }
}