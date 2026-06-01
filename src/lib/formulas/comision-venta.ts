/** Comisión de vendedor / agente inmobiliario / freelancer */
export interface Inputs {
  montoVenta: number;
  porcentajeComision: number;
  baseImponible?: 'neto' | 'bruto' | string;
  alicuotaIva?: number;
  aplicarIvaSobreComision?: boolean | string;
}
export interface Outputs {
  comisionNeta: number;
  ivaComision: number;
  comisionTotal: number;
  porcentajeSobreVenta: number;
  _chart?: any;
  _insight?: any;
}

export function comisionVenta(i: Inputs): Outputs {
  const venta = Number(i.montoVenta);
  const pct = Number(i.porcentajeComision);
  const base = String(i.baseImponible || 'bruto');
  const alic = Number(i.alicuotaIva) || 21;
  const conIva = i.aplicarIvaSobreComision === true || i.aplicarIvaSobreComision === 'true' || i.aplicarIvaSobreComision === 'si';

  if (!venta || venta <= 0) throw new Error('Ingresá el monto de venta');
  if (pct < 0) throw new Error('Porcentaje inválido');

  // Si base es neto, saco IVA primero
  const baseCalculo = base === 'neto' ? venta / (1 + alic / 100) : venta;
  const comisionNeta = baseCalculo * pct / 100;
  const ivaComision = conIva ? comisionNeta * alic / 100 : 0;
  const total = comisionNeta + ivaComision;

  const chart = ivaComision > 0
    ? {
        type: 'doughnut' as const,
        slices: [
          { label: 'Comisión neta', value: Math.round(comisionNeta) },
          { label: `IVA (${alic}%)`, value: Math.round(ivaComision) },
        ],
        prefix: '$',
        centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
        centerLabel: 'Comisión total',
        ariaLabel: 'Composición de la comisión: neto más IVA',
      }
    : undefined;

  // Insight: cuánto representa la comisión sobre la venta y el peso del IVA.
  const pctTotalSobreVenta = (total / venta) * 100;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const insight = conIva
    ? {
        title: 'Comisión + IVA sobre la venta',
        text: `Sobre una venta de **${fmt(venta)}** cobrás **${fmt(total)}** (el **${pctTotalSobreVenta.toFixed(2)}%**), de los cuales **${fmt(ivaComision)}** son IVA del ${alic}% que vas a tener que ingresar a la AFIP: tu honorario real es **${fmt(comisionNeta)}**.`,
        tone: 'neutral' as 'good' | 'warn' | 'neutral',
        icon: '🧾',
      }
    : {
        title: 'Tu comisión sobre la venta',
        text: `Sobre una venta de **${fmt(venta)}** tu comisión es **${fmt(total)}**, equivalente al **${pctTotalSobreVenta.toFixed(2)}%** del total${base === 'neto' ? ' (calculada sobre la base neta, sin IVA de la venta)' : ''}. No se sumó IVA sobre la comisión.`,
        tone: 'good' as 'good' | 'warn' | 'neutral',
        icon: '💼',
      };

  return {
    comisionNeta: Math.round(comisionNeta),
    ivaComision: Math.round(ivaComision),
    comisionTotal: Math.round(total),
    porcentajeSobreVenta: Number(((total / venta) * 100).toFixed(2)),
    _chart: chart,
    _insight: insight,
  };
}
