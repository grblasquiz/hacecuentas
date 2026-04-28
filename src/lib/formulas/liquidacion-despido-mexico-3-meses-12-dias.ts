export interface Inputs {
  salario_diario: number;
  antiguedad_anos: number;
  tipo_despido: 'injustificado' | 'justificado';
  dias_trabajados: number;
  vacaciones_pendientes: number;
  aguinaldo_dias: number;
  smg_diaria: number;
}

export interface Outputs {
  indemnizacion_constitucional: number;
  prima_antiguedad: number;
  finiquito_dias_trabajados: number;
  finiquito_vacaciones: number;
  finiquito_aguinaldo: number;
  total_bruto: number;
  isr_estimado: number;
  imss_descuento: number;
  total_neto: number;
  detalle_exenciones: string;
}

export function compute(i: Inputs): Outputs {
  const SMG_2026 = i.smg_diaria; // CONASAMI 2026: $248.93/día
  const PRIMA_ANTIGUEDAD_MINIMA_ANOS = 15; // Art. 162, Ley Federal del Trabajo
  const PRIMA_ANTIGUEDAD_DIAS = 12; // 12 días/año
  const PRIMA_ANTIGUEDAD_TOPE_SMG = 2; // 2 × SMG/día máximo
  const INDEMNIZACION_MESES_BASE = 3; // 3 meses = 90 días
  const DIAS_POR_MES = 30;
  const INDEMNIZACION_DIAS_ANTIGUO = 20; // 20 días/año antigüedad
  const EXENCION_ISR_INDEMNIZACION_DIAS = 90; // 90 SMM exentos
  const EXENCION_ISR_PRIMA_DIAS = 90; // 90 SMM exentos
  const AGUINALDO_ANUAL_BASE_DIAS = 15; // Art. 87, LFT
  const EXENCION_ISR_AGUINALDO_DIAS = 30; // 30 días exentos
  const DIAS_ANIO = 365;
  const TARIFA_IMSS_TRABAJADOR = 0.0305; // 3.05%

  // 1. Cálculo de Indemnización Constitucional
  let indemnizacion_constitucional = 0;
  if (i.tipo_despido === 'injustificado') {
    const indemnizacion_base = i.salario_diario * INDEMNIZACION_MESES_BASE * DIAS_POR_MES;
    const indemnizacion_antiguedad = i.salario_diario * INDEMNIZACION_DIAS_ANTIGUO * i.antiguedad_anos;
    indemnizacion_constitucional = indemnizacion_base + indemnizacion_antiguedad;
  }

  // 2. Cálculo de Prima de Antigüedad
  let prima_antiguedad = 0;
  if (i.antiguedad_anos >= PRIMA_ANTIGUEDAD_MINIMA_ANOS) {
    const salario_aplicable = Math.min(i.salario_diario, PRIMA_ANTIGUEDAD_TOPE_SMG * SMG_2026);
    prima_antiguedad = salario_aplicable * PRIMA_ANTIGUEDAD_DIAS * i.antiguedad_anos;
  }

  // 3. Finiquito: Días trabajados en período actual
  const finiquito_dias_trabajados = i.salario_diario * i.dias_trabajados;

  // 4. Finiquito: Vacaciones pendientes
  const finiquito_vacaciones = i.salario_diario * i.vacaciones_pendientes;

  // 5. Finiquito: Aguinaldo proporcional
  const finiquito_aguinaldo = i.salario_diario * i.aguinaldo_dias;

  // 6. Total Bruto
  const total_bruto = 
    indemnizacion_constitucional + 
    prima_antiguedad + 
    finiquito_dias_trabajados + 
    finiquito_vacaciones + 
    finiquito_aguinaldo;

  // 7. Cálculo de ISR (Art. 109, LISR 2026)
  const exencion_indemnizacion = Math.min(
    indemnizacion_constitucional, 
    EXENCION_ISR_INDEMNIZACION_DIAS * SMG_2026
  );
  const excedente_indemnizacion = Math.max(0, indemnizacion_constitucional - exencion_indemnizacion);

  const exencion_prima = Math.min(
    prima_antiguedad, 
    EXENCION_ISR_PRIMA_DIAS * SMG_2026
  );
  const excedente_prima = Math.max(0, prima_antiguedad - exencion_prima);

  const salarios_base_gravables = finiquito_dias_trabajados;
  
  const exencion_aguinaldo = Math.min(
    finiquito_aguinaldo, 
    EXENCION_ISR_AGUINALDO_DIAS * i.salario_diario
  );
  const excedente_aguinaldo = Math.max(0, finiquito_aguinaldo - exencion_aguinaldo);

  // Exención vacaciones: 100%
  const excedente_vacaciones = 0;

  // Base gravable: salarios + excedentes de indemnización, prima, aguinaldo
  const base_gravable = 
    salarios_base_gravables + 
    excedente_indemnizacion + 
    excedente_prima + 
    excedente_aguinaldo + 
    excedente_vacaciones;

  // ISR 2026: Tramos progresivos (LISR Art. 96)
  // Simplificación: aplicar tarifa promedio según rango
  // Para despidos, se estima ISR sobre base gravable con tasa promedio
  let isr_estimado = 0;
  
  if (base_gravable > 0) {
    // Tramos ISR 2026 (simplificado para cálculo rápido)
    if (base_gravable <= 847.87) {
      isr_estimado = base_gravable * 0.0192;
    } else if (base_gravable <= 7_382.33) {
      isr_estimado = 16.28 + (base_gravable - 847.87) * 0.064;
    } else if (base_gravable <= 52_752.57) {
      isr_estimado = 426.93 + (base_gravable - 7_382.33) * 0.1088;
    } else if (base_gravable <= 375_000) {
      isr_estimado = 4_499.34 + (base_gravable - 52_752.57) * 0.16;
    } else if (base_gravable <= 1_000_000) {
      isr_estimado = 55_640.74 + (base_gravable - 375_000) * 0.1792;
    } else {
      isr_estimado = 167_253.94 + (base_gravable - 1_000_000) * 0.1960;
    }
  }

  // 8. Descuento IMSS (solo sobre salarios base, no sobre indemnización/prima/vacaciones)
  const imss_descuento = salarios_base_gravables * TARIFA_IMSS_TRABAJADOR;

  // 9. Total Neto
  const total_neto = total_bruto - isr_estimado - imss_descuento;

  // 10. Detalle de exenciones
  const monto_exencion_indemnizacion = exencion_indemnizacion.toFixed(2);
  const monto_exencion_prima = exencion_prima.toFixed(2);
  const monto_exencion_aguinaldo = exencion_aguinaldo.toFixed(2);
  const monto_exencion_vacaciones = finiquito_vacaciones.toFixed(2);
  const total_exento = (exencion_indemnizacion + exencion_prima + exencion_aguinaldo + finiquito_vacaciones).toFixed(2);
  
  const detalle_exenciones = 
    `Indemnización exenta: $${monto_exencion_indemnizacion} (tope $${(EXENCION_ISR_INDEMNIZACION_DIAS * SMG_2026).toFixed(2)})\n` +
    `Prima antigüedad exenta: $${monto_exencion_prima} (tope $${(EXENCION_ISR_PRIMA_DIAS * SMG_2026).toFixed(2)})\n` +
    `Aguinaldo exento: $${monto_exencion_aguinaldo} (30 días máximo)\n` +
    `Vacaciones exentas: $${monto_exencion_vacaciones} (100%)\n` +
    `Total exento ISR: $${total_exento} | Base gravable: $${base_gravable.toFixed(2)}`;

  return {
    indemnizacion_constitucional: Math.max(0, indemnizacion_constitucional),
    prima_antiguedad: Math.max(0, prima_antiguedad),
    finiquito_dias_trabajados: Math.max(0, finiquito_dias_trabajados),
    finiquito_vacaciones: Math.max(0, finiquito_vacaciones),
    finiquito_aguinaldo: Math.max(0, finiquito_aguinaldo),
    total_bruto: Math.max(0, total_bruto),
    isr_estimado: Math.max(0, isr_estimado),
    imss_descuento: Math.max(0, imss_descuento),
    total_neto: Math.max(0, total_neto),
    detalle_exenciones
  };
}
