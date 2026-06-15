/**
 * Impuesto de Alcabala — Perú 2026.
 * Tasa 3% sobre la base imponible que EXCEDE las 10 UIT inafectas.
 * - Tasa y tramo inafecto: Art. 25 del TUO de la Ley de Tributación Municipal (DS 156-2004-EF).
 * - Base imponible = mayor entre valor de transferencia y autovalúo (ajustado por IPM): Art. 24.
 * - A cargo exclusivo del comprador, sin pacto en contrario: Art. 25.
 * - UIT 2026 = S/ 5.500 (DS 301-2025-EF) → tramo inafecto 10 UIT = S/ 55.000.
 * Lo recauda la municipalidad provincial / SAT (Art. 29).
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// Parámetros del impuesto de alcabala. Fuente: Art. 25 TUO Ley Trib. Municipal (DS 156-2004-EF).
const TASA_ALCABALA = 0.03;     // 3% sobre el exceso de las 10 UIT
const UIT_INAFECTAS = 10;       // primeras 10 UIT del valor del inmueble inafectas

export interface Inputs {
  valorTransferencia: number;   // precio pactado de compraventa (S/)
  autovaluo?: number;           // valor de autovalúo del inmueble (S/), opcional
  primeraVenta?: string;        // 'si' = primera venta de constructora (solo grava terreno)
  valorTerreno?: number;        // valor del terreno (S/), solo si es primera venta de constructora
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valorTransferencia = Number(i.valorTransferencia) || 0;
  // autovalúo: '' / null / undefined → no informado (se ignora, queda el de transferencia)
  const autoRaw = i.autovaluo;
  const autovaluo =
    autoRaw === '' || autoRaw === null || autoRaw === undefined ? 0 : Number(autoRaw) || 0;
  const esPrimeraVenta = String(i.primeraVenta || 'no') === 'si';
  const terrRaw = i.valorTerreno;
  const valorTerreno =
    terrRaw === '' || terrRaw === null || terrRaw === undefined ? 0 : Number(terrRaw) || 0;

  if (valorTransferencia <= 0) throw new Error('Ingresá el valor de transferencia del inmueble');
  if (esPrimeraVenta && valorTerreno <= 0) {
    throw new Error('Para la primera venta de constructora, ingresá el valor del terreno');
  }
  if (valorTerreno > valorTransferencia) {
    throw new Error('El valor del terreno no puede superar el valor de transferencia');
  }

  const uit = PERU_2026.uit;                 // S/ 5.500 (2026)
  const tramoInafecto = UIT_INAFECTAS * uit; // S/ 55.000

  // Base imponible: el MAYOR entre valor de transferencia y autovalúo (Art. 24).
  // Excepción: en primera venta de constructora solo grava el valor del TERRENO
  // (la construcción está inafecta — Art. 22), comparado igual contra el autovalúo del terreno
  // cuando aplica; aquí tomamos el mayor entre el valor de terreno informado y el autovalúo.
  const baseComparacion = esPrimeraVenta ? valorTerreno : valorTransferencia;
  const baseImponible = Math.max(baseComparacion, autovaluo);

  // Tramo gravado = lo que excede las 10 UIT. El alcabala recae sobre ese exceso.
  const tramoGravado = Math.max(0, baseImponible - tramoInafecto);
  const impuesto = tramoGravado * TASA_ALCABALA;
  // Redondeo half-up estable (evita que 2.835 → "2.83" por la repr. binaria del float).
  const tasaEfectiva =
    baseImponible > 0 ? Math.round((impuesto / baseImponible) * 10000) / 100 : 0;

  // ¿Qué valor se usó como base y por qué?
  let baseExplicada: string;
  if (esPrimeraVenta) {
    baseExplicada = `valor del terreno (${fmtPEN(baseComparacion)}); la construcción está inafecta`;
  } else if (autovaluo > valorTransferencia) {
    baseExplicada = `autovalúo (${fmtPEN(autovaluo)}), mayor que el valor de transferencia`;
  } else {
    baseExplicada = `valor de transferencia (${fmtPEN(valorTransferencia)})`;
  }

  const exento = impuesto <= 0;
  const _insight = exento
    ? {
        title: 'No pagás alcabala',
        text: `La base imponible (**${fmtPEN(baseImponible)}**) no supera el tramo inafecto de **10 UIT = ${fmtPEN(tramoInafecto)}** (UIT 2026 S/ 5.500). Como el alcabala solo grava el exceso de las 10 UIT, en este caso **no corresponde pagar nada**. Igual conviene presentar la liquidación en la municipalidad o SAT.`,
        tone: 'good',
        icon: '✅',
      }
    : {
        title: 'Alcabala a pagar (lo paga el comprador)',
        text: `Sobre una base de **${fmtPEN(baseImponible)}**, se descuentan las **10 UIT inafectas (${fmtPEN(tramoInafecto)})** y el 3% se aplica al exceso de **${fmtPEN(tramoGravado)}**: total a pagar **${fmtPEN(impuesto)}**. Es de **cargo exclusivo del comprador** (sin pacto en contrario) y vence el último día hábil del mes siguiente a la transferencia.`,
        tone: impuesto > 30000 ? 'warn' : 'info',
        icon: '📜',
      };

  const _chart = {
    type: 'bar',
    bars: [
      { label: 'Tramo inafecto (10 UIT)', value: Math.round(Math.min(baseImponible, tramoInafecto)) },
      { label: 'Tramo gravado al 3%', value: Math.round(tramoGravado) },
    ].filter((b) => b.value > 0),
    prefix: 'S/ ',
    ariaLabel: `De una base de ${fmtPEN(baseImponible)}, ${fmtPEN(Math.min(baseImponible, tramoInafecto))} están inafectos y ${fmtPEN(tramoGravado)} pagan alcabala del 3% (${fmtPEN(impuesto)}).`,
  };

  return {
    impuesto: fmtPEN(impuesto),
    baseImponible: fmtPEN(baseImponible),
    tramoInafecto: fmtPEN(tramoInafecto),
    tramoGravado: fmtPEN(tramoGravado),
    tasaEfectiva: tasaEfectiva.toFixed(2) + '%',
    baseUsada: baseExplicada,
    detalle: exento
      ? `Base ${fmtPEN(baseImponible)} ≤ 10 UIT (${fmtPEN(tramoInafecto)}) → alcabala S/ 0.`
      : `(${fmtPEN(baseImponible)} − ${fmtPEN(tramoInafecto)}) × 3% = ${fmtPEN(impuesto)} · lo paga el comprador.`,
    _insight,
    _chart,
  };
}
