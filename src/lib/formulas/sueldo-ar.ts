/**
 * Calculadora de sueldo líquido Argentina
 * Basada en LCT (Ley de Contrato de Trabajo) + AFIP/ARCA 2026
 *
 * Aportes personales (17%):
 *   - Jubilación (SIPA): 11%
 *   - Obra Social: 3%
 *   - PAMI (INSSJP): 3%
 *
 * Ganancias: MNI + escala compartida con `ganancias-sueldo.ts` — ambos importan
 * `_ganancias-escala.ts` para que el auto-updater patchee un solo lugar.
 *
 * Inputs nuevos (2026): conyuge (bool) + hijos (number) separados, porque ARCA
 * deduce $404k/mes por cónyuge y $204k/mes por hijo — son valores distintos.
 * Si sólo llega el campo legacy `cargas`, se asume 1 cónyuge + resto hijos.
 */

import {
  MNI_MENSUAL_BASE,
  INCREMENTO_CONYUGE_MENSUAL,
  INCREMENTO_HIJO_MENSUAL,
  aplicarEscalaMensual,
} from './_ganancias-escala';

export interface SueldoInputs {
  bruto: number;
  /** Cónyuge a cargo (bool). Preferido sobre `cargas`. */
  conyuge?: boolean | string;
  /** Hijos a cargo (number). Preferido sobre `cargas`. */
  hijos?: number | string;
  /** @deprecated Input legacy genérico. Se usa sólo si conyuge/hijos no vienen. */
  cargas?: number | string;
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
  if (!bruto || bruto <= 0) {
    throw new Error('Ingresá un sueldo bruto válido');
  }

  // Resolver familia: si vienen los campos nuevos, usarlos. Si no, degradar desde
  // `cargas` asumiendo 1 cónyuge + (n-1) hijos — es la interpretación más típica
  // en calcs que pedían "familiares a cargo" como un único select.
  let conyuge: boolean;
  let hijos: number;
  if (inputs.conyuge !== undefined || inputs.hijos !== undefined) {
    conyuge =
      inputs.conyuge === true ||
      inputs.conyuge === 'true' ||
      inputs.conyuge === 'si' ||
      inputs.conyuge === 1 ||
      inputs.conyuge === '1';
    hijos = Math.max(0, Math.min(10, Number(inputs.hijos) || 0));
  } else {
    const cargas = Math.max(0, Math.min(10, Number(inputs.cargas) || 0));
    conyuge = cargas >= 1;
    hijos = Math.max(0, cargas - 1);
  }

  // Aportes personales
  const jubilacion = bruto * 0.11;
  const obraSocial = bruto * 0.03;
  const pami = bruto * 0.03;
  const aportes = jubilacion + obraSocial + pami;

  // Base imponible para Ganancias — valores diferenciados cónyuge/hijo (ARCA 2026)
  const brutoSinAportes = bruto - aportes;
  const deduccionFamilia =
    (conyuge ? INCREMENTO_CONYUGE_MENSUAL : 0) + hijos * INCREMENTO_HIJO_MENSUAL;
  const mni = MNI_MENSUAL_BASE + deduccionFamilia;
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
