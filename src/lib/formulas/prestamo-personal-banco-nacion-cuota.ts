import { BNA_PRESTAMO_2026 as B, fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Cuota de préstamo personal Banco Nación (sistema francés, jul-2026):
 * TNA editable (61% Nación Sueldo / 91% no clientes), hasta 72 meses, tope $50M,
 * y regla BNA: la cuota no puede superar el 30% del ingreso neto mensual.
 */
export function compute(i: Inputs): Outputs {
  const monto = Math.min(B.montoMax, Math.max(0, Number(i.monto) || 0));
  const plazo = Math.min(B.plazoMaxMeses, Math.max(1, Math.round(Number(i.plazoMeses) || 36)));
  const tna = Math.min(300, Math.max(0.1, Number(i.tna) || B.tnaClienteSueldo));
  const ingreso = Math.max(0, Number(i.ingresoNeto) || 0);

  const im = tna / 100 / 12; // tasa mensual directa desde TNA (convención bancaria)
  const cuota = monto * im / (1 - Math.pow(1 + im, -plazo));
  const total = cuota * plazo;
  const intereses = total - monto;
  const ingresoMinimo = cuota / B.relacionCuotaIngreso;
  const relacion = ingreso > 0 ? (cuota / ingreso) * 100 : null;

  const fmtPct = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

  const out: Outputs = {
    cuotaMensual: fmtARS(cuota),
    ingresoMinimoRequerido: fmtARS(ingresoMinimo),
    totalAPagar: fmtARS(total),
    interesesTotales: fmtARS(intereses),
    relacionCuotaIngreso: relacion === null ? 'cargá tu ingreso para verificarla' : fmtPct(relacion),
  };

  let text =
    `Un préstamo de **${fmtARS(monto)}** a **${plazo} meses** con TNA **${fmtPct(tna)}** da una cuota inicial de **${fmtARS(cuota)}** por sistema francés (pagás **${fmtARS(intereses)}** de intereses en total). ` +
    `El BNA exige que la cuota no supere el **30%** del ingreso neto: necesitás demostrar al menos **${fmtARS(ingresoMinimo)}** por mes.`;
  let tone: 'good' | 'neutral' | 'warn' = 'neutral';
  if (relacion !== null) {
    if (relacion <= B.relacionCuotaIngreso * 100) {
      text += ` Con tu ingreso de ${fmtARS(ingreso)}, la cuota representa el **${fmtPct(relacion)}**: calificás por relación cuota-ingreso.`;
      tone = 'good';
    } else {
      text += ` Con tu ingreso de ${fmtARS(ingreso)}, la cuota representa el **${fmtPct(relacion)}**: supera el tope del 30%. Probá con menos monto o más plazo.`;
      tone = 'warn';
    }
  }
  text += ' El CFT real es mayor a la TNA (incluye IVA sobre intereses y seguros): confirmalo en el simulador oficial del BNA.';

  out._insight = { title: `Cuota inicial: ${fmtARS(cuota)}`, text, tone, icon: '🏦' };
  return out;
}
