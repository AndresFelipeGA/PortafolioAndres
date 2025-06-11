// INSTRUCCIONES:
// 1. Abre el archivo fixed-advanced-loader.html
// 2. Busca la sección donde se define la pantalla (alrededor de la línea 1250)
// 3. Reemplaza el código existente con este código corregido

// Mantener el tamaño actual del plano
const bigBlockerGeometry = new THREE.PlaneGeometry(2.3, 1.46);

// IMPORTANTE: Definir el material ANTES de usarlo
const bigBlockerMaterial = new THREE.MeshBasicMaterial({
    color: 0x6B4226, // Color café mientras carga
    side: THREE.FrontSide, // IMPORTANTE: Visible desde el frente
    transparent: false
});

// Crear un canvas para el diseño simple con patrón de café
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 768;
const ctx = canvas.getContext('2d');

// Fondo beige claro
ctx.fillStyle = '#E6D2B5'; // Color beige claro
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Cargar y aplicar el patrón de granos de café
const coffeePattern = new Image();
coffeePattern.src = 'images/icons/coffeDisplayBackground.jpg';

coffeePattern.onload = function() {
    // Dibujar el patrón de café a tamaño completo
    ctx.drawImage(coffeePattern, 0, 0, canvas.width, canvas.height);
    
    // Crear textura a partir del canvas
    const screenTexture = new THREE.CanvasTexture(canvas);
    
    // Actualizar material con la textura
    bigBlockerMaterial.map = screenTexture;
    bigBlockerMaterial.needsUpdate = true;
};

// Crear el mesh con la geometría y el material
screenPlane = new THREE.Mesh(bigBlockerGeometry, bigBlockerMaterial);