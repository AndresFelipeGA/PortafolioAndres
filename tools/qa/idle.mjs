// Mide consumo con el visitante quieto (sin tocar nada) en el sitio publicado.
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'],
  defaultViewport: { width: 1600, height: 900 }, protocolTimeout: 900000 });
const page = await browser.newPage();
await page.goto('https://andresfelipega.github.io/PortafolioAndres/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 900000, polling: 250 });
await new Promise(r => setTimeout(r, 15000));
const cdp = await page.createCDPSession(); await cdp.send('Performance.enable');
const get = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
const f0 = await page.evaluate(() => renderer.info.render.frame);
const a = await get(); await new Promise(r => setTimeout(r, 10000)); const b = await get();
const f1 = await page.evaluate(() => renderer.info.render.frame);
const wall = b.Timestamp - a.Timestamp;
console.log(JSON.stringify({
  framesRenderedIdle_per_s: +((f1 - f0) / wall).toFixed(1),
  mainThreadBusyPct: +(100 * (b.TaskDuration - a.TaskDuration) / wall).toFixed(1),
  scriptPct: +(100 * (b.ScriptDuration - a.ScriptDuration) / wall).toFixed(1),
  layoutsPerS: +((b.LayoutCount - a.LayoutCount) / wall).toFixed(1),
  jsHeapMB: Math.round(b.JSHeapUsedSize / 1e6), frames: await page.evaluate(() => document.querySelectorAll('iframe').length),
}));
await browser.close();
