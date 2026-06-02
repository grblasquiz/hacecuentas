/** Calculadora de promedio simple de notas universitarias */

export interface Inputs {
  notas: string;
}

export interface Outputs {
  promedio: number;
  cantidadMaterias: number;
  notaMasAlta: number;
  notaMasBaja: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function promedioNotasUniversidad(i: Inputs): Outputs {
  if (!i.notas || i.notas.trim() === '') {
    throw new Error('Ingresá al menos una nota para calcular el promedio');
  }

  // Separador: ; o espacio (coma se reserva como decimal AR: "7,5" -> 7.5)
  const notasArray = i.notas
    .split(/[;\s]+/)
    .filter((s) => s)
    .map((n) => parseFloat(n.trim().replace(',', '.')))
    .filter((n) => !isNaN(n));

  if (notasArray.length === 0) {
    throw new Error('No se encontraron notas válidas. Ingresá números separados por punto y coma o espacio (ej: 7,5; 8; 9,2).');
  }

  for (const nota of notasArray) {
    if (nota < 0 || nota > 10) {
      throw new Error(`La nota ${nota} está fuera del rango válido (0-10).`);
    }
  }

  const suma = notasArray.reduce((acc, n) => acc + n, 0);
  const promedio = suma / notasArray.length;
  const notaMasAlta = Math.max(...notasArray);
  const notaMasBaja = Math.min(...notasArray);
  const prom = Math.round(promedio * 100) / 100;

  // --- Insight: dónde cae el promedio en la escala 0-10 ---
  const promTxt = prom.toLocaleString('es-AR');
  const reprobadas = notasArray.filter((n) => n < 4).length;
  let insTone: string; let insText: string; let insIcon: string;
  if (prom >= 8) {
    insTone = 'good'; insIcon = '🏆';
    insText = `Promedio de **${promTxt}**: rendimiento sobresaliente, en el rango de distinción académica.`;
  } else if (prom >= 6) {
    insTone = 'good'; insIcon = '👍';
    insText = `Promedio de **${promTxt}**: un buen nivel, por encima de la simple aprobación.`;
  } else if (prom >= 4) {
    insTone = 'neutral'; insIcon = '📚';
    insText = `Promedio de **${promTxt}**: aprobado, aunque hay margen para subir el nivel.`;
  } else {
    insTone = 'warn'; insIcon = '⚠️';
    insText = `Promedio de **${promTxt}**: por debajo del 4 de aprobación, conviene recuperar terreno.`;
  }
  if (reprobadas > 0) {
    insText += ` Tenés **${reprobadas}** materia(s) por debajo de 4 que tiran el promedio hacia abajo.`;
    if (insTone === 'good') insTone = 'neutral';
  }
  const _insight = { title: 'Tu nivel académico', text: insText, tone: insTone, icon: insIcon };

  const _chart = {
    type: 'scale',
    marker: prom,
    markerLabel: `Promedio ${promTxt}`,
    min: 0,
    segments: [
      { nombre: 'Insuficiente', max: 4, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Aprobado', max: 6, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Bueno', max: 8, color: '#3b82f6', colorDark: '#60a5fa' },
      { nombre: 'Distinguido', max: 10, color: '#22c55e', colorDark: '#4ade80' },
    ],
    ariaLabel: `Promedio ${promTxt} sobre 10 en la escala universitaria.`,
  };

  return {
    promedio: prom,
    cantidadMaterias: notasArray.length,
    notaMasAlta,
    notaMasBaja,
    detalle: `Promedio de ${notasArray.length} materia(s): ${promedio.toFixed(2)} sobre 10`,
    _insight,
    _chart,
  };
}
