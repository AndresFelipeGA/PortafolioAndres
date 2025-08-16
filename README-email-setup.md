# Configuración del Envío de Correos Electrónicos

Este documento explica cómo configurar el envío de correos electrónicos para los formularios de contacto utilizando SendGrid.

## Requisitos Previos

1. Crear una cuenta en SendGrid (https://sendgrid.com/)
2. Obtener una API Key de SendGrid

## Pasos para Configurar SendGrid

1. **Crear una cuenta en SendGrid**:
   - Visite [SendGrid](https://sendgrid.com/) y regístrese para obtener una cuenta gratuita
   - Complete el proceso de verificación de su cuenta

2. **Crear una API Key**:
   - Inicie sesión en su cuenta de SendGrid
   - Vaya a "Settings" > "API Keys"
   - Haga clic en "Create API Key"
   - Asigne un nombre a su API Key (por ejemplo, "Formulario de Contacto")
   - Seleccione "Full Access" o "Restricted Access" con permisos para "Mail Send"
   - Haga clic en "Create & View"
   - **IMPORTANTE**: Guarde la API Key mostrada, ya que no podrá verla nuevamente

3. **Configurar el Remitente**:
   - Vaya a "Settings" > "Sender Authentication"
   - Configure un dominio o al menos una dirección de correo electrónico verificada
   - Siga las instrucciones para verificar su dominio o dirección de correo electrónico

## Configuración en el Servidor

1. Abra el archivo `server.js`
2. Busque la siguiente línea:
   ```javascript
   const SENDGRID_API_KEY = 'YOUR_SENDGRID_API_KEY'; // Replace with your actual API key
   ```
3. Reemplace `'YOUR_SENDGRID_API_KEY'` con la API Key que obtuvo de SendGrid
4. Busque la línea:
   ```javascript
   from: { email: 'noreply@yourwebsite.com', name: 'Formulario de Contacto' },
   ```
5. Reemplace `'noreply@yourwebsite.com'` con una dirección de correo electrónico verificada en SendGrid

## Prueba del Envío de Correos

1. Inicie el servidor con `node server.js`
2. Abra uno de los formularios de contacto en su navegador
3. Complete el formulario y envíelo
4. Debería recibir un correo electrónico en la dirección configurada (`andresfgonzalezaristizabal@outlook.com`)
5. Verifique la consola del servidor para ver los registros de envío de correos

## Solución de Problemas

Si no recibe los correos electrónicos:

1. Verifique que la API Key esté correctamente configurada en `server.js`
2. Asegúrese de que la dirección de remitente esté verificada en SendGrid
3. Revise la consola del servidor para ver si hay errores
4. Verifique la carpeta de spam en su correo electrónico
5. Consulte los registros de actividad en el panel de SendGrid para ver si hay errores de envío

## Limitaciones

- La cuenta gratuita de SendGrid tiene un límite de 100 correos electrónicos por día
- Para volúmenes mayores, considere actualizar a un plan de pago