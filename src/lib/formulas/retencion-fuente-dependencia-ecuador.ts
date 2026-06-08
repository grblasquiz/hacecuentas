/** Retención en la fuente de IR en relación de dependencia (Ecuador).
 *  Base anual = (sueldo×12 − aporte personal IESS − gastos personales deducibles); IR causado ÷ 12 = retención mensual. */
import { ECUADOR_2026, impuestoRentaEC, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  gastosPersonalesAnuales?: number; // gastos personales deducibles proyectados (opcional)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  // '' → default 0. Number('') === 0 entra acá igual que ausente.
  const gastos = Math.max(0, Number(i.gastosPersonalesAnuales) || 0);
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const ingresoAnual = sueldo * 12;
  const aporteIessAnual = ingresoAnual * ECUADOR_2026.iessPersonal; // 9,45%
  // Rebaja por gastos personales: 18% del menor entre gastos declarados y el tope aplicable.
  // Tomamos los gastos declarados como base de la rebaja (orientativo).
  const rebajaGastos = gastos * ECUADOR_2026.rebajaGastosPersonales;
  const baseImponible = Math.max(0, ingresoAnual - aporteIessAnual);
  const irCausado = Math.max(0, impuestoRentaEC(baseImponible) - rebajaGastos);
  const retencionMensual = irCausado / 12;

  const exento = baseImponible <= ECUADOR_2026.irFraccionBasicaDesgravada;

  const _insight = {
    title: 'Tu retención mensual de IR',
    text: exento
      ? `Con un sueldo de **${fmtUSDec(sueldo)}**, tu base imponible anual (${fmtUSDec(baseImponible)}) está por debajo de la fracción básica desgravada (${fmtUSDec(ECUADOR_2026.irFraccionBasicaDesgravada)}). **No te retienen impuesto a la renta**.`
      : `Con un sueldo de **${fmtUSDec(sueldo)}**, tu empleador te retiene aproximadamente **${fmtUSDec(retencionMensual)}** cada mes por impuesto a la renta. En el año proyectado equivale a **${fmtUSDec(irCausado)}**.`,
    tone: exento ? 'good' : 'neutral',
    icon: '💸',
  };
  const _chart = {
    type: 'gauge',
    value: Math.round(retencionMensual * 100) / 100,
    min: 0,
    max: Math.round(sueldo * 100) / 100,
    label: fmtUSDec(retencionMensual),
    ariaLabel: `Retención mensual ${fmtUSDec(retencionMensual)} sobre un sueldo de ${fmtUSDec(sueldo)}.`,
  };

  return {
    retencionMensual: fmtUSDec(retencionMensual),
    irAnual: fmtUSDec(irCausado),
    baseImponible: fmtUSDec(baseImponible),
    detalle: `Ingreso anual ${fmtUSDec(ingresoAnual)} − IESS ${fmtUSDec(aporteIessAnual)} = base ${fmtUSDec(baseImponible)}. IR causado ${fmtUSDec(irCausado)} ÷ 12.`,
    _insight,
    _chart,
  };
}
