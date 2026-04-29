export interface Inputs {
  sale_price: number;
  publication_type: string;
  category: string;
  shipping_type: string;
  shipping_cost: number;
  apply_iva: string;
}

export interface Outputs {
  commission_percent: number;
  commission_amount: number;
  shipping_final: number;
  iva_amount: number;
  total_costs: number;
  net_proceeds: number;
  effective_rate: number;
}

export function compute(i: Inputs): Outputs {
  const salePrice = Number(i.sale_price) || 0;
  
  if (salePrice <= 0) {
    return {
      commission_percent: 0,
      commission_amount: 0,
      shipping_final: 0,
      iva_amount: 0,
      total_costs: 0,
      net_proceeds: 0,
      effective_rate: 0
    };
  }

  // Comisión según tipo de publicación (2026)
  let commissionRate = 0.13; // clásica por defecto
  if (i.publication_type === "gratuita") {
    commissionRate = 0.0;
  } else if (i.publication_type === "premium") {
    commissionRate = 0.17;
  } else if (i.publication_type === "clasica") {
    commissionRate = 0.13;
  }

  // Ajustes por categoría (variaciones conocidas 2026)
  if (i.category === "autos") {
    commissionRate = 0.15;
  } else if (i.category === "inmuebles") {
    commissionRate = 0.05;
  } else if (i.category === "libros") {
    if (i.publication_type === "gratuita") {
      commissionRate = 0.0;
    } else {
      commissionRate = 0.10;
    }
  } else if (i.category === "servicios") {
    commissionRate = 0.15;
  }

  const commissionAmount = salePrice * commissionRate;

  // IVA sobre comisión (21%)
  const ivaAmount = i.apply_iva === "si" ? commissionAmount * 0.21 : 0;

  // Costo de envío
  const shippingFinal = i.shipping_type === "si" ? (Number(i.shipping_cost) || 0) : 0;

  // Costo total
  const totalCosts = commissionAmount + ivaAmount + shippingFinal;

  // Monto neto
  const netProceeds = salePrice - totalCosts;

  // Tasa real cobrada
  const effectiveRate = salePrice > 0 ? (totalCosts / salePrice) * 100 : 0;

  return {
    commission_percent: commissionRate * 100,
    commission_amount: Math.round(commissionAmount * 100) / 100,
    shipping_final: Math.round(shippingFinal * 100) / 100,
    iva_amount: Math.round(ivaAmount * 100) / 100,
    total_costs: Math.round(totalCosts * 100) / 100,
    net_proceeds: Math.round(netProceeds * 100) / 100,
    effective_rate: Math.round(effectiveRate * 100) / 100
  };
}
