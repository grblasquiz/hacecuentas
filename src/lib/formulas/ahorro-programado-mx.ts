/**
 * Calculadora de ahorro programado con interés compuesto
 * Fórmula: M = P(1+r)^n + A[((1+r)^n - 1)/r]
 */

export interface Inputs {
  aporteMensual: number;
  tasaAnual: number; // %
  plazoMeses: number;
  aporteInicial?: number;
}

export interface Outputs {
  montoFinal: number;
  aportadoTotal: number;
  gananciaIntereses: number;
  tasaEfectivaAnual: number;
  mensaje: string;
}

export function ahorroProgramadoMx(i: Inputs): Outputs {
  const aporte = Number(i.aporteMensual);
  const tasa = Number(i.tasaAnual);
  const meses = Number(i.plazoMeses);
  const inicial = Number(i.aporteInicial ?? 0);

  if (!aporte || aporte <= 0) throw new Error('Ingresá el aporte mensual');
  if (!tasa || tasa <= 0) throw new Error('Ingresá la tasa anual');
  if (!meses || meses <= 0) throw new Error('Ingresá el plazo en meses');

  const r = (tasa / 100) / 12; // tasa mensual
  const factor = Math.pow(1 + r, meses);

  const valorInicial = inicial * factor;
  const valorAportes = aporte * ((factor - 1) / r);
  const montoFinal = valorInicial + valorAportes;

  const aportadoTotal = inicial + aporte * meses;
  const gananciaIntereses = montoFinal - aportadoTotal;
  const tasaEfectivaAnual = (Math.pow(1 + r, 12) - 1) * 100;

  return {
    montoFinal: Number(montoFinal.toFixed(2)),
    aportadoTotal: Number(aportadoTotal.toFixed(2)),
    gananciaIntereses: Number(gananciaIntereses.toFixed(2)),
    tasaEfectivaAnual: Number(tasaEfectivaAnual.toFixed(2)),
    mensaje: `Tras ${meses} meses aportando $${aporte}/mes, juntás $${montoFinal.toFixed(2)} (aportaste $${aportadoTotal.toFixed(2)} y ganaste $${gananciaIntereses.toFixed(2)} en intereses).`,
  };
}
