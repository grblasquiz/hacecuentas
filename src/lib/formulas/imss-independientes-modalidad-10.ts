/**
 * IMSS para trabajadores independientes — Modalidad 10 (incorporación voluntaria
 * al Régimen Obligatorio, LSS Arts. 13-I y 222).
 * El independiente paga las cuotas obrero-patronales completas sobre el SBC que elija
 * (entre 1 salario mínimo y 25 UMA): cuota fija EyM 20.40% UMA + excedente >3 UMA +
 * gastos médicos pensionados + invalidez y vida + retiro 2% + CEAV (tabla 2026) +
 * riesgos de trabajo a prima mínima. SIN guarderías, SIN prestaciones en dinero y SIN INFONAVIT.
 * Constantes desde src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, tasaCeavPatron2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  ingresoMensual: number;   // SBC mensual con el que quiere cotizar
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { uma, imss, salarioMinimo, primaRiesgoTrabajo } = MEXICO_2026;
  const f = salarioMinimo.factorMensual; // 30.4

  const deseado = num(i.ingresoMensual, 0);
  if (deseado <= 0) throw new Error('Ingresa el ingreso mensual con el que quieres cotizar');

  // Piso legal: 1 salario mínimo; techo: 25 UMA (LSS Art. 28).
  const piso = salarioMinimo.generalMensual;                  // $9,577.22
  const techo = uma.diaria * imss.topeSbcUmas * f;            // $89,155.60
  const sbcMensual = Math.min(Math.max(deseado, piso), techo);
  // SBC diario a centavos (norma IMSS); evita que 9,577.22/30.4 = 315.0401… salte el renglón de 1 SM en la tabla CEAV.
  const sbcDiario = Math.round((sbcMensual / f) * 100) / 100;
  const ajustado = Math.abs(sbcMensual - deseado) > 0.01;

  // ── Componentes de la cuota (obrero + patrón, ambos a cargo del independiente) ──
  // Enfermedad y maternidad — prestaciones en especie:
  const cuotaFija = imss.patron.eymCuotaFijaUma * uma.mensual;                       // 20.40% de la UMA mensual
  const tresUmaMensual = uma.diaria * 3 * f;
  const excedente = Math.max(0, sbcMensual - tresUmaMensual) *
    (imss.patron.eymExcedente + imss.obrero.eymExcedente);                           // 1.10% + 0.40%
  const gastosMedicosPens = sbcMensual *
    (imss.patron.gastosMedicosPensionados + imss.obrero.gastosMedicosPensionados);   // 1.05% + 0.375%
  // Invalidez y vida:
  const invalidezVida = sbcMensual * (imss.patron.invalidezVida + imss.obrero.invalidezVida); // 1.75% + 0.625%
  // Retiro, cesantía y vejez:
  const retiro = sbcMensual * imss.patron.retiro;                                    // 2%
  const tasaCeav = tasaCeavPatron2026(sbcDiario) + imss.obrero.cesantiaVejez;        // tabla 2026 + 1.125%
  const ceav = sbcMensual * tasaCeav;
  // Riesgos de trabajo (prima mínima, actividad de riesgo ordinario):
  const riesgoTrabajo = sbcMensual * primaRiesgoTrabajo.M;                           // 0.5%

  const eyem = cuotaFija + excedente + gastosMedicosPens;
  const ahorroPension = retiro + ceav;
  const cuotaMensual = eyem + invalidezVida + ahorroPension + riesgoTrabajo;
  const cuotaBimestral = cuotaMensual * 2;
  const cuotaAnual = cuotaMensual * 12;
  const pctSobreSbc = (cuotaMensual / sbcMensual) * 100;

  const r = (n: number) => Math.round(n * 100) / 100;

  const _insight = {
    title: 'Tu seguro social por tu cuenta',
    text: `Cotizando con un SBC de **${fmtMXN(sbcMensual)}**${ajustado ? (deseado < piso ? ' (ajustado al piso legal de 1 salario mínimo)' : ' (ajustado al tope legal de 25 UMA)') : ''}, la Modalidad 10 te cuesta **${fmtMXN(cuotaMensual)} al mes** (${pctSobreSbc.toFixed(1)}% de tu SBC). De eso, **${fmtMXN(ahorroPension)}** van a tu AFORE y semanas cotizadas: no es solo gasto, es atención médica IMSS + pensión en construcción.`,
    tone: 'neutral' as const,
    icon: '🩺',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Atención médica (EyM)', value: r(eyem) },
      { label: 'Invalidez y vida', value: r(invalidezVida) },
      { label: 'Retiro + CEAV (tu AFORE)', value: r(ahorroPension) },
      { label: 'Riesgos de trabajo', value: r(riesgoTrabajo) },
    ],
    prefix: '$',
    centerValue: fmtMXN(cuotaMensual),
    centerLabel: 'al mes',
    ariaLabel: `Cuota mensual de Modalidad 10 de ${fmtMXN(cuotaMensual)}: atención médica ${fmtMXN(eyem)}, invalidez y vida ${fmtMXN(invalidezVida)}, retiro y CEAV ${fmtMXN(ahorroPension)}, riesgos de trabajo ${fmtMXN(riesgoTrabajo)}.`,
  };

  return {
    cuotaMensual: fmtMXN(cuotaMensual),
    cuotaBimestral: fmtMXN(cuotaBimestral),
    cuotaAnual: fmtMXN(cuotaAnual),
    sbcCotizado: fmtMXN(sbcMensual) + ' al mes (' + fmtMXN(sbcDiario) + ' diario)' + (ajustado ? ' — ajustado al límite legal' : ''),
    desglose: `EyM (cuota fija ${fmtMXN(cuotaFija)} + excedente ${fmtMXN(excedente)} + gastos médicos pensionados ${fmtMXN(gastosMedicosPens)}) = ${fmtMXN(eyem)} · Invalidez y vida ${fmtMXN(invalidezVida)} · Retiro ${fmtMXN(retiro)} + CEAV ${fmtMXN(ceav)} · Riesgos de trabajo ${fmtMXN(riesgoTrabajo)}.`,
    cobertura: 'Incluye: atención médica, hospitalaria y medicinas IMSS para ti y tu familia, pensión por invalidez y vida, AFORE (retiro + cesantía y vejez, suma semanas cotizadas) y riesgos de trabajo. NO incluye: guarderías, subsidios en dinero por incapacidad ni crédito INFONAVIT.',
    mensaje: `Modalidad 10 con SBC de ${fmtMXN(sbcMensual)}: ${fmtMXN(cuotaMensual)} al mes (${fmtMXN(cuotaBimestral)} bimestral, ${fmtMXN(cuotaAnual)} al año), ${pctSobreSbc.toFixed(1)}% de tu SBC.`,
    _insight,
    _chart,
  };
}
