/** Impuesto a la renta personas naturales (Ecuador) — base imponible y tabla progresiva 2026. */
import { ECUADOR_2026, impuestoRentaEC, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  ingresoAnual: number;       // ingreso gravable anual (sueldos, honorarios, etc.)
  gastosPersonales?: number;  // gastos personales deducibles (para rebaja 18%)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoAnual) || 0;
  const gastos = Math.max(0, Number(i.gastosPersonales) || 0);
  if (ingreso <= 0) throw new Error('Ingresá tu ingreso anual');

  // Aporte personal IESS (9,45%) deducible de la base imponible
  const aporteIESS = ingreso * ECUADOR_2026.iessPersonal;
  const baseImponible = Math.max(0, ingreso - aporteIESS);

  // Impuesto causado según la tabla progresiva
  const impuestoTabla = impuestoRentaEC(baseImponible);

  // Rebaja por gastos personales: 18% de los gastos (la calculadora aplica el % directo,
  // el tope real depende de la canasta familiar básica del SRI).
  const rebaja = gastos * ECUADOR_2026.rebajaGastosPersonales;
  const impuestoCausado = Math.max(0, impuestoTabla - rebaja);

  const tasaEfectiva = ingreso > 0 ? (impuestoCausado / ingreso) * 100 : 0;

  const _insight = {
    title: 'Tu impuesto a la renta',
    text: baseImponible <= ECUADOR_2026.irFraccionBasicaDesgravada
      ? `Con una base imponible de **${fmtUSDec(baseImponible)}**, estás **por debajo de la fracción básica desgravada** (${fmtUSDec(ECUADOR_2026.irFraccionBasicaDesgravada)} en 2026): **no pagás impuesto a la renta**.`
      : `Sobre una base imponible de **${fmtUSDec(baseImponible)}**, el impuesto según tabla es **${fmtUSDec(impuestoTabla)}**${gastos > 0 ? `, menos la rebaja por gastos personales de ${fmtUSDec(rebaja)}` : ''}. Tu impuesto causado es **${fmtUSDec(impuestoCausado)}** (tasa efectiva ${tasaEfectiva.toFixed(1)}%).`,
    tone: impuestoCausado > 0 ? 'neutral' : 'good',
    icon: '🧾',
  };
  const _chart = {
    type: 'gauge',
    value: Math.round(impuestoCausado * 100) / 100,
    min: 0,
    max: Math.max(1, Math.round(ingreso * 0.37 * 100) / 100),
    label: fmtUSDec(impuestoCausado),
    ariaLabel: `Impuesto a la renta ${fmtUSDec(impuestoCausado)} sobre un ingreso de ${fmtUSDec(ingreso)}.`,
  };

  return {
    impuestoCausado: fmtUSDec(impuestoCausado),
    baseImponible: fmtUSDec(baseImponible),
    impuestoSegunTabla: fmtUSDec(impuestoTabla),
    rebajaGastos: fmtUSDec(rebaja),
    tasaEfectiva: tasaEfectiva.toFixed(1) + '%',
    detalle: `Ingreso ${fmtUSDec(ingreso)} − IESS ${fmtUSDec(aporteIESS)} = base ${fmtUSDec(baseImponible)} → tabla ${fmtUSDec(impuestoTabla)}${gastos > 0 ? ` − rebaja ${fmtUSDec(rebaja)}` : ''} = ${fmtUSDec(impuestoCausado)}.`,
    _insight,
    _chart,
  };
}
