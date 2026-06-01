/**
 * Descenso LaLiga (España). 20 equipos, 3 descienden (18º-19º-20º).
 * Temporada regular 38 fechas.
 *
 * Input: puntos del equipo, puntos del 17º (último salvado),
 * fechas restantes.
 * Output: puntos para alcanzar al 17º, safety threshold histórico (~38 pts),
 * veredicto.
 */

export interface DescensoLaLigaInputs {
  puntosEquipo: number;
  puntosDecimoSeptimo: number;
  fechasRestantes: number;
  safetyThreshold?: number; // default 38
}

export interface DescensoLaLigaOutputs {
  puntosParaAlcanzar17: number;
  puntosMaxPosibles: number;
  puntosProyectadosEmpatando: number;
  diferenciaConSafety: number;
  porcentajeSalvacion: number;
  veredicto: string;
  _chart?: any;
  _insight?: any;
}

export function descensoLaligaSantander(inputs: DescensoLaLigaInputs): DescensoLaLigaOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts17 = Number(inputs.puntosDecimoSeptimo) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);
  const safety = Number(inputs.safetyThreshold) || 38;

  const puntosParaAlcanzar17 = Math.max(0, pts17 - pts + 1); // +1 para superarlo
  const puntosMaxPosibles = pts + fechas * 3;
  const puntosProyectadosEmpatando = pts + fechas * 1;
  const diferenciaConSafety = pts - safety;

  // Probabilidad simple de salvación heurística:
  // si ya está por encima del umbral → 95%
  // si le faltan pocos puntos vs restantes → escala lineal
  let porcentajeSalvacion: number;
  if (puntosMaxPosibles < safety) {
    porcentajeSalvacion = 0;
  } else if (pts >= safety) {
    porcentajeSalvacion = 95;
  } else {
    const gap = safety - pts;
    const maxGanables = Math.max(1, fechas * 3);
    porcentajeSalvacion = Math.max(5, Math.min(90, 100 - (gap / maxGanables) * 100));
  }

  let veredicto = '';
  if (puntosMaxPosibles < pts17) {
    veredicto = '🔴 Matemáticamente descendido';
  } else if (pts >= safety && pts > pts17) {
    veredicto = '✅ Salvación virtual';
  } else if (puntosParaAlcanzar17 > fechas * 3 * 0.6) {
    veredicto = '⚠️ Riesgo crítico';
  } else if (puntosParaAlcanzar17 > fechas) {
    veredicto = '🟠 Complicado pero posible';
  } else {
    veredicto = '🟡 Salvación en tus manos';
  }

  const salv = Number(porcentajeSalvacion.toFixed(1));
  const chart = {
    type: 'scale' as const,
    marker: salv,
    markerLabel: 'Prob. salvación: ' + salv + ' %',
    min: 0,
    unit: ' %',
    segments: [
      { nombre: 'Descenso probable', max: 25, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Riesgo alto', max: 50, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Peleado', max: 75, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Salvación probable', max: 100, color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala de probabilidad de salvación del descenso (0 a 100 %)',
  };

  // Zona de la escala según la prob. de salvación (mismos cortes que el _chart)
  let zona: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (salv <= 25) { zona = 'descenso probable'; tone = 'warn'; }
  else if (salv <= 50) { zona = 'riesgo alto'; tone = 'warn'; }
  else if (salv <= 75) { zona = 'peleado'; tone = 'neutral'; }
  else { zona = 'salvación probable'; tone = 'good'; }

  const insight = {
    title: 'Lectura de la pelea por la permanencia',
    text: puntosMaxPosibles < pts17
      ? `Con un máximo de **${puntosMaxPosibles} pts** posibles no alcanzás al 17º (**${pts17} pts**): descenso matemático.`
      : `Con **${pts} pts** estás a **${puntosParaAlcanzar17} ${puntosParaAlcanzar17 === 1 ? 'punto' : 'puntos'}** de superar al 17º y a **${diferenciaConSafety >= 0 ? '+' : ''}${diferenciaConSafety} del umbral de salvación** (${safety} pts). La escala te ubica en zona de **${zona}** (**${salv}%** de salvarte): te quedan ${fechas} ${fechas === 1 ? 'fecha' : 'fechas'} y ${puntosParaAlcanzar17} ${puntosParaAlcanzar17 === 1 ? 'punto' : 'puntos'} a sumar.`,
    tone,
    icon: '⚽',
  };

  return {
    puntosParaAlcanzar17,
    puntosMaxPosibles,
    puntosProyectadosEmpatando,
    diferenciaConSafety,
    porcentajeSalvacion: salv,
    veredicto,
    _chart: chart,
    _insight: insight,
  };
}
