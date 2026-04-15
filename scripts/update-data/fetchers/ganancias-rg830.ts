/**
 * Retenciones Ganancias RG 830 (biannual) — auto-llm vía Claude + WebSearch.
 *
 * ARCA (ex-AFIP) actualiza el Anexo VIII de la RG 830/2000 periódicamente —
 * típicamente 2 veces por año — vía sucesivas RG (5423/2023, etc) que
 * ajustan MNI y escala progresiva de honorarios por inflación.
 *
 * Patchea en `src/lib/formulas/ganancias-rg830.ts`:
 *   - Record `conceptos` (8 entries: MNI + alicuotas por concepto)
 *   - Array `ESCALA_PROFESIONALES` (tramos de la escala progresiva cód 119)
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import {
  replaceObjectLiteral,
  replaceArrayLiteral,
  formatNumberWithUnderscores,
} from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('ganancias-rg830');
const FILE = join(process.cwd(), 'src/lib/formulas/ganancias-rg830.ts');

// Orden fijo + nombres oficiales esperados por la calc (el output se emite con
// estos nombres; solo los valores numéricos cambian entre RGs).
interface ConceptoMeta {
  key: string;
  nombre: string;
  escalaProgresiva?: boolean;
}
const CONCEPTOS_META: ConceptoMeta[] = [
  { key: 'honorarios-profesionales', nombre: 'Honorarios profesionales (cód. 119)', escalaProgresiva: true },
  { key: 'locacion-obras-servicios', nombre: 'Locación obras y servicios no personales (cód. 111/112)' },
  { key: 'alquileres-urbanos',       nombre: 'Alquiler de inmuebles urbanos (cód. 128)' },
  { key: 'alquileres-rurales',       nombre: 'Alquiler de inmuebles rurales (cód. 129)' },
  { key: 'comisiones',               nombre: 'Comisiones / Intermediación (cód. 127)' },
  { key: 'intereses',                nombre: 'Intereses (cód. 131)' },
  { key: 'enajenacion-bienes',       nombre: 'Enajenación de bienes muebles (cód. 114)' },
  { key: 'transporte',               nombre: 'Transporte de cargas (cód. 125)' },
];

interface ConceptoData {
  mniInscripto: number;
  alicuotaInscripto: number;
  alicuotaNoInscripto: number;
}

interface TramoData {
  desde: number;
  hasta: number | null; // null ⇒ Infinity (último tramo)
  fijo: number;
  alicuota: number; // decimal (0.05 = 5%)
}

interface RG830Data {
  fechaVigencia: string;
  fuenteUrl: string;
  conceptos: Record<string, ConceptoData>;
  escalaProfesionales: TramoData[];
  notas?: string;
}

function needsQuotes(key: string): boolean {
  return !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key);
}

function escapeStr(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatConceptos(conceptos: Record<string, ConceptoData>): string {
  return CONCEPTOS_META
    .map(({ key, nombre, escalaProgresiva }) => {
      const c = conceptos[key];
      const keyOut = needsQuotes(key) ? `'${key}'` : key;
      const parts = [
        `nombre: '${escapeStr(nombre)}'`,
        `mniInscripto: ${formatNumberWithUnderscores(c.mniInscripto)}`,
        `alicuotaInscripto: ${c.alicuotaInscripto}`,
        `alicuotaNoInscripto: ${c.alicuotaNoInscripto}`,
      ];
      if (escalaProgresiva) parts.push(`escalaProgresiva: true`);
      return `  ${keyOut}: { ${parts.join(', ')} },`;
    })
    .join('\n');
}

function formatEscala(tramos: TramoData[]): string {
  return tramos
    .map((t) => {
      const desde = formatNumberWithUnderscores(t.desde);
      const hasta = t.hasta === null ? 'Infinity' : formatNumberWithUnderscores(t.hasta);
      const fijo = formatNumberWithUnderscores(t.fijo);
      return `  { desde: ${desde}, hasta: ${hasta}, fijo: ${fijo}, alicuota: ${t.alicuota} },`;
    })
    .join('\n');
}

export async function fetchGananciasRG830({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para RG 830 Anexo VIII ${year}`);

  const result = await askClaudeStructured<RG830Data>({
    task:
      `Buscá en arca.gob.ar (o afip.gob.ar), Infoleg (infoleg.gob.ar), o estudios contables como Errepar/Bichachi, los valores VIGENTES ${year} del Anexo VIII de la RG 830/2000 y sus modificatorias (RG 5423/2023 y actualizaciones posteriores) para retenciones de Impuesto a las Ganancias sobre pagos a proveedores.\n\n` +
      `Necesito dos cosas:\n\n` +
      `(A) "conceptos": objeto con 8 claves, cada una con { mniInscripto, alicuotaInscripto, alicuotaNoInscripto }. Claves:\n` +
      `  - honorarios-profesionales (cód. 119): alicuotaInscripto es promedio aprox de la escala (10).\n` +
      `  - locacion-obras-servicios (cód. 111/112): típico 2% inscripto, 28% no-inscripto.\n` +
      `  - alquileres-urbanos (cód. 128): 6% inscripto, 28% no-inscripto.\n` +
      `  - alquileres-rurales (cód. 129): 6% inscripto, 28% no-inscripto.\n` +
      `  - comisiones (cód. 127): 2% inscripto, 28% no-inscripto.\n` +
      `  - intereses (cód. 131): 6% inscripto, 28% no-inscripto.\n` +
      `  - enajenacion-bienes (cód. 114): 2% inscripto, 10% no-inscripto.\n` +
      `  - transporte (cód. 125): 0.25% inscripto, 28% no-inscripto.\n\n` +
      `Los mniInscripto cambian periódicamente por actualización. Valores típicos 2026: honorarios ~160000, locacion ~293000, alquileres ~193000, comisiones ~293000, intereses ~44000, enajenacion ~224000, transporte ~293000. Usar valores enteros.\n\n` +
      `(B) "escalaProfesionales": array de tramos para la escala progresiva del cód. 119 (honorarios profesionales, inscriptos). Cada tramo { desde, hasta, fijo, alicuota }:\n` +
      `  - desde/hasta/fijo: enteros en ARS. El PRIMER tramo arranca en desde=0, fijo=0. Cada tramo siguiente tiene desde = hasta del anterior.\n` +
      `  - El ÚLTIMO tramo debe tener hasta=null (representa Infinity). Todos los demás hasta con número entero.\n` +
      `  - alicuota: decimal (0.05 = 5%). La escala va de 5% a 31% en 8 tramos aprox.\n` +
      `  - "fijo" acumula lo que correspondería haber retenido si el excedente hubiese llegado al comienzo del tramo. Es decir, fijo[n+1] = fijo[n] + (hasta[n] - desde[n]) * alicuota[n].\n\n` +
      `Sanity: alicuota estrictamente ascendente tramo a tramo. fijo estrictamente ascendente (0, 65000, 182000, ...). Último tramo con hasta=null.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'fuenteUrl', 'conceptos', 'escalaProfesionales'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        fuenteUrl: { type: 'string' },
        notas: { type: 'string' },
        conceptos: {
          type: 'object',
          required: CONCEPTOS_META.map((c) => c.key),
          properties: Object.fromEntries(
            CONCEPTOS_META.map((c) => [
              c.key,
              {
                type: 'object',
                required: ['mniInscripto', 'alicuotaInscripto', 'alicuotaNoInscripto'],
                properties: {
                  mniInscripto: { type: 'number', minimum: 1000, maximum: 10_000_000 },
                  alicuotaInscripto: { type: 'number', minimum: 0, maximum: 50 },
                  alicuotaNoInscripto: { type: 'number', minimum: 0, maximum: 50 },
                },
              },
            ]),
          ),
        },
        escalaProfesionales: {
          type: 'array',
          minItems: 4,
          maxItems: 12,
          items: {
            type: 'object',
            required: ['desde', 'fijo', 'alicuota'],
            properties: {
              desde: { type: 'number', minimum: 0 },
              hasta: { type: ['number', 'null'] },
              fijo: { type: 'number', minimum: 0 },
              alicuota: { type: 'number', minimum: 0, maximum: 1 },
            },
          },
        },
      },
    },
    validate: (data) => {
      // Escala monotónica creciente por tramo
      const e = data.escalaProfesionales;
      if (e[0].desde !== 0) return { ok: false, reason: 'primer tramo debe iniciar en desde=0' };
      if (e[0].fijo !== 0) return { ok: false, reason: 'primer tramo debe tener fijo=0' };
      if (e[e.length - 1].hasta !== null) return { ok: false, reason: 'último tramo debe tener hasta=null (Infinity)' };
      for (let i = 1; i < e.length; i++) {
        if (e[i].desde !== e[i - 1].hasta) {
          return { ok: false, reason: `tramo ${i}: desde (${e[i].desde}) != hasta del tramo anterior (${e[i - 1].hasta})` };
        }
        if (e[i].alicuota <= e[i - 1].alicuota) {
          return { ok: false, reason: `tramo ${i}: alicuota debe ser > tramo anterior` };
        }
        if (e[i].fijo <= e[i - 1].fijo) {
          return { ok: false, reason: `tramo ${i}: fijo debe ser > tramo anterior` };
        }
      }
      // Cordura: escala arranca en 5% y no supera 35%
      if (e[0].alicuota < 0.03 || e[0].alicuota > 0.1) {
        return { ok: false, reason: `primera alícuota fuera de rango esperado (3%-10%), got ${e[0].alicuota}` };
      }
      if (e[e.length - 1].alicuota > 0.4) {
        return { ok: false, reason: `última alícuota demasiado alta (>40%)` };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} · fuente: ${result.fuenteUrl}`);
  log.info(`conceptos: ${Object.keys(result.conceptos).length} · escala: ${result.escalaProfesionales.length} tramos`);
  log.info(
    `MNI honorarios: $${formatNumberWithUnderscores(result.conceptos['honorarios-profesionales'].mniInscripto)} · escala ${Math.round(result.escalaProfesionales[0].alicuota * 100)}%-${Math.round(result.escalaProfesionales[result.escalaProfesionales.length - 1].alicuota * 100)}%`,
  );
  if (result.notas) log.info(`notas: ${result.notas}`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch conceptos (${CONCEPTOS_META.length}) + ESCALA_PROFESIONALES (${result.escalaProfesionales.length} tramos)`);
    return true;
  }

  let anyChanged = false;
  if (replaceObjectLiteral(FILE, 'conceptos', formatConceptos(result.conceptos))) {
    log.success(`conceptos actualizados (${CONCEPTOS_META.length} entries)`);
    anyChanged = true;
  }
  if (replaceArrayLiteral(FILE, 'ESCALA_PROFESIONALES', formatEscala(result.escalaProfesionales))) {
    log.success(`ESCALA_PROFESIONALES actualizada (${result.escalaProfesionales.length} tramos)`);
    anyChanged = true;
  }

  if (anyChanged) {
    touchLastUpdated('calculadora-retencion-ganancias-rg-830', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
