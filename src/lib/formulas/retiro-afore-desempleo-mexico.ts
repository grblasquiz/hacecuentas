/**
 * Retiro parcial de AFORE por desempleo — LSS Art. 191 + reglas CONSAR.
 * Modalidad A: 30 días del último SBC, tope 10 salarios mínimos mensuales (cuenta ≥3 años).
 * Modalidad B: lo MENOR entre 90 días del SBC y 11.5% del saldo RCV (cuenta ≥5 años).
 * Constantes desde src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  salario: number;          // último salario base de cotización
  periodo?: string;         // 'diario' | 'mensual'
  saldoRcv: number;         // saldo de la subcuenta RCV (estado de cuenta AFORE)
  aniosCuenta: number;      // años desde que se abrió la cuenta AFORE
  semanasCotizadas?: number; // opcional: para estimar las semanas que se descuentan
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { aforeDesempleo, salarioMinimo } = MEXICO_2026;

  const salario = num(i.salario, 0);
  if (salario <= 0) throw new Error('Ingresa tu último salario base de cotización (SBC)');
  const saldo = num(i.saldoRcv, 0);
  if (saldo <= 0) throw new Error('Ingresa el saldo RCV de tu estado de cuenta AFORE');
  const aniosCuenta = num(i.aniosCuenta, 0);
  if (aniosCuenta <= 0) throw new Error('Ingresa los años que tiene tu cuenta AFORE');
  const periodo = String(i.periodo || 'mensual') === 'diario' ? 'diario' : 'mensual';
  const semanas = Math.max(0, Math.floor(num(i.semanasCotizadas, 0)));

  const factorMensual = salarioMinimo.factorMensual; // 30.4
  const sbcDiario = periodo === 'mensual' ? salario / factorMensual : salario;

  const elegibleA = aniosCuenta >= 3; // y al menos 2 años cotizados al IMSS
  const elegibleB = aniosCuenta >= 5;

  // Modalidad A: 30 días del último SBC, con tope de 10 salarios mínimos mensuales.
  const topeA = aforeDesempleo.modalidadA.topeVecesSmMensual * salarioMinimo.generalMensual; // $95,772.20 en 2026
  const montoA = elegibleA
    ? Math.min(aforeDesempleo.modalidadA.diasSbc * sbcDiario, topeA, saldo)
    : 0;

  // Modalidad B: lo MENOR entre 90 días del SBC y 11.5% del saldo RCV.
  const noventaDias = aforeDesempleo.modalidadB.diasSbc * sbcDiario;
  const oncePuntoCinco = aforeDesempleo.modalidadB.porcentajeSaldoRcv * saldo;
  const montoB = elegibleB ? Math.min(noventaDias, oncePuntoCinco, saldo) : 0;

  if (!elegibleA && !elegibleB) {
    throw new Error('Tu cuenta AFORE necesita al menos 3 años de antigüedad para el retiro por desempleo (Modalidad A); con 5 o más años accedes a la Modalidad B.');
  }

  const mejor = Math.max(montoA, montoB);
  const mejorModalidad = montoB >= montoA && elegibleB ? 'B' : 'A';
  const saldoRestante = saldo - mejor;

  // Estimación de semanas descontadas: proporcional al monto retirado sobre el saldo (LSS Art. 198).
  const semanasDescontadas = semanas > 0 ? Math.round(semanas * (mejor / saldo)) : 0;

  const _insight = {
    title: 'Cuánto puedes retirar por desempleo',
    text: `${elegibleB
      ? `Puedes retirar hasta **${fmtMXN(mejor)}** con la **Modalidad ${mejorModalidad}** (${mejorModalidad === 'B' ? `lo menor entre 90 días de tu SBC = ${fmtMXN(noventaDias)} y 11.5% de tu saldo = ${fmtMXN(oncePuntoCinco)}` : `30 días de tu SBC, tope 10 salarios mínimos mensuales`}). La Modalidad ${mejorModalidad === 'B' ? 'A' : 'B'} te daría ${fmtMXN(mejorModalidad === 'B' ? montoA : montoB)}.`
      : `Tu cuenta tiene entre 3 y 5 años: solo aplica la **Modalidad A** y puedes retirar hasta **${fmtMXN(montoA)}** (30 días de tu SBC, con tope de 10 salarios mínimos mensuales = ${fmtMXN(topeA)}).`} Necesitas **${aforeDesempleo.diasDesempleoMinimo} días naturales desempleado** y solo puedes hacerlo **una vez cada ${aforeDesempleo.aniosEntreRetiros} años**.${semanasDescontadas > 0 ? ` Se te descontarían **~${semanasDescontadas} semanas cotizadas** (recuperables si las reintegras).` : ' Ojo: el retiro descuenta semanas cotizadas en proporción al monto (recuperables si lo reintegras).'}`,
    tone: 'warn',
    icon: '🏦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Retiro por desempleo', value: Math.round(mejor) },
      { label: 'Queda en tu AFORE', value: Math.round(saldoRestante) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(mejor),
    centerLabel: `Modalidad ${mejorModalidad}`,
    ariaLabel: `Retiro por desempleo de hasta ${fmtMXN(mejor)} (Modalidad ${mejorModalidad}); quedarían ${fmtMXN(saldoRestante)} en la cuenta AFORE.`,
  };

  return {
    montoRetirable: `${fmtMXN(mejor)} (Modalidad ${mejorModalidad})`,
    modalidadA: elegibleA ? fmtMXN(montoA) : 'No disponible (cuenta con menos de 3 años)',
    modalidadB: elegibleB ? fmtMXN(montoB) : 'No disponible (requiere cuenta con 5+ años)',
    semanasDescontadas: semanasDescontadas > 0
      ? `~${semanasDescontadas} de ${semanas} (proporcional al retiro; recuperables si reintegras)`
      : 'Proporcionales al monto retirado (ingresa tus semanas cotizadas para estimarlas)',
    detalle: `Modalidad A = 30 días × ${fmtMXN(sbcDiario)} de SBC diario${montoA === topeA && elegibleA ? `, topado a ${fmtMXN(topeA)} (10 SM mensuales)` : ''}${elegibleB ? `. Modalidad B = menor entre 90 días del SBC (${fmtMXN(noventaDias)}) y 11.5% del saldo (${fmtMXN(oncePuntoCinco)})` : ''}. Requisitos: ${aforeDesempleo.diasDesempleoMinimo}+ días desempleado, 1 retiro cada ${aforeDesempleo.aniosEntreRetiros} años.`,
    _insight,
    _chart,
  };
}
