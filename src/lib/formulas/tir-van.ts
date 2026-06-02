/** TIR y VAN para inversión con flujo anual constante */
export interface Inputs {
  inversionInicial: number;
  flujoAnual: number;
  anos: number;
  tasaDescuento: number;
  __lang?: string;
}
export interface Outputs {
  van: number;
  tir: number;
  payback: number;
  totalRecibido: number;
  veredicto: string;
  _insight?: any;
}

export function tirVan(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errInv: 'Ingresá la inversión inicial',
      errFlujo: 'Ingresá el flujo anual esperado',
      errAnos: 'Ingresá los años del proyecto',
      errTasa: 'La tasa de descuento no puede ser negativa',
      veredictoNeutro: 'Neutro: VAN cero. La TIR iguala la tasa de descuento.',
      insTitle: 'Tu inversión en números',
    },
    en: {
      errInv: 'Enter the initial investment',
      errFlujo: 'Enter the expected annual cash flow',
      errAnos: 'Enter the number of project years',
      errTasa: 'The discount rate cannot be negative',
      veredictoNeutro: 'Neutral: NPV is zero. The IRR equals the discount rate.',
      insTitle: 'Your investment by the numbers',
    },
  } as const)[__lang];

  const inv = Number(i.inversionInicial);
  const flujo = Number(i.flujoAnual);
  const n = Number(i.anos);
  const tasa = Number(i.tasaDescuento) / 100;
  if (!inv || inv <= 0) throw new Error(T.errInv);
  if (!flujo) throw new Error(T.errFlujo);
  if (!n || n <= 0) throw new Error(T.errAnos);
  if (tasa < 0) throw new Error(T.errTasa);

  // VAN = -inversion + Σ flujo / (1+r)^t
  let van = -inv;
  for (let t = 1; t <= n; t++) van += flujo / Math.pow(1 + tasa, t);

  // TIR: tasa que hace VAN=0 — bisección
  let lo = -0.99;
  let hi = 10;
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2;
    let v = -inv;
    for (let t = 1; t <= n; t++) v += flujo / Math.pow(1 + mid, t);
    if (v > 0) lo = mid; else hi = mid;
  }
  const tir = (lo + hi) / 2;

  // Payback simple (sin descontar)
  const payback = flujo <= 0 ? Infinity : inv / flujo;

  const total = flujo * n;
  let veredicto = '';
  if (van > 0) veredicto = __lang === 'en'
    ? `Viable project: positive NPV at a ${(tasa * 100).toFixed(1)}% rate. IRR ${(tir * 100).toFixed(1)}% exceeds the opportunity cost.`
    : `Proyecto viable: VAN positivo a la tasa del ${(tasa * 100).toFixed(1)}%. TIR ${(tir * 100).toFixed(1)}% supera el costo de oportunidad.`;
  else if (van === 0) veredicto = T.veredictoNeutro;
  else veredicto = __lang === 'en'
    ? `Project not recommended: negative NPV — the investment yields less than the required ${(tasa * 100).toFixed(1)}% discount rate.`
    : `Proyecto no recomendable: VAN negativo — la inversión rinde menos que el ${(tasa * 100).toFixed(1)}% de descuento exigido.`;

  const vanR = Math.round(van);
  const tirPct = Number((tir * 100).toFixed(2));
  const paybackR = Number(payback.toFixed(2));
  const tasaPct = (tasa * 100).toFixed(1);
  const paybackFin = isFinite(paybackR);
  const fmtVan = Math.abs(vanR).toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');

  const insTone = vanR > 0 ? 'good' : (vanR < 0 ? 'warn' : 'neutral');
  const insText = __lang === 'en'
    ? (vanR >= 0
        ? `The project adds **$${fmtVan}** in present value over your ${tasaPct}% required return, with an IRR of **${tirPct}%**${paybackFin ? ` and a simple payback of **${paybackR} years**` : ''}. It clears your opportunity cost.`
        : `The project destroys **$${fmtVan}** in present value at your ${tasaPct}% required return: its IRR of **${tirPct}%** falls short of the rate you demand${paybackFin ? `, even though it nominally pays back in **${paybackR} years**` : ''}.`)
    : (vanR >= 0
        ? `El proyecto suma **$${fmtVan}** de valor presente por encima de tu tasa exigida del ${tasaPct}%, con una TIR del **${tirPct}%**${paybackFin ? ` y un payback simple de **${paybackR} años**` : ''}. Supera tu costo de oportunidad.`
        : `El proyecto destruye **$${fmtVan}** de valor presente a tu tasa exigida del ${tasaPct}%: su TIR del **${tirPct}%** queda por debajo de lo que pedís${paybackFin ? `, aunque nominalmente se recupere en **${paybackR} años**` : ''}.`);

  return {
    van: vanR,
    tir: tirPct,
    payback: paybackR,
    totalRecibido: Math.round(total),
    veredicto,
    _insight: {
      title: T.insTitle,
      text: insText,
      tone: insTone,
      icon: '📊',
    },
  };
}
