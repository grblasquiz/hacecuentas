/** TIR y VAN para inversión con flujo anual constante */
export interface Inputs {
  inversionInicial: number;
  flujoAnual: number;
  anos: number;
  tasaDescuento: number;
}
export interface Outputs {
  van: number;
  tir: number;
  payback: number;
  totalRecibido: number;
  veredicto: string;
}

export function tirVan(i: Inputs): Outputs {
  const inv = Number(i.inversionInicial);
  const flujo = Number(i.flujoAnual);
  const n = Number(i.anos);
  const tasa = Number(i.tasaDescuento) / 100;
  if (!inv || inv <= 0) throw new Error('Ingresá la inversión inicial');
  if (!flujo) throw new Error('Ingresá el flujo anual esperado');
  if (!n || n <= 0) throw new Error('Ingresá los años del proyecto');
  if (tasa < 0) throw new Error('La tasa de descuento no puede ser negativa');

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
  if (van > 0) veredicto = `Proyecto viable: VAN positivo a la tasa del ${(tasa * 100).toFixed(1)}%. TIR ${(tir * 100).toFixed(1)}% supera el costo de oportunidad.`;
  else if (van === 0) veredicto = 'Neutro: VAN cero. La TIR iguala la tasa de descuento.';
  else veredicto = `Proyecto no recomendable: VAN negativo — la inversión rinde menos que el ${(tasa * 100).toFixed(1)}% de descuento exigido.`;

  return {
    van: Math.round(van),
    tir: Number((tir * 100).toFixed(2)),
    payback: Number(payback.toFixed(2)),
    totalRecibido: Math.round(total),
    veredicto,
  };
}
