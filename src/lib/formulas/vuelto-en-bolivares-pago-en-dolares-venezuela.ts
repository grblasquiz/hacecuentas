/**
 * Vuelto en bolívares al pagar en dólares — Venezuela.
 *
 * Escenario típico de la dolarización de facto: un producto tiene un precio
 * (en USD o en Bs.), pagás con billetes de dólar y el comercio te da el vuelto
 * en bolívares a SU tasa del día.
 *
 *   precioBs  = (monedaPrecio == 'usd') ? precio × tasa : precio
 *   pagadoBs  = pagoUSD × tasa
 *   vueltoBs  = pagadoBs − precioBs
 *
 * Si el vuelto da negativo, el pago en dólares no alcanza y falta completar.
 * La tasa por defecto es la paralela en vivo (la que suelen usar los comercios),
 * editable porque cambia a diario y cada local aplica la suya.
 *
 * Fuente de la tasa oficial de referencia: BCV. Tasa de comercio: mercado
 * paralelo (Monitor Dólar).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  precio?: number;
  monedaPrecio?: string;  // 'usd' | 'bs'
  pagoUSD?: number;       // billetes de dólar entregados
  tasa?: number;          // Bs. por USD que aplica el comercio; default paralelo en vivo
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function compute(i: Inputs): Outputs {
  const fx = VENEZUELA_2026.fx;
  const precio = Math.max(0, Number(i.precio) || 0);
  const pagoUSD = Math.max(0, Number(i.pagoUSD) || 0);
  if (precio <= 0) throw new Error('Ingresá el precio del producto');
  if (pagoUSD <= 0) throw new Error('Ingresá cuántos dólares entregás para pagar');

  const monedaPrecio = String(i.monedaPrecio ?? 'usd') === 'bs' ? 'bs' : 'usd';
  const tasa = i.tasa != null && Number(i.tasa) > 0 ? Number(i.tasa) : fx.paralelo;

  const precioBs = monedaPrecio === 'usd' ? precio * tasa : precio;
  const precioUsdEquiv = monedaPrecio === 'usd' ? precio : precio / tasa;
  const pagadoBs = pagoUSD * tasa;
  const vueltoBs = pagadoBs - precioBs;
  const vueltoUsdEquiv = vueltoBs / tasa;
  const alcanza = vueltoBs >= 0;

  const narrativa = alcanza
    ? `Un producto de ${monedaPrecio === 'usd' ? fmtUSD(precio) : fmtVES(precio)} (${fmtVES(precioBs)}) pagado con ${fmtUSD(pagoUSD)} en efectivo a la tasa de ${fmtVES(tasa)} por dólar: entregás ${fmtVES(pagadoBs)} y el vuelto es ${fmtVES(vueltoBs)} (equivalente a ${fmtUSD(vueltoUsdEquiv)}).`
    : `Con ${fmtUSD(pagoUSD)} no alcanzás a cubrir el precio de ${fmtVES(precioBs)} a la tasa de ${fmtVES(tasa)}: te faltan ${fmtVES(Math.abs(vueltoBs))} (${fmtUSD(Math.abs(vueltoUsdEquiv))}).`;

  return {
    vueltoBs: Number(vueltoBs.toFixed(2)),
    precioBs: Number(precioBs.toFixed(2)),
    pagadoBs: Number(pagadoBs.toFixed(2)),
    vueltoUsdEquivalente: Number(vueltoUsdEquiv.toFixed(2)),
    detalle: alcanza
      ? `Vuelto: ${fmtVES(vueltoBs)} (${fmtUSD(vueltoUsdEquiv)}) a la tasa ${fmtVES(tasa)}`
      : `Falta: ${fmtVES(Math.abs(vueltoBs))} para cubrir el precio`,
    _insight: { type: alcanza ? 'highlight' : 'warning', icon: alcanza ? '💵' : '⚠️', text: narrativa },
    _table: {
      title: 'Desglose del pago y el vuelto',
      headers: ['Concepto', 'Monto'],
      rows: [
        ['Precio del producto', `${fmtVES(precioBs)} (${fmtUSD(precioUsdEquiv)})`],
        ['Pagás en efectivo', `${fmtUSD(pagoUSD)} = ${fmtVES(pagadoBs)}`],
        ['Tasa aplicada', `${fmtVES(tasa)} por dólar`],
        [alcanza ? 'Vuelto en bolívares' : 'Falta pagar', alcanza ? `${fmtVES(vueltoBs)} (${fmtUSD(vueltoUsdEquiv)})` : fmtVES(Math.abs(vueltoBs))],
      ],
      note: 'El vuelto se calcula a la tasa que ingresás (normalmente la del comercio, cercana al paralelo). Muchos locales dan el vuelto en bolívares aunque pagues en dólares: conviene confirmar la tasa antes de pagar.',
    },
  };
}
