/** Genera las descargas abiertas enlazadas por /datos-monotributo-2026. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  CATEGORIAS,
  TOPES,
  CUOTA_SERVICIOS,
  CUOTA_BIENES,
  META,
  PARAMS_FISICOS,
  componentes,
} from '../src/lib/data/monotributo-2026.ts';

const outDir = resolve(import.meta.dirname, '../public/datos');
mkdirSync(outDir, { recursive: true });

const rows = CATEGORIAS.map((categoria) => ({
  categoria,
  tope_facturacion_anual_ars: TOPES[categoria],
  tope_facturacion_mensual_ars: Number((TOPES[categoria] / 12).toFixed(2)),
  cuota_mensual_servicios_ars: CUOTA_SERVICIOS[categoria],
  cuota_mensual_bienes_ars: CUOTA_BIENES[categoria],
  superficie_max_m2: PARAMS_FISICOS[categoria].superficie,
  energia_max_kwh_anual: PARAMS_FISICOS[categoria].energia,
  componentes_servicios: componentes(categoria, 'servicios'),
}));

const dataset = {
  name: 'Monotributo Argentina 2026 — categorías, topes y cuotas',
  source: META.fuente,
  source_url: META.fuenteUrl,
  effective_from: META.vigencia,
  license: 'CC-BY-4.0',
  attribution_url: 'https://hacecuentas.com/datos-monotributo-2026',
  rows,
};
writeFileSync(resolve(outDir, 'monotributo-2026.json'), `${JSON.stringify(dataset, null, 2)}\n`);

const columns = [
  'categoria', 'tope_facturacion_anual_ars', 'tope_facturacion_mensual_ars',
  'cuota_mensual_servicios_ars', 'cuota_mensual_bienes_ars',
  'superficie_max_m2', 'energia_max_kwh_anual',
];
const csv = [
  columns.join(','),
  ...rows.map((row) => columns.map((column) => String((row as Record<string, unknown>)[column])).join(',')),
].join('\n');
writeFileSync(resolve(outDir, 'monotributo-2026.csv'), `${csv}\n`);

console.log(`✓ monotributo dataset: ${rows.length} categorías (JSON + CSV)`);
