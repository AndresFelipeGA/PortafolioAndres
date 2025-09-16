/**
 * Secure Model Loader - Protección real del modelo 3D
 */

// Función para obtener la URL del modelo de forma segura
window.getSecureModelUrl = function() {
    // Usar Cloudflare R2 como primera opción
    return 'https://pub-3eee7465d9374f15a9c4a6192489c0b1.r2.dev/modelo3d.glb';
};

// Función para obtener URL de fallback (también Cloudflare R2)
window.getSecureFallbackUrl = function() {
    // Fallback también desde Cloudflare R2
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
    console.log('🔧 DEBUG: initSecureModelLoader called');
    
    if (!window.validateModelAccess()) {
        console.warn('Access validation failed');
        return { primary: null, fallback: null };
    }
    
    const primaryUrl = window.getSecureModelUrl();
    const fallbackUrl = window.getSecureFallbackUrl();
    
    console.log('🔧 DEBUG: Primary URL:', primaryUrl);
    console.log('🔧 DEBUG: Fallback URL:', fallbackUrl);
    
    return {
        primary: primaryUrl,
        fallback: fallbackUrl
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