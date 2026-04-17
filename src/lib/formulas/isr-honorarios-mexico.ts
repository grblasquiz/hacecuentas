/**
 * Calculadora de retenciones ISR e IVA sobre honorarios (personas físicas)
 * ISR 10% y IVA 10.6667% (2/3 del 16%) cuando el cliente es persona moral
 */

export interface Inputs {
  montoHonorarios: number;
  tipoCliente?: 'persona-moral' | 'persona-fisica';
  regimen?: 'aep' | 'resico';
  // retro-compat
  retieneIsr?: boolean;
  retieneIva?: boolean;
}

export interface Outputs {
  subtotalFactura: number;
  ivaTrasladado: number;
  isrRetenido: number;
  ivaRetenido: number;
  totalFactura: number;
  netoRecibir: number;
  mensaje: string;
}

export function isrHonorariosMexico(i: Inputs): Outputs {
  const subtotal = Number(i.montoHonorarios);
  if (!subtotal || subtotal <= 0) throw new Error('Ingresá el monto de honorarios');

  const esPersonaMoral = i.tipoCliente
    ? i.tipoCliente === 'persona-moral'
    : !!(i.retieneIsr || i.retieneIva);

  const ivaTrasladado = subtotal * 0.16;
  const isrRetenido = esPersonaMoral ? subtotal * 0.10 : 0;
  const ivaRetenido = esPersonaMoral ? subtotal * (10.6667 / 100) : 0;

  const totalFactura = subtotal + ivaTrasladado;
  const netoRecibir = totalFactura - isrRetenido - ivaRetenido;

  return {
    subtotalFactura: Number(subtotal.toFixed(2)),
    ivaTrasladado: Number(ivaTrasladado.toFixed(2)),
    isrRetenido: Number(isrRetenido.toFixed(2)),
    ivaRetenido: Number(ivaRetenido.toFixed(2)),
    totalFactura: Number(totalFactura.toFixed(2)),
    netoRecibir: Number(netoRecibir.toFixed(2)),
    mensaje: `De una factura de $${subtotal.toFixed(2)} + IVA, vas a recibir $${netoRecibir.toFixed(2)} netos tras retenciones.`,
  };
}
