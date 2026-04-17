/** Mejor Hora Publicar TikTok */
export interface Inputs { audiencia: string; dia: string; }
export interface Outputs { mejorHora: string; alternativas: string; razon: string; evitar: string; }

export function tiktokMejorHoraPublicar(i: Inputs): Outputs {
  const aud = String(i.audiencia);
  const dia = String(i.dia);
  if (!aud || !dia) throw new Error('Seleccioná audiencia y día');
  const baseByDia: Record<string, [string, string]> = {
    'Lunes': ['19:00-22:00', '6:00-10:00'],
    'Martes': ['19:00-22:00', '9:00-12:00'],
    'Miércoles': ['19:00-21:00', '7:00-9:00'],
    'Jueves': ['18:00-22:00', '12:00-14:00'],
    'Viernes': ['17:00-20:00', '5:00-7:00'],
    'Sábado': ['11:00-14:00', '20:00-23:00'],
    'Domingo': ['14:00-17:00', '20:00-22:00'],
  };
  const [best, alt] = baseByDia[dia] || ['19:00-22:00', '12:00-14:00'];
  let ajuste = '';
  if (aud.startsWith('Estudiantes')) ajuste = 'Estudiantes: pico real en 16-18 y 21-24';
  else if (aud.startsWith('Padres')) ajuste = 'Padres: subir antes de las 8 AM o después de las 21 hs';
  else if (aud.startsWith('Profesional')) ajuste = 'Profesionales: commute (7-9), lunch (12-14) y after-work (18-22)';
  else ajuste = 'Audiencia mixta: horarios estándar';
  return {
    mejorHora: best + ' local',
    alternativas: alt + ' local',
    razon: ajuste,
    evitar: 'Evitá publicar entre 2 AM y 5 AM: test pool vacío debilita la señal inicial',
  };
}
