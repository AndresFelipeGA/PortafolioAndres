// Downsize low-information textures (near-flat) based on their compressed size.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
const [,, input, output] = process.argv;
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(input);
let saved = 0, n256 = 0, n512 = 0;
for (const tex of doc.getRoot().listTextures()) {
  const img = tex.getImage(); const [w, h] = tex.getSize() || [0, 0];
  if (!img || Math.max(w, h) < 1024) continue;
  const kb = img.byteLength / 1024;
  const target = kb < 10 ? 256 : kb < 30 ? 512 : 0;
  if (!target) continue;
  const out = await sharp(Buffer.from(img)).resize(target, target, { fit: 'inside' }).webp({ quality: 90 }).toBuffer();
  tex.setImage(new Uint8Array(out)).setMimeType('image/webp');
  saved += (w * h - target * target) * 4 * 1.33 / 1e6;
  target === 256 ? n256++ : n512++;
}
await io.write(output, doc);
console.log(`→256: ${n256}, →512: ${n512}, VRAM ahorrada ≈ ${saved.toFixed(0)} MB`);
