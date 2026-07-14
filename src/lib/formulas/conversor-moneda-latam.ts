/**
 * Conversor de monedas de Latinoamérica.
 *
 * Los tipos de cambio salen del snapshot EN VIVO de src/data/live/*.json, que el
 * cron de datos refresca a diario (mismo patrón que el resto de las calcs
 * cambiarias, p. ej. tipo-cambio-dolar-peso-chile-clp-banco-central.ts). Cada
 * moneda cae a un fallback estático sólo si el snapshot no trae el dato.
 *
 * Fuentes por moneda (1 USD = X unidades):
 *   ARS ← dolar.json      · dólar OFICIAL, promedio compra/venta (DolarAPI/BCRA)
 *   MXN ← mexico.json     · usdmxn (open.er-api.com)
 *   COP ← colombia.json   · TRM oficial (Superfinanciera / datos.gov.co)
 *   CLP ← chile.json      · dólar observado (mindicador.cl / BCCh)
 *   UYU ← uruguay.json    · usduyu (open.er-api.com)
 *   PEN ← peru.json       · usdpen (open.er-api.com)
 *   BRL ← uruguay.json    · cross USD/BRL = usduyu ÷ bruluyu (mismo snapshot
 *                           open.er-api.com; se contrasta contra el cross de
 *                           paraguay.json, que da el mismo valor)
 *   BOB ← estático 6,9    · el boliviano está anclado al dólar por el BCB; no hay
 *                           feed en vivo en el repo.
 */
import dolarLive from '../../data/live/dolar.json';
import mxLive from '../../data/live/mexico.json';
import coLive from '../../data/live/colombia.json';
import clLive from '../../data/live/chile.json';
import uyLive from '../../data/live/uruguay.json';
import peLive from '../../data/live/peru.json';

export interface ConversorMonedaLatamInputs {
  monto: number;
  monedaOrigen: string;
  monedaDestino: string;
}

export interface ConversorMonedaLatamOutputs {
  resultado: number;
  tipoCambio: string;
  formula: string;
  explicacion: string;
  disclaimer: string;
  _insight?: any;
}

/** Devuelve el número sólo si es finito y > 0; si no, undefined (→ cae al fallback). */
const num = (v: any): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

// ARS: dólar oficial, promedio compra/venta (el JSON declara dataSource "dolar:oficial").
const _arsOficial = (() => {
  const q = (dolarLive as any)?.quotes?.oficial;
  const compra = num(q?.compra);
  const venta = num(q?.venta);
  if (compra && venta) return (compra + venta) / 2;
  return venta ?? compra;
})();

// BRL: cross rate del mismo snapshot (USD/UYU ÷ BRL/UYU).
const _brlCross = (() => {
  const usduyu = num((uyLive as any)?.usduyu?.valor);
  const brluyu = num((uyLive as any)?.brluyu?.valor);
  return usduyu && brluyu ? usduyu / brluyu : undefined;
})();

/** Fecha del snapshot en vivo (para el disclaimer / la UI). */
export const FX_AS_OF: string =
  (dolarLive as any)?._meta?.fetchedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

// Tipo de cambio: cuántas unidades de cada moneda equivalen a 1 USD
export const TASAS_VS_USD: Record<string, number> = {
  USD: 1,
  ARS: _arsOficial ?? 1200,
  MXN: num((mxLive as any)?.usdmxn?.valor) ?? 17.5,
  COP: num((coLive as any)?.trm?.valor) ?? 4200,
  CLP: num((clLive as any)?.dolar?.valor) ?? 950,
  BRL: _brlCross ?? 5.8,
  UYU: num((uyLive as any)?.usduyu?.valor) ?? 43,
  PEN: num((peLive as any)?.usdpen?.valor) ?? 3.75,
  BOB: 6.9,
};

const NOMBRES: Record<string, string> = {
  USD: 'Dólar estadounidense',
  ARS: 'Peso argentino',
  MXN: 'Peso mexicano',
  COP: 'Peso colombiano',
  CLP: 'Peso chileno',
  BRL: 'Real brasileño',
  UYU: 'Peso uruguayo',
  PEN: 'Sol peruano',
  BOB: 'Boliviano',
};

export function conversorMonedaLatam(inputs: ConversorMonedaLatamInputs): ConversorMonedaLatamOutputs {
  const monto = Number(inputs.monto);
  const origen = String(inputs.monedaOrigen || 'USD').toUpperCase();
  const destino = String(inputs.monedaDestino || 'ARS').toUpperCase();

  if (isNaN(monto) || monto <= 0) throw new Error('Ingresá un monto válido mayor a 0');
  if (!TASAS_VS_USD[origen]) throw new Error(`Moneda de origen no soportada: ${origen}`);
  if (!TASAS_VS_USD[destino]) throw new Error(`Moneda de destino no soportada: ${destino}`);
  if (origen === destino) throw new Error('Las monedas de origen y destino deben ser diferentes');

  const tasaOrigen = TASAS_VS_USD[origen];
  const tasaDestino = TASAS_VS_USD[destino];

  // Convertir: origen → USD → destino
  const montoEnUsd = monto / tasaOrigen;
  const resultado = montoEnUsd * tasaDestino;

  // Tipo de cambio directo: 1 unidad de origen = X unidades de destino
  const tipoCambioDirecto = tasaDestino / tasaOrigen;

  const fmt = (n: number, decimals = 2) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals > 0 ? 2 : 0,
      maximumFractionDigits: Math.max(decimals, 2),
    }).format(n);
  };

  // Decidir cuántos decimales según la magnitud
  const decimalesResultado = resultado > 1000 ? 0 : resultado > 1 ? 2 : 4;
  const resultadoRedondeado = Number(resultado.toFixed(decimalesResultado));

  const nombreOrigen = NOMBRES[origen];
  const nombreDestino = NOMBRES[destino];

  const tipoCambio = `1 ${origen} = ${fmt(tipoCambioDirecto, 4)} ${destino}`;

  let formula: string;
  if (origen === 'USD') {
    formula = `${fmt(monto)} USD × ${fmt(tasaDestino)} = ${fmt(resultadoRedondeado, decimalesResultado)} ${destino}`;
  } else if (destino === 'USD') {
    formula = `${fmt(monto)} ${origen} ÷ ${fmt(tasaOrigen)} = ${fmt(resultadoRedondeado, decimalesResultado)} USD`;
  } else {
    formula = `${fmt(monto)} ${origen} ÷ ${fmt(tasaOrigen)} = ${fmt(montoEnUsd, 4)} USD × ${fmt(tasaDestino)} = ${fmt(resultadoRedondeado, decimalesResultado)} ${destino}`;
  }

  const explicacion = `${fmt(monto)} ${nombreOrigen} (${origen}) equivalen a aproximadamente ${fmt(resultadoRedondeado, decimalesResultado)} ${nombreDestino} (${destino}). Tipo de cambio usado: ${tipoCambio}. Cotización de referencia del ${FX_AS_OF}.`;

  const disclaimer = `Tipo de cambio de referencia del ${FX_AS_OF} (actualizado a diario). Puede variar respecto al valor del mercado en el momento de operar. Para operaciones reales, consultá tu banco o casa de cambio. En Argentina existen múltiples tipos de dólar (oficial, blue, MEP, tarjeta): acá se usa el oficial.`;

  // Insight: interpreta el resultado y advierte sobre monedas volátiles
  const arsInvolucrada = origen === 'ARS' || destino === 'ARS';
  const resultadoFmt = fmt(resultadoRedondeado, decimalesResultado);
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (arsInvolucrada) {
    insightTone = 'warn';
    insightText = `**${fmt(monto)} ${origen}** ≈ **${resultadoFmt} ${destino}** al cambio **${tipoCambio.replace('1 ' + origen + ' = ', '')}** por unidad (dólar oficial del ${FX_AS_OF}). El peso argentino es volátil y conviven varios dólares (oficial, blue, MEP): tomá este número como orientativo, no como cotización de cierre.`;
  } else {
    insightTone = 'neutral';
    insightText = `**${fmt(monto)} ${origen}** equivalen a **${resultadoFmt} ${destino}**, con un tipo de cambio de **${tipoCambio.replace('1 ' + origen + ' = ', '')}** por unidad de ${origen}. Cotización de referencia del ${FX_AS_OF}; confirmá el valor del día antes de operar.`;
  }

  return {
    resultado: resultadoRedondeado,
    tipoCambio,
    formula,
    explicacion,
    disclaimer,
    _insight: {
      title: 'Cómo leer el cambio',
      text: insightText,
      tone: insightTone,
      icon: '💱',
    },
  };
}
