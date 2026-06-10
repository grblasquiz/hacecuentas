/**
 * Cuotas IMSS 2026 empleado (obrero) y patrón sobre el SBC mensual.
 * Modelo LSS Arts. 25, 106, 107, 147, 168, 211 + reforma de pensiones 2020 (CEAV progresiva patronal).
 * Constantes desde src/lib/data/mexico-2026.ts (UMA 2026 $117.31/día; tope SBC 25 UMA ≈ $89,155.60/mes).
 * No incluye INFONAVIT (5% patronal, fondo de vivienda aparte).
 */
import { MEXICO_2026, tasaCeavPatron2026 } from '../data/mexico-2026.ts';

export interface Inputs {
  sbc_empleado: number;
}

export interface Outputs {
  cuota_empleado_enfermedades: number;
  cuota_empleado_gmp: number;
  cuota_empleado_invalidez: number;
  cuota_empleado_cesantia: number;
  cuota_empleado_total: number;
  sbc_tope: number;
  cuota_patron_riesgo: number;
  cuota_patron_enfermedades: number;
  cuota_patron_invalidez: number;
  cuota_patron_cesantia: number;
  cuota_patron_guarderia: number;
  cuota_patron_total: number;
  costo_total_empleado: number;
  porcentaje_costo_total: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const { uma, imss, salarioMinimo } = MEXICO_2026;

  // Tope del SBC: 25 UMA diarias (LSS Art. 28) → mensual con factor 30.4
  const SBC_MAXIMO = uma.diaria * imss.topeSbcUmas * salarioMinimo.factorMensual; // $89,155.60
  const TRES_UMA_MENSUAL = uma.diaria * 3 * salarioMinimo.factorMensual; // $10,698.67
  const UMA_MENSUAL = uma.diaria * salarioMinimo.factorMensual; // $3,566.22

  // Validación y manejo de entrada ('' → 0 → se trata como sin dato)
  const sbc = Math.max(0, Number(i.sbc_empleado) || 0);

  // SBC aplicable (se topa en 25 UMA)
  const sbc_tope = Math.min(sbc, SBC_MAXIMO);
  const excedente3Uma = Math.max(0, sbc_tope - TRES_UMA_MENSUAL);
  const sbcDiario = sbc_tope / salarioMinimo.factorMensual;

  // ── Cuota obrero (LSS 106-II, 107, 25, 147, 168) ──
  const cuota_empleado_enfermedades =
    excedente3Uma * imss.obrero.eymExcedente + sbc_tope * imss.obrero.eymPrestacionesDinero; // EyM: excedente >3 UMA 0.40% + prestaciones en dinero 0.25%
  const cuota_empleado_gmp = sbc_tope * imss.obrero.gastosMedicosPensionados; // 0.375%
  const cuota_empleado_invalidez = sbc_tope * imss.obrero.invalidezVida; // 0.625%
  const cuota_empleado_cesantia = sbc_tope * imss.obrero.cesantiaVejez; // 1.125%
  const cuota_empleado_total =
    cuota_empleado_enfermedades + cuota_empleado_gmp + cuota_empleado_invalidez + cuota_empleado_cesantia;

  // ── Cuota patrón (LSS 106-I/II, 107, 25, 147, 168, 211 + tabla CEAV 2026) ──
  const cuota_patron_riesgo = sbc_tope * imss.patron.riesgoTrabajoClaseI; // prima media clase I 0.54355% (varía 0.5%-15% por siniestralidad)
  const cuota_patron_enfermedades =
    UMA_MENSUAL * imss.patron.eymCuotaFijaUma + // cuota fija 20.40% de la UMA mensual
    excedente3Uma * imss.patron.eymExcedente + // 1.10% sobre excedente >3 UMA
    sbc_tope * imss.patron.eymPrestacionesDinero + // 0.70%
    sbc_tope * imss.patron.gastosMedicosPensionados; // 1.05%
  const cuota_patron_invalidez = sbc_tope * imss.patron.invalidezVida; // 1.75%
  const tasaCeav = sbc > 0 ? tasaCeavPatron2026(sbcDiario) : 0;
  const cuota_patron_cesantia = sbc_tope * (imss.patron.retiro + tasaCeav); // Retiro SAR 2% + CEAV progresiva 3.15%-7.513%
  const cuota_patron_guarderia = sbc_tope * imss.patron.guarderias; // 1.00%
  const cuota_patron_total =
    cuota_patron_riesgo + cuota_patron_enfermedades + cuota_patron_invalidez + cuota_patron_cesantia + cuota_patron_guarderia;

  // Cálculos finales
  const costo_total_empleado = cuota_empleado_total + cuota_patron_total;
  const porcentaje_costo_total = sbc_tope > 0 ? (costo_total_empleado / sbc_tope) * 100 : 0;

  const topado = sbc > SBC_MAXIMO;
  const fmt = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const _insight = {
    title: 'Quién paga las cuotas del IMSS',
    text: `Sobre un SBC de **${fmt(sbc_tope)}**, las cuotas IMSS suman **${fmt(costo_total_empleado)}** (un **${porcentaje_costo_total.toFixed(1)}%** del salario). El patrón aporta el grueso, **${fmt(cuota_patron_total)}** (incluye la cuota fija de EyM y la CEAV del ${(tasaCeav * 100).toFixed(2)}%), y al trabajador se le retienen **${fmt(cuota_empleado_total)}**.${topado ? ` El salario supera el tope de 25 UMA (${fmt(SBC_MAXIMO)}/mes), así que las cuotas se calculan sobre ese máximo.` : ''}`,
    tone: 'neutral' as const,
    icon: '🇲🇽',
  };
  const _chart = sbc_tope > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cuota patrón', value: Math.round(cuota_patron_total * 100) / 100 },
      { label: 'Cuota empleado', value: Math.round(cuota_empleado_total * 100) / 100 },
    ],
    prefix: '$',
    centerValue: fmt(costo_total_empleado),
    centerLabel: 'Cuota IMSS total',
    ariaLabel: 'Reparto de las cuotas del IMSS entre la parte que paga el patrón y la que se retiene al empleado',
  } : undefined;

  return {
    cuota_empleado_enfermedades: Math.round(cuota_empleado_enfermedades * 100) / 100,
    cuota_empleado_gmp: Math.round(cuota_empleado_gmp * 100) / 100,
    cuota_empleado_invalidez: Math.round(cuota_empleado_invalidez * 100) / 100,
    cuota_empleado_cesantia: Math.round(cuota_empleado_cesantia * 100) / 100,
    cuota_empleado_total: Math.round(cuota_empleado_total * 100) / 100,
    sbc_tope: Math.round(sbc_tope * 100) / 100,
    cuota_patron_riesgo: Math.round(cuota_patron_riesgo * 100) / 100,
    cuota_patron_enfermedades: Math.round(cuota_patron_enfermedades * 100) / 100,
    cuota_patron_invalidez: Math.round(cuota_patron_invalidez * 100) / 100,
    cuota_patron_cesantia: Math.round(cuota_patron_cesantia * 100) / 100,
    cuota_patron_guarderia: Math.round(cuota_patron_guarderia * 100) / 100,
    cuota_patron_total: Math.round(cuota_patron_total * 100) / 100,
    costo_total_empleado: Math.round(costo_total_empleado * 100) / 100,
    porcentaje_costo_total: Math.round(porcentaje_costo_total * 100) / 100,
    _insight,
    _chart
  };
}
