/**
 * Nota media del expediente universitario (España) — escala 0-10 ponderada por créditos ECTS,
 * con la equivalencia clásica 1-4 (RD 1497/1987 / 1044/2003).
 * Media = Σ(nota × créditos) ÷ Σ(créditos). Equivalencia 1-4 por asignatura:
 * Aprobado (5-6,9)=1 · Notable (7-8,9)=2 · Sobresaliente (9-10)=3 · Matrícula de Honor=4.
 * Fórmula pura (es-ES). Entradas: listas separadas por comas de notas y de créditos.
 */

const fmtNum = (n: number, dec = 2): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec));

export interface Inputs {
  notas: string | number;       // "6, 8.5, 9, 7,2" (0-10)
  creditos: string | number;    // "6, 6, 9, 6" (ECTS)
  incluyeMH?: string;           // 'si' | 'no' — si alguna nota 9-10 es Matrícula de Honor (equiv. 4)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function equivalencia14(nota: number, mh: boolean): number {
  if (mh && nota >= 9) return 4;      // Matrícula de Honor
  if (nota >= 9) return 3;            // Sobresaliente
  if (nota >= 7) return 2;            // Notable
  if (nota >= 5) return 1;            // Aprobado
  return 0;                          // Suspenso
}

export function compute(i: Inputs): Outputs {
  const notasRaw = String(i.notas ?? '').trim();
  const credRaw = String(i.creditos ?? '').trim();
  if (!notasRaw) throw new Error('Introduce las notas separadas por comas (por ejemplo: 6, 8.5, 9)');
  if (!credRaw) throw new Error('Introduce los créditos ECTS de cada asignatura separados por comas');

  const notas = notasRaw.split(/[,;\n]+/).map(s => parseFloat(s.trim().replace(',', '.'))).filter(n => !isNaN(n));
  const creditos = credRaw.split(/[,;\n]+/).map(s => parseFloat(s.trim().replace(',', '.'))).filter(n => !isNaN(n));

  if (notas.length === 0) throw new Error('No se han reconocido notas válidas');
  if (notas.length !== creditos.length) throw new Error(`El número de notas (${notas.length}) y de créditos (${creditos.length}) debe coincidir`);
  for (const n of notas) if (n < 0 || n > 10) throw new Error(`La nota ${fmtNum(n, 1)} está fuera del rango 0-10`);
  for (const c of creditos) if (c <= 0) throw new Error('Los créditos deben ser mayores que 0');

  const mh = i.incluyeMH === 'si';
  const totalCreditos = creditos.reduce((a, b) => a + b, 0);

  const sumaPonderada = notas.reduce((acc, n, idx) => acc + n * creditos[idx], 0);
  const media10 = sumaPonderada / totalCreditos;

  const suma14 = notas.reduce((acc, n, idx) => acc + equivalencia14(n, mh) * creditos[idx], 0);
  const media14 = suma14 / totalCreditos;

  const media10R = Math.round(media10 * 100) / 100;
  let mencion = 'Suspenso';
  if (media10R >= 9) mencion = 'Sobresaliente';
  else if (media10R >= 7) mencion = 'Notable';
  else if (media10R >= 5) mencion = 'Aprobado';

  const _insight = {
    title: 'Tu nota media del expediente',
    text: `Con ${notas.length} asignaturas (${fmtNum(totalCreditos, 0)} ECTS), tu nota media ponderada es **${fmtNum(media10)} sobre 10** (${mencion}) y **${fmtNum(media14)} en la escala 1-4**. La media pondera por créditos: las asignaturas de más ECTS pesan más. Es la nota que aparece en el SET y la que usan becas y baremos de acceso a máster o funcionario.`,
    tone: media10R >= 7 ? 'good' : media10R >= 5 ? 'neutral' : 'warn',
    icon: '🎓',
  };

  const _chart = {
    type: 'scale',
    marker: media10R,
    markerLabel: fmtNum(media10),
    min: 0,
    segments: [
      { nombre: 'Suspenso', max: 5, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Aprobado', max: 7, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Notable', max: 9, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Sobresaliente', max: 10, color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Nota media ${fmtNum(media10)} sobre 10 (${mencion}).`,
  };

  return {
    notaMedia10: fmtNum(media10) + ' / 10',
    mencion,
    notaMedia14: fmtNum(media14) + ' / 4',
    creditosTotales: fmtNum(totalCreditos, 0) + ' ECTS',
    detalle: `Σ(nota × ECTS) = ${fmtNum(sumaPonderada)} ÷ ${fmtNum(totalCreditos, 0)} ECTS = ${fmtNum(media10)}/10. Equivalencia 1-4 ponderada = ${fmtNum(media14)}. Asignaturas: ${notas.length}.`,
    _insight,
    _chart,
  };
}
