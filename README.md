# Portfolio Andrés

Interactive 3D portfolio built with Three.js and Node.js following enterprise-level architecture patterns.

## Features

- Node.js server for serving static files
- Three.js for 3D model rendering
- Docker containerization for easy deployment
- Real-time development with volume mounting
- Organized codebase following industry best practices
- Modular architecture for scalability

## Project Structure

```
├── public/           # Public assets and main entry point
├── src/              # Source code (pages, scripts)
├── docs/             # Documentation
├── server.js         # Node.js server
└── docker files      # Container configuration
```

For detailed structure information, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

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

## Key Files

- `public/index.html` - Main 3D viewer application
- `public/assets/Modelo3DCafeColombiano.glb` - 3D model file
- `public/assets/media/` - Images, icons, and music assets
- `src/pages/` - Application pages organized by feature
- `src/scripts/` - JavaScript modules

## Architecture

This project follows modern web development practices:

- **Separation of Concerns**: Clear distinction between public assets and source code
- **Modular Design**: Features organized in logical directories
- **Scalable Structure**: Easy to extend with new features
- **Documentation**: Comprehensive docs for maintenance
- **Containerization**: Docker support for consistent deployments

## Docker Configuration

- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-container setup
- `.dockerignore` - Files excluded from Docker build
