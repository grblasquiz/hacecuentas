/**
 * ITP — Impuesto a las Transmisiones Patrimoniales (Uruguay 2026).
 *
 * Grava la transmisión de inmuebles (compraventa, donación, etc.). La tasa es del
 * 2% para el COMPRADOR (adquirente) y 2% para el VENDEDOR (enajenante), aplicadas
 * sobre el VALOR REAL DE CATASTRO del inmueble (no sobre el precio de venta).
 *
 * Base legal: Título 19 del Texto Ordenado (DGI) — arts. 1 y ss.
 *
 * Nota: existen exoneraciones (p. ej. ciertas primeras enajenaciones de vivienda,
 * inmuebles del Estado, algunas operaciones promovidas). Esta calculadora estima
 * el ITP general sin contemplar exoneraciones particulares.
 *
 * Data: src/lib/data/uruguay-2026.ts (sólo para el formateo de moneda).
 */
import { fmtUYU } from '../data/uruguay-2026';

export interface ItpUruguayInputs {
  /** Valor real de catastro del inmueble, en pesos. */
  valorCatastral?: number | string;
  /** Rol del consultante: comprador | vendedor | ambos. */
  rol?: string;
}

export interface ItpUruguayOutputs {
  itpComprador: number;
  itpVendedor: number;
  itpTotal: number;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function itpUruguay(i: ItpUruguayInputs): ItpUruguayOutputs {
  const valorCatastral = Math.max(0, Number(i.valorCatastral) || 0);
  const rol = String(i.rol || 'ambos');

  const TASA = 0.02;
  const itpComprador = valorCatastral * TASA;
  const itpVendedor = valorCatastral * TASA;

  let itpTotal: number;
  if (rol === 'comprador') itpTotal = itpComprador;
  else if (rol === 'vendedor') itpTotal = itpVendedor;
  else itpTotal = itpComprador + itpVendedor;

  const rolTxt =
    rol === 'comprador' ? 'como comprador pagás' :
    rol === 'vendedor' ? 'como vendedor pagás' :
    'entre comprador y vendedor se paga';

  const detalle =
    `Valor de catastro ${fmtUYU(valorCatastral)} × 2% por parte = ${fmtUYU(itpComprador)} cada uno. ` +
    `${rolTxt.charAt(0).toUpperCase() + rolTxt.slice(1)} ${fmtUYU(itpTotal)} de ITP.`;

  return {
    itpComprador: Math.round(itpComprador),
    itpVendedor: Math.round(itpVendedor),
    itpTotal: Math.round(itpTotal),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🏠',
      text:
        rol === 'ambos'
          ? `Sobre un valor de catastro de **${fmtUYU(valorCatastral)}**, el ITP total de la operación es **${fmtUYU(itpTotal)}** (${fmtUYU(itpComprador)} el comprador + ${fmtUYU(itpVendedor)} el vendedor). Se calcula sobre el valor de catastro, no sobre el precio de venta.`
          : `Sobre un valor de catastro de **${fmtUYU(valorCatastral)}**, ${rolTxt} **${fmtUYU(itpTotal)}** de ITP (2% del valor de catastro). Recordá que la otra parte de la operación también paga su 2%.`,
      tone: 'info' as const,
    },
    _table: {
      title: 'ITP sobre el valor de catastro — Uruguay (tasa 2% + 2%)',
      headers: ['Valor de catastro ($U)', 'ITP comprador (2%)', 'ITP vendedor (2%)', 'ITP total (4%)'],
      rows: [3000000, 5000000, 8000000, 12000000, 20000000].map((v) => [
        fmtUYU(v),
        fmtUYU(v * TASA),
        fmtUYU(v * TASA),
        fmtUYU(v * TASA * 2),
      ]),
      note: 'El ITP se calcula sobre el valor real de catastro del inmueble (no sobre el precio pactado). Tasa 2% para el comprador y 2% para el vendedor (Título 19, DGI). No contempla exoneraciones particulares (primera vivienda promovida, inmuebles del Estado, etc.).',
    },
  };
}
