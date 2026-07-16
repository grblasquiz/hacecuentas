/**
 * Cuota de administración de copropiedad (propiedad horizontal) — Colombia (Ley 675/2001).
 * La cuota de cada unidad se calcula repartiendo el presupuesto mensual de gastos comunes
 * según el coeficiente de copropiedad de la unidad (art. 29 y ss.). El coeficiente se puede
 * ingresar directo (en %) o derivarlo del área privada sobre el área total construida.
 * Utilidad pura (fórmula fija, sin dato fiscal que rote): frequency "never".
 */
import { fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  presupuestoMensual: number;
  modo?: string;           // 'coeficiente' | 'area'
  coeficiente?: number;    // % (ej. 0.85) — usado si modo = 'coeficiente'
  areaPrivada?: number;    // m² de la unidad — usado si modo = 'area'
  areaTotal?: number;      // m² privados totales del edificio — usado si modo = 'area'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: any): number {
  if (v === undefined || v === null || v === '') return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export function compute(i: Inputs): Outputs {
  const presupuesto = num(i.presupuestoMensual);
  if (!Number.isFinite(presupuesto) || presupuesto <= 0) {
    throw new Error('Ingresá el presupuesto mensual de gastos comunes de la copropiedad (COP)');
  }

  const modo = String(i.modo || 'coeficiente') === 'area' ? 'area' : 'coeficiente';

  let coef: number; // fracción 0..1
  let baseTxt: string;
  if (modo === 'area') {
    const ap = num(i.areaPrivada);
    const at = num(i.areaTotal);
    if (!Number.isFinite(ap) || ap <= 0 || !Number.isFinite(at) || at <= 0) {
      throw new Error('Ingresá el área privada de tu unidad y el área privada total construida del edificio (m²)');
    }
    if (ap > at) {
      throw new Error('El área privada de tu unidad no puede ser mayor que el área privada total del edificio');
    }
    coef = ap / at;
    baseTxt = `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(ap)} m² ÷ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(at)} m²`;
  } else {
    const c = num(i.coeficiente);
    if (!Number.isFinite(c) || c <= 0) {
      throw new Error('Ingresá el coeficiente de copropiedad de tu unidad (%)');
    }
    coef = c / 100;
    baseTxt = `coeficiente ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 4 }).format(c)}%`;
  }

  const cuotaMensual = Math.round(presupuesto * coef);
  const cuotaAnual = cuotaMensual * 12;
  const coefPct = coef * 100;
  const fmtPct = (n: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 4 }).format(n);

  const _insight = {
    title: `Tu cuota mensual: ${fmtCOP(cuotaMensual)}`,
    text: `Sobre un presupuesto común de **${fmtCOP(presupuesto)}** al mes y un coeficiente de copropiedad de **${fmtPct(coefPct)}%**, a tu unidad le corresponde **${fmtCOP(cuotaMensual)}** mensuales (**${fmtCOP(cuotaAnual)}** al año). El coeficiente es el que figura en el reglamento de propiedad horizontal; la asamblea aprueba el presupuesto cada año.`,
    tone: 'info',
    icon: '🏢',
  };

  const _chart = {
    type: 'bar',
    labels: ['Presupuesto total', 'Tu cuota mensual'],
    values: [Math.round(presupuesto), cuotaMensual],
    prefix: '$',
    ariaLabel: `Del presupuesto mensual de ${fmtCOP(presupuesto)}, a tu unidad le corresponde ${fmtCOP(cuotaMensual)} según un coeficiente de ${fmtPct(coefPct)}%.`,
  };

  return {
    coeficienteAplicado: `${fmtPct(coefPct)}%`,
    cuotaMensual: fmtCOP(cuotaMensual),
    cuotaAnual: fmtCOP(cuotaAnual),
    detalle: `${fmtCOP(presupuesto)} × ${fmtPct(coefPct)}% (${baseTxt}) = ${fmtCOP(cuotaMensual)} al mes · ${fmtCOP(cuotaAnual)} al año.`,
    _insight,
    _chart,
  };
}
