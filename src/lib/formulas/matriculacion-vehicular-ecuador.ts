/**
 * Matriculación vehicular — ECUADOR 2026 (país dolarizado, montos en USD "$").
 *
 * Estima el valor total de la matrícula sumando:
 *   1) IPVM  — Impuesto a la Propiedad de Vehículos Motorizados (SRI), tabla progresiva 7 tramos.
 *   2) Impuesto al rodaje municipal (COOTAD Art. 539), tabla por avalúo.
 *   3) SPPAT — Seguro Público para Pago de Accidentes de Tránsito (ANT).
 *   4) Tasa de matriculación / servicios ANT.
 *   5) RTV — Revisión Técnica Vehicular (varía por cantón).
 *
 * Avalúo: para autos usados, el SRI deprecia el PVP inicial al 20% anual,
 * con piso del 10% del precio informado inicialmente.
 *
 * Fuentes:
 *  - IPVM (tabla 7 tramos 0,5%–6%): SRI, https://www.sri.gob.ec/en/impuestos-vehiculares, 2026.
 *  - Depreciación 20%/año, piso 10% PVP: SRI, https://www.ecuadorlegalonline.com/sri/impuesto-propiedad-vehiculos-sri/, 2026.
 *  - Impuesto al rodaje (COOTAD Art. 539, tabla $0–$70): El Universo / oficial.ec, 2026.
 *  - SPPAT (Norma Técnica SPPAT, tasa por clase): automóvil particular ~$26,74 (1500–2499cc, 0–9 años;
 *    rango $21,11–$31,67), moto ~$24,63 ($19,71–$30,26). Fuente: SPPAT, https://www.sppat.gob.ec/, 2025.
 *  - Tasa ANT ~$29 liviano particular y RTV ~$30 (Quito $31,56 / Guayaquil $29,87): ANT/AMT/ATM, 2026.
 */

export interface Inputs {
  pvp: number;            // precio de venta al público (avalúo SRI del modelo) en USD
  anioModelo: number;     // año del modelo del vehículo
  tipoVehiculo?: 'particular' | 'comercial' | 'moto'; // por defecto particular
  canton?: 'quito' | 'guayaquil' | 'cuenca' | 'otro';  // determina la RTV referencial
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// ── Datos 2026 ────────────────────────────────────────────────────────────────

const ANIO_FISCAL = 2026;

// IPVM — Impuesto a la Propiedad de Vehículos Motorizados (SRI). Tabla progresiva.
// fuente: SRI, https://www.sri.gob.ec/en/impuestos-vehiculares, 2026
const IPVM_TABLA: { desde: number; hasta: number; base: number; pct: number }[] = [
  { desde: 0,     hasta: 4000,     base: 0,   pct: 0.005 },
  { desde: 4000,  hasta: 8000,     base: 20,  pct: 0.010 },
  { desde: 8000,  hasta: 12000,    base: 60,  pct: 0.020 },
  { desde: 12000, hasta: 16000,    base: 140, pct: 0.030 },
  { desde: 16000, hasta: 20000,    base: 260, pct: 0.040 },
  { desde: 20000, hasta: 24000,    base: 420, pct: 0.050 },
  { desde: 24000, hasta: Infinity, base: 620, pct: 0.060 },
];

// Impuesto al rodaje municipal (COOTAD Art. 539). Tarifa fija por tramo de avalúo.
// fuente: COOTAD Art. 539 — El Universo, https://www.eluniverso.com/guayaquil/comunidad/esta-es-la-tarifa-del-impuesto-al-rodaje-dispuesto-en-el-cootad-segun-avaluo-del-vehiculo-nota/, 2026
const RODAJE_TABLA: { desde: number; hasta: number; valor: number }[] = [
  { desde: 0,     hasta: 1000,     valor: 0 },   // exento
  { desde: 1000,  hasta: 4000,     valor: 5 },
  { desde: 4000,  hasta: 8000,     valor: 10 },
  { desde: 8000,  hasta: 12000,    valor: 15 },
  { desde: 12000, hasta: 16000,    valor: 20 },
  { desde: 16000, hasta: 20000,    valor: 25 },
  { desde: 20000, hasta: 30000,    valor: 30 },
  { desde: 30000, hasta: 40000,    valor: 35 },
  { desde: 40000, hasta: Infinity, valor: 70 },
];

// SPPAT — Seguro Público para Pago de Accidentes de Tránsito.
// Tasa por clase de vehículo (vehículos que NO prestan servicio público).
// fuente: Norma Técnica del SPPAT, https://www.sppat.gob.ec/, 2025
//   · Automóviles 0–9 años: $21,11 / $26,74 / $31,67 (por cilindraje) → representativo sedán $26,74
//   · Motocicletas: $19,71 / $24,63 / $30,26 → representativo $24,63
//   · Todo terreno y camionetas 0–9 años: $38,71 / $46,45 / $54,19 → usamos para "comercial/utilitario"
const SPPAT_POR_TIPO: Record<string, number> = {
  particular: 26.74,
  comercial: 46.45,
  moto: 24.63,
};

// Tasa de matriculación / servicios ANT (referencial, vehículo liviano particular).
// fuente: ANT (resoluciones de tasas), 2026
const TASA_ANT_POR_TIPO: Record<string, number> = {
  particular: 29.00,
  comercial: 29.00,
  moto: 15.00,
};

// RTV — Revisión Técnica Vehicular (referencial por cantón, vehículo liviano).
// fuente: AMT Quito $31,56 · ATM Guayaquil $29,87 · referencial otros, 2026
const RTV_POR_CANTON: Record<string, number> = {
  quito: 31.56,
  guayaquil: 29.87,
  cuenca: 29.00,
  otro: 30.00,
};

const DEPRECIACION_ANUAL = 0.20;   // 20% anual sobre el PVP (SRI)
const PISO_RESIDUAL = 0.10;        // valor residual no menor al 10% del PVP

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtUSDec(n: number): string {
  return '$' + new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

/** Avalúo SRI para el año fiscal: PVP depreciado al 20%/año, con piso del 10% del PVP.
 *  Se redondea a centavos para evitar que el ruido de punto flotante empuje un avalúo
 *  exacto (p. ej. $16.000,000000003) al tramo siguiente del IPVM o del rodaje. */
function avaluoDepreciado(pvp: number, antiguedadAnios: number): number {
  if (antiguedadAnios <= 0) return Math.round(pvp * 100) / 100; // vehículo del año
  const factor = Math.pow(1 - DEPRECIACION_ANUAL, antiguedadAnios);
  const depreciado = pvp * factor;
  const piso = pvp * PISO_RESIDUAL;
  return Math.round(Math.max(depreciado, piso) * 100) / 100;
}

/** IPVM progresivo sobre el avalúo. */
function ipvm(avaluo: number): number {
  const tramo = IPVM_TABLA.find(t => avaluo > t.desde && avaluo <= t.hasta) ?? IPVM_TABLA[0];
  if (avaluo <= 0) return 0;
  return tramo.base + (avaluo - tramo.desde) * tramo.pct;
}

/** Impuesto al rodaje municipal por tramo de avalúo (COOTAD Art. 539). */
function rodaje(avaluo: number): number {
  const tramo = RODAJE_TABLA.find(t => avaluo > t.desde && avaluo <= t.hasta) ?? RODAJE_TABLA[0];
  return avaluo <= RODAJE_TABLA[0].hasta ? 0 : tramo.valor;
}

// ── compute ────────────────────────────────────────────────────────────────

export function compute(i: Inputs): Outputs {
  const pvp = Number(i.pvp);
  const anioModelo = Number(i.anioModelo);

  if (!Number.isFinite(pvp) || pvp <= 0) {
    throw new Error('Ingresá el PVP / avalúo del vehículo (mayor a 0).');
  }
  if (!Number.isFinite(anioModelo) || anioModelo < 1950 || anioModelo > ANIO_FISCAL + 1) {
    throw new Error('Ingresá un año de modelo válido (entre 1950 y ' + (ANIO_FISCAL + 1) + ').');
  }

  const tipo = (i.tipoVehiculo && SPPAT_POR_TIPO[i.tipoVehiculo]) ? i.tipoVehiculo : 'particular';
  const canton = (i.canton && RTV_POR_CANTON[i.canton]) ? i.canton : 'otro';

  // Antigüedad para depreciación: años transcurridos respecto al año fiscal.
  const antiguedad = Math.max(0, ANIO_FISCAL - anioModelo);

  const avaluo = avaluoDepreciado(pvp, antiguedad);

  const impIPVM = ipvm(avaluo);
  const impRodaje = rodaje(avaluo);
  const sppat = SPPAT_POR_TIPO[tipo];
  const tasaANT = TASA_ANT_POR_TIPO[tipo];
  const rtv = RTV_POR_CANTON[canton];

  const total = impIPVM + impRodaje + sppat + tasaANT + rtv;

  const tasaEfectiva = avaluo > 0 ? (total / avaluo) * 100 : 0;

  const _insight = {
    title: 'Tu matrícula 2026',
    text: `Con un avalúo de **${fmtUSDec(avaluo)}** (PVP ${fmtUSDec(pvp)} depreciado ${antiguedad} año${antiguedad === 1 ? '' : 's'} al 20%), tu matrícula ${ANIO_FISCAL} suma **${fmtUSDec(total)}**. El rubro más pesado es el **IPVM** (${fmtUSDec(impIPVM)}), seguido del impuesto al rodaje (${fmtUSDec(impRodaje)}). Eso equivale al **${tasaEfectiva.toFixed(2)}%** del avalúo.`,
    tone: 'neutral' as const,
    icon: '🚗',
  };

  const _chart = {
    type: 'doughnut' as const,
    segments: [
      { label: 'IPVM (SRI)', value: Math.round(impIPVM * 100) / 100 },
      { label: 'Imp. rodaje (municipal)', value: Math.round(impRodaje * 100) / 100 },
      { label: 'SPPAT', value: Math.round(sppat * 100) / 100 },
      { label: 'Tasa ANT', value: Math.round(tasaANT * 100) / 100 },
      { label: 'RTV', value: Math.round(rtv * 100) / 100 },
    ],
    ariaLabel: `Desglose de la matrícula: IPVM ${fmtUSDec(impIPVM)}, rodaje ${fmtUSDec(impRodaje)}, SPPAT ${fmtUSDec(sppat)}, tasa ANT ${fmtUSDec(tasaANT)}, RTV ${fmtUSDec(rtv)}. Total ${fmtUSDec(total)}.`,
  };

  return {
    total: fmtUSDec(total),
    avaluo: fmtUSDec(avaluo),
    ipvm: fmtUSDec(impIPVM),
    rodaje: fmtUSDec(impRodaje),
    sppat: fmtUSDec(sppat),
    tasaANT: fmtUSDec(tasaANT),
    rtv: fmtUSDec(rtv),
    detalle: `IPVM ${fmtUSDec(impIPVM)} · Rodaje ${fmtUSDec(impRodaje)} · SPPAT ${fmtUSDec(sppat)} · Tasa ANT ${fmtUSDec(tasaANT)} · RTV ${fmtUSDec(rtv)} = Total ${fmtUSDec(total)} (avalúo ${fmtUSDec(avaluo)}).`,
    _insight,
    _chart,
  };
}
