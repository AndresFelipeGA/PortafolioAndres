# 🔥 Configuración de Firebase Storage para Modelo 3D Seguro

## 📋 Pasos para configurar Firebase Storage:

### 1. Crear proyecto en Firebase
- Ve a: `https://console.firebase.google.com/`
- Click "Crear un proyecto" o "Add project"
- Nombre del proyecto: `portfolio-3d-model` (o el que prefieras)
- Desactiva Google Analytics (no es necesario)
- Click "Crear proyecto"

### 2. Configurar Storage
- En el panel izquierdo, click "Storage"
- Click "Comenzar" o "Get started"
- Selecciona "Comenzar en modo de prueba" (Start in test mode)
- Elige una ubicación cercana (ej: `us-central1`)
- Click "Listo"

### 3. Subir el modelo GLB
- En la consola de Storage, click "Subir archivo"
- Selecciona tu archivo GLB (532MB)
- Espera a que se complete la subida
- Click en el archivo subido
- Copia la URL de descarga (Download URL)

### 4. Configurar reglas de seguridad
En la pestaña "Rules", reemplaza las reglas por:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.headers.referer != null && 
                     (request.headers.referer.matches('.*portafolioandres.*') ||
                      request.headers.referer.matches('.*localhost.*'));
    }
  }
}
```

### 5. URL resultante
La URL será algo como:
```
https://firebasestorage.googleapis.com/v0/b/tu-proyecto.appspot.com/o/xk9m7p4q2w8n5v3z1r6t8y4u9i2o7e5a3s6d8f1g4h7j9k2l5m8n1b6v4c7x9z2q5w8e3r6.glb?alt=media&token=abc123...
```

## 🔒 Ventajas de seguridad:
- ✅ Reglas de acceso por referrer
- ✅ Tokens de autenticación
- ✅ CDN global de Google
- ✅ 1GB gratuito (suficiente para tu modelo)
- ✅ Control granular de permisos

## 📝 Próximos pasos:
1. Crear proyecto en Firebase
2. Configurar Storage
3. Subir el modelo GLB (532MB)
4. Configurar reglas de seguridad
5. Copiar la URL de descarga
6. Actualizar el código con la nueva URL

## 🚨 Importante:
- Las reglas de seguridad solo permiten acceso desde tu dominio
- El token en la URL proporciona seguridad adicional
- Firebase maneja automáticamente la compresión y optimización