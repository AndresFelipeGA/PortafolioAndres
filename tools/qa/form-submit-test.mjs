// Prueba el envío de los contact-form-*.html SIN mandar correos reales:
// intercepta api.staticforms.xyz y responde éxito o error simulado.
import puppeteer from 'puppeteer-core';
const forms = ['automation', 'consulting', 'freelance', 'mobile', 'software', 'web'];
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--mute-audio'] });
const results = [];
for (const name of forms) {
  for (const mode of ['ok', 'fail']) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 600 });
    const sent = [];
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.url().includes('staticforms.xyz')) {
        if (req.method() === 'OPTIONS') return req.respond({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST' } });
        sent.push(req.postData() || '');
        return req.respond({ status: mode === 'ok' ? 200 : 500, contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' },
          body: JSON.stringify(mode === 'ok' ? { success: true } : { success: false, message: 'simulated' }) });
      }
      req.continue();
    });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(`http://127.0.0.1:8765/contact-form-${name}.html`, { waitUntil: 'networkidle2' });
    const disabledEmpty = await page.$eval('.submit-button', b => b.disabled);
    // Rellenar todos los campos requeridos
    await page.evaluate(() => {
      document.querySelectorAll('#contactForm [required]').forEach(f => {
        if (f.tagName === 'SELECT') f.selectedIndex = Math.min(1, f.options.length - 1);
        else if (f.type === 'email') f.value = 'test@example.com';
        else f.value = 'Prueba automatizada';
        f.dispatchEvent(new Event('input', { bubbles: true }));
        f.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    const disabledFilled = await page.$eval('.submit-button', b => b.disabled);
    const nav = page.waitForNavigation({ timeout: 5000 }).then(() => page.url()).catch(() => null);
    await page.click('.submit-button');
    const navigatedTo = await nav;
    const note = navigatedTo ? null : await page.$eval('#formNote', n => n.textContent.trim());
    const hasService = sent[0] ? /name="service"|service=/.test(sent[0]) || sent[0].includes('accessKey') : false;
    results.push({ form: name, mode, disabledEmpty, disabledFilled, requests: sent.length, includesHidden: hasService,
      result: navigatedTo ? navigatedTo.split('/').pop() : `sin navegar: "${note}"`, errs: errs.length });
    await page.close();
  }
}
console.table(results);
await browser.close();
