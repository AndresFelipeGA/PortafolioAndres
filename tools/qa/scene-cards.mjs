// Abre box.html en la escena (botón 6) y pulsa con el ratón/tap real cada tarjeta visible,
// verifica qué página carga, captura la subpágina y pulsa su botón volver visible.
// Uso: node scene-cards.mjs <url> <outPrefix> [iphone]
import puppeteer, { KnownDevices } from 'puppeteer-core';
const [,, url, outPrefix, dev] = process.argv;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'], protocolTimeout: 600000 });
const page = await browser.newPage();
if (dev) await page.emulate(KnownDevices['iPhone 15 Pro Max']); else await page.setViewport({ width: 1600, height: 900 });
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 120)));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 120000, polling: 250 });
await new Promise(r => setTimeout(r, 8000));
const buttons = await page.$$('.floating-buttons-container .floating-button');
if (dev) await buttons[5].tap(); else await buttons[5].click();
await page.mouse.move(5, 5);
await new Promise(r => setTimeout(r, dev ? 12000 : 4500));
await page.screenshot({ path: outPrefix + '-box.png' });
const frame = page.frames().find(f => f.url().endsWith('box.html'));
// Posición visible de cada tarjeta = proyección del iframe en pantalla (sin transformaciones ocultas):
// la calculamos desde el rect del iframe en la página principal y la posición del elemento en el layout.
const tapAt = async (x, y) => { if (dev) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
const ifr = await page.evaluate(() => { const f = [...document.querySelectorAll('iframe')].find(i => i.src.endsWith('box.html')); const r = f.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
const results = [];
for (const want of ['experience.html', 'skills.html', 'certifications.html']) {
  const c = await frame.evaluate(w => { const t = document.body.style.transform; document.body.style.transform = 'none'; const r = document.querySelector('.card[data-page="' + w + '"]').getBoundingClientRect(); document.body.style.transform = t; return { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }; }, want);
  // El contenido visible no está espejado en X ni en Y respecto al layout (verificado en la captura).
  const sx = ifr.l + c.x * ifr.w, sy = ifr.t + c.y * ifr.h;
  await tapAt(sx, sy);
  await new Promise(r => setTimeout(r, 2500));
  const loaded = await frame.evaluate(() => document.getElementById('contentIframe').getAttribute('src'));
  await page.screenshot({ path: outPrefix + '-' + want.replace('.html', '') + '.png' });
  // back button: top-left of the subpage
  const sub = page.frames().find(f => f.url().endsWith(want));
  let back = null;
  if (sub) {
    const b = await sub.evaluate(() => { const r = document.querySelector('.back-btn').getBoundingClientRect(); return { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }; });
    await tapAt(ifr.l + b.x * ifr.w, ifr.t + b.y * ifr.h);
    await new Promise(r => setTimeout(r, 1500));
    back = await frame.evaluate(() => getComputedStyle(document.getElementById('mainContainer')).display);
  }
  results.push({ want, loaded, backMainDisplay: back });
  if (back !== 'flex') await frame.evaluate(() => goBack());
  await new Promise(r => setTimeout(r, 800));
}
console.log(JSON.stringify({ ifr, results, errs }));
await browser.close();
