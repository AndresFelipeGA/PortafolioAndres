// PC: girar -> pulsar botón -> ¿pantalla sigue encendida al llegar? -> arrastrar -> ¿se apaga?
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'], protocolTimeout: 600000 });
const page = await browser.newPage(); await page.setViewport({ width: 1600, height: 900 });
await page.goto('http://127.0.0.1:8765/index.html?model=assets/models/test-final.glb', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 120000, polling: 250 });
await new Promise(r => setTimeout(r, 8000));
const flags = { 2: 'projectsButtonClicked', 3: 'contactButtonClicked', 6: 'aboutMeDuplicateButtonClicked' };
async function drag(dx) {
  await page.mouse.move(800, 450); await page.mouse.down();
  for (let k = 1; k <= 12; k++) { await page.mouse.move(800 + k * dx, 450); await new Promise(r => setTimeout(r, 16)); }
  await page.mouse.up(); await page.mouse.move(5, 5);
}
const rows = [];
for (const b of [6, 2, 3]) {
  await drag(20);                     // el usuario venía girando
  await new Promise(r => setTimeout(r, 800));
  const btn = (await page.$$('.floating-buttons-container .floating-button'))[b - 1];
  await btn.click(); await page.mouse.move(5, 5);
  await new Promise(r => setTimeout(r, 5000));
  const onAfterArrive = await page.evaluate(f => eval(f), flags[b]);
  await drag(-25);                    // ahora sí mueve la cámara a propósito
  await new Promise(r => setTimeout(r, 2500));
  const onAfterDrag = await page.evaluate(f => eval(f), flags[b]);
  rows.push({ boton: b, pantalla: flags[b], encendidaAlLlegar: onAfterArrive, encendidaTrasArrastrar: onAfterDrag });
}
console.table(rows);
await browser.close();
