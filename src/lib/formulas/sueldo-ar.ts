/**
 * Calculadora de sueldo líquido Argentina
 * Basada en LCT (Ley de Contrato de Trabajo) + AFIP 2026
 *
 * Aportes personales (17%):
 *   - Jubilación (SIPA): 11%
 *   - Obra Social: 3%
 *   - PAMI (INSSJP): 3%
 *
 * Ganancias: MNI + escala compartida con `ganancias-sueldo.ts` — ambos importan
 * `_ganancias-escala.ts` para que el auto-updater patchee un solo lugar.
 */

import {
  MNI_MENSUAL_BASE,
  INCREMENTO_POR_FAMILIAR,
  aplicarEscalaMensual,
} from './_ganancias-escala';

export interface SueldoInputs {
  bruto: number;
  cargas: number; // cantidad de familiares a cargo
}

export interface SueldoOutputs {
  neto: number;
  aportes: number;
  ganancias: number;
  descuentoTotal: number;
  porcentajeDescuento: number;
  jubilacion: number;
  obraSocial: number;
  pami: number;
}

export function sueldoAR(inputs: SueldoInputs): SueldoOutputs {
  const bruto = Number(inputs.bruto);
  const cargas = Number(inputs.cargas) || 0;

  if (!bruto || bruto <= 0) {
    throw new Error('Ingresá un sueldo bruto válido');
  }

  // Aportes personales
  const jubilacion = bruto * 0.11;
  const obraSocial = bruto * 0.03;
  const pami = bruto * 0.03;
  const aportes = jubilacion + obraSocial + pami;

  // Base imponible para Ganancias
  const brutoSinAportes = bruto - aportes;
  const mni = MNI_MENSUAL_BASE + cargas * INCREMENTO_POR_FAMILIAR;
  const baseGanancias = Math.max(0, brutoSinAportes - mni);

  // Escala progresiva (compartida con ganancias-sueldo.ts vía _ganancias-escala.ts)
  const ganancias = aplicarEscalaMensual(baseGanancias).impuesto;

  const descuentoTotal = aportes + ganancias;
  const neto = bruto - descuentoTotal;
  const porcentajeDescuento = (descuentoTotal / bruto) * 100;

  return {
    neto: Math.round(neto),
    aportes: Math.round(aportes),
    ganancias: Math.round(ganancias),
    descuentoTotal: Math.round(descuentoTotal),
    porcentajeDescuento: Number(porcentajeDescuento.toFixed(2)),
    jubilacion: Math.round(jubilacion),
    obraSocial: Math.round(obraSocial),
    pami: Math.round(pami),
  };
}
