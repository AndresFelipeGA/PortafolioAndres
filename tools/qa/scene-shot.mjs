// Pulsa uno o varios botones del menú y captura la pantalla 3D resultante (PC o iPhone).
// Uso: node scene-shot.mjs <url> <botones ej. "1" o "4,2"> <out.png> [iphone]
import puppeteer, { KnownDevices } from 'puppeteer-core';
const [,, url, btnStr, out, dev] = process.argv;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'], protocolTimeout: 600000 });
const page = await browser.newPage();
if (dev) await page.emulate(KnownDevices['iPhone 15 Pro Max']); else await page.setViewport({ width: 1600, height: 900 });
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 120)));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 120000, polling: 250 });
await new Promise(r => setTimeout(r, 8000));
for (const b of btnStr.split(',')) {
  const buttons = await page.$$('.floating-buttons-container .floating-button');
  const el = buttons[Number(b) - 1];
  if (dev) await el.tap(); else await el.click();
  await page.mouse.move(5, 5);
  await new Promise(r => setTimeout(r, 4500));
}
await page.screenshot({ path: out });
console.log(JSON.stringify({ errs }));
await browser.close();
