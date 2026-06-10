export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function duolingoTiempoDiaNivelMcerProgreso(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;

  const minDia = Math.round(r);
  const resumenStr = __lang === 'en'
    ? `You need about ${minDia} minutes of Duolingo per day (${v1} total minutes ÷ ${v2} days) to reach your target CEFR level on time.`
    : `Necesitás ${minDia} minutos por día (${v1} min totales ÷ ${v2} días) para llegar a tu meta a tiempo.`;

  // Carga diaria: <=20 min liviana, 21-60 exigente pero realista, >60 difícil de sostener
  let tone: 'good' | 'warn' | 'neutral';
  let cargaEs: string; let cargaEn: string;
  if (minDia <= 20) {
    tone = 'good';
    cargaEs = `Es una carga liviana: equivale a 2–4 lecciones de Duolingo, sostenible incluso en días ocupados. La constancia diaria (la racha) pesa más que las sesiones largas.`;
    cargaEn = `That's a light load — about 2–4 Duolingo lessons a day, sustainable even on busy days. Daily consistency (your streak) matters more than long sessions.`;
  } else if (minDia <= 60) {
    tone = 'neutral';
    cargaEs = `Es una carga exigente pero realista. Partila en 2 sesiones (mañana y noche) para sostener la racha sin agotarte, y reservá los fines de semana para repasar unidades viejas.`;
    cargaEn = `That's demanding but realistic. Split it into 2 sessions (morning and evening) to keep your streak without burning out, and use weekends to review older units.`;
  } else {
    tone = 'warn';
    cargaEs = `Más de una hora diaria de app es muy difícil de sostener semanas seguidas. Considerá correr la fecha objetivo, apuntar a un nivel MCER intermedio primero, o sumar otra fuente de práctica (series, conversación) que no se sienta como estudio.`;
    cargaEn = `Over an hour of app time every day is very hard to sustain for weeks. Consider pushing back your target date, aiming for an intermediate CEFR level first, or adding another practice source (shows, conversation) that doesn't feel like studying.`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Your daily pace' : 'Tu ritmo diario',
    text: __lang === 'en'
      ? `**${minDia} min/day** for **${v2} ${v2 === 1 ? 'day' : 'days'}** covers the **${v1} minutes** your goal requires. ${cargaEn}`
      : `**${minDia} min/día** durante **${v2} ${v2 === 1 ? 'día' : 'días'}** cubre los **${v1} minutos** que exige tu meta. ${cargaEs}`,
    tone,
    icon: '🦉',
  };

  return { resultado:r.toFixed(2), resumen:resumenStr, _insight };
}
