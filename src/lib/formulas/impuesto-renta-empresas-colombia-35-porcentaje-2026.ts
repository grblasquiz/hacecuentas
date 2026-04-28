export interface Inputs {
  utilidad_fiscal: number;
  sector: 'general' | 'financiera' | 'seguros' | 'telecom' | 'petroleo' | 'mineria';
  zona_franca: 'no' | 'buenaventura' | 'pereira' | 'otro';
  renta_gravable_anterior: number;
  dividendos_accionistas: number;
  retenciones_pagadas: number;
}

export interface Outputs {
  tarifa_aplicable: number;
  renta_ordinaria: number;
  sobretasa: number;
  renta_total_a_pagar: number;
  anticipo_siguiente: number;
  tasa_efectiva: number;
  impuesto_neto_retenciones: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 - DIAN, Estatuto Tributario art. 239
  const TARIFA_ORDINARIA = 0.35;  // 35% todas sociedades mercantiles
  const SOBRETASA_FINANCIERA = 0.05;  // 5% bancos, seguros (Superfinanciera)
  
  // Tarifas zonas francas - Decreto 4199/1993, Min. Comercio
  const TARIFAS_ZONA_FRANCA: Record<string, number> = {
    'no': TARIFA_ORDINARIA,
    'buenaventura': 0.00,  // Zona Franca Buenaventura operaciones exportación
    'pereira': 0.05,       // Zona Franca Pereira servicios internacionales
    'otro': 0.20           // Otras zonas francas autorizadas
  };
  
  // Validar entrada
  if (i.utilidad_fiscal < 0) {
    return {
      tarifa_aplicable: 0,
      renta_ordinaria: 0,
      sobretasa: 0,
      renta_total_a_pagar: 0,
      anticipo_siguiente: 0,
      tasa_efectiva: 0,
      impuesto_neto_retenciones: 0
    };
  }
  
  // 1. Determinar tarifa aplicable según zona franca
  let tarifa_zona = TARIFAS_ZONA_FRANCA[i.zona_franca] || TARIFA_ORDINARIA;
  
  // 2. Calcular renta ordinaria
  // Si está en zona franca con tarifa reducida, aplicamos esa; sino tarifa ordinaria
  const renta_ordinaria = i.utilidad_fiscal * tarifa_zona;
  
  // 3. Calcular sobretasa (aplica SIEMPRE sobre utilidad fiscal, no sobre renta ordinaria)
  // Solo si sector es financiero o seguros
  let sobretasa = 0;
  if (i.sector === 'financiera' || i.sector === 'seguros') {
    sobretasa = i.utilidad_fiscal * SOBRETASA_FINANCIERA;
  }
  
  // 4. Renta total a pagar (renta ordinaria + sobretasa - retenciones)
  const renta_bruta = renta_ordinaria + sobretasa;
  const renta_total_a_pagar = Math.max(0, renta_bruta - i.retenciones_pagadas);
  
  // 5. Tasa efectiva
  const tasa_efectiva = i.utilidad_fiscal > 0 
    ? (renta_bruta / i.utilidad_fiscal) * 100 
    : 0;
  
  // 6. Anticipo año siguiente
  // Base anticipo = renta gravable anterior - dividendos distribuidos
  // Tarifa anticipo = tarifa ordinaria + sobretasa (si aplica)
  const base_anticipo = Math.max(0, i.renta_gravable_anterior - i.dividendos_accionistas);
  const tarifa_anticipo = tarifa_zona + (i.sector === 'financiera' || i.sector === 'seguros' ? SOBRETASA_FINANCIERA : 0);
  const anticipo_siguiente = base_anticipo * tarifa_anticipo;
  
  // 7. Impuesto neto después retenciones
  const impuesto_neto_retenciones = renta_total_a_pagar;
  
  // 8. Tarifa aplicable a reportar (expresada como porcentaje)
  const tarifa_aplicable = (tarifa_zona + (i.sector === 'financiera' || i.sector === 'seguros' ? SOBRETASA_FINANCIERA : 0)) * 100;
  
  return {
    tarifa_aplicable: tarifa_aplicable,
    renta_ordinaria: Math.round(renta_ordinaria),
    sobretasa: Math.round(sobretasa),
    renta_total_a_pagar: Math.round(renta_total_a_pagar),
    anticipo_siguiente: Math.round(anticipo_siguiente),
    tasa_efectiva: Math.round(tasa_efectiva * 100) / 100,
    impuesto_neto_retenciones: Math.round(impuesto_neto_retenciones)
  };
}
