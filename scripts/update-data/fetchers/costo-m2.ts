/**
 * Costo de construcción por m² (yearly) — auto-llm vía Claude + WebSearch.
 *
 * La CAC (Cámara Argentina de la Construcción) y el CPIC (Colegio Profesional
 * de Ingeniería Civil) publican índices y costos de referencia por m² según
 * tipología constructiva. Datos en USD para evitar ruido de tipo de cambio.
 *
 * Patchea el Record `TIPOS` en `src/lib/formulas/costo-m2-construccion.ts`
 * con 10 categorías, cada una con su { nombre, usd }.
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceObjectLiteral } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('costo-m2');
const FILE = join(process.cwd(), 'src/lib/formulas/costo-m2-construccion.ts');

// Orden fijo y labels esperados (el formula file depende de estas claves)
const TIPOS_META: Array<{ key: string; nombre: string }> = [
  { key: 'economico',     nombre: 'Económico (vivienda social, campo)' },
  { key: 'estandar',      nombre: 'Estándar (casa media urbana)' },
  { key: 'medio',         nombre: 'Casa media (clase media, GBA/CABA)' },
  { key: 'alto',          nombre: 'Casa de alta categoría (country, barrio cerrado)' },
  { key: 'premium',       nombre: 'Premium (alta gama, mármol, domótica)' },
  { key: 'ampliacion',    nombre: 'Ampliación sobre obra existente' },
  { key: 'reforma',       nombre: 'Reforma integral (con estructura)' },
  { key: 'dpto_estandar', nombre: 'Departamento torre estándar' },
  { key: 'dpto_premium',  nombre: 'Departamento premium (Puerto Madero)' },
  { key: 'galpon',        nombre: 'Galpón industrial tipo' },
];

interface CostoM2Data {
  fechaVigencia: string;
  fuenteUrl: string;
  tipos: Record<string, number>;
  notas?: string;
}

function escapeName(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatTipos(tipos: Record<string, number>): string {
  return TIPOS_META
    .map(({ key, nombre }) => {
      const usd = tipos[key];
      return `  ${key}: { nombre: '${escapeName(nombre)}', usd: ${usd} },`;
    })
    .join('\n');
}

export async function fetchCostoM2({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para costos m² construcción ${year}`);

  const result = await askClaudeStructured<CostoM2Data>({
    task:
      `Buscá en camarco.org.ar (CAC), cpic.org.ar, revistas del sector (ARQ, Plot, Clarín Arquitectura), o portales inmobiliarios (Reporte Inmobiliario, Zonaprop Real Estate Data) el costo **en USD** por m² de construcción en Argentina ${year}, para las siguientes 10 categorías:\n\n` +
      `- economico: vivienda social, casa de campo rural, construcción económica (típico 2026 ~500-700 USD/m²).\n` +
      `- estandar: casa media urbana en lote propio (~800-1000).\n` +
      `- medio: casa clase media GBA/CABA con buena terminación (~1100-1400).\n` +
      `- alto: casa de alta categoría en country o barrio cerrado (~1600-2000).\n` +
      `- premium: alta gama con mármol, domótica, piscina climatizada (~2500-3500).\n` +
      `- ampliacion: ampliación sobre obra existente (~600-900).\n` +
      `- reforma: reforma integral con reemplazo de estructura (~400-600).\n` +
      `- dpto_estandar: departamento en torre estándar (~1000-1300).\n` +
      `- dpto_premium: departamento premium (Puerto Madero, Palermo nuevo) (~2000-2800).\n` +
      `- galpon: galpón industrial tipo (~400-600).\n\n` +
      `Valores USD enteros. Sanity: economico < estandar < medio < alto < premium; dpto_estandar < dpto_premium; galpon y reforma son los más baratos.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'tipos', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        fuenteUrl: { type: 'string' },
        notas: { type: 'string' },
        tipos: {
          type: 'object',
          required: TIPOS_META.map((t) => t.key),
          properties: Object.fromEntries(
            TIPOS_META.map((t) => [t.key, { type: 'number', minimum: 200, maximum: 5000 }]),
          ),
        },
      },
    },
    validate: (data) => {
      const t = data.tipos;
      if (!(t.economico < t.estandar && t.estandar < t.medio && t.medio < t.alto && t.alto < t.premium)) {
        return { ok: false, reason: 'orden residencial económico<estandar<medio<alto<premium violado' };
      }
      if (t.dpto_premium <= t.dpto_estandar) {
        return { ok: false, reason: 'dpto_premium debe ser > dpto_estandar' };
      }
      if (t.galpon > t.estandar) {
        return { ok: false, reason: 'galpón no debería superar costo estándar residencial' };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} · fuente: ${result.fuenteUrl}`);
  log.info(
    `rango: US$ ${Math.min(...Object.values(result.tipos))}/m² (${Object.entries(result.tipos).sort((a, b) => a[1] - b[1])[0][0]}) → US$ ${Math.max(...Object.values(result.tipos))}/m² (premium)`,
  );
  if (result.notas) log.info(`notas: ${result.notas}`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch TIPOS (${Object.keys(result.tipos).length} categorías)`);
    return true;
  }

  if (replaceObjectLiteral(FILE, 'TIPOS', formatTipos(result.tipos))) {
    log.success(`TIPOS actualizados (${TIPOS_META.length} categorías)`);
    touchLastUpdated('calculadora-costo-m2-construccion-argentina', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
