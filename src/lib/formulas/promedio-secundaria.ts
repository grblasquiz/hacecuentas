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
  _insight?: any;
  _chart?: any;
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

  const prom = Number(promedio.toFixed(2));
  // Interpretación (escala 1-10, aprueba con 6 en Argentina)
  let tone: 'good' | 'warn' | 'neutral';
  let estado: string;
  if (desaprobadas > 0) {
    tone = 'warn';
    estado = desaprobadas === 1
      ? `Tenés **1 materia desaprobada** (la más baja: ${notaMasBaja}). Recuperala para no arrastrarla.`
      : `Tenés **${desaprobadas} materias desaprobadas** (la más baja: ${notaMasBaja}). Priorizá recuperarlas.`;
  } else if (prom >= 8) {
    tone = 'good';
    estado = `Todas aprobadas y un promedio de excelencia: **las ${notas.length} materias** por encima de 6, con un piso de ${notaMasBaja}.`;
  } else {
    tone = 'good';
    estado = `**Las ${notas.length} materias aprobadas**, sin previas. Tu nota más baja (${notaMasBaja}) ya está sobre el 6.`;
  }

  const _insight = {
    title: 'Tu promedio de secundaria',
    text: `Promedio **${prom.toFixed(2)}** sobre ${notas.length} materia(s). ${estado}`,
    tone,
    icon: '📚',
  };

  // Donut: aprobadas + desaprobadas suman el total de materias
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Aprobadas', value: aprobadas },
      { label: 'Desaprobadas', value: desaprobadas },
    ],
    centerValue: String(notas.length),
    centerLabel: notas.length === 1 ? 'Materia' : 'Materias',
    ariaLabel: `De ${notas.length} materias, ${aprobadas} aprobadas y ${desaprobadas} desaprobadas`,
  };

  return {
    promedio: prom,
    totalMaterias: notas.length,
    aprobadas,
    desaprobadas,
    notaMasAlta,
    notaMasBaja,
    mensaje: `Promedio: ${promedio.toFixed(2)}. ${aprobadas} aprobadas, ${desaprobadas} desaprobadas de ${notas.length} materias.`,
    _insight,
    _chart,
  };
}
