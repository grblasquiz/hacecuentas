/**
 * Calculadora de ahorro programado con interés compuesto (MX)
 * Fórmula: M = P(1+r)^n + A[((1+r)^n - 1)/r]
 */

export interface Inputs {
  aportacionMensual: number;
  tasaAnual: number; // %
  plazoAnios: number;
  aporteInicial?: number;
  inflacionAnual?: number;
}

export interface Outputs {
  saldoNominal: number;
  saldoReal: number;
  totalAportado: number;
  interesesGanados: number;
  tasaEfectivaAnual: number;
  mensaje: string;
}

export function ahorroProgramadoMx(i: Inputs): Outputs {
  const aporte = Number(i.aportacionMensual);
  const tasa = Number(i.tasaAnual);
  const anios = Number(i.plazoAnios);
  const inicial = Number(i.aporteInicial ?? 0);
  const inflacion = Number(i.inflacionAnual ?? 0);

  if (!aporte || aporte <= 0) throw new Error('Ingresá la aportación mensual');
  if (!tasa || tasa <= 0) throw new Error('Ingresá la tasa anual');
  if (!anios || anios <= 0) throw new Error('Ingresá el plazo en años');

  const meses = anios * 12;
  const r = (tasa / 100) / 12; // tasa mensual
  const factor = Math.pow(1 + r, meses);

  const valorInicial = inicial * factor;
  const valorAportes = aporte * ((factor - 1) / r);
  const saldoNominal = valorInicial + valorAportes;

  const totalAportado = inicial + aporte * meses;
  const interesesGanados = saldoNominal - totalAportado;
  const tasaEfectivaAnual = (Math.pow(1 + r, 12) - 1) * 100;

  // Valor real descontando inflación compuesta
  const factorInflacion = Math.pow(1 + inflacion / 100, anios);
  const saldoReal = factorInflacion > 0 ? saldoNominal / factorInflacion : saldoNominal;

  return {
    saldoNominal: Number(saldoNominal.toFixed(2)),
    saldoReal: Number(saldoReal.toFixed(2)),
    totalAportado: Number(totalAportado.toFixed(2)),
    interesesGanados: Number(interesesGanados.toFixed(2)),
    tasaEfectivaAnual: Number(tasaEfectivaAnual.toFixed(2)),
    mensaje: `Tras ${anios} años aportando $${aporte}/mes, juntás $${saldoNominal.toFixed(2)} nominales ($${saldoReal.toFixed(2)} en valor real). Aportaste $${totalAportado.toFixed(2)} y ganaste $${interesesGanados.toFixed(2)} en intereses.`,
  };
}
