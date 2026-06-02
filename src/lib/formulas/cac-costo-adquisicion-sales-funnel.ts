/** CAC sales funnel */
export interface Inputs { gastoMarketing: number; salariosSales: number; visitantes: number; mqls: number; sqls: number; clientesNuevos: number; }
export interface Outputs { cacBlended: number; cacMarketing: number; costoMql: number; costoSql: number; conversionVisitCliente: number; _insight?: any; _chart?: any; }
export function cacCostoAdquisicionSalesFunnel(i: Inputs): Outputs {
  const mkt = Number(i.gastoMarketing);
  const sales = Number(i.salariosSales);
  const vis = Number(i.visitantes);
  const mqls = Number(i.mqls);
  const sqls = Number(i.sqls);
  const clientes = Number(i.clientesNuevos);
  if (clientes <= 0) throw new Error('Ingresá clientes nuevos > 0');
  const total = mkt + sales;
  const cacBlended = Math.round(total / clientes);
  const cacMkt = Math.round(mkt / clientes);
  const cacSales = Math.round(sales / clientes);
  const conv = vis > 0 ? Number(((clientes / vis) * 100).toFixed(3)) : 0;
  const pesoMkt = total > 0 ? (mkt / total) * 100 : 0;
  const insight = {
    title: 'Anatomía de tu CAC',
    text: `Cada cliente nuevo te cuesta **$${cacBlended.toLocaleString('es-AR')}** (CAC blended). De eso, **$${cacMkt.toLocaleString('es-AR')}** es marketing y **$${cacSales.toLocaleString('es-AR')}** es el equipo de ventas — el ${pesoMkt.toFixed(0)}% del costo viene de marketing.${conv > 0 ? ` Convertís **${conv}%** de tus visitantes en clientes.` : ''}`,
    tone: 'neutral',
    icon: '🎯',
  };
  const chart = {
    type: 'doughnut',
    slices: [
      { label: 'Marketing', value: cacMkt },
      { label: 'Ventas (salarios)', value: cacSales },
    ],
    prefix: '$',
    centerValue: '$' + cacBlended.toLocaleString('es-AR'),
    centerLabel: 'CAC blended',
    ariaLabel: 'Composición del costo de adquisición por cliente entre marketing y ventas',
  };
  return {
    cacBlended,
    cacMarketing: cacMkt,
    costoMql: mqls > 0 ? Math.round(mkt / mqls) : 0,
    costoSql: sqls > 0 ? Math.round(total / sqls) : 0,
    conversionVisitCliente: conv,
    _insight: insight,
    _chart: chart
  };
}
