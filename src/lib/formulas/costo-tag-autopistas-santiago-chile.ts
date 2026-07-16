// Costo mensual de TAG en autopistas urbanas de Santiago — según km diarios y tipo de tarifa horaria.
// Tarifas por km referenciales de Costanera Norte 2026 (autos, categoría 1). Cada concesionaria fija las suyas.
import { fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  kmDiarios: number;    // km recorridos en autopista por día
  tipoTarifa: string;   // 'fuera_punta' | 'punta' | 'saturacion'
  diasMes: number;      // días al mes que usás la autopista
  arriendoTag: number;  // arriendo mensual del dispositivo TAG (CLP)
}
export interface Outputs {
  tarifaKm: number;
  costoDiario: number;
  costoMensual: number;
  costoAnual: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Tarifas por km (CLP) — Costanera Norte 2026, autos. TBFP < TBP < TS.
const TARIFAS: Record<string, { valor: number; nombre: string }> = {
  fuera_punta: { valor: 107, nombre: 'Tarifa Base Fuera de Punta (TBFP)' },
  punta: { valor: 206, nombre: 'Tarifa Base Punta (TBP)' },
  saturacion: { valor: 312, nombre: 'Tarifa de Saturación (TS)' },
};

export function compute(i: Inputs): Outputs {
  const km = Math.max(0, Number(i.kmDiarios) || 0);
  const dias = Math.max(0, Math.min(31, Number(i.diasMes) || 22));
  const arriendo = Math.max(0, Number(i.arriendoTag) || 0);
  const tarifa = TARIFAS[String(i.tipoTarifa)] || TARIFAS.fuera_punta;

  const tarifaKm = tarifa.valor;
  const costoDiario = Math.round(km * tarifaKm);
  const costoPeajesMes = costoDiario * dias;
  const costoMensual = costoPeajesMes + arriendo;
  const costoAnual = costoMensual * 12;

  const _insight = {
    title: `TAG estimado: ${fmtCLP(costoMensual)}/mes`,
    text: `Recorriendo **${km} km** al día en **${tarifa.nombre}** (${fmtCLP(tarifaKm)}/km), gastás **${fmtCLP(costoDiario)}** por día. En ${dias} días al mes son **${fmtCLP(costoPeajesMes)}** de peajes${arriendo > 0 ? ` más **${fmtCLP(arriendo)}** de arriendo del dispositivo` : ''}: **${fmtCLP(costoMensual)}** mensuales y **${fmtCLP(costoAnual)}** al año.`,
    tone: costoMensual > 100000 ? 'warn' : 'neutral',
    icon: '🛣️',
  };

  const _chart = {
    type: 'bar',
    labels: ['Diario', 'Mensual', 'Anual'],
    values: [costoDiario, costoMensual, costoAnual],
    prefix: '$',
    ariaLabel: `Costo de TAG: ${fmtCLP(costoDiario)} diario, ${fmtCLP(costoMensual)} mensual, ${fmtCLP(costoAnual)} anual.`,
  };

  return {
    tarifaKm,
    costoDiario,
    costoMensual,
    costoAnual,
    detalle: `${km} km/día × ${fmtCLP(tarifaKm)}/km × ${dias} días = ${fmtCLP(costoPeajesMes)} + arriendo ${fmtCLP(arriendo)} = ${fmtCLP(costoMensual)}/mes.`,
    _insight,
    _chart,
  };
}
