/**
 * Propinas por país (yearly) — auto-llm vía Claude + WebSearch.
 *
 * Costumbres de propina cambian lentamente (pueden pasar años sin moverse),
 * pero conviene refrescarlas anualmente ante cambios regulatorios (ej.
 * service charge obligatorio en UK/USA) o devaluaciones del tipo de cambio.
 *
 * Patchea el Record `PAISES` en `src/lib/formulas/propina-viaje.ts` con 12
 * países y cuatro campos cada uno: restaurante, taxi, hotel, regla.
 */

import { join } from 'node:path';
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceObjectLiteral } from '../patchers/ts-constant.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('propinas');
const FILE = join(process.cwd(), 'src/lib/formulas/propina-viaje.ts');

// Orden fijo y labels oficiales esperados
const PAISES_META: Array<{ key: string; nombre: string }> = [
  { key: 'argentina',    nombre: 'Argentina' },
  { key: 'usa',          nombre: 'Estados Unidos' },
  { key: 'uk',           nombre: 'Reino Unido' },
  { key: 'espana',       nombre: 'España' },
  { key: 'francia',      nombre: 'Francia' },
  { key: 'italia',       nombre: 'Italia' },
  { key: 'mexico',       nombre: 'México' },
  { key: 'brasil',       nombre: 'Brasil' },
  { key: 'alemania',     nombre: 'Alemania' },
  { key: 'japon',        nombre: 'Japón' },
  { key: 'chile',        nombre: 'Chile' },
  { key: 'uruguay',      nombre: 'Uruguay' },
];

interface PropinaPais {
  restaurante: number;
  taxi: number;
  hotel: number;
  regla: string;
}

interface PropinasData {
  fechaVigencia: string;
  fuenteUrl: string;
  paises: Record<string, PropinaPais>;
}

function escapeRegla(s: string): string {
  // El archivo usa comillas simples — escapar apóstrofes
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatPaises(paises: Record<string, PropinaPais>): string {
  return PAISES_META
    .map(({ key, nombre }) => {
      const p = paises[key];
      const regla = escapeRegla(p.regla);
      return `  '${key}': { nombre: '${nombre}', restaurante: ${p.restaurante}, taxi: ${p.taxi}, hotel: ${p.hotel}, regla: '${regla}' },`;
    })
    .join('\n');
}

export async function fetchPropinas({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const year = new Date().getFullYear();
  log.info(`consultando Claude para costumbres de propina ${year}`);

  const result = await askClaudeStructured<PropinasData>({
    task:
      `Buscá en guías de etiqueta turística ${year} (Lonely Planet tipping guides, Rick Steves, TripAdvisor forums locales, Condé Nast Traveler) las costumbres ACTUALES de propina para estos 12 países: argentina, usa, uk, espana, francia, italia, mexico, brasil, alemania, japon, chile, uruguay.\n\n` +
      `Para cada país, devolvé porcentajes sugeridos (enteros 0-25) de:\n` +
      `- restaurante: % típico sobre la cuenta.\n` +
      `- taxi: % típico sobre la carrera.\n` +
      `- hotel: % o monto simbólico (0 si no se espera).\n` +
      `- regla: string corta de 1-2 oraciones en español explicando la costumbre local (mencionar si es obligatorio, opcional, si el servicio viene incluido, o si es considerado ofensivo — caso Japón).\n\n` +
      `Sanity: USA 15-20% restaurante; Japón 0; Argentina 10 restaurante y 0 taxi/hotel; Europa 5-12% generalmente.`,
    schema: {
      type: 'object',
      required: ['fechaVigencia', 'paises', 'fuenteUrl'],
      properties: {
        fechaVigencia: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        fuenteUrl: { type: 'string' },
        paises: {
          type: 'object',
          required: PAISES_META.map((p) => p.key),
          properties: Object.fromEntries(
            PAISES_META.map((p) => [
              p.key,
              {
                type: 'object',
                required: ['restaurante', 'taxi', 'hotel', 'regla'],
                properties: {
                  restaurante: { type: 'number', minimum: 0, maximum: 25 },
                  taxi: { type: 'number', minimum: 0, maximum: 25 },
                  hotel: { type: 'number', minimum: 0, maximum: 25 },
                  regla: { type: 'string', minLength: 10, maxLength: 300 },
                },
              },
            ]),
          ),
        },
      },
    },
    validate: (data) => {
      // Japón: no se deja propina
      const jp = data.paises.japon;
      if (jp && (jp.restaurante !== 0 || jp.taxi !== 0 || jp.hotel !== 0)) {
        return { ok: false, reason: 'Japón debe ser 0/0/0 (no se da propina)' };
      }
      // USA: debe tener restaurante >= 15
      if (data.paises.usa && data.paises.usa.restaurante < 15) {
        return { ok: false, reason: 'USA restaurante debe ser >= 15' };
      }
      return { ok: true };
    },
  });

  if (!result) return false;

  log.info(`vigencia ${result.fechaVigencia} · fuente: ${result.fuenteUrl}`);
  log.info(`${Object.keys(result.paises).length} países actualizados`);

  const today = new Date().toISOString().slice(0, 10);

  if (dry) {
    log.info(`would patch PAISES (${Object.keys(result.paises).length} países)`);
    return true;
  }

  if (replaceObjectLiteral(FILE, 'PAISES', formatPaises(result.paises))) {
    log.success(`PAISES actualizados (${PAISES_META.length} países)`);
    touchLastUpdated('calculadora-propina-por-pais-viaje', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
