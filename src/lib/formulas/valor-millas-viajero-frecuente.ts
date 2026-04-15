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

  return {
    valorPorMillaUsd: Number(valorPorMillaUsd.toFixed(4)),
    valorPorMillaArs: Number(valorPorMillaArs.toFixed(2)),
    valorTotalUsd: Number(valorTotalUsd.toFixed(2)),
    valorTotalArs: Number(valorTotalArs.toFixed(0)),
    valorBaseMillaCent: base,
    esBuenCanje,
    resumen: `Tu canje vale **US$ ${valorPorMillaUsd.toFixed(3)} por milla** (${valorCentavos.toFixed(2)}¢). El valor promedio en ${programa} es ${base}¢. Resultado: ${esBuenCanje.toLowerCase()}.`,
  };
}
