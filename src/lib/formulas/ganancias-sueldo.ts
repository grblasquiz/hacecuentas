/**
 * Impuesto a las Ganancias — Trabajadores en relación de dependencia (4ta categoría)
 *
 * Usa los MISMOS valores y escala que la calculadora de sueldo en mano (sueldo-ar.ts)
 * para garantizar consistencia entre ambas calcs. Esta versión pone el foco en el
 * detalle del impuesto (deducciones, base, alícuota, anual vs mensual).
 *
 * Valores 2026 (aproximados — ARCA los actualiza semestralmente por RIPTE):
 *   - MNI efectivo mensual (ya incluye deducción especial 4.8×): $2.280.000
 *   - Incremento por familiar a cargo: $400.000/mes
 *
 * Base legal: Ley 20.628 + Ley 27.743 (Ley Bases 2024) + RG ARCA vigentes.
 */

export interface GananciasSueldoInputs {
  brutoMensual: number;
  conyuge: boolean | string;
  hijos: number;
  otrasDeducciones?: number;
}

export interface GananciasSueldoOutputs {
  retencionMensual: number;
  retencionAnual: number;
  brutoAnual: number;
  aportesAnuales: number;
  aportesMensuales: number;
  netoDeAportesMensual: number;
  mniEfectivoMensual: number;
  deduccionFamiliaresMensual: number;
  otrasDeduccionesMensual: number;
  mniTotalMensual: number;
  baseImponibleMensual: number;
  baseImponibleAnual: number;
  alicuotaMarginal: string;
  alicuotaEfectiva: number;
  paga: boolean;
  mensaje: string;
  umbralMensual: number; // sueldo bruto desde el que empieza a pagar
}

// Valores mensuales 2026 (mismos que sueldo-ar.ts para consistencia)
const MNI_MENSUAL_BASE = 2_280_000; // MNI + DE 4.8× prorrateado
const INCREMENTO_POR_FAMILIAR = 400_000;

/**
 * Escala mensual simplificada 2026 (5 tramos + excedente)
 * Igual que sueldo-ar.ts — ajustable cuando ARCA publique nuevos valores.
 */
interface TramoEscala {
  hasta: number;
  tasa: number;
  acumulado: number;
}

const ESCALA: TramoEscala[] = [
  { hasta: 500_000, tasa: 0.05, acumulado: 0 },
  { hasta: 1_000_000, tasa: 0.09, acumulado: 25_000 },
  { hasta: 1_500_000, tasa: 0.12, acumulado: 70_000 },
  { hasta: 2_500_000, tasa: 0.15, acumulado: 130_000 },
  { hasta: 4_000_000, tasa: 0.19, acumulado: 280_000 },
  { hasta: Infinity, tasa: 0.27, acumulado: 565_000 },
];

function aplicarEscalaMensual(base: number): { impuesto: number; marginal: number } {
  if (base <= 0) return { impuesto: 0, marginal: 0 };
  let anterior = 0;
  for (const tramo of ESCALA) {
    if (base <= tramo.hasta) {
      return {
        impuesto: tramo.acumulado + (base - anterior) * tramo.tasa,
        marginal: tramo.tasa,
      };
    }
    anterior = tramo.hasta;
  }
  const ult = ESCALA[ESCALA.length - 1];
  return { impuesto: ult.acumulado + (base - anterior) * ult.tasa, marginal: ult.tasa };
}

export function gananciasSueldo(inputs: GananciasSueldoInputs): GananciasSueldoOutputs {
  const brutoMensual = Number(inputs.brutoMensual);
  const conyuge =
    inputs.conyuge === true ||
    inputs.conyuge === 'true' ||
    inputs.conyuge === 'si' ||
    inputs.conyuge === 1;
  const hijos = Math.max(0, Math.min(10, Number(inputs.hijos) || 0));
  const otrasMensuales = Math.max(0, Number(inputs.otrasDeducciones) || 0);

  if (!brutoMensual || brutoMensual <= 0) {
    throw new Error('Ingresá un sueldo bruto mensual válido');
  }

  // Aportes personales 17%
  const aportesMensuales = brutoMensual * 0.17;
  const netoDeAportesMensual = brutoMensual - aportesMensuales;

  // Familiares a cargo (cónyuge + hijos)
  const cantidadFamiliares = (conyuge ? 1 : 0) + hijos;
  const deduccionFamiliaresMensual = cantidadFamiliares * INCREMENTO_POR_FAMILIAR;

  // Deducciones mensuales totales
  const mniTotalMensual = MNI_MENSUAL_BASE + deduccionFamiliaresMensual + otrasMensuales;

  // Base imponible mensual
  const baseImponibleMensual = Math.max(0, netoDeAportesMensual - mniTotalMensual);

  const { impuesto, marginal } = aplicarEscalaMensual(baseImponibleMensual);

  const retencionMensual = Math.round(impuesto);
  const retencionAnual = retencionMensual * 12;
  const brutoAnual = brutoMensual * 13; // 12 + SAC
  const aportesAnuales = aportesMensuales * 13;

  const alicuotaEfectiva = brutoAnual > 0 ? (retencionAnual / brutoAnual) * 100 : 0;
  const paga = retencionMensual > 0;

  // Umbral: sueldo bruto desde el cual empieza a pagar
  // base > 0 cuando bruto × 0.83 > mniTotal → bruto > mniTotal / 0.83
  const umbralMensual = Math.round(mniTotalMensual / 0.83);

  const mensaje = paga
    ? `Te retienen aproximadamente $${retencionMensual.toLocaleString('es-AR')} por mes. Tu sueldo en mano se reduce en esa cifra por Ganancias.`
    : `Tu sueldo no supera el mínimo no imponible (~$${umbralMensual.toLocaleString('es-AR')}/mes en tu caso) — no pagás Ganancias.`;

  return {
    retencionMensual,
    retencionAnual: Math.round(retencionAnual),
    brutoAnual: Math.round(brutoAnual),
    aportesAnuales: Math.round(aportesAnuales),
    aportesMensuales: Math.round(aportesMensuales),
    netoDeAportesMensual: Math.round(netoDeAportesMensual),
    mniEfectivoMensual: MNI_MENSUAL_BASE,
    deduccionFamiliaresMensual: Math.round(deduccionFamiliaresMensual),
    otrasDeduccionesMensual: Math.round(otrasMensuales),
    mniTotalMensual: Math.round(mniTotalMensual),
    baseImponibleMensual: Math.round(baseImponibleMensual),
    baseImponibleAnual: Math.round(baseImponibleMensual * 12),
    alicuotaMarginal: paga ? `${Math.round(marginal * 100)}%` : '—',
    alicuotaEfectiva: Number(alicuotaEfectiva.toFixed(2)),
    paga,
    mensaje,
    umbralMensual,
  };
}
