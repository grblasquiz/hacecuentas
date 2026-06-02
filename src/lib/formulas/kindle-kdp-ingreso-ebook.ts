/** Kindle KDP Ebook */
export interface Inputs { precio: number; tamanoArchivo: number; ventasMensuales: number; }
export interface Outputs { tierRoyalty: string; royaltyPorVenta: string; ingresoMensual: string; ingresoAnual: string; _insight?: any; _chart?: any; }

export function kindleKdpIngresoEbook(i: Inputs): Outputs {
  const p = Number(i.precio);
  const mb = Number(i.tamanoArchivo);
  const v = Number(i.ventasMensuales) || 0;
  if (p <= 0 || mb <= 0) throw new Error('Valores inválidos');
  let tier = '', royalty = 0, deliveryFee = 0;
  const es70 = p >= 2.99 && p <= 9.99;
  if (es70) {
    tier = 'Tier 70% (con delivery fee)';
    deliveryFee = mb * 0.15;
    royalty = (p - deliveryFee) * 0.70;
  } else {
    tier = 'Tier 35% (precio fuera del rango 70%)';
    royalty = p * 0.35;
  }
  const amazonShare = p - royalty - deliveryFee;
  const mensual = royalty * v;
  const anual = mensual * 12;
  const insightText = es70
    ? `A US$ ${p.toFixed(2)} entrás al **tier del 70%** y te quedan **US$ ${royalty.toFixed(2)}** por venta (Amazon descuenta US$ ${deliveryFee.toFixed(2)} de delivery por los ${mb} MB). Con ${v} ventas/mes, son **US$ ${mensual.toFixed(2)}/mes**.`
    : `A US$ ${p.toFixed(2)} caés en el **tier del 35%**: cobrás solo **US$ ${royalty.toFixed(2)}** por venta. Subir el precio al rango US$ 2,99–9,99 te daría el doble de regalía por copia.`;
  const slices = [
    { label: 'Tu regalía', value: Number(royalty.toFixed(2)) },
    { label: 'Comisión Amazon', value: Number(amazonShare.toFixed(2)) },
  ];
  if (deliveryFee > 0) slices.push({ label: 'Delivery fee', value: Number(deliveryFee.toFixed(2)) });
  return {
    tierRoyalty: tier,
    royaltyPorVenta: `$${royalty.toFixed(2)} USD por venta`,
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anual.toFixed(2)} USD/año`,
    _insight: {
      title: es70 ? 'Estás en el mejor tier' : 'Tier del 35%',
      text: insightText,
      tone: es70 ? 'good' : 'warn',
      icon: '📚',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: `$${p.toFixed(2)}`,
      centerLabel: 'Precio de venta',
      ariaLabel: `Reparto del precio de US$ ${p.toFixed(2)}: tu regalía, comisión de Amazon${deliveryFee > 0 ? ' y delivery fee' : ''}`,
    },
  };
}
