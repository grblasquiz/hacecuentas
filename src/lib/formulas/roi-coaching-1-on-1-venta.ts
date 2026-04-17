/** ROI coaching 1 on 1 */
export interface Inputs { precioPaquete: number; sesionesPaquete: number; clientesMes: number; cacCliente: number; costoDelivery: number; }
export interface Outputs { revenueAnual: number; profitAnual: number; ltvCliente: number; horasAnuales: number; revenuePorHora: number; }
export function roiCoaching1On1Venta(i: Inputs): Outputs {
  const precio = Number(i.precioPaquete);
  const sesiones = Number(i.sesionesPaquete);
  const clientes = Number(i.clientesMes);
  const cac = Number(i.cacCliente);
  const del = Number(i.costoDelivery);
  if (precio < 0 || clientes < 0) throw new Error('Valores inválidos');
  const clientesAno = clientes * 12;
  const revenue = precio * clientesAno;
  const profit = revenue - (cac + del) * clientesAno;
  const horas = sesiones * clientesAno;
  return {
    revenueAnual: Math.round(revenue),
    profitAnual: Math.round(profit),
    ltvCliente: Math.round(precio - cac - del),
    horasAnuales: Math.round(horas),
    revenuePorHora: horas > 0 ? Math.round(revenue / horas) : 0
  };
}
