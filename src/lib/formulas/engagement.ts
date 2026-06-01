/** Engagement rate de redes sociales */
export interface Inputs {
  seguidores: number;
  likes: number;
  comentarios: number;
  compartidos?: number;
  guardados?: number;
  impresiones?: number;
}
export interface Outputs {
  engagementPorFollowers: number;
  engagementPorImpresiones: number;
  totalInteracciones: number;
  tasaComentariosPorLike: number;
  mensaje: string;
  _chart?: any;
}

export function engagement(i: Inputs): Outputs {
  const followers = Number(i.seguidores);
  const likes = Number(i.likes) || 0;
  const comms = Number(i.comentarios) || 0;
  const shares = Number(i.compartidos) || 0;
  const saves = Number(i.guardados) || 0;
  const imps = Number(i.impresiones) || 0;
  if (!followers || followers <= 0) throw new Error('Ingresá los seguidores');

  const total = likes + comms + shares + saves;
  const erFollowers = (total / followers) * 100;
  const erImps = imps > 0 ? (total / imps) * 100 : 0;
  const ratioComm = likes > 0 ? (comms / likes) * 100 : 0;

  let msg = '';
  if (erFollowers > 6) msg = 'Engagement extraordinario — muy por encima de la media.';
  else if (erFollowers > 3) msg = 'Engagement muy bueno — por encima de la media del feed.';
  else if (erFollowers > 1) msg = 'Engagement en línea con el promedio Instagram 2026.';
  else msg = 'Engagement bajo — revisá contenido, horario y hashtags.';

  const erRounded = Number(erFollowers.toFixed(2));
  const chart = {
    type: 'scale' as const,
    marker: erRounded,
    markerLabel: 'Tu engagement: ' + erRounded + '%',
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Bajo', max: 1, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Promedio', max: 3, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Muy bueno', max: 6, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Extraordinario', max: Math.max(9, Math.ceil(erRounded) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de engagement rate sobre seguidores: bajo, promedio, muy bueno, extraordinario',
  };

  return {
    engagementPorFollowers: erRounded,
    engagementPorImpresiones: Number(erImps.toFixed(2)),
    totalInteracciones: total,
    tasaComentariosPorLike: Number(ratioComm.toFixed(2)),
    mensaje: msg,
    _chart: chart,
  };
}
