# 🚀 Configuración de GitHub Releases para Modelo 3D

## 📋 Pasos para subir el modelo GLB a GitHub Releases:

### 1. Ir a GitHub Releases
- Ve a: `https://github.com/AndresFelipeGA/PortafolioAndres`
- Click en **"Releases"** (barra lateral derecha)
- Click en **"Create a new release"**

### 2. Configurar el Release
- **Tag version:** `v1.0.0`
- **Release title:** `Portfolio 3D Model v1.0.0`
- **Description:** 
  ```
  3D model for portfolio website
  - File: xk9m7p4q2w8n5v3z1r6t8y4u9i2o7e5a3s6d8f1g4h7j9k2l5m8n1b6v4c7x9z2q5w8e3r6.glb
  - Size: ~532MB
  - Format: GLB (GLTF Binary)
  ```

### 3. Subir el archivo
- En **"Attach binaries by dropping them here or selecting them"**
- Arrastra o selecciona tu archivo GLB desde:
  `private-assets/xk9m7p4q2w8n5v3z1r6t8y4u9i2o7e5a3s6d8f1g4h7j9k2l5m8n1b6v4c7x9z2q5w8e3r6.glb`
- Click **"Publish release"**

### 4. Verificar la URL
Después de publicar, la URL será:
```
https://github.com/AndresFelipeGA/PortafolioAndres/releases/download/v1.0.0/xk9m7p4q2w8n5v3z1r6t8y4u9i2o7e5a3s6d8f1g4h7j9k2l5m8n1b6v4c7x9z2q5w8e3r6.glb
```

## ✅ Código ya actualizado
El archivo `server.js` ya está configurado para usar GitHub Releases como URL principal.

## 🔄 Después de subir el archivo:
1. Commit y push los cambios del código
2. Redeploy en Railway
3. Verificar que el modelo 3D carga correctamente

## 🐛 Troubleshooting
Si el modelo no carga:
- Verifica que el Release esté público
- Confirma que el nombre del archivo coincida exactamente
- Revisa los logs de Railway para ver qué URL está intentando usar

## 📝 Notas importantes:
- GitHub Releases permite archivos hasta 2GB
- Los archivos en Releases son públicos y accesibles vía URL directa
- Es la solución más confiable para archivos grandes en GitHub