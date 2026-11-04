#!/usr/bin/env bash
# Optimiza el modelo 3D original para la web.
# Uso: bash optimize.sh <original.glb> <salida.glb>
#
# Decisiones (verificadas con capturas comparativas y benchmark, nov 2026):
#  - --instance false: Three.js r132 NO soporta EXT_mesh_gpu_instancing.
#  - --simplify false: incluso con error 0.0001 deformaba superficies curvas
#    (capó del carro). En GPU integrada el cuello de botella eran las draw calls,
#    no los triángulos, así que simplificar no mejoraba los FPS.
#  - meshopt + WebP: soportados por GLTFLoader r132 (requiere meshopt_decoder.js).
#  - downsize-flat.mjs: texturas casi planas (poco detalle) a 256/512 px para ahorrar VRAM.
set -euo pipefail
IN="$1"; OUT="$2"; TMP="$(mktemp --suffix=.glb)"
cd "$(dirname "$0")"
npx gltf-transform optimize "$IN" "$TMP" \
  --instance false --simplify false \
  --compress meshopt --texture-compress webp --texture-size 2048
node downsize-flat.mjs "$TMP" "$OUT"
rm -f "$TMP"
npx gltf-transform inspect "$OUT" | head -30
