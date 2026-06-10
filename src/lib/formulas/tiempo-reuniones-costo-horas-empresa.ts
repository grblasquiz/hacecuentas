/**
 * Costo de reuniones en la empresa — modelo HBR.
 *
 * Fórmula real (Harvard Business Review, "Estimate the Cost of a Meeting
 * with This Calculator", 2016): el costo de una reunión es la suma de las
 * tarifas horarias de los participantes multiplicada por la duración.
 *
 *   costo-hora del grupo = nómina mensual de los participantes ÷ 160 h
 *     (160 h = 8 h/día × 20 días hábiles, jornada estándar Ley 20.744)
 *   costo por reunión    = costo-hora del grupo × duración (h)
 *   costo mensual        = costo por reunión × reuniones al mes
 *
 * Opcional: cargas patronales ~26,4% sobre el bruto (contribuciones 20,4%
 * + obra social 6%, Ley 27.541; sin ART) → nómina × 1,264.
 */
export interface Inputs { [k: string]: number | string | undefined; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

const HORAS_MES = 160; // 8 h/día × 20 días hábiles (Ley 20.744)
const CARGAS_PATRONALES = 0.264; // 20,4% contribuciones + 6% obra social (Ley 27.541), sin ART

export function tiempoReunionesCostoHorasEmpresa(i: Inputs): Outputs {
  const lang = i.__lang === 'en' ? 'en' : 'es';
  // Guard: '' / null / undefined NO son 0 — campos requeridos deben venir con valor real
  const num = (v: unknown): number | null => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const nomina = num(i.nominaMensual);
  const durMin = num(i.duracionMinutos);
  const reuniones = num(i.reunionesMes);
  if (nomina === null || nomina <= 0) throw new Error(lang === 'en' ? "Enter the participants' total monthly payroll" : 'Ingresá la nómina mensual de los participantes');
  if (durMin === null || durMin <= 0) throw new Error(lang === 'en' ? 'Enter the average meeting length in minutes' : 'Ingresá la duración promedio de la reunión en minutos');
  if (reuniones === null || reuniones <= 0) throw new Error(lang === 'en' ? 'Enter how many meetings per month' : 'Ingresá cuántas reuniones tienen por mes');

  const conCargas = String(i.incluirCargas ?? 'no') === 'si';
  const nominaEfectiva = conCargas ? nomina * (1 + CARGAS_PATRONALES) : nomina;

  const costoHoraGrupo = nominaEfectiva / HORAS_MES;
  const durHoras = durMin / 60;
  const costoReunion = costoHoraGrupo * durHoras;
  const horasMes = durHoras * reuniones;
  const costoMensual = costoReunion * reuniones;
  const costoAnual = costoMensual * 12;
  const pctJornada = (horasMes / HORAS_MES) * 100;
  const pctR = Math.round(pctJornada * 10) / 10;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString(lang === 'en' ? 'en-US' : 'es-AR');
  const pctStr = lang === 'en' ? `${pctR}%` : `${String(pctR).replace('.', ',')}%`;

  let tone: 'positive' | 'neutral' | 'caution' = 'neutral';
  let veredicto: string;
  if (pctJornada > 30) {
    tone = 'caution';
    veredicto = lang === 'en'
      ? `Each meeting costs **${fmt(costoReunion)}** in paid hours. With ${reuniones} meetings a month the team spends **${horasMes.toFixed(1)} h** (= ${fmt(costoMensual)}/month, ${fmt(costoAnual)}/year) — that's **${pctStr}** of the 160-hour workmonth, above the typical 7.5–30% range. Audit recurring meetings: shorter slots and fewer attendees cut this linearly.`
      : `Cada reunión cuesta **${fmt(costoReunion)}** en horas pagadas. Con ${reuniones} reuniones al mes el equipo dedica **${horasMes.toFixed(1).replace('.', ',')} h** (= ${fmt(costoMensual)}/mes, ${fmt(costoAnual)}/año): es el **${pctStr}** de la jornada de 160 h, por encima del rango habitual (7,5–30%). Auditá las recurrentes: acortar bloques y sacar asistentes baja el costo en forma lineal.`;
  } else if (pctJornada >= 10) {
    tone = 'neutral';
    veredicto = lang === 'en'
      ? `Each meeting costs **${fmt(costoReunion)}** in paid hours (group rate ${fmt(costoHoraGrupo)}/h × ${durMin} min). Monthly: **${fmt(costoMensual)}** across ${reuniones} meetings — **${pctStr}** of the 160-hour workmonth, within the typical 7.5–30% range for office teams.`
      : `Cada reunión cuesta **${fmt(costoReunion)}** en horas pagadas (costo-hora del grupo ${fmt(costoHoraGrupo)}/h × ${durMin} min). Al mes: **${fmt(costoMensual)}** en ${reuniones} reuniones, el **${pctStr}** de la jornada de 160 h — dentro del rango habitual (7,5–30%) para equipos de oficina.`;
  } else {
    tone = 'positive';
    veredicto = lang === 'en'
      ? `Each meeting costs **${fmt(costoReunion)}** in paid hours. With ${reuniones} meetings a month that's **${fmt(costoMensual)}** — only **${pctStr}** of the 160-hour workmonth, a light meeting load.`
      : `Cada reunión cuesta **${fmt(costoReunion)}** en horas pagadas. Con ${reuniones} reuniones al mes son **${fmt(costoMensual)}**: apenas el **${pctStr}** de la jornada de 160 h, una carga de reuniones liviana.`;
  }

  const resumen = lang === 'en'
    ? `${fmt(nominaEfectiva)} payroll ÷ 160 h = ${fmt(costoHoraGrupo)}/h × ${durMin} min = ${fmt(costoReunion)} per meeting. ${reuniones} meetings/month = ${fmt(costoMensual)}/month (${fmt(costoAnual)}/year).${conCargas ? ' Includes 26.4% employer contributions.' : ''}`
    : `${fmt(nominaEfectiva)} de nómina ÷ 160 h = ${fmt(costoHoraGrupo)}/h × ${durMin} min = ${fmt(costoReunion)} por reunión. ${reuniones} reuniones/mes = ${fmt(costoMensual)}/mes (${fmt(costoAnual)}/año).${conCargas ? ' Incluye 26,4% de cargas patronales.' : ''}`;

  return {
    costoPorReunion: fmt(costoReunion),
    costoHoraGrupo: fmt(costoHoraGrupo) + '/h',
    costoMensual: fmt(costoMensual),
    costoAnual: fmt(costoAnual),
    porcentajeJornada: pctStr,
    resumen,
    _insight: {
      title: lang === 'en' ? `Each meeting costs ${fmt(costoReunion)}` : `Cada reunión cuesta ${fmt(costoReunion)}`,
      text: veredicto,
      tone,
      icon: '⏱️',
    },
    _chart: {
      type: 'gauge',
      value: Math.min(100, Math.round(pctJornada * 10) / 10),
      min: 0,
      max: 100,
      label: lang === 'en' ? `${pctStr} of work hours in meetings` : `${pctStr} de la jornada en reuniones`,
      zones: [
        { from: 0, to: 10, color: '#22c55e' },
        { from: 10, to: 30, color: '#f59e0b' },
        { from: 30, to: 100, color: '#ef4444' },
      ],
      ariaLabel: lang === 'en'
        ? `The team spends ${pctStr} of its 160 monthly work hours in meetings, costing ${fmt(costoMensual)} per month.`
        : `El equipo dedica el ${pctStr} de sus 160 horas mensuales a reuniones, con un costo de ${fmt(costoMensual)} por mes.`,
    },
  };
}
