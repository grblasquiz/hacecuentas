/** Precio ebook Kindle KDP */
export interface Inputs { precioLista: number; tamanoArchivo: number; royaltyTier: string; copiasMes: number; }
export interface Outputs { royaltyPorCopia: number; ingresoMensual: number; ingresoAnual: number; tierAplicado: string; deliveryCost: number; }
export function precioEbookKindleKdp(i: Inputs): Outputs {
  const precio = Number(i.precioLista);
  const tam = Number(i.tamanoArchivo);
  const tier = String(i.royaltyTier || 'auto');
  const copias = Number(i.copiasMes);
  if (precio < 0.99) throw new Error('Precio mínimo USD 0.99');
  let applied = '35%';
  let royaltyPct = 0.35;
  let delivery = 0;
  if (tier === '70' || (tier === 'auto' && precio >= 2.99 && precio <= 9.99)) {
    applied = '70%';
    royaltyPct = 0.70;
    delivery = tam * 0.15;
  }
  const royalty = (precio - delivery) * royaltyPct;
  const mensual = royalty * copias;
  return {
    royaltyPorCopia: Number(royalty.toFixed(2)),
    ingresoMensual: Number(mensual.toFixed(2)),
    ingresoAnual: Number((mensual * 12).toFixed(2)),
    tierAplicado: applied,
    deliveryCost: Number(delivery.toFixed(2))
  };
}
