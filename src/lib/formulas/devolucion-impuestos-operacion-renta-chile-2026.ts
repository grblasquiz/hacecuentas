// Devolución de impuestos / Operación Renta (Chile) — estima cuánto te devuelven a un trabajador a honorarios.
// Compara la retención del año contra el Impuesto Global Complementario anual (tabla en UTA, Art. 52 LIR).
import { CHILE_2026, fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  honorariosAnuales: number;   // total de honorarios brutos del año (CLP)
  tasaRetencion: number;       // % retenido en las boletas (14,5 para boletas 2025)
  rebajas: number;             // rebajas a la base: APV, intereses hipotecarios, etc. (CLP)
  valorUTA: number;            // Unidad Tributaria Anual (CLP)
}
export interface Outputs {
  retencionTotal: number;
  baseImponible: number;
  impuestoAnual: number;
  devolucion: number;
  resultado: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const UTA_FALLBACK = 859_788;  // UTA jul-2026 (mindicador.cl / SII), fallback si no llega el valor en vivo.

// Tabla del Impuesto Global Complementario (Art. 52 LIR). Mismos factores y rebajas
// que el impuesto único mensual, pero expresados en UTA (anual). La rebaja en UTA da
// continuidad entre tramos: impuesto = base·factor − rebaja·UTA.
const TRAMOS = [
  { hastaUta: CHILE_2026.segundaCategoriaExentoUtm, factor: 0, rebajaUta: 0, nombre: 'Exento' },
  { hastaUta: 30, factor: 0.04, rebajaUta: 0.54, nombre: '4%' },
  { hastaUta: 50, factor: 0.08, rebajaUta: 1.74, nombre: '8%' },
  { hastaUta: 70, factor: 0.135, rebajaUta: 4.49, nombre: '13,5%' },
  { hastaUta: 90, factor: 0.23, rebajaUta: 11.14, nombre: '23%' },
  { hastaUta: 120, factor: 0.304, rebajaUta: 17.80, nombre: '30,4%' },
  { hastaUta: 310, factor: 0.35, rebajaUta: 23.32, nombre: '35%' },
  { hastaUta: Infinity, factor: CHILE_2026.segundaCategoriaTasaMaxima, rebajaUta: 38.82, nombre: '40%' },
];

export function compute(i: Inputs): Outputs {
  const honorarios = Math.max(0, Number(i.honorariosAnuales) || 0);
  const tasa = Math.max(0, Math.min(30, (Number.isFinite(Number(i.tasaRetencion)) ? Number(i.tasaRetencion) : 14.5)));
  const rebajas = Math.max(0, Number(i.rebajas) || 0);
  const uta = Number(i.valorUTA) > 0 ? Number(i.valorUTA) : UTA_FALLBACK;

  const retencionTotal = Math.round(honorarios * (tasa / 100));
  const baseImponible = Math.max(0, honorarios - rebajas);
  const baseUta = uta > 0 ? baseImponible / uta : 0;

  let tramo = TRAMOS[0];
  for (const t of TRAMOS) { if (baseUta <= t.hastaUta) { tramo = t; break; } }
  const impuestoAnual = Math.round(Math.max(0, baseImponible * tramo.factor - tramo.rebajaUta * uta));

  const devolucion = retencionTotal - impuestoAnual;  // positivo = te devuelven
  const teDevuelven = devolucion >= 0;

  const resultado = teDevuelven
    ? `Te devuelven aprox. ${fmtCLP(devolucion)}`
    : `Deberías pagar aprox. ${fmtCLP(Math.abs(devolucion))}`;

  const _insight = {
    title: teDevuelven ? `Devolución estimada: ${fmtCLP(devolucion)}` : `A pagar: ${fmtCLP(Math.abs(devolucion))}`,
    text: teDevuelven
      ? `Te retuvieron **${fmtCLP(retencionTotal)}** (${tasa.toLocaleString('es-CL')}% de ${fmtCLP(honorarios)}) y tu Impuesto Global Complementario anual es **${fmtCLP(impuestoAnual)}**. La diferencia, **${fmtCLP(devolucion)}**, es la base de tu devolución. Parte de la retención financia tus cotizaciones, así que el monto final en la Operación Renta puede variar.`
      : `Te retuvieron **${fmtCLP(retencionTotal)}** pero tu impuesto anual es **${fmtCLP(impuestoAnual)}**: la retención no alcanzó y quedaría un saldo por pagar de **${fmtCLP(Math.abs(devolucion))}** (antes de créditos y cotizaciones).`,
    tone: teDevuelven ? 'good' : 'warn',
    icon: '🧾',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Retenido', value: retencionTotal, color: '#2563eb', colorDark: '#3b82f6' },
      { label: 'Impuesto anual', value: impuestoAnual, color: '#dc2626', colorDark: '#ef4444' },
    ],
    valueFormat: 'currency',
    ariaLabel: `Retenido ${fmtCLP(retencionTotal)} frente a impuesto anual ${fmtCLP(impuestoAnual)}.`,
  };

  return {
    retencionTotal,
    baseImponible: Math.round(baseImponible),
    impuestoAnual,
    devolucion: Math.round(devolucion),
    resultado,
    detalle: `Retención ${fmtCLP(retencionTotal)} − IGC anual ${fmtCLP(impuestoAnual)} (tramo ${tramo.nombre}) = ${resultado}.`,
    _insight,
    _chart,
  };
}
