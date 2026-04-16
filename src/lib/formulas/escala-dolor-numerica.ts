/** Escala de dolor numérica NRS */
export interface Inputs { dolor: number; tipo: string; ubicacion: string; }
export interface Outputs { clasificacion: string; escalon: string; recomendacion: string; mensaje: string; }

export function escalaDolorNumerica(i: Inputs): Outputs {
  const dolor = Number(i.dolor);
  const tipo = String(i.tipo || 'agudo');
  if (dolor < 0 || dolor > 10) throw new Error('Ingresá un valor entre 0 y 10');

  let clasificacion: string; let escalon: string; let recomendacion: string;
  if (dolor === 0) {
    clasificacion = 'Sin dolor'; escalon = 'No requiere analgesia';
    recomendacion = 'Sin dolor actual. Si tenés dolor intermitente, llevá un registro para mostrar a tu médico.';
  } else if (dolor <= 3) {
    clasificacion = '🟢 Dolor leve (1-3)';
    escalon = 'Escalón 1 OMS: Paracetamol y/o AINE';
    recomendacion = 'Paracetamol 500-1000 mg o ibuprofeno 400 mg. Medidas físicas: frío/calor local, reposo relativo.';
  } else if (dolor <= 6) {
    clasificacion = '🟡 Dolor moderado (4-6)';
    escalon = 'Escalón 1-2 OMS: AINE +/- opioide débil';
    recomendacion = 'AINE en dosis plena. Si no cede: agregar tramadol o codeína. Consultar médico si persiste >48h.';
  } else {
    clasificacion = '🔴 Dolor severo (7-10)';
    escalon = 'Escalón 2-3 OMS: Opioide bajo supervisión médica';
    recomendacion = 'Consultar médico urgente. Puede requerir opioides fuertes bajo supervisión. No automedicar opioides.';
  }

  if (tipo === 'cronico') recomendacion += ' En dolor crónico: considerar abordaje multimodal (medicación + fisioterapia + psicología).';
  if (tipo === 'oncologico') recomendacion += ' En dolor oncológico: manejo según protocolo específico con equipo de cuidados paliativos.';

  return { clasificacion, escalon, recomendacion, mensaje: `Dolor: ${dolor}/10. ${clasificacion}. ${escalon}.` };
}