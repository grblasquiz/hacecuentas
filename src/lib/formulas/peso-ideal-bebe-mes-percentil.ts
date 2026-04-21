/** Peso-para-edad pediátrico — OMS Child Growth Standards 2006 (LMS oficial). */
import { WFA_BOYS_L, WFA_BOYS_M, WFA_BOYS_S, WFA_GIRLS_L, WFA_GIRLS_M, WFA_GIRLS_S, WFA_MAX_DAYS } from './_oms-wfa-lms';

export interface Inputs {
  edadMeses: number;
  sexo: string;
  pesoActual?: number;
}
export interface Outputs {
  pesoMediana: number;
  rangoNormal: string;
  percentilBebe: string;
  detalle: string;
}

// Días por mes promedio (gregoriano): 365.25 / 12 = 30.4375.
const DIAS_POR_MES = 30.4375;

// Normal CDF — aproximación Abramowitz & Stegun 26.2.17 (error < 7.5e-8).
function normalCdf(z: number): number {
  if (z > 8) return 1;
  if (z < -8) return 0;
  const b1 = 0.319381530, b2 = -0.356563782, b3 = 1.781477937, b4 = -1.821255978, b5 = 1.330274429;
  const p = 0.2316419, c = 0.39894228;
  const az = Math.abs(z);
  const t = 1 / (1 + p * az);
  const phi = c * Math.exp(-az * az / 2) * (t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5)))));
  return z >= 0 ? 1 - phi : phi;
}

/** Inverso aproximado de la normal — Beasley-Springer-Moro para p ∈ (0,1). */
function inverseNormal(p: number): number {
  if (p <= 0) return -8;
  if (p >= 1) return 8;
  // Rational approximation (Beasley-Springer 1977).
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const cc = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const dd = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((cc[0] * q + cc[1]) * q + cc[2]) * q + cc[3]) * q + cc[4]) * q + cc[5]) / ((((dd[0] * q + dd[1]) * q + dd[2]) * q + dd[3]) * q + 1);
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((cc[0] * q + cc[1]) * q + cc[2]) * q + cc[3]) * q + cc[4]) * q + cc[5]) / ((((dd[0] * q + dd[1]) * q + dd[2]) * q + dd[3]) * q + 1);
}

/** Busca L, M, S interpolando entre días enteros del array. Day es float ≥ 0. */
function lookupLMS(sexo: string, dayFloat: number): { L: number; M: number; S: number } {
  const d = Math.max(0, Math.min(WFA_MAX_DAYS, dayFloat));
  const arrL = sexo === 'f' ? WFA_GIRLS_L : WFA_BOYS_L;
  const arrM = sexo === 'f' ? WFA_GIRLS_M : WFA_BOYS_M;
  const arrS = sexo === 'f' ? WFA_GIRLS_S : WFA_BOYS_S;
  const lo = Math.floor(d);
  const hi = Math.min(WFA_MAX_DAYS, lo + 1);
  const frac = d - lo;
  return {
    L: arrL[lo] + frac * (arrL[hi] - arrL[lo]),
    M: arrM[lo] + frac * (arrM[hi] - arrM[lo]),
    S: arrS[lo] + frac * (arrS[hi] - arrS[lo]),
  };
}

/** Peso en kg correspondiente a un percentil dado, según LMS OMS. */
function weightAtPercentile(L: number, M: number, S: number, pct: number): number {
  const z = inverseNormal(pct / 100);
  if (Math.abs(L) < 1e-9) return M * Math.exp(S * z);
  return M * Math.pow(1 + L * S * z, 1 / L);
}

export function pesoIdealBebeMesPercentil(i: Inputs): Outputs {
  const mes = Number(i.edadMeses);
  const sexo = String(i.sexo || 'm');
  const pesoActual = Number(i.pesoActual) || 0;

  if (!isFinite(mes) || mes < 0 || mes > 60) {
    throw new Error('La edad debe estar entre 0 y 60 meses (5 años)');
  }
  if (pesoActual < 0) throw new Error('El peso no puede ser negativo');

  const dayFloat = mes * DIAS_POR_MES;
  const { L, M, S } = lookupLMS(sexo, dayFloat);

  const p3 = weightAtPercentile(L, M, S, 3);
  const p15 = weightAtPercentile(L, M, S, 15);
  const p50 = M; // por definición LMS, M es la mediana.
  const p85 = weightAtPercentile(L, M, S, 85);
  const p97 = weightAtPercentile(L, M, S, 97);

  const pesoMediana = Number(p50.toFixed(2));
  const rangoNormal = `${p15.toFixed(2)} – ${p85.toFixed(2)} kg (p15–p85)`;

  let percentilBebe = 'No ingresaste el peso actual';
  if (pesoActual > 0) {
    // Z-score exacto del bebé.
    const z = Math.abs(L) < 1e-9
      ? Math.log(pesoActual / M) / S
      : (Math.pow(pesoActual / M, L) - 1) / (L * S);
    const percentil = normalCdf(z) * 100;
    const pRound = Math.round(percentil * 10) / 10;

    let label: string;
    if (percentil < 3) label = 'Bajo peso — Consultá al pediatra';
    else if (percentil < 15) label = 'Rango bajo — Vigilar';
    else if (percentil < 85) label = 'Normal';
    else if (percentil < 97) label = 'Rango alto — Vigilar';
    else label = 'Peso elevado — Consultá al pediatra';

    percentilBebe = `Percentil ${pRound} — ${label}`;
  }

  const sexoLabel = sexo === 'f' ? 'niña' : 'niño';
  const mesLabel = Number.isInteger(mes) ? `${mes}` : mes.toFixed(1);
  const detalle =
    `${sexoLabel} de ${mesLabel} meses | ` +
    `Mediana (p50): ${p50.toFixed(2)} kg | ` +
    `Rango p15-p85: ${p15.toFixed(2)}–${p85.toFixed(2)} kg | ` +
    `Rango p3-p97: ${p3.toFixed(2)}–${p97.toFixed(2)} kg` +
    (pesoActual > 0 ? ` | Peso actual: ${pesoActual} kg → ${percentilBebe}` : '') +
    '. Tablas LMS oficiales OMS Child Growth Standards 2006.';

  return {
    pesoMediana,
    rangoNormal,
    percentilBebe,
    detalle,
  };
}
