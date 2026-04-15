/**
 * Costo mochilero por país (yearly) — auto-llm vía Claude + WebSearch.
 *
 * El presupuesto diario base (USD/día, estilo mochilero) para 29 países
 * lo compilan guías como Nomadic Matt, The Broke Backpacker, Budget Your Trip
 * y Lonely Planet. Cambian por inflación USD y mix de oferta turística.
 *
 * Patchea el Record `PAISES` en `src/lib/formulas/costo-mochilero-por-pais.ts`.
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceObjectLiteral } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('costo-mochilero');
const FILE = join(process.cwd(), 'src/lib/formulas/costo-mochilero-por-pais.ts');

// Orden fijo de países esperado en el Record (el formula file depende de esto)
const PAISES_KEYS = [
  'argentina', 'brasil', 'chile', 'uruguay', 'peru',
  'bolivia', 'colombia', 'ecuador', 'mexico', 'usa',
  'canada', 'espana', 'francia', 'italia', 'uk',
  'alemania', 'portugal', 'grecia', 'tailandia', 'vietnam',
  'india', 'japon', 'china', 'indonesia', 'australia',
  'sudafrica', 'marruecos', 'egipto', 'turquia',
] as const;

interface MochileroData {
  fechaVigencia: string;
  fuenteUrl: string;
  paises: Record<string, number>;
  notas?: string;
}

function formatPaises(paises: Record<string, number>): string {
  return PAISES_KEYS
    .map((k) => `  '${k}': ${paises[k]},`)
    .join('\n');
}

export async function fetchCostoMochilero({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para presupuestos mochileros ${year}`);

  const result = await askClaudeStructured<MochileroData>({
    task:
      `Buscá en guías de viaje mochilero actualizadas ${year} (Nomadic Matt nomadicmatt.com, The Broke Backpacker thebrokebackpacker.com, Budget Your Trip, Lonely Planet budget sections) el presupuesto diario estimado en USD para un viajero **estilo mochilero** (hostel dorm, transporte local, comida de calle/local, pocas actividades pagas) en estos 29 países.\n\n` +
      `Devolvé un objeto "paises" con EXACTAMENTE estas 29 claves (lowercase, sin tildes): argentina, brasil, chile, uruguay, peru, bolivia, colombia, ecuador, mexico, usa, canada, espana, francia, italia, uk, alemania, portugal, grecia, tailandia, vietnam, india, japon, china, indonesia, australia, sudafrica, marruecos, egipto, turquia.\n\n` +
      `Cada valor es un entero USD/día (típicamente entre 15 y 120).\n\n` +
      `Sanity check: India < Vietnam < Tailandia < Argentina < USA; Japón y UK típicamente >= 80.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'paises', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        fuenteUrl: { type: 'string' },
        notas: { type: 'string' },
        paises: {
          type: 'object',
          required: [...PAISES_KEYS],
          properties: Object.fromEntries(
            PAISES_KEYS.map((k) => [k, { type: 'number', minimum: 10, maximum: 200 }]),
          ),
        },
      },
    },
    validate: (data) => {
      const missing = PAISES_KEYS.filter((k) => typeof data.paises[k] !== 'number');
      if (missing.length) return { ok: false, reason: `faltan países: ${missing.join(',')}` };
      // Sanity asiática: India debería ser el más barato
      if (data.paises.india > data.paises.japon) {
        return { ok: false, reason: 'India no puede ser más cara que Japón' };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} · fuente: ${result.fuenteUrl}`);
  const min = Math.min(...Object.values(result.paises));
  const max = Math.max(...Object.values(result.paises));
  log.info(`rango: US$ ${min}/día a US$ ${max}/día (29 países)`);
  if (result.notas) log.info(`notas: ${result.notas}`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch PAISES (${Object.keys(result.paises).length} entries)`);
    return true;
  }

  if (replaceObjectLiteral(FILE, 'PAISES', formatPaises(result.paises))) {
    log.success(`PAISES actualizados (29 países)`);
    touchLastUpdated('calculadora-costo-mochilero-por-pais', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
