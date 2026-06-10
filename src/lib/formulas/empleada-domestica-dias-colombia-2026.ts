/**
 * Empleada doméstica por días Colombia 2026 — pago mínimo legal por día trabajado
 * (SMDLV + descanso dominical proporcional 1/6 [art. 173-5 CST] + auxilio de
 * transporte diario), mensualización, PILA por semanas (Decreto 2616/2013: base
 * mínima semanal = 1/4 SMLMV; ARL sobre 1 SMLMV; CCF sobre la misma base) y
 * provisión de prima, cesantías, intereses y vacaciones proporcionales.
 * Constantes: src/lib/data/colombia-2026.ts (Decretos 1469 y 1470 de 2025, CST, Ley 100/1993).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  diasSemana?: string | number; // 1 a 6 días por semana (default 2)
  pagoDia?: number | string;    // pago actual por día; vacío = usar mínimo legal
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;

  // Guard de defaults: '' / null / undefined → default (sin pisar ceros válidos).
  const diasRaw = i.diasSemana === '' || i.diasSemana == null ? 2 : Math.round(Number(i.diasSemana));
  if (!Number.isFinite(diasRaw) || diasRaw < 1 || diasRaw > 6) {
    throw new Error('Elegí entre 1 y 6 días por semana');
  }
  const diasSemana = diasRaw;

  const pagoProvisto = !(i.pagoDia === '' || i.pagoDia == null);
  const pagoNum = pagoProvisto ? Number(i.pagoDia) : NaN;
  if (pagoProvisto && (!Number.isFinite(pagoNum) || pagoNum <= 0)) {
    throw new Error('Ingresá un pago por día válido (o dejá el campo vacío para usar el mínimo legal)');
  }

  // Mínimo legal por día trabajado 2026:
  const smdlv = C.smdlv;                    // $58.363,50 (SMLMV/30)
  const auxDia = C.auxilioTransporte / 30;  // $8.303,17 por día trabajado
  const domDia = smdlv / 6;                 // descanso dominical proporcional (art. 173-5 CST)
  const minimoDia = smdlv + domDia + auxDia; // ≈ $76.394

  const pago = pagoProvisto ? pagoNum : minimoDia;
  const cumpleMinimo = pago + 0.5 >= minimoDia;
  const faltanteDia = Math.max(0, minimoDia - pago);

  // Mensualización (52 semanas / 12 meses ≈ 4,33 semanas por mes).
  const diasMes = diasSemana * (52 / 12);
  const mensualizado = pago * diasMes;

  // PILA por semanas — Decreto 2616/2013: 1-7 días/mes → 1 semana; 8-14 → 2;
  // 15-21 → 3; más de 21 → mes completo. Base mínima semanal = 1/4 SMLMV.
  const diasMesRed = Math.round(diasMes);
  const semanas = diasMesRed <= 7 ? 1 : diasMesRed <= 14 ? 2 : diasMesRed <= 21 ? 3 : 4;
  const basePila = semanas * (C.smlmv / 4); // 4 semanas = 1 SMLMV completo

  const pensionEmpleador = basePila * C.aportes.pensionEmpleador;          // 12%
  const pensionEmpleada = basePila * C.aportes.pensionEmpleado;            // 4% (se descuenta)
  const arl = C.smlmv * C.aportes.arl.I;                                   // riesgo I, IBC = 1 SMLMV (D. 2616/2013)
  const ccf = basePila * C.aportes.parafiscales.cajaCompensacion;          // 4% caja de compensación
  const pilaEmpleador = pensionEmpleador + arl + ccf;

  // Prestaciones sociales proporcionales (provisión mensual):
  // prima y cesantías incluyen auxilio de transporte; vacaciones sólo salario.
  const calcPrestaciones = (pagoX: number) => {
    const salarioMesX = Math.max(0, pagoX - auxDia) * diasMes;
    const auxMesX = Math.min(pagoX, auxDia) * diasMes;
    const primaX = (salarioMesX + auxMesX) * C.prestaciones.primaPorcentaje;
    const cesantiasX = (salarioMesX + auxMesX) * C.prestaciones.cesantiasPorcentaje;
    const interesesX = cesantiasX * C.prestaciones.interesesCesantias;
    const vacacionesX = salarioMesX * C.prestaciones.vacacionesPorcentaje;
    return { prima: primaX, cesantias: cesantiasX, intereses: interesesX, vacaciones: vacacionesX, total: primaX + cesantiasX + interesesX + vacacionesX };
  };
  const p = calcPrestaciones(pago);
  const { prima, cesantias, intereses, vacaciones } = p;
  const prestaciones = p.total;

  const costoTotal = mensualizado + pilaEmpleador + prestaciones;
  // Costo total si pagaras exactamente el mínimo legal por día (para el insight de ajuste).
  const costoAlMinimo = minimoDia * diasMes + pilaEmpleador + calcPrestaciones(minimoDia).total;

  const _insight = cumpleMinimo
    ? {
        title: 'Lo que cuesta de verdad, todo en regla',
        text: `Pagando **${fmtCOP(pago)}** por día, **${diasSemana} día${diasSemana === 1 ? '' : 's'} a la semana** (~${diasMes.toFixed(1).replace('.', ',')} días/mes), el costo total del hogar es **${fmtCOP(costoTotal)}** al mes: ${fmtCOP(mensualizado)} de pago directo + ${fmtCOP(pilaEmpleador)} de PILA a tu cargo (pensión 12%, ARL y caja, cotizando ${semanas} semana${semanas === 1 ? '' : 's'} — Decreto 2616/2013) + ${fmtCOP(prestaciones)} de provisión de prima, cesantías, intereses y vacaciones. Del pago podés descontarle ${fmtCOP(pensionEmpleada)} de su 4% de pensión.`,
        tone: 'good',
        icon: '🏠',
      }
    : {
        title: 'Estás pagando por debajo del mínimo legal',
        text: `En 2026 el día de trabajo doméstico vale como mínimo **${fmtCOP(minimoDia)}**: ${fmtCOP(smdlv)} de salario (SMLMV/30) + ${fmtCOP(domDia)} de descanso dominical proporcional (art. 173 CST) + ${fmtCOP(auxDia)} de auxilio de transporte. A tu pago de **${fmtCOP(pago)}** le faltan **${fmtCOP(faltanteDia)} por día**. Con el día ajustado al mínimo, el costo total en regla (pago + PILA + prestaciones) sería de **${fmtCOP(costoAlMinimo)}** al mes.`,
        tone: 'warning',
        icon: '⚠️',
      };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Pago a la trabajadora', value: Math.round(mensualizado) },
      { label: 'PILA (pensión, ARL, caja)', value: Math.round(pilaEmpleador) },
      { label: 'Prima, cesantías y vacaciones', value: Math.round(prestaciones) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtCOP(costoTotal),
    centerLabel: 'Costo mensual total',
    ariaLabel: `Costo mensual total del hogar: ${fmtCOP(costoTotal)} = pago ${fmtCOP(mensualizado)} + PILA ${fmtCOP(pilaEmpleador)} + prestaciones ${fmtCOP(prestaciones)}.`,
  };

  return {
    minimoDia: `${fmtCOP(minimoDia)} (salario ${fmtCOP(smdlv)} + dominical ${fmtCOP(domDia)} + auxilio ${fmtCOP(auxDia)})`,
    cumpleMinimo: cumpleMinimo
      ? `Sí — tu pago de ${fmtCOP(pago)}/día cubre el mínimo legal 2026`
      : `No — faltan ${fmtCOP(faltanteDia)} por día para llegar a ${fmtCOP(minimoDia)}`,
    mensualizado: `${fmtCOP(mensualizado)} (${diasMes.toFixed(1).replace('.', ',')} días/mes)`,
    pilaEmpleador: `${fmtCOP(pilaEmpleador)} (pensión 12% ${fmtCOP(pensionEmpleador)} + ARL ${fmtCOP(arl)} + caja 4% ${fmtCOP(ccf)}, ${semanas} semana${semanas === 1 ? '' : 's'} cotizada${semanas === 1 ? '' : 's'})`,
    descuentoEmpleada: `${fmtCOP(pensionEmpleada)} (pensión 4% sobre ${fmtCOP(basePila)})`,
    prestaciones: `${fmtCOP(prestaciones)}/mes (prima ${fmtCOP(prima)} + cesantías ${fmtCOP(cesantias)} + intereses ${fmtCOP(intereses)} + vacaciones ${fmtCOP(vacaciones)})`,
    costoTotal: fmtCOP(costoTotal),
    detalle: `Pago ${fmtCOP(mensualizado)} + PILA empleador ${fmtCOP(pilaEmpleador)} + provisión prestaciones ${fmtCOP(prestaciones)} = ${fmtCOP(costoTotal)}/mes por ${diasSemana} día${diasSemana === 1 ? '' : 's'}/semana.`,
    _insight,
    _chart,
  };
}
