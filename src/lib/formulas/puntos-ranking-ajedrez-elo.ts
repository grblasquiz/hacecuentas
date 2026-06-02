/** Variación de puntos ELO en ajedrez */
export interface Inputs {
  eloJugador: number;
  eloRival: number;
  resultado: string;
  factorK: string;
}

export interface Outputs {
  result: number;
  nuevoElo: number;
  esperado: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function puntosRankingAjedrezElo(i: Inputs): Outputs {
  const elo = Number(i.eloJugador);
  const eloR = Number(i.eloRival);
  const res = Number(i.resultado);
  const k = Number(i.factorK) || 20;

  if (!elo || elo <= 0) throw new Error('Ingresá tu rating ELO');
  if (!eloR || eloR <= 0) throw new Error('Ingresá el rating ELO del rival');
  if (isNaN(res) || (res !== 0 && res !== 0.5 && res !== 1)) throw new Error('Seleccioná un resultado válido');

  const esperado = 1 / (1 + Math.pow(10, (eloR - elo) / 400));
  const variacion = k * (res - esperado);
  const nuevoElo = elo + variacion;

  const resTexto = res === 1 ? 'ganaste' : res === 0.5 ? 'empataste' : 'perdiste';
  const signo = variacion >= 0 ? '+' : '';

  const esperadoPct = esperado * 100;
  const favorito = elo > eloR;
  const subio = variacion >= 0;
  let insightText: string;
  if (res === 1) {
    insightText = favorito
      ? `Ganaste como favorito (probabilidad **${esperadoPct.toFixed(0)}%**): sumás solo **+${variacion.toFixed(1)}** porque el sistema ya esperaba tu victoria.`
      : `Ganaste contra un rival más fuerte (solo **${esperadoPct.toFixed(0)}%** esperado): el upset te premia con **+${variacion.toFixed(1)} puntos**.`;
  } else if (res === 0.5) {
    insightText = favorito
      ? `Empatar contra alguien más débil te cuesta **${variacion.toFixed(1)} puntos**: el empate vale menos que tu probabilidad esperada de **${esperadoPct.toFixed(0)}%**.`
      : `Empate contra un rival más fuerte: sumás **+${variacion.toFixed(1)}** porque rendiste por encima de tu **${esperadoPct.toFixed(0)}%** esperado.`;
  } else {
    insightText = favorito
      ? `Perder como favorito (esperabas **${esperadoPct.toFixed(0)}%** de chances) duele: caés **${variacion.toFixed(1)} puntos** a un ELO de **${Math.round(nuevoElo)}**.`
      : `Perdiste contra un rival más fuerte: el golpe es leve, **${variacion.toFixed(1)} puntos**, porque solo tenías **${esperadoPct.toFixed(0)}%** de chances.`;
  }

  const insight = {
    title: subio ? `Subís a ${Math.round(nuevoElo)} de ELO` : `Bajás a ${Math.round(nuevoElo)} de ELO`,
    text: insightText,
    tone: subio ? 'good' : 'warn',
    icon: '♟️',
  };

  const chart = {
    type: 'scale' as const,
    marker: Number(esperadoPct.toFixed(1)),
    markerLabel: 'Tu chance: ' + esperadoPct.toFixed(0) + '%',
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Desfavorecido', max: 40, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Parejo', max: 60, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Favorito', max: 100, color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala de probabilidad de victoria esperada según la diferencia de ELO, de desfavorecido a favorito.',
  };

  return {
    result: Number(variacion.toFixed(1)),
    nuevoElo: Math.round(nuevoElo),
    esperado: Number(esperado.toFixed(4)),
    detalle: `Con ELO **${elo}** vs **${eloR}** (${resTexto}), variación: **${signo}${variacion.toFixed(1)} puntos**. Nuevo ELO: **${Math.round(nuevoElo)}**. Resultado esperado: ${(esperado * 100).toFixed(1)}%.`,
    _insight: insight,
    _chart: chart,
  };
}
