/** Costo estimado de boda en Argentina */
export interface Inputs { invitados: number; nivel?: string; musica?: string; }
export interface Outputs { totalEstimado: number; costoPorInvitado: number; desglose: string; mensaje: string; }

export function costoBodaArgentina(i: Inputs): Outputs {
  const inv = Math.round(Number(i.invitados));
  const nivel = String(i.nivel || 'medio');
  const musica = String(i.musica || 'dj');
  if (!inv || inv < 20) throw new Error('Ingresá la cantidad de invitados (mínimo 20)');

  // Costo por persona según nivel (ARS abril 2026)
  const costoPP: Record<string, number> = { basico: 60000, medio: 95000, premium: 160000 };
  const cpp = costoPP[nivel] || costoPP.medio;

  // Salón + catering
  const salon = inv * cpp;

  // Música
  const musicaCostos: Record<string, number> = { dj: 600000, banda: 1200000, ambos: 1700000 };
  const musicaCosto = musicaCostos[musica] || musicaCostos.dj;

  // Otros rubros
  const fotoVideo = nivel === 'premium' ? 1200000 : nivel === 'basico' ? 400000 : 800000;
  const decoracion = nivel === 'premium' ? 1000000 : nivel === 'basico' ? 200000 : 500000;
  const torta = nivel === 'premium' ? 500000 : nivel === 'basico' ? 150000 : 300000;
  const varios = nivel === 'premium' ? 800000 : nivel === 'basico' ? 200000 : 400000;

  const total = salon + musicaCosto + fotoVideo + decoracion + torta + varios;
  const porInv = Math.round(total / inv);

  const desglose = [
    `Salón + catering: $${salon.toLocaleString('es-AR')}`,
    `Música (${musica}): $${musicaCosto.toLocaleString('es-AR')}`,
    `Foto + video: $${fotoVideo.toLocaleString('es-AR')}`,
    `Decoración: $${decoracion.toLocaleString('es-AR')}`,
    `Torta + mesa dulce: $${torta.toLocaleString('es-AR')}`,
    `Varios (civil, invitaciones, souvenir): $${varios.toLocaleString('es-AR')}`
  ].join('\n');

  const msg = `Boda nivel ${nivel} para ${inv} invitados: ~$${total.toLocaleString('es-AR')} ARS. Costo por invitado: ~$${porInv.toLocaleString('es-AR')}.`;

  return { totalEstimado: total, costoPorInvitado: porInv, desglose, mensaje: msg };
}
