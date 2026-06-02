/** Precio ebook Kindle KDP */
export interface Inputs { precioLista: number; tamanoArchivo: number; royaltyTier: string; copiasMes: number; }
export interface Outputs { royaltyPorCopia: number; ingresoMensual: number; ingresoAnual: number; tierAplicado: string; deliveryCost: number; _insight?: any; _chart?: any; }
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

  const royaltyR = Number(royalty.toFixed(2));
  const deliveryR = Number(delivery.toFixed(2));
  const amazonCut = Number((precio - royalty - delivery).toFixed(2));
  const fmt = (n: number) => 'USD ' + n.toFixed(2);
  const tone = applied === '70%' ? 'good' : 'warn';
  const insightText = applied === '70%'
    ? `A **${fmt(precio)}** entrás al tier del **70%**: te quedan **${fmt(royaltyR)}** por copia (Amazon descuenta **${fmt(deliveryR)}** de delivery por el archivo de ${tam}MB). Con ${copias} ventas/mes eso es **${fmt(mensual)}/mes**.`
    : `A **${fmt(precio)}** aplica el tier del **35%**: ganás **${fmt(royaltyR)}** por copia. Si pudieras fijar el precio entre USD 2,99 y 9,99 accederías al 70% y casi duplicarías tu regalía por venta.`;
  return {
    royaltyPorCopia: royaltyR,
    ingresoMensual: Number(mensual.toFixed(2)),
    ingresoAnual: Number((mensual * 12).toFixed(2)),
    tierAplicado: applied,
    deliveryCost: deliveryR,
    _insight: {
      title: `Regalía por copia (tier ${applied})`,
      text: insightText,
      tone,
      icon: '📚',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Tu regalía', value: royaltyR },
        ...(deliveryR > 0 ? [{ label: 'Delivery', value: deliveryR }] : []),
        { label: 'Comisión Amazon', value: amazonCut },
      ],
      prefix: 'USD ',
      centerValue: fmt(precio),
      centerLabel: 'Precio de lista',
      ariaLabel: `De ${fmt(precio)} de precio, vos cobrás ${fmt(royaltyR)} y Amazon retiene ${fmt(amazonCut)}${deliveryR > 0 ? ` más ${fmt(deliveryR)} de delivery` : ''}.`,
    },
  };
}
