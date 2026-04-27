export interface Inputs {
  kmAnio: number;
  eficiencia: number;
  porcHogar: number;
  tarifaHogarUSD: number;
  tarifaPublicoUSD: number;
  tipoCambio: number;
}

export interface Outputs {
  costoTotalUSD: number;
  costoTotalARS: number;
  costoHogarUSD: number;
  costoPublicoUSD: number;
  energiaTotalKwh: number;
  detalle: string;
}

export function compute(i: Inputs): Outputs {
  const kmAnio = Number(i.kmAnio) || 0;
  const eficiencia = Number(i.eficiencia) || 0;
  const porcHogar = Number(i.porcHogar) ?? 80;
  const tarifaHogarUSD = Number(i.tarifaHogarUSD) || 0;
  const tarifaPublicoUSD = Number(i.tarifaPublicoUSD) || 0;
  const tipoCambio = Number(i.tipoCambio) || 1;

  // Validaciones básicas
  if (kmAnio <= 0 || eficiencia <= 0) {
    return {
      costoTotalUSD: 0,
      costoTotalARS: 0,
      costoHogarUSD: 0,
      costoPublicoUSD: 0,
      energiaTotalKwh: 0,
      detalle: "Ingresá valores válidos de kilómetros y eficiencia.",
    };
  }

  if (tarifaHogarUSD < 0 || tarifaPublicoUSD < 0) {
    return {
      costoTotalUSD: 0,
      costoTotalARS: 0,
      costoHogarUSD: 0,
      costoPublicoUSD: 0,
      energiaTotalKwh: 0,
      detalle: "Las tarifas no pueden ser negativas.",
    };
  }

  // Porcentaje hogar entre 0 y 100
  const porcHogarClamped = Math.min(100, Math.max(0, porcHogar));
  const porcPublico = 100 - porcHogarClamped;

  // Energía total consumida por año
  // Fórmula: km/año × eficiencia(kWh/100km) / 100
  const energiaTotalKwh = (kmAnio * eficiencia) / 100;

  // Distribución de energía por modalidad
  const energiaHogarKwh = energiaTotalKwh * (porcHogarClamped / 100);
  const energiaPublicoKwh = energiaTotalKwh * (porcPublico / 100);

  // Costos en USD
  // Tarifa nocturna hogar referencia: USD 0,03-0,05/kWh (ENRE 2026)
  const costoHogarUSD = energiaHogarKwh * tarifaHogarUSD;

  // Tarifa cargador público referencia: USD 0,12-0,28/kWh (operadores 2026)
  const costoPublicoUSD = energiaPublicoKwh * tarifaPublicoUSD;

  const costoTotalUSD = costoHogarUSD + costoPublicoUSD;
  const costoTotalARS = costoTotalUSD * tipoCambio;

  // Texto detalle
  const detalle =
    `Energía total: ${energiaTotalKwh.toFixed(0)} kWh/año. ` +
    `Hogar (${porcHogarClamped}%): ${energiaHogarKwh.toFixed(0)} kWh × USD ${tarifaHogarUSD.toFixed(3)}/kWh = USD ${costoHogarUSD.toFixed(2)}. ` +
    `Público (${porcPublico}%): ${energiaPublicoKwh.toFixed(0)} kWh × USD ${tarifaPublicoUSD.toFixed(3)}/kWh = USD ${costoPublicoUSD.toFixed(2)}. ` +
    `Tipo de cambio: $${tipoCambio.toLocaleString("es-AR")}/USD.`;

  return {
    costoTotalUSD: Math.round(costoTotalUSD * 100) / 100,
    costoTotalARS: Math.round(costoTotalARS),
    costoHogarUSD: Math.round(costoHogarUSD * 100) / 100,
    costoPublicoUSD: Math.round(costoPublicoUSD * 100) / 100,
    energiaTotalKwh: Math.round(energiaTotalKwh * 10) / 10,
    detalle,
  };
}
