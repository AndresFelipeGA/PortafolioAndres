// Emulación iPhone: carga, qué modelo usa, toques en los 6 botones, capturas.
// Uso: node mobile-test.mjs <label> <url> [landscape]
import puppeteer, { KnownDevices } from 'puppeteer-core';
const [,, label, url, orient] = process.argv;
const dir = new URL('./shots/', import.meta.url).pathname;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'], protocolTimeout: 900000 });
const page = await browser.newPage();
const dev = KnownDevices['iPhone 15 Pro Max'];
const vp = orient === 'landscape'
  ? { ...dev.viewport, width: dev.viewport.height, height: dev.viewport.width, isLandscape: true }
  : dev.viewport;
await page.emulate({ userAgent: dev.userAgent, viewport: vp });
const errors = [], glb = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 160)));
page.on('response', r => { if (r.url().includes('.glb')) glb.push(`${r.status()} ${r.url().split('/').pop()}`); });
const t0 = Date.now();
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.screenshot({ path: `${dir}${label}-loading.png` });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 120000, polling: 250 }).catch(async e => { console.log('NO CARGÓ', JSON.stringify(errors)); await browser.close(); process.exit(1); });
const loadMs = Date.now() - t0;
await new Promise(r => setTimeout(r, 8000));
const info = await page.evaluate(() => ({ isMobile, pixelRatio: renderer.getPixelRatio(),
  canvas: [renderer.domElement.width, renderer.domElement.height],
  loadingHidden: getComputedStyle(document.getElementById('loading-container')).display === 'none',
  blockedMsg: /isn't available on mobile/.test(document.body.innerText) }));
await page.screenshot({ path: `${dir}${label}-m0.png` });
const n = await page.$$eval('.floating-buttons-container .floating-button', els => els.length);
const boxes = await page.$$eval('.floating-buttons-container .floating-button', els => els.map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width)]; }));
for (let i = 0; i < n; i++) {
  const b = (await page.$$('.floating-buttons-container .floating-button'))[i];
  await b.tap();
  await new Promise(r => setTimeout(r, 7000));
  await page.screenshot({ path: `${dir}${label}-m${i + 1}.png` });
}
// Gesto de arrastre con un dedo (girar)
const cx = vp.width / 2, cy = vp.height / 2;
const cdp = await page.createCDPSession();
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
await touch('touchStart', cx, cy);
for (let k = 1; k <= 15; k++) { await touch('touchMove', cx + k * 8, cy); await new Promise(r => setTimeout(r, 16)); }
await touch('touchEnd');
await new Promise(r => setTimeout(r, 2500));
await page.screenshot({ path: `${dir}${label}-drag.png` });
console.log(JSON.stringify({ label, loadMs, glb, ...info, buttons: n, buttonBoxes: boxes, errors }));
await browser.close();
