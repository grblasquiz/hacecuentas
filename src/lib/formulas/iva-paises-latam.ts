/**
 * Calculadora de IVA por Pais en Latinoamerica 2026
 * Soporta agregar IVA, discriminar IVA desde precio final, o calcular precio sin IVA
 */

export interface IvaPaisesLatamInputs {
  pais: string;
  monto: number;
  modo: string;
}

export interface IvaPaisesLatamOutputs {
  montoConIva: number;
  montoSinIva: number;
  ivaAmount: number;
  alicuota: number;
  formula: string;
  explicacion: string;
  moneda: string;
}

interface PaisIvaInfo {
  alicuota: number;
  moneda: string;
  nombreImpuesto: string;
}

const PAISES_IVA: Record<string, PaisIvaInfo> = {
  argentina: { alicuota: 21, moneda: 'ARS (Peso argentino)', nombreImpuesto: 'IVA' },
  mexico: { alicuota: 16, moneda: 'MXN (Peso mexicano)', nombreImpuesto: 'IVA' },
  colombia: { alicuota: 19, moneda: 'COP (Peso colombiano)', nombreImpuesto: 'IVA' },
  chile: { alicuota: 19, moneda: 'CLP (Peso chileno)', nombreImpuesto: 'IVA' },
  peru: { alicuota: 18, moneda: 'PEN (Sol peruano)', nombreImpuesto: 'IGV' },
  uruguay: { alicuota: 22, moneda: 'UYU (Peso uruguayo)', nombreImpuesto: 'IVA' },
  brasil: { alicuota: 17, moneda: 'BRL (Real brasileño)', nombreImpuesto: 'ICMS (promedio)' },
  ecuador: { alicuota: 15, moneda: 'USD (Dólar estadounidense)', nombreImpuesto: 'IVA' },
  paraguay: { alicuota: 10, moneda: 'PYG (Guaraní)', nombreImpuesto: 'IVA' },
  bolivia: { alicuota: 13, moneda: 'BOB (Boliviano)', nombreImpuesto: 'IVA' },
  'costa rica': { alicuota: 13, moneda: 'CRC (Colón costarricense)', nombreImpuesto: 'IVA' },
  panama: { alicuota: 7, moneda: 'PAB/USD (Balboa/Dólar)', nombreImpuesto: 'ITBMS' },
  'republica dominicana': { alicuota: 18, moneda: 'DOP (Peso dominicano)', nombreImpuesto: 'ITBIS' },
  guatemala: { alicuota: 12, moneda: 'GTQ (Quetzal)', nombreImpuesto: 'IVA' },
  honduras: { alicuota: 15, moneda: 'HNL (Lempira)', nombreImpuesto: 'ISV' },
  'el salvador': { alicuota: 13, moneda: 'USD (Dólar estadounidense)', nombreImpuesto: 'IVA' },
  nicaragua: { alicuota: 15, moneda: 'NIO (Córdoba)', nombreImpuesto: 'IVA' },
};

export function ivaPaisesLatam(inputs: IvaPaisesLatamInputs): IvaPaisesLatamOutputs {
  const paisKey = String(inputs.pais).toLowerCase().trim();
  const monto = Number(inputs.monto);
  const modo = String(inputs.modo).toLowerCase().trim();

  if (!monto || monto <= 0) {
    throw new Error('Ingresa un monto válido');
  }

  const paisInfo = PAISES_IVA[paisKey];
  if (!paisInfo) {
    throw new Error(`País no encontrado. Elegí entre: ${Object.keys(PAISES_IVA).join(', ')}`);
  }

  const { alicuota, moneda, nombreImpuesto } = paisInfo;
  const tasa = alicuota / 100;

  let montoSinIva: number;
  let montoConIva: number;
  let ivaAmount: number;

  if (modo === 'agregar iva' || modo === 'agregar') {
    // Monto es sin IVA, agregamos
    montoSinIva = monto;
    ivaAmount = monto * tasa;
    montoConIva = monto + ivaAmount;
  } else if (modo === 'discriminar iva' || modo === 'discriminar') {
    // Monto ya incluye IVA, lo separamos
    montoConIva = monto;
    montoSinIva = monto / (1 + tasa);
    ivaAmount = montoConIva - montoSinIva;
  } else {
    // precio sin IVA (default = agregar)
    montoSinIva = monto;
    ivaAmount = monto * tasa;
    montoConIva = monto + ivaAmount;
  }

  const paisCapitalized = paisKey.charAt(0).toUpperCase() + paisKey.slice(1);

  let formula: string;
  let explicacion: string;

  if (modo === 'discriminar iva' || modo === 'discriminar') {
    formula = `Neto = $${monto.toLocaleString('es')} / ${(1 + tasa).toFixed(2)} = $${Math.round(montoSinIva).toLocaleString('es')} | ${nombreImpuesto} = $${Math.round(ivaAmount).toLocaleString('es')}`;
    explicacion = `El precio final de $${monto.toLocaleString('es')} en ${paisCapitalized} incluye $${Math.round(ivaAmount).toLocaleString('es')} de ${nombreImpuesto} (${alicuota}%). El precio neto sin impuesto es $${Math.round(montoSinIva).toLocaleString('es')}.`;
  } else {
    formula = `Precio con ${nombreImpuesto} = $${monto.toLocaleString('es')} x ${(1 + tasa).toFixed(2)} = $${Math.round(montoConIva).toLocaleString('es')} | ${nombreImpuesto} = $${Math.round(ivaAmount).toLocaleString('es')}`;
    explicacion = `Al precio de $${monto.toLocaleString('es')} en ${paisCapitalized} se le agrega ${alicuota}% de ${nombreImpuesto}: $${Math.round(ivaAmount).toLocaleString('es')}. El precio final con impuesto es $${Math.round(montoConIva).toLocaleString('es')}.`;
  }

  return {
    montoConIva: Math.round(montoConIva * 100) / 100,
    montoSinIva: Math.round(montoSinIva * 100) / 100,
    ivaAmount: Math.round(ivaAmount * 100) / 100,
    alicuota,
    formula,
    explicacion,
    moneda,
  };
}
