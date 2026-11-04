/**
 * Render bajo demanda (ahorro de CPU/GPU/batería del visitante).
 *
 * Antes la escena completa se dibujaba ~60 veces por segundo aunque nada se
 * moviera. Ahora se dibuja a fps completos solo mientras hay "actividad", y en
 * reposo se deja de dibujar (el navegador sigue mostrando el último frame,
 * que es idéntico porque nada cambió).
 *
 * Se considera actividad, de forma genérica (sin tocar cada función del sitio):
 *  - movimiento de cámara (matriz de mundo o proyección distinta al último frame)
 *  - cualquier interacción: mouse, rueda, teclado, touch, resize, foco
 *  - mensajes postMessage (los iframes de las pantallas 3D)
 *  - cualquier setTimeout / setInterval que se dispare (animaciones por timers)
 *  - cualquier material o textura marcada con needsUpdate
 *  - cualquier objeto agregado a la escena
 *
 * Los needsUpdate que Three hace internamente mientras dibuja (p. ej. materiales
 * transparentes de doble cara) se ignoran entre beginRender()/endRender().
 *
 * Red de seguridad: en reposo se dibuja igualmente 1 frame por segundo.
 *
 * Requiere THREE (cargar después de three.min.js y antes del script principal).
 */
(function () {
    'use strict';

    var ACTIVE_MS = 1500;      // seguir dibujando tras la última actividad
    var SAFETY_MS = 1000;      // en reposo, 1 frame de seguridad por segundo

    var activeUntil = 0;
    var lastRender = 0;
    var lastCam = new Float64Array(32);
    var now = function () { return performance.now(); };

    var stats = {};
    var rendering = false;
    function wake(ms, source) {
        if (rendering) return; // cambios internos de Three durante el render
        if (source) stats[source] = (stats[source] || 0) + 1;
        var until = now() + (ms || ACTIVE_MS);
        if (until > activeUntil) activeUntil = until;
    }

    // 1) Interacción del usuario y mensajes de iframes
    ['pointerdown', 'pointermove', 'pointerup', 'mousedown', 'mousemove', 'mouseup',
     'wheel', 'keydown', 'keyup', 'touchstart', 'touchmove', 'touchend', 'click',
     'resize', 'message', 'focus', 'visibilitychange', 'orientationchange'
    ].forEach(function (type) {
        window.addEventListener(type, function () { wake(0, 'event:' + type); }, { passive: true, capture: true });
    });

    // 2) Timers: cualquier callback que se dispare puede cambiar la escena
    function wrapTimer(name) {
        var original = window[name];
        window[name] = function (fn) {
            if (typeof fn === 'function') {
                var cb = fn;
                arguments[0] = function () { wake(0, name); return cb.apply(this, arguments); };
            }
            return original.apply(window, arguments);
        };
    }
    wrapTimer('setTimeout');
    wrapTimer('setInterval');

    // 3) Materiales/texturas actualizados y objetos agregados a la escena
    if (window.THREE) {
        [THREE.Material, THREE.Texture].forEach(function (Cls) {
            var desc = Cls && Object.getOwnPropertyDescriptor(Cls.prototype, 'needsUpdate');
            if (desc && desc.set) {
                Object.defineProperty(Cls.prototype, 'needsUpdate', {
                    configurable: true,
                    get: desc.get,
                    set: function (v) { wake(0, 'needsUpdate'); desc.set.call(this, v); }
                });
            }
        });
        var originalAdd = THREE.Object3D.prototype.add;
        THREE.Object3D.prototype.add = function () { wake(0, 'add'); return originalAdd.apply(this, arguments); };
    }

    function cameraChanged(camera) {
        var changed = false;
        var m = camera.matrixWorld.elements, p = camera.projectionMatrix.elements;
        for (var i = 0; i < 16; i++) {
            if (lastCam[i] !== m[i]) { lastCam[i] = m[i]; changed = true; }
            if (lastCam[16 + i] !== p[i]) { lastCam[16 + i] = p[i]; changed = true; }
        }
        return changed;
    }

    window.RenderScheduler = {
        wake: wake,
        stats: stats,
        beginRender: function () { rendering = true; },
        endRender: function () { rendering = false; },
        /** Llamar una vez por frame, después de actualizar cámara/controles. */
        shouldRender: function (camera, forceActive) {
            var t = now();
            rendering = false; // por si un render anterior lanzó una excepción
            camera.updateMatrixWorld();
            if (cameraChanged(camera)) wake(0, 'camera');
            if (forceActive) wake(0, 'cameraAnimation');
            if (t < activeUntil || t - lastRender >= SAFETY_MS || document.hidden) {
                lastRender = t;
                return true;
            }
            return false;
        }
    };
})();
