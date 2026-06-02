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
  _insight?: any;
}

export function dosisMascota(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorPeso: 'Ingresá el peso',
      errorDosis: 'Ingresá la dosis',
      insightTitle: 'Dosis calculada',
      insightWithMl: (mg: string, ml: string, tomas: number, perToma: string) =>
        `Tu mascota necesita **${mg} mg/día** en total, que con esa concentración equivalen a **${ml} ml/día**. Repartido en **${tomas} ${tomas === 1 ? 'toma' : 'tomas'}**, son **${perToma} ml por vez**. Es una referencia: confirmá siempre con tu veterinario.`,
      insightNoMl: (mg: string) =>
        `Tu mascota necesita **${mg} mg/día** en total. Cargá la **concentración (mg/ml)** del producto para saber cuántos **ml** medir en la jeringa. Es una referencia: confirmá con tu veterinario.`,
    },
    en: {
      errorPeso: 'Enter the weight',
      errorDosis: 'Enter the dose',
      insightTitle: 'Calculated dose',
      insightWithMl: (mg: string, ml: string, tomas: number, perToma: string) =>
        `Your pet needs **${mg} mg/day** in total, which at that concentration equals **${ml} ml/day**. Split into **${tomas} ${tomas === 1 ? 'dose' : 'doses'}**, that's **${perToma} ml each time**. This is a reference: always confirm with your vet.`,
      insightNoMl: (mg: string) =>
        `Your pet needs **${mg} mg/day** in total. Enter the product's **concentration (mg/ml)** to know how many **ml** to draw into the syringe. This is a reference: confirm with your vet.`,
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

  const mgStr = Number(mgTotal.toFixed(2)).toString();
  const _insight = {
    title: T.insightTitle,
    text: conc > 0
      ? T.insightWithMl(mgStr, Number(mlTotal.toFixed(2)).toString(), tomas, Number(mlPorToma.toFixed(2)).toString())
      : T.insightNoMl(mgStr),
    tone: 'neutral',
    icon: '💉',
  };

  return {
    dosisMgTotal: Number(mgTotal.toFixed(2)),
    dosisMlTotal: Number(mlTotal.toFixed(2)),
    dosisMlPorToma: Number(mlPorToma.toFixed(2)),
    tomasDia: tomas,
    _insight,
  };
}
