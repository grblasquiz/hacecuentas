export interface Inputs {
  decil_rsh: number;          // 1-6
  tipo_ies: 'universidad' | 'ip' | 'cft';
  ies_acreditada: boolean;
  duracion_formal_anos: number;
  anos_cursados: number;
  tiene_retraso: boolean;
  arancel_anual_estimado: number;
  matricula_estimada: number;
}

export interface Outputs {
  cobertura_arancel: number;
  cobertura_matricula: number;
  aporte_total_gratuidad: number;
  requiere_pago_estudiante: boolean;
  mensaje_elegibilidad: string;
  anos_cobertura_restantes: number;
  requisitos_mantener: string;
  proximo_hito_evaluacion: string;
}

export function compute(i: Inputs): Outputs {
  // Validación decil elegible (1-6 RSH)
  const decil_elegible = i.decil_rsh >= 1 && i.decil_rsh <= 6;
  
  // Validación acreditación IES (CNE 2026)
  const tiene_acreditacion = i.ies_acreditada === true;
  
  // Validación duración formal máximo 6 años
  const duracion_valida = i.duracion_formal_anos > 0 && i.duracion_formal_anos <= 6;
  
  // Validación años cursados dentro duración formal
  const anos_dentro_duracion = i.anos_cursados <= i.duracion_formal_anos;
  
  // Validación retraso (máximo 1 año permite cobertura)
  const retraso_permitido = !i.tiene_retraso;
  
  // Cálculo años restantes cubiertos por gratuidad
  const max_cobertura_anos = 6; // límite ley 20.949
  const anos_cobertura_restantes = Math.max(0, max_cobertura_anos - i.anos_cursados);
  
  // Cumplimiento todos requisitos
  const cumple_requisitos = 
    decil_elegible && 
    tiene_acreditacion && 
    duracion_valida && 
    anos_dentro_duracion && 
    retraso_permitido &&
    anos_cobertura_restantes > 0;
  
  // Cobertura arancel anual
  const cobertura_arancel = cumple_requisitos ? i.arancel_anual_estimado : 0;
  
  // Cobertura matrícula anual
  const cobertura_matricula = cumple_requisitos ? i.matricula_estimada : 0;
  
  // Aporte total gratuidad (arancel + matrícula)
  const aporte_total_gratuidad = cobertura_arancel + cobertura_matricula;
  
  // ¿Requiere pago estudiante?
  const requiere_pago_estudiante = !cumple_requisitos;
  
  // Mensaje elegibilidad detallado
  let mensaje_elegibilidad = '';
  if (!decil_elegible) {
    mensaje_elegibilidad = `Decil ${i.decil_rsh} no elegible. Gratuidad requiere deciles 1-6 RSH.`;
  } else if (!tiene_acreditacion) {
    mensaje_elegibilidad = 'Institución sin acreditación CNE 2026. No aplica gratuidad.';
  } else if (!duracion_valida) {
    mensaje_elegibilidad = `Duración formal ${i.duracion_formal_anos} años. Máximo 6 años cubiertos.`;
  } else if (!anos_dentro_duracion) {
    mensaje_elegibilidad = `Ya cursados ${i.anos_cursados} años de ${i.duracion_formal_anos} formal. Excede duración.`;
  } else if (!retraso_permitido) {
    mensaje_elegibilidad = 'Retraso académico >1 año. Gratuidad suspendida. Regulariza para recuperar.';
  } else if (anos_cobertura_restantes <= 0) {
    mensaje_elegibilidad = 'Ya completados 6 años máximo cobertura. No hay gratuidad adicional.';
  } else {
    mensaje_elegibilidad = `✓ Elegible gratuidad 100% arancel + matrícula. ${anos_cobertura_restantes} años restantes (máx ${max_cobertura_anos}).`;
  }
  
  // Requisitos mantener gratuidad 2026
  const requisitos_mantener = 
    '• Matrícula vigente cada semestre\n' +
    '• Rendimiento ≥60% créditos aprobados\n' +
    '• Atraso académico máximo 1 año\n' +
    '• Decil RSH actualizado ≤6 (revisar enero-febrero)\n' +
    '• IES mantiene acreditación CNE\n' +
    '• No superar 6 años desde ingreso carrera';
  
  // Próximo hito evaluación
  let proximo_hito_evaluacion = '';
  if (!cumple_requisitos) {
    if (i.tiene_retraso) {
      proximo_hito_evaluacion = 'Regularizar atraso en 2 semestres para recuperar gratuidad';
    } else if (!tiene_acreditacion) {
      proximo_hito_evaluacion = 'Verificar reacreditación institución en CNE (próximo proceso 2027)';
    } else if (!decil_elegible) {
      proximo_hito_evaluacion = 'Consultar alternativas crédito con garantía estatal (CAE) o crédito SII';
    }
  } else {
    const fecha_proximo_rsh = 'Enero-febrero 2027 (actualización RSH anual)';
    const evaluacion_semestral = `Revisión rendimiento fin semestre ${new Date().getMonth() >= 6 ? 2 : 1} 2026`;
    proximo_hito_evaluacion = `${evaluacion_semestral}. ${fecha_proximo_rsh} confirma decil RSH.`;
  }
  
  return {
    cobertura_arancel,
    cobertura_matricula,
    aporte_total_gratuidad,
    requiere_pago_estudiante,
    mensaje_elegibilidad,
    anos_cobertura_restantes,
    requisitos_mantener,
    proximo_hito_evaluacion
  };
}
