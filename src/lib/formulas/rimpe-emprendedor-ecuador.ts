/** RIMPE (Ecuador) — cuota de impuesto a la renta del régimen simplificado según ingresos brutos anuales.
 *  Tramos referenciales: Negocio Popular (hasta $20.000) cuota fija; Emprendedor (hasta $300.000) por tramos.
 *  Valores orientativos — verificar la tabla vigente con el SRI. */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  ingresosBrutosAnuales: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Tabla referencial RIMPE. Negocio Popular: cuota fija anual hasta $20.000.
// Emprendedor: cuota fija por tramo + porcentaje sobre el excedente del límite inferior.
const TRAMOS_POPULAR = [
  { desde: 0,     hasta: 2500,  cuota: 0 },
  { desde: 2500,  hasta: 5000,  cuota: 5 },
  { desde: 5000,  hasta: 7500,  cuota: 10 },
  { desde: 7500,  hasta: 10000, cuota: 30 },
  { desde: 10000, hasta: 20000, cuota: 60 },
];
const TRAMOS_EMPRENDEDOR = [
  { desde: 20000,  hasta: 50000,  base: 60,    pct: 0.010 },
  { desde: 50000,  hasta: 75000,  base: 360,   pct: 0.015 },
  { desde: 75000,  hasta: 100000, base: 735,   pct: 0.020 },
  { desde: 100000, hasta: 200000, base: 1235,  pct: 0.020 },
  { desde: 200000, hasta: 300000, base: 3235,  pct: 0.020 },
];

export function compute(i: Inputs): Outputs {
  const ingresos = Number(i.ingresosBrutosAnuales) || 0;
  if (ingresos <= 0) throw new Error('Ingresá tus ingresos brutos anuales');

  let regimen: string;
  let cuotaAnual = 0;
  let detalleTramo = '';
  let fueraRimpe = false;

  if (ingresos <= 20000) {
    regimen = 'Negocio Popular';
    const t = TRAMOS_POPULAR.find((x) => ingresos > x.desde && ingresos <= x.hasta) || TRAMOS_POPULAR[TRAMOS_POPULAR.length - 1];
    cuotaAnual = t.cuota;
    detalleTramo = `Tramo de ingresos hasta ${fmtUSDec(t.hasta)} → cuota fija anual de ${fmtUSDec(t.cuota)}.`;
  } else if (ingresos <= 300000) {
    regimen = 'Emprendedor';
    const t = TRAMOS_EMPRENDEDOR.find((x) => ingresos > x.desde && ingresos <= x.hasta) || TRAMOS_EMPRENDEDOR[TRAMOS_EMPRENDEDOR.length - 1];
    cuotaAnual = t.base + (ingresos - t.desde) * t.pct;
    detalleTramo = `Cuota fija del tramo ${fmtUSDec(t.base)} + ${(t.pct * 100).toFixed(1)}% sobre el excedente de ${fmtUSDec(t.desde)}.`;
  } else {
    regimen = 'Fuera del RIMPE (Régimen General)';
    fueraRimpe = true;
    detalleTramo = 'Con ingresos sobre $300.000 al año no podés estar en RIMPE; tributás bajo el Régimen General con la tabla de IR de personas naturales o sociedades.';
  }

  const cuotaMensual = cuotaAnual / 12;

  const _insight = {
    title: fueraRimpe ? 'No aplicás al RIMPE' : `Tu cuota RIMPE (${regimen})`,
    text: fueRimpeText(),
    tone: fueraRimpe ? 'warning' : 'neutral',
    icon: '🧾',
  };
  function fueRimpeText() {
    if (fueraRimpe) {
      return `Con ingresos anuales de **${fmtUSDec(ingresos)}** superás el techo del RIMPE ($300.000). Tributás bajo el **Régimen General**. Verificá tu caso con el SRI.`;
    }
    return `Con ingresos brutos anuales de **${fmtUSDec(ingresos)}**, te ubicás en el régimen **${regimen}** del RIMPE. La cuota de impuesto a la renta es de **${fmtUSDec(cuotaAnual)}** al año (${fmtUSDec(cuotaMensual)} mensuales). Valores orientativos: confirmá la tabla vigente con el SRI.`;
  }

  const _chart = fueraRimpe ? undefined : {
    type: 'gauge',
    value: Math.round(cuotaAnual * 100) / 100,
    min: 0,
    max: Math.max(60, Math.round(cuotaAnual * 1.5 * 100) / 100),
    label: fmtUSDec(cuotaAnual),
    ariaLabel: `Cuota RIMPE anual ${fmtUSDec(cuotaAnual)}.`,
  };

  return {
    regimen,
    cuotaAnual: fueraRimpe ? 'No aplica (Régimen General)' : fmtUSDec(cuotaAnual),
    cuotaMensual: fueraRimpe ? '—' : fmtUSDec(cuotaMensual),
    detalle: detalleTramo,
    _insight,
    _chart,
  };
}
