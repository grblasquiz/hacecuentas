import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface DolarHoyUruguayInputs {
  /** Monto a convertir. */
  monto: number;
  /** Dirección de la conversión. */
  direccion: 'usd-uyu' | 'uyu-usd';
}

export interface DolarHoyUruguayOutputs {
  resultado: string;
  cotizacion: string;
  pizarra: string;
  fecha: string;
}

/** Formatea un monto en dólares: "US$ 1.234,56". */
function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Math.round(n * 100) / 100,
  );
}

/**
 * Conversor dólar (USD) ⇄ peso uruguayo (UYU) con la cotización interbancaria del BCU
 * y la pizarra compra/venta del BROU (snapshot, ver data file).
 *
 * - USD → UYU: se usa la VENTA del BROU (es a lo que comprás dólares; para pasar dólares a pesos
 *   mostramos el interbancario de referencia y aclaramos la pizarra).
 * - Para la conversión usamos el tipo interbancario (referencia oficial promedio); la pizarra
 *   compra/venta se informa aparte porque es lo que efectivamente cobra/paga el banco.
 */
export function dolarHoyUruguay(inputs: DolarHoyUruguayInputs): DolarHoyUruguayOutputs {
  const monto = Math.max(0, Number(inputs.monto) || 0);
  const direccion = inputs.direccion || 'usd-uyu';

  const ref = URUGUAY_2026.usd.interbancario; // referencia BCU
  const compra = URUGUAY_2026.usd.brouCompra; // a este precio el banco te COMPRA dólares
  const venta = URUGUAY_2026.usd.brouVenta;   // a este precio el banco te VENDE dólares

  let resultado: string;
  if (direccion === 'usd-uyu') {
    // Pasar dólares a pesos: a la referencia, y también cuánto cobrás si los vendés (compra del banco).
    const enPesosRef = monto * ref;
    const enPesosVendiendo = monto * compra;
    resultado =
      `${fmtUSD(monto)} = ${fmtUYU(enPesosRef)} (referencia BCU). ` +
      `Si vendés tus dólares en el BROU (compra ${fmtUYU(compra)}): ${fmtUYU(enPesosVendiendo)}.`;
  } else {
    // Pasar pesos a dólares: a la referencia, y cuántos dólares comprás (venta del banco).
    const enDolaresRef = ref > 0 ? monto / ref : 0;
    const enDolaresComprando = venta > 0 ? monto / venta : 0;
    resultado =
      `${fmtUYU(monto)} = ${fmtUSD(enDolaresRef)} (referencia BCU). ` +
      `Si comprás dólares en el BROU (venta ${fmtUYU(venta)}): ${fmtUSD(enDolaresComprando)}.`;
  }

  const spreadPct = ref > 0 ? ((venta - compra) / ref) * 100 : 0;

  return {
    resultado,
    cotizacion: `1 USD = ${fmtUYU(ref)} (interbancario BCU)`,
    pizarra: `Pizarra BROU — compra ${fmtUYU(compra)} · venta ${fmtUYU(venta)} (spread ≈ ${spreadPct.toFixed(1)}%)`,
    fecha: `Cotización al ${URUGUAY_2026.usd.fecha}`,
  };
}
