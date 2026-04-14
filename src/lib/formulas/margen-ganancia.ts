/** Margen de ganancia: sobre costo vs sobre venta */
export interface Inputs { costo: number; precioVenta: number; }
export interface Outputs {
  gananciaBruta: number;
  margenSobreCosto: number;
  margenSobreVenta: number;
  markup: number;
}

export function margenGanancia(i: Inputs): Outputs {
  const costo = Number(i.costo);
  const venta = Number(i.precioVenta);
  if (!costo || costo <= 0) throw new Error('Ingresá el costo');
  if (!venta || venta <= 0) throw new Error('Ingresá el precio de venta');
  const ganancia = venta - costo;
  const sobreCosto = (ganancia / costo) * 100;
  const sobreVenta = (ganancia / venta) * 100;
  return {
    gananciaBruta: Math.round(ganancia),
    margenSobreCosto: Number(sobreCosto.toFixed(2)),
    margenSobreVenta: Number(sobreVenta.toFixed(2)),
    markup: Number(sobreCosto.toFixed(2)),
  };
}
