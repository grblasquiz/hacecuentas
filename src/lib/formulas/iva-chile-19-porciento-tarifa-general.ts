export interface Inputs {
  monto_base: number;
  modo: 'neto_a_total' | 'total_a_neto';
  aplica_exencion: 'no' | 'salud' | 'educacion' | 'transporte' | 'exportacion';
}

export interface Outputs {
  monto_iva: number;
  precio_neto: number;
  precio_total: number;
  tasa_iva_aplicada: number;
}

export function compute(i: Inputs): Outputs {
  // Constante IVA Chile 2026: 19% uniforme (SII)
  const TASA_IVA = 0.19;
  
  // Determine effective IVA rate based on exemption
  let tasa_efectiva = TASA_IVA;
  if (
    i.aplica_exencion === 'salud' ||
    i.aplica_exencion === 'educacion' ||
    i.aplica_exencion === 'transporte' ||
    i.aplica_exencion === 'exportacion'
  ) {
    tasa_efectiva = 0; // Servicios exentos: 0% IVA
  }
  
  let precio_neto: number;
  let precio_total: number;
  let monto_iva: number;
  
  if (i.modo === 'neto_a_total') {
    // Tenemos precio neto, calculamos total
    precio_neto = i.monto_base;
    monto_iva = precio_neto * tasa_efectiva;
    precio_total = precio_neto + monto_iva;
  } else {
    // Tenemos precio total, extraemos neto
    precio_total = i.monto_base;
    
    if (tasa_efectiva === 0) {
      // Si es exento, el total es el neto
      precio_neto = precio_total;
      monto_iva = 0;
    } else {
      // Fórmula inversa: precio_neto = precio_total / (1 + tasa_iva)
      precio_neto = precio_total / (1 + tasa_efectiva);
      monto_iva = precio_total - precio_neto;
    }
  }
  
  // Redondear a centenas (estándar SII en facturación)
  const redondear = (num: number): number => Math.round(num / 100) * 100;
  
  return {
    monto_iva: redondear(monto_iva),
    precio_neto: redondear(precio_neto),
    precio_total: redondear(precio_total),
    tasa_iva_aplicada: tasa_efectiva * 100
  };
}
