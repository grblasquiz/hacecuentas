// Genera los assets de la ficha de wordpress.org (icon, banner, screenshot)
// desde SVG con sharp. Salida en wordpress-plugin/assets/ (van al SVN /assets,
// NO al zip del plugin). Correr: node wordpress-plugin/build-assets.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'assets');
const BLUE = '#2563eb';
const BLUE_DARK = '#1e40af';
const AMBER = '#f59e0b';
const INK = '#0f172a';
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

// --- Glifo de calculadora (grupo SVG reutilizable, lienzo base 256) ---
function calcGlyph(tx, ty, s) {
  return `<g transform="translate(${tx},${ty}) scale(${s})">
    <rect x="56" y="36" width="144" height="184" rx="20" fill="#ffffff"/>
    <rect x="72" y="52" width="112" height="44" rx="10" fill="${INK}"/>
    <rect x="92" y="68" width="72" height="12" rx="6" fill="#38bdf8"/>
    ${[112, 146, 180]
      .map((y) =>
        [72, 114, 156]
          .map((x) => {
            const accent = x === 156 && y === 180;
            return `<rect x="${x}" y="${y}" width="28" height="24" rx="7" fill="${
              accent ? AMBER : '#cbd5e1'
            }"/>`;
          })
          .join('')
      )
      .join('')}
  </g>`;
}

// --- ICON 256 (resize a 128) ---
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${BLUE}"/><stop offset="1" stop-color="${BLUE_DARK}"/>
  </linearGradient></defs>
  <rect width="256" height="256" rx="56" fill="url(#g)"/>
  ${calcGlyph(0, 0, 1)}
</svg>`;

// --- BANNER 1544x500 (resize a 772x250) ---
const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1544" height="500" viewBox="0 0 1544 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${BLUE}"/><stop offset="1" stop-color="${BLUE_DARK}"/>
  </linearGradient></defs>
  <rect width="1544" height="500" fill="url(#bg)"/>
  <g font-family='${FONT}'>
    <text x="96" y="210" font-size="104" font-weight="800" fill="#ffffff">Hacé Cuentas</text>
    <text x="100" y="282" font-size="46" font-weight="600" fill="#dbeafe">Calculadoras para tu sitio, en un clic</text>
    <text x="100" y="344" font-size="32" font-weight="500" fill="#bfdbfe">+2.700 calculadoras · gratis · sin registro · sin código</text>
  </g>
  <!-- chips flotantes (a la izquierda de la calculadora, sin solaparse) -->
  <g font-family='${FONT}' font-size="30" font-weight="700">
    <rect x="952" y="120" width="300" height="64" rx="32" fill="#ffffff"/>
    <text x="984" y="161" fill="${BLUE_DARK}">Monotributo</text>
    <rect x="1000" y="215" width="208" height="64" rx="32" fill="#ffffff"/>
    <text x="1032" y="256" fill="${BLUE_DARK}">Aguinaldo</text>
    <rect x="952" y="310" width="168" height="64" rx="32" fill="#ffffff"/>
    <text x="984" y="351" fill="${BLUE_DARK}">Sueldo</text>
  </g>
  ${calcGlyph(1290, 150, 0.8)}
</svg>`;

// --- SCREENSHOT 1: mock del bloque en el editor (1280x860) ---
// Chips en posiciones fijas (2 columnas) → sin overflow ni colisiones.
const COL = [448, 832];
const popular = [
  ['Sueldo en mano', 0, 380], ['Monotributo 2026', 1, 380],
  ['Aguinaldo (SAC)', 0, 442], ['Indemnización', 1, 442],
  ['Cuota de préstamo', 0, 504], ['Interés compuesto', 1, 504],
];
const chips = popular
  .map(([label, col, cy]) => {
    const w = label.length * 13 + 52;
    const cx = COL[col];
    return `<rect x="${cx - w / 2}" y="${cy - 26}" width="${w}" height="52" rx="26" fill="#eff6ff" stroke="${BLUE}" stroke-width="1.5"/>
      <text x="${cx}" y="${cy + 8}" font-size="24" font-weight="600" fill="${BLUE_DARK}" text-anchor="middle">${label}</text>`;
  })
  .join('');
const shotSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="860" viewBox="0 0 1280 860">
  <rect width="1280" height="860" fill="#f1f5f9"/>
  <rect x="160" y="130" width="960" height="600" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <g font-family='${FONT}' text-anchor="middle">
    ${calcGlyph(589, 145, 0.4)}
    <text x="640" y="296" font-size="34" font-weight="800" fill="${INK}">Calculadora Hacé Cuentas</text>
    <text x="640" y="334" font-size="22" font-weight="500" fill="#64748b">Elegí una de las más usadas o buscá entre más de 2700.</text>
  </g>
  ${chips}
  <rect x="340" y="564" width="600" height="56" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <text x="364" y="599" font-family='${FONT}' font-size="23" fill="#94a3b8">¿Otra? Buscá todas…</text>
  <text x="640" y="676" font-family='${FONT}' font-size="22" font-weight="600" fill="${BLUE}" text-anchor="middle">Ver todas las calculadoras ↗</text>
</svg>`;

// --- SCREENSHOT 2: calculadora embebida con resultado (fiel al embed real) ---
const shot2Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="860" viewBox="0 0 1280 860">
  <rect width="1280" height="860" fill="#f1f5f9"/>
  <rect x="190" y="90" width="900" height="640" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  ${calcGlyph(196, 118, 0.16)}
  <g font-family='${FONT}'>
    <text x="252" y="160" font-size="30" font-weight="800" fill="${INK}">Calculadora de IMC</text>
    <text x="1050" y="158" font-size="22" font-weight="700" fill="${BLUE}" text-anchor="end">por Hacé Cuentas ↗</text>
    <text x="230" y="212" font-size="19" fill="#64748b">Revisado por: Martín Rodríguez · Última revisión: 15 jun 2026</text>

    <text x="230" y="266" font-size="20" font-weight="600" fill="#334155">Peso</text>
    <rect x="230" y="282" width="370" height="58" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <text x="252" y="320" font-size="26" fill="${INK}">72</text>
    <rect x="534" y="294" width="54" height="34" rx="7" fill="#f1f5f9"/>
    <text x="561" y="318" font-size="20" fill="#64748b" text-anchor="middle">kg</text>

    <text x="650" y="266" font-size="20" font-weight="600" fill="#334155">Altura</text>
    <rect x="650" y="282" width="370" height="58" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <text x="672" y="320" font-size="26" fill="${INK}">175</text>
    <rect x="952" y="294" width="56" height="34" rx="7" fill="#f1f5f9"/>
    <text x="980" y="318" font-size="20" fill="#64748b" text-anchor="middle">cm</text>

    <rect x="230" y="372" width="790" height="172" rx="12" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>
    <text x="625" y="430" font-size="24" font-weight="600" fill="#15803d" text-anchor="middle">Tu IMC</text>
    <text x="625" y="492" font-size="58" font-weight="800" fill="#16a34a" text-anchor="middle">23,5</text>
    <text x="625" y="528" font-size="22" font-weight="600" fill="#15803d" text-anchor="middle">Peso normal · rango saludable 18,5 – 24,9</text>

    <rect x="230" y="572" width="790" height="96" rx="12" fill="#eff6ff" stroke="${BLUE}" stroke-width="1.5"/>
    <text x="256" y="612" font-size="22" font-weight="700" fill="${INK}">¿Tenés una web? Incrustá esta calculadora gratis</text>
    <text x="256" y="644" font-size="18" fill="#64748b">Gratis — copiá el código y pegalo en tu sitio</text>
    <rect x="800" y="595" width="195" height="52" rx="10" fill="${BLUE}"/>
    <text x="897" y="628" font-size="21" font-weight="700" fill="#ffffff" text-anchor="middle">Embeber</text>
  </g>
</svg>`;

async function run() {
  await sharp(Buffer.from(iconSvg)).resize(256, 256).png().toFile(join(OUT, 'icon-256x256.png'));
  await sharp(Buffer.from(iconSvg)).resize(128, 128).png().toFile(join(OUT, 'icon-128x128.png'));
  await sharp(Buffer.from(bannerSvg)).resize(1544, 500).png().toFile(join(OUT, 'banner-1544x500.png'));
  await sharp(Buffer.from(bannerSvg)).resize(772, 250).png().toFile(join(OUT, 'banner-772x250.png'));
  await sharp(Buffer.from(shotSvg)).resize(1280, 860).png().toFile(join(OUT, 'screenshot-1.png'));
  await sharp(Buffer.from(shot2Svg)).resize(1280, 860).png().toFile(join(OUT, 'screenshot-2.png'));
  console.log('Assets generados en', OUT);
}
run().catch((e) => { console.error(e); process.exit(1); });
