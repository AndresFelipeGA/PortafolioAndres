// Reduce texturas un nivel para celular: >=2048 -> 1024, 1024 -> 512. Menores sin cambio.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
const [,, input, output] = process.argv;
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(input);
let n = 0;
for (const tex of doc.getRoot().listTextures()) {
  const img = tex.getImage(); const size = tex.getSize(); if (!img || !size) continue;
  const m = Math.max(...size); const target = m >= 2048 ? 1024 : m === 1024 ? 512 : 0;
  if (!target) continue;
  const s = sharp(Buffer.from(img)).resize(Math.round(size[0] * target / m), Math.round(size[1] * target / m));
  const out = tex.getMimeType() === 'image/jpeg' ? await s.jpeg({ quality: 92 }).toBuffer() : await s.png().toBuffer();
  tex.setImage(new Uint8Array(out)); n++;
}
await io.write(output, doc);
console.log('texturas reducidas:', n);
