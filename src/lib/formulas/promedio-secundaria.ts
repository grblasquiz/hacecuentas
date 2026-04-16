/** Calculadora de promedio de secundaria */
export interface Inputs {
  notas: string; // formato: "nota1;nota2;nota3;..."
}
export interface Outputs {
  promedio: number;
  totalMaterias: number;
  aprobadas: number;
  desaprobadas: number;
  notaMasAlta: number;
  notaMasBaja: number;
  mensaje: string;
}

export function promedioSecundaria(i: Inputs): Outputs {
  const notasStr = String(i.notas || '');
  if (!notasStr) throw new Error('Ingresá al menos una nota');

  const notas = notasStr.split(';').filter(s => s.trim()).map(Number);
  if (notas.length === 0) throw new Error('Ingresá al menos una nota');

  for (const n of notas) {
    if (isNaN(n) || n < 1 || n > 10) throw new Error('Las notas deben estar entre 1 y 10');
  }

  const suma = notas.reduce((a, b) => a + b, 0);
  const promedio = suma / notas.length;
  const aprobadas = notas.filter(n => n >= 6).length; // 6 para aprobar en Argentina
  const desaprobadas = notas.length - aprobadas;
  const notaMasAlta = Math.max(...notas);
  const notaMasBaja = Math.min(...notas);

  return {
    promedio: Number(promedio.toFixed(2)),
    totalMaterias: notas.length,
    aprobadas,
    desaprobadas,
    notaMasAlta,
    notaMasBaja,
    mensaje: `Promedio: ${promedio.toFixed(2)}. ${aprobadas} aprobadas, ${desaprobadas} desaprobadas de ${notas.length} materias.`,
  };
}
