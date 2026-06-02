export interface Inputs {
  moneda: string;
  frecuenciaBanio: string;
  frecuenciaGrooming: string;
  costoBanioProf: number;
  costoGroomingProf: number;
  costoChampuAnual: number;
  costoCortaunias: number;
  minutosCepilladoDiario: number;
  minutosBanioEnCasa: number;
}

export interface Outputs {
  costoAnualTotal: number;
  costoGroomingAnual: number;
  costoBanioAnual: number;
  costoProductosAnual: number;
  sesionesGroomingAnual: number;
  sesioniesBanioAnual: number;
  horasCuidadoAnual: number;
  minutosCuidadoSemanal: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const SEMANAS_ANIO = 52;
  const DIAS_ANIO = 365;

  // Frecuencias en semanas
  const freqBanioSem = Math.max(1, Number(i.frecuenciaBanio) || 4);
  const freqGroomingSem = Math.max(1, Number(i.frecuenciaGrooming) || 8);

  // Costos unitarios (defensivo: nunca negativos)
  const costoBanioProf = Math.max(0, Number(i.costoBanioProf) || 0);
  const costoGroomingProf = Math.max(0, Number(i.costoGroomingProf) || 0);
  const costoChampuAnual = Math.max(0, Number(i.costoChampuAnual) || 0);
  const costoCortaunias = Math.max(0, Number(i.costoCortaunias) || 0);

  // Tiempo
  const minCepilladoDiario = Math.max(0, Number(i.minutosCepilladoDiario) || 0);
  const minBanioEnCasa = Math.max(0, Number(i.minutosBanioEnCasa) || 0);

  // --- Frecuencias anuales ---
  const sesioniesBanioAnual = Math.floor(SEMANAS_ANIO / freqBanioSem);
  const sesionesGroomingAnual = Math.floor(SEMANAS_ANIO / freqGroomingSem);

  // --- Costos ---
  const costoBanioAnual = sesioniesBanioAnual * costoBanioProf;
  const costoGroomingAnual = sesionesGroomingAnual * costoGroomingProf;
  const costoProductosAnual = costoChampuAnual + costoCortaunias;
  const costoAnualTotal = costoBanioAnual + costoGroomingAnual + costoProductosAnual;

  // --- Tiempo en casa ---
  // Cepillado diario en horas
  const horasCepilladoAnual = (minCepilladoDiario * DIAS_ANIO) / 60;
  // Banos en casa (asumimos que si hay costo de baño profesional el dueño no lo hace en casa,
  // pero el tiempo de preparacion/secado puede existir; aqui modelamos el tiempo de bano completo
  // solo cuando costoBanioProf === 0, es decir, baño en casa)
  const horasBanioAnual = costoBanioProf === 0
    ? (minBanioEnCasa * sesioniesBanioAnual) / 60
    : 0;
  const horasCuidadoAnual = horasCepilladoAnual + horasBanioAnual;
  const minutosCuidadoSemanal = (horasCuidadoAnual * 60) / SEMANAS_ANIO;

  // --- Símbolo de moneda ---
  const simbolos: Record<string, string> = {
    USD: "USD",
    ARS: "ARS",
    EUR: "EUR",
    MXN: "MXN",
    CLP: "CLP",
  };
  const moneda = simbolos[i.moneda] ?? i.moneda;

  // --- Resumen textual ---
  const banioLabel = costoBanioProf > 0
    ? `${sesioniesBanioAnual} baños profesionales/año`
    : `${sesioniesBanioAnual} baños en casa/año`;
  const resumen =
    `${banioLabel}, ${sesionesGroomingAnual} sesiones de grooming profesional/año. ` +
    `Tiempo en casa: ${horasCuidadoAnual.toFixed(1)} h/año (≈ ${minutosCuidadoSemanal.toFixed(0)} min/semana). ` +
    `Costo anual total: ${moneda} ${costoAnualTotal.toFixed(2)}.`;

  // --- Insight + gráfico ---
  const costoMensual = costoAnualTotal / 12;
  const partesCosto = [
    { label: 'Grooming', value: Math.round(costoGroomingAnual) },
    { label: 'Baños', value: Math.round(costoBanioAnual) },
    { label: 'Productos', value: Math.round(costoProductosAnual) },
  ];
  const partesOrdenadas = [...partesCosto].sort((a, b) => b.value - a.value);
  const _insight = {
    title: 'Costo de cuidar a tu persa',
    text: `Mantener el pelaje de tu gato persa cuesta **${moneda} ${costoAnualTotal.toFixed(0)}/año** (≈ ${moneda} ${costoMensual.toFixed(0)}/mes). Lo que más pesa: **${partesOrdenadas[0].label}**. Sumá ${horasCuidadoAnual.toFixed(0)} h/año de cepillado y baño en casa.`,
    tone: 'neutral',
    icon: '🐱',
  };
  const slicesCosto = partesCosto.filter(p => p.value > 0);
  const _chart = (costoAnualTotal > 0 && slicesCosto.length >= 2) ? {
    type: 'doughnut',
    slices: slicesCosto,
    prefix: `${moneda} `,
    centerValue: `${moneda} ${costoAnualTotal.toFixed(0)}`,
    centerLabel: 'por año',
    ariaLabel: `Desglose del costo anual de grooming del gato persa: ${slicesCosto.map(p => `${p.label} ${moneda} ${p.value}`).join(', ')}.`,
  } : undefined;

  return {
    costoAnualTotal,
    costoGroomingAnual,
    costoBanioAnual,
    costoProductosAnual,
    sesionesGroomingAnual,
    sesioniesBanioAnual,
    horasCuidadoAnual,
    minutosCuidadoSemanal,
    resumen,
    _insight,
    _chart,
  };
}
