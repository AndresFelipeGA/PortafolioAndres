// Consumo en reposo + recorrido por los 6 botones del menú con capturas.
// Uso: node menu-test.mjs <label> <url>
import puppeteer from 'puppeteer-core';
const [,, label, url] = process.argv;
const dir = new URL('./shots/', import.meta.url).pathname;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'],
  defaultViewport: { width: 1600, height: 900 }, protocolTimeout: 900000 });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 160)));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 900000, polling: 250 });
await new Promise(r => setTimeout(r, 15000));
await page.mouse.move(5, 5); // ratón quieto en una esquina

const cdp = await page.createCDPSession(); await cdp.send('Performance.enable');
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
async function idle(seconds) {
  const f0 = await page.evaluate(() => renderer.info.render.frame); const a = await metrics();
  await new Promise(r => setTimeout(r, seconds * 1000));
  const b = await metrics(); const f1 = await page.evaluate(() => renderer.info.render.frame);
  const wall = b.Timestamp - a.Timestamp;
  return { renderFps: +((f1 - f0) / wall).toFixed(1), cpuMainPct: +(100 * (b.TaskDuration - a.TaskDuration) / wall).toFixed(1) };
}
const idleStart = await idle(10);
await page.screenshot({ path: `${dir}${label}-m0.png` });

const n = await page.$$eval('.floating-buttons-container .floating-button', els => els.length);
for (let i = 0; i < n; i++) {
  const btns = await page.$$('.floating-buttons-container .floating-button');
  await btns[i].click();
  await page.mouse.move(5, 5);
  await new Promise(r => setTimeout(r, 7000)); // animación de cámara (2s) + timers de pantallas
  await page.screenshot({ path: `${dir}${label}-m${i + 1}.png` });
}
const idleAfter = await idle(10);
// Arrastre con el ratón (órbita manual) para comprobar que responde
await page.mouse.move(800, 450); await page.mouse.down();
for (let k = 0; k < 20; k++) { await page.mouse.move(800 + k * 10, 450); await new Promise(r => setTimeout(r, 16)); }
await page.mouse.up(); await page.mouse.move(5, 5);
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: `${dir}${label}-drag.png` });
console.log(JSON.stringify({ label, buttons: n, idleStart, idleAfter, errors }));
await browser.close();
