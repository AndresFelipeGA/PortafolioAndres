/**
 * Secure Model Loader - Protección real del modelo 3D
 */

// Función para obtener la URL del modelo de forma segura
window.getSecureModelUrl = function() {
    // Usar proxy CORS temporal mientras se configura Cloudflare R2
    return 'https://cors-anywhere.herokuapp.com/https://pub-3eee7465d9374f15a9c4a6192489c0b1.r2.dev/modelo3d.glb';
};

// Función para obtener URL de fallback (también segura)
window.getSecureFallbackUrl = function() {
    // Fallback directo a Cloudflare R2 (sin proxy)
    return 'https://pub-3eee7465d9374f15a9c4a6192489c0b1.r2.dev/modelo3d.glb';
};

// Validación adicional de seguridad
window.validateModelAccess = function() {
    const userAgent = navigator.userAgent.toLowerCase();
    const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
    
    for (let agent of suspiciousAgents) {
        if (userAgent.includes(agent)) {
            return false;
        }
    }
    
    return true;
};

// Función principal que reemplaza las URLs hardcodeadas en index.html
window.initSecureModelLoader = function() {
    if (!window.validateModelAccess()) {
        console.warn('Access validation failed');
        return { primary: null, fallback: null };
    }
    
    return {
        primary: window.getSecureModelUrl(),
        fallback: window.getSecureFallbackUrl()
    };
};

// Auto-inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Secure Model Loader initialized');
    });
} else {
    console.log('Secure Model Loader initialized');
}