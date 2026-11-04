import puppeteer from 'puppeteer-core';
const [,, url, w, h, out] = process.argv;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--mute-audio'] });
const page = await browser.newPage(); await page.setViewport({ width: +w, height: +h });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('requestfailed', r => errs.push('falló ' + r.url()));
await page.goto(url, { waitUntil: 'networkidle2' });
await page.addStyleTag({ content: 'html,body{transform:none!important}' });
await page.evaluate(() => window.postMessage({ action: 'turnOnScreen' }, '*'));
await new Promise(r => setTimeout(r, 1200));
const m = await page.evaluate(() => { const b = document.querySelector('.screen-body');
  return { overflowBody: b ? b.scrollHeight - b.clientHeight : null, docOverflow: document.documentElement.scrollHeight - innerHeight,
    smallText: [...document.querySelectorAll('body *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 13 && e.offsetParent).length,
    smallTargets: [...document.querySelectorAll('a,button,input,select,textarea,[onclick]')].filter(e => e.offsetParent && (e.getBoundingClientRect().height < 40)).map(e => (e.id || e.className || e.tagName) + ':' + Math.round(e.getBoundingClientRect().height)).slice(0, 8) }; });
await page.screenshot({ path: out });
console.log(JSON.stringify({ ...m, errs }));
await browser.close();
