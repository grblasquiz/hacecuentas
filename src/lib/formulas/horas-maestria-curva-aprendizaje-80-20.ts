export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasMaestriaCurvaAprendizaje8020(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const totalHoras = Number(i.v1) || 0;
  const horasSemana = Number(i.v2) || 1;
  const semanas = totalHoras / horasSemana;
  const meses = semanas / 4.33;
  const semanasRedondeado = Math.round(semanas * 10) / 10;
  const mesesRedondeado = Math.round(meses * 10) / 10;

  let interpretacion: string;
  let insightText: string;
  let insightIcon: string;

  if (__lang === 'en') {
    if (semanas < 8) {
      interpretacion = `${semanasRedondeado} weeks (≈ ${mesesRedondeado.toFixed(1)} months). A short sprint — this level is reachable with consistent daily practice.`;
      insightIcon = '🚀';
      insightText = `At ${horasSemana} hrs/week you can reach your target in about **${semanasRedondeado} weeks**. That's roughly **${mesesRedondeado.toFixed(1)} months** — a short, focused sprint. Make it happen.`;
    } else if (semanas < 26) {
      interpretacion = `${semanasRedondeado} weeks (≈ ${mesesRedondeado.toFixed(1)} months). Achievable within 6 months with disciplined practice.`;
      insightIcon = '📅';
      insightText = `You need about **${semanasRedondeado} weeks** (≈ **${mesesRedondeado.toFixed(1)} months**) at ${horasSemana} hrs/week. This is achievable within a half-year — build a weekly routine and track your progress.`;
    } else if (semanas < 78) {
      interpretacion = `${semanasRedondeado} weeks (≈ ${mesesRedondeado.toFixed(1)} months). A multi-month project — use milestones every 4–6 weeks.`;
      insightIcon = '🗓️';
      insightText = `At ${horasSemana} hrs/week this takes **${semanasRedondeado} weeks** (≈ **${mesesRedondeado.toFixed(1)} months**). Set a milestone every 4–6 weeks to measure progress. The 80/20 principle: focus first on the core 20% of the skill that covers 80% of real use cases.`;
    } else {
      interpretacion = `${semanasRedondeado} weeks (≈ ${mesesRedondeado.toFixed(1)} months). A long-haul commitment — consider increasing weekly hours or targeting a lower initial level.`;
      insightIcon = '⏳';
      insightText = `At ${horasSemana} hrs/week this is a **${semanasRedondeado}-week** journey (≈ **${mesesRedondeado.toFixed(1)} months**). Consider starting with a functional 80% target at fewer hours, then continuing — or increase your weekly practice time to cut the timeline.`;
    }
    const resumen = `${totalHoras} hrs ÷ ${horasSemana} hrs/week = ${semanasRedondeado} weeks (${mesesRedondeado.toFixed(1)} months).`;
    const _insight = {
      title: 'Your mastery timeline',
      text: insightText,
      tone: semanas < 26 ? 'positive' : semanas < 78 ? 'neutral' : 'cautionary',
      icon: insightIcon,
    };
    return { resultado: semanasRedondeado.toString(), resumen, _insight };
  } else {
    if (semanas < 8) {
      interpretacion = `${semanasRedondeado} semanas (≈ ${mesesRedondeado.toFixed(1)} meses). Un sprint corto — alcanzable con práctica diaria consistente.`;
      insightIcon = '🚀';
      insightText = `A ${horasSemana} hs/semana llegás en **${semanasRedondeado} semanas** (aprox. **${mesesRedondeado.toFixed(1)} meses**). Es un sprint corto — tomá impulso y arrancá ya.`;
    } else if (semanas < 26) {
      interpretacion = `${semanasRedondeado} semanas (≈ ${mesesRedondeado.toFixed(1)} meses). Alcanzable en menos de 6 meses con práctica disciplinada.`;
      insightIcon = '📅';
      insightText = `Necesitás **${semanasRedondeado} semanas** (≈ **${mesesRedondeado.toFixed(1)} meses**) a ${horasSemana} hs/semana. Es alcanzable en menos de un semestre — armá una rutina semanal y medí tu progreso.`;
    } else if (semanas < 78) {
      interpretacion = `${semanasRedondeado} semanas (≈ ${mesesRedondeado.toFixed(1)} meses). Proyecto de varios meses — usá hitos cada 4–6 semanas.`;
      insightIcon = '🗓️';
      insightText = `A ${horasSemana} hs/semana son **${semanasRedondeado} semanas** (≈ **${mesesRedondeado.toFixed(1)} meses**). Poné hitos cada 4–6 semanas para medir avance. El principio 80/20: priorizá el 20% del contenido que cubre el 80% de los casos reales.`;
    } else {
      interpretacion = `${semanasRedondeado} semanas (≈ ${mesesRedondeado.toFixed(1)} meses). Compromiso largo — considerá aumentar las horas semanales o apuntar primero a un nivel funcional más básico.`;
      insightIcon = '⏳';
      insightText = `A ${horasSemana} hs/semana son **${semanasRedondeado} semanas** (≈ **${mesesRedondeado.toFixed(1)} meses**). Evaluá empezar con un objetivo funcional más acotado, o aumentar tus horas semanales para acortar el camino.`;
    }
    const resumen = `${totalHoras} hs ÷ ${horasSemana} hs/semana = ${semanasRedondeado} semanas (${mesesRedondeado.toFixed(1)} meses).`;
    const _insight = {
      title: 'Tu línea de tiempo',
      text: insightText,
      tone: semanas < 26 ? 'positive' : semanas < 78 ? 'neutral' : 'cautionary',
      icon: insightIcon,
    };
    return { resultado: semanasRedondeado.toString(), resumen, _insight };
  }
}
