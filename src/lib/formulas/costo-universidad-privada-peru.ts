/**
 * Costo total de una carrera en una universidad privada de Perú.
 *
 * Modelo de pago habitual en las privadas peruanas (UPN, UTP, UPC, PUCP, etc.):
 *   - La carrera se divide en CICLOS (semestres). Una carrera típica dura 10 ciclos (5 años, 2 ciclos/año).
 *   - Cada ciclo se paga con una MATRÍCULA/inscripción (pago único del ciclo) + N CUOTAS (pensiones).
 *   - Lo habitual son 5 cuotas por ciclo (confirmado UPN, UTP, UPC). // fuente: UPN Transparencia, upn.edu.pe/transparencia/pensiones-tarifas, 2026; UTP, universidadesperu.info, 2026
 *
 * Rangos 2026 de la cuota/pensión mensual: desde ~S/ 460 (UPN económica) hasta S/ 6.594 (Medicina UPC cat. A).
 *   // fuente: UPC Transparencia (Medicina cat. A S/ 6.594/mes), upc.edu.pe, Res. DAF 257-2025
 *   // fuente: UPN Transparencia (pensión S/ 460–2.605 por cuota, "5 cuotas por periodo académico"), upn.edu.pe/transparencia/pensiones-tarifas, 2026
 *   // fuente: PUCP estudiante (escalas numeradas G1–G9, valor crédito 2026-1), proyectomasi.pe (rangos referenciales 2025)
 */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  pensionCuota: number;        // valor de cada cuota/pensión (S/)
  cuotasPorCiclo?: number;     // cuántas cuotas se pagan por ciclo (default 5)
  matriculaPorCiclo?: number;  // matrícula/inscripción por ciclo (S/), default 0
  numCiclos?: number;          // ciclos totales de la carrera (default 10)
  ciclosCursados?: number;     // ciclos ya pagados, para proyectar el saldo (default 0)
  aumentoAnual?: number;       // aumento anual de la pensión en % (inflación/ajuste), default 0
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const pension = Number(i.pensionCuota) || 0;
  if (pension <= 0) throw new Error('Ingresá el valor de la cuota/pensión mensual (S/)');

  const cuotasCiclo = num(i.cuotasPorCiclo, 5);
  if (cuotasCiclo <= 0) throw new Error('Las cuotas por ciclo deben ser mayores a 0');

  const matricula = Math.max(0, num(i.matriculaPorCiclo, 0));
  const numCiclos = num(i.numCiclos, 10);
  if (numCiclos <= 0) throw new Error('El número de ciclos debe ser mayor a 0');

  const cursados = Math.min(Math.max(0, Math.floor(num(i.ciclosCursados, 0))), numCiclos);
  const aumento = Math.max(0, num(i.aumentoAnual, 0)) / 100; // % anual → fracción

  // 2 ciclos por año académico → el ajuste de pensión se aplica cada 2 ciclos.
  const CICLOS_POR_ANIO = 2;

  // Costo nominal de un ciclo, con el ajuste anual acumulado hasta ese ciclo.
  const costoCiclo = (cicloIdx: number): { pension: number; matricula: number; total: number } => {
    const aniosTranscurridos = Math.floor(cicloIdx / CICLOS_POR_ANIO);
    const factor = Math.pow(1 + aumento, aniosTranscurridos);
    const pensionCiclo = pension * cuotasCiclo * factor;
    const matriculaCiclo = matricula * factor;
    return { pension: pensionCiclo, matricula: matriculaCiclo, total: pensionCiclo + matriculaCiclo };
  };

  let costoTotal = 0;
  let totalPensiones = 0;
  let totalMatriculas = 0;
  let costoRestante = 0;
  for (let c = 0; c < numCiclos; c++) {
    const cc = costoCiclo(c);
    costoTotal += cc.total;
    totalPensiones += cc.pension;
    totalMatriculas += cc.matricula;
    if (c >= cursados) costoRestante += cc.total;
  }

  // Referencias "planas" (sin ajuste) para mostrar promedios legibles.
  const costoCicloBase = pension * cuotasCiclo + matricula;          // primer ciclo
  const costoAnioBase = costoCicloBase * CICLOS_POR_ANIO;            // 2 ciclos
  const aniosCarrera = numCiclos / CICLOS_POR_ANIO;
  const ciclosRestantes = numCiclos - cursados;

  const tone = costoTotal >= 120000 ? 'warn' : costoTotal >= 60000 ? 'neutral' : 'good';
  const _insight = {
    title: 'Lo que cuesta la carrera completa',
    text: `Con una pensión de **${fmtPEN(pension)}** por cuota (${cuotasCiclo} cuotas/ciclo${matricula > 0 ? ` + ${fmtPEN(matricula)} de matrícula` : ''}), una carrera de **${numCiclos} ciclos** (${fmtNum(aniosCarrera)} años) cuesta en total **${fmtPEN(costoTotal)}**${aumento > 0 ? ` (incluyendo un aumento anual del ${fmtNum(aumento * 100)}%)` : ''}. Eso es **${fmtPEN(costoCicloBase)}** por ciclo y unos **${fmtPEN(costoAnioBase)}** por año. ${cursados > 0 ? `Te quedan **${ciclosRestantes} ciclos** por pagar: **${fmtPEN(costoRestante)}**.` : 'Planificá este monto antes de empezar: es el compromiso real de toda la carrera.'}`,
    tone,
    icon: '🎓',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Pensiones (cuotas)', value: Math.round(totalPensiones) },
      { label: 'Matrículas', value: Math.round(totalMatriculas) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(costoTotal),
    centerLabel: 'Costo total carrera',
    ariaLabel: `Costo total de la carrera: ${fmtPEN(costoTotal)}, repartido en ${fmtPEN(totalPensiones)} de pensiones y ${fmtPEN(totalMatriculas)} de matrículas.`,
  };

  return {
    costoTotal: fmtPEN(costoTotal),
    costoPorCiclo: fmtPEN(costoCicloBase),
    costoPorAnio: fmtPEN(costoAnioBase),
    costoRestante: fmtPEN(costoRestante),
    totalPensiones: fmtPEN(totalPensiones),
    totalMatriculas: fmtPEN(totalMatriculas),
    detalle: `${numCiclos} ciclos × (${cuotasCiclo} cuotas de ${fmtPEN(pension)}${matricula > 0 ? ` + ${fmtPEN(matricula)} matrícula` : ''}) = ${fmtPEN(costoTotal)}${aumento > 0 ? ` con ajuste anual del ${fmtNum(aumento * 100)}%` : ''}.`,
    _insight,
    _chart,
  };
}

// El form manda '' para opcionales vacíos; Number('')=0 rompe los defaults → tratar ''/null/undefined como ausente.
function num(v: any, def: number): number {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function fmtNum(n: number): string {
  return new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 }).format(Math.round(n * 10) / 10);
}
