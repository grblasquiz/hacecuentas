/** CAGR — Rendimiento anualizado compuesto de una inversión */

export interface Inputs {
  valorInicial: number;
  valorFinal: number;
  periodoAnios: number;
  __lang?: string;
}

export interface Outputs {
  cagr: number;
  rendimientoTotal: number;
  multiplicador: number;
  formula: string;
  explicacion: string;
}

export function rendimientoAnualizadoInversion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errInicial: 'Ingresá el valor inicial',
      errFinal: 'Ingresá el valor final',
      errPeriodo: 'Ingresá el período en años',
    },
    en: {
      errInicial: 'Enter the initial value',
      errFinal: 'Enter the final value',
      errPeriodo: 'Enter the period in years',
    },
  } as const)[__lang];

  const inicial = Number(i.valorInicial);
  const final2 = Number(i.valorFinal);
  const anios = Number(i.periodoAnios);

  if (!inicial || inicial <= 0) throw new Error(T.errInicial);
  if (!final2 || final2 <= 0) throw new Error(T.errFinal);
  if (!anios || anios <= 0) throw new Error(T.errPeriodo);

  // CAGR = (Vf / Vi)^(1/n) - 1
  const multiplicador = final2 / inicial;
  const cagr = (Math.pow(multiplicador, 1 / anios) - 1) * 100;
  const rendimientoTotal = ((final2 - inicial) / inicial) * 100;

  const formula = `CAGR = ($${final2.toLocaleString()} / $${inicial.toLocaleString()})^(1/${anios}) - 1 = ${cagr.toFixed(2)}%`;
  const explicacion = __lang === 'en'
    ? `Investment of $${inicial.toLocaleString()} grew to $${final2.toLocaleString()} over ${anios} year(s). Total return: ${rendimientoTotal.toFixed(2)}% (${multiplicador.toFixed(2)}x). Compound annual growth rate (CAGR): ${cagr.toFixed(2)}% per year. This means that investing at ${cagr.toFixed(2)}% compounded annually would produce the same result.`
    : `Inversión de $${inicial.toLocaleString()} creció a $${final2.toLocaleString()} en ${anios} año(s). Rendimiento total: ${rendimientoTotal.toFixed(2)}% (${multiplicador.toFixed(2)}x). Rendimiento anualizado compuesto (CAGR): ${cagr.toFixed(2)}% anual. Esto significa que si hubieras invertido al ${cagr.toFixed(2)}% anual compuesto, obtendrías el mismo resultado.`;

  return {
    cagr: Number(cagr.toFixed(4)),
    rendimientoTotal: Number(rendimientoTotal.toFixed(2)),
    multiplicador: Number(multiplicador.toFixed(4)),
    formula,
    explicacion,
  };
}
