/** Hot Sale Argentina: ahorro total combinando descuento + cupón + envío + cashback */
export interface Inputs {
  precioLista: number;
  descuentoPct: number;
  cuponPct: number;
  envioPesos: number;
  cashbackPct: number;
}
export interface Outputs {
  precioConDescuento: number;
  cuponPesos: number;
  cashbackPesos: number;
  precioFinal: number;
  ahorroTotal: number;
  ahorroPctEfectivo: string;
  desglose: string;
}

export function hotSaleAhorroTotalDescuentoCashbackCupon(i: Inputs): Outputs {
  const precio = Number(i.precioLista);
  const desc = Number(i.descuentoPct) || 0;
  const cupon = Number(i.cuponPct) || 0;
  const envio = Number(i.envioPesos) || 0;
  const cashback = Number(i.cashbackPct) || 0;

  if (!precio || precio <= 0) throw new Error('Ingresá un precio de lista válido');
  if (desc < 0 || desc > 100) throw new Error('Descuento debe ser 0–100%');
  if (cupon < 0 || cupon > 100) throw new Error('Cupón debe ser 0–100%');
  if (cashback < 0 || cashback > 100) throw new Error('Cashback debe ser 0–100%');
  if (envio < 0) throw new Error('Envío no puede ser negativo');

  const precioConDescuento = precio * (1 - desc / 100);
  const precioConCupon = precioConDescuento * (1 - cupon / 100);
  const subtotalPago = precioConCupon + envio;
  const cashbackPesos = subtotalPago * (cashback / 100);
  const precioFinal = subtotalPago - cashbackPesos;
  const ahorroTotal = precio - precioFinal;
  const ahorroPctEfectivo = (ahorroTotal / precio) * 100;

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  const partes = [
    `Lista $${fmt(precio)}`,
    desc > 0 ? `−${desc}% desc → $${fmt(precioConDescuento)}` : null,
    cupon > 0 ? `−${cupon}% cupón → $${fmt(precioConCupon)}` : null,
    envio > 0 ? `+$${fmt(envio)} envío → $${fmt(subtotalPago)}` : null,
    cashback > 0 ? `−$${fmt(cashbackPesos)} cashback (${cashback}%)` : null,
    `final $${fmt(precioFinal)}`,
  ].filter(Boolean);

  return {
    precioConDescuento: Math.round(precioConDescuento),
    cuponPesos: Math.round(precioConDescuento - precioConCupon),
    cashbackPesos: Math.round(cashbackPesos),
    precioFinal: Math.round(precioFinal),
    ahorroTotal: Math.round(ahorroTotal),
    ahorroPctEfectivo: `${ahorroPctEfectivo.toFixed(1)}%`,
    desglose: partes.join(' · '),
  };
}
