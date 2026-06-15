/**
 * Revisión Técnica Vehicular (CITV) — Perú 2026.
 * Estima el costo de la inspección según el tipo de vehículo y la multa por
 * circular sin CITV vigente (papeleta M27 = 0,5 UIT).
 *
 * Fuentes:
 * - Tarifas CITV por categoría: MTC / centros CITV autorizados, 2026
 *   (https://www.gob.pe/397-revision-tecnica-vehicular). Cada CITV fija su precio
 *   dentro de los rangos de mercado; usamos un valor representativo + rango.
 * - Multa M27 (circular sin CITV vigente): Reglamento Nacional de Tránsito,
 *   infracción "muy grave" = 0,5 UIT, 50 puntos, internamiento, sin descuento.
 *   No aplica a vehículos L5 (mototaxis). MTC / DS 016-2009-MTC, 2026.
 * - Multa M42 (L5/mototaxis sin CITV): infracción "muy grave" = 0,05 UIT,
 *   50 puntos, internamiento. Equivalente L5 de la M27. MTC, 2026.
 * - UIT 2026 = S/ 5.500 (DS 301-2025-EF) → 0,5 UIT = S/ 2.750; 0,05 UIT = S/ 275.
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// Tarifas representativas y rangos de la CITV por categoría (S/), 2026.
// fuente: MTC / centros CITV autorizados, https://www.gob.pe/397-revision-tecnica-vehicular, 2026
// (Lima tiende al tope del rango; provincias al piso. M27 NO aplica a L5.)
// 'multa' indica la papeleta que aplica al tipo: 'M27' (0,5 UIT) para autos/motos/
// transporte, 'M42' (0,05 UIT) para vehículos L5 (mototaxis). Ambas son muy graves.
const TARIFAS: Record<string, { label: string; tipico: number; min: number; max: number; multa: 'M27' | 'M42' }> = {
  particular: { label: 'Auto particular (M1)', tipico: 95, min: 80, max: 100, multa: 'M27' },
  moto: { label: 'Moto lineal / vehículo menor (L)', tipico: 35, min: 30, max: 40, multa: 'M27' },
  mototaxi: { label: 'Mototaxi / trimóvil (L5)', tipico: 35, min: 30, max: 40, multa: 'M42' },
  taxi: { label: 'Taxi / transporte de personas (M)', tipico: 110, min: 95, max: 150, multa: 'M27' },
  pesado: { label: 'Camión / transporte de mercancías (N)', tipico: 150, min: 136, max: 180, multa: 'M27' },
};

// Multa por circular sin CITV vigente, en fracción de UIT (infracciones muy graves).
// M27 = autos/motos/transporte (0,5 UIT); M42 = vehículos L5/mototaxis (0,05 UIT).
// fuente: Reglamento Nacional de Tránsito / DS 016-2009-MTC, 2026
const MULTA_UIT: Record<'M27' | 'M42', number> = { M27: 0.5, M42: 0.05 };

export interface Inputs {
  tipoVehiculo: string;      // particular | moto | mototaxi | taxi | pesado
  estado?: string;           // 'vigente' | 'vencida' — si está vencida y circula, suma la multa M27
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const tipo = String(i.tipoVehiculo || '');
  const t = TARIFAS[tipo];
  if (!t) throw new Error('Elegí un tipo de vehículo válido');

  const vencida = String(i.estado || 'vigente') === 'vencida';

  // Costo de la inspección (valor típico + rango por plaza).
  const costoCITV = t.tipico;

  // Papeleta que corresponde al tipo de vehículo: M27 (0,5 UIT) o M42 (0,05 UIT, L5).
  const codigoMulta = t.multa;                       // 'M27' | 'M42'
  const fraccionUIT = MULTA_UIT[codigoMulta];        // 0,5 | 0,05
  const fraccionUITtxt = String(fraccionUIT).replace('.', ','); // "0,5" | "0,05"
  const montoMultaTipo = PERU_2026.uit * fraccionUIT;

  // Multa real a pagar hoy: solo si circula con la CITV vencida.
  const aplicaMulta = vencida;
  const multa = aplicaMulta ? montoMultaTipo : 0;

  // Costo total a afrontar hoy: la inspección + la eventual multa.
  const total = costoCITV + multa;

  // Cuánto te ahorrás haciendo la CITV a tiempo en vez de que te multen.
  const ahorroPorPrevenir = montoMultaTipo;

  let insightTitle: string;
  let insightText: string;
  let tone: 'good' | 'warn' | 'bad';
  let icon: string;

  if (aplicaMulta) {
    tone = 'bad';
    icon = codigoMulta === 'M42' ? '🛺' : '🚨';
    insightTitle = `Circulás con CITV vencida: riesgo de papeleta ${codigoMulta}`;
    insightText = `Circular sin revisión técnica vigente es la papeleta **${codigoMulta}** (infracción muy grave): multa de **${fmtPEN(multa)}** (${fraccionUITtxt} UIT), **50 puntos** menos en tu récord e **internamiento del vehículo**. Pasá la CITV (${fmtPEN(costoCITV)}) y te ahorrás **${fmtPEN(ahorroPorPrevenir)}**: la inspección cuesta **${(multa / costoCITV).toFixed(0)} veces menos** que la multa.`;
  } else {
    tone = 'good';
    icon = '🔧';
    insightTitle = 'CITV al día: vas tranquilo';
    insightText = `La inspección para tu vehículo cuesta unos **${fmtPEN(costoCITV)}** (rango ${fmtPEN(t.min)}–${fmtPEN(t.max)} según la plaza). Manteniéndola vigente evitás la papeleta **${codigoMulta}** de **${fmtPEN(montoMultaTipo)}** (${fraccionUITtxt} UIT) y el internamiento del vehículo.`;
  }

  const _insight = { title: insightTitle, text: insightText, tone, icon };

  const _chart = aplicaMulta
    ? {
        type: 'bar',
        bars: [
          { label: 'Costo CITV', value: Math.round(costoCITV) },
          { label: `Multa ${codigoMulta} (${fraccionUITtxt} UIT)`, value: Math.round(multa) },
        ],
        prefix: 'S/ ',
        ariaLabel: `Comparación: la CITV cuesta ${fmtPEN(costoCITV)} frente a la multa ${codigoMulta} de ${fmtPEN(multa)}.`,
      }
    : {
        type: 'doughnut',
        slices: [
          { label: 'Costo CITV', value: Math.round(costoCITV) },
          { label: `Multa ${codigoMulta} evitada`, value: Math.round(ahorroPorPrevenir) },
        ].filter((s) => s.value > 0),
        prefix: 'S/ ',
        centerValue: fmtPEN(costoCITV),
        centerLabel: 'Costo CITV',
        ariaLabel: `La CITV cuesta ${fmtPEN(costoCITV)} y evita una multa ${codigoMulta} de ${fmtPEN(ahorroPorPrevenir)}.`,
      };

  return {
    costoCITV: fmtPEN(costoCITV),
    rango: `${fmtPEN(t.min)} – ${fmtPEN(t.max)}`,
    multa: aplicaMulta ? fmtPEN(multa) : fmtPEN(0),
    total: fmtPEN(total),
    detalle: aplicaMulta
      ? `${t.label}: CITV ${fmtPEN(costoCITV)} + multa ${codigoMulta} ${fmtPEN(multa)} (${fraccionUITtxt} UIT) = ${fmtPEN(total)}.`
      : `${t.label}: CITV ${fmtPEN(costoCITV)} (rango ${fmtPEN(t.min)}–${fmtPEN(t.max)}). Multa ${codigoMulta} si circulás vencido: ${fmtPEN(ahorroPorPrevenir)}.`,
    _insight,
    _chart,
  };
}
