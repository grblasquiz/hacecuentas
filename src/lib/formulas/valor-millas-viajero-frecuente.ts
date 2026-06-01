/** Valor monetario de millas de programas de viajero frecuente */
export interface Inputs {
  programa: string; // 'latam-pass' | 'aerolineas-plus' | 'smiles' | 'aadvantage' | 'united'
  millas: number;
  valorVueloUsd: number; // valor del vuelo que querés canjear en USD
  cotizacionUsd: number; // AR$ por USD
}

export interface Outputs {
  valorPorMillaUsd: number;
  valorPorMillaArs: number;
  valorTotalUsd: number;
  valorTotalArs: number;
  valorBaseMillaCent: number; // centavos USD que vale una milla típicamente
  esBuenCanje: string;
  resumen: string;
  _chart?: any;
}

// Valor base aproximado por milla (centavos USD) - referencia de mercado
const VALOR_BASE: Record<string, number> = {
  'latam-pass': 1.4,
  'aerolineas-plus': 1.2,
  'smiles': 1.5,
  'aadvantage': 1.5,
  'united': 1.3,
  'miles-and-more': 1.4,
  'generico': 1.3,
};

export function valorMillasViajeroFrecuente(i: Inputs): Outputs {
  const programa = String(i.programa || 'generico');
  const millas = Number(i.millas);
  const valorVuelo = Number(i.valorVueloUsd);
  const cotiz = Number(i.cotizacionUsd) || 1000;

  if (!millas || millas <= 0) throw new Error('Ingresá la cantidad de millas');
  if (!valorVuelo || valorVuelo <= 0) throw new Error('Ingresá el valor del vuelo en USD');

  const valorPorMillaUsd = valorVuelo / millas;
  const valorPorMillaArs = valorPorMillaUsd * cotiz;
  const valorTotalUsd = valorVuelo;
  const valorTotalArs = valorTotalUsd * cotiz;

  const base = VALOR_BASE[programa] || 1.3;
  const valorCentavos = valorPorMillaUsd * 100;

  let esBuenCanje = 'Regular';
  if (valorCentavos >= base * 1.3) esBuenCanje = 'Excelente — muy por encima del promedio';
  else if (valorCentavos >= base) esBuenCanje = 'Bueno — al valor de mercado';
  else if (valorCentavos >= base * 0.7) esBuenCanje = 'Regular — un poco por debajo del promedio';
  else esBuenCanje = 'Malo — guardá las millas para otro canje';

  const valorCent = Number(valorCentavos.toFixed(2));
  const chart = {
    type: 'scale' as const,
    marker: valorCent,
    markerLabel: 'Tu canje: ' + valorCent.toFixed(2) + '¢/milla',
    min: 0,
    unit: '¢',
    segments: [
      { nombre: 'Malo', max: Number((base * 0.7).toFixed(2)), color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Regular', max: Number(base.toFixed(2)), color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Bueno', max: Number((base * 1.3).toFixed(2)), color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Excelente', max: Math.max(Number((base * 1.8).toFixed(2)), Math.ceil(valorCent) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de valor del canje en centavos de dólar por milla, según el promedio del programa',
  };
  return {
    valorPorMillaUsd: Number(valorPorMillaUsd.toFixed(4)),
    valorPorMillaArs: Number(valorPorMillaArs.toFixed(2)),
    valorTotalUsd: Number(valorTotalUsd.toFixed(2)),
    valorTotalArs: Number(valorTotalArs.toFixed(0)),
    valorBaseMillaCent: base,
    esBuenCanje,
    resumen: `Tu canje vale **US$ ${valorPorMillaUsd.toFixed(3)} por milla** (${valorCentavos.toFixed(2)}¢). El valor promedio en ${programa} es ${base}¢. Resultado: ${esBuenCanje.toLowerCase()}.`,
    _chart: chart,
  };
}
