#!/usr/bin/env bash
# Genera el modelo 3D liviano para celular a partir del ORIGINAL.
# Uso: bash optimize-mobile.sh <original.glb> <salida.glb>
#
# Decisiones (verificadas con capturas comparativas, nov 2026):
#  - Simplificación POR OBJETO antes de fusionar mallas (error relativo al tamaño
#    de cada objeto). Simplificar después de fusionar deformaba superficies.
#  - Superficies brillantes (clearcoat / muy lisas) NO se simplifican: el capó
#    del carro mostraba ondas en los reflejos.
#  - Texturas un nivel menos: >=2048 -> 1024, 1024 -> 512.
#  - Resultado: ~45MB, ~4.5M triángulos, ~324MB VRAM (PC: 91MB, 10.5M, 774MB).
set -euo pipefail
IN="$1"; OUT="$2"
cd "$(dirname "$0")"
T1="$(mktemp --suffix=.glb)"; T2="$(mktemp --suffix=.glb)"
export NODE_OPTIONS=--max-old-space-size=9000
node mobile-simplify.mjs "$IN" "$T1" 0.002
node mobile-textures.mjs "$T1" "$T2"
npx gltf-transform optimize "$T2" "$OUT" \
  --instance false --simplify false \
  --compress meshopt --texture-compress webp --texture-size 1024
rm -f "$T1" "$T2"
npx gltf-transform inspect "$OUT" | head -30
