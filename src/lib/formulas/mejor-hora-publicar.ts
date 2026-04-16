/** Calculadora de Mejor Hora para Publicar */
export interface Inputs { plataforma: string; zonaHoraria: number; tipoContenido: string; }
export interface Outputs { mejorHora: string; mejorDia: string; peorHora: string; recomendacion: string; }

const HORAS_UTC: Record<string, { mejor: number[]; peor: number[]; dias: string }> = {
  instagram: { mejor: [11, 13, 19], peor: [2, 3, 4], dias: 'Martes, Miércoles y Jueves' },
  tiktok: { mejor: [10, 14, 21], peor: [3, 4, 5], dias: 'Martes, Jueves y Viernes' },
  youtube: { mejor: [14, 16, 20], peor: [1, 2, 3], dias: 'Jueves, Viernes y Sábado' },
  linkedin: { mejor: [8, 10, 12], peor: [22, 23, 0], dias: 'Martes, Miércoles y Jueves' },
  twitter: { mejor: [9, 12, 17], peor: [1, 2, 3], dias: 'Lunes, Martes y Miércoles' },
  facebook: { mejor: [9, 13, 16], peor: [23, 0, 1], dias: 'Miércoles, Jueves y Viernes' },
};

export function mejorHoraPublicar(i: Inputs): Outputs {
  const offset = Number(i.zonaHoraria);
  if (isNaN(offset)) throw new Error('Ingresá el offset GMT');
  const data = HORAS_UTC[i.plataforma];
  if (!data) throw new Error('Seleccioná una plataforma');

  const toLocal = (h: number) => ((h + offset) % 24 + 24) % 24;
  const fmt = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  const mejores = data.mejor.map(h => fmt(toLocal(h)));
  const peores = data.peor.map(h => fmt(toLocal(h)));

  return {
    mejorHora: mejores.join(', '),
    mejorDia: data.dias,
    peorHora: peores.join(', '),
    recomendacion: `Para ${i.plataforma}, publicá ${i.tipoContenido} a las ${mejores[0]} o ${mejores[1]} (tu hora local). Los mejores días: ${data.dias}. Evitá ${peores[0]}-${peores[2]}.`,
  };
}
