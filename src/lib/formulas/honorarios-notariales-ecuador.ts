/**
 * Honorarios y aranceles notariales (Ecuador) — estimación por tipo de acto.
 * Tarifario del Consejo de la Judicatura (obligatorio para todas las notarías).
 * - Compraventa / promesa (cuantía determinada): tabla gradual descendente sobre el valor:
 *     ≤ 5.000 → 0,50% · 5.001-20.000 → 0,45% · 20.001-60.000 → 0,40% ·
 *     60.001-200.000 → 0,35% · > 200.000 → 0,30% (mínimo referencial USD 15).
 * - Actos de valor fijo (referenciales): poder especial ~57,84 · reconocimiento de firma ~15,85 ·
 *     declaración juramentada ~15,85 · protocolización ~28,18.
 * - Descuentos: vivienda de interés social 25% (si ≤ 60.000) · adulto mayor 50%.
 * A todos los honorarios se suma IVA 15% (ECUADOR_2026.iva).
 * Valores referenciales; el tarifario oficial del Consejo de la Judicatura es la fuente vinculante.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  tipoActo?: string;   // 'compraventa' | 'promesa' | 'poder_especial' | 'reconocimiento_firma' | 'declaracion_juramentada' | 'protocolizacion'
  cuantia?: number;    // valor del bien/transacción (solo actos de cuantía)
  descuento?: string;  // 'ninguno' | 'vis' | 'adulto_mayor'
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

const IVA = ECUADOR_2026.iva; // 0,15
const MIN_FEE = 15;

const FIJOS: Record<string, { label: string; base: number }> = {
  poder_especial:        { label: 'Poder especial', base: 57.84 },
  reconocimiento_firma:  { label: 'Reconocimiento de firma', base: 15.85 },
  declaracion_juramentada:{ label: 'Declaración juramentada', base: 15.85 },
  protocolizacion:       { label: 'Protocolización', base: 28.18 },
};

/** Honorario base para actos de cuantía determinada (compraventa/promesa). */
function honorarioCuantia(v: number): number {
  let rate: number;
  if (v <= 5000) rate = 0.005;
  else if (v <= 20000) rate = 0.0045;
  else if (v <= 60000) rate = 0.004;
  else if (v <= 200000) rate = 0.0035;
  else rate = 0.003;
  return Math.max(v * rate, MIN_FEE);
}

export function compute(i: Inputs): Outputs {
  const tipo = String(i.tipoActo || 'compraventa');
  const cuantia = Math.max(0, Number(i.cuantia) || 0);
  const desc = String(i.descuento || 'ninguno');
  const esCuantia = tipo === 'compraventa' || tipo === 'promesa';

  if (esCuantia && cuantia <= 0) throw new Error('Ingresá el valor (cuantía) de la compraventa');

  let base: number;
  let label: string;
  if (esCuantia) {
    base = honorarioCuantia(cuantia);
    label = tipo === 'promesa' ? 'Promesa de compraventa' : 'Compraventa / transferencia de dominio';
  } else {
    const f = FIJOS[tipo] || FIJOS.reconocimiento_firma;
    base = f.base;
    label = f.label;
  }

  // Descuentos de ley.
  let factor = 1;
  let descLabel = '';
  if (desc === 'vis' && (!esCuantia || cuantia <= 60000)) { factor = 0.75; descLabel = 'vivienda de interés social (-25%)'; }
  else if (desc === 'adulto_mayor') { factor = 0.5; descLabel = 'adulto mayor (-50%)'; }
  const honorario = base * factor;

  const iva = honorario * IVA;
  const total = honorario + iva;

  const _insight = {
    title: 'Costo notarial estimado',
    text: `El acto "**${label}**"${esCuantia ? ` por ${fmtUSDec(cuantia)}` : ''} tiene un honorario base de **${fmtUSDec(honorario)}**${descLabel ? ` (con ${descLabel})` : ''}. Con IVA 15% (${fmtUSDec(iva)}), pagás en la notaría **${fmtUSDec(total)}**. No incluye registro de la propiedad ni impuestos municipales.`,
    tone: 'neutral',
    icon: '🖋️',
  };

  const _table = {
    title: 'Aranceles notariales referenciales',
    headers: ['Acto', 'Honorario base', 'Con IVA 15%'],
    align: ['left', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: [
      ['Compraventa ≤ $5.000 (0,50%)', fmtUSDec(honorarioCuantia(5000)), fmtUSDec(honorarioCuantia(5000) * (1 + IVA))],
      ['Compraventa $50.000 (0,40%)', fmtUSDec(honorarioCuantia(50000)), fmtUSDec(honorarioCuantia(50000) * (1 + IVA))],
      ['Compraventa $120.000 (0,35%)', fmtUSDec(honorarioCuantia(120000)), fmtUSDec(honorarioCuantia(120000) * (1 + IVA))],
      ['Poder especial', fmtUSDec(FIJOS.poder_especial.base), fmtUSDec(FIJOS.poder_especial.base * (1 + IVA))],
      ['Reconocimiento de firma', fmtUSDec(FIJOS.reconocimiento_firma.base), fmtUSDec(FIJOS.reconocimiento_firma.base * (1 + IVA))],
      ['Protocolización', fmtUSDec(FIJOS.protocolizacion.base), fmtUSDec(FIJOS.protocolizacion.base * (1 + IVA))],
    ],
    note: 'Valores referenciales según el tarifario del Consejo de la Judicatura; cada notaría aplica la misma tabla. A la compraventa se suman aparte el registro de la propiedad (~0,3%) y el impuesto de alcabala municipal (1%).',
  };

  return {
    totalConIva: fmtUSDec(total),
    honorarioBase: fmtUSDec(honorario),
    iva: fmtUSDec(iva),
    detalle: `${label}: honorario ${fmtUSDec(honorario)}${descLabel ? ` (${descLabel})` : ''} + IVA ${fmtUSDec(iva)} = ${fmtUSDec(total)}.`,
    _insight,
    _table,
  };
}
