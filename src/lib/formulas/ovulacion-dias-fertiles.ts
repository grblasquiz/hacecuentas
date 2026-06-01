/** Calculadora de ovulación y días fértiles */
export interface Inputs {
  fumOvulacion: string;
  duracionCiclo: number;
  __lang?: string;
}
export interface Outputs {
  fechaOvulacion: string;
  ventanaFertil: string;
  proximaMenstruacion: string;
  diasHastaOvulacion: number;
}

export function ovulacionDiasFertiles(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      fechaInvalida: 'Ingresá una fecha válida',
      duracionInvalida: 'La duración del ciclo debe estar entre 21 y 45 días',
    },
    en: {
      fechaInvalida: 'Enter a valid date',
      duracionInvalida: 'Cycle length must be between 21 and 45 days',
    },
  } as const)[__lang];

  const parts = String(i.fumOvulacion || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error(T.fechaInvalida);
  const [yy, mm, dd] = parts;
  const fum = new Date(yy, mm - 1, dd);
  if (isNaN(fum.getTime())) throw new Error(T.fechaInvalida);
  const ciclo = Number(i.duracionCiclo) || 28;
  if (ciclo < 21 || ciclo > 45) throw new Error(T.duracionInvalida);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Ovulación: FUM + (duración ciclo - 14)
  const diaOvulacion = ciclo - 14;
  const fechaOvulacion = new Date(fum.getTime());
  fechaOvulacion.setDate(fechaOvulacion.getDate() + diaOvulacion);

  // Ventana fértil: 5 días antes de ovulación hasta el día de ovulación
  const inicioVentana = new Date(fechaOvulacion.getTime());
  inicioVentana.setDate(inicioVentana.getDate() - 5);

  // Próxima menstruación
  const proximaMenstruacion = new Date(fum.getTime());
  proximaMenstruacion.setDate(proximaMenstruacion.getDate() + ciclo);

  // Días hasta ovulación
  const diasHastaOvulacion = Math.floor((fechaOvulacion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  return {
    fechaOvulacion: fmt(fechaOvulacion),
    ventanaFertil: __lang === 'en' ? `From ${fmt(inicioVentana)} to ${fmt(fechaOvulacion)}` : `Del ${fmt(inicioVentana)} al ${fmt(fechaOvulacion)}`,
    proximaMenstruacion: fmt(proximaMenstruacion),
    diasHastaOvulacion: Math.max(0, diasHastaOvulacion),
  };
}
