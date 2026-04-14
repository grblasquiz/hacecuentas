/** Rotación de inventario y días de stock */
export interface Inputs { costoMercaderiaVendida: number; inventarioPromedio: number; }
export interface Outputs {
  rotacion: number;
  diasEnStock: number;
  clasificacion: string;
}

export function rotacionInventario(i: Inputs): Outputs {
  const cmv = Number(i.costoMercaderiaVendida);
  const inv = Number(i.inventarioPromedio);
  if (!cmv || cmv <= 0) throw new Error('Ingresá el costo de la mercadería vendida');
  if (!inv || inv <= 0) throw new Error('Ingresá el inventario promedio');

  const rotacion = cmv / inv;
  const dias = 365 / rotacion;

  let clasif = '';
  if (rotacion > 12) clasif = 'Muy alta — buen flujo, riesgo de quiebres.';
  else if (rotacion > 6) clasif = 'Saludable — retail típico.';
  else if (rotacion > 3) clasif = 'Lenta — revisá productos sin venta.';
  else clasif = 'Muy lenta — capital parado en inventario.';

  return {
    rotacion: Number(rotacion.toFixed(2)),
    diasEnStock: Math.round(dias),
    clasificacion: clasif,
  };
}
