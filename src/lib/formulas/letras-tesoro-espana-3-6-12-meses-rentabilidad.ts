export interface Inputs {
  importe_inversion: number; // euros
  plazo_meses: number; // 3, 6, 12
  tir_subasta: number; // porcentaje anual
  tipo_irpf: number; // 19, 21, 23, 27 (%)
  comparar_deposito?: number; // TIR depósito opcional (%)
}

export interface Outputs {
  precio_adquisicion: number; // euros
  valor_nominal: number; // euros
  rentabilidad_bruta: number; // euros
  irpf_a_pagar: number; // euros
  rentabilidad_neta: number; // euros
  tir_neta: number; // porcentaje
  importe_total_neto: number; // euros
  comparativa_deposito: number; // euros (opcional)
  tir_comparativa: number; // puntos porcentuales (opcional)
}

export function compute(i: Inputs): Outputs {
  // CONSTANTES 2026 ESPAÑA
  // Fuente: DGT (Dirección General del Tesoro), AEAT (Agencia Tributaria)
  const VALOR_NOMINAL_UNITARIO = 100; // euros por Letra del Tesoro
  const DIAS_EN_ANIO = 365; // estándar ACT/365
  
  // Mapeo de plazo en meses a días (aproximación estándar subastas)
  const plazo_dias = i.plazo_meses === 3 ? 91 
                   : i.plazo_meses === 6 ? 182 
                   : i.plazo_meses === 12 ? 364 
                   : 91;
  
  // 1. CALCULAR PRECIO DE ADQUISICIÓN (fórmula descuento simple)
  // P = Valor nominal / (1 + TIR × d/365)
  // TIR en decimal
  const tir_decimal = i.tir_subasta / 100;
  const factor_descuento = 1 + (tir_decimal * plazo_dias / DIAS_EN_ANIO);
  const precio_unitario = VALOR_NOMINAL_UNITARIO / factor_descuento;
  
  // Número de Letras que se compran
  const num_letras = i.importe_inversion / precio_unitario;
  
  // Precio de adquisición total
  const precio_adquisicion = num_letras * precio_unitario;
  
  // 2. VALOR NOMINAL A RECIBIR AL VENCIMIENTO
  const valor_nominal = num_letras * VALOR_NOMINAL_UNITARIO;
  
  // 3. RENTABILIDAD BRUTA (sin IRPF)
  const rentabilidad_bruta = valor_nominal - precio_adquisicion;
  
  // 4. IRPF A PAGAR (capital mobiliario)
  // Aplica al rendimiento (diferencia precio-valor nominal)
  // Fuente: AEAT, impuesto sobre la renta de capital mobiliario
  const tipo_irpf_decimal = i.tipo_irpf / 100;
  const irpf_a_pagar = rentabilidad_bruta * tipo_irpf_decimal;
  
  // 5. RENTABILIDAD NETA
  const rentabilidad_neta = rentabilidad_bruta - irpf_a_pagar;
  
  // 6. TIR NETA ANUALIZADA
  // TIR neta = (Rentabilidad neta / Precio adquisición) × (365/d) × 100
  const tir_neta = (rentabilidad_neta / precio_adquisicion) * (DIAS_EN_ANIO / plazo_dias) * 100;
  
  // 7. IMPORTE TOTAL NETO A RECIBIR
  const importe_total_neto = valor_nominal - irpf_a_pagar;
  
  // 8. COMPARATIVA CON DEPÓSITO BANCARIO (opcional)
  let comparativa_deposito = 0;
  let tir_comparativa = 0;
  
  if (i.comparar_deposito !== undefined && i.comparar_deposito > 0) {
    const tir_deposito_decimal = i.comparar_deposito / 100;
    
    // Rentabilidad bruta depósito (simple)
    const rentabilidad_bruta_deposito = i.importe_inversion * tir_deposito_decimal * (plazo_dias / DIAS_EN_ANIO);
    
    // IRPF sobre rendimiento depósito
    const irpf_deposito = rentabilidad_bruta_deposito * tipo_irpf_decimal;
    
    // Rentabilidad neta depósito
    const rentabilidad_neta_deposito = rentabilidad_bruta_deposito - irpf_deposito;
    
    // TIR neta depósito anualizada
    const tir_neta_deposito = (rentabilidad_neta_deposito / i.importe_inversion) * (DIAS_EN_ANIO / plazo_dias) * 100;
    
    // Diferencia absoluta (euros)
    comparativa_deposito = rentabilidad_neta - rentabilidad_neta_deposito;
    
    // Diferencia en puntos porcentuales (TIR neta)
    tir_comparativa = tir_neta - tir_neta_deposito;
  }
  
  // REDONDEO A 2 DECIMALES (euros y porcentajes estándar España)
  return {
    precio_adquisicion: Math.round(precio_adquisicion * 100) / 100,
    valor_nominal: Math.round(valor_nominal * 100) / 100,
    rentabilidad_bruta: Math.round(rentabilidad_bruta * 100) / 100,
    irpf_a_pagar: Math.round(irpf_a_pagar * 100) / 100,
    rentabilidad_neta: Math.round(rentabilidad_neta * 100) / 100,
    tir_neta: Math.round(tir_neta * 100) / 100,
    importe_total_neto: Math.round(importe_total_neto * 100) / 100,
    comparativa_deposito: Math.round(comparativa_deposito * 100) / 100,
    tir_comparativa: Math.round(tir_comparativa * 100) / 100
  };
}

// EJEMPLO DE USO:
// const ejemplo = compute({
//   importe_inversion: 10000,
//   plazo_meses: 12,
//   tir_subasta: 3.85,
//   tipo_irpf: 21,
//   comparar_deposito: 3.2
// });
// Resultado esperado (aproximado abril 2026):
// {
//   precio_adquisicion: 9634.06,
//   valor_nominal: 10000,
//   rentabilidad_bruta: 365.94,
//   irpf_a_pagar: 76.84,
//   rentabilidad_neta: 289.10,
//   tir_neta: 3.04,
//   importe_total_neto: 9923.16,
//   comparativa_deposito: 36.30,
//   tir_comparativa: 1.43
// }
