/**
 * Calculadora de proyección de crecimiento de seguidores (interés compuesto).
 * Proyecta cuántos seguidores vas a tener en N meses si mantenés una tasa de
 * crecimiento mensual constante, capitalizando mes a mes.
 *
 * Fórmula: proyectados = actuales × (1 + tasa_mensual)^meses
 * (crecimiento compuesto, igual que el interés compuesto financiero).
 *
 * Nota: asume una tasa CONSTANTE. En la práctica el crecimiento orgánico
 * suele desacelerarse al crecer la base; usalo como escenario optimista/lineal.
 */

export interface ProyeccionCrecimientoSeguidoresMesesInputs {
  seguidores_actuales: number | string | null;
  crecimiento_mensual_pct: number | string | null; // %
  meses: number | string | null;
}

interface FilaMes {
  mes: number;
  seguidores: number;
  ganadosEnElMes: number;
}

export interface ProyeccionCrecimientoSeguidoresMesesOutputs {
  seguidoresProyectados: number;
  gananciaNeta: number;
  multiplicador: string; // "2.5×"
  promedioMensualGanado: number;
  tabla: FilaMes[];
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function proyeccionCrecimientoSeguidoresMeses(
  i: ProyeccionCrecimientoSeguidoresMesesInputs
): ProyeccionCrecimientoSeguidoresMesesOutputs {
  const actuales =
    i.seguidores_actuales === '' || i.seguidores_actuales == null
      ? 0
      : Number(i.seguidores_actuales);
  const tasaPct =
    i.crecimiento_mensual_pct === '' || i.crecimiento_mensual_pct == null
      ? 8
      : Number(i.crecimiento_mensual_pct);
  const meses =
    i.meses === '' || i.meses == null ? 12 : Math.round(Number(i.meses));

  if (!actuales || actuales <= 0)
    throw new Error('Ingresá tu cantidad actual de seguidores');
  if (meses <= 0) throw new Error('Ingresá un número de meses mayor a 0');

  const tasa = tasaPct / 100;

  // Tabla mes a mes (compuesto)
  const tabla: FilaMes[] = [];
  let acumulado = actuales;
  for (let m = 1; m <= meses; m++) {
    const previo = acumulado;
    acumulado = previo * (1 + tasa);
    tabla.push({
      mes: m,
      seguidores: Math.round(acumulado),
      ganadosEnElMes: Math.round(acumulado - previo),
    });
  }

  const seguidoresProyectados = actuales * Math.pow(1 + tasa, meses);
  const gananciaNeta = seguidoresProyectados - actuales;
  const multiplicadorNum = seguidoresProyectados / actuales;
  const promedioMensualGanado = gananciaNeta / meses;

  const r = (n: number) => Math.round(n);
  const fmt = (n: number) => r(n).toLocaleString('es-AR');

  let tone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (tasaPct >= 10) {
    tone = 'good';
    insightText = `A **${tasaPct}% mensual** compuesto, en **${meses} meses** pasás de **${fmt(
      actuales
    )}** a **${fmt(seguidoresProyectados)}** seguidores: lo **${(
      Math.round(multiplicadorNum * 10) / 10
    ).toFixed(
      1
    )}×**. Ojo: una tasa así de alta es difícil de sostener cuando la base crece (el crecimiento orgánico se desacelera). Tomá esto como escenario optimista.`;
  } else if (tasaPct >= 4) {
    tone = 'neutral';
    insightText = `Manteniendo **${tasaPct}% mensual** sumás **${fmt(
      gananciaNeta
    )}** seguidores en **${meses} meses** (de ${fmt(actuales)} a ${fmt(
      seguidoresProyectados
    )}). El compuesto hace la diferencia: ganás en promedio **${fmt(
      promedioMensualGanado
    )}/mes**, pero los últimos meses crecés más que los primeros porque la base es mayor.`;
  } else {
    tone = 'warn';
    insightText = `A **${tasaPct}% mensual** el crecimiento es lento: en **${meses} meses** llegás a **${fmt(
      seguidoresProyectados
    )}** (+${fmt(
      gananciaNeta
    )}). Para acelerar, subí frecuencia de publicación, apuntá a formatos de alcance (reels/shorts) y probá colaboraciones; pequeñas mejoras en la tasa mensual se amplifican por el compuesto.`;
  }

  const detalle = `${fmt(actuales)} × (1 + ${tasaPct}%)^${meses} = ${fmt(
    seguidoresProyectados
  )} seguidores proyectados. Ganancia neta +${fmt(
    gananciaNeta
  )} (×${(Math.round(multiplicadorNum * 10) / 10).toFixed(1)}).`;

  // Chart: barras de algunos hitos (no abrumar)
  const hitos: number[] = [];
  if (meses <= 6) {
    for (let m = 1; m <= meses; m++) hitos.push(m);
  } else {
    const paso = Math.ceil(meses / 6);
    for (let m = paso; m < meses; m += paso) hitos.push(m);
    hitos.push(meses);
  }
  const chartLabels = ['Hoy', ...hitos.map((m) => `Mes ${m}`)];
  const chartValues = [
    actuales,
    ...hitos.map((m) => tabla[m - 1].seguidores),
  ];

  return {
    seguidoresProyectados: r(seguidoresProyectados),
    gananciaNeta: r(gananciaNeta),
    multiplicador: `${(Math.round(multiplicadorNum * 10) / 10).toFixed(1)}×`,
    promedioMensualGanado: r(promedioMensualGanado),
    tabla,
    detalle,
    _insight: {
      title: 'Tu proyección de crecimiento',
      text: insightText,
      tone,
      icon: '🚀',
    },
    _chart: {
      type: 'bar',
      labels: chartLabels,
      values: chartValues,
      ariaLabel: `Proyección de seguidores: de ${fmt(
        actuales
      )} hoy a ${fmt(seguidoresProyectados)} en ${meses} meses.`,
    },
  };
}
