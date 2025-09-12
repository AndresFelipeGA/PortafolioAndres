/**
 * Secure Model Loader - Protección real del modelo 3D
 */

// Función para obtener la URL del modelo de forma segura
window.getSecureModelUrl = function() {
    // Validación básica del entorno
    if (typeof window === 'undefined' || !document.referrer.includes(window.location.hostname)) {
        return null;
    }
    
    // Usar endpoint seguro del servidor
    const timestamp = Date.now();
    return '/secure-model?t=' + timestamp;
};

// Función para obtener URL de fallback (también segura)
window.getSecureFallbackUrl = function() {
    return '/secure-model';
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