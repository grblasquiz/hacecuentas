/** Mundial 2026: comparador de precios de camisetas oficiales por marca y país. */
export interface Inputs {
  seleccion: string;
  modelo: string; // 'jugador' | 'hincha' | 'suplente'
  paisCompra: string;
  personalizacion: string; // 'no' | 'si'
  dolarTarjeta?: number;
}

export interface Outputs {
  precioUSD: string;
  precioLocal: string;
  comparativaHistorica: string;
  tipDeAhorro: string;
  resumen: string;
}

// Mapa de selecciones a marca.
const SELECCION_MARCA: Record<string, { marca: string; label: string }> = {
  argentina: { marca: 'adidas', label: 'Argentina' },
  brasil: { marca: 'nike', label: 'Brasil' },
  francia: { marca: 'nike', label: 'Francia' },
  espana: { marca: 'adidas', label: 'España' },
  alemania: { marca: 'adidas', label: 'Alemania' },
  inglaterra: { marca: 'nike', label: 'Inglaterra' },
  portugal: { marca: 'nike', label: 'Portugal' },
  mexico: { marca: 'adidas', label: 'México' },
  italia: { marca: 'puma', label: 'Italia' },
  paises_bajos: { marca: 'nike', label: 'Países Bajos' },
  belgica: { marca: 'adidas', label: 'Bélgica' },
  colombia: { marca: 'adidas', label: 'Colombia' },
  estados_unidos: { marca: 'nike', label: 'Estados Unidos' },
  canada: { marca: 'nike', label: 'Canadá' },
  marruecos: { marca: 'puma', label: 'Marruecos' },
  japon: { marca: 'adidas', label: 'Japón' },
  uruguay: { marca: 'puma', label: 'Uruguay' },
  croacia: { marca: 'nike', label: 'Croacia' },
};

// Precios base en USD por marca y modelo (datos 2026).
const PRECIO_BASE: Record<string, Record<string, number>> = {
  adidas: { jugador: 150, hincha: 100, suplente: 90 },
  nike: { jugador: 165, hincha: 95, suplente: 85 },
  puma: { jugador: 140, hincha: 95, suplente: 85 },
};

// Factor país (multiplicador sobre precio base USA).
const FACTOR_PAIS: Record<string, { factor: number; label: string; moneda: string }> = {
  argentina: { factor: 1.60, label: 'Argentina', moneda: 'ARS' },
  espana: { factor: 1.10, label: 'España', moneda: 'EUR' },
  estados_unidos: { factor: 1.00, label: 'Estados Unidos', moneda: 'USD' },
  mexico: { factor: 1.05, label: 'México', moneda: 'MXN' },
  brasil: { factor: 1.15, label: 'Brasil', moneda: 'BRL' },
  online: { factor: 1.10, label: 'Online internacional', moneda: 'USD' },
};

// Tipo de cambio aproximado (mayo 2026). Para Argentina se usa el dólar tarjeta ingresado.
const TC_LOCAL: Record<string, number> = {
  espana: 0.92, // 1 USD = 0.92 EUR
  mexico: 17.5, // 1 USD = 17.5 MXN
  brasil: 5.4, // 1 USD = 5.4 BRL
  estados_unidos: 1.0,
  online: 1.0,
};

// Precios histórico Qatar 2022 (USA, hincha).
const PRECIO_2022: Record<string, number> = {
  adidas: 100,
  nike: 90,
  puma: 90,
};

const MARCA_LABEL: Record<string, string> = {
  adidas: 'Adidas',
  nike: 'Nike',
  puma: 'Puma',
};

const MODELO_LABEL: Record<string, string> = {
  jugador: 'Versión Jugador (Authentic)',
  hincha: 'Versión Hincha (Replica)',
  suplente: 'Suplente',
};

export function mundial2026CamisetaPrecioComparador(i: Inputs): Outputs {
  const selKey = String(i.seleccion || '').toLowerCase();
  const modKey = String(i.modelo || 'hincha').toLowerCase();
  const paisKey = String(i.paisCompra || 'estados_unidos').toLowerCase();
  const personaliza = String(i.personalizacion || 'no').toLowerCase() === 'si';
  const dolarTC = Number(i.dolarTarjeta || 1450);

  const sel = SELECCION_MARCA[selKey];
  if (!sel) throw new Error('Selección inválida.');
  if (!PRECIO_BASE[sel.marca] || !PRECIO_BASE[sel.marca][modKey]) {
    throw new Error('Modelo inválido.');
  }
  const pais = FACTOR_PAIS[paisKey];
  if (!pais) throw new Error('País de compra inválido.');

  const base = PRECIO_BASE[sel.marca][modKey];
  const personalizacionCosto = personaliza ? 25 : 0;
  const precioUSD = base * pais.factor + personalizacionCosto;

  // Precio en moneda local.
  let precioLocalTxt = '';
  if (paisKey === 'argentina') {
    if (dolarTC < 100) throw new Error('Dólar tarjeta inválido.');
    const ars = precioUSD * dolarTC;
    precioLocalTxt = `**ARS ${ars.toLocaleString('es-AR', { maximumFractionDigits: 0 })}** al dólar tarjeta ARS ${dolarTC.toLocaleString('es-AR')}.`;
  } else if (paisKey === 'estados_unidos' || paisKey === 'online') {
    precioLocalTxt = `**USD ${precioUSD.toFixed(2)}** (precio en moneda original).`;
  } else {
    const tc = TC_LOCAL[paisKey] || 1;
    const local = precioUSD * tc;
    precioLocalTxt = `**${pais.moneda} ${local.toLocaleString('en-US', { maximumFractionDigits: 0 })}** (al cambio aprox.).`;
  }

  // Comparativa histórica.
  const precio2022 = PRECIO_2022[sel.marca];
  const diff = ((base - precio2022) / precio2022) * 100;
  const compHistTxt = Math.abs(diff) < 2
    ? `Mismo precio que en Qatar 2022 (USD ${precio2022}). ${sel.marca === 'nike' ? 'Nike mantuvo precios.' : sel.marca === 'adidas' ? 'Adidas no modificó la lista oficial.' : 'Puma mantuvo precios.'}`
    : diff > 0
      ? `Subió ${diff.toFixed(0)}% vs Qatar 2022 (era USD ${precio2022}, ahora USD ${base}).`
      : `Bajó ${Math.abs(diff).toFixed(0)}% vs Qatar 2022 (era USD ${precio2022}, ahora USD ${base}).`;
  const compHist = `**${sel.label} ${MARCA_LABEL[sel.marca]} hincha**: ${compHistTxt}`;

  // Tip de ahorro.
  let tip = '';
  if (paisKey === 'argentina') {
    const baseUSA = base + personalizacionCosto;
    const ahorro = (precioUSD - baseUSA);
    tip = `**Comprándola en USA ahorrás ~USD ${ahorro.toFixed(0)}** (${((ahorro / precioUSD) * 100).toFixed(0)}% menos). Si viajás, traerla en la franquicia evita el +60% de impuestos.`;
  } else if (modKey === 'jugador') {
    tip = `Versión hincha es 35-40% más barata (USD ${(PRECIO_BASE[sel.marca].hincha * pais.factor + personalizacionCosto).toFixed(0)}) y para uso casual es prácticamente igual.`;
  } else if (paisKey === 'online') {
    tip = `Sumá USD 15-30 de envío internacional. Si estás en USA, comprá directo en Adidas/Nike/Puma USA — mismo precio sin envío.`;
  } else {
    tip = `Online directo de la marca puede tener ofertas de temporada (10-20% off post-Mundial).`;
  }

  // Resumen.
  const resumen = `Camiseta ${sel.label} ${MARCA_LABEL[sel.marca]} ${MODELO_LABEL[modKey]} en ${pais.label}${personaliza ? ' con personalización' : ''}: **USD ${precioUSD.toFixed(2)}**. ${precioLocalTxt} ${compHist}`;

  return {
    precioUSD: `USD ${precioUSD.toFixed(0)}`,
    precioLocal: precioLocalTxt,
    comparativaHistorica: compHist,
    tipDeAhorro: tip,
    resumen,
  };
}
