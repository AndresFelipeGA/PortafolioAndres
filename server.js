const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

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
    '.gltf': 'model/gltf+json'
};

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);
    
    // Remove query parameters from URL
    const urlWithoutQuery = req.url.split('?')[0];
    
    // Handle root URL
    let filePath = urlWithoutQuery === '/'
        ? path.join(__dirname, 'fixed-advanced-loader.html')
        : path.join(__dirname, urlWithoutQuery);
    
    console.log(`Resolved file path: ${filePath}`);
    console.log(`File exists check: ${fs.existsSync(filePath)}`);
    
    // Get file extension
    const extname = path.extname(filePath);
    
    // Set default content type to binary
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    console.log(`Content type: ${contentType}`);
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Page not found
            console.error(`File not found: ${filePath}`);
            console.error(`Error details: ${err.message}`);
            res.writeHead(404);
            res.end('404 - File Not Found');
            return;
        }

        // Get file stats to check size
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error(`Error getting file stats: ${err.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
                return;
            }

            // Set content type and length headers
            const headers = {
                'Content-Type': contentType,
                'Content-Length': stats.size
            };

            // For large files (>10MB), use streaming
            if (stats.size > 10 * 1024 * 1024) {
                console.log(`Streaming large file: ${filePath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
                
                // Create read stream with higher buffer size for large files
                const fileStream = fs.createReadStream(filePath, {
                    highWaterMark: 1024 * 1024 * 4 // 4MB buffer size
                });
                
                // Handle stream errors
                fileStream.on('error', (error) => {
                    console.error(`Error streaming file: ${error.code}`);
                    console.error(`Error details: ${error.message}`);
                    if (!res.headersSent) {
                        res.writeHead(500);
                        res.end(`Server Error: ${error.code}`);
                    }
                });
                
                // Log when streaming starts
                fileStream.on('open', () => {
                    console.log(`Started streaming: ${filePath}`);
                });
                
                // Log when streaming ends
                fileStream.on('end', () => {
                    console.log(`Finished streaming: ${filePath}`);
                });
                
                // Stream the file
                res.writeHead(200, headers);
                fileStream.pipe(res);
            } else {
                // For smaller files, use regular file reading
                fs.readFile(filePath, (err, content) => {
                    if (err) {
                        console.error(`Server error: ${err.code}`);
                        res.writeHead(500);
                        res.end(`Server Error: ${err.code}`);
                    } else {
                        res.writeHead(200, headers);
                        res.end(content);
                    }
                });
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`3D model viewer: http://localhost:${PORT}/fixed-advanced-loader.html`);
});