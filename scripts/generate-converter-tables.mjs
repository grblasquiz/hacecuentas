// ────────────────────────────────────────────────────────────────────────────
// generate-converter-tables.mjs
// Genera src/lib/converter-tables.json = tablas de "conversiones comunes" para
// los conversores de unidades más buscados. Server-rendered en [...slug].astro
// → la respuesta a "cuánto es 10 cm en pulgadas" queda CRAWLEABLE (Bing/AEO),
// que antes no existía en ningún conversor.
//
// Factores hand-verified contra cada fórmula (src/lib/formulas/conversor-*.ts)
// para que la tabla NUNCA contradiga el resultado interactivo del calc.
// Conversor de unidades = el slug "X-a-Y" define la dirección "ida".
// ────────────────────────────────────────────────────────────────────────────
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEF = [1, 2, 3, 5, 10, 20, 50, 100];

// slug (sin 'calculadora-conversor-'), from, to, abreviatura from, abreviatura to,
// conv(x), decimales, [samples], [tipo]
const C = [
  // ── Longitud ──
  ['centimetros-a-pulgadas', 'centímetros', 'pulgadas', 'cm', 'in', x => x * 0.393701, 3],
  ['pulgadas-a-centimetros', 'pulgadas', 'centímetros', 'in', 'cm', x => x * 2.54, 2],
  ['metros-a-pies', 'metros', 'pies', 'm', 'ft', x => x * 3.28084, 3],
  ['pies-a-metros', 'pies', 'metros', 'ft', 'm', x => x * 0.3048, 3],
  ['kilometros-a-millas', 'kilómetros', 'millas', 'km', 'mi', x => x * 0.621371, 3],
  ['millas-a-kilometros', 'millas', 'kilómetros', 'mi', 'km', x => x * 1.609344, 3],
  ['metros-a-yardas', 'metros', 'yardas', 'm', 'yd', x => x * 1.093613, 3],
  ['yardas-a-metros', 'yardas', 'metros', 'yd', 'm', x => x * 0.9144, 3],
  ['milimetros-a-pulgadas', 'milímetros', 'pulgadas', 'mm', 'in', x => x * 0.0393701, 4],
  ['pulgadas-a-milimetros', 'pulgadas', 'milímetros', 'in', 'mm', x => x * 25.4, 1],
  // ── Peso ──
  ['kilogramos-a-libras', 'kilogramos', 'libras', 'kg', 'lb', x => x * 2.204623, 3],
  ['libras-a-kilogramos', 'libras', 'kilogramos', 'lb', 'kg', x => x * 0.453592, 3],
  ['gramos-a-onzas', 'gramos', 'onzas', 'g', 'oz', x => x * 0.035274, 4],
  ['onzas-a-gramos', 'onzas', 'gramos', 'oz', 'g', x => x * 28.349523, 2],
  ['kilogramos-a-gramos', 'kilogramos', 'gramos', 'kg', 'g', x => x * 1000, 0],
  ['libras-a-onzas', 'libras', 'onzas', 'lb', 'oz', x => x * 16, 1],
  // ── Temperatura (offset, no factor) ──
  ['celsius-a-fahrenheit', 'Celsius', 'Fahrenheit', '°C', '°F', x => x * 1.8 + 32, 1, [-10, 0, 10, 20, 25, 30, 37, 100], 'temp'],
  ['fahrenheit-a-celsius', 'Fahrenheit', 'Celsius', '°F', '°C', x => (x - 32) / 1.8, 1, [0, 32, 50, 68, 98.6, 100, 150, 212], 'temp'],
  // ── Volumen ──
  ['litros-a-galones', 'litros', 'galones (US)', 'L', 'gal', x => x * 0.264172, 3],
  ['galones-a-litros', 'galones (US)', 'litros', 'gal', 'L', x => x * 3.785412, 2],
  // ── Velocidad ──
  ['kmh-a-mph', 'km/h', 'mph', 'km/h', 'mph', x => x * 0.621371, 2],
  ['mph-a-kmh', 'mph', 'km/h', 'mph', 'km/h', x => x * 1.609344, 2],
  ['nudos-a-kmh', 'nudos', 'km/h', 'kn', 'km/h', x => x * 1.852, 2],
  ['ms-a-kmh', 'metros/segundo', 'km/h', 'm/s', 'km/h', x => x * 3.6, 2],
  ['kmh-a-ms', 'km/h', 'metros/segundo', 'km/h', 'm/s', x => x * 0.277778, 3],
  // ── Datos (decimal, 1 GB = 1000 MB, igual que la fórmula) ──
  ['gb-a-mb', 'gigabytes', 'megabytes', 'GB', 'MB', x => x * 1000, 0],
  ['mb-a-gb', 'megabytes', 'gigabytes', 'MB', 'GB', x => x * 0.001, 3, [100, 250, 500, 1000, 2000, 5000, 10000, 50000]],
  // ── Superficie ──
  ['metros-cuadrados-a-pies-cuadrados', 'metros cuadrados', 'pies cuadrados', 'm²', 'ft²', x => x * 10.76391, 3],
  ['pies-cuadrados-a-metros-cuadrados', 'pies cuadrados', 'metros cuadrados', 'ft²', 'm²', x => x * 0.092903, 4],
  ['hectareas-a-metros-cuadrados', 'hectáreas', 'metros cuadrados', 'ha', 'm²', x => x * 10000, 0],
];

const nf = (n, dec) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: dec }).format(n);

const out = {};
for (const [slugTail, from, to, fromU, toU, conv, dec, samples, type] of C) {
  const slug = `calculadora-conversor-${slugTail}`;
  const pts = samples || DEF;
  const rows = pts.map((x) => [nf(x, x % 1 === 0 ? 0 : 1), nf(conv(x), dec)]);
  const one = conv(1);
  const note = type === 'temp'
    ? (slugTail === 'celsius-a-fahrenheit'
        ? '0 °C = 32 °F y 100 °C = 212 °F. La fórmula es °F = °C × 1,8 + 32.'
        : '32 °F = 0 °C y 212 °F = 100 °C. La fórmula es °C = (°F − 32) ÷ 1,8.')
    : `1 ${fromU} = ${nf(one, Math.max(dec, 2))} ${toU}.`;
  out[slug] = { from, to, fromU, toU, note, rows };
}

writeFileSync(join(ROOT, 'src', 'lib', 'converter-tables.json'), JSON.stringify(out, null, 2) + '\n', 'utf-8');
console.log(`[converter-tables] ${Object.keys(out).length} tablas → src/lib/converter-tables.json`);
