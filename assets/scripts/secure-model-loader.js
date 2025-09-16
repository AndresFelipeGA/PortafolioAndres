/**
 * Secure Model Loader - Protección real del modelo 3D
 */

// Función para obtener la URL del modelo de forma segura
window.getSecureModelUrl = function() {
    // Usar GitHub Releases directamente - gratis e ilimitado
    return 'https://github.com/AndresFelipeGA/PortafolioAndres/releases/download/v1.0.0/xk9m7p4q2w8n5v3z1r6t8y4u9i2o7e5a3s6d8f1g4h7j9k2l5m8n1b6v4c7x9z2q5w8e3r6.glb';
};

// Función para obtener URL de fallback (también segura)
window.getSecureFallbackUrl = function() {
    // Fallback también desde GitHub Releases
    return 'https://github.com/AndresFelipeGA/PortafolioAndres/releases/download/v1.0.0/xk9m7p4q2w8n5v3z1r6t8y4u9i2o7e5a3s6d8f1g4h7j9k2l5m8n1b6v4c7x9z2q5w8e3r6.glb';
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