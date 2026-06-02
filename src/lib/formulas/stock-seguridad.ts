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
  _insight?: any;
  _chart?: any;
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

  const ssCeil = Math.ceil(ss);
  const ropCeil = Math.ceil(rop);

  const detalle =
    `Con demanda promedio de ${demanda} uds/día, lead time de ${leadTime} días y desviación de ${sigma}, ` +
    `el stock de seguridad óptimo es ${ssCeil} unidades (nivel de servicio 95%). ` +
    `Hacé un nuevo pedido cuando tu inventario llegue a ${ropCeil} unidades.`;

  // Slices que suman exacto el punto de reposición mostrado
  const demandaCiclo = ropCeil - ssCeil; // demanda durante el lead time
  const pctColchon = rop > 0 ? (ss / rop) * 100 : 0;

  const _insight = {
    title: 'Punto de reposición',
    text: `Reponé cuando el inventario baje a **${ropCeil} unidades**: ${demandaCiclo} cubren la demanda durante los ${leadTime} días de entrega y **${ssCeil} son el colchón de seguridad** (${pctColchon.toFixed(0)}% del total) para no quebrar stock con un 95% de confianza.`,
    tone: 'neutral',
    icon: '📦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Demanda en lead time', value: demandaCiclo },
      { label: 'Stock de seguridad', value: ssCeil },
    ],
    prefix: '',
    centerValue: `${ropCeil}`,
    centerLabel: 'unidades (reponer)',
    ariaLabel: `Punto de reposición de ${ropCeil} unidades: ${demandaCiclo} de demanda en lead time más ${ssCeil} de stock de seguridad`,
  };

  return {
    stockSeguridad: ssCeil,
    puntoReposicion: ropCeil,
    detalle,
    _insight,
    _chart,
  };
}
