# CLAUDE.md — Portafolio 3D de Andrés

Guía viva del proyecto. **Léela antes de tocar código y actualízala al terminar cada tarea**
(sección "Lecciones aprendidas" y lo que haya cambiado). Idioma de trabajo con el dueño: español.

## Qué es y dónde corre

- Portafolio interactivo 3D (cafetería colombiana) hecho con **Three.js r132** (scripts globales
  `examples/js`, NO módulos ES). Sitio **100% estático**.
- Producción: **GitHub Pages** → https://andresfelipega.github.io/PortafolioAndres/ publicado desde
  la rama **`main`**, carpeta raíz. Cada push a `main` despliega (~1 min). Verificar con
  `gh api repos/AndresFelipeGA/PortafolioAndres/actions/runs --jq '.workflow_runs[0]'`.
- Flujo: trabajar en una rama (`feat/...`, `perf/...`), verificar, fast-forward a `main`, push.
  El dueño autorizó publicar mejoras verificadas en `main`.
- Restos de setups viejos que **no se usan en producción**: `server.js`, `Dockerfile*`,
  `docker-compose.yml`, `railway.toml`, `public/`, `src/`, `assets/scripts/secure-model-loader.js`.
  El Railway/Node viejo está en el tag `backup/main-railway-legacy`. Vercel sigue conectado al repo
  (deploys de preview), pero no sirve el sitio.

## Modelos 3D (lo más pesado del sitio)

| Archivo | Dónde | Uso |
|---|---|---|
| `modelo3d.glb` (532 MB, original) | Cloudflare R2 `pub-3eee7465d9374f15a9c4a6192489c0b1.r2.dev` | respaldo final en PC |
| `modelo3d-optimizado.glb` (91 MB) | R2 (lo sube el dueño a mano desde el dashboard) | PC |
| `assets/models/modelo3d-movil.glb` (45 MB) | GitHub Pages (en el repo, **excluido de LFS**) | celular |

- Original y optimizado de PC están también en `private-assets/` (git-ignorado, local).
- Regenerar: `tools/model-optimization/optimize.sh` (PC) y `optimize-mobile.sh` (celular).
  Ambos documentan por qué se tomó cada decisión (no instancing en r132, no simplificar después
  de fusionar mallas, no simplificar superficies con clearcoat, etc.).
- **R2 CORS solo permite el origen `https://andresfelipega.github.io`**: desde localhost el modelo
  de R2 falla por CORS. Para probar local: `index.html?model=assets/models/<archivo>.glb`
  (solo rutas relativas dentro de `assets/`). `assets/models/test-*.glb` y `original-test.glb`
  son enlaces locales para pruebas (en `.git/info/exclude`).
- Celular: `?forceMobile=true` fuerza el modo celular en PC.
- Respaldo automático: PC optimizado→original; celular móvil→optimizado de PC.
- **Centrado del modelo fijo** (`model.position.set(-12.0106…, -14.2226…, 7.8104…)`): toda la
  navegación (cámara, pantallas CSS3D) usa coordenadas absolutas basadas en ese centrado. No
  volver a calcularlo con `Box3.setFromObject` (en r132 la caja es aproximada y cambia al fusionar
  mallas aunque la geometría no se mueva).

## Arquitectura de `index.html` (monolito de ~7500 líneas)

- `init()` crea escena/cámara/renderer/OrbitControls; `loadModel()` carga el GLB; `animate()` es
  el bucle. **`init()`/`animate()` corren ANTES de que el script termine de evaluarse**: cualquier
  `const`/`let` de nivel superior declarada más abajo lanza `ReferenceError` (TDZ) si la usan.
  Usar funciones (`function x(){}` se eleva) o constantes locales. (Ya pasó dos veces.)
- **Render bajo demanda**: `assets/scripts/render-scheduler.js`. Solo redibuja si hay actividad
  (cámara, input, `postMessage`, timers, `needsUpdate`, `Object3D.add`); en reposo 1 fps de
  seguridad. `RenderScheduler.stats` cuenta qué despierta el render (útil para depurar). Los
  `needsUpdate` internos de Three durante el render se ignoran (`beginRender/endRender`).
  Si algo animado "se congela", es que su cambio no pasa por esas vías: llamar
  `RenderScheduler.wake()`.
- **Pantallas HTML en 3D**: cada pantalla es un `<iframe>` dentro de un `div` en un
  `THREE.CSS3DObject`, con escena CSS3D propia (`css3dScene`, `window.aboutMeScene`,
  `aboutMeDuplicateScene`, `projectsScene`, `contactScene`, `communityScene`). Un plano negro
  ("cover") en WebGL tapa la pantalla cuando está apagada.
- **Tamaño de cada iframe = 606 × aspecto del plano** para no deformar el texto
  (`scale.x/scale.y ≈ 1`). El `div` contenedor debe tener el MISMO ancho que el iframe (si no, la
  pantalla se descentra). Medir con `tools/qa/css3d-scales.mjs`.

  | Botón | Página | Iframe |
  |---|---|---|
  | 1 | `about-me.html` | 604×606 |
  | 2 | `projects.html` | 884×606 |
  | 3 | `contact-main.html` | 1024×606 |
  | 4 | `community.html` | 993×606 |
  | 5 | `cafe-menu.html` (→ `contact-form-*.html`) | 1000×600 |
  | 6 | `box.html` (→ experience/skills/certifications/credits) | 765×606 |

- **Protocolo con los iframes (no romper)**: el padre envía `postMessage({action})`:
  `turnOnScreen`, `turnOffScreen`, `realMovementDetected`, `userMoving`, `cameraChanged`, ...;
  cada página responde `<nombre>Ready`, `<nombre>ScreenTurnedOn/Off`, `buttonPressed`,
  `formSubmitted`, `simulateContactButton`, `navigateToBox`, etc. Antes de renombrar un id/clase
  en una página, buscar quién lo usa (`getElementById/querySelector` en la página y en index.html).
- **Orientación**: algunas páginas se voltean con `document.body.style.transform`
  (`rotate(180deg) scaleX(-1)` en about-me/box/community; `rotate(180deg)` en projects/contact;
  ninguna en cafe-menu y formularios). Es para compensar la orientación del plano 3D: mantener la
  de cada página tal cual.
- **Detector de "movimiento real"** (listener `change` de OrbitControls en `init`): si la cámara
  se mueve fuera de una animación, apaga las pantallas encendidas. Cualquier movimiento residual
  después de una animación las apagaba.

## Cámara

- Animaciones de los botones: `start*CameraAnimation()` configuran `cameraAnimation`
  (posición/objetivo/duración ~1.8 s); `animate()` interpola con `easeInOutCubic`.
- Al empezar una animación se borra la inercia de OrbitControls (`clearOrbitMomentum()`); si no,
  la inercia previa hacía que la cámara "se pasara" del destino al llegar.
- Varios destinos están fuera del rango vertical normal 10°–80° (About Me 80.2°, segundo About Me
  108.2°, intro 84.2°): al llegar se amplía el rango (`allowCurrentPolarAngle()`) y se restaura
  cuando el usuario vuelve dentro (`restorePolarLimitsIfInside()`).
- Celular: FOV vertical adaptable (`applyResponsiveFov()`) para que el ancho visible sea el de una
  pantalla 16:9; así las pantallas caben en vertical sin tocar coordenadas. En PC el FOV es 45.
- Celular: al llegar a una pantalla, `focusMobileScreen()` ACERCA la cámara (traslación, misma
  orientación) con una animación corta para que la pantalla ocupe ~92% del ancho.
  (Antes se hacía cambiando el FOV; se sustituyó por precaución con Safari.)
- **iOS: lienzo WebGL y capa CSS3D deben tener siempre el mismo tamaño.** iOS cambia el alto de
  la ventana (barra de Safari) a veces SIN evento `resize`, y la capa CSS3D se crea más tarde
  que el lienzo. Con alturas distintas el HTML se proyecta más chico y corrido respecto a su
  marco (síntoma real en iPhone: "la pantalla no cubre el cuadro"). `syncRendererSizes()` lo
  comprueba en cada frame; `refreshCss3dLayers()` fuerza el redibujo de las capas en Safari.
  Reproducible en Chrome con `tools/qa/size-desync-test.mjs`.
- Las páginas de pantalla aplican su volteo también en CSS (`<style>body{transform:…}</style>`):
  si solo lo hace el script, Safari alcanza a mostrarlas sin voltear (se ven invertidas).
- Al terminar una animación, `controls.update()` se llama mientras `cameraAnimation.enabled`
  sigue en true: si no, el primer update emitía `change` contra la pose previa y el detector de
  "movimiento real" apagaba la pantalla recién abierta.
- `box.html`: index.html reenvía los clics al iframe con la X espejada; box.html lo compensa
  buscando la tarjeta en `innerWidth - x`. La cuadrícula de tarjetas debe seguir simétrica.

## Diseño de las pantallas ("Café de origen")

- Sistema compartido: `assets/css/screens.css` (tokens, layout `.screen`, componentes). Referencia:
  `about-me.html`. Papel crema + café tostado, franja tricolor con proporción real de la bandera
  (2:1:1), banda geométrica inspirada en el tejido wayuu, Fraunces + Inter.
- Reglas: texto base ≥16–17 px (mínimo 13 px), objetivos táctiles ≥44–48 px, inputs ≥16 px (evita
  el zoom de iOS), nada que dependa de `:hover`, todo cabe en el iframe sin scroll del documento,
  **sin imágenes de stock** (había una de Shutterstock; todo decorativo se hace con CSS).
- Páginas huérfanas (no enlazadas desde ningún lado): `projects/*.html`, `thank-you.html`.

## Verificación (obligatoria antes de publicar)

Herramientas en `tools/qa/` (Chrome del sistema `/usr/bin/google-chrome` + `puppeteer-core`;
`cd tools/qa && npm i`). Servir el repo: `python3 -m http.server 8765 --bind 127.0.0.1`.

- `bench.mjs <label> <url>`: tiempo de carga, FPS orbitando, draw calls, triángulos, capturas.
  **Comparar FPS solo con la misma trayectoria de cámara** (vista amplia, `lookAt` al centro); una
  vez se reportó "2×" por medir con cámaras distintas.
- `menu-test.mjs <label> <url>`: consumo en reposo + recorrido por los 6 botones con capturas.
  Comparar contra otra versión píxel a píxel (las diferencias dentro de iframes suelen ser
  animaciones CSS propias de la página, no regresiones).
- `camera-test.mjs <url> [rotate]`: suavidad de animaciones (`startJump/endJump` ≈0 = suave) y
  `driftTrasLlegar` (debe ser 0). Con `rotate` gira antes de pulsar (prueba la inercia).
- `mobile-test.mjs <label> <url> [landscape]`: emulación iPhone (toques, FOV, botones, errores).
- `scene-shot.mjs <url> <botones> <out.png> [iphone]`: captura una pantalla 3D concreta.
- `one-page.mjs <url> <w> <h> <out.png>`: una página de pantalla a su tamaño de iframe, sin el
  espejo; reporta desbordes, texto < 13 px y objetivos < 40 px.
- `css3d-scales.mjs <url>`: deformación de cada pantalla CSS3D (debe ser ≈1).
- La GPU de la emulación es la del PC: la fluidez real en celular solo se sabe en un teléfono.

## Entorno y git

- `git-lfs` **no está instalado** pero la config global de git lo exige (`.gitattributes` manda
  `*.glb` a LFS). Usar en cada comando git que toque el árbol:
  `git -c filter.lfs.process= -c filter.lfs.smudge=cat -c filter.lfs.clean=cat -c filter.lfs.required=false ...`
  y `--no-verify` en commit/push (los hooks de LFS fallan). Nunca hay objetos LFS nuevos que subir.
- GitHub Pages **no sirve archivos LFS** (sirve el puntero). Un `.glb` que deba servir Pages debe
  excluirse en `.gitattributes` (`<ruta> -filter -diff -merge -text`). Límite por archivo 100 MB.
- `pkill -f "http.server ..."` termina con código 144 aunque funcione: es normal.
- Heredocs con `page.$$(...)` dentro de comandos bash disparan el chequeo de seguridad de
  borrados: escribir los scripts con la herramienta de archivos y luego ejecutarlos.
- Commits: terminar con la línea de coautoría que indique el sistema.

## Lecciones aprendidas (agregar al final de cada tarea)

- Medir antes de optimizar y verificar visualmente cada cambio con capturas comparativas: la
  simplificación de geometría "inofensiva" deformó el carro; solo se vio al ampliar la captura.
- En r132, un solo material con `transmission > 0` hace que TODA la escena se dibuje dos veces
  por frame. El modelo tenía dos vidrios diminutos así; se cambiaron a transparencia simple.
- El cuello de botella en GPU integrada eran las draw calls (965 mallas), no los triángulos.
- Los textos de los iframes se veían "condensados" por escalas X/Y distintas del CSS3DObject;
  corregir el tamaño del iframe, no la tipografía.
- Antes de publicar algo que dependa de un archivo externo (R2), dejar un respaldo automático para
  que el sitio funcione aunque el archivo todavía no exista.
- La emulación de iPhone en Chrome no reproduce bugs de Safari (WebKit). Playwright WebKit
  necesita `sudo npx playwright install-deps`; sin eso, pedir al dueño que pruebe en su iPhone.
- Los formularios del menú de café "fingían" el envío (enlace a `?sent=true`). Probar flujos de
  negocio de punta a punta, no solo que la UI muestre éxito.
- Preferir arreglos genéricos (render scheduler, FOV adaptable, borrar inercia en un solo lugar)
  sobre tocar cada una de las decenas de funciones duplicadas de `index.html`.
