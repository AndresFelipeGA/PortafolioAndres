// Simula el desajuste de iOS: la capa CSS3D con otro alto que el lienzo WebGL sin evento resize.
// Antes: Community queda más chica y corrida. Con syncRendererSizes() debe corregirse sola.
import puppeteer, { KnownDevices } from 'puppeteer-core';
const [,, url, out] = process.argv;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'], protocolTimeout: 600000 });
const page = await browser.newPage();
await page.emulate(KnownDevices['iPhone 15 Pro Max']);
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 120000, polling: 250 });
await new Promise(r => setTimeout(r, 8000));
const buttons = await page.$$('.floating-buttons-container .floating-button');
await buttons[3].tap(); // Community
await new Promise(r => setTimeout(r, 4500));
const before = await page.evaluate(() => {
  css3dRenderer.setSize(window.innerWidth, window.innerHeight - 120); // desajuste artificial
  return css3dRenderer.getSize();
});
await new Promise(r => setTimeout(r, 1500));
const after = await page.evaluate(() => ({ css: css3dRenderer.getSize(), win: [innerWidth, innerHeight] }));
await page.screenshot({ path: out });
console.log(JSON.stringify({ forzado: before, despues: after }));
await browser.close();
