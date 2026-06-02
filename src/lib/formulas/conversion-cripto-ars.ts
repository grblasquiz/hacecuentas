/** Conversión cripto a pesos argentinos con cotización manual */

export interface Inputs {
  cantidadCripto: number;
  cotizacionUsd: number;
  tipoCambioPeso: number;
  spreadExchange: number;
}

export interface Outputs {
  totalPesos: number;
  totalUsd: number;
  cotizacionEfectiva: number;
  costoSpread: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function conversionCriptoArs(i: Inputs): Outputs {
  const cantidad = Number(i.cantidadCripto);
  const cotizUsd = Number(i.cotizacionUsd);
  const tipoCambio = Number(i.tipoCambioPeso);
  const spread = Number(i.spreadExchange) || 0;

  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de cripto');
  if (!cotizUsd || cotizUsd <= 0) throw new Error('Ingresá la cotización en USD');
  if (!tipoCambio || tipoCambio <= 0) throw new Error('Ingresá el tipo de cambio ARS/USD');

  const totalUsd = cantidad * cotizUsd;
  const costoSpread = totalUsd * (spread / 100);
  const usdNeto = totalUsd - costoSpread;
  const totalPesos = usdNeto * tipoCambio;
  const cotizacionEfectiva = totalPesos / cantidad;

  const formula = `${cantidad} cripto × $${cotizUsd} USD × ${tipoCambio} ARS/USD - ${spread}% spread = $${Math.round(totalPesos).toLocaleString('es-AR')} ARS`;
  const explicacion = `Tus ${cantidad} unidades valen $${Math.round(totalUsd).toLocaleString('es-AR')} USD. Descontando ${spread}% de spread del exchange, recibís $${Math.round(usdNeto).toLocaleString('es-AR')} USD netos, que al tipo de cambio de $${tipoCambio} son $${Math.round(totalPesos).toLocaleString('es-AR')} ARS. Cotización efectiva por unidad: $${Math.round(cotizacionEfectiva).toLocaleString('es-AR')} ARS.`;

  // Costo del spread expresado en pesos (para componer el bruto)
  const costoSpreadPesos = costoSpread * tipoCambio;
  const brutoPesos = totalUsd * tipoCambio; // = totalPesos + costoSpreadPesos
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  // El spread alto se come tu conversión: tono dinámico
  const tone: 'good' | 'warn' | 'neutral' = spread >= 2 ? 'warn' : spread > 0 ? 'neutral' : 'good';
  const _insight = {
    title: 'Lo que te llevás de verdad',
    text: spread > 0
      ? `Por convertir vas a recibir **${fmt(totalPesos)} ARS**. El **${spread}% de spread** del exchange te resta **${fmt(costoSpreadPesos)} ARS** sobre un bruto de ${fmt(brutoPesos)}. Tu cotización efectiva queda en **${fmt(cotizacionEfectiva)} ARS** por unidad.`
      : `Sin spread, recibís el total: **${fmt(totalPesos)} ARS** por tus ${cantidad} unidades, a una cotización efectiva de **${fmt(cotizacionEfectiva)} ARS** cada una.`,
    tone,
    icon: '🪙',
  };

  // Donut sólo si hay spread (si no, no hay partes que componer)
  let _chart: any = undefined;
  if (costoSpreadPesos > 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Recibís neto', value: Math.round(totalPesos) },
        { label: 'Spread del exchange', value: Math.round(costoSpreadPesos) },
      ],
      prefix: '$',
      centerValue: fmt(brutoPesos),
      centerLabel: 'Valor bruto',
      ariaLabel: `De ${fmt(brutoPesos)} brutos recibís ${fmt(totalPesos)} netos; el spread se lleva ${fmt(costoSpreadPesos)}`,
    };
  }

  return {
    totalPesos: Math.round(totalPesos),
    totalUsd: Math.round(totalUsd * 100) / 100,
    cotizacionEfectiva: Math.round(cotizacionEfectiva),
    costoSpread: Math.round(costoSpread * 100) / 100,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
