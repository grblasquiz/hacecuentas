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
}

function parseLocal(s: string): Date {
  const parts = String(s || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Fecha inválida');
  const [yy, mm, dd] = parts;
  const d = new Date(yy, mm - 1, dd);
  if (isNaN(d.getTime())) throw new Error('Fecha inválida');
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

function formatNice(d: Date): string {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

/** Hitos obstétricos estándar (semana ideal, descripción). Usados para sugerir
 *  el próximo control según la semana actual. Fuentes: Ministerio de Salud AR,
 *  ACOG recommendations. */
const HITOS: Array<{ semanaInicio: number; semanaFin: number; evento: string }> = [
  { semanaInicio: 8,  semanaFin: 12, evento: 'primera ecografía (confirma edad gestacional y viabilidad)' },
  { semanaInicio: 11, semanaFin: 13, evento: 'ecografía de tamiz del 1º trimestre (translucencia nucal)' },
  { semanaInicio: 16, semanaFin: 20, evento: 'estudios de laboratorio (hemograma, orina, VDRL, HIV)' },
  { semanaInicio: 20, semanaFin: 22, evento: 'ecografía scan morfológica (se ve el sexo del bebé)' },
  { semanaInicio: 24, semanaFin: 28, evento: 'test de O\'Sullivan (diabetes gestacional)' },
  { semanaInicio: 27, semanaFin: 28, evento: 'vacuna dTpa (triple bacteriana acelular)' },
  { semanaInicio: 32, semanaFin: 34, evento: 'ecografía de crecimiento' },
  { semanaInicio: 35, semanaFin: 37, evento: 'cultivo estreptococo B vaginal/rectal' },
  { semanaInicio: 37, semanaFin: 41, evento: 'controles semanales + monitoreo fetal' },
];

function proximoHito(semanasTotales: number): string {
  if (semanasTotales >= 41) return 'Embarazo postérmino — control inmediato con tu obstetra.';
  for (const h of HITOS) {
    if (semanasTotales < h.semanaFin) {
      if (semanasTotales >= h.semanaInicio) {
        return `Ahora (semanas ${h.semanaInicio}–${h.semanaFin}): ${h.evento}.`;
      }
      const falta = h.semanaInicio - semanasTotales;
      return `En ${falta} semana${falta === 1 ? '' : 's'} (semana ${h.semanaInicio}): ${h.evento}.`;
    }
  }
  return 'Seguí con controles semanales hasta el parto.';
}

export function embarazo(inputs: EmbarazoInputs): EmbarazoOutputs {
  if (!inputs.fum) throw new Error('Ingresá la fecha de tu última menstruación');
  const fum = parseLocal(inputs.fum);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fum.setHours(0, 0, 0, 0);
  if (fum > hoy) throw new Error('La fecha no puede ser futura');

  const diasTranscurridos = Math.floor((hoy.getTime() - fum.getTime()) / 86_400_000);
  if (diasTranscurridos > 300) {
    throw new Error('Fecha demasiado antigua (más de 300 días). Revisá la FUM ingresada.');
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

  const detalle = `FUM: ${formatNice(fum)} | Semana ${semanasTotales}+${diasExtra} | Trimestre ${trimestre} (ACOG) | FPP: ${formatNice(fpp)} | Progreso ${progreso}% | Días restantes: ${diasRestantes}.`;

  return {
    fpp: formatIso(fpp),
    semanas: `${semanasTotales} semanas y ${diasExtra} días`,
    trimestre,
    diasRestantes,
    progreso: `${progreso}%`,
    fechaConcepcion: formatIso(fechaConcepcion),
    inicioSegundoTrimestre: formatIso(inicioSegTrim),
    inicioTercerTrimestre: formatIso(inicioTerTrim),
    proximoControl: proximoHito(semanasTotales),
    detalle,
  };
}
