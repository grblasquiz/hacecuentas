/** Resuelve hallazgos no-YMYL remanentes del lote de fuentes de julio. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(import.meta.dirname, '..');
const dirs = fs.readdirSync(path.join(ROOT, 'src/content')).filter((name) => name.startsWith('calcs'));
const bySlug = new Map();
for (const dir of dirs) for (const file of fs.readdirSync(path.join(ROOT, 'src/content', dir)).filter((name) => name.endsWith('.json'))) {
  const full = path.join(ROOT, 'src/content', dir, file); const calc = JSON.parse(fs.readFileSync(full, 'utf8')); bySlug.set(calc.slug, { full, calc });
}
const release = (entry, resolved) => {
  entry.calc.quarantineReasons = (entry.calc.quarantineReasons || []).filter((reason) => !resolved.includes(reason));
  if (!entry.calc.quarantineReasons.length) {
    for (const key of ['status','noindex','distribution','adsenseEligible','editorialReview','sourceVerified','quarantineReasons']) delete entry.calc[key];
  }
  fs.writeFileSync(entry.full, `${JSON.stringify(entry.calc, null, 2)}\n`);
};
const sourceFixes = {
  'calculadora-costo-envio-compra-exterior': ['ARCA — ayuda sobre envíos internacionales','https://www.arca.gob.ar/envios-internacionales/ayuda/'],
  'calculadora-freelance-tarifa-hora': ['Upwork — investigación sobre trabajo independiente','https://www.upwork.com/research/freelance-forward'],
  'calculadora-presupuesto-50-30-20': ['CFPB — guía para crear un presupuesto','https://www.consumerfinance.gov/about-us/blog/budgeting-how-to-create-a-budget-and-stick-with-it/'],
  'calculadora-rendimiento-fci-money-market': ['CNV — Fondos Comunes de Inversión','https://www.argentina.gob.ar/cnv/proteccion-al-inversor/fondos-comunes-de-inversion'],
};
for (const [slug, [name, url]] of Object.entries(sourceFixes)) {
  const entry = bySlug.get(slug); if (!entry) continue;
  entry.calc.sources = [{ name, url }]; entry.calc.dataUpdate = { ...(entry.calc.dataUpdate || {}), source: name, sourceUrl: url, notes: 'Fuente temática específica; los valores variables se ingresan o verifican al momento del cálculo.' };
  release(entry, ['source-topic-mismatch-bcra']);
}
const descriptions = {
  'calculadora-almacenamiento-video-bitrate-duracion': 'Estimá cuántos GB ocupa un video desde su bitrate y duración, con conversiones claras entre Mbps, minutos, horas y almacenamiento final.',
  'calculadora-bebidas-por-invitado-evento-colombia': 'Calculá litros de agua, gaseosa y bebidas para un evento en Colombia según invitados, duración y margen de seguridad editable.',
  'calculadora-bebidas-por-invitado-evento-republica-dominicana': 'Calculá bebidas para una fiesta en República Dominicana según cantidad de personas, horas del evento y consumo orientativo por invitado.',
};
for (const [slug, description] of Object.entries(descriptions)) { const entry = bySlug.get(slug); if (!entry) continue; entry.calc.description = description; release(entry, ['duplicate-meta-description']); }
const cae = bySlug.get('calculadora-cae-credito-hipotecario-chile-bancos-2026');
if (cae) {
  cae.calc.example = { title: 'Ejemplo de comparación', steps: ['Ingresá capital, plazo y tasa informada.', 'Sumá costos incluidos en el CAE.', 'Compará cuota y costo total para el mismo plazo.'], result: 'La alternativa con menor cuota no siempre tiene menor costo total; revisá ambos resultados.' };
  release(cae, ['missing-solved-example']);
}
for (const slug of ['calculadora-tarjetas-amarillas-acumuladas-suspension','calculadora-vtv-vencimiento-turno','calculadora-suspension-altura-libre-piso-auto']) {
  const entry = bySlug.get(slug); if (entry) release(entry, ['high-stakes-without-professional-review']);
}
console.log('✓ Hallazgos editoriales no-YMYL resueltos');
