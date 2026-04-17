/** Mejor Hora Publicar Instagram */
export interface Inputs { audiencia: string; dia: string; }
export interface Outputs { mejorHora: string; alternativa: string; razon: string; tip: string; }

export function instagramMejorHoraPublicar(i: Inputs): Outputs {
  const aud = String(i.audiencia);
  const dia = String(i.dia);
  if (!aud || !dia) throw new Error('Seleccioná audiencia y día');
  const base: Record<string, [string, string]> = {
    'Lunes': ['11:00-13:00', '19:00-21:00'],
    'Martes': ['19:00-21:00', '10:00-12:00'],
    'Miércoles': ['11:00-13:00', '19:00-21:00'],
    'Jueves': ['18:00-21:00', '11:00-13:00'],
    'Viernes': ['10:00-12:00', '17:00-19:00'],
    'Sábado': ['10:00-12:00', '15:00-17:00'],
    'Domingo': ['11:00-13:00', '18:00-20:00'],
  };
  const [best, alt] = base[dia] || ['11:00-13:00', '19:00-21:00'];
  let ajuste = '';
  if (aud.startsWith('Estudiantes')) ajuste = 'Estudiantes: picos en 14-16 y 20-23';
  else if (aud.startsWith('Padres')) ajuste = 'Padres: 5-7 AM o 20-22 (post chicos)';
  else if (aud.startsWith('Profesional')) ajuste = 'Profesionales: lunch (12-13) y after-work (18-21)';
  else ajuste = 'Audiencia mixta: horarios estándar';
  return {
    mejorHora: best + ' local',
    alternativa: alt + ' local',
    razon: ajuste,
    tip: 'Primera hora post-publicación decide el 80% del reach final — activá notificaciones y respondé rápido',
  };
}
