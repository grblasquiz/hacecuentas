export interface Inputs {
  sueldo_bruto: number;
  incluir_cotizaciones: boolean;
}

export interface Outputs {
  utm_2026: number;
  base_imponible_utm: number;
  tramo_actual: string;
  tasa_marginal: number;
  iusc_calculado: number;
  sueldo_neto: number;
  tasa_efectiva: number;
  detalle_tramos: string;
}

export function compute(i: Inputs): Outputs {
  // UTM 2026 (valor promedio vigente abril 2026, SII)
  const UTM_2026 = 67065;
  
  // Cotizaciones obligatorias aproximadas (AFP 10% + Salud 7%)
  const tasa_cotizaciones = 0.17;
  
  // Calcular base imponible
  let base_imponible = i.sueldo_bruto;
  if (i.incluir_cotizaciones) {
    base_imponible = i.sueldo_bruto * (1 - tasa_cotizaciones);
  }
  
  // Convertir a UTM
  const base_utm = base_imponible / UTM_2026;
  
  // Tabla de tramos IUSC 2026 (según SII)
  // Estructura: { desde_utm, hasta_utm, tasa_marginal, impuesto_base }
  const tramos = [
    { desde: 0, hasta: 13.5, tasa: 0, impuesto_acumulado: 0, nombre: 'Exento' },
    { desde: 13.5, hasta: 30, tasa: 0.04, impuesto_acumulado: 0, nombre: '4%' },
    { desde: 30, hasta: 50, tasa: 0.08, impuesto_acumulado: 66, nombre: '8%' },
    { desde: 50, hasta: 70, tasa: 0.135, impuesto_acumulado: 1668, nombre: '13.5%' },
    { desde: 70, hasta: 90, tasa: 0.23, impuesto_acumulado: 4358, nombre: '23%' },
    { desde: 90, hasta: 120, tasa: 0.304, impuesto_acumulado: 8958, nombre: '30.4%' },
    { desde: 120, hasta: 310, tasa: 0.35, impuesto_acumulado: 18174, nombre: '35%' },
    { desde: 310, hasta: Infinity, tasa: 0.40, impuesto_acumulado: 84174, nombre: '40%' }
  ];
  
  // Determinar tramo aplicable
  let tramo_aplicable = tramos[0];
  let tramo_nombre = 'Exento';
  
  for (let t of tramos) {
    if (base_utm >= t.desde && base_utm < t.hasta) {
      tramo_aplicable = t;
      tramo_nombre = `${t.desde} a ${t.hasta === Infinity ? '+' : t.hasta} UTM (${t.nombre})`;
      break;
    }
  }
  
  // Calcular IUSC
  let iusc = 0;
  if (base_utm > 13.5) {
    const exceso_utm = Math.max(0, base_utm - 13.5);
    let impuesto_base_pesos = tramo_aplicable.impuesto_acumulado * UTM_2026;
    let impuesto_marginal = 0;
    
    if (base_utm <= 30) {
      impuesto_marginal = (base_utm - 13.5) * 0.04 * UTM_2026;
      iusc = impuesto_marginal;
    } else if (base_utm <= 50) {
      impuesto_marginal = (base_utm - 30) * 0.08 * UTM_2026;
      iusc = 66 * UTM_2026 + impuesto_marginal;
    } else if (base_utm <= 70) {
      impuesto_marginal = (base_utm - 50) * 0.135 * UTM_2026;
      iusc = 1668 * UTM_2026 + impuesto_marginal;
    } else if (base_utm <= 90) {
      impuesto_marginal = (base_utm - 70) * 0.23 * UTM_2026;
      iusc = 4358 * UTM_2026 + impuesto_marginal;
    } else if (base_utm <= 120) {
      impuesto_marginal = (base_utm - 90) * 0.304 * UTM_2026;
      iusc = 8958 * UTM_2026 + impuesto_marginal;
    } else if (base_utm <= 310) {
      impuesto_marginal = (base_utm - 120) * 0.35 * UTM_2026;
      iusc = 18174 * UTM_2026 + impuesto_marginal;
    } else {
      impuesto_marginal = (base_utm - 310) * 0.40 * UTM_2026;
      iusc = 84174 * UTM_2026 + impuesto_marginal;
    }
  }
  
  // Redondear a peso (sin centavos)
  iusc = Math.round(iusc);
  
  // Calcular sueldo neto (descuentos: cotizaciones + IUSC)
  const descuentos = (i.incluir_cotizaciones ? i.sueldo_bruto * tasa_cotizaciones : 0) + iusc;
  const sueldo_neto = i.sueldo_bruto - descuentos;
  
  // Tasa efectiva
  const tasa_efectiva = i.sueldo_bruto > 0 ? (iusc / i.sueldo_bruto) : 0;
  
  // Desglose por tramos (informativo)
  let detalle_tramos = '';
  if (base_utm <= 13.5) {
    detalle_tramos = 'Bajo exención (0% IUSC). Solo AFP y Salud.';
  } else if (base_utm <= 30) {
    const exceso = base_utm - 13.5;
    detalle_tramos = `Tramo 13.5–30 UTM: ${exceso.toFixed(2)} UTM × 4% = $${Math.round(exceso * 0.04 * UTM_2026).toLocaleString('es-CL')}`;
  } else if (base_utm <= 50) {
    const exceso = base_utm - 30;
    detalle_tramos = `Tramo 30–50 UTM: Base $${Math.round(66 * UTM_2026).toLocaleString('es-CL')} + (${exceso.toFixed(2)} UTM × 8%) = $${Math.round(66 * UTM_2026 + exceso * 0.08 * UTM_2026).toLocaleString('es-CL')}`;
  } else {
    detalle_tramos = `Tramo > ${tramo_aplicable.desde} UTM: Tasa ${(tramo_aplicable.tasa * 100).toFixed(1)}%`;
  }
  
  return {
    utm_2026: UTM_2026,
    base_imponible_utm: Math.round(base_utm * 100) / 100,
    tramo_actual: tramo_nombre,
    tasa_marginal: tramo_aplicable.tasa,
    iusc_calculado: iusc,
    sueldo_neto: Math.round(sueldo_neto),
    tasa_efectiva: Math.round(tasa_efectiva * 10000) / 10000,
    detalle_tramos: detalle_tramos
  };
}
