/** Score TOEFL para tu Meta */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
  comentario: string;
  guia: string;
  _chart?: any;
  _insight?: any;
}

export function scoreToeflMeta(i: Inputs): Outputs {
  const total = Number(i.scoreTotal) || 100;
  const debil = String(i.seccionDebil || 'ninguna');
  if (total < 40 || total > 120) throw new Error('Score entre 40-120');

  const prom = total / 4;
  let R = prom, L = prom, S = prom, W = prom;

  if (debil !== 'ninguna') {
    const delta = 3;
    if (debil === 'reading') { R -= delta; L += delta/3; S += delta/3; W += delta/3; }
    if (debil === 'listening') { L -= delta; R += delta/3; S += delta/3; W += delta/3; }
    if (debil === 'speaking') { S -= delta; R += delta/3; L += delta/3; W += delta/3; }
    if (debil === 'writing') { W -= delta; R += delta/3; L += delta/3; S += delta/3; }
  }

  R = Math.min(30, Math.max(0, Math.round(R)));
  L = Math.min(30, Math.max(0, Math.round(L)));
  S = Math.min(30, Math.max(0, Math.round(S)));
  W = Math.min(30, Math.max(0, Math.round(W)));

  const suma = R + L + S + W;
  let nivel = '', guia = '';
  if (total >= 110) { nivel = 'top universidades'; guia = 'Nivel top universidades. 6-10 meses de prep desde C1.'; }
  else if (total >= 100) { nivel = 'top 50'; guia = 'Nivel universidad top 50. 4-6 meses desde B2 sólido.'; }
  else if (total >= 80) { nivel = 'state university'; guia = 'Nivel state university. 2-4 meses desde B2.'; }
  else { nivel = 'community college'; guia = 'Nivel community college o intermedio. 1-3 meses desde B1-B2.'; }

  const seccionNombre: Record<string, string> = {
    reading: 'Reading', listening: 'Listening', speaking: 'Speaking', writing: 'Writing',
  };
  const insightText = debil !== 'ninguna' && seccionNombre[debil]
    ? `Para un total de **${total}/120** (${nivel}), tu plan baja un poco **${seccionNombre[debil]}** y reparte el resto entre las otras tres secciones. ${guia}`
    : `Un total de **${total}/120** te ubica en nivel **${nivel}**, con unos **${prom.toFixed(0)}/30** por sección. ${guia}`;

  const chart = {
    type: 'scale' as const,
    marker: total,
    markerLabel: 'Tu meta: ' + total,
    min: 40,
    unit: '',
    segments: [
      { nombre: 'Community college', max: 80, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'State university', max: 100, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Top 50', max: 110, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Top universidades', max: Math.max(120, Math.ceil(total)), color: '#bfdbfe', colorDark: '#1e40af' },
    ],
    ariaLabel: 'Escala de puntaje TOEFL por nivel de universidad: community college, state university, top 50 y top universidades.',
  };

  return {
    reading: R, listening: L, speaking: S, writing: W,
    comentario: `Total ~${suma} · ${nivel}`,
    guia,
    _chart: chart,
    _insight: {
      title: 'Qué nivel abre tu puntaje',
      text: insightText,
      tone: 'neutral',
      icon: '🎓',
    },
  };

}
