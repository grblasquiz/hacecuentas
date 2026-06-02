/** ROI Amazon PPC */
export interface Inputs { adSpend: number; ventasAttributed: number; ventasTotales: number; costoProductoPct: number; }
export interface Outputs { acos: number; tacos: number; roas: number; breakevenAcos: number; profitNeto: number; _insight?: any; _chart?: any; }
export function roiAdSpendAmazonPpc(i: Inputs): Outputs {
  const spend = Number(i.adSpend);
  const ventasAd = Number(i.ventasAttributed);
  const ventasTot = Number(i.ventasTotales);
  const costoPct = Number(i.costoProductoPct) / 100;
  if (spend < 0 || ventasAd < 0 || ventasTot < 0) throw new Error('Valores inválidos');
  const acos = ventasAd > 0 ? (spend / ventasAd) * 100 : 0;
  const tacos = ventasTot > 0 ? (spend / ventasTot) * 100 : 0;
  const roas = spend > 0 ? ventasAd / spend : 0;
  const breakeven = (1 - costoPct) * 100;
  const margenBruto = ventasAd * (1 - costoPct);
  const profit = margenBruto - spend;

  const acosR = Number(acos.toFixed(2));
  const beR = Number(breakeven.toFixed(2));
  const profitR = Math.round(profit);
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Insight: ACoS vs break-even decide rentabilidad de la campaña
  let insTone: 'good' | 'warn' | 'neutral';
  let insText: string;
  if (ventasAd <= 0) {
    insTone = 'neutral';
    insText = `Todavía no hay ventas atribuidas a los anuncios, así que el ACoS no se puede calcular. Tu ACoS de equilibrio es **${beR}%**: por debajo de ese número la campaña deja ganancia.`;
  } else if (acosR < beR) {
    insTone = 'good';
    insText = `Con un ACoS de **${acosR}%** frente a tu equilibrio de **${beR}%**, la campaña es rentable y deja **$${fmt.format(profitR)}** de ganancia neta. Tenés margen para escalar la inversión.`;
  } else if (acosR <= beR * 1.1) {
    insTone = 'warn';
    insText = `Tu ACoS de **${acosR}%** está al borde del equilibrio (**${beR}%**): la campaña apenas se sostiene (**$${fmt.format(profitR)}** netos). Ajustá pujas o palabras clave antes de subir el presupuesto.`;
  } else {
    insTone = 'warn';
    insText = `El ACoS de **${acosR}%** supera tu equilibrio de **${beR}%**: estás pagando más en ads de lo que deja el margen y perdés **$${fmt.format(profitR)}**. Pausá los términos caros o revisá el precio del producto.`;
  }

  // Gauge: ACoS contra zonas relativas al break-even
  let _chart: any = undefined;
  if (ventasAd > 0 && beR > 0) {
    const segMax = Math.max(beR * 1.5, acosR * 1.1);
    _chart = {
      type: 'scale',
      marker: acosR,
      markerLabel: `ACoS ${acosR}%`,
      min: 0,
      segments: [
        { nombre: 'Rentable', max: Number((beR * 0.85).toFixed(2)), color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Equilibrio', max: beR, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Pérdida', max: Number(segMax.toFixed(2)), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `ACoS de ${acosR}% sobre un punto de equilibrio de ${beR}%.`,
    };
  }

  return {
    acos: acosR,
    tacos: Number(tacos.toFixed(2)),
    roas: Number(roas.toFixed(2)),
    breakevenAcos: beR,
    profitNeto: profitR,
    _insight: {
      title: 'Rentabilidad de tu campaña PPC',
      text: insText,
      tone: insTone,
      icon: '📦',
    },
    _chart,
  };
}
