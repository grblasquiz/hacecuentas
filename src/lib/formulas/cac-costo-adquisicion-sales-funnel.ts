/** CAC sales funnel */
export interface Inputs { gastoMarketing: number; salariosSales: number; visitantes: number; mqls: number; sqls: number; clientesNuevos: number; }
export interface Outputs { cacBlended: number; cacMarketing: number; costoMql: number; costoSql: number; conversionVisitCliente: number; }
export function cacCostoAdquisicionSalesFunnel(i: Inputs): Outputs {
  const mkt = Number(i.gastoMarketing);
  const sales = Number(i.salariosSales);
  const vis = Number(i.visitantes);
  const mqls = Number(i.mqls);
  const sqls = Number(i.sqls);
  const clientes = Number(i.clientesNuevos);
  if (clientes <= 0) throw new Error('Ingresá clientes nuevos > 0');
  const total = mkt + sales;
  return {
    cacBlended: Math.round(total / clientes),
    cacMarketing: Math.round(mkt / clientes),
    costoMql: mqls > 0 ? Math.round(mkt / mqls) : 0,
    costoSql: sqls > 0 ? Math.round(total / sqls) : 0,
    conversionVisitCliente: vis > 0 ? Number(((clientes / vis) * 100).toFixed(3)) : 0
  };
}
