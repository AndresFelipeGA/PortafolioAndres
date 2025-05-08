# Portfolio Andrés

A portfolio website with a 3D model viewer for Colombian coffee models.

## Features

- Node.js server for serving static files
- Three.js for 3D model rendering
- Docker containerization for easy deployment
- Real-time development with volume mounting

## Running with Docker

### Production Mode

To run the application in production mode:

```bash
docker-compose up portfolio-app
```

This will start the application on http://localhost:8080

### Development Mode

To run the application in development mode with hot-reload:

```bash
docker-compose up portfolio-dev
```

This will start the application with nodemon, which will automatically restart the server when files change.

## Manual Setup (without Docker)

If you prefer to run the application without Docker:

1. Install Node.js
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   
For development with auto-reload:
```bash
npm run dev
```

## Project Structure

- `server.js` - Node.js HTTP server
- `fixed-advanced-loader.html` - Main 3D viewer page
- `Modelo3DCafeColombiano.glb` - 3D model file
- `images/` - Image assets

## Docker Configuration

- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-container setup
- `.dockerignore` - Files excluded from Docker build