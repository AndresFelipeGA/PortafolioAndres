# Interactive 3D Colombian Portfolio

This project creates an interactive 3D portfolio website featuring Colombian cultural elements. The 3D model is the central focus, with all content accessible through interactions with different elements in the model.

## Features

- Interactive 3D model visualization using Three.js
- Click interactions with 3D elements to display content
- Smooth animations using GSAP
- Scroll-triggered camera movements
- Responsive design for different screen sizes
- Loading screen for initial model loading
- Custom cursor and interactive indicators

## Getting Started

1. Open `index.html` in a web browser to view the application.
2. The 3D model (`PortafolioBlend.glb`) will be loaded automatically.
3. Click on interactive elements in the 3D model to display content popups.
4. Scroll to navigate between different views of the model.

## Project Structure

```
PortafolioColombia/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # CSS styles
├── js/
│   ├── main.js             # Main JavaScript file
│   ├── three-setup.js      # Three.js setup and model loading
│   ├── interactions.js     # Interaction handling
│   └── animations.js       # GSAP animations
├── assets/
│   ├── placeholder.html    # Placeholder for required images
│   ├── coffee_region.jpg   # (Required) Image for coffee region popup
│   ├── cartagena.jpg       # (Required) Image for Cartagena popup
│   ├── bogota.jpg          # (Required) Image for Bogotá popup
│   └── amazon.jpg          # (Required) Image for Amazon popup
└── PortafolioBlend.glb     # 3D model file
```

## Customizing the 3D Model

The application expects the 3D model to have interactive elements with names starting with `interactive_`. For example:

- `interactive_coffee_region`
- `interactive_cartagena`
- `interactive_bogota`
- `interactive_amazon`
- `interactive_portfolio`

When creating or modifying your 3D model in Blender:

1. Name objects that should be interactive with the prefix `interactive_`
2. Export the model as a GLB file named `PortafolioBlend.glb`
3. Place the GLB file in the root directory of the project

## Adding Content

To add or modify content for interactive elements:

1. Edit the `getContentForObject` method in `js/interactions.js`
2. Add images to the `assets` directory
3. Update the HTML content for each interactive element

## Required Images

The following images are required for the popups:

- `assets/coffee_region.jpg`
- `assets/cartagena.jpg`
- `assets/bogota.jpg`
- `assets/amazon.jpg`

You can view `assets/placeholder.html` for a visual reference of the required images.

## Technologies Used

- Three.js for 3D rendering
- GSAP for animations
- HTML/CSS/JavaScript for the base structure

## Troubleshooting

If the 3D model doesn't load:
- Check the browser console for errors
- Ensure the model file is named correctly and in the right location
- Verify that the model format is compatible with Three.js GLTFLoader

If interactive elements don't work:
- Check that object names in the 3D model start with `interactive_`
- Check the browser console for errors
- Verify that the required libraries are loading correctly

## Next Steps

- Add more interactive elements to the 3D model
- Enhance animations and transitions
- Add more detailed content for each interactive element
- Optimize performance for mobile devices
- Add sound effects for interactions