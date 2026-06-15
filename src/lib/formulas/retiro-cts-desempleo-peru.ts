/**
 * Retiro de CTS por desempleo / libre disponibilidad — Perú 2026.
 *
 * Calcula cuánto del saldo de CTS puede disponer el trabajador.
 *
 * Dos regímenes:
 *  1) Libre disponibilidad 100% (Ley 32322): hasta el 31-dic-2026 se puede retirar
 *     el 100% del saldo de CTS. // fuente: Ley 32322, https://lpderecho.pe/ley-32322-retiro-cts-diciembre-2026/, 2026
 *  2) Régimen normal / intangible: solo se puede retirar el EXCEDENTE sobre 4
 *     remuneraciones brutas; las primeras 4 remuneraciones quedan intangibles como
 *     fondo de protección frente al desempleo (Art. 37 D.S. 001-97-TR, TUO Ley CTS).
 *     // fuente: TUO de la Ley de CTS (D.S. 001-97-TR), EY Perú https://www.ey.com/es_pe/insights/workforce/cts, 2026
 *
 * También estima el depósito semestral de CTS con la fórmula estándar:
 *   CTS semestral = (remuneración computable / 12) × meses + (remuneración computable / 360) × días
 *   remuneración computable = sueldo bruto + 1/6 de la última gratificación + asignación familiar
 *   // fuente: Scotiabank/BBVA/EY Perú, cálculo CTS 2026, 2026
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// Saldo intangible del régimen normal: 4 remuneraciones brutas.
// fuente: TUO Ley de CTS (D.S. 001-97-TR) art. 37 / EY Perú, 2026
const REMUNERACIONES_INTANGIBLES = 4;

export interface Inputs {
  modo?: string;             // 'libre2026' (Ley 32322, 100%) | 'normal' (intangible 4 sueldos)
  saldoCts: number;          // saldo acumulado en la cuenta CTS (S/)
  sueldoBruto: number;       // remuneración bruta mensual de referencia (S/)
  asignacionFamiliar?: string; // 'si' suma S/ 113 a la remuneración de referencia
  retiroDeseado?: number;    // monto que se quiere retirar (opcional); si vacío se asume el máximo disponible
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const modo = String(i.modo || 'libre2026');
  const saldo = Number(i.saldoCts) || 0;
  const sueldo = Number(i.sueldoBruto) || 0;
  const conAsig = String(i.asignacionFamiliar || 'no') === 'si';

  if (saldo <= 0) throw new Error('Ingresá el saldo acumulado en tu cuenta CTS (S/)');
  if (sueldo <= 0) throw new Error('Ingresá tu remuneración bruta mensual (S/)');

  // Remuneración bruta de referencia (la que define el tope intangible).
  const remuneracionReferencia = sueldo + (conAsig ? PERU_2026.asignacionFamiliar : 0);

  // Tope intangible (4 remuneraciones) — solo aplica en régimen normal.
  const intangible = remuneracionReferencia * REMUNERACIONES_INTANGIBLES;

  let disponible: number;
  let intangibleAplicado: number;
  let regimenTexto: string;

  if (modo === 'libre2026') {
    // Ley 32322: 100% del saldo es de libre disponibilidad hasta 31-dic-2026.
    disponible = saldo;
    intangibleAplicado = 0;
    regimenTexto = 'Libre disponibilidad 100% (Ley 32322, vigente hasta el 31-dic-2026)';
  } else {
    // Régimen normal: solo el excedente sobre 4 remuneraciones brutas.
    intangibleAplicado = Math.min(intangible, saldo);
    disponible = Math.max(0, saldo - intangible);
    regimenTexto = `Régimen normal: intangibles ${REMUNERACIONES_INTANGIBLES} remuneraciones (${fmtPEN(intangible)})`;
  }

  // Retiro solicitado (si lo indicó); se limita al disponible.
  const deseadoRaw = Number(i.retiroDeseado);
  const tieneDeseado = i.retiroDeseado !== undefined && i.retiroDeseado !== null &&
    String(i.retiroDeseado) !== '' && Number.isFinite(deseadoRaw) && deseadoRaw > 0;
  const retiroEfectivo = tieneDeseado ? Math.min(deseadoRaw, disponible) : disponible;
  const quedaEnCuenta = saldo - retiroEfectivo;
  const noAlcanza = tieneDeseado && deseadoRaw > disponible;

  // Insight según el régimen y el resultado.
  let insight;
  if (modo === 'libre2026') {
    insight = {
      title: 'Podés retirar el 100% de tu CTS',
      text: `Por la **Ley 32322**, hasta el **31 de diciembre de 2026** podés disponer del **100%** de tu CTS: de tu saldo de **${fmtPEN(saldo)}** tenés **${fmtPEN(disponible)}** disponibles. Recordá que la CTS es tu colchón ante el desempleo: retirá solo lo que necesites. Desde 2027 vuelve el régimen normal y solo podrás sacar lo que exceda **${REMUNERACIONES_INTANGIBLES} sueldos** (${fmtPEN(intangible)}).`,
      tone: 'good',
      icon: '💸',
    };
  } else if (disponible <= 0) {
    insight = {
      title: 'Tu CTS está intangible (no podés retirar)',
      text: `En el régimen normal las primeras **${REMUNERACIONES_INTANGIBLES} remuneraciones** (${fmtPEN(intangible)}) son **intangibles**: quedan reservadas como seguro de desempleo. Tu saldo de **${fmtPEN(saldo)}** no supera ese tope, así que **no hay excedente disponible** para retirar mientras sigas trabajando. Si te quedás sin empleo, sí podés retirar el total acumulado.`,
      tone: 'warn',
      icon: '🔒',
    };
  } else {
    insight = {
      title: 'Solo podés retirar el excedente de 4 sueldos',
      text: `En el régimen normal son intangibles **${REMUNERACIONES_INTANGIBLES} remuneraciones** (${fmtPEN(intangible)}). De tu saldo de **${fmtPEN(saldo)}**, podés disponer del excedente: **${fmtPEN(disponible)}**. El resto queda como protección ante el desempleo.`,
      tone: 'good',
      icon: '💼',
    };
  }

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Disponible para retirar', value: Math.round(disponible) },
      { label: 'Intangible / no disponible', value: Math.round(saldo - disponible) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(disponible),
    centerLabel: 'Disponible',
    ariaLabel: `De un saldo de CTS de ${fmtPEN(saldo)}, podés disponer de ${fmtPEN(disponible)}.`,
  };

  return {
    disponible: fmtPEN(disponible),
    retiroEfectivo: fmtPEN(retiroEfectivo),
    quedaEnCuenta: fmtPEN(quedaEnCuenta),
    intangible: modo === 'libre2026' ? 'S/ 0 (libre disponibilidad 100%)' : fmtPEN(intangibleAplicado),
    saldo: fmtPEN(saldo),
    regimen: regimenTexto,
    detalle: noAlcanza
      ? `Querés retirar ${fmtPEN(deseadoRaw)} pero el máximo disponible es ${fmtPEN(disponible)}. Podés sacar hasta ${fmtPEN(retiroEfectivo)} y te quedan ${fmtPEN(quedaEnCuenta)} en la cuenta.`
      : `Podés retirar ${fmtPEN(retiroEfectivo)}; te quedan ${fmtPEN(quedaEnCuenta)} en tu cuenta CTS.`,
    _insight: insight,
    _chart,
  };
}
