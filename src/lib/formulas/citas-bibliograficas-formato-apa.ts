/** Calculadora de cantidad de citas bibliográficas necesarias */

export interface Inputs {
  paginasTrabajo: number;
  factorCitas: number;
  porcentajePrimarias: number;
}

export interface Outputs {
  fuentesTotales: number;
  fuentesPrimarias: number;
  fuentesSecundarias: number;
  detalle: string;
}

export function citasBibliograficasFormatoApa(i: Inputs): Outputs {
  const paginas = Number(i.paginasTrabajo);
  const factor = Number(i.factorCitas);
  const pctPrimarias = Number(i.porcentajePrimarias);

  if (isNaN(paginas) || paginas < 1) {
    throw new Error('Ingresá la cantidad de páginas del trabajo (mínimo 1)');
  }
  if (isNaN(factor) || factor < 0.5 || factor > 3) {
    throw new Error('El factor de citas debe estar entre 0,5 y 3');
  }
  if (isNaN(pctPrimarias) || pctPrimarias < 0 || pctPrimarias > 100) {
    throw new Error('El porcentaje de fuentes primarias debe estar entre 0% y 100%');
  }

  const totales = Math.round(paginas * factor);
  const primarias = Math.round(totales * (pctPrimarias / 100));
  const secundarias = totales - primarias;

  return {
    fuentesTotales: totales,
    fuentesPrimarias: primarias,
    fuentesSecundarias: secundarias,
    detalle: `Para un trabajo de ${paginas} páginas: ${totales} fuentes recomendadas (${primarias} primarias + ${secundarias} secundarias)`,
  };
}
