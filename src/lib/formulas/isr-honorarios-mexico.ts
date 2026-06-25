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
  _table?: any;
}

/**
 * Mecánica pura de una factura de honorarios: a partir del subtotal y de si el
 * cliente es persona moral, devuelve IVA trasladado, retenciones de ISR e IVA,
 * total y neto a cobrar. La usa TANTO el resultado principal COMO cada fila de
 * la tabla, así ningún número de la tabla puede salir de una tasa distinta.
 */
function calcularFactura(subtotal: number, esPersonaMoral: boolean): {
  ivaTrasladado: number;
  isrRetenido: number;
  ivaRetenido: number;
  totalFactura: number;
  netoRecibir: number;
} {
  const ivaTrasladado = subtotal * 0.16;
  const isrRetenido = esPersonaMoral ? subtotal * 0.10 : 0;
  const ivaRetenido = esPersonaMoral ? subtotal * (10.6667 / 100) : 0;
  const totalFactura = subtotal + ivaTrasladado;
  const netoRecibir = totalFactura - isrRetenido - ivaRetenido;
  return { ivaTrasladado, isrRetenido, ivaRetenido, totalFactura, netoRecibir };
}

export function isrHonorariosMexico(i: Inputs): Outputs {
  const subtotal = Number(i.montoHonorarios);
  if (!subtotal || subtotal <= 0) throw new Error('Ingresá el monto de honorarios');

  const esPersonaMoral = i.tipoCliente
    ? i.tipoCliente === 'persona-moral'
    : !!(i.retieneIsr || i.retieneIva);

  const f = calcularFactura(subtotal, esPersonaMoral);
  const ivaTrasladado = f.ivaTrasladado;
  const isrRetenido = f.isrRetenido;
  const ivaRetenido = f.ivaRetenido;
  const totalFactura = f.totalFactura;
  const netoRecibir = f.netoRecibir;

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

  // --- Tabla: retención y neto a cobrar por monto de honorarios ---
  // Cada fila se calcula con calcularFactura(), la MISMA mecánica que el
  // resultado principal. Incluye el monto del usuario para que su fila coincida
  // exacto con el resultado de arriba.
  const montosBase = [5000, 10000, 20000, 50000];
  const montosTabla = Array.from(new Set([...montosBase, subtotal]))
    .filter((m) => m > 0)
    .sort((a, b) => a - b)
    .slice(0, 6);
  const _table = esPersonaMoral
    ? {
        title: 'Retenciones y neto a cobrar por monto de honorarios',
        headers: ['Honorarios', 'IVA (16%)', 'ISR ret. (10%)', 'IVA ret. (10.67%)', 'Neto a cobrar'],
        align: ['left', 'right', 'right', 'right', 'right'] as const,
        rows: montosTabla.map((m) => {
          const r = calcularFactura(m, true);
          return [
            fmtMXN(m),
            fmtMXN(r.ivaTrasladado),
            fmtMXN(r.isrRetenido),
            fmtMXN(r.ivaRetenido),
            fmtMXN(r.netoRecibir),
          ];
        }),
        note: 'Retenciones aplicables cuando el cliente es persona moral: ISR 10% e IVA 10.6667% (2/3 del 16%) sobre el subtotal. El neto = subtotal + IVA trasladado − retenciones. Las retenciones son anticipo de tus impuestos anuales, no un costo perdido.',
      }
    : {
        title: 'Cobro por monto de honorarios (cliente persona física, sin retenciones)',
        headers: ['Honorarios', 'IVA (16%)', 'Total a cobrar'],
        align: ['left', 'right', 'right'] as const,
        rows: montosTabla.map((m) => {
          const r = calcularFactura(m, false);
          return [fmtMXN(m), fmtMXN(r.ivaTrasladado), fmtMXN(r.totalFactura)];
        }),
        note: 'Una persona física no te retiene ISR ni IVA: cobrás el subtotal más el IVA trasladado completo. Ese IVA lo enterás vos al SAT en tu declaración.',
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
    _table,
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
