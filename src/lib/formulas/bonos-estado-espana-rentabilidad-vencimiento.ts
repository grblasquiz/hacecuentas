export interface Inputs {
  nominal: number;                   // €, múltiplos de 1.000
  precio_compra: number;             // % del nominal, ej: 98.5
  cupon_pct: number;                 // % anual fijo
  plazo_anios: number;               // 3 | 5 | 10 | 15 | 30
  base_imponible_ahorro: number;     // € rend. capital mobiliario anuales estimados
}

export interface Outputs {
  cupon_bruto_anual: number;         // €
  retencion_anual: number;           // €
  cupon_neto_anual: number;          // €
  total_cupones_brutos: number;      // €
  total_cupones_netos: number;       // €
  ganancia_perdida_capital: number;  // €
  tir_bruta_pct: number;             // %
  tir_neta_pct: number;              // %
  tipo_marginal_ahorro_pct: number;  // %
  impuesto_ganancia_capital: number; // €
  precio_compra_euros: number;       // €
  duracion_modificada: number;       // años
  alerta_tipo: string;               // texto informativo
  _insight?: any;
  _chart?: any;
}

// ---------------------------------------------------------------------------
// Constantes IRPF 2026 — Base imponible del ahorro
// Fuente: Ley 35/2006 IRPF, art. 66 y ss. (vigente 2026)
// ---------------------------------------------------------------------------
const TRAMOS_AHORRO_2026: Array<{ hasta: number; tipo: number }> = [
  { hasta: 6000,    tipo: 0.19 },
  { hasta: 50000,   tipo: 0.21 },
  { hasta: 200000,  tipo: 0.23 },
  { hasta: 300000,  tipo: 0.27 },
  { hasta: Infinity, tipo: 0.28 },
];

// Retención a cuenta art. 101 LIRPF — cupones renta fija
const RETENCION_CUPON = 0.19;

/**
 * Devuelve el tipo marginal del ahorro para una base imponible dada.
 * Se usa el tipo del tramo al que pertenece la cantidad total acumulada.
 */
function tipoMarginalAhorro(base: number): number {
  for (const tramo of TRAMOS_AHORRO_2026) {
    if (base <= tramo.hasta) return tramo.tipo;
  }
  return 0.28;
}

/**
 * Calcula la TIR por bisección numérica.
 * Precio = Σ [C / (1+r)^t] + Nominal / (1+r)^N
 * Precisión: ±0,00001 (converge en <60 iteraciones)
 */
function calcularTIR(
  precioEuros: number,
  cuponEuros: number,
  nominal: number,
  anios: number
): number {
  const flujos: number[] = [];
  for (let t = 1; t <= anios; t++) {
    flujos.push(t === anios ? cuponEuros + nominal : cuponEuros);
  }

  function npv(r: number): number {
    return flujos.reduce((acc, f, idx) => acc + f / Math.pow(1 + r, idx + 1), 0) - precioEuros;
  }

  let lo = -0.5;
  let hi = 10.0;
  // Si no hay solución en el rango, devolver cupón como aproximación
  if (npv(lo) * npv(hi) > 0) {
    return cuponEuros / precioEuros;
  }
  let mid = 0;
  for (let i = 0; i < 100; i++) {
    mid = (lo + hi) / 2;
    const v = npv(mid);
    if (Math.abs(v) < 0.0001) break;
    if (v > 0) lo = mid; else hi = mid;
  }
  return mid;
}

/**
 * Calcula la duración de Macaulay y la duración modificada.
 * Duración Macaulay = Σ [t * FlujoActualizado_t] / Precio
 * Duración Modificada = Macaulay / (1 + TIR)
 */
function calcularDuracionModificada(
  precioEuros: number,
  cuponEuros: number,
  nominal: number,
  anios: number,
  tir: number
): number {
  let sumaPonderada = 0;
  for (let t = 1; t <= anios; t++) {
    const flujo = t === anios ? cuponEuros + nominal : cuponEuros;
    sumaPonderada += t * (flujo / Math.pow(1 + tir, t));
  }
  const macaulay = sumaPonderada / precioEuros;
  return macaulay / (1 + tir);
}

export function compute(i: Inputs): Outputs {
  // --- Saneado de inputs ---
  const nominal = Math.max(1000, Math.round(i.nominal / 1000) * 1000);
  const precioPct = Math.min(150, Math.max(50, i.precio_compra));
  const cuponPct = Math.min(20, Math.max(0, i.cupon_pct));
  const plazo = [3, 5, 10, 15, 30].includes(i.plazo_anios) ? i.plazo_anios : 5;
  const baseAhorro = Math.max(0, i.base_imponible_ahorro);

  // --- Precio efectivo de compra ---
  const precioCompraEuros = nominal * (precioPct / 100);

  // --- Cupón anual ---
  const cuponBrutoAnual = nominal * (cuponPct / 100);
  const retencionAnual = cuponBrutoAnual * RETENCION_CUPON;
  const cuponNetoAnual = cuponBrutoAnual - retencionAnual;

  // --- Totales a lo largo del plazo ---
  const totalCuponesBrutos = cuponBrutoAnual * plazo;
  const totalCuponesNetos = cuponNetoAnual * plazo;

  // --- Ganancia o pérdida de capital al vencimiento ---
  // Tributación: rendimiento del capital mobiliario (art. 25.2 LIRPF)
  const gananciaCapital = nominal - precioCompraEuros;

  // Tipo marginal aplicable a la base total estimada
  // (sumamos el cupón bruto anual a la base para estimar el tramo marginal)
  const baseTotal = baseAhorro + cuponBrutoAnual;
  const tipoMarginal = tipoMarginalAhorro(baseTotal);

  // Impuesto sobre ganancia de capital (solo si hay ganancia positiva;
  // las pérdidas se compensan con otros rendimientos del ahorro)
  const impuestoGananciaCapital = gananciaCapital > 0
    ? gananciaCapital * tipoMarginal
    : gananciaCapital * tipoMarginal; // pérdida genera ahorro fiscal (valor negativo)

  // --- TIR bruta ---
  const tirBruta = calcularTIR(precioCompraEuros, cuponBrutoAnual, nominal, plazo);

  // --- TIR neta estimada ---
  // Aproximación: aplicamos tipo marginal a cupones y ganancia de capital
  const cuponNetoParaTIR = cuponBrutoAnual * (1 - tipoMarginal);
  // Ajuste por impuesto sobre ganancia/pérdida de capital al vencimiento
  const nominalNetoFiscal = nominal - (gananciaCapital > 0 ? gananciaCapital * tipoMarginal : 0);
  const tirNeta = calcularTIR(precioCompraEuros, cuponNetoParaTIR, nominalNetoFiscal, plazo);

  // --- Duración modificada (con TIR bruta) ---
  const durMod = tirBruta > -0.99
    ? calcularDuracionModificada(precioCompraEuros, cuponBrutoAnual, nominal, plazo, tirBruta)
    : 0;

  // --- Etiqueta tipo de instrumento ---
  let alertaTipo: string;
  if (plazo <= 5) {
    alertaTipo = `Bono del Estado a ${plazo} años. Duración modificada ${durMod.toFixed(2)}: por cada subida de 1 % en tipos, el precio de mercado cae ~${durMod.toFixed(2)} %.`;
  } else {
    alertaTipo = `Obligación del Estado a ${plazo} años. Duración modificada ${durMod.toFixed(2)}: alta sensibilidad a subidas de tipos. Por cada +1 % en tipos, el precio cae ~${durMod.toFixed(2)} %.`;
  }

  const tirBrutaPct = Math.round(tirBruta * 10000) / 100;
  const tirNetaPct = Math.round(tirNeta * 10000) / 100;
  const tipoMarginalPct = Math.round(tipoMarginal * 10000) / 100;

  // --- Insight narrativo ---
  const fmtEUR = (n: number) => Math.round(n).toLocaleString('es-ES') + ' €';
  const detalleCapital = gananciaCapital > 0
    ? ` Al comprar al ${precioPct}% (bajo par), al vencimiento embolsas **${fmtEUR(gananciaCapital)}** de plusvalía además de los cupones.`
    : gananciaCapital < 0
      ? ` Compras sobre par (${precioPct}%), así que asumes **${fmtEUR(-gananciaCapital)}** de minusvalía al vencimiento que recorta tu rentabilidad.`
      : '';
  const tone = tirNetaPct <= 0 ? 'warn' : tirNetaPct >= 4 ? 'good' : 'neutral';
  const _insight = {
    title: 'Rentabilidad real tras impuestos',
    text: `Este bono a ${plazo} años rinde un **${tirBrutaPct.toFixed(2)}% TIR bruta**, que baja a **${tirNetaPct.toFixed(2)}% neta** tras aplicar tu tipo marginal del ahorro (${tipoMarginalPct.toFixed(0)}%).${detalleCapital} Su duración modificada de **${durMod.toFixed(2)}** indica que ante una subida de 1% en los tipos el precio caería ~${durMod.toFixed(2)}%.`,
    tone,
    icon: '📈'
  };

  // --- Gráfico: gauge de TIR neta por zonas ---
  const markerTir = tirNetaPct;
  const gaugeMin = Math.min(-2, Math.floor(markerTir - 1));
  const _chart = {
    type: 'scale',
    marker: markerTir,
    markerLabel: `${tirNetaPct.toFixed(2)}% neta`,
    min: gaugeMin,
    segments: [
      { nombre: 'Pérdida', max: 0, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Baja', max: 2, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Moderada', max: 4, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Buena', max: 6, color: '#22c55e', colorDark: '#15803d' },
      { nombre: 'Alta', max: Math.max(8, Math.ceil(markerTir + 1)), color: '#16a34a', colorDark: '#166534' }
    ],
    ariaLabel: `Termómetro de rentabilidad neta: ${tirNetaPct.toFixed(2)}% anual tras impuestos, sobre una escala de zonas de pérdida a alta.`
  };

  return {
    cupon_bruto_anual: Math.round(cuponBrutoAnual * 100) / 100,
    retencion_anual: Math.round(retencionAnual * 100) / 100,
    cupon_neto_anual: Math.round(cuponNetoAnual * 100) / 100,
    total_cupones_brutos: Math.round(totalCuponesBrutos * 100) / 100,
    total_cupones_netos: Math.round(totalCuponesNetos * 100) / 100,
    ganancia_perdida_capital: Math.round(gananciaCapital * 100) / 100,
    tir_bruta_pct: tirBrutaPct,       // a porcentaje con 2 decimales
    tir_neta_pct: tirNetaPct,
    tipo_marginal_ahorro_pct: tipoMarginalPct,
    impuesto_ganancia_capital: Math.round(impuestoGananciaCapital * 100) / 100,
    precio_compra_euros: Math.round(precioCompraEuros * 100) / 100,
    duracion_modificada: Math.round(durMod * 100) / 100,
    alerta_tipo: alertaTipo,
    _insight,
    _chart,
  };
}
