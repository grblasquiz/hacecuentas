/** CAGR — Rendimiento anualizado compuesto de una inversión */

export interface Inputs {
  valorInicial: number;
  valorFinal: number;
  periodoAnios: number;
}

export interface Outputs {
  cagr: number;
  rendimientoTotal: number;
  multiplicador: number;
  formula: string;
  explicacion: string;
}

export function rendimientoAnualizadoInversion(i: Inputs): Outputs {
  const inicial = Number(i.valorInicial);
  const final2 = Number(i.valorFinal);
  const anios = Number(i.periodoAnios);

  if (!inicial || inicial <= 0) throw new Error('Ingresá el valor inicial');
  if (!final2 || final2 <= 0) throw new Error('Ingresá el valor final');
  if (!anios || anios <= 0) throw new Error('Ingresá el período en años');

  // CAGR = (Vf / Vi)^(1/n) - 1
  const multiplicador = final2 / inicial;
  const cagr = (Math.pow(multiplicador, 1 / anios) - 1) * 100;
  const rendimientoTotal = ((final2 - inicial) / inicial) * 100;

  const formula = `CAGR = ($${final2.toLocaleString()} / $${inicial.toLocaleString()})^(1/${anios}) - 1 = ${cagr.toFixed(2)}%`;
  const explicacion = `Inversión de $${inicial.toLocaleString()} creció a $${final2.toLocaleString()} en ${anios} año(s). Rendimiento total: ${rendimientoTotal.toFixed(2)}% (${multiplicador.toFixed(2)}x). Rendimiento anualizado compuesto (CAGR): ${cagr.toFixed(2)}% anual. Esto significa que si hubieras invertido al ${cagr.toFixed(2)}% anual compuesto, obtendrías el mismo resultado.`;

  return {
    cagr: Number(cagr.toFixed(4)),
    rendimientoTotal: Number(rendimientoTotal.toFixed(2)),
    multiplicador: Number(multiplicador.toFixed(4)),
    formula,
    explicacion,
  };
}
