export interface Inputs {
  aplica_auxilio_transporte: boolean;
  smlmv_2026: number;
  auxilio_transporte_valor: number;
}

export interface Outputs {
  salario_minimo_bruto: number;
  auxilio_transporte_total: number;
  ingreso_bruto_total_mensual: number;
  ingreso_por_hora: number;
  ingreso_por_dia: number;
  ingreso_por_semana: number;
  nota_tope_auxilio: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN/Ministerio del Trabajo 2026
  const SMLMV_2026 = 1623500; // Salario Mínimo Legal Mensual Vigente 2026
  const AUXILIO_TRANSPORTE_2026 = 200100; // Auxilio de transporte 2026
  const TOPE_AUXILIO = 2 * SMLMV_2026; // Tope: 2 × SMLMV = $3.247.000
  const HORAS_MENSUALES = 230; // 8 horas/día × 23 días laborales
  const DIAS_LABORALES_MES = 23; // Promedio anual días hábiles
  const SEMANAS_POR_AÑO = 52;
  const MESES_POR_AÑO = 12;
  
  // Salario mínimo bruto (SMLMV sin deducciones)
  const salario_minimo_bruto = SMLMV_2026;
  
  // Determinar si aplica auxilio transporte
  // Aplica si: salario < 2 × SMLMV (según input booleano)
  const auxilio_transporte_total = i.aplica_auxilio_transporte ? AUXILIO_TRANSPORTE_2026 : 0;
  
  // Ingreso bruto total mensual
  const ingreso_bruto_total_mensual = salario_minimo_bruto + auxilio_transporte_total;
  
  // Ingresos por período
  const ingreso_por_hora = Math.round((ingreso_bruto_total_mensual / HORAS_MENSUALES) * 100) / 100;
  const ingreso_por_dia = Math.round((ingreso_bruto_total_mensual / DIAS_LABORALES_MES) * 100) / 100;
  
  // Ingreso semanal: (230 horas mensuales ÷ 52 semanas/año × 12 meses = 4.423 semanas/mes promedio)
  const semanas_mensuales = (SEMANAS_POR_AÑO / MESES_POR_AÑO);
  const ingreso_por_semana = Math.round((ingreso_bruto_total_mensual / semanas_mensuales) * 100) / 100;
  
  // Nota sobre elegibilidad del auxilio
  let nota_tope_auxilio = "";
  if (i.aplica_auxilio_transporte) {
    nota_tope_auxilio = `✓ Aplica auxilio transporte. Tu salario (${salario_minimo_bruto.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}) es < 2 SMLMV ($${TOPE_AUXILIO.toLocaleString('es-CO', { minimumFractionDigits: 0 })}).`;
  } else {
    nota_tope_auxilio = `✗ No aplica auxilio transporte. Tu salario (${salario_minimo_bruto.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}) es ≥ 2 SMLMV.`;
  }
  
  return {
    salario_minimo_bruto,
    auxilio_transporte_total,
    ingreso_bruto_total_mensual,
    ingreso_por_hora,
    ingreso_por_dia,
    ingreso_por_semana,
    nota_tope_auxilio
  };
}
