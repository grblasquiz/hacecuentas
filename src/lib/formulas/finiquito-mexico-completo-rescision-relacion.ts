export interface Inputs {
  salario_diario: number;
  fecha_alta: string; // YYYY-MM-DD
  fecha_baja: string; // YYYY-MM-DD
  dias_vacaciones_pendientes: number;
  prima_vacacional_pct: number;
  dias_aguinaldo_pendiente: number;
  sueldo_pendiente?: number;
  es_rescision_injustificada?: boolean;
  antigüedad_años: number;
}

export interface Outputs {
  sueldo_pendiente_bruto: number;
  vacaciones_pendientes_bruto: number;
  prima_vacacional_bruto: number;
  aguinaldo_proporcional_bruto: number;
  prima_antigüedad_bruto: number;
  indemnizacion_rescision_injusta: number;
  finiquito_bruto_total: number;
  isr_retenido_total: number;
  isr_vacaciones: number;
  isr_aguinaldo: number;
  isr_sueldo: number;
  finiquito_neto_liquido: number;
  nota_precaución: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes SAT 2026
  const EXENCION_AGUINALDO_2026 = 124000; // 40 × salario mínimo regional aprox. $3,100
  const EXENCION_VACACIONES_2026 = 2500; // Exención anual vacaciones
  const SALARIO_MINIMO_REGIONAL_2026 = 3100; // Mínimo regional CDMX aprox.
  
  // Tablas IRPF 2026 México (aproximación por tramos)
  const TRAMOS_IRPF_2026 = [
    { limite: 5952.84, tasa: 0.0192, cuota: 0 },
    { limite: 50524.80, tasa: 0.064, cuota: 114.30 },
    { limite: 88793.04, tasa: 0.1088, cuota: 2910.84 },
    { limite: 119601.84, tasa: 0.16, cuota: 8038.14 },
    { limite: 179857.64, tasa: 0.1792, cuota: 17721.14 },
    { limite: 359715.28, tasa: 0.1960, cuota: 37776.54 },
    { limite: Infinity, tasa: 0.35, cuota: 114505.14 }
  ];
  
  // Parse fechas
  const alta = new Date(i.fecha_alta);
  const baja = new Date(i.fecha_baja);
  const ms_por_dia = 86400000;
  const dias_totales = Math.max(1, Math.floor((baja.getTime() - alta.getTime()) / ms_por_dia));
  
  // 1. Sueldo pendiente (últimos días)
  const sueldo_pendiente_bruto = (i.sueldo_pendiente || 0) > 0 ? i.sueldo_pendiente : 0;
  
  // 2. Vacaciones pendientes
  const vacaciones_pendientes_bruto = i.dias_vacaciones_pendientes * i.salario_diario;
  
  // 3. Prima vacacional
  const prima_vacacional_bruto = vacaciones_pendientes_bruto * (i.prima_vacacional_pct / 100);
  
  // 4. Aguinaldo proporcional
  const aguinaldo_proporcional_bruto = i.dias_aguinaldo_pendiente * i.salario_diario;
  
  // 5. Prima de antigüedad (solo si rescisión injustificada)
  const prima_antigüedad_bruto = i.es_rescision_injustificada ? 
    (12 * i.salario_diario * i.antigüedad_años) : 0;
  
  // 6. Indemnización por rescisión injustificada (Art. 50 LFT)
  const indemnizacion_rescision_injusta = i.es_rescision_injustificada ?
    (20 * i.salario_diario) : 0;
  
  // 7. Finiquito bruto total
  const finiquito_bruto_total = 
    sueldo_pendiente_bruto + 
    vacaciones_pendientes_bruto + 
    prima_vacacional_bruto + 
    aguinaldo_proporcional_bruto + 
    prima_antigüedad_bruto + 
    indemnizacion_rescision_injusta;
  
  // Función para calcular ISR según tramos IRPF 2026
  function calcularISR(base_gravable: number): number {
    if (base_gravable <= 0) return 0;
    
    let isr = 0;
    for (let j = 0; j < TRAMOS_IRPF_2026.length; j++) {
      const tramo = TRAMOS_IRPF_2026[j];
      const limite_anterior = j === 0 ? 0 : TRAMOS_IRPF_2026[j - 1].limite;
      
      if (base_gravable > limite_anterior) {
        const exceso = Math.min(base_gravable, tramo.limite) - limite_anterior;
        isr = (exceso * tramo.tasa) + tramo.cuota;
        break;
      }
    }
    
    return Math.round(isr * 100) / 100;
  }
  
  // 8. Retención ISR por concepto
  // ISR sobre sueldo pendiente (tarifa normal)
  const isr_sueldo = calcularISR(sueldo_pendiente_bruto);
  
  // ISR sobre vacaciones: exención hasta $2,500
  const vacaciones_gravable = Math.max(0, vacaciones_pendientes_bruto + prima_vacacional_bruto - EXENCION_VACACIONES_2026);
  const isr_vacaciones = calcularISR(vacaciones_gravable);
  
  // ISR sobre aguinaldo: exención hasta $124,000 (40 × SMR)
  const aguinaldo_gravable = Math.max(0, aguinaldo_proporcional_bruto - EXENCION_AGUINALDO_2026);
  const isr_aguinaldo = calcularISR(aguinaldo_gravable);
  
  // ISR sobre prima antigüedad e indemnización (trata como ingreso ordinario)
  const otros_conceptos = prima_antigüedad_bruto + indemnizacion_rescision_injusta;
  const isr_otros = calcularISR(otros_conceptos);
  
  const isr_retenido_total = isr_sueldo + isr_vacaciones + isr_aguinaldo + isr_otros;
  
  // 9. Finiquito neto/líquido
  const finiquito_neto_liquido = Math.max(0, finiquito_bruto_total - isr_retenido_total);
  
  // Nota de precaución
  const nota_precaución = `⚠️ Cálculo estimado. Validar con nómina final del patrón y asesor laboral. ` +
    `La retención real depende del RFC, régimen fiscal y cálculos de patrón. ` +
    `Si hay rescisión, confirmar causa (justificada/injustificada) con STPS o PROFEDET.`;
  
  return {
    sueldo_pendiente_bruto: Math.round(sueldo_pendiente_bruto * 100) / 100,
    vacaciones_pendientes_bruto: Math.round(vacaciones_pendientes_bruto * 100) / 100,
    prima_vacacional_bruto: Math.round(prima_vacacional_bruto * 100) / 100,
    aguinaldo_proporcional_bruto: Math.round(aguinaldo_proporcional_bruto * 100) / 100,
    prima_antigüedad_bruto: Math.round(prima_antigüedad_bruto * 100) / 100,
    indemnizacion_rescision_injusta: Math.round(indemnizacion_rescision_injusta * 100) / 100,
    finiquito_bruto_total: Math.round(finiquito_bruto_total * 100) / 100,
    isr_retenido_total: Math.round(isr_retenido_total * 100) / 100,
    isr_vacaciones: Math.round(isr_vacaciones * 100) / 100,
    isr_aguinaldo: Math.round(isr_aguinaldo * 100) / 100,
    isr_sueldo: Math.round(isr_sueldo * 100) / 100,
    finiquito_neto_liquido: Math.round(finiquito_neto_liquido * 100) / 100,
    nota_precaución: nota_precaución
  };
}
