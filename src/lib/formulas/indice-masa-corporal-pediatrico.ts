/** IMC pediátrico con percentil exacto CDC 2000 (LMS) — 2-20 años */
import { LMS_MALE, LMS_FEMALE } from './_cdc-bmi-lms';

export interface Inputs {
  peso: number;
  altura: number;
  edadAnios: number;
  sexo: string;
}
export interface Outputs {
  imc: number;
  percentilAprox: string;
  clasificacion: string;
  detalle: string;
}

// CDF de la normal estándar — aproximación Abramowitz & Stegun 26.2.17 (error < 7.5e-8).
// Usada para convertir Z-score → percentil.
function normalCdf(z: number): number {
  if (z > 8) return 1;
  if (z < -8) return 0;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;
  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const phi = c * Math.exp(-absZ * absZ / 2.0) *
    (t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5)))));
  return z >= 0 ? 1 - phi : phi;
}

// Interpolación lineal en los arrays CDC (ordenados por edadMeses ascendente).
// Busca las 2 filas que rodean la edad y devuelve L/M/S interpolados.
function lookupLMS(
  table: ReadonlyArray<readonly [number, number, number, number]>,
  edadMeses: number,
): { L: number; M: number; S: number } {
  const minAge = table[0][0];
  const maxAge = table[table.length - 1][0];
  const clamped = Math.max(minAge, Math.min(maxAge, edadMeses));
  // Binary search — las tablas están ordenadas.
  let lo = 0;
  let hi = table.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (table[mid][0] < clamped) lo = mid + 1;
    else hi = mid;
  }
  if (table[lo][0] === clamped || lo === 0) {
    const [, L, M, S] = table[lo];
    return { L, M, S };
  }
  const [aLo, Llo, Mlo, Slo] = table[lo - 1];
  const [aHi, Lhi, Mhi, Shi] = table[lo];
  const frac = (clamped - aLo) / (aHi - aLo);
  return {
    L: Llo + frac * (Lhi - Llo),
    M: Mlo + frac * (Mhi - Mlo),
    S: Slo + frac * (Shi - Slo),
  };
}

export function indiceMasaCorporalPediatrico(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edadAnios = Number(i.edadAnios);
  const sexo = String(i.sexo || 'm');

  if (!peso || peso <= 0) throw new Error('Ingresá el peso del niño/a');
  if (!altura || altura <= 0) throw new Error('Ingresá la altura en cm');
  if (edadAnios < 2 || edadAnios > 18) throw new Error('La edad debe estar entre 2 y 18 años');

  const alturaM = altura / 100;
  const imc = peso / (alturaM * alturaM);
  const edadMeses = edadAnios * 12;

  const tabla = sexo === 'f' ? LMS_FEMALE : LMS_MALE;
  const { L, M, S } = lookupLMS(tabla, edadMeses);

  // Fórmula LMS estándar (CDC / OMS): transforma IMC a Z-score.
  // L = 0 usa log (caso límite), L ≠ 0 usa transformación Box-Cox.
  const z = Math.abs(L) < 1e-9
    ? Math.log(imc / M) / S
    : (Math.pow(imc / M, L) - 1) / (L * S);
  const percentilExacto = normalCdf(z) * 100;

  // Clasificación CDC estándar: <5 bajo, 5 a <85 normal, 85 a <95 sobrepeso, ≥95 obesidad.
  let clasificacion: string;
  let percentilAprox: string;
  const pRound = Math.round(percentilExacto * 10) / 10;

  if (percentilExacto < 5) {
    clasificacion = 'Bajo peso';
    percentilAprox = `percentil ${pRound} (< P5)`;
  } else if (percentilExacto < 85) {
    clasificacion = percentilExacto < 25 ? 'Peso normal (rango bajo)'
      : percentilExacto < 75 ? 'Peso normal'
      : 'Peso normal (rango alto)';
    percentilAprox = `percentil ${pRound}`;
  } else if (percentilExacto < 95) {
    clasificacion = 'Sobrepeso';
    percentilAprox = `percentil ${pRound} (P85-P95)`;
  } else {
    clasificacion = 'Obesidad';
    percentilAprox = `percentil ${pRound} (≥ P95)`;
  }

  const detalle =
    `IMC: ${imc.toFixed(1)} kg/m² | Edad: ${edadAnios} años | Sexo: ${sexo === 'f' ? 'Femenino' : 'Masculino'} | ` +
    `Z-score: ${z.toFixed(2)} | ${percentilAprox} | Clasificación: ${clasificacion}. ` +
    `Tablas LMS oficiales CDC 2000 (bmiagerev).`;

  return {
    imc: Number(imc.toFixed(1)),
    percentilAprox,
    clasificacion,
    detalle,
  };
}
