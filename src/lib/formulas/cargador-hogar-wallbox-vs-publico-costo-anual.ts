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
  _insight?: any;
  _chart?: any;
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

  // Comparación: cuánto costaría cargar el 100% en público vs. la mezcla elegida.
  const costoTodoPublicoUSD = energiaTotalKwh * tarifaPublicoUSD;
  const ahorroVsPublicoUSD = costoTodoPublicoUSD - costoTotalUSD;
  const ahorroPct = costoTodoPublicoUSD > 0 ? (ahorroVsPublicoUSD / costoTodoPublicoUSD) * 100 : 0;
  const fmtUSD = (v: number) => `USD ${v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const _insight = {
    title: 'Hogar vs. cargador público',
    text: ahorroVsPublicoUSD > 1
      ? `Cargar el **${porcHogarClamped}%** en casa baja tu cuenta anual a **${fmtUSD(costoTotalUSD)}**. Frente a depender 100% de cargadores públicos (${fmtUSD(costoTodoPublicoUSD)}), te ahorrás **${fmtUSD(ahorroVsPublicoUSD)}** al año (**${ahorroPct.toFixed(0)}%**).`
      : `Con esta mezcla gastás **${fmtUSD(costoTotalUSD)}** al año en ${energiaTotalKwh.toFixed(0)} kWh. Subí el porcentaje cargado en casa para abaratar: la tarifa hogar (USD ${tarifaHogarUSD.toFixed(3)}) suele ser una fracción de la pública (USD ${tarifaPublicoUSD.toFixed(3)}).`,
    tone: ahorroVsPublicoUSD > 1 ? 'good' : 'neutral',
    icon: '🔌',
  };

  // Donut: el costo anual se reparte entre carga en casa y carga pública (suman el total).
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Hogar (${porcHogarClamped}%)`, value: Math.round(costoHogarUSD * 100) / 100 },
      { label: `Público (${porcPublico}%)`, value: Math.round(costoPublicoUSD * 100) / 100 },
    ],
    prefix: 'USD ',
    centerValue: fmtUSD(costoTotalUSD),
    centerLabel: 'Costo/año',
    ariaLabel: `De ${fmtUSD(costoTotalUSD)} anuales, ${fmtUSD(costoHogarUSD)} son de carga en casa y ${fmtUSD(costoPublicoUSD)} de carga pública.`,
  };

  return {
    costoTotalUSD: Math.round(costoTotalUSD * 100) / 100,
    costoTotalARS: Math.round(costoTotalARS),
    costoHogarUSD: Math.round(costoHogarUSD * 100) / 100,
    costoPublicoUSD: Math.round(costoPublicoUSD * 100) / 100,
    energiaTotalKwh: Math.round(energiaTotalKwh * 10) / 10,
    detalle,
    _insight,
    _chart,
  };
}
