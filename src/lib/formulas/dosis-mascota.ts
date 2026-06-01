/** Dosis de medicamento por peso (referencia) */
export interface Inputs {
  pesoKg: number;
  dosisMgKg: number;
  concentracion?: number; // mg/ml de la presentación
  dosisPorDia?: number;
  __lang?: string;
}
export interface Outputs {
  dosisMgTotal: number;
  dosisMlTotal: number;
  dosisMlPorToma: number;
  tomasDia: number;
}

export function dosisMascota(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorPeso: 'Ingresá el peso',
      errorDosis: 'Ingresá la dosis',
    },
    en: {
      errorPeso: 'Enter the weight',
      errorDosis: 'Enter the dose',
    },
  } as const)[__lang];

  const peso = Number(i.pesoKg);
  const dosis = Number(i.dosisMgKg);
  const conc = Number(i.concentracion) || 0;
  const tomas = Number(i.dosisPorDia) || 1;
  if (!peso || peso <= 0) throw new Error(T.errorPeso);
  if (!dosis || dosis <= 0) throw new Error(T.errorDosis);

  const mgTotal = peso * dosis;
  const mlTotal = conc > 0 ? mgTotal / conc : 0;
  const mlPorToma = mlTotal / tomas;

  return {
    dosisMgTotal: Number(mgTotal.toFixed(2)),
    dosisMlTotal: Number(mlTotal.toFixed(2)),
    dosisMlPorToma: Number(mlPorToma.toFixed(2)),
    tomasDia: tomas,
  };
}
