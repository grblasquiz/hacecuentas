export interface Inputs {
  sueldo_liquido_mensual: number; // CLP
  horas_semana: number;
  semanas_año: number;
}

export interface Outputs {
  valor_hora_clp: number;
  valor_minuto_clp: number;
  valor_hora_uf: number;
  horas_anuales: number;
  comparativa_smi: number;
  recomendacion: string;
}

// Constantes 2026 Chile
const VALOR_UF_2026 = 36640; // CLP, valor referencial Banco Central abril 2026
const SMI_MENSUAL_2026 = 450000; // CLP, Sueldo Mínimo Interprofesional
const HORAS_SEMANA_SMI = 40; // jornada estándar

export function compute(i: Inputs): Outputs {
  // Validación básica
  if (i.sueldo_liquido_mensual <= 0 || i.horas_semana <= 0 || i.semanas_año <= 0) {
    return {
      valor_hora_clp: 0,
      valor_minuto_clp: 0,
      valor_hora_uf: 0,
      horas_anuales: 0,
      comparativa_smi: 0,
      recomendacion: "Error: verifica que todos los valores sean positivos."
    };
  }

  // Cálculo de horas anuales
  const horas_anuales = i.horas_semana * i.semanas_año;

  // Sueldo anual
  const sueldo_anual = i.sueldo_liquido_mensual * 12;

  // Valor hora en CLP
  const valor_hora_clp = sueldo_anual / horas_anuales;

  // Valor minuto en CLP
  const valor_minuto_clp = valor_hora_clp / 60;

  // Valor hora en UF
  const valor_hora_uf = valor_hora_clp / VALOR_UF_2026;

  // SMI por hora (40 h/semana estándar)
  const smi_hora = (SMI_MENSUAL_2026 * 12) / (HORAS_SEMANA_SMI * 52);

  // Comparativa vs SMI
  const comparativa_smi = (valor_hora_clp / smi_hora) * 100;

  // Lógica de recomendación basada en valor hora
  let recomendacion = "";
  const ratio_recomendacion = comparativa_smi;

  if (ratio_recomendacion < 100) {
    recomendacion = `Tu valor hora (${valor_hora_clp.toFixed(0)} CLP) está bajo el SMI calculado. Revisa que los datos sean correctos.`;
  } else if (ratio_recomendacion >= 100 && ratio_recomendacion < 150) {
    recomendacion = `Valor hora moderado. Externalizar solo si el costo < ${(valor_hora_clp * 0.5).toFixed(0)} CLP/hora y ahorra tiempo crítico.`;
  } else if (ratio_recomendacion >= 150 && ratio_recomendacion < 200) {
    recomendacion = `Valor hora elevado. Externaliza tareas > ${(valor_hora_clp * 0.4).toFixed(0)} CLP/hora si liberan tiempo productivo.`;
  } else {
    recomendacion = `Valor hora muy elevado. Externaliza casi todo > ${(valor_hora_clp * 0.3).toFixed(0)} CLP/hora. Tu tiempo es escaso y valioso.`;
  }

  return {
    valor_hora_clp: Math.round(valor_hora_clp),
    valor_minuto_clp: parseFloat(valor_minuto_clp.toFixed(2)),
    valor_hora_uf: parseFloat(valor_hora_uf.toFixed(4)),
    horas_anuales: Math.round(horas_anuales),
    comparativa_smi: parseFloat(comparativa_smi.toFixed(1)),
    recomendacion: recomendacion
  };
}
