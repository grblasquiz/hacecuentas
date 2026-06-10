/**
 * Pensión por invalidez IMSS (Ley 97) — 35% del salario promedio de las últimas 500 semanas
 * (LSS Art. 141) + asignaciones familiares (LSS Art. 138): 15% cónyuge, 10% por hijo,
 * 10% por ascendiente (solo sin cónyuge ni hijos) o ayuda asistencial 15% sin dependientes.
 * Requisito: 250 semanas cotizadas, o 150 si la invalidez es ≥75%. SBC topado a 25 UMA.
 * Constantes desde src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  salarioPromedio: number;
  periodo?: string;        // 'mensual' | 'diario'
  semanas: number;
  gradoInvalidez?: string; // 'menor75' (50–74%) | 'mayor75' (≥75%)
  conyuge?: string;        // 'no' | 'si'
  hijos?: number;
  ascendientes?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { pensionInvalidez, uma, imss, salarioMinimo } = MEXICO_2026;

  const salario = num(i.salarioPromedio, 0);
  if (salario <= 0) throw new Error('Ingresa tu salario promedio de las últimas 500 semanas');
  const semanas = Math.floor(num(i.semanas, 0));
  if (semanas <= 0) throw new Error('Ingresa tus semanas cotizadas (las ves en tu constancia IMSS)');

  const periodo = String(i.periodo || 'mensual') === 'diario' ? 'diario' : 'mensual';
  const grado75 = String(i.gradoInvalidez || 'menor75') === 'mayor75';
  const conConyuge = String(i.conyuge || 'no') === 'si';
  const hijos = Math.max(0, Math.floor(num(i.hijos, 0)));
  const ascendientes = Math.max(0, Math.floor(num(i.ascendientes, 0)));

  // Salario promedio mensual, topado al SBC máximo (25 UMA diarias, LSS Art. 28).
  const factorMensual = salarioMinimo.factorMensual; // 30.4
  const topeMensual = uma.diaria * imss.topeSbcUmas * factorMensual; // $89,155.60 en 2026
  const salarioMensualIngresado = periodo === 'diario' ? salario * factorMensual : salario;
  const topado = salarioMensualIngresado > topeMensual;
  const salarioMensual = Math.min(salarioMensualIngresado, topeMensual);

  // Cuantía básica: 35% del salario promedio (LSS Art. 141).
  const cuantiaBasica = salarioMensual * pensionInvalidez.porcentajeSalarioPromedio;

  // Asignaciones familiares (LSS Art. 138), como % de la cuantía de la pensión:
  // 15% cónyuge + 10% por hijo; ascendientes (10% c/u) solo si no hay cónyuge ni hijos;
  // ayuda asistencial 15% si no hay ningún dependiente.
  let pctAsignaciones = 0;
  const detalleAsig: string[] = [];
  if (conConyuge) {
    pctAsignaciones += pensionInvalidez.asignacionConyuge;
    detalleAsig.push(`cónyuge ${(pensionInvalidez.asignacionConyuge * 100).toFixed(0)}%`);
  }
  if (hijos > 0) {
    pctAsignaciones += pensionInvalidez.asignacionHijo * hijos;
    detalleAsig.push(`${hijos} hijo${hijos > 1 ? 's' : ''} ${(pensionInvalidez.asignacionHijo * 100).toFixed(0)}% c/u`);
  }
  if (!conConyuge && hijos === 0 && ascendientes > 0) {
    pctAsignaciones += pensionInvalidez.asignacionAscendiente * ascendientes;
    detalleAsig.push(`${ascendientes} ascendiente${ascendientes > 1 ? 's' : ''} ${(pensionInvalidez.asignacionAscendiente * 100).toFixed(0)}% c/u`);
  }
  if (!conConyuge && hijos === 0 && ascendientes === 0) {
    pctAsignaciones += pensionInvalidez.ayudaAsistencial;
    detalleAsig.push(`ayuda asistencial ${(pensionInvalidez.ayudaAsistencial * 100).toFixed(0)}%`);
  }

  const asignaciones = cuantiaBasica * pctAsignaciones;
  const pensionTotal = cuantiaBasica + asignaciones;

  // Requisito de semanas: 250, o 150 si la invalidez es ≥75% (LSS Art. 122).
  const semanasRequeridas = grado75
    ? pensionInvalidez.semanasRequeridasInvalidez75
    : pensionInvalidez.semanasRequeridas;
  const cumple = semanas >= semanasRequeridas;
  const requisito = cumple
    ? `Cumples: ${semanas} semanas ≥ ${semanasRequeridas} requeridas (invalidez ${grado75 ? '≥75%' : 'del 50% al 74%'}).`
    : `No cumples todavía: tienes ${semanas} semanas y necesitas ${semanasRequeridas} (te faltan ${semanasRequeridas - semanas}). Con invalidez ≥75% el requisito baja a ${pensionInvalidez.semanasRequeridasInvalidez75} semanas.`;

  const _insight = cumple
    ? {
        title: 'Tu pensión por invalidez estimada',
        text: `Con un salario promedio de **${fmtMXN(salarioMensual)}** al mes${topado ? ' (topado a 25 UMA)' : ''}, la cuantía básica es **${fmtMXN(cuantiaBasica)}** (35%) y con asignaciones (${detalleAsig.join(' + ')}) la pensión llega a **${fmtMXN(pensionTotal)}** mensuales. La ley garantiza además que la pensión no quede por debajo de la pensión garantizada vigente (LSS Art. 141).`,
        tone: 'good',
        icon: '🦽',
      }
    : {
        title: 'Aún no cumples las semanas requeridas',
        text: `El monto teórico sería **${fmtMXN(pensionTotal)}** al mes, pero con **${semanas} semanas** no alcanzas las **${semanasRequeridas}** que exige la ley${grado75 ? '' : ` (o ${pensionInvalidez.semanasRequeridasInvalidez75} si el dictamen determina invalidez ≥75%)`}. Si te faltan pocas, revisa Modalidad 40 o continuar cotizando antes del dictamen.`,
        tone: 'warn',
        icon: '⚠️',
      };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cuantía básica (35%)', value: Math.round(cuantiaBasica) },
      { label: 'Asignaciones familiares', value: Math.round(asignaciones) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(pensionTotal),
    centerLabel: cumple ? 'Pensión mensual' : 'Monto teórico',
    ariaLabel: `Pensión por invalidez estimada de ${fmtMXN(pensionTotal)} mensuales: ${fmtMXN(cuantiaBasica)} de cuantía básica más ${fmtMXN(asignaciones)} de asignaciones familiares.`,
  };

  return {
    pensionMensual: fmtMXN(pensionTotal) + ' al mes',
    cuantiaBasica: fmtMXN(cuantiaBasica) + ` (35% de ${fmtMXN(salarioMensual)})`,
    asignaciones: asignaciones > 0 ? fmtMXN(asignaciones) + ` (${detalleAsig.join(' + ')})` : fmtMXN(0),
    requisito,
    detalle: `Salario promedio ${fmtMXN(salarioMensual)}${topado ? ' (topado a 25 UMA = ' + fmtMXN(topeMensual) + ')' : ''} × 35% = ${fmtMXN(cuantiaBasica)} + asignaciones ${fmtMXN(asignaciones)} = ${fmtMXN(pensionTotal)} mensuales.`,
    _insight,
    _chart,
  };
}
