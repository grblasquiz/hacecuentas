/** Stock de seguridad y punto de reposición */

export interface Inputs {
  demandaDiaria: number;
  tiempoEntrega: number;
  desviacionDemanda: number;
}

export interface Outputs {
  stockSeguridad: number;
  puntoReposicion: number;
  detalle: string;
}

export function stockSeguridad(i: Inputs): Outputs {
  const demanda = Number(i.demandaDiaria);
  const leadTime = Number(i.tiempoEntrega);
  const sigma = Number(i.desviacionDemanda);

  if (isNaN(demanda) || demanda <= 0) throw new Error('Ingresá la demanda diaria promedio');
  if (isNaN(leadTime) || leadTime < 1) throw new Error('El tiempo de entrega debe ser al menos 1 día');
  if (isNaN(sigma) || sigma < 0) throw new Error('La desviación estándar no puede ser negativa');

  // Factor Z para nivel de servicio 95%
  const Z = 1.65;

  // Stock de seguridad = Z × σd × √(Lead Time)
  const ss = Z * sigma * Math.sqrt(leadTime);

  // Punto de reposición = (Demanda diaria × Lead Time) + Stock de seguridad
  const rop = demanda * leadTime + ss;

  const detalle =
    `Con demanda promedio de ${demanda} uds/día, lead time de ${leadTime} días y desviación de ${sigma}, ` +
    `el stock de seguridad óptimo es ${Math.ceil(ss)} unidades (nivel de servicio 95%). ` +
    `Hacé un nuevo pedido cuando tu inventario llegue a ${Math.ceil(rop)} unidades.`;

  return {
    stockSeguridad: Math.ceil(ss),
    puntoReposicion: Math.ceil(rop),
    detalle,
  };
}
