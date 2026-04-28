export interface Inputs {
  sueldo_bruto: number;
  tipo_afp: 'aporte_obligatorio' | 'voluntario_adicional';
  comision_afp: number;
  tipo_salud: 'fonasa' | 'isapre';
  porcentaje_isapre: number;
  num_hijos: number;
}

export interface Outputs {
  aporte_afp: number;
  comision_afp_monto: number;
  aporte_salud: number;
  seguro_cesantia: number;
  impuesto_segunda_categoria: number;
  total_descuentos: number;
  sueldo_liquido: number;
  tasa_descuento_efectiva: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Fuente SII
  const UTM_2026 = 69545; // Unidad Tributaria Mensual enero 2026
  const CREDITO_POR_HIJO_2026 = 12996; // Crédito impuesto por descendiente
  const TASA_AFP = 0.10; // 10% obligatorio
  const TASA_CESANTIA = 0.006; // 0.6% seguro cesantía
  const TASA_FONASA = 0.07; // 7% Fonasa
  
  // Validar inputs
  const sueldoBruto = Math.max(0, i.sueldo_bruto || 0);
  const comisionAFP = Math.max(0.5, Math.min(2.5, i.comision_afp || 1.45)) / 100;
  const numHijos = Math.max(0, Math.floor(i.num_hijos || 0));
  
  // 1. Aporte AFP (10% obligatorio)
  const aporteAFP = sueldoBruto * TASA_AFP;
  
  // 2. Comisión AFP (porcentaje del bruto)
  const comisionAFPMonto = sueldoBruto * comisionAFP;
  
  // 3. Aporte salud
  let aporteSalud = 0;
  if (i.tipo_salud === 'fonasa') {
    aporteSalud = sueldoBruto * TASA_FONASA;
  } else if (i.tipo_salud === 'isapre') {
    const porcentajeIsapre = Math.max(6, Math.min(12, i.porcentaje_isapre || 8.5)) / 100;
    aporteSalud = sueldoBruto * porcentajeIsapre;
  }
  
  // 4. Seguro cesantía
  const seguroCesantia = sueldoBruto * TASA_CESANTIA;
  
  // 5. Base imponible para impuesto segunda categoría
  const baseImponible = sueldoBruto - aporteAFP - comisionAFPMonto - aporteSalud - seguroCesantia;
  
  // 6. Cálculo impuesto segunda categoría según tabla SII 2026
  // Convertir a UTA para aplicar tabla progresiva
  const rentaEnUTA = baseImponible / UTM_2026;
  let tasaImpuesto = 0;
  let montoImpuestoBase = 0;
  
  if (rentaEnUTA <= 13.5) {
    tasaImpuesto = 0;
    montoImpuestoBase = 0;
  } else if (rentaEnUTA <= 20.2) {
    tasaImpuesto = 0.05;
    montoImpuestoBase = baseImponible * 0.05;
  } else if (rentaEnUTA <= 35.3) {
    tasaImpuesto = 0.10;
    montoImpuestoBase = baseImponible * 0.10;
  } else if (rentaEnUTA <= 58.9) {
    tasaImpuesto = 0.14;
    montoImpuestoBase = baseImponible * 0.14;
  } else if (rentaEnUTA <= 70.6) {
    tasaImpuesto = 0.17;
    montoImpuestoBase = baseImponible * 0.17;
  } else if (rentaEnUTA <= 105.9) {
    tasaImpuesto = 0.20;
    montoImpuestoBase = baseImponible * 0.20;
  } else if (rentaEnUTA <= 117.6) {
    tasaImpuesto = 0.23;
    montoImpuestoBase = baseImponible * 0.23;
  } else if (rentaEnUTA <= 176.4) {
    tasaImpuesto = 0.255;
    montoImpuestoBase = baseImponible * 0.255;
  } else if (rentaEnUTA <= 235.2) {
    tasaImpuesto = 0.285;
    montoImpuestoBase = baseImponible * 0.285;
  } else if (rentaEnUTA <= 282.1) {
    tasaImpuesto = 0.315;
    montoImpuestoBase = baseImponible * 0.315;
  } else if (rentaEnUTA <= 329) {
    tasaImpuesto = 0.345;
    montoImpuestoBase = baseImponible * 0.345;
  } else {
    tasaImpuesto = 0.37;
    montoImpuestoBase = baseImponible * 0.37;
  }
  
  // Aplicar crédito por hijos
  const creditoHijos = CREDITO_POR_HIJO_2026 * numHijos;
  const impuestoSegundaCategoria = Math.max(0, montoImpuestoBase - creditoHijos);
  
  // 7. Totales
  const totalDescuentos = aporteAFP + comisionAFPMonto + aporteSalud + seguroCesantia + impuestoSegundaCategoria;
  const sueldoLiquido = sueldoBruto - totalDescuentos;
  const tasaDescuentoEfectiva = sueldoBruto > 0 ? (totalDescuentos / sueldoBruto) * 100 : 0;
  
  return {
    aporte_afp: Math.round(aporteAFP),
    comision_afp_monto: Math.round(comisionAFPMonto),
    aporte_salud: Math.round(aporteSalud),
    seguro_cesantia: Math.round(seguroCesantia),
    impuesto_segunda_categoria: Math.round(impuestoSegundaCategoria),
    total_descuentos: Math.round(totalDescuentos),
    sueldo_liquido: Math.round(sueldoLiquido),
    tasa_descuento_efectiva: Math.round(tasaDescuentoEfectiva * 100) / 100
  };
}
