/** Calculadora Horas de Estudio */
export interface Inputs { paginas: number; velocidadPagHora: number; dificultad: string; diasDisponibles: number; }
export interface Outputs { horasTotales: number; horasPorDia: number; repasos: string; recomendacion: string; }

export function tiempoEstudioExamen(i: Inputs): Outputs {
  const pag = Number(i.paginas);
  const vel = Number(i.velocidadPagHora);
  const dias = Number(i.diasDisponibles);
  if (pag <= 0) throw new Error('Las páginas deben ser mayor a 0');
  if (vel <= 0) throw new Error('La velocidad debe ser mayor a 0');
  if (dias <= 0) throw new Error('Los días deben ser mayor a 0');

  const factores: Record<string, number> = { facil: 1, media: 1.5, dificil: 2, muy_dificil: 2.5 };
  const factor = factores[i.dificultad] || 1.5;

  const horasLectura = pag / vel;
  const horasConDificultad = horasLectura * factor;
  const horasConRepaso = horasConDificultad * 1.3; // +30% repaso
  const horasPorDia = horasConRepaso / dias;

  let rec: string;
  if (horasPorDia <= 3) rec = 'Ritmo cómodo. Tenés tiempo de sobra.';
  else if (horasPorDia <= 5) rec = 'Ritmo normal. Organizate bien y llegás.';
  else if (horasPorDia <= 7) rec = 'Ritmo intenso. Priorizá los temas más importantes.';
  else rec = 'Ritmo extremo. Considerá priorizar o pedir más tiempo.';

  return {
    horasTotales: Number(horasConRepaso.toFixed(1)),
    horasPorDia: Number(horasPorDia.toFixed(1)),
    repasos: `Lectura: ${horasLectura.toFixed(1)}h + Dificultad (×${factor}): ${horasConDificultad.toFixed(1)}h + Repaso (30%): ${horasConRepaso.toFixed(1)}h total`,
    recomendacion: rec,
  };
}
