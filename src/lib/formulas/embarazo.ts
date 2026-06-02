/**
 * Calculadora de embarazo — regla de Naegele + hitos obstétricos ACOG.
 * FPP (Fecha probable de parto) = FUM + 280 días (40 semanas).
 *
 * Trimestres según ACOG (American College of Obstetricians):
 *   1º: semanas 0 0/7 — 13 6/7 (días 0—97)
 *   2º: semanas 14 0/7 — 27 6/7 (días 98—195)
 *   3º: semanas 28 0/7 en adelante (días 196+)
 */

export interface EmbarazoInputs {
  fum: string; // fecha última menstruación YYYY-MM-DD
  __lang?: string;
}

export interface EmbarazoOutputs {
  fpp: string;
  semanas: string;
  trimestre: number;
  diasRestantes: number;
  progreso: string;
  fechaConcepcion: string;
  inicioSegundoTrimestre: string;
  inicioTercerTrimestre: string;
  proximoControl: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function parseLocal(s: string, lang: string): Date {
  const parts = String(s || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error(lang === 'en' ? 'Invalid date' : 'Fecha inválida');
  const [yy, mm, dd] = parts;
  const d = new Date(yy, mm - 1, dd);
  if (isNaN(d.getTime())) throw new Error(lang === 'en' ? 'Invalid date' : 'Fecha inválida');
  return d;
}

function formatIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + n);
  return out;
}

function formatNice(d: Date, lang: string): string {
  if (lang === 'en') {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

/** Hitos obstétricos estándar (semana ideal, descripción). Usados para sugerir
 *  el próximo control según la semana actual. Fuentes: Ministerio de Salud AR,
 *  ACOG recommendations. */
const HITOS: Array<{ semanaInicio: number; semanaFin: number; evento: string; eventoEn: string }> = [
  { semanaInicio: 8,  semanaFin: 12, evento: 'primera ecografía (confirma edad gestacional y viabilidad)', eventoEn: 'first ultrasound (confirms gestational age and viability)' },
  { semanaInicio: 11, semanaFin: 13, evento: 'ecografía de tamiz del 1º trimestre (translucencia nucal)', eventoEn: '1st-trimester screening ultrasound (nuchal translucency)' },
  { semanaInicio: 16, semanaFin: 20, evento: 'estudios de laboratorio (hemograma, orina, VDRL, HIV)', eventoEn: 'lab work (blood count, urinalysis, VDRL, HIV)' },
  { semanaInicio: 20, semanaFin: 22, evento: 'ecografía scan morfológica (se ve el sexo del bebé)', eventoEn: 'anatomy scan ultrasound (sex of the baby may be visible)' },
  { semanaInicio: 24, semanaFin: 28, evento: 'test de O\'Sullivan (diabetes gestacional)', eventoEn: 'glucose challenge test (gestational diabetes screening)' },
  { semanaInicio: 27, semanaFin: 28, evento: 'vacuna dTpa (triple bacteriana acelular)', eventoEn: 'Tdap vaccine (acellular pertussis booster)' },
  { semanaInicio: 32, semanaFin: 34, evento: 'ecografía de crecimiento', eventoEn: 'growth ultrasound' },
  { semanaInicio: 35, semanaFin: 37, evento: 'cultivo estreptococo B vaginal/rectal', eventoEn: 'Group B Strep vaginal/rectal culture' },
  { semanaInicio: 37, semanaFin: 41, evento: 'controles semanales + monitoreo fetal', eventoEn: 'weekly check-ups + fetal monitoring' },
];

function proximoHito(semanasTotales: number, lang: string): string {
  if (semanasTotales >= 41) return lang === 'en'
    ? 'Post-term pregnancy — see your OB immediately.'
    : 'Embarazo postérmino — control inmediato con tu obstetra.';
  for (const h of HITOS) {
    if (semanasTotales < h.semanaFin) {
      const ev = lang === 'en' ? h.eventoEn : h.evento;
      if (semanasTotales >= h.semanaInicio) {
        return lang === 'en'
          ? `Now (weeks ${h.semanaInicio}–${h.semanaFin}): ${ev}.`
          : `Ahora (semanas ${h.semanaInicio}–${h.semanaFin}): ${ev}.`;
      }
      const falta = h.semanaInicio - semanasTotales;
      return lang === 'en'
        ? `In ${falta} week${falta === 1 ? '' : 's'} (week ${h.semanaInicio}): ${ev}.`
        : `En ${falta} semana${falta === 1 ? '' : 's'} (semana ${h.semanaInicio}): ${ev}.`;
    }
  }
  return lang === 'en'
    ? 'Continue with weekly check-ups until delivery.'
    : 'Seguí con controles semanales hasta el parto.';
}

export function embarazo(inputs: EmbarazoInputs): EmbarazoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';

  if (!inputs.fum) throw new Error(__lang === 'en' ? 'Enter the date of your last menstrual period' : 'Ingresá la fecha de tu última menstruación');
  const fum = parseLocal(inputs.fum, __lang);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fum.setHours(0, 0, 0, 0);
  if (fum > hoy) throw new Error(__lang === 'en' ? 'The date cannot be in the future' : 'La fecha no puede ser futura');

  const diasTranscurridos = Math.floor((hoy.getTime() - fum.getTime()) / 86_400_000);
  if (diasTranscurridos > 300) {
    throw new Error(__lang === 'en'
      ? 'Date too far in the past (more than 300 days). Please check the LMP date entered.'
      : 'Fecha demasiado antigua (más de 300 días). Revisá la FUM ingresada.');
  }

  const semanasTotales = Math.floor(diasTranscurridos / 7);
  const diasExtra = diasTranscurridos % 7;

  const fpp = addDays(fum, 280);
  const diasRestantes = Math.max(0, 280 - diasTranscurridos);

  // Trimestres ACOG:
  //   1º: 0 0/7 — 13 6/7 (semanasTotales 0..13)
  //   2º: 14 0/7 — 27 6/7 (semanasTotales 14..27)
  //   3º: 28 0/7 en adelante
  let trimestre = 1;
  if (semanasTotales >= 28) trimestre = 3;
  else if (semanasTotales >= 14) trimestre = 2;

  const progreso = Math.min(100, (diasTranscurridos / 280) * 100).toFixed(1);

  // Hitos clave.
  const fechaConcepcion = addDays(fum, 14);  // ovulación estimada en ciclo 28 regular.
  const inicioSegTrim = addDays(fum, 98);    // semana 14 0/7.
  const inicioTerTrim = addDays(fum, 196);   // semana 28 0/7.

  const detalle = __lang === 'en'
    ? `LMP: ${formatNice(fum, __lang)} | Week ${semanasTotales}+${diasExtra} | Trimester ${trimestre} (ACOG) | EDD: ${formatNice(fpp, __lang)} | Progress ${progreso}% | Days remaining: ${diasRestantes}.`
    : `FUM: ${formatNice(fum, __lang)} | Semana ${semanasTotales}+${diasExtra} | Trimestre ${trimestre} (ACOG) | FPP: ${formatNice(fpp, __lang)} | Progreso ${progreso}% | Días restantes: ${diasRestantes}.`;

  const semFmt = __lang === 'en'
    ? `${semanasTotales}w ${diasExtra}d`
    : `${semanasTotales}s ${diasExtra}d`;
  const trimNombre = __lang === 'en'
    ? (trimestre === 1 ? '1st trimester' : trimestre === 2 ? '2nd trimester' : '3rd trimester')
    : (trimestre === 1 ? '1er trimestre' : trimestre === 2 ? '2º trimestre' : '3er trimestre');
  const _insight = {
    title: __lang === 'en' ? 'Where you are' : 'En qué punto estás',
    text: __lang === 'en'
      ? `You're at **${semanasTotales} weeks ${diasExtra} days** (${trimNombre}), **${progreso}%** of the way through. Your estimated due date is **${formatNice(fpp, __lang)}**, about **${diasRestantes} days** away.`
      : `Estás de **${semanasTotales} semanas ${diasExtra} días** (${trimNombre}), un **${progreso}%** del camino recorrido. La fecha probable de parto es el **${formatNice(fpp, __lang)}**, dentro de unos **${diasRestantes} días**.`,
    tone: 'good' as const,
    icon: '🤰',
  };
  const _chart = {
    type: 'scale',
    marker: Math.min(diasTranscurridos, 280),
    markerLabel: semFmt,
    min: 0,
    segments: [
      { nombre: __lang === 'en' ? '1st trim.' : '1er trim.', max: 97, color: '#a7f3d0', colorDark: '#065f46' },
      { nombre: __lang === 'en' ? '2nd trim.' : '2º trim.', max: 195, color: '#6ee7b7', colorDark: '#047857' },
      { nombre: __lang === 'en' ? '3rd trim.' : '3er trim.', max: 280, color: '#34d399', colorDark: '#059669' },
    ],
    ariaLabel: __lang === 'en'
      ? `Gestation progress: day ${diasTranscurridos} of 280 (${trimNombre}).`
      : `Avance del embarazo: día ${diasTranscurridos} de 280 (${trimNombre}).`,
  };

  return {
    fpp: formatIso(fpp),
    semanas: __lang === 'en'
      ? `${semanasTotales} weeks and ${diasExtra} day${diasExtra === 1 ? '' : 's'}`
      : `${semanasTotales} semanas y ${diasExtra} días`,
    trimestre,
    diasRestantes,
    progreso: `${progreso}%`,
    fechaConcepcion: formatIso(fechaConcepcion),
    inicioSegundoTrimestre: formatIso(inicioSegTrim),
    inicioTercerTrimestre: formatIso(inicioTerTrim),
    proximoControl: proximoHito(semanasTotales, __lang),
    detalle,
    _insight,
    _chart,
  };
}
