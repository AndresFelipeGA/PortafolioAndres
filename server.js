const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const zlib = require('zlib');

const PORT = process.env.PORT || 8080;
const EMAIL_RECIPIENT = 'andresfgonzalezaristizabal@outlook.com';

// SendGrid API configuration
// Note: You'll need to sign up for SendGrid and get an API key
const SENDGRID_API_KEY = 'YOUR_SENDGRID_API_KEY'; // Replace with your actual API key
const SENDGRID_API_URL = 'api.sendgrid.com';
const SENDGRID_API_PATH = '/v3/mail/send';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.mp3': 'audio/mpeg'
};

// Track active requests for debugging
const activeRequests = new Map();

// Add CORS headers to response
function addCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
    
    // Use less restrictive CORS policies to allow external resources like Google Fonts
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Remove COEP header that was blocking Google Fonts
    // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    
    // Keep COOP for security but don't enforce COEP
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
}

// Function to send email using SendGrid API
function sendEmail(to, subject, content) {
    return new Promise((resolve, reject) => {
        // Prepare the email data according to SendGrid API v3
        const emailData = {
            personalizations: [
                {
                    to: [{ email: to }],
                    subject: subject
                }
            ],
            from: { email: 'noreply@yourwebsite.com', name: 'Formulario de Contacto' },
            content: [
                {
                    type: 'text/plain',
                    value: content
                }
            ]
        };
        
        // Convert the data to JSON
        const jsonData = JSON.stringify(emailData);
        
        // Set up the request options
        const options = {
            hostname: SENDGRID_API_URL,
            path: SENDGRID_API_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Length': Buffer.byteLength(jsonData)
            }
        };
        
        // Create the request
        const req = https.request(options, (res) => {
            let responseData = '';
            
            // Collect response data
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            // Process the complete response
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('Email sent successfully');
                    resolve({ success: true });
                } else {
                    console.error(`SendGrid API error: ${res.statusCode}`);
                    console.error(responseData);
                    reject(new Error(`SendGrid API error: ${res.statusCode}`));
                }
            });
        });
        
        // Handle request errors
        req.on('error', (error) => {
            console.error('Error sending email:', error);
            reject(error);
        });
        
        // Send the request
        req.write(jsonData);
        req.end();
    });
}

// Function to handle form submissions
function handleFormSubmission(req, res) {
    let body = '';
    
    // Collect data chunks
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    // Process the complete request body
    req.on('end', async () => {
        try {
            // Parse form data
            const formData = querystring.parse(body);
            
            // Determine which form was submitted
            const formType = req.url.split('/').pop().replace('.html', '');
            
            // Create email content
            let emailSubject = `Nuevo formulario de contacto: ${formType}`;
            let emailText = `Se ha recibido un nuevo formulario de contacto:\n\n`;
            
            // Add all form fields to email
            for (const [key, value] of Object.entries(formData)) {
                emailText += `${key}: ${value}\n`;
            }
            
            // Log the form data
            console.log('========== FORM SUBMISSION ==========');
            console.log(`To: ${EMAIL_RECIPIENT}`);
            console.log(`Subject: ${emailSubject}`);
            console.log('Content:');
            console.log(emailText);
            console.log('====================================');
            
            try {
                // Send the email using SendGrid
                await sendEmail(EMAIL_RECIPIENT, emailSubject, emailText);
                
                // Send success response
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Formulario enviado correctamente a ' + EMAIL_RECIPIENT
                }));
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                
                // Send error response
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Error al enviar el correo electrónico. Por favor, inténtelo de nuevo más tarde.'
                }));
            }
            
        } catch (error) {
            console.error('Error processing form submission:', error);
            
            // Send error response
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error al procesar el formulario'
            }));
        }
    });
}

const server = http.createServer((req, res) => {
    const requestId = Date.now() + '-' + Math.floor(Math.random() * 10000);
    const startTime = Date.now();
    
    // Track this request
    activeRequests.set(requestId, {
        url: req.url,
        method: req.method,
        startTime: startTime
    });
    
    console.log(`[${requestId}] Request: ${req.method} ${req.url}`);
    
    // Handle OPTIONS requests for CORS preflight
    if (req.method === 'OPTIONS') {
        console.log(`[${requestId}] Handling CORS preflight request`);
        addCorsHeaders(res);
        res.writeHead(204);
        res.end();
        activeRequests.delete(requestId);
        return;
    }
    
    // Handle form submissions (POST requests)
    if (req.method === 'POST' && req.url.includes('contact-form')) {
        console.log(`[${requestId}] Handling form submission: ${req.url}`);
        addCorsHeaders(res);
        handleFormSubmission(req, res);
        activeRequests.delete(requestId);
        return;
    }
    
    // Handle secure model endpoint
    if (req.method === 'GET' && req.url.startsWith('/secure-model')) {
        console.log(`[${requestId}] Secure model request from: ${req.headers.referer || 'direct'}`);
        
        // More flexible validation for Railway deployment
        const referer = req.headers.referer;
        const userAgent = req.headers['user-agent'] || '';
        const host = req.headers.host;
        
        // Create valid referer patterns - more flexible for Railway
        const validReferers = [
            `http://${host}`,
            `https://${host}`,
            // Support Railway domains
            'https://portafolioandres-production',
            'https://portafolioandres3d.onrender.com'
        ];
        
        // More lenient referer validation
        const isValidReferer = !referer || // Allow requests without referer (for development)
                              referer === 'undefined' || // Handle undefined referer
                              validReferers.some(valid => referer.startsWith(valid)) ||
                              referer.includes(host); // Allow if contains the host
        
        // Only block obvious bots/scrapers
        const isSuspiciousAgent = userAgent.toLowerCase().includes('bot') ||
                                 userAgent.toLowerCase().includes('crawler') ||
                                 userAgent.toLowerCase().includes('spider') ||
                                 userAgent.toLowerCase().includes('scraper') ||
                                 userAgent.toLowerCase().includes('wget') ||
                                 userAgent.toLowerCase().includes('curl');
        
        // More lenient blocking - only block if both conditions are suspicious
        if (isSuspiciousAgent && !isValidReferer) {
            console.log(`[${requestId}] BLOCKED secure model access:`);
            console.log(`[${requestId}]   Referer: ${referer || 'none'}`);
            console.log(`[${requestId}]   User-Agent: ${userAgent}`);
            console.log(`[${requestId}]   Valid referer: ${isValidReferer}`);
            console.log(`[${requestId}]   Suspicious agent: ${isSuspiciousAgent}`);
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Access denied');
            activeRequests.delete(requestId);
            return;
        }
        
        console.log(`[${requestId}] ALLOWED secure model access - Valid referer and user agent`);
        
        // Serve the protected model with HTTP compression
        const modelPath = path.join(__dirname, 'private-assets', 'xk9m7p4q2w8n5v3z1r6t8y4u9i2o7e5a3s6d8f1g4h7j9k2l5m8n1b6v4c7x9z2q5w8e3r6.glb');
        
        fs.access(modelPath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error(`[${requestId}] Protected model not found: ${modelPath}`);
                res.writeHead(404);
                res.end('Model not found');
                activeRequests.delete(requestId);
                return;
            }
            
            // Get file stats
            fs.stat(modelPath, (err, stats) => {
                if (err) {
                    console.error(`[${requestId}] Error getting model stats: ${err.code}`);
                    res.writeHead(500);
                    res.end('Server Error');
                    activeRequests.delete(requestId);
                    return;
                }
                
                console.log(`[${requestId}] Serving protected model: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
                
                // Check if client accepts gzip compression
                const acceptEncoding = req.headers['accept-encoding'] || '';
                const supportsGzip = acceptEncoding.includes('gzip');
                
                if (supportsGzip && stats.size > 1024 * 1024) { // Only compress files > 1MB
                    console.log(`[${requestId}] Compressing model with gzip...`);
                    
                    // Read and compress the file
                    fs.readFile(modelPath, (err, data) => {
                        if (err) {
                            console.error(`[${requestId}] Error reading model: ${err.code}`);
                            res.writeHead(500);
                            res.end('Server Error');
                            activeRequests.delete(requestId);
                            return;
                        }
                        
                        // Compress with gzip
                        zlib.gzip(data, { level: 6 }, (err, compressedData) => {
                            if (err) {
                                console.error(`[${requestId}] Error compressing model: ${err.message}`);
                                // Fallback to uncompressed
                                const headers = {
                                    'Content-Type': 'model/gltf-binary',
                                    'Content-Length': stats.size,
                                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                                    'Pragma': 'no-cache',
                                    'Expires': '0'
                                };
                                addCorsHeaders(res);
                                res.writeHead(200, headers);
                                res.end(data);
                                activeRequests.delete(requestId);
                                return;
                            }
                            
                            const compressionRatio = ((stats.size - compressedData.length) / stats.size * 100).toFixed(1);
                            console.log(`[${requestId}] Compressed: ${(compressedData.length / (1024 * 1024)).toFixed(2)} MB (${compressionRatio}% reduction)`);
                            
                            // Set headers for compressed GLB file
                            const headers = {
                                'Content-Type': 'model/gltf-binary',
                                'Content-Encoding': 'gzip',
                                'Content-Length': compressedData.length,
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0'
                            };
                            
                            addCorsHeaders(res);
                            res.writeHead(200, headers);
                            res.end(compressedData);
                            
                            const duration = Date.now() - startTime;
                            console.log(`[${requestId}] Protected model served successfully (took ${duration}ms)`);
                            activeRequests.delete(requestId);
                        });
                    });
                } else {
                    // Serve uncompressed file
                    const headers = {
                        'Content-Type': 'model/gltf-binary',
                        'Content-Length': stats.size,
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    };
                    
                    addCorsHeaders(res);
                    
                    // Stream the protected model
                    const fileStream = fs.createReadStream(modelPath, {
                        highWaterMark: 1024 * 1024 * 4 // 4MB buffer
                    });
                    
                    fileStream.on('error', (error) => {
                        console.error(`[${requestId}] Error streaming protected model: ${error.code}`);
                        if (!res.headersSent) {
                            res.writeHead(500);
                            res.end('Server Error');
                        }
                        activeRequests.delete(requestId);
                    });
                    
                    fileStream.on('end', () => {
                        const duration = Date.now() - startTime;
                        console.log(`[${requestId}] Protected model served successfully (took ${duration}ms)`);
                        activeRequests.delete(requestId);
                    });
                    
                    res.writeHead(200, headers);
                    fileStream.pipe(res);
                }
            });
        });
        return;
    }
    
    // Remove query parameters from URL
    const urlWithoutQuery = req.url.split('?')[0];
    
    let filePath;
    
    // Handle root URL
    if (urlWithoutQuery === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else {
        // First try in public directory
        filePath = path.join(__dirname, 'public', urlWithoutQuery);
        
        // If not found in public, try in src/pages
        if (!fs.existsSync(filePath)) {
            const srcPagesPath = path.join(__dirname, 'src', 'pages', urlWithoutQuery);
            if (fs.existsSync(srcPagesPath)) {
                filePath = srcPagesPath;
            } else {
                // Try specific subdirectories in src/pages
                const contactPath = path.join(__dirname, 'src', 'pages', 'contact', urlWithoutQuery);
                const projectsPath = path.join(__dirname, 'src', 'pages', 'projects', urlWithoutQuery);
                
                if (fs.existsSync(contactPath)) {
                    filePath = contactPath;
                } else if (fs.existsSync(projectsPath)) {
                    filePath = projectsPath;
                } else {
                    // Try with .html extension if not present
                    const htmlFile = urlWithoutQuery.endsWith('.html') ? urlWithoutQuery : urlWithoutQuery + '.html';
                    const publicHtmlPath = path.join(__dirname, 'public', htmlFile);
                    const srcHtmlPath = path.join(__dirname, 'src', 'pages', htmlFile);
                    const contactHtmlPath = path.join(__dirname, 'src', 'pages', 'contact', htmlFile);
                    const projectsHtmlPath = path.join(__dirname, 'src', 'pages', 'projects', htmlFile);
                    
                    if (fs.existsSync(publicHtmlPath)) {
                        filePath = publicHtmlPath;
                    } else if (fs.existsSync(srcHtmlPath)) {
                        filePath = srcHtmlPath;
                    } else if (fs.existsSync(contactHtmlPath)) {
                        filePath = contactHtmlPath;
                    } else if (fs.existsSync(projectsHtmlPath)) {
                        filePath = projectsHtmlPath;
                    }
                }
            }
        }
    }
    
    console.log(`[${requestId}] Resolved file path: ${filePath}`);
    console.log(`[${requestId}] File exists check: ${fs.existsSync(filePath)}`);
    
    // Get file extension
    const extname = path.extname(filePath);
    
    // Set default content type to binary
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    console.log(`[${requestId}] Content type: ${contentType}`);
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Page not found
            console.error(`[${requestId}] File not found: ${filePath}`);
            console.error(`[${requestId}] Error details: ${err.message}`);
            res.writeHead(404);
            res.end('404 - File Not Found');
            activeRequests.delete(requestId);
            return;
        }

        // Get file stats to check size
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error(`[${requestId}] Error getting file stats: ${err.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
                activeRequests.delete(requestId);
                return;
            }

            // Set content type and length headers with CORS
            const headers = {
                'Content-Type': contentType,
                'Content-Length': stats.size,
                'Cache-Control': 'no-cache, no-store, must-revalidate', // Disable caching
                'Pragma': 'no-cache',
                'Expires': '0'
            };
            
            // Add CORS headers
            addCorsHeaders(res);

            // For large files (>10MB), use streaming
            if (stats.size > 10 * 1024 * 1024) {
                console.log(`[${requestId}] Streaming large file: ${filePath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
                
                // Create read stream with higher buffer size for large files
                const fileStream = fs.createReadStream(filePath, {
                    highWaterMark: 1024 * 1024 * 4 // 4MB buffer size
                });
                
                // Handle stream errors
                fileStream.on('error', (error) => {
                    console.error(`[${requestId}] Error streaming file: ${error.code}`);
                    console.error(`[${requestId}] Error details: ${error.message}`);
                    if (!res.headersSent) {
                        res.writeHead(500);
                        res.end(`Server Error: ${error.code}`);
                    }
                    activeRequests.delete(requestId);
                });
                
                // Log when streaming starts
                fileStream.on('open', () => {
                    console.log(`[${requestId}] Started streaming: ${filePath}`);
                });
                
                // Log when streaming ends
                fileStream.on('end', () => {
                    const duration = Date.now() - startTime;
                    console.log(`[${requestId}] Finished streaming: ${filePath} (took ${duration}ms)`);
                    activeRequests.delete(requestId);
                });
                
                // Stream the file
                res.writeHead(200, headers);
                fileStream.pipe(res);
            } else {
                // For smaller files, use regular file reading
                fs.readFile(filePath, (err, content) => {
                    if (err) {
                        console.error(`[${requestId}] Server error: ${err.code}`);
                        res.writeHead(500);
                        res.end(`Server Error: ${err.code}`);
                    } else {
                        res.writeHead(200, headers);
                        res.end(content);
                        const duration = Date.now() - startTime;
                        console.log(`[${requestId}] Served file: ${filePath} (took ${duration}ms)`);
                    }
                    activeRequests.delete(requestId);
                });
            }
        });
    });
});

// Log active requests every 30 seconds
setInterval(() => {
    if (activeRequests.size > 0) {
        console.log(`Active requests: ${activeRequests.size}`);
        activeRequests.forEach((request, id) => {
            const duration = Date.now() - request.startTime;
            console.log(`  [${id}] ${request.method} ${request.url} (running for ${duration}ms)`);
        });
    }
}, 30000);

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`3D model viewer: http://localhost:${PORT}/fixed-advanced-loader.html`);
    console.log(`Enhanced with CORS support and improved error handling`);
});