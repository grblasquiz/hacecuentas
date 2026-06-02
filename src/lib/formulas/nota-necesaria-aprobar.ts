/** Calculadora de nota necesaria para aprobar una materia */

export interface Inputs {
  notasActuales: string;
  totalEvaluaciones: number;
  promedioDeseado: number;
}

export interface Outputs {
  notaNecesaria: number;
  promedioActual: number;
  esPosible: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function notaNecesariaAprobar(i: Inputs): Outputs {
  if (!i.notasActuales || i.notasActuales.trim() === '') {
    throw new Error('Ingresá al menos una nota actual');
  }

  const totalEvaluaciones = Number(i.totalEvaluaciones);
  const promedioDeseado = Number(i.promedioDeseado);

  if (!totalEvaluaciones || totalEvaluaciones < 1) {
    throw new Error('El total de evaluaciones debe ser al menos 1');
  }
  if (!promedioDeseado || promedioDeseado < 1 || promedioDeseado > 10) {
    throw new Error('El promedio deseado debe estar entre 1 y 10');
  }

  // Separador: ; o espacio (coma se reserva como decimal AR: "7,5" -> 7.5)
  const notasArray = i.notasActuales
    .split(/[;\s]+/)
    .filter((s) => s)
    .map((n) => parseFloat(n.trim().replace(',', '.')))
    .filter((n) => !isNaN(n));

  if (notasArray.length === 0) {
    throw new Error('No se encontraron notas válidas.');
  }
  if (notasArray.length >= totalEvaluaciones) {
    throw new Error('Ya tenés todas las evaluaciones rendidas. No hay nota pendiente que calcular.');
  }

  const sumaActual = notasArray.reduce((acc, n) => acc + n, 0);
  const promedioActual = sumaActual / notasArray.length;
  const evaluacionesPendientes = totalEvaluaciones - notasArray.length;
  const sumaFaltante = promedioDeseado * totalEvaluaciones - sumaActual;
  const notaNecesaria = sumaFaltante / evaluacionesPendientes;

  let esPosible: string;
  if (notaNecesaria > 10) {
    esPosible = 'No, necesitás más de 10. Considerá recuperar un parcial.';
  } else if (notaNecesaria <= 0) {
    esPosible = 'Sí, ya tenés asegurado ese promedio con cualquier nota.';
  } else {
    esPosible = `Sí, necesitás ${notaNecesaria.toFixed(2)} o más.`;
  }

  const notaNecesariaOut = Math.round(Math.max(0, notaNecesaria) * 100) / 100;
  const promedioActualOut = Math.round(promedioActual * 100) / 100;

  let tone: 'good' | 'warn' | 'neutral';
  let icon: string;
  let insightText: string;
  if (notaNecesaria <= 0) {
    tone = 'good';
    icon = '🎯';
    insightText = `Tu promedio actual es **${promedioActualOut}** y ya supera el objetivo de **${promedioDeseado}**. Tenés el promedio asegurado: con cualquier nota en ${evaluacionesPendientes === 1 ? 'la evaluación restante' : `las ${evaluacionesPendientes} evaluaciones restantes`} lo mantenés.`;
  } else if (notaNecesaria > 10) {
    tone = 'warn';
    icon = '🚨';
    insightText = `Necesitarías **${notaNecesaria.toFixed(2)}** y la escala llega a 10: con ${evaluacionesPendientes === 1 ? 'la nota pendiente' : `las ${evaluacionesPendientes} notas pendientes`} no alcanza para el promedio **${promedioDeseado}**. Apuntá a recuperar un parcial o ajustá tu meta.`;
  } else if (notaNecesaria > 8) {
    tone = 'warn';
    icon = '📈';
    insightText = `Para llegar a **${promedioDeseado}** necesitás **${notaNecesariaOut}** en ${evaluacionesPendientes === 1 ? 'la evaluación restante' : `cada una de las ${evaluacionesPendientes} evaluaciones restantes`} (hoy promediás **${promedioActualOut}**). Es exigente: dejá margen y no te juegues todo a último momento.`;
  } else {
    tone = 'good';
    icon = '✅';
    insightText = `Vas de **${promedioActualOut}** a la meta de **${promedioDeseado}**: te alcanza con sacar **${notaNecesariaOut}** en ${evaluacionesPendientes === 1 ? 'la evaluación restante' : `cada una de las ${evaluacionesPendientes} restantes`}. Es un objetivo realista.`;
  }

  const markerNota = notaNecesariaOut;
  const ultimoMax = Math.max(13, Math.ceil(markerNota) + 1);

  return {
    notaNecesaria: notaNecesariaOut,
    promedioActual: promedioActualOut,
    esPosible,
    detalle: evaluacionesPendientes === 1
      ? `Con ${notasArray.length} nota(s) rendida(s), necesitás un ${Math.max(0, notaNecesaria).toFixed(2)} en la evaluación restante`
      : `Con ${notasArray.length} nota(s) rendida(s), necesitás promediar ${Math.max(0, notaNecesaria).toFixed(2)} en las ${evaluacionesPendientes} evaluaciones restantes`,
    _insight: { title: 'Qué necesitás para llegar', text: insightText, tone, icon },
    _chart: {
      type: 'scale',
      marker: markerNota,
      markerLabel: `Necesitás ${notaNecesariaOut}`,
      min: 0,
      segments: [
        { nombre: 'Cómodo', max: 6, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Exigente', max: 8, color: '#eab308', colorDark: '#ca8a04' },
        { nombre: 'Muy exigente', max: 10, color: '#f97316', colorDark: '#ea580c' },
        { nombre: 'Fuera de escala', max: ultimoMax, color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `La nota necesaria de ${notaNecesariaOut} sobre una escala de 0 a 10 (con zona fuera de escala si supera 10)`,
    },
  };
}
