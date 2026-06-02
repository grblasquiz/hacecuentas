/** Score de Wells para Trombosis Venosa Profunda (TVP) */
export interface Inputs {
  cancerActivo: string;
  paralisis: string;
  reposoReciente: string;
  dolorLocalizado: string;
  edemaCompleto: string;
  pantorrilla3cm: string;
  edemaFovea: string;
  venasColaterales: string;
  tvpPrevia: string;
  diagnosticoAlternativo: string;
}
export interface Outputs {
  puntaje: number;
  probabilidad: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function scoreWellsTrombosisVenosa(i: Inputs): Outputs {
  const puntaje =
    Number(i.cancerActivo || 0) +
    Number(i.paralisis || 0) +
    Number(i.reposoReciente || 0) +
    Number(i.dolorLocalizado || 0) +
    Number(i.edemaCompleto || 0) +
    Number(i.pantorrilla3cm || 0) +
    Number(i.edemaFovea || 0) +
    Number(i.venasColaterales || 0) +
    Number(i.tvpPrevia || 0) +
    Number(i.diagnosticoAlternativo || 0);

  let probabilidad: string;
  let conducta: string;

  if (puntaje <= 0) {
    probabilidad = 'Baja (3-5%)';
    conducta = 'Solicitar dímero D. Si negativo → descarta TVP. Si positivo → ecografía doppler.';
  } else if (puntaje <= 2) {
    probabilidad = 'Moderada (~17%)';
    conducta = 'Solicitar dímero D. Si negativo → descarta TVP. Si positivo → ecografía doppler.';
  } else {
    probabilidad = 'Alta (53-75%)';
    conducta = 'Solicitar ecografía doppler venosa directamente (el dímero D no aporta en probabilidad alta).';
  }

  const criteriosPositivos: string[] = [];
  if (Number(i.cancerActivo)) criteriosPositivos.push('cáncer activo');
  if (Number(i.paralisis)) criteriosPositivos.push('parálisis/inmovilización');
  if (Number(i.reposoReciente)) criteriosPositivos.push('reposo/cirugía reciente');
  if (Number(i.dolorLocalizado)) criteriosPositivos.push('dolor venoso');
  if (Number(i.edemaCompleto)) criteriosPositivos.push('edema completo');
  if (Number(i.pantorrilla3cm)) criteriosPositivos.push('pantorrilla >3cm');
  if (Number(i.edemaFovea)) criteriosPositivos.push('edema fóvea');
  if (Number(i.venasColaterales)) criteriosPositivos.push('venas colaterales');
  if (Number(i.tvpPrevia)) criteriosPositivos.push('TVP previa');
  if (Number(i.diagnosticoAlternativo)) criteriosPositivos.push('dx alternativo (−2)');

  const detalle =
    `Score Wells TVP: ${puntaje} | ` +
    `Probabilidad: ${probabilidad} | ` +
    `Criterios: ${criteriosPositivos.length > 0 ? criteriosPositivos.join(', ') : 'ninguno'} | ` +
    `Conducta: ${conducta}`;

  // --- Insight narrativo dinámico según franja de probabilidad ---
  let tone: 'good' | 'warn' | 'neutral';
  let icon: string;
  let insightText: string;
  if (puntaje <= 0) {
    tone = 'neutral';
    icon = '🩺';
    insightText = `Con un score de **${puntaje}** la probabilidad de TVP es **baja (3-5%)**. El siguiente paso es el **dímero D**: si da negativo, descarta la trombosis sin necesidad de ecografía.`;
  } else if (puntaje <= 2) {
    tone = 'warn';
    icon = '🩺';
    insightText = `Un score de **${puntaje}** ubica al paciente en probabilidad **moderada (~17%)**. Pedí **dímero D**: negativo descarta TVP, positivo obliga a **ecografía doppler**.`;
  } else {
    tone = 'warn';
    icon = '🚨';
    insightText = `Score **${puntaje}**: probabilidad **alta (53-75%)**. Saltá directo a la **ecografía doppler venosa** — a esta altura el dímero D no aporta y demora el diagnóstico.`;
  }

  const insight = {
    title: 'Qué significa tu score',
    text: insightText,
    tone,
    icon,
  };

  // --- Gauge: el score Wells cae en franjas de probabilidad pretest ---
  // Rango teórico del score: -2 (solo dx alternativo) a +9 (todos los criterios).
  const chart = {
    type: 'scale' as const,
    marker: puntaje,
    markerLabel: `Score ${puntaje}`,
    min: Math.min(-2, puntaje),
    unit: '',
    segments: [
      { nombre: 'Baja (≤0)', max: 0, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Moderada (1-2)', max: 2, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Alta (≥3)', max: Math.max(9, puntaje + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala del score de Wells para TVP: probabilidad baja, moderada y alta según el puntaje.',
  };

  return {
    puntaje,
    probabilidad: `${probabilidad}. ${conducta}`,
    detalle,
    _insight: insight,
    _chart: chart,
  };
}
