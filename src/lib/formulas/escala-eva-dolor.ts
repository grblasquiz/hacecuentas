/** Escala Visual Analógica del Dolor (EVA) 0-10 con interpretación */
export interface Inputs {
  valor: number;
  tipo?: string; // 'agudo' | 'cronico'
  duracionHoras?: number;
}
export interface Outputs {
  valor: number;
  categoria: string;
  descripcion: string;
  impactoFuncional: string;
  recomendacion: string;
  requiereConsulta: boolean;
  resumen: string;
}

export function escalaEvaDolor(i: Inputs): Outputs {
  const v = Number(i.valor);
  const tipo = String(i.tipo || 'agudo');
  const duracion = Number(i.duracionHoras) || 0;

  if (v === undefined || v === null || isNaN(v)) throw new Error('Ingresá un valor de dolor entre 0 y 10');
  if (v < 0 || v > 10) throw new Error('La escala va de 0 (sin dolor) a 10 (dolor máximo imaginable)');

  let categoria = '', descripcion = '', impacto = '', recomendacion = '';
  let requiereConsulta = false;

  if (v === 0) {
    categoria = 'Sin dolor';
    descripcion = 'No hay dolor alguno.';
    impacto = 'Nulo — funcionalidad completa.';
    recomendacion = 'Sin necesidad de analgésicos.';
  } else if (v <= 3) {
    categoria = 'Dolor leve';
    descripcion = 'Molestia perceptible pero tolerable. No interfiere con actividades.';
    impacto = 'Bajo — podés realizar todas tus tareas.';
    recomendacion = 'Medidas no farmacológicas o analgésicos simples (paracetamol).';
  } else if (v <= 6) {
    categoria = 'Dolor moderado';
    descripcion = 'Dolor notorio que limita parcialmente. Difícil ignorarlo.';
    impacto = 'Moderado — interfiere con concentración y algunas actividades.';
    recomendacion = 'AINE + paracetamol; considerar consulta si persiste >48 h.';
    if (duracion > 72) requiereConsulta = true;
  } else if (v <= 8) {
    categoria = 'Dolor intenso';
    descripcion = 'Dolor severo que domina la percepción.';
    impacto = 'Alto — impide trabajo y concentración normal.';
    recomendacion = 'Consulta médica pronta. Puede requerir opioides débiles (tramadol).';
    requiereConsulta = true;
  } else {
    categoria = 'Dolor insoportable';
    descripcion = 'Dolor extremo, imposible de ignorar.';
    impacto = 'Muy alto — incapacitante.';
    recomendacion = 'Consulta médica urgente (guardia). Puede requerir opioides fuertes.';
    requiereConsulta = true;
  }

  // En dolor crónico, el umbral para consulta baja
  if (tipo === 'cronico' && v >= 4) requiereConsulta = true;

  return {
    valor: v,
    categoria,
    descripcion,
    impactoFuncional: impacto,
    recomendacion,
    requiereConsulta,
    resumen: `EVA ${v}/10 — ${categoria}. ${descripcion}`,
  };
}
