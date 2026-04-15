/**
 * Gas natural residencial (yearly) — auto-llm vía Claude + WebSearch.
 *
 * ENARGAS publica cuadros tarifarios por distribuidora (Metrogas, Naturgy,
 * Camuzzi, Ecogas, etc.). El precio medio residencial por m³ y el cargo
 * fijo bimestral se actualizan por audiencia pública (~1x al año).
 *
 * La calc usa 3 categorías R (R1 bajo, R2 medio, R3 alto consumo). Se toma
 * un promedio simple entre las distribuidoras principales como referencia.
 *
 * Patchea 6 constantes en `src/lib/formulas/gas-natural-consumo-m3.ts`:
 *   PRECIO_R1/R2/R3 (ARS/m³) y CARGO_FIJO_R1/R2/R3 (ARS/factura bimestral).
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceNumericConst } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('gas-natural');
const FILE = join(process.cwd(), 'src/lib/formulas/gas-natural-consumo-m3.ts');

interface GasNaturalData {
  fechaVigencia: string;
  fuenteUrl: string;
  precioR1: number;
  precioR2: number;
  precioR3: number;
  cargoFijoR1: number;
  cargoFijoR2: number;
  cargoFijoR3: number;
  notas?: string;
}

export async function fetchGasNatural({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para cuadro tarifario ENARGAS ${year}`);

  const result = await askClaudeStructured<GasNaturalData>({
    task:
      `Buscá en enargas.gob.ar (o en las distribuidoras Metrogas metrogas.com.ar y Naturgy naturgy.com.ar) el cuadro tarifario residencial VIGENTE ${year} para las categorías R (bajo, medio y alto consumo).\n\n` +
      `Necesito, tomando como referencia Metrogas AMBA (o el promedio simple entre Metrogas y Naturgy):\n` +
      `- precioR1: precio por m³ en ARS para categoría R1 (< 500 m³/año). Típico 2026 ~200-400.\n` +
      `- precioR2: precio por m³ en ARS para R2 (500-1100 m³/año). Siempre >= R1.\n` +
      `- precioR3: precio por m³ en ARS para R3 (> 1100 m³/año). Siempre >= R2.\n` +
      `- cargoFijoR1: cargo fijo bimestral R1 en ARS (~2000-4000).\n` +
      `- cargoFijoR2: cargo fijo bimestral R2 en ARS (siempre >= R1).\n` +
      `- cargoFijoR3: cargo fijo bimestral R3 en ARS (siempre >= R2).\n` +
      `- fechaVigencia: YYYY-MM-DD de la última resolución ENARGAS.\n` +
      `- fuenteUrl: URL oficial al cuadro tarifario.\n` +
      `- notas: breve contexto si cambió el esquema o si hay subsidios N1/N2/N3 a tener en cuenta.\n\n` +
      `IMPORTANTE: los valores deben ser SIN IVA (la calc le suma 21% aparte). Si la fuente publica con IVA, dividí por 1.21.\n` +
      `Sanity: precios ascendentes R1<R2<R3, cargos fijos ascendentes R1<=R2<=R3.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'precioR1', 'precioR2', 'precioR3', 'cargoFijoR1', 'cargoFijoR2', 'cargoFijoR3', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        fuenteUrl: { type: 'string' },
        notas: { type: 'string' },
        precioR1: { type: 'number', minimum: 50, maximum: 2000 },
        precioR2: { type: 'number', minimum: 50, maximum: 2000 },
        precioR3: { type: 'number', minimum: 50, maximum: 2000 },
        cargoFijoR1: { type: 'number', minimum: 500, maximum: 30000 },
        cargoFijoR2: { type: 'number', minimum: 500, maximum: 30000 },
        cargoFijoR3: { type: 'number', minimum: 500, maximum: 30000 },
      },
    },
    validate: (data) => {
      if (!(data.precioR1 < data.precioR2 && data.precioR2 < data.precioR3)) {
        return { ok: false, reason: 'precios R1<R2<R3 violated' };
      }
      if (!(data.cargoFijoR1 <= data.cargoFijoR2 && data.cargoFijoR2 <= data.cargoFijoR3)) {
        return { ok: false, reason: 'cargo fijo R1<=R2<=R3 violated' };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} · fuente: ${result.fuenteUrl}`);
  log.info(`R1: $${result.precioR1}/m³ + fijo $${result.cargoFijoR1}`);
  log.info(`R2: $${result.precioR2}/m³ + fijo $${result.cargoFijoR2}`);
  log.info(`R3: $${result.precioR3}/m³ + fijo $${result.cargoFijoR3}`);
  if (result.notas) log.info(`notas: ${result.notas}`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch PRECIO_R1/R2/R3 and CARGO_FIJO_R1/R2/R3`);
    return true;
  }

  const patches: Array<[string, number]> = [
    ['PRECIO_R1', result.precioR1],
    ['PRECIO_R2', result.precioR2],
    ['PRECIO_R3', result.precioR3],
    ['CARGO_FIJO_R1', result.cargoFijoR1],
    ['CARGO_FIJO_R2', result.cargoFijoR2],
    ['CARGO_FIJO_R3', result.cargoFijoR3],
  ];

  let anyChanged = false;
  for (const [name, value] of patches) {
    const res = replaceNumericConst(FILE, name, value);
    if (res.changed) {
      log.success(`${name}: ${res.oldValue} → ${value}`);
      anyChanged = true;
    }
  }

  if (anyChanged) {
    touchLastUpdated('calculadora-gas-natural-consumo-m3', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
