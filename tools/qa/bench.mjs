// Benchmark: load time, FPS while orbiting, renderer stats, screenshots.
// Usage: node bench.mjs <label> <url>
import puppeteer from 'puppeteer-core';
import path from 'node:path';

const [,, label, url] = process.argv;
const outDir = path.dirname(new URL(import.meta.url).pathname) + '/shots';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--enable-webgl',
         '--autoplay-policy=no-user-gesture-required', '--mute-audio'],
  defaultViewport: { width: 1600, height: 900 },
  protocolTimeout: 900000,
});
const page = await browser.newPage();
page.on('pageerror', e => console.log('[pageerror]', e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 200)); });

const t0 = Date.now();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 900000, polling: 250 });
const loadMs = Date.now() - t0;
await new Promise(r => setTimeout(r, 4000)); // let first frames / shader compile settle

const bbox = await page.evaluate(() => {
  const b = new THREE.Box3().setFromObject(model); const f = v => v.toArray().map(x => +x.toFixed(2));
  return { pos: f(model.position), min: f(b.min), max: f(b.max) };
});
console.log('bbox', JSON.stringify(bbox));
const gpu = await page.evaluate(() => {
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
});

// Fixed camera pose for comparable screenshots
const pose = { p: [0, 5, 10], t: [0, 0, 0] };
async function shot(name, p, t) {
  await page.evaluate((p, t) => {
    if (typeof cameraAnimation !== 'undefined') cameraAnimation.enabled = false;
    controls.enableDamping = false; controls.enabled = true;
    camera.position.set(...p); controls.target.set(...t); camera.lookAt(...t); controls.update();
  }, p, t);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${outDir}/${label}-${name}.png` });
}
await shot('front', pose.p, pose.t);
await shot('wide', [25, 20, 25], [0, 0, 0]);
await shot('close', [6, 3, 6], [0, 0, 0]);
if (process.env.SHOTS_ONLY) { await browser.close(); process.exit(0); }

// FPS while orbiting the camera for 6s
const perf = await page.evaluate(() => new Promise(resolve => {
  const start = performance.now(); let frames = 0; let worst = 0; let last = start;
  if (typeof cameraAnimation !== 'undefined') cameraAnimation.enabled = false; controls.enableDamping = false; camera.position.set(25, 20, 25); controls.target.set(0, 0, 0); camera.lookAt(0, 0, 0); const r = Math.hypot(25, 25);
  function tick(now) {
    frames++; worst = Math.max(worst, now - last); last = now;
    const a = (now - start) / 6000 * Math.PI * 2;
    camera.position.x = Math.sin(a) * r; camera.position.z = Math.cos(a) * r; camera.lookAt(0, 0, 0);
    if (now - start < 6000) requestAnimationFrame(tick);
    else resolve({ fps: +(frames / ((now - start) / 1000)).toFixed(1), worstFrameMs: +worst.toFixed(1),
      calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
      textures: renderer.info.memory.textures, geometries: renderer.info.memory.geometries });
  }
  requestAnimationFrame(tick);
}));
const heap = await page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null);
console.log(JSON.stringify({ label, loadMs, gpu, ...perf, jsHeapMB: heap }));
await browser.close();
