/**
 * Calculadora de sueldo líquido Argentina
 * Basada en LCT (Ley de Contrato de Trabajo) + AFIP 2026
 *
 * Aportes personales (17%):
 *   - Jubilación (SIPA): 11%
 *   - Obra Social: 3%
 *   - PAMI (INSSJP): 3%
 *
 * Impuesto a las Ganancias: tabla simplificada 2026
 * Mínimo no imponible aprox: $2.280.000/mes bruto para soltero sin hijos
 * (valores actualizados anualmente, a validar con AFIP)
 */

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

  // Mínimo no imponible mensual aproximado (2026 — ajustar periódicamente)
  const mni = 2280000 + cargas * 400000; // MNI + deducción por familiar
  const baseGanancias = Math.max(0, brutoSinAportes - mni);

  // Escala de Ganancias simplificada (alícuota promedio progresiva)
  let ganancias = 0;
  if (baseGanancias > 0) {
    if (baseGanancias <= 500000) ganancias = baseGanancias * 0.05;
    else if (baseGanancias <= 1000000) ganancias = 25000 + (baseGanancias - 500000) * 0.09;
    else if (baseGanancias <= 1500000) ganancias = 70000 + (baseGanancias - 1000000) * 0.12;
    else if (baseGanancias <= 2500000) ganancias = 130000 + (baseGanancias - 1500000) * 0.15;
    else if (baseGanancias <= 4000000) ganancias = 280000 + (baseGanancias - 2500000) * 0.19;
    else ganancias = 565000 + (baseGanancias - 4000000) * 0.27;
  }

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
