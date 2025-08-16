# Static Forms Implementation

## Overview
This document describes the implementation of Static Forms as the email service for the contact forms in the 3D portfolio website.

## Configuration
All contact forms have been configured to use Static Forms with the following settings:

1. Form action: `https://api.staticforms.xyz/submit`
2. Method: `POST`
3. Hidden fields:
   - `accessKey`: `sf_0eh8kk35hfj689nf30hhdnm9` (Static Forms API key)
   - `subject`: Customized for each form (e.g., "Nuevo formulario de contacto: Desarrollo Web")
   - `replyTo`: `andresfgonzalezaristizabal@outlook.com` (where replies will be sent)
   - `redirectTo`: `cafe-menu.html` (redirect after successful submission)
   - `servicio`: Service type (e.g., "Desarrollo Web", "Freelance", etc.)

## Implementation Details
Static Forms has been implemented in the following contact forms:

1. `contact-form-web.html` - Web Development
2. `contact-form-freelance.html` - Freelance
3. `contact-form-consulting.html` - Tech Consulting
4. `contact-form-automation.html` - Automation
5. `contact-form-software.html` - Custom Software
6. `contact-form-devops.html` - Prompt Engineering

## How It Works
1. When a user submits a form, the data is sent to Static Forms' API endpoint.
2. Static Forms processes the submission and sends an email to the specified email address.
3. The user is redirected to the cafe menu page after successful submission.

## Benefits of Static Forms
- No server-side code required
- Free tier with sufficient capacity for portfolio site
- Simple implementation
- No activation emails required
- Works with static websites

## Troubleshooting
If emails are not being received:
1. Check spam/junk folder
2. Verify the accessKey is correct
3. Ensure the form is properly configured with all required fields
4. Check if there are any console errors during form submission

## References
- [Static Forms Documentation](https://www.staticforms.xyz/documentation)
- [Static Forms Dashboard](https://www.staticforms.xyz/dashboard)