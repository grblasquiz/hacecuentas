export interface Inputs {
  arriendo_mensual: number;
  es_vivienda_dfl2: boolean;
  anios_exencion_restantes: number;
  gastos_mantencion: number;
  gastos_seguros: number;
  contribuciones_anuales: number;
  gastos_administracion: number;
  intereses_hipotecarios_anuales: number;
  otros_gastos: number;
  tipo_declaracion: 'anual' | 'estimacion_mensual';
}

export interface Outputs {
  arriendo_anual_bruto: number;
  gastos_deducibles_totales: number;
  renta_imponible: number;
  renta_imponible_neta: number;
  impuesto_renta_anual: number;
  tasa_efectiva: number;
  retension_mensual_estimada: number;
  renta_neta_mensual: number;
  analisis_regimen: {
    regimen_simplificado_impuesto: number;
    regimen_efectivo_impuesto: number;
    diferencia: number;
    regimen_recomendado: string;
  };
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - SII
  const TASA_RETENCION_ARRENDATARIO = 0.10; // 10% ingreso bruto
  const UTA_2026 = 65844480; // Unidad Tributaria Anual 2026
  const LIMITE_PERDIDA_ANUAL_UTA = 1.5; // 1.5 UTA máximo arrastre
  const TASA_REGIMEN_SIMPLIFICADO = 0.20; // 20% ingresos brutos
  const LIMITE_MANTENCION_PCT = 0.10; // 10% arriendo anual máximo
  const TASA_ADICIONAL_MUNICIPAL = 0.0175; // Promedio 1.75% (varía por comuna)
  
  // Tramos impuesto renta progresivo 2026 Chile (artículo 52 DL 824)
  const TRAMOS_2026 = [
    { limite: 17030840, tasa: 0.00, credito: 0 },
    { limite: 23885760, tasa: 0.04, credito: 681234 },
    { limite: 42183120, tasa: 0.08, credito: 1512863 },
    { limite: 60480480, tasa: 0.135, credito: 3897813 },
    { limite: 85672800, tasa: 0.23, credito: 10253424 },
    { limite: 154617120, tasa: 0.304, credito: 15805056 },
    { limite: Infinity, tasa: 0.45, credito: 44866812 }
  ];
  
  // Cálculo arriendo anual bruto
  const arriendo_anual_bruto = i.arriendo_mensual * 12;
  
  // Validación y limitación gastos
  const mantencion_limitada = Math.min(
    i.gastos_mantencion,
    arriendo_anual_bruto * LIMITE_MANTENCION_PCT
  );
  
  const gastos_deducibles_totales =
    mantencion_limitada +
    i.gastos_seguros +
    i.contribuciones_anuales +
    i.gastos_administracion +
    i.intereses_hipotecarios_anuales +
    i.otros_gastos;
  
  // No pueden superar ingresos brutos
  const gastos_capped = Math.min(gastos_deducibles_totales, arriendo_anual_bruto);
  
  // Renta imponible antes exención
  const renta_imponible = Math.max(0, arriendo_anual_bruto - gastos_capped);
  
  // Aplicar exención DFL2 (artículo 59 letras b,c DL 824)
  let renta_imponible_neta = renta_imponible;
  if (i.es_vivienda_dfl2 && i.anios_exencion_restantes > 0) {
    renta_imponible_neta = 0; // Exención 100% años 1-3
  }
  
  // Función calcular impuesto progresivo
  const calcularImpuestoRenta = (rentaGravable: number): number => {
    if (rentaGravable <= 0) return 0;
    
    let impuesto = 0;
    for (let j = 0; j < TRAMOS_2026.length; j++) {
      const tramo = TRAMOS_2026[j];
      const tramo_anterior = j > 0 ? TRAMOS_2026[j - 1].limite : 0;
      
      if (rentaGravable > tramo_anterior) {
        const renta_tramo = Math.min(rentaGravable, tramo.limite) - tramo_anterior;
        impuesto = renta_tramo * tramo.tasa + tramo.credito;
        break;
      }
    }
    
    return Math.max(0, impuesto);
  };
  
  // Impuesto renta neto (sin adicional municipal para este ejemplo)
  const impuesto_renta_base = calcularImpuestoRenta(renta_imponible_neta);
  
  // Adicional municipal (promedio 1.75%, varía por comuna)
  const adicional_municipal = renta_imponible_neta > 0
    ? impuesto_renta_base * (TASA_ADICIONAL_MUNICIPAL / (1 - TASA_ADICIONAL_MUNICIPAL / 3)) // Aproximación
    : 0;
  
  const impuesto_renta_anual = Math.round(impuesto_renta_base + adicional_municipal);
  
  // Tasa efectiva
  const tasa_efectiva = arriendo_anual_bruto > 0
    ? (impuesto_renta_anual / arriendo_anual_bruto) * 100
    : 0;
  
  // Retención mensual estimada (10% ingreso bruto)
  const retension_mensual_estimada = Math.round(i.arriendo_mensual * TASA_RETENCION_ARRENDATARIO);
  
  // Renta neta mensual (después impuesto distribuido)
  const impuesto_mensual = impuesto_renta_anual / 12;
  const renta_neta_mensual = Math.round(
    i.arriendo_mensual - (gastos_capped / 12) - impuesto_mensual
  );
  
  // Análisis régimen simplificado vs efectivo
  const impuesto_regimen_simplificado = Math.round(
    calcularImpuestoRenta(arriendo_anual_bruto * TASA_REGIMEN_SIMPLIFICADO)
  );
  
  const analisis_regimen = {
    regimen_simplificado_impuesto: impuesto_regimen_simplificado,
    regimen_efectivo_impuesto: impuesto_renta_anual,
    diferencia: impuesto_regimen_simplificado - impuesto_renta_anual,
    regimen_recomendado:
      gastos_capped > arriendo_anual_bruto * TASA_REGIMEN_SIMPLIFICADO
        ? 'Renta Efectiva (gastos > 20% ingresos)'
        : 'Régimen Simplificado (más ventajoso)'
  };
  
  return {
    arriendo_anual_bruto: Math.round(arriendo_anual_bruto),
    gastos_deducibles_totales: Math.round(gastos_capped),
    renta_imponible: Math.round(renta_imponible),
    renta_imponible_neta: Math.round(renta_imponible_neta),
    impuesto_renta_anual,
    tasa_efectiva: Math.round(tasa_efectiva * 10) / 10,
    retension_mensual_estimada,
    renta_neta_mensual,
    analisis_regimen
  };
}
