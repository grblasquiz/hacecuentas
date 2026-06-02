/** Calculadora de promedio ponderado universitario con créditos */

export interface Inputs {
  notas: string;
  creditos: string;
}

export interface Outputs {
  promedioPonderado: number;
  totalCreditos: number;
  cantidadMaterias: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function promedioPonderadoUniversidad(i: Inputs): Outputs {
  if (!i.notas || i.notas.trim() === '') {
    throw new Error('Ingresá al menos una nota');
  }
  if (!i.creditos || i.creditos.trim() === '') {
    throw new Error('Ingresá los créditos de cada materia');
  }

  // Separador: ; o espacio (coma se reserva como decimal AR: "7,5" -> 7.5)
  const notasArray = i.notas.split(/[;\s]+/).filter((s) => s).map((n) => parseFloat(n.trim().replace(',', '.'))).filter((n) => !isNaN(n));
  const creditosArray = i.creditos.split(/[;\s]+/).filter((s) => s).map((n) => parseFloat(n.trim().replace(',', '.'))).filter((n) => !isNaN(n));

  if (notasArray.length === 0) {
    throw new Error('No se encontraron notas válidas.');
  }
  if (creditosArray.length === 0) {
    throw new Error('No se encontraron créditos válidos.');
  }
  if (notasArray.length !== creditosArray.length) {
    throw new Error(`Cantidad de notas (${notasArray.length}) y créditos (${creditosArray.length}) no coinciden.`);
  }

  for (const nota of notasArray) {
    if (nota < 0 || nota > 10) {
      throw new Error(`La nota ${nota} está fuera del rango válido (0-10).`);
    }
  }
  for (const c of creditosArray) {
    if (c <= 0) {
      throw new Error('Los créditos deben ser mayores a 0.');
    }
  }

  const totalCreditos = creditosArray.reduce((acc, c) => acc + c, 0);
  const sumaPonderada = notasArray.reduce((acc, nota, idx) => acc + nota * creditosArray[idx], 0);
  const promedioPonderado = sumaPonderada / totalCreditos;

  const prom = Math.round(promedioPonderado * 100) / 100;
  // Promedio simple para contrastar el efecto de los créditos
  const promSimple = notasArray.reduce((a, b) => a + b, 0) / notasArray.length;
  const dif = prom - promSimple;

  let cat: string, tone: 'good' | 'warn' | 'neutral';
  if (prom < 4) { cat = 'desaprobatorio'; tone = 'warn'; }
  else if (prom < 6) { cat = 'a recuperar'; tone = 'warn'; }
  else if (prom < 8) { cat = 'aprobado'; tone = 'neutral'; }
  else { cat = 'distinguido'; tone = 'good'; }

  const efecto = Math.abs(dif) < 0.05
    ? 'Los créditos no cambian casi nada respecto al promedio simple.'
    : dif > 0
      ? `Pesar por créditos te **sube ${dif.toFixed(2)}** vs el promedio simple (${promSimple.toFixed(2)}): tus mejores notas están en las materias de más créditos.`
      : `Pesar por créditos te **baja ${Math.abs(dif).toFixed(2)}** vs el promedio simple (${promSimple.toFixed(2)}): las materias pesadas son las que más te cuestan.`;

  const _insight = {
    title: 'Tu promedio ponderado',
    text: `Promedio ponderado **${prom.toFixed(2)}/10** sobre ${totalCreditos} créditos en ${notasArray.length} materia(s) — nivel **${cat}**. ${efecto}`,
    tone,
    icon: '🎓',
  };

  const _chart = {
    type: 'scale' as const,
    marker: prom,
    markerLabel: prom.toFixed(2),
    min: 0,
    segments: [
      { nombre: 'Desaprobado', max: 4, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'A recuperar', max: 6, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Aprobado', max: 8, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Distinguido', max: 10, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: 'Promedio ponderado en escala de 0 a 10',
  };

  return {
    promedioPonderado: prom,
    totalCreditos,
    cantidadMaterias: notasArray.length,
    detalle: `Promedio ponderado de ${notasArray.length} materia(s) con ${totalCreditos} créditos totales: ${promedioPonderado.toFixed(2)}`,
    _insight,
    _chart,
  };
}
