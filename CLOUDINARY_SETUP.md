# 🔒 Configuración de Cloudinary para Modelo 3D Seguro

## 📋 Pasos para configurar Cloudinary:

### 1. Crear cuenta en Cloudinary
- Ve a: `https://cloudinary.com/`
- Regístrate gratis (25GB de almacenamiento gratuito)
- Confirma tu email

### 2. Obtener credenciales
Después de registrarte, ve al Dashboard y copia:
- **Cloud Name:** `tu-cloud-name`
- **API Key:** `tu-api-key`
- **API Secret:** `tu-api-secret`

### 3. Subir el modelo GLB
Opción A - Via Web Interface:
- Ve a Media Library
- Click "Upload"
- Sube tu archivo GLB (532MB)
- Copia la URL pública

Opción B - Via API (más seguro):
```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/TU-CLOUD-NAME/raw/upload \
  -F "file=@private-assets/xk9m7p4q2w8n5v3z1r6t8y4u9i2o7e5a3s6d8f1g4h7j9k2l5m8n1b6v4c7x9z2q5w8e3r6.glb" \
  -F "public_id=portfolio-3d-model" \
  -F "resource_type=raw" \
  -u "TU-API-KEY:TU-API-SECRET"
```

### 4. URL resultante
La URL será algo como:
```
https://res.cloudinary.com/TU-CLOUD-NAME/raw/upload/v1234567890/portfolio-3d-model.glb
```

## 🔒 Ventajas de seguridad:
- ✅ Control de acceso por referrer
- ✅ URLs firmadas con timestamp
- ✅ Transformaciones on-the-fly
- ✅ CDN global optimizado
- ✅ Analytics de uso

## 📝 Próximos pasos:
1. Crear cuenta en Cloudinary
2. Subir el modelo GLB
3. Copiar la URL resultante
4. Actualizar el código con la nueva URL