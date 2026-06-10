export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tiempoEstudioExamenDificultadPaginas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const horas = r.toFixed(1);
  const resumen = __lang === 'en'
    ? `You'll need about ${horas} hours of study to cover ${v1} pages at ${v2} pages per hour.`
    : `Vas a necesitar ${horas} horas de estudio (${v1} páginas ÷ ${v2} páginas por hora).`;

  // Plan sugerido: sesiones de 2 horas por día
  const dias2h = Math.max(1, Math.ceil(r / 2));
  let tone: 'good' | 'warn' | 'neutral';
  let planEs: string; let planEn: string;
  if (r <= 6) {
    tone = 'good';
    planEs = `A 2 horas por día son **${dias2h} ${dias2h === 1 ? 'día' : 'días'}** de estudio: llegás cómodo si arrancás esta semana. Sumá un día extra al final sólo para repasar, no para leer material nuevo.`;
    planEn = `At 2 hours a day that's **${dias2h} ${dias2h === 1 ? 'day' : 'days'}** of study — comfortable if you start this week. Add one extra day at the end just for review, not new material.`;
  } else if (r <= 30) {
    tone = 'neutral';
    planEs = `A 2 horas por día son **${dias2h} días** de estudio. Empezá con ese margen antes del examen y partí cada sesión en bloques de 45–50 minutos con pausas: rinde más que una maratón de lectura.`;
    planEn = `At 2 hours a day that's **${dias2h} days** of study. Start that many days before the exam and break each session into 45–50 minute blocks with pauses — it beats a reading marathon.`;
  } else {
    tone = 'warn';
    planEs = `Son **${dias2h} días** a 2 horas diarias: esto no se resuelve la semana previa. Armá un cronograma por temas, priorizá los capítulos con más peso en el examen y descartá lo que el profesor nunca evaluó.`;
    planEn = `That's **${dias2h} days** at 2 hours a day — this can't be crammed in the final week. Build a schedule by topic, prioritize the chapters with the most exam weight, and drop what the professor never tests.`;
  }

  const _insight = __lang === 'en'
    ? { title: 'Your study plan', text: `**${v1} pages** at **${v2} pages/hour** means **${horas} net hours** of study. ${planEn}`, tone, icon: '📚' }
    : { title: 'Tu plan de estudio', text: `**${v1} páginas** a **${v2} páginas por hora** son **${horas} horas netas** de estudio. ${planEs}`, tone, icon: '📚' };
  return { resultado:r.toFixed(2), resumen, _insight };
}
