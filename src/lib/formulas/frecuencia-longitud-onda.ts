/** Frecuencia y longitud de onda: f = c / λ */
export interface Inputs { frecuenciaMhz: number; longitudOndaM: number; }
export interface Outputs { frecuenciaHz: number; longitudOndaResultado: string; antena4: number; detalle: string; }

const C = 299_792_458; // velocidad de la luz en m/s

export function frecuenciaLongitudOnda(i: Inputs): Outputs {
  const fMhz = Number(i.frecuenciaMhz) || 0;
  const lambda = Number(i.longitudOndaM) || 0;

  if (fMhz === 0 && lambda === 0) throw new Error('Ingresá la frecuencia o la longitud de onda (uno de los dos)');
  if (fMhz > 0 && lambda > 0) throw new Error('Dejá uno de los dos en 0 para calcularlo');

  let fHz: number;
  let lambdaM: number;

  if (fMhz > 0) {
    fHz = fMhz * 1_000_000;
    lambdaM = C / fHz;
  } else {
    lambdaM = lambda;
    fHz = C / lambdaM;
  }

  const antena4 = lambdaM / 4;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });
  const fmtF = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let lambdaTexto: string;
  if (lambdaM >= 1) {
    lambdaTexto = `${fmt.format(lambdaM)} m`;
  } else if (lambdaM >= 0.01) {
    lambdaTexto = `${fmt.format(lambdaM * 100)} cm`;
  } else if (lambdaM >= 0.000001) {
    lambdaTexto = `${fmt.format(lambdaM * 1000)} mm`;
  } else {
    lambdaTexto = `${fmt.format(lambdaM * 1_000_000_000)} nm`;
  }

  let fTexto: string;
  if (fHz >= 1e12) fTexto = `${fmt.format(fHz / 1e12)} THz`;
  else if (fHz >= 1e9) fTexto = `${fmt.format(fHz / 1e9)} GHz`;
  else if (fHz >= 1e6) fTexto = `${fmt.format(fHz / 1e6)} MHz`;
  else if (fHz >= 1e3) fTexto = `${fmt.format(fHz / 1e3)} kHz`;
  else fTexto = `${fmtF.format(fHz)} Hz`;

  return {
    frecuenciaHz: Number(fHz.toFixed(0)),
    longitudOndaResultado: lambdaTexto,
    antena4: Number(antena4.toFixed(6)),
    detalle: `f = ${fTexto}, λ = ${lambdaTexto}. Antena λ/4 = ${fmt.format(antena4)} m.`,
  };
}
