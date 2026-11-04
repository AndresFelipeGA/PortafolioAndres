// Simplifica cada primitiva por separado (error relativo a su propio tamaño),
// excepto superficies brillantes (clearcoat / muy metálicas y lisas), donde los
// cambios de geometría se notan en los reflejos.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplifyPrimitive } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
const [,, input, output, errStr] = process.argv;
const error = Number(errStr || 0.002);
await MeshoptSimplifier.ready; await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(input);
await doc.transform(weld());
const isGlossy = (mat) => {
  if (!mat) return false;
  if (mat.getExtension('KHR_materials_clearcoat')) return true;
  return mat.getRoughnessFactor() < 0.25 && !mat.getMetallicRoughnessTexture();
};
const tris = (p) => (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3;
let kept = 0, before = 0, after = 0, skippedTris = 0;
for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const t0 = tris(prim); before += t0;
    if (isGlossy(prim.getMaterial())) { kept++; skippedTris += t0; after += t0; continue; }
    simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio: 0, error, lockBorder: true });
    after += tris(prim);
  }
}
await io.write(output, doc);
console.log(`primitivas brillantes sin tocar: ${kept} (${Math.round(skippedTris).toLocaleString()} tris); triángulos ${Math.round(before).toLocaleString()} -> ${Math.round(after).toLocaleString()}`);
