// Carga la página 25 s y lista errores JS, peticiones fallidas y si el modelo cargó.
// Uso: node errors.mjs <url> [iphone]
import puppeteer, { KnownDevices } from 'puppeteer-core';
const [,, url, dev] = process.argv;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'] });
const page = await browser.newPage();
if (dev) await page.emulate(KnownDevices['iPhone 15 Pro Max']); else await page.setViewport({ width: 1600, height: 900 });
const out = [];
page.on('pageerror', e => out.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('requestfailed', r => out.push('[failed] ' + r.url().slice(0, 120) + ' ' + (r.failure() || {}).errorText));
page.on('response', r => { if (r.status() >= 400) out.push(`[${r.status()}] ${r.url().slice(0, 120)}`); });
await page.goto(url, { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 25000));
const loaded = await page.evaluate(() => typeof model !== 'undefined' && model !== null).catch(() => 'eval error');
console.log('modelo cargado:', loaded);
console.log([...new Set(out)].join('\n'));
await browser.close();
