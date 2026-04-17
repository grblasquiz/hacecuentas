/** Instagram Pago por Historia */
export interface Inputs { seguidores: number; engagementRate: number; conLink: string; cantidadStories: number; }
export interface Outputs { precioUnitario: string; precioTotal: string; reachEstimado: string; cpmEquivalente: string; }

export function instagramInfluencerPagoHistoria(i: Inputs): Outputs {
  const seg = Number(i.seguidores);
  const er = Number(i.engagementRate);
  const link = String(i.conLink) === 'Sí';
  const cant = Number(i.cantidadStories);
  if (seg <= 0 || er <= 0 || cant <= 0) throw new Error('Ingresá valores válidos');
  const post = (seg / 1000) * 10;
  let storyBase = post * 0.4;
  let adj = 1;
  if (er < 2) adj = 0.8;
  else if (er < 4) adj = 1;
  else if (er < 6) adj = 1.2;
  else adj = 1.5;
  storyBase *= adj;
  if (link) storyBase *= 1.4;
  let descuento = 1;
  if (cant >= 7) descuento = 0.7;
  else if (cant >= 4) descuento = 0.78;
  else if (cant >= 2) descuento = 0.87;
  const total = storyBase * cant * descuento;
  const reach = Math.round(seg * 0.1 * cant);
  const cpm = reach > 0 ? (total / reach) * 1000 : 0;
  const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')} USD`;
  return {
    precioUnitario: fmt(storyBase),
    precioTotal: fmt(total),
    reachEstimado: `${reach.toLocaleString('es-AR')} impresiones`,
    cpmEquivalente: `$${cpm.toFixed(2)} USD CPM`,
  };
}
