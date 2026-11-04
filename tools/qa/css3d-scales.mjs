// Lista cada objeto CSS3D: página del iframe, tamaño en px y deformación (scale.x / scale.y).
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--mute-audio'] });
const page = await browser.newPage(); await page.setViewport({ width: 1600, height: 900 });
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof model !== 'undefined' && model !== null, { timeout: 120000, polling: 250 });
await new Promise(r => setTimeout(r, 8000));
const rows = await page.evaluate(() => {
  const scenes = { css3dScene: css3dScene, aboutMe: window.aboutMeScene, aboutMeDuplicate: window.aboutMeDuplicateScene,
    aboutMe2: window.aboutMe2Scene, projects: window.projectsScene, contact: window.contactScene, community: window.communityScene };
  const out = [];
  for (const [k, sc] of Object.entries(scenes)) {
    if (!sc) continue;
    sc.traverse(o => { if (o.isCSS3DObject) {
      const f = o.element.querySelector('iframe') || o.element;
      out.push({ escena: k, pagina: (f.getAttribute('src') || '').split('/').pop(),
        px: `${parseInt(f.style.width)}x${parseInt(f.style.height)}`,
        deformacion: +(o.scale.x / o.scale.y).toFixed(3),
        planoAspecto: +((o.scale.x * parseInt(f.style.width)) / (o.scale.y * parseInt(f.style.height))).toFixed(3) });
    } });
  }
  return out;
});
console.table(rows);
await browser.close();
