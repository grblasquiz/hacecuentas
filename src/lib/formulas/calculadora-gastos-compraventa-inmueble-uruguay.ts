/**
 * Gastos de compraventa de inmueble — Uruguay 2026 (escribano + ITP).
 *
 * Al comprar (o vender) un inmueble en Uruguay hay dos costos principales:
 *
 *  - ITP (Impuesto a las Transmisiones Patrimoniales, DGI): 2% POR PARTE
 *    (comprador Y vendedor pagan cada uno su 2%), calculado sobre el VALOR
 *    CATASTRAL del inmueble (no sobre el precio de mercado, que suele ser mayor).
 *  - HONORARIOS DEL ESCRIBANO (los paga el comprador): honorario base 3%
 *    (arancel REFERENCIAL de la AEU, negociable) sobre el mayor entre precio y
 *    valor catastral, + aporte a la Caja Notarial (15% del honorario) + IVA (22%
 *    sobre el honorario). El costo efectivo del escribano ronda el 4,2% del precio.
 *
 * Total del comprador (ITP 2% + escribano ~4,2% + timbres) ≈ 5–7% del precio.
 * El vendedor paga su ITP 2% (más su IRPF por incremento patrimonial y la
 * comisión inmobiliaria, que NO se calculan acá).
 *
 * ⚠️ Cálculo orientativo. No incluye la comisión inmobiliaria (~3% + IVA) ni el
 * IRPF del vendedor. Verificá con tu escribano y con la DGI.
 */
import { COMPRAVENTA_UY, fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Precio de compraventa acordado, en pesos. */
  precio: number;
  /** Valor catastral del padrón (si es 0/vacío, se usa el precio para el ITP y el honorario). */
  valorCatastral?: number;
  /** Rol en la operación: 'comprador' (por defecto), 'vendedor' o 'ambos'. */
  rol?: string;
}

export interface Outputs {
  total: string;
  itp: string;
  escribanoTotal: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const precio = Math.max(0, Number(i.precio) || 0);
  const vc = Math.max(0, Number(i.valorCatastral) || 0);
  const rol = i.rol === 'vendedor' || i.rol === 'ambos' ? i.rol : 'comprador';

  // Base del ITP: valor catastral si se ingresó; si no, el precio.
  const base = vc > 0 ? vc : precio;
  const itpUnaParte = base * COMPRAVENTA_UY.itpPorParte; // 2% por parte

  // Honorario del escribano sobre el mayor entre precio y valor catastral.
  const baseHonorario = Math.max(precio, base);
  const honorarioBase = baseHonorario * COMPRAVENTA_UY.escribanoHonorario; // 3%
  const cajaNotarial = honorarioBase * COMPRAVENTA_UY.cajaNotarialSobreHonorario; // 15% del honorario
  const ivaHon = honorarioBase * COMPRAVENTA_UY.ivaHonorario; // 22% del honorario
  const escribanoTotal = honorarioBase + cajaNotarial + ivaHon;

  // Según el rol, qué ITP y qué escribano corresponden y cuál es el total.
  let itpMostrado: number;
  let escribanoMostrado: number;
  let total: number;
  if (rol === 'vendedor') {
    itpMostrado = itpUnaParte;      // el vendedor paga su 2%
    escribanoMostrado = 0;          // el escribano lo paga el comprador
    total = itpUnaParte;
  } else if (rol === 'ambos') {
    itpMostrado = itpUnaParte * 2;  // ITP de las dos partes
    escribanoMostrado = escribanoTotal;
    total = itpUnaParte * 2 + escribanoTotal;
  } else {
    itpMostrado = itpUnaParte;      // comprador: su 2%
    escribanoMostrado = escribanoTotal;
    total = itpUnaParte + escribanoTotal;
  }

  const pctPrecio = precio > 0 ? (total / precio) * 100 : 0;
  const baseTxt = vc > 0 ? `valor catastral ${fmtUYU(base)}` : `precio ${fmtUYU(base)} (no ingresaste valor catastral)`;

  const rolTxt =
    rol === 'vendedor'
      ? `Vendedor: sólo el ITP (2% de su parte) = ${fmtUYU(itpMostrado)}. Aparte quedan su IRPF por la venta y la comisión inmobiliaria.`
      : rol === 'ambos'
      ? `Total de la operación (comprador + vendedor): ITP de ambas partes ${fmtUYU(itpMostrado)} + escribano ${fmtUYU(escribanoMostrado)} = ${fmtUYU(total)}.`
      : `Comprador: ITP (2% de su parte) ${fmtUYU(itpMostrado)} + escribano ${fmtUYU(escribanoMostrado)} = ${fmtUYU(total)} (${pctPrecio.toFixed(1)}% del precio).`;

  const detalle =
    `ITP calculado sobre ${baseTxt}: 2% por parte = ${fmtUYU(itpUnaParte)}. ` +
    `Escribano: honorario 3% (${fmtUYU(honorarioBase)}) + Caja Notarial 15% (${fmtUYU(cajaNotarial)}) + IVA 22% (${fmtUYU(ivaHon)}) = ${fmtUYU(escribanoTotal)}. ` +
    rolTxt;

  return {
    total: fmtUYU(total),
    itp: fmtUYU(itpMostrado),
    escribanoTotal: fmtUYU(escribanoMostrado),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '📝',
      tone: 'info' as const,
      text:
        rol === 'vendedor'
          ? `Como **vendedor** pagás sólo el **ITP: ${fmtUYU(itpMostrado)}** (2% sobre el valor catastral). ` +
            `Aparte tenés el **IRPF por incremento patrimonial** y la **comisión inmobiliaria** (~3% + IVA), que se calculan por separado.`
          : rol === 'ambos'
          ? `Sumando las dos partes, la operación tiene **${fmtUYU(total)}** de costos de escritura: ` +
            `ITP de comprador y vendedor (${fmtUYU(itpMostrado)}) más el escribano (${fmtUYU(escribanoMostrado)}). No incluye comisión ni IRPF del vendedor.`
          : `Como **comprador** vas a pagar unos **${fmtUYU(total)}** (${pctPrecio.toFixed(1)}% del precio): ` +
            `**${fmtUYU(itpMostrado)}** de ITP (2%) y **${fmtUYU(escribanoMostrado)}** de escribano (~4,2%). ` +
            `El honorario del 3% es arancel referencial de la AEU: se puede negociar.`,
    },
    _table: {
      title: 'Costo del comprador (ITP + escribano) — estimación',
      headers: ['Precio (= valor catastral)', 'ITP 2%', 'Escribano (~4,2%)', 'Total comprador', '% del precio'],
      rows: [3000000, 5000000, 8000000, 12000000, 20000000].map((p) => {
        const itpP = p * COMPRAVENTA_UY.itpPorParte;
        const honB = p * COMPRAVENTA_UY.escribanoHonorario;
        const escT = honB + honB * COMPRAVENTA_UY.cajaNotarialSobreHonorario + honB * COMPRAVENTA_UY.ivaHonorario;
        const tot = itpP + escT;
        return [fmtUYU(p), fmtUYU(itpP), fmtUYU(escT), fmtUYU(tot), `${((tot / p) * 100).toFixed(1)}%`];
      }),
      note:
        'Estimación asumiendo valor catastral igual al precio. El ITP se calcula sobre el valor catastral (suele ser ' +
        'menor al precio, lo que baja el ITP). El honorario del 3% es arancel referencial de la AEU (negociable). ' +
        'No incluye comisión inmobiliaria ni el IRPF del vendedor. Orientativo: confirmá con tu escribano.',
    },
  };
}
