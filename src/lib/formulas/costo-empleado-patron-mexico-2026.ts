/**
 * Costo total de un empleado para el patrón — México 2026.
 * IMSS patronal desglosado (LSS 2026: cuota fija EyM, ramos, CEAV progresiva, riesgo de trabajo),
 * retiro 2% + INFONAVIT 5%, ISN del estado y provisiones de aguinaldo y prima vacacional (LFT).
 */
import { MEXICO_2026, tasaCeavPatron2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  sueldoMensual: number;          // sueldo bruto mensual
  estado?: string;                // estado para el ISN (default CDMX)
  primaRiesgo?: number | string;  // prima de riesgo de trabajo en % (default clase I ~0.54355%)
  antiguedad?: number | string;   // años de antigüedad (vacaciones y factor de integración); default 1
  aguinaldoDias?: number | string; // días de aguinaldo (mínimo legal 15); default 15
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const r2 = (n: number) => Math.round(n * 100) / 100;

function diasVacaciones(anios: number): number {
  const { lft } = MEXICO_2026;
  const a = Math.max(1, Math.floor(anios));
  if (a <= lft.vacacionesPorAnio.length) return lft.vacacionesPorAnio[a - 1];
  return 20 + lft.vacacionesIncrementoQuinquenal * Math.ceil((a - 5) / 5);
}

export function compute(i: Inputs): Outputs {
  const { uma, salarioMinimo, imss, isnPorEstado, lft, primaRiesgoTrabajo } = MEXICO_2026;

  const sueldo = Number(i.sueldoMensual) || 0;
  if (sueldo <= 0) throw new Error('Ingresa el sueldo bruto mensual del empleado');

  const estado = isnPorEstado[String(i.estado || 'CDMX')] !== undefined ? String(i.estado || 'CDMX') : 'CDMX';
  const tasaIsn = isnPorEstado[estado];

  const primaRaw = i.primaRiesgo as any;
  const primaPct = primaRaw === '' || primaRaw === null || primaRaw === undefined
    ? imss.patron.riesgoTrabajoClaseI
    : Math.min(primaRiesgoTrabajo.primaMaxima, Math.max(primaRiesgoTrabajo.M, (Number(primaRaw) || 0) / 100));

  const antRaw = i.antiguedad as any;
  const anios = antRaw === '' || antRaw === null || antRaw === undefined ? 1 : Math.max(1, Math.floor(Number(antRaw) || 1));

  const agRaw = i.aguinaldoDias as any;
  const aguinaldoDias = agRaw === '' || agRaw === null || agRaw === undefined
    ? lft.aguinaldoDiasMinimo
    : Math.max(lft.aguinaldoDiasMinimo, Number(agRaw) || lft.aguinaldoDiasMinimo);

  // SBC: salario diario × factor de integración (aguinaldo + prima vacacional), topado a 25 UMA.
  const salarioDiario = sueldo / salarioMinimo.factorMensual;
  const vac = diasVacaciones(anios);
  const factor = (365 + aguinaldoDias + vac * lft.primaVacacional) / 365;
  const sbcDiario = Math.min(salarioDiario * factor, uma.diaria * imss.topeSbcUmas);
  const sbcMensual = sbcDiario * salarioMinimo.factorMensual;
  const tresUmaMensual = uma.mensual * 3;

  // ── IMSS patronal mensual (LSS Arts. 25, 106, 107, 147, 168, 211) ──
  const cuotaFijaEyM = imss.patron.eymCuotaFijaUma * uma.mensual;                      // 20.40% UMA
  const excedente = Math.max(0, sbcMensual - tresUmaMensual) * imss.patron.eymExcedente; // 1.10% > 3 UMA
  const prestacionesDinero = sbcMensual * imss.patron.eymPrestacionesDinero;           // 0.70%
  const gmp = sbcMensual * imss.patron.gastosMedicosPensionados;                       // 1.05%
  const invalidezVida = sbcMensual * imss.patron.invalidezVida;                        // 1.75%
  const guarderias = sbcMensual * imss.patron.guarderias;                              // 1.00%
  const tasaCeav = tasaCeavPatron2026(sbcDiario);                                      // tabla 2026: 3.15%–7.513%
  const ceav = sbcMensual * tasaCeav;
  const riesgoTrabajo = sbcMensual * primaPct;
  const retiro = sbcMensual * imss.patron.retiro;                                      // SAR 2%
  const imssPatronal = cuotaFijaEyM + excedente + prestacionesDinero + gmp + invalidezVida + guarderias + ceav + riesgoTrabajo + retiro;

  // ── INFONAVIT 5% del SBC ──
  const infonavit = sbcMensual * imss.infonavitPatron;

  // ── Provisiones LFT: aguinaldo y prima vacacional, prorrateadas a mes ──
  const provAguinaldo = (aguinaldoDias * salarioDiario) / 12;
  const provPrimaVacacional = (vac * salarioDiario * lft.primaVacacional) / 12;
  const provisiones = provAguinaldo + provPrimaVacacional;

  // ── ISN estatal sobre las remuneraciones (sueldo + provisiones) ──
  const isn = (sueldo + provisiones) * tasaIsn;

  const costoMensual = sueldo + imssPatronal + infonavit + isn + provisiones;
  const costoAnual = costoMensual * 12;
  const carga = ((costoMensual - sueldo) / sueldo) * 100;

  const _insight = {
    title: 'El sueldo no es el costo',
    text: `Un empleado con sueldo de **${fmtMXN(sueldo)}** en ${estado} le cuesta al patrón **${fmtMXN(costoMensual)}** al mes (**${fmtMXN(costoAnual)}** al año). La carga adicional es del **${carga.toFixed(1)}%**: ${fmtMXN(imssPatronal)} de IMSS patronal (incluye CEAV al ${(tasaCeav * 100).toFixed(3)}% y retiro 2%), ${fmtMXN(infonavit)} de INFONAVIT, ${fmtMXN(isn)} de ISN (${(tasaIsn * 100).toFixed(2)}%) y ${fmtMXN(provisiones)} de aguinaldo y prima vacacional prorrateados.`,
    tone: 'neutral',
    icon: '🏢',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo bruto', value: r2(sueldo) },
      { label: 'IMSS patronal + retiro', value: r2(imssPatronal) },
      { label: 'INFONAVIT 5%', value: r2(infonavit) },
      { label: `ISN ${estado}`, value: r2(isn) },
      { label: 'Aguinaldo y prima vacacional', value: r2(provisiones) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(costoMensual),
    centerLabel: 'Costo mensual',
    ariaLabel: `Costo patronal mensual de ${fmtMXN(costoMensual)}: sueldo ${fmtMXN(sueldo)} más ${fmtMXN(imssPatronal)} de IMSS, ${fmtMXN(infonavit)} de INFONAVIT, ${fmtMXN(isn)} de ISN y ${fmtMXN(provisiones)} de prestaciones.`,
  };

  return {
    costoMensual: fmtMXN(costoMensual),
    costoAnual: fmtMXN(costoAnual),
    imssPatronal: `${fmtMXN(imssPatronal)} (incluye CEAV ${(tasaCeav * 100).toFixed(3)}%, RT ${(primaPct * 100).toFixed(3)}% y retiro 2%)`,
    infonavit: fmtMXN(infonavit),
    isn: `${fmtMXN(isn)} (${estado}: ${(tasaIsn * 100).toFixed(2)}%)`,
    provisiones: `${fmtMXN(provisiones)} (aguinaldo ${fmtMXN(provAguinaldo)} + prima vacacional ${fmtMXN(provPrimaVacacional)})`,
    cargaPorcentaje: `${carga.toFixed(1)}% sobre el sueldo bruto`,
    detalle: `SBC ${fmtMXN(sbcMensual)} (factor ${factor.toFixed(4)}, ${vac} días de vacaciones). Costo = sueldo ${fmtMXN(sueldo)} + IMSS ${fmtMXN(imssPatronal)} + INFONAVIT ${fmtMXN(infonavit)} + ISN ${fmtMXN(isn)} + provisiones ${fmtMXN(provisiones)} = ${fmtMXN(costoMensual)}/mes.`,
    _insight,
    _chart,
  };
}
