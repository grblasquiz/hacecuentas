/**
 * Conversor de monedas de Latinoamérica
 * Tipos de cambio referenciales estáticos (abril 2026)
 */

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

// Tipo de cambio: cuántas unidades de cada moneda equivalen a 1 USD
const TASAS_VS_USD: Record<string, number> = {
  USD: 1,
  ARS: 1200,
  MXN: 17.5,
  COP: 4200,
  CLP: 950,
  BRL: 5.8,
  UYU: 43,
  PEN: 3.75,
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

  const explicacion = `${fmt(monto)} ${nombreOrigen} (${origen}) equivalen a aproximadamente ${fmt(resultadoRedondeado, decimalesResultado)} ${nombreDestino} (${destino}). Tipo de cambio usado: ${tipoCambio}. Este valor es referencial (abril 2026).`;

  const disclaimer = 'Tipo de cambio referencial aproximado (abril 2026). Puede variar significativamente respecto al valor actual del mercado. Para operaciones reales, consultá tu banco o casa de cambio. En Argentina existen múltiples tipos de dólar (oficial, blue, MEP, tarjeta).';

  // Insight: interpreta el resultado y advierte sobre monedas volátiles
  const arsInvolucrada = origen === 'ARS' || destino === 'ARS';
  const resultadoFmt = fmt(resultadoRedondeado, decimalesResultado);
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (arsInvolucrada) {
    insightTone = 'warn';
    insightText = `**${fmt(monto)} ${origen}** ≈ **${resultadoFmt} ${destino}** al cambio referencial **${tipoCambio.replace('1 ' + origen + ' = ', '')}** por unidad. El peso argentino es muy volátil y conviven varios dólares (oficial, blue, MEP): tomá este número como orientativo, no como cotización real.`;
  } else {
    insightTone = 'neutral';
    insightText = `**${fmt(monto)} ${origen}** equivalen a **${resultadoFmt} ${destino}**, con un tipo de cambio de **${tipoCambio.replace('1 ' + origen + ' = ', '')}** por unidad de ${origen}. Es un valor de referencia (abril 2026); confirmá la cotización del día antes de operar.`;
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
