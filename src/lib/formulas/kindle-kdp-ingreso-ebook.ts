/** Kindle KDP Ebook */
export interface Inputs { precio: number; tamanoArchivo: number; ventasMensuales: number; }
export interface Outputs { tierRoyalty: string; royaltyPorVenta: string; ingresoMensual: string; ingresoAnual: string; }

export function kindleKdpIngresoEbook(i: Inputs): Outputs {
  const p = Number(i.precio);
  const mb = Number(i.tamanoArchivo);
  const v = Number(i.ventasMensuales) || 0;
  if (p <= 0 || mb <= 0) throw new Error('Valores inválidos');
  let tier = '', royalty = 0;
  if (p >= 2.99 && p <= 9.99) {
    tier = 'Tier 70% (con delivery fee)';
    const deliveryFee = mb * 0.15;
    royalty = (p - deliveryFee) * 0.70;
  } else {
    tier = 'Tier 35% (precio fuera del rango 70%)';
    royalty = p * 0.35;
  }
  const mensual = royalty * v;
  const anual = mensual * 12;
  return {
    tierRoyalty: tier,
    royaltyPorVenta: `$${royalty.toFixed(2)} USD por venta`,
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anual.toFixed(2)} USD/año`,
  };
}
