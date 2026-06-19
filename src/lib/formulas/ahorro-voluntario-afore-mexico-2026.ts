/**
 * Calculadora de Ahorro Voluntario en AFORE — México 2026
 * (deducción de ISR + proyección de crecimiento)
 *
 * Regla fiscal: las aportaciones voluntarias/complementarias de retiro a la AFORE
 * (o a un PPR) son deducibles del ISR conforme al Art. 151, fracción V de la LISR,
 * hasta el MENOR entre:
 *   a) 10% del ingreso acumulable anual, y
 *   b) 5 UMA anuales (2026: 5 × $42,794.64 = $213,973.20).
 * Van FUERA del tope global de deducciones personales (5 UMA / 15%).
 *
 * El ahorro fiscal se calcula con la tarifa anual real del Art. 152 (Anexo 8 RMF 2026):
 * ISR(ingreso) − ISR(ingreso − deducible). Si el usuario fija su tasa marginal,
 * se usa ese porcentaje en su lugar (monto deducible × tasa marginal).
 *
 * Datos 2026 desde src/lib/data/mexico-2026.ts (UMA, tarifa ISR anual, formato MXN).
 */
import { MEXICO_2026, isrAnual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  aportacionAnual: number;        // aportación voluntaria que planeás hacer en el año
  ingresoAnual: number;           // ingreso acumulable anual (sueldos/honorarios)
  tasaIsrMarginal?: number;       // % opcional; si se omite, se deriva de la tarifa anual
  rendimientoAnual?: number;      // % de rendimiento anual esperado del ahorro
  anios?: number;                 // años de la proyección de crecimiento
}

export interface Outputs {
  montoDeducible: number;         // lo que de verdad podés deducir (tras topes)
  ahorroFiscal: number;           // pesos de ISR que te ahorras
  tasaMarginalAplicada: number;   // % de ISR usado para el ahorro
  costoNetoAportacion: number;    // aportación − ahorro fiscal (lo que "cuesta" de verdad)
  excedenteNoDeducible: number;   // parte de la aportación que rebasa el tope
  topeDeduccion: number;          // el tope aplicable (menor de 10% / 5 UMA)
  saldoProyectado: number;        // valor futuro del ahorro recurrente
  aportadoTotal: number;          // total aportado en el horizonte (sin rendimientos)
  rendimientoGanado: number;      // rendimientos generados en el horizonte
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v.replace(/[^0-9.\-]/g, '')) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Tasa marginal de ISR (%) según la tarifa anual 2026 para un ingreso dado. */
function tasaMarginalAnual2026(ingreso: number): number {
  if (!Number.isFinite(ingreso) || ingreso <= 0) return 0;
  for (const [limInf, limSup, , tasa] of MEXICO_2026.isrTarifaAnual) {
    if (ingreso >= limInf && ingreso <= limSup) return Math.round(tasa * 10000) / 100;
  }
  const last = MEXICO_2026.isrTarifaAnual[MEXICO_2026.isrTarifaAnual.length - 1];
  return Math.round(last[3] * 10000) / 100;
}

export function compute(i: Inputs): Outputs {
  const aportacion = num(i.aportacionAnual);
  const ingreso = num(i.ingresoAnual);
  if (aportacion <= 0) throw new Error('Ingresá tu aportación voluntaria anual');
  if (ingreso <= 0) throw new Error('Ingresá tu ingreso acumulable anual');

  const rendimientoPct = i.rendimientoAnual != null && num(i.rendimientoAnual) > 0 ? num(i.rendimientoAnual) : 8;
  const anios = i.anios != null && num(i.anios) >= 1 ? Math.round(num(i.anios)) : 20;

  // ── Tope de deducción (Art. 151-V LISR): menor entre 10% del ingreso y 5 UMA anuales ──
  const cincoUmaAnual = MEXICO_2026.uma.anual * MEXICO_2026.deduccionesPersonales.topeUmasAnuales; // 213,973.20
  const diezPorCientoIngreso = ingreso * 0.10;
  const topeDeduccion = Math.min(diezPorCientoIngreso, cincoUmaAnual);

  const montoDeducible = Math.min(aportacion, topeDeduccion);
  const excedenteNoDeducible = Math.max(0, aportacion - montoDeducible);

  // ── Ahorro fiscal: tarifa anual real (Art. 152) o tasa marginal fijada por el usuario ──
  let tasaMarginalAplicada: number;
  let ahorroFiscal: number;
  const tasaUsuario = i.tasaIsrMarginal != null ? num(i.tasaIsrMarginal) : NaN;
  if (Number.isFinite(tasaUsuario) && tasaUsuario > 0) {
    tasaMarginalAplicada = Math.round(tasaUsuario * 100) / 100;
    ahorroFiscal = montoDeducible * (tasaMarginalAplicada / 100);
  } else {
    const isrSin = isrAnual2026(ingreso);
    const isrCon = isrAnual2026(Math.max(0, ingreso - montoDeducible));
    ahorroFiscal = Math.max(0, isrSin - isrCon);
    tasaMarginalAplicada = tasaMarginalAnual2026(ingreso);
  }
  ahorroFiscal = Math.round(ahorroFiscal * 100) / 100;

  const costoNetoAportacion = Math.round((aportacion - ahorroFiscal) * 100) / 100;

  // ── Proyección simple: valor futuro de una aportación anual recurrente (anualidad ordinaria) ──
  // VF = PMT × [((1+r)^n − 1) / r]   (con r = 0 → suma simple)
  const r = rendimientoPct / 100;
  const factor = Math.pow(1 + r, anios);
  const saldoProyectado = r !== 0
    ? Math.round(aportacion * ((factor - 1) / r))
    : Math.round(aportacion * anios);
  const aportadoTotal = Math.round(aportacion * anios);
  const rendimientoGanado = Math.max(0, saldoProyectado - aportadoTotal);

  const fmt = (n: number) => fmtMXN(n);
  const topeNota = topeDeduccion === cincoUmaAnual
    ? `el tope de **5 UMA anuales** (${fmt(cincoUmaAnual)})`
    : `el **10% de tu ingreso** (${fmt(diezPorCientoIngreso)})`;

  const detalle = excedenteNoDeducible > 0
    ? `De los ${fmt(aportacion)} que aportás, solo ${fmt(montoDeducible)} son deducibles (manda ${topeNota}); ${fmt(excedenteNoDeducible)} quedan fuera. Tu ISR baja ${fmt(ahorroFiscal)} (tasa marginal ${tasaMarginalAplicada}%), así que aportar te cuesta neto ${fmt(costoNetoAportacion)}.`
    : `Tu aportación de ${fmt(aportacion)} es deducible completa (debajo de ${topeNota}). Tu ISR baja ${fmt(ahorroFiscal)} (tasa marginal ${tasaMarginalAplicada}%): aportar te cuesta neto ${fmt(costoNetoAportacion)}.`;

  // ── Insight ──
  const pctAhorro = aportacion > 0 ? Math.round((ahorroFiscal / aportacion) * 1000) / 10 : 0;
  let tone: 'good' | 'warn' | 'neutral';
  if (excedenteNoDeducible > 0) tone = 'warn';
  else if (pctAhorro >= 20) tone = 'good';
  else tone = 'neutral';

  const insightText = excedenteNoDeducible > 0
    ? `Estás aportando **${fmt(aportacion)}**, pero solo **${fmt(montoDeducible)}** son deducibles: rebasás ${topeNota}. El SAT te devuelve **${fmt(ahorroFiscal)}** (el **${pctAhorro}%** de tu aportación), y a 20 años tu ahorro proyecta **${fmt(saldoProyectado)}**. Si tu objetivo es solo el beneficio fiscal, aportar más de **${fmt(montoDeducible)}** ya no te ahorra ISR.`
    : `Aportando **${fmt(aportacion)}** al año, el SAT te devuelve **${fmt(ahorroFiscal)}** en tu declaración anual (el **${pctAhorro}%** de tu aportación): tu ahorro neto solo te cuesta **${fmt(costoNetoAportacion)}**. A ${anios} años, con rendimiento del ${rendimientoPct}%, tu fondo proyecta **${fmt(saldoProyectado)}** (${fmt(aportadoTotal)} aportados + ${fmt(rendimientoGanado)} de rendimientos).`;

  const out: Outputs = {
    montoDeducible: Math.round(montoDeducible * 100) / 100,
    ahorroFiscal,
    tasaMarginalAplicada,
    costoNetoAportacion,
    excedenteNoDeducible: Math.round(excedenteNoDeducible * 100) / 100,
    topeDeduccion: Math.round(topeDeduccion * 100) / 100,
    saldoProyectado,
    aportadoTotal,
    rendimientoGanado,
    detalle,
    _insight: {
      title: excedenteNoDeducible > 0 ? 'Estás aportando más de lo deducible' : 'Tu ahorro paga doble: deducción + crecimiento',
      text: insightText,
      tone,
      icon: '🐖',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Aportado de tu bolsillo (neto)', value: Math.max(0, Math.round(costoNetoAportacion)) },
        { label: 'Devolución del SAT (ahorro ISR)', value: Math.round(ahorroFiscal) },
      ],
      prefix: '$',
      centerValue: fmt(aportacion),
      centerLabel: 'aportación anual',
      ariaLabel: `Reparto de tu aportación anual de ${fmt(aportacion)}: ${fmt(costoNetoAportacion)} salen de tu bolsillo y ${fmt(ahorroFiscal)} te los devuelve el SAT vía deducción de ISR.`,
    },
  };

  return out;
}

export default compute;
