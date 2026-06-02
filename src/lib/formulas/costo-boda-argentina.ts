/** Costo estimado de boda en Argentina */
export interface Inputs { invitados: number; nivel?: string; musica?: string; }
export interface Outputs { totalEstimado: number; costoPorInvitado: number; desglose: string; mensaje: string; _insight?: any; _chart?: any; }

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

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  const pctSalon = total > 0 ? Math.round((salon / total) * 100) : 0;
  const _insight = {
    title: 'El salón manda en el presupuesto',
    text:
      `**Salón + catering** se lleva el **${pctSalon}%** del total ($${fmt(salon)}), y crece con cada invitado: ` +
      `sumás unos **$${fmt(cpp)}** por cada persona que invitás. ` +
      `Recortar la lista es la palanca más rápida para bajar los $${fmt(total)} totales.`,
    tone: 'neutral' as const,
    icon: '💍',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salón + catering', value: salon },
      { label: `Música (${musica})`, value: musicaCosto },
      { label: 'Foto + video', value: fotoVideo },
      { label: 'Decoración', value: decoracion },
      { label: 'Torta + mesa dulce', value: torta },
      { label: 'Varios', value: varios },
    ],
    prefix: '$',
    centerValue: `$${fmt(total)}`,
    centerLabel: 'Total boda',
    ariaLabel: `Reparto del costo total de la boda de $${fmt(total)} entre salón y catering, música, foto y video, decoración, torta y varios`,
  };

  return { totalEstimado: total, costoPorInvitado: porInv, desglose, mensaje: msg, _insight, _chart };
}
