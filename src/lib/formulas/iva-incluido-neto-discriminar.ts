/**
 * Calculadora de IVA — incluido, neto y discriminado
 * Sacar IVA: neto = precio / (1 + alícuota)
 * Agregar IVA: total = neto × (1 + alícuota)
 */

export interface IvaIncluidoNetoDiscriminarInputs {
  monto: number;
  montoTipo: string;
  alicuota: number;
  __lang?: string;
}

export interface IvaIncluidoNetoDiscriminarOutputs {
  neto: number;
  iva: number;
  total: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function ivaIncluidoNetoDiscriminar(
  inputs: IvaIncluidoNetoDiscriminarInputs
): IvaIncluidoNetoDiscriminarOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorMonto: 'Ingresá un monto',
      errorAlicuota: 'La alícuota debe ser positiva',
      sliceNeto: 'Neto',
      centerLabel: 'Total',
      ariaLabel: 'Composición del precio: neto más IVA',
      labelConIva: 'Precio con IVA',
      labelNeto: 'Precio neto',
      discriminando: 'Discriminando',
      agregando: 'Agregando',
      insightTitle: 'Cuánto es IVA',
    },
    en: {
      errorMonto: 'Enter an amount',
      errorAlicuota: 'The tax rate must be positive',
      sliceNeto: 'Net',
      centerLabel: 'Total',
      ariaLabel: 'Price breakdown: net plus VAT',
      labelConIva: 'Price with VAT',
      labelNeto: 'Net price',
      discriminando: 'Breaking down',
      agregando: 'Adding',
      insightTitle: 'How much is VAT',
    },
  } as const)[__lang];

  const monto = Number(inputs.monto);
  const tipo = inputs.montoTipo || 'conIva';
  const alicuota = Number(inputs.alicuota) || 21;

  if (!monto || monto <= 0) throw new Error(T.errorMonto);
  if (alicuota <= 0) throw new Error(T.errorAlicuota);

  const factor = 1 + alicuota / 100;
  let neto: number;
  let iva: number;
  let total: number;

  if (tipo === 'conIva') {
    // Sacar IVA del precio final
    total = monto;
    neto = monto / factor;
    iva = total - neto;
  } else {
    // Agregar IVA al neto
    neto = monto;
    total = monto * factor;
    iva = total - neto;
  }

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.sliceNeto, value: Math.round(neto * 100) / 100 },
      { label: `IVA ${alicuota}%`, value: Math.round(iva * 100) / 100 },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: T.centerLabel,
    ariaLabel: T.ariaLabel,
  };

  const netoFmt = (Math.round(neto * 100) / 100).toLocaleString('es-AR');
  const ivaFmt = (Math.round(iva * 100) / 100).toLocaleString('es-AR');
  const totalFmt = (Math.round(total * 100) / 100).toLocaleString('es-AR');
  const montoFmt = monto.toLocaleString('es-AR');
  const labelTipo = tipo === 'conIva' ? T.labelConIva : T.labelNeto;
  const labelOp = tipo === 'conIva' ? T.discriminando : T.agregando;

  const pctIva = total > 0 ? Math.round((iva / total) * 1000) / 10 : 0;
  const insightText = __lang === 'en'
    ? `Of the **$${totalFmt}** total, **$${ivaFmt}** is VAT (**${pctIva}%** of the total) and **$${netoFmt}** is the net price.`
    : `Del total de **$${totalFmt}**, **$${ivaFmt}** son IVA (el **${pctIva}%** del total) y **$${netoFmt}** es el precio neto.`;

  const insight = {
    title: T.insightTitle,
    text: insightText,
    tone: 'neutral' as const,
    icon: '🧾',
  };

  return {
    neto: Math.round(neto * 100) / 100,
    iva: Math.round(iva * 100) / 100,
    total: Math.round(total * 100) / 100,
    detalle: `${labelTipo}: $${montoFmt}. ${labelOp} IVA ${alicuota}%: neto $${netoFmt} + IVA $${ivaFmt} = total $${totalFmt}.`,
    _chart: chart,
    _insight: insight,
  };
}
