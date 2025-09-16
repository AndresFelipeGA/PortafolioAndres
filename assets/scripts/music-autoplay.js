/**
 * Music Autoplay Controller
 *
 * This script handles background music playback with the following features:
 * - Loads and prepares audio for playback
 * - Provides methods to play music at a specific volume
 * - Supports autoplay when page loading reaches a specific percentage
 */

class MusicController {
    constructor(audioPath) {
        // Normalize the audio path to ensure it works in different environments
        this.audioPath = this.normalizeAudioPath(audioPath);
        console.log("Normalized audio path:", this.audioPath);
        
        // Create audio element
        this.audio = new Audio();
        this.audio.loop = true; // Loop the music
        this.audio.preload = 'auto'; // Preload the audio
        
        // Set audio source with proper MIME type
        const source = document.createElement('source');
        source.src = this.audioPath;
        source.type = 'audio/mpeg'; // Explicitly set MIME type for MP3
        this.audio.appendChild(source);
        
        this.isPlaying = false;
        this.loadPromise = null;
        
        // Initialize audio
        this.initialize();
    }
    
    /**
     * Normalize audio path to work in different environments
     * @param {string} path - Original audio path
     * @returns {string} - Normalized audio path
     */
    normalizeAudioPath(path) {
        // If it's already an absolute URL, return it as is
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file://')) {
            return path;
        }
        
        // If we're in a browser environment
        if (typeof window !== 'undefined') {
            // Get the base URL (protocol + host + port)
            const baseUrl = window.location.protocol + '//' + window.location.host;
            
            // If we're on localhost or 127.0.0.1, assume we're in development
            const isLocalServer = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (isLocalServer) {
                // For local server, use the full path from the server root
                // Remove leading ./ if present
                const cleanPath = path.startsWith('./') ? path.substring(2) : path;
                return baseUrl + '/' + cleanPath;
            } else if (window.location.protocol === 'file:') {
                // For file:// protocol, use a relative path
                // This is tricky because file:// URLs don't have a consistent base
                // Try to use a relative path that works with the current page
                return path;
            } else {
                // For production server, use a path relative to the current page
                // Remove leading ./ if present
                const cleanPath = path.startsWith('./') ? path.substring(2) : path;
                return baseUrl + '/' + cleanPath;
            }
        }
        
        // Fallback to the original path
        return path;
    }
    
    /**
     * Initialize the audio element and prepare it for playback
     */
    initialize() {
        // Create a promise that resolves when the audio is loaded
        this.loadPromise = new Promise((resolve, reject) => {
            this.audio.addEventListener('canplaythrough', () => {
                console.log('Music loaded and ready to play');
                resolve();
            }, { once: true });
            
            this.audio.addEventListener('error', (e) => {
                console.error('Error loading music:', e);
                console.error('Audio source:', this.audio.currentSrc || this.audio.src);
                
                // Provide more detailed error information
                if (this.audio.error) {
                    const errorTypes = [
                        'MEDIA_ERR_ABORTED',
                        'MEDIA_ERR_NETWORK',
                        'MEDIA_ERR_DECODE',
                        'MEDIA_ERR_SRC_NOT_SUPPORTED'
                    ];
                    
                    const errorCode = this.audio.error.code;
                    const errorMessage = errorTypes[errorCode - 1] || 'Unknown error';
                    console.error(`Audio error code: ${errorCode} (${errorMessage})`);
                }
                
                // Try an alternative approach for loading the audio
                this.tryAlternativeLoading();
                
                // Resolve instead of reject to prevent breaking the app
                // This allows the app to continue even if music fails to load
                resolve();
            }, { once: true });
            
            // Set the source after adding event listeners
            this.audio.load();
        });
        
        // Add a timeout to detect if loading takes too long
        setTimeout(() => {
            if (!this.audio.readyState) {
                console.warn('Audio loading timeout - trying alternative method');
                this.tryAlternativeLoading();
            }
        }, 3000);
        
        // Add event listeners for playback state
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            console.log('Music started playing');
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            console.log('Music paused');
        });
    }
    
    /**
     * Set the volume level (0.0 to 1.0)
     * @param {number} level - Volume level between 0 and 1
     */
    setVolume(level) {
        // Ensure volume is between 0 and 1
        const volume = Math.max(0, Math.min(1, level));
        this.audio.volume = volume;
        console.log(`Music volume set to ${volume * 100}%`);
    }
    
    /**
     * Play the music
     * @param {number} volume - Optional volume level (0 to 1)
     * @returns {Promise} - Resolves when playback starts
     */
    /**
     * Try alternative methods to load the audio
     * This is a fallback for when the standard Audio element fails
     */
    tryAlternativeLoading() {
        console.log('Trying alternative audio loading method');
        
        // Create a completely new audio element
        const newAudio = new Audio();
        
        // Add event listeners before setting source
        newAudio.addEventListener('canplaythrough', () => {
            console.log('Alternative audio loading succeeded');
            this.audio = newAudio;
        }, { once: true });
        
        newAudio.addEventListener('error', (e) => {
            console.error('Alternative audio loading also failed:', e);
        }, { once: true });
        
        // Try with a different approach to setting the source
        newAudio.src = this.audioPath;
        newAudio.load();
    }
    
    /**
     * Play the music
     * @param {number} volume - Optional volume level (0 to 1)
     * @returns {Promise} - Resolves when playback starts
     */
    play(volume = null) {
        // Set volume if provided
        if (volume !== null) {
            this.setVolume(volume);
        }
        
        // Return a promise that resolves when the music starts playing
        return this.loadPromise.then(() => {
            // Only play if not already playing
            if (!this.isPlaying) {
                // Make sure the audio element is properly loaded
                if (!this.audio.readyState) {
                    console.log('Audio not ready, reloading...');
                    this.audio.load();
                }
                
                return this.audio.play()
                    .then(() => {
                        this.isPlaying = true;
                        return true;
                    })
                    .catch(error => {
                        console.error('Failed to play music:', error);
                        
                        // Check if this is an autoplay policy error
                        const isAutoplayError = error.name === 'NotAllowedError' ||
                                               error.message.includes('user gesture');
                        
                        if (isAutoplayError) {
                            console.log('Autoplay blocked by browser policy. User interaction required.');
                        } else {
                            console.error('Music playback error details:', error.name, error.message);
                        }
                        
                        // Add a click event listener to the document to enable playback on user interaction
                        document.addEventListener('click', () => {
                            if (!this.isPlaying) {
                                console.log('User interaction detected, attempting to play music...');
                                this.audio.play()
                                    .then(() => {
                                        this.isPlaying = true;
                                        console.log('Music started playing after user interaction');
                                    })
                                    .catch(e => console.error('Still failed to play after user interaction:', e));
                            }
                        }, { once: true });
                        
                        return false;
                    });
            }
            return Promise.resolve(true);
        }).catch(error => {
            console.error('Music initialization failed:', error);
            return false;
        });
    }
    
    /**
     * Pause the music
     */
    pause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }
    
    /**
     * Stop the music (pause and reset to beginning)
     */
    stop() {
        this.pause();
        this.audio.currentTime = 0;
    }
}

/**
 * Create a music controller instance for the specified audio file
 * @param {string} audioPath - Path to the audio file
 * @returns {MusicController} - The music controller instance
 */
function createMusicController(audioPath) {
    return new MusicController(audioPath);
}

/**
 * Play music when loading reaches a specific percentage
 * @param {string} audioPath - Path to the audio file
 * @param {number} triggerPercentage - Percentage at which to start playing (0-100)
 * @param {number} volume - Volume level (0-1)
 * @returns {Function} - Callback function to be used with loading progress
 */
function createLoadingMusicTrigger(audioPath, triggerPercentage, volume) {
    const controller = createMusicController(audioPath);
    let hasTriggered = false;
    
    // Return a callback function that checks the loading percentage
    return function(percentage) {
        // Only trigger once when percentage reaches or exceeds the trigger point
        if (!hasTriggered && percentage >= triggerPercentage) {
            console.log(`Loading reached ${percentage}%, playing music at ${volume * 100}% volume`);
            controller.play(volume);
            hasTriggered = true;
        }
        return controller; // Return the controller for potential external control
    };
}
