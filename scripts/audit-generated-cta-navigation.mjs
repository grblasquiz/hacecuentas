import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const generatedDir = join(root, 'src/components/generated');
const layout = readFileSync(join(root, 'src/layouts/Layout.astro'), 'utf8');
const search = readFileSync(join(generatedDir, 'BuscarExperience.astro'), 'utf8');
const brokenTargets = [
  '/brecha-dolar-blue-mep-ccl-oficial',
  '/cl/calculadora-boleta-honorarios-sii-2026',
  '/es/calculadora-cuota-autonomos-ingresos-reales-2026',
  '/matematica/estadistica',
  '/pt/calculadora-mei-das-faturamento',
  '/sitemap-en.xml',
];

const failures = [];
if (!layout.includes("import GeneratedCtaNavigation from '../components/GeneratedCtaNavigation.astro'")) failures.push('Layout no importa GeneratedCtaNavigation.astro');
const navigation = JSON.parse(readFileSync(join(root, 'src/lib/seo/category-navigation.json'), 'utf8'));
for (const {component, title, href} of navigation) {
  const html = readFileSync(join(root, component), 'utf8');
  if (!html.includes(`href="${href}"`)) failures.push(`${component}: falta enlace de ${title} a ${href}`);
}
const handler = readFileSync(join(root, 'src/components/GeneratedCtaNavigation.astro'), 'utf8');
if (/bestPageLink|location.assign|stopImmediatePropagation/.test(handler)) failures.push('Un handler global sigue interceptando acciones locales');
if (search.includes('data-open=') || search.includes('data-rec=')) failures.push('/buscar todavía genera botones simulados sin href');
const searchRows = [...search.matchAll(/\{href:"(\/[^"]+)"[^}]+title:"([^"]+)"/g)];
if (searchRows.length < 17) failures.push(`/buscar sólo tiene ${searchRows.length}/17 destinos explícitos`);

const sourceFiles = [
  'src/components/Footer.astro',
  'src/content/blog/informe-financiero-argentina-2026-08.json',
  'src/pages/cl/trabajo/trabajo-a-honorarios.astro',
  'src/pages/es/impuestos/autonomos.astro',
  'src/pages/pt/dinheiro/simples-nacional.astro',
  'src/lib/priority-pages-31-100.ts',
];
const source = sourceFiles.map((file) => readFileSync(join(root, file), 'utf8')).join('\n');
for (const target of brokenTargets) {
  const exact = source.includes(`'${target}'`) || source.includes(`"${target}"`) || source.includes(`href=\\"${target}`);
  if (exact) failures.push(`destino roto todavía referenciado: ${target}`);
}

const generated = readdirSync(generatedDir).filter((name) => name.endsWith('.astro'));
const covered = generated.filter((name) => {
  const body = readFileSync(join(generatedDir, name), 'utf8');
  return body.includes('".card button"') && body.includes('toast');
});

if (failures.length) {
  console.error('[cta-navigation] FAIL');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}
console.log(`[cta-navigation] PASS — ${navigation.length} enlaces explícitos comprobados; /buscar tiene ${searchRows.length} destinos explícitos`);
