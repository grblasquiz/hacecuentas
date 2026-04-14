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

  return {
    engagementPorFollowers: Number(erFollowers.toFixed(2)),
    engagementPorImpresiones: Number(erImps.toFixed(2)),
    totalInteracciones: total,
    tasaComentariosPorLike: Number(ratioComm.toFixed(2)),
    mensaje: msg,
  };
}
