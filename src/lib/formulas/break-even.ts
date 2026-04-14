/** Punto de equilibrio (break-even) */
export interface Inputs {
  costosFijos: number;
  precioUnitario: number;
  costoVariableUnitario: number;
}
export interface Outputs {
  unidadesBreakEven: number;
  ventasBreakEven: number;
  margenContribucionUnitario: number;
  margenContribucionPorcentual: number;
  mensaje: string;
}

export function breakEven(i: Inputs): Outputs {
  const cf = Number(i.costosFijos);
  const pu = Number(i.precioUnitario);
  const cv = Number(i.costoVariableUnitario);
  if (!cf || cf <= 0) throw new Error('Ingresá los costos fijos');
  if (!pu || pu <= 0) throw new Error('Ingresá el precio unitario');
  if (cv < 0) throw new Error('Costo variable inválido');

  const margenUnitario = pu - cv;
  if (margenUnitario <= 0) throw new Error('El precio debe ser mayor al costo variable para poder equilibrar');

  const unidades = cf / margenUnitario;
  const ventas = unidades * pu;
  const pctMargen = (margenUnitario / pu) * 100;

  return {
    unidadesBreakEven: Math.ceil(unidades),
    ventasBreakEven: Math.round(ventas),
    margenContribucionUnitario: Math.round(margenUnitario),
    margenContribucionPorcentual: Number(pctMargen.toFixed(2)),
    mensaje: `Necesitás vender ${Math.ceil(unidades)} unidades (o facturar $${Math.round(ventas).toLocaleString('es-AR')}) para cubrir costos fijos. A partir de ahí, cada venta agrega $${Math.round(margenUnitario).toLocaleString('es-AR')} de ganancia.`,
  };
}
