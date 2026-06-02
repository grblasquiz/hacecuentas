/** ROI coaching 1 on 1 */
export interface Inputs { precioPaquete: number; sesionesPaquete: number; clientesMes: number; cacCliente: number; costoDelivery: number; }
export interface Outputs { revenueAnual: number; profitAnual: number; ltvCliente: number; horasAnuales: number; revenuePorHora: number; _insight?: any; _chart?: any; }
export function roiCoaching1On1Venta(i: Inputs): Outputs {
  const precio = Number(i.precioPaquete);
  const sesiones = Number(i.sesionesPaquete);
  const clientes = Number(i.clientesMes);
  const cac = Number(i.cacCliente);
  const del = Number(i.costoDelivery);
  if (precio < 0 || clientes < 0) throw new Error('Valores inválidos');
  const clientesAno = clientes * 12;
  const revenue = precio * clientesAno;
  const costos = (cac + del) * clientesAno;
  const profit = revenue - costos;
  const horas = sesiones * clientesAno;

  const revenueR = Math.round(revenue);
  const profitR = Math.round(profit);
  const revPorHora = horas > 0 ? Math.round(revenue / horas) : 0;
  const ltv = Math.round(precio - cac - del);
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Insight: margen anual y revenue por hora dicen si el modelo 1-a-1 escala
  let insTone: 'good' | 'warn' | 'neutral';
  let insText: string;
  const margenPct = revenue > 0 ? (profit / revenue) * 100 : 0;
  if (revenue <= 0) {
    insTone = 'neutral';
    insText = 'Cargá precio del paquete y clientes por mes para proyectar tu facturación anual de coaching y el margen que te queda.';
  } else if (profit < 0) {
    insTone = 'warn';
    insText = `Cuidado: con un costo de adquisición + delivery de **$${fmt.format(Math.round(cac + del))}** por cliente, cada venta pierde plata y el año cierra en **-$${fmt.format(Math.abs(profitR))}**. El precio no cubre tus costos por cliente.`;
  } else if (margenPct >= 60) {
    insTone = 'good';
    insText = `Modelo sólido: facturás **$${fmt.format(revenueR)}** al año con **$${fmt.format(profitR)}** de ganancia (margen del **${margenPct.toFixed(0)}%**) y cobrás **$${fmt.format(revPorHora)}/hora** de coaching.`;
  } else {
    insTone = 'warn';
    insText = `Facturás **$${fmt.format(revenueR)}** al año, pero el costo por cliente recorta el margen al **${margenPct.toFixed(0)}%** (**$${fmt.format(profitR)}** netos). Subí el precio o bajá el CAC para que las **${Math.round(horas)} horas** rindan más.`;
  }

  // Donut: la facturación anual se parte en ganancia y costo por cliente (solo si hay ganancia)
  let _chart: any = undefined;
  if (revenueR > 0 && profitR >= 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Ganancia', value: profitR },
        { label: 'Costo por cliente', value: Math.round(costos) },
      ],
      prefix: '$',
      centerValue: `$${fmt.format(revenueR)}`,
      centerLabel: 'Facturación anual',
      ariaLabel: `Facturación anual de $${fmt.format(revenueR)}: $${fmt.format(profitR)} de ganancia y $${fmt.format(Math.round(costos))} de costo de adquisición y delivery.`,
    };
  }

  return {
    revenueAnual: revenueR,
    profitAnual: profitR,
    ltvCliente: ltv,
    horasAnuales: Math.round(horas),
    revenuePorHora: revPorHora,
    _insight: {
      title: 'Rentabilidad de tu coaching 1-a-1',
      text: insText,
      tone: insTone,
      icon: '🧑‍🏫',
    },
    _chart,
  };
}
