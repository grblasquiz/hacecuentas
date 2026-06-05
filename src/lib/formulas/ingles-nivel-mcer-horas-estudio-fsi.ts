export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function inglesNivelMcerHorasEstudioFsi(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const horasTotales = Number(i.v1) || 0;
  const horasSemana = Number(i.v2) || 1;
  const semanas = horasTotales / horasSemana;
  const meses = semanas / 4.33;

  const resumen = __lang === 'en'
    ? `${horasTotales} hours ÷ ${horasSemana} h/week = **${semanas.toFixed(1)} weeks** (≈ ${meses.toFixed(1)} months).`
    : `${horasTotales} horas ÷ ${horasSemana} h/semana = **${semanas.toFixed(1)} semanas** (≈ ${meses.toFixed(1)} meses).`;

  const _insight = {
    title: __lang === 'en' ? 'Your study timeline' : 'Tu tiempo estimado',
    text: __lang === 'en'
      ? `At **${horasSemana} hours/week**, you need **${semanas.toFixed(1)} weeks** (about **${meses.toFixed(1)} months**) to accumulate ${horasTotales} study hours. FSI reference: English requires ~600–750 hours to reach B2–C1 from scratch for Spanish speakers.`
      : `A **${horasSemana} h/semana**, necesitás **${semanas.toFixed(1)} semanas** (unos **${meses.toFixed(1)} meses**) para acumular ${horasTotales} horas de estudio. Referencia FSI: el inglés requiere ~600–750 h totales para llegar a B2–C1 desde cero siendo hispanohablante.`,
    tone: 'neutral',
    icon: '🗣️'
  };
  return { resultado: semanas.toFixed(1), resumen, _insight };
}
