// Impuesto al mayor valor por venta de bien raíz (Chile) — exención de 8.000 UF de por vida
// e Impuesto Único y Sustitutivo del 10% sobre el excedente. Art. 17 N°8 LIR (personas naturales).
import { fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  precioVenta: number;       // precio de venta (CLP)
  costoAdquisicion: number;  // costo de compra reajustado por IPC (CLP)
  mejoras: number;           // mejoras acreditadas (CLP)
  gananciasPreviasUF: number; // UF de mayor valor ya usadas del cupo de 8.000 (CLP en UF)
  valorUF: number;           // valor de la UF (CLP)
}
export interface Outputs {
  ganancia: number;
  gananciaUF: number;
  cupoRestanteUF: number;
  exentoUF: number;
  baseAfecta: number;
  impuesto: number;
  gananciaNeta: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const EXENCION_UF = 8000;    // tope de exención de por vida (personas naturales), Art. 17 N°8 LIR.
const TASA_IUS = 0.10;       // Impuesto Único y Sustitutivo del 10% (opción sobre base percibida).
const UF_FALLBACK = 40_844.79;

export function compute(i: Inputs): Outputs {
  const precio = Math.max(0, Number(i.precioVenta) || 0);
  const costo = Math.max(0, Number(i.costoAdquisicion) || 0);
  const mejoras = Math.max(0, Number(i.mejoras) || 0);
  const usadasUF = Math.max(0, Number(i.gananciasPreviasUF) || 0);
  const uf = Number(i.valorUF) > 0 ? Number(i.valorUF) : UF_FALLBACK;

  const ganancia = Math.max(0, precio - costo - mejoras);
  const gananciaUF = uf > 0 ? ganancia / uf : 0;

  const cupoRestanteUF = Math.max(0, EXENCION_UF - usadasUF);
  const exentoUF = Math.min(gananciaUF, cupoRestanteUF);
  const baseAfectaUF = Math.max(0, gananciaUF - cupoRestanteUF);
  const baseAfecta = Math.round(baseAfectaUF * uf);

  const impuesto = Math.round(baseAfecta * TASA_IUS);
  const gananciaNeta = ganancia - impuesto;

  const pagaImpuesto = impuesto > 0;
  const _insight = {
    title: pagaImpuesto ? `Impuesto estimado: ${fmtCLP(impuesto)}` : 'No pagás impuesto al mayor valor',
    text: ganancia === 0
      ? 'No hay mayor valor: el precio de venta no supera el costo de adquisición reajustado más las mejoras.'
      : pagaImpuesto
        ? `Tu ganancia es **${fmtCLP(ganancia)}** (${gananciaUF.toLocaleString('es-CL', { maximumFractionDigits: 0 })} UF). Con **${cupoRestanteUF.toLocaleString('es-CL', { maximumFractionDigits: 0 })} UF** de exención disponible, quedan afectas **${fmtCLP(baseAfecta)}**: el Impuesto Único y Sustitutivo del 10% son **${fmtCLP(impuesto)}**. Te queda una ganancia neta de **${fmtCLP(gananciaNeta)}**.`
        : `Tu ganancia es **${fmtCLP(ganancia)}** (${gananciaUF.toLocaleString('es-CL', { maximumFractionDigits: 0 })} UF), por debajo de tu exención disponible de **${cupoRestanteUF.toLocaleString('es-CL', { maximumFractionDigits: 0 })} UF**: no pagás impuesto al mayor valor.`,
    tone: pagaImpuesto ? 'warn' : 'good',
    icon: '🏘️',
  };

  const _chart = pagaImpuesto ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ganancia neta', value: Math.round(gananciaNeta) },
      { label: 'Impuesto 10%', value: impuesto },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCLP(ganancia),
    centerLabel: 'Mayor valor',
    ariaLabel: `Mayor valor ${fmtCLP(ganancia)}: ganancia neta ${fmtCLP(gananciaNeta)} e impuesto ${fmtCLP(impuesto)}.`,
  } : undefined;

  return {
    ganancia: Math.round(ganancia),
    gananciaUF: Math.round(gananciaUF * 100) / 100,
    cupoRestanteUF: Math.round(cupoRestanteUF * 100) / 100,
    exentoUF: Math.round(exentoUF * 100) / 100,
    baseAfecta,
    impuesto,
    gananciaNeta: Math.round(gananciaNeta),
    detalle: `Ganancia ${fmtCLP(ganancia)} (${Math.round(gananciaUF)} UF); afecta ${fmtCLP(baseAfecta)} → IUS 10% = ${fmtCLP(impuesto)}.`,
    _insight,
    _chart,
  };
}
