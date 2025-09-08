# Project Structure

This document describes the organized structure of the Portfolio Andrés project following enterprise-level best practices.

## Directory Structure

```
PortafolioAndres/
├── docs/                          # Documentation
│   └── PROJECT_STRUCTURE.md       # This file
├── public/                        # Public assets and main entry point
│   ├── index.html                 # Main application entry point
│   └── assets/                    # Static assets
│       ├── media/                 # Media files (images, music)
│       │   ├── icons/             # Application icons
│       │   ├── music/             # Audio files
│       │   └── pictures/          # Images and backgrounds
│       └── Modelo3DCafeColombiano.glb  # 3D model
├── src/                           # Source code
│   ├── pages/                     # HTML pages
│   │   ├── contact/               # Contact-related pages
│   │   │   ├── contact.html       # Main contact page
│   │   │   ├── contact-form-automation.html
│   │   │   ├── contact-form-consulting.html
│   │   │   ├── contact-form-freelance.html
│   │   │   ├── contact-form-mobile.html
│   │   │   ├── contact-form-software.html
│   │   │   └── contact-form-web.html
│   │   ├── projects/              # Project showcase pages
│   │   │   ├── project-chatbot.html
│   │   │   ├── project-ecommerce.html
│   │   │   ├── project-portfolio-3d.html
│   │   │   ├── project-productivity-app.html
│   │   │   ├── project-prompt-engineering.html
│   │   │   └── project-trading-bot.html
│   │   ├── about-me.html          # About page
│   │   ├── box.html               # Navigation hub
│   │   ├── cafe-menu.html         # Coffee menu showcase
│   │   ├── certifications.html   # Certifications page
│   │   ├── community.html         # Community page
│   │   ├── credits.html           # Credits page
│   │   ├── experience.html        # Experience page
│   │   ├── projects.html          # Projects listing
│   │   └── skills.html            # Skills page
│   └── scripts/                   # JavaScript modules
│       └── music-autoplay.js      # Music controller
├── node_modules/                  # Dependencies (auto-generated)
├── .dockerignore                  # Docker ignore rules
├── .gitattributes                 # Git attributes
├── .gitignore                     # Git ignore rules
├── docker-compose.yml             # Docker compose configuration
├── Dockerfile                     # Docker build instructions
├── package-lock.json              # Dependency lock file
├── package.json                   # Project configuration
├── README.md                      # Project documentation
└── server.js                      # Node.js server
```

## Architecture Decisions

### 1. **Public Directory**
- Contains the main entry point (`index.html`) and all static assets
- Assets are organized by type (media, icons, music, pictures)
- Follows standard web application patterns

### 2. **Source Directory**
- Organized by feature/functionality
- Pages are grouped logically (contact forms, project showcases)
- Scripts are modularized for reusability

### 3. **Documentation**
- Centralized in `docs/` directory
- Follows standard documentation practices

### 4. **Configuration Files**
- Kept at root level for easy access by tools
- Docker configuration for containerized deployment

## Benefits of This Structure

1. **Scalability**: Easy to add new features and pages
2. **Maintainability**: Clear separation of concerns
3. **Developer Experience**: Intuitive file organization
4. **Deployment**: Ready for modern deployment platforms
5. **Standards Compliance**: Follows industry best practices

## File Naming Conventions

- Use kebab-case for HTML files
- Prefix related files with common names (e.g., `contact-form-*`)
- Group similar functionality in subdirectories
- Use descriptive names that indicate purpose

## Path Resolution

The server is configured to:
1. First look for files in the `public/` directory
2. Fall back to `src/pages/` for page routes
3. Serve `public/index.html` as the default route
