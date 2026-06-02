/**
 * Calculadora de rendimiento de CETES México
 * Fórmula simple: rendimiento = monto × (tasa/100) × (días/360)
 * Con reinversión: interés compuesto período a período.
 * ISR: 0.15% anual sobre el monto invertido (tasa especial personas físicas).
 */

export interface Inputs {
  monto: number;
  plazoDias: number;
  tasaAnual: number;
  reinversion?: number;
}

export interface Outputs {
  rendimientoBruto: number;
  isrRetenido: number;
  rendimientoNeto: number;
  saldoFinal: number;
  tasaRealAnual: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function cetesRendimientoMx(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const dias = Number(i.plazoDias);
  const tasa = Number(i.tasaAnual);
  const reinversiones = Math.max(1, Number(i.reinversion ?? 1));

  if (!monto || monto <= 0) throw new Error('Ingresá el monto a invertir');
  if (!dias || dias <= 0) throw new Error('Ingresá el plazo en días');
  if (!tasa || tasa <= 0) throw new Error('Ingresá la tasa anual');

  // Rendimiento por período
  const rendPeriodo = (tasa / 100) * (dias / 360);
  // Con reinversión: compuesto
  const factor = Math.pow(1 + rendPeriodo, reinversiones);
  const saldoBruto = monto * factor;
  const rendimientoBruto = saldoBruto - monto;

  const diasTotales = dias * reinversiones;
  const isrRetenido = monto * 0.0015 * (diasTotales / 360);
  const rendimientoNeto = rendimientoBruto - isrRetenido;
  const saldoFinal = monto + rendimientoNeto;
  const tasaRealAnual = (rendimientoNeto / monto) * (360 / diasTotales) * 100;

  const rendNetoR = Number(rendimientoNeto.toFixed(2));
  const isrR = Number(isrRetenido.toFixed(2));
  const capitalR = Number(monto.toFixed(2));
  const saldoR = Number((capitalR + rendNetoR).toFixed(2));
  const tasaRealR = Number(tasaRealAnual.toFixed(2));
  const mxn = (v: number) => '$' + v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const reinvTxt = reinversiones > 1 ? ` reinvirtiendo **${reinversiones} veces**` : '';

  const _insight = {
    title: 'Tu rendimiento neto',
    text: `Invirtiendo ${mxn(capitalR)} a **${dias} días**${reinvTxt} ganás **${mxn(rendNetoR)} netos** (descontado el ISR de ${mxn(isrR)}) y terminás con **${mxn(saldoR)}**. Eso equivale a una tasa real de **${tasaRealR.toFixed(2)} % anual**.`,
    tone: 'good' as const,
    icon: '🏦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital invertido', value: capitalR },
      { label: 'Rendimiento neto', value: rendNetoR },
    ],
    prefix: '$',
    centerValue: mxn(saldoR),
    centerLabel: 'saldo final',
    ariaLabel: `Composición del saldo final de ${mxn(saldoR)}: capital invertido más rendimiento neto`,
  };

  return {
    rendimientoBruto: Number(rendimientoBruto.toFixed(2)),
    isrRetenido: isrR,
    rendimientoNeto: rendNetoR,
    saldoFinal: Number(saldoFinal.toFixed(2)),
    tasaRealAnual: tasaRealR,
    mensaje: `Invirtiendo $${monto} a ${dias} días (${reinversiones} reinv.) al ${tasa}% anual ganás $${rendimientoNeto.toFixed(2)} netos. Saldo final $${saldoFinal.toFixed(2)}.`,
    _insight,
    _chart,
  };
}
