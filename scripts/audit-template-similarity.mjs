#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const check = process.argv.includes('--check');
const failures = [];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const silo = read('src/components/hub/SiloIndex.astro');
if (!silo.includes('const decisionMap = hubs.slice(0, 4)')) {
  failures.push('Los silos no construyen un mapa editorial desde sus hubs reales.');
}
if ((silo.match(/Start with the question|Comece pela pergunta|Empezá por la pregunta/g) || []).length) {
  failures.push('Volvió el bloque genérico repetido en los índices regionales.');
}

const iibbPage = read('src/pages/iibb/[provincia]/index.astro');
if (!iibbPage.includes('provData.specificExample') || !iibbPage.includes('revenueAgency')) {
  failures.push('Las 24 fichas IIBB dejaron de mostrar sus ejemplos provinciales únicos.');
}

const iibb = JSON.parse(read('src/content/argentina/ingresos-brutos.json'));
const provinces = JSON.parse(read('src/content/argentina/provincias.json'));
for (const province of provinces) {
  const data = iibb.provinceData?.[province.slug];
  if (!data?.details || !data?.localNotes || !data?.metrics?.['Organismo recaudador']) {
    failures.push(`IIBB ${province.slug}: falta detalle, particularidad u organismo local.`);
  }
}

const redirects = read('scripts/pruning-batches/z-2026-08-01-adsense-similarity.tsv');
for (const source of [
  '/tabla/tabla-escalas-ganancias-2026',
  '/sueldos-y-trabajo',
  '/blog/informe-financiero-argentina-2026-05',
]) {
  if (!redirects.includes(`${source}\t`)) failures.push(`Falta consolidar ${source}.`);
}

console.log(`Auditoría de plantillas: ${65} silos protegidos, ${provinces.length} fichas IIBB verificadas.`);
if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  if (check) process.exit(1);
} else {
  console.log('✓ Sin regresiones de similitud sistémica.');
}
