// Mide la suavidad de las animaciones de cámara de los 6 botones.
// - startJump/endJump: velocidad del primer/último 8% del viaje vs. velocidad media
//   (1.0 = constante/brusco; cerca de 0 = arranca/frena suave)
// - drift: cuánto se mueve la cámara DESPUÉS de terminar la animación (unidades)
// Uso: node camera-test.mjs <url> [preRotate]
import puppeteer from 'puppeteer-core';
const [,, url, preRotate] = process.argv;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'],
  defaultViewport: { width: 1600, height: 900 }, protocolTimeout: 900000 });
const page = await browser.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message.slice(0, 160)));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 120000, polling: 250 });
await new Promise(r => setTimeout(r, 12000));
const results = [];
for (let i = 0; i < 6; i++) {
  if (preRotate) { // girar con el ratón justo antes de pulsar (deja inercia en los controles)
    await page.mouse.move(800, 450); await page.mouse.down();
    for (let k = 0; k < 8; k++) { await page.mouse.move(800 + k * 25, 450); await new Promise(r => setTimeout(r, 16)); }
    await page.mouse.up();
  }
  await page.evaluate(() => { window.__trace = []; window.__tracing = true;
    (function rec() { if (!window.__tracing) return;
      window.__trace.push({ t: performance.now(), p: camera.position.toArray(), anim: cameraAnimation.enabled });
      requestAnimationFrame(rec); })(); });
  const btn = (await page.$$('.floating-buttons-container .floating-button'))[i];
  await btn.click();
  await page.mouse.move(5, 5);
  await new Promise(r => setTimeout(r, 5000));
  const tr = await page.evaluate(() => { window.__tracing = false; return window.__trace; });
  const animIdx = tr.map((x, k) => x.anim ? k : -1).filter(k => k >= 0);
  if (!animIdx.length) { results.push({ boton: i + 1, error: 'sin animación' }); continue; }
  const a = animIdx[0], b = animIdx[animIdx.length - 1] + 1; // b = primer frame tras terminar
  const seg = tr.slice(a, b + 1);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const total = d(seg[0].p, seg[seg.length - 1].p), dur = seg[seg.length - 1].t - seg[0].t;
  const avgV = total / dur;
  const speedAt = (k0, k1) => d(seg[k0].p, seg[k1].p) / Math.max(1, seg[k1].t - seg[k0].t);
  const w = Math.max(1, Math.round(seg.length * 0.08));
  const startJump = speedAt(0, w) / avgV, endJump = speedAt(seg.length - 1 - w, seg.length - 1) / avgV;
  const endPose = tr[b].p, after = tr.slice(b);
  const drift = Math.max(...after.map(x => d(x.p, endPose)));
  results.push({ boton: i + 1, viaje: +total.toFixed(2), ms: Math.round(dur),
    startJump: +startJump.toFixed(2), endJump: +endJump.toFixed(2), driftTrasLlegar: +drift.toFixed(3) });
}
console.table(results);
if (errors.length) console.log('errores', errors);
await browser.close();
