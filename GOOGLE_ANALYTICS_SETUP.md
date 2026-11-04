# 📊 Google Analytics Setup Guide

## ¿Qué es Google Analytics?
Google Analytics te permite ver estadísticas detalladas de tu sitio web, incluyendo:
- **Visitantes únicos** y **vistas de página**
- **Ubicación geográfica** de tus visitantes
- **Dispositivos utilizados** (móvil, desktop, tablet)
- **Páginas más visitadas**
- **Tiempo de permanencia** en el sitio
- **Fuentes de tráfico** (Google, redes sociales, enlaces directos)
- **Visitantes en tiempo real**

## 🚀 Pasos para Activar Google Analytics

### 1. Crear Cuenta de Google Analytics (GRATIS)
1. Ve a: https://analytics.google.com/
2. Haz clic en **"Empezar"**
3. Inicia sesión con tu cuenta de Google
4. Crea una nueva **Cuenta de Analytics**

### 2. Configurar Propiedad
1. **Nombre de la cuenta**: `Portafolio Andres`
2. **Nombre de la propiedad**: `PortafolioAndres`
3. **URL del sitio web**:
   - Actual: `https://andresfelipega.github.io/PortafolioAndres/`
   - O si cambias a URL corta: `https://andresfelipega.github.io/`
4. **Categoría**: `Tecnología` o `Portafolio Personal`
5. **Zona horaria**: `Colombia (GMT-5)`

### 3. Obtener tu Measurement ID
1. Después de crear la propiedad, verás tu **Measurement ID**
2. Se ve así: `G-XXXXXXXXXX` (ejemplo: `G-ABC123DEF4`)
3. **¡COPIA ESTE ID!** Lo necesitarás en el siguiente paso

### 4. Reemplazar el ID en tu Código
En el archivo `index.html`, busca estas dos líneas:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```
```javascript
gtag('config', 'GA_MEASUREMENT_ID');
```

**Reemplaza `GA_MEASUREMENT_ID` con tu ID real:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
```
```javascript
gtag('config', 'G-ABC123DEF4');
```

### 5. Hacer Commit y Push
```bash
git add index.html
git commit -m "feat: Configure Google Analytics with real Measurement ID"
git push origin github-pages-migration
```

## 📈 Cómo Ver tus Estadísticas

### Acceso a Google Analytics:
1. Ve a: https://analytics.google.com/
2. Selecciona tu propiedad `PortafolioAndres`
3. En el menú izquierdo verás:

#### **📊 Informes Principales:**
- **Tiempo real**: Visitantes activos ahora mismo
- **Audiencia**: Datos demográficos y ubicación
- **Adquisición**: De dónde vienen tus visitantes
- **Comportamiento**: Qué páginas visitan más
- **Conversiones**: Objetivos completados

#### **🔥 Datos Más Útiles:**
- **Usuarios únicos** (últimos 7/30 días)
- **Sesiones totales**
- **Páginas vistas**
- **Duración promedio de sesión**
- **Tasa de rebote**
- **Países de origen**
- **Dispositivos más usados**

## ⚡ Verificación Rápida
Después de configurar:
1. Visita tu sitio: https://andresfelipega.github.io/PortafolioAndres/
2. Ve a Google Analytics → **Tiempo real**
3. Deberías ver **1 usuario activo** (¡tú!)

## 🎯 Beneficios Inmediatos
- **Datos en tiempo real** desde el primer día
- **Historial completo** de visitantes
- **Informes automáticos** por email (opcional)
- **Comparativas** mes a mes
- **Análisis de rendimiento** de páginas

## 📱 App Móvil
Descarga la app **Google Analytics** para ver estadísticas desde tu teléfono.

---

**¡Una vez configurado, tendrás estadísticas completas de todos los visitantes de tu portafolio!**