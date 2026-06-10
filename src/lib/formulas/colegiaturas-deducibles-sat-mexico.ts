/**
 * Colegiaturas deducibles SAT — decreto de estímulo fiscal (compilación DOF 26-dic-2013, Arts. 1.8–1.10).
 * Tope ANUAL POR ALUMNO según nivel: preescolar $14,200, primaria $12,900, secundaria $19,900,
 * profesional técnico $17,100, bachillerato $24,500. Va FUERA del tope global de deducciones
 * personales (5 UMA / 15% de ingresos). Universidad NO es deducible.
 * Constantes desde src/lib/data/mexico-2026.ts (topes por nivel, tarifa ISR anual 2026).
 */
import { MEXICO_2026, isrAnual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  hijosPreescolar?: number;   pagoPreescolar?: number;
  hijosPrimaria?: number;     pagoPrimaria?: number;
  hijosSecundaria?: number;   pagoSecundaria?: number;
  hijosBachillerato?: number; pagoBachillerato?: number;
  hijosProfTecnico?: number;  pagoProfTecnico?: number;
  ingresosAnuales?: number;   // opcional: para estimar el ahorro de ISR a tu tarifa real
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const topes = MEXICO_2026.deduccionesPersonales.colegiaturas;

  const niveles = [
    { label: 'Preescolar', tope: topes.preescolar, hijos: num(i.hijosPreescolar, 0), pago: Math.max(0, num(i.pagoPreescolar, 0)) },
    { label: 'Primaria', tope: topes.primaria, hijos: num(i.hijosPrimaria, 0), pago: Math.max(0, num(i.pagoPrimaria, 0)) },
    { label: 'Secundaria', tope: topes.secundaria, hijos: num(i.hijosSecundaria, 0), pago: Math.max(0, num(i.pagoSecundaria, 0)) },
    { label: 'Bachillerato', tope: topes.bachillerato, hijos: num(i.hijosBachillerato, 0), pago: Math.max(0, num(i.pagoBachillerato, 0)) },
    { label: 'Profesional técnico', tope: topes.profesionalTecnico, hijos: num(i.hijosProfTecnico, 0), pago: Math.max(0, num(i.pagoProfTecnico, 0)) },
  ].map((n) => {
    // Si capturó pago pero no hijos, asumimos 1 alumno en ese nivel.
    const hijos = Math.max(0, Math.floor(n.hijos)) || (n.pago > 0 ? 1 : 0);
    const deducible = Math.min(n.pago, n.tope * hijos);
    return { ...n, hijos, deducible, recorte: n.pago - deducible };
  });

  const conPago = niveles.filter((n) => n.pago > 0);
  if (conPago.length === 0) {
    throw new Error('Captura al menos una colegiatura anual pagada (en el nivel escolar que corresponda)');
  }

  const totalPagado = conPago.reduce((a, n) => a + n.pago, 0);
  const totalDeducible = conPago.reduce((a, n) => a + n.deducible, 0);
  const totalRecorte = totalPagado - totalDeducible;
  const totalAlumnos = conPago.reduce((a, n) => a + n.hijos, 0);

  // Ahorro de ISR con la tarifa anual real (Art. 152), si capturó ingresos.
  const ingresos = num(i.ingresosAnuales, 0);
  let ahorro = 0;
  let tasaEfectiva = 0;
  if (ingresos > 0) {
    ahorro = Math.max(0, isrAnual2026(ingresos) - isrAnual2026(Math.max(0, ingresos - totalDeducible)));
    tasaEfectiva = totalDeducible > 0 ? (ahorro / totalDeducible) * 100 : 0;
  }

  const desglose = conPago
    .map((n) => `${n.label}: ${fmtMXN(r2(n.deducible))} de ${fmtMXN(r2(n.pago))} pagados (tope ${fmtMXN(n.tope)} × ${n.hijos} alumno${n.hijos > 1 ? 's' : ''})`)
    .join(' · ');

  const _insight = {
    title: 'Cuánto deduces por colegiaturas',
    text: `Pagaste **${fmtMXN(r2(totalPagado))}** de colegiaturas por ${totalAlumnos} alumno${totalAlumnos > 1 ? 's' : ''} y puedes deducir **${fmtMXN(r2(totalDeducible))}**${totalRecorte > 0 ? ` — ${fmtMXN(r2(totalRecorte))} exceden los topes por nivel y no se deducen` : ' (todo entra: no rebasas los topes por nivel)'}. ${ingresos > 0 ? `A tus ingresos de ${fmtMXN(ingresos)}, eso te ahorraría **~${fmtMXN(r2(ahorro))}** de ISR (un ${tasaEfectiva.toFixed(1)}% de lo deducido).` : 'Captura tus ingresos anuales para estimar el ahorro de ISR.'} Recuerda: las colegiaturas van **aparte** del tope global de deducciones personales, pero solo cuentan si pagaste con transferencia, tarjeta o cheque (nunca efectivo) y la escuela tiene RVOE.`,
    tone: totalRecorte > 0 ? 'warn' : 'good',
    icon: '🏫',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      ...conPago.map((n) => ({ label: n.label, value: r2(n.deducible) })),
      { label: 'No deducible (excede tope)', value: r2(totalRecorte) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(r2(totalDeducible)),
    centerLabel: 'Colegiaturas deducibles',
    ariaLabel: `Colegiaturas deducibles por ${fmtMXN(r2(totalDeducible))} de ${fmtMXN(r2(totalPagado))} pagados; ${fmtMXN(r2(totalRecorte))} exceden los topes por nivel.`,
  };

  return {
    totalDeducible: fmtMXN(r2(totalDeducible)),
    recorte: totalRecorte > 0
      ? `${fmtMXN(r2(totalRecorte))} pagados que exceden el tope de su nivel (no se deducen)`
      : '$0 — ninguna colegiatura rebasa el tope de su nivel',
    ahorroIsr: ingresos > 0
      ? `~${fmtMXN(r2(ahorro))} (tarifa anual Art. 152 sobre tus ingresos)`
      : 'Captura tus ingresos anuales para estimarlo',
    detalle: `${desglose}. Requisitos: pago con medio bancarizado (no efectivo), escuela con RVOE y CFDI con el complemento de instituciones educativas a tu RFC. La inscripción, los útiles y la universidad no son deducibles.`,
    _insight,
    _chart,
  };
}
