// Verificación mobile de la leyenda del donut (throwaway — se borra después).
// Carga el calc de despido en vivo a ancho mobile, dispara el cálculo y chequea
// PROGRAMÁTICAMENTE que ningún valor ($) de la leyenda se corte (overflow).
import puppeteer from 'puppeteer-core';

const URL = 'https://hacecuentas.com/calculadora-indemnizacion-despido';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

// Disparar el cálculo: llenar inputs numéricos + selects y clickear "Calcular".
await page.evaluate(() => {
  const root = document.querySelector('.calc-v2') || document;
  root.querySelectorAll('input[type=number], input[inputmode=numeric], input[inputmode=decimal]').forEach((el, i) => {
    el.value = i === 0 ? '1500000' : '5';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  root.querySelectorAll('select').forEach((s) => {
    const opt = [...s.options].find((o) => o.value && o.value !== '');
    if (opt) { s.value = opt.value; s.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  const btn = [...root.querySelectorAll('button')].find((b) => /calcul/i.test(b.textContent || ''));
  if (btn) btn.click();
});

// Esperar a que renderice la leyenda del donut.
let hasDonut = true;
try {
  await page.waitForSelector('.v2-donut-legend .v2-donut-lg', { timeout: 12000 });
} catch { hasDonut = false; }

if (!hasDonut) {
  console.log('NO se renderizó el donut con el trigger automático. Inyecto una leyenda sintética con labels largos para validar el CSS…');
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.className = 'calc-v2';
    host.innerHTML = `<div class="v2-donut" style="max-width:340px"><div class="v2-donut-legend">
      ${['Estabilidad maternidad (Art. 182)', 'Antigüedad (Art. 245)', 'Integración mes despido + SAC', 'Preaviso + SAC'].map((l, i) =>
        `<div class="v2-donut-lg"><span class="sw" style="background:#3b82f6"></span><span class="nm">${l}</span><span class="vl">$24.826.667 · 38%</span></div>`).join('')}
    </div></div>`;
    document.body.appendChild(host);
  });
  await page.waitForSelector('.v2-donut-legend .v2-donut-lg', { timeout: 4000 });
}

// Check programático: para cada row, ¿el .vl queda dentro del row? ¿el row overflowea?
const rows = await page.$$eval('.v2-donut-lg', (els) =>
  els.map((row) => {
    const vl = row.querySelector('.vl');
    const nm = row.querySelector('.nm');
    const rb = row.getBoundingClientRect();
    const vb = vl ? vl.getBoundingClientRect() : null;
    return {
      label: (nm?.textContent || '').slice(0, 40),
      vl: vl?.textContent || '',
      rowOverflow: row.scrollWidth > row.clientWidth + 1,
      vlClipped: vb ? (vb.right > rb.right + 1 || vb.left < rb.left - 1) : true,
      vlVisibleWidth: vb ? Math.round(vb.width) : 0,
    };
  })
);

const bad = rows.filter((r) => r.rowOverflow || r.vlClipped);
console.log(`\nFilas de leyenda: ${rows.length}`);
for (const r of rows) {
  console.log(`  ${r.vlClipped || r.rowOverflow ? '✗' : '✓'} "${r.label}" → vl="${r.vl}" (overflow:${r.rowOverflow} clipped:${r.vlClipped})`);
}
console.log(`\n${bad.length === 0 ? 'PASS ✓ — ningún valor se corta a 390px' : 'FAIL ✗ — ' + bad.length + ' valores cortados'}`);

const donut = await page.$('.v2-donut');
if (donut) await donut.screenshot({ path: '/tmp/donut-mobile-after.png' });
else await page.screenshot({ path: '/tmp/donut-mobile-after.png' });
console.log('screenshot → /tmp/donut-mobile-after.png');

await browser.close();
