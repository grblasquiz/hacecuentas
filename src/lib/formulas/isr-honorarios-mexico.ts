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
  _insight?: any;
  _chart?: any;
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

  const fmtMXN = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const retencionTotal = isrRetenido + ivaRetenido;
  const pctNeto = totalFactura > 0 ? Math.round((netoRecibir / totalFactura) * 1000) / 10 : 0;

  const _insight = {
    title: esPersonaMoral ? 'Cobrás con retenciones' : 'Sin retenciones',
    text: esPersonaMoral
      ? `Como tu cliente es persona moral, te retiene **${fmtMXN(isrRetenido)}** de ISR y **${fmtMXN(ivaRetenido)}** de IVA. De los **${fmtMXN(totalFactura)}** facturados cobrás **${fmtMXN(netoRecibir)}** netos (el **${pctNeto}%**); las retenciones son anticipo de tus impuestos, no un costo perdido.`
      : `Tu cliente es persona física, así que no te retiene nada: cobrás los **${fmtMXN(totalFactura)}** completos (subtotal + IVA). Recordá que el IVA trasladado (**${fmtMXN(ivaTrasladado)}**) lo enterás vos al SAT.`,
    tone: esPersonaMoral ? 'warn' : 'neutral',
    icon: '🧾',
  };

  const out: Outputs = {
    subtotalFactura: Number(subtotal.toFixed(2)),
    ivaTrasladado: Number(ivaTrasladado.toFixed(2)),
    isrRetenido: Number(isrRetenido.toFixed(2)),
    ivaRetenido: Number(ivaRetenido.toFixed(2)),
    totalFactura: Number(totalFactura.toFixed(2)),
    netoRecibir: Number(netoRecibir.toFixed(2)),
    mensaje: `De una factura de $${subtotal.toFixed(2)} + IVA, vas a recibir $${netoRecibir.toFixed(2)} netos tras retenciones.`,
    _insight,
  };

  // Donut solo si hay retenciones: total factura = neto + ISR retenido + IVA retenido (suman el total)
  if (esPersonaMoral && retencionTotal > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Neto a recibir', value: Number(netoRecibir.toFixed(2)) },
        { label: 'ISR retenido', value: Number(isrRetenido.toFixed(2)) },
        { label: 'IVA retenido', value: Number(ivaRetenido.toFixed(2)) },
      ],
      prefix: '$',
      centerValue: fmtMXN(totalFactura),
      centerLabel: 'Total facturado',
      ariaLabel: 'Reparto del total facturado entre neto a recibir y retenciones de ISR e IVA',
    };
  }

  return out;
}
