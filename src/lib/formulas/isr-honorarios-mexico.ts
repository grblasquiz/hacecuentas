/**
 * Calculadora de retenciones ISR e IVA sobre honorarios (personas físicas RIF/PF)
 * ISR 10% y IVA 10.6667% (2/3 del 16%) cuando el cliente es persona moral
 */

export interface Inputs {
  montoFactura: number;
  retieneIsr: boolean;
  retieneIva: boolean;
}

export interface Outputs {
  subtotal: number;
  ivaTrasladado: number;
  retencionIsr: number;
  retencionIva: number;
  totalFactura: number;
  netoRecibir: number;
  mensaje: string;
}

export function isrHonorariosMexico(i: Inputs): Outputs {
  const subtotal = Number(i.montoFactura);
  if (!subtotal || subtotal <= 0) throw new Error('Ingresá el monto de la factura');

  const ivaTrasladado = subtotal * 0.16;
  const retencionIsr = i.retieneIsr ? subtotal * 0.10 : 0;
  const retencionIva = i.retieneIva ? subtotal * (10.6667 / 100) : 0;

  const totalFactura = subtotal + ivaTrasladado;
  const netoRecibir = totalFactura - retencionIsr - retencionIva;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    ivaTrasladado: Number(ivaTrasladado.toFixed(2)),
    retencionIsr: Number(retencionIsr.toFixed(2)),
    retencionIva: Number(retencionIva.toFixed(2)),
    totalFactura: Number(totalFactura.toFixed(2)),
    netoRecibir: Number(netoRecibir.toFixed(2)),
    mensaje: `De una factura de $${subtotal.toFixed(2)} + IVA, vas a recibir $${netoRecibir.toFixed(2)} netos tras retenciones.`,
  };
}
