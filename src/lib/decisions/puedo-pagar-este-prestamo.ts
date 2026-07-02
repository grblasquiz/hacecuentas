/**
 * Sala de decisión — "¿Puedo pagar este préstamo?"
 *
 * Patrón SALUD FINANCIERA. Calcula la cuota del préstamo (sistema francés) y la
 * cruza con tu ingreso, gastos fijos y otras deudas para responder lo único que
 * importa antes de firmar: ¿la cuota entra en tu presupuesto sin asfixiarte?
 * Usa la relación cuota/ingreso como semáforo (regla del 25-35%).
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

/** Cuota sistema francés: cuota = V·i / (1−(1+i)^−n). i = TNA/12/100. */
function cuotaFrancesa(monto: number, tnaPct: number, n: number): number {
  if (n <= 0) return 0;
  const i = tnaPct / 12 / 100;
  if (i === 0) return monto / n;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
}

function compute(inputs: Record<string, any>): DecisionResult {
  const monto = Math.max(0, num(inputs.monto));
  const tna = Math.max(0, num(inputs.tnaPorcentaje));
  const plazo = Math.max(0, num(inputs.plazoMeses));
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const gastosFijos = Math.max(0, num(inputs.gastosFijos));
  const otrasDeudas = Math.max(0, num(inputs.otrasDeudas));

  if (!monto || !tna || !plazo || !ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el monto, la tasa (TNA) y el plazo del préstamo, más tu ingreso neto mensual. Con eso calculamos la cuota y si entra sin desordenar tus finanzas.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Cuota mensual del préstamo' },
      scenarios: [],
      nextActions: [
        'Cargá el **monto, la tasa (TNA) y el plazo** del préstamo que te ofrecen.',
        'Sumá tu **ingreso neto mensual** y tus **gastos fijos** para ver si la cuota entra.',
      ],
    };
  }

  // Cuota "probable" con la fórmula francesa (cuota fija, sin comisiones).
  const cuota = cuotaFrancesa(monto, tna, plazo);
  const totalPagado = cuota * plazo;
  const costoCredito = totalPagado - monto;

  // Relación cuota/ingreso (DTI). Sumamos otras deudas para el DTI total.
  const dtiCuota = (cuota / ingreso) * 100;
  const dtiTotal = ((cuota + otrasDeudas) / ingreso) * 100;
  const sobranteAntes = ingreso - gastosFijos - otrasDeudas;
  const sobranteDespues = sobranteAntes - cuota;

  // Cuota máxima saludable: 25% del ingreso menos lo que ya te llevan otras deudas.
  const cuotaMaxSaludable = Math.max(0, ingreso * 0.25 - otrasDeudas);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (dtiTotal < 25 && sobranteDespues > 0) {
    status = 'b';
    tone = 'good';
    title = 'Sí, podés pagarlo con margen';
    badge = 'Entra cómodo';
  } else if (dtiTotal <= 35 && sobranteDespues > 0) {
    status = 'tie';
    tone = 'neutral';
    title = 'Podés, pero quedás justo: revisá los números';
    badge = 'Ajustado';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Cuidado: la cuota te deja sin aire';
    badge = 'Riesgoso';
  }

  const detail = `La cuota es de ${fmtMoney(cuota)}/mes, el ${fmtPct(dtiCuota, 0)} de tu ingreso neto. Sumando tus otras deudas, comprometés el ${fmtPct(dtiTotal, 0)} de lo que entra. Después de pagar gastos fijos, deudas y esta cuota te quedan ${fmtMoney(sobranteDespues)} libres por mes. La cuota máxima saludable para vos es de ${fmtMoney(cuotaMaxSaludable)}.`;

  // 3 escenarios: variá la tasa ±, manteniendo plazo.
  const cuotaPesimista = cuotaFrancesa(monto, tna * 1.2, plazo);
  const cuotaOptimista = cuotaFrancesa(monto, tna * 0.85, plazo);

  const scenarios = [
    { label: 'Pesimista (+20% tasa)', value: fmtMoney(cuotaPesimista) + '/mes', detail: `Si la tasa sube a ${fmtPct(tna * 1.2, 0)} TNA. DTI ${fmtPct((cuotaPesimista / ingreso) * 100, 0)} de tu ingreso.` },
    { label: 'Probable', value: fmtMoney(cuota) + '/mes', detail: `Con la tasa que cargaste (${fmtPct(tna, 0)} TNA). DTI ${fmtPct(dtiCuota, 0)}.` },
    { label: 'Optimista (−15% tasa)', value: fmtMoney(cuotaOptimista) + '/mes', detail: `Si conseguís ${fmtPct(tna * 0.85, 0)} TNA. DTI ${fmtPct((cuotaOptimista / ingreso) * 100, 0)}.` },
  ];

  const breakdown = [
    { label: 'Cuota mensual (sistema francés)', value: fmtMoney(cuota), hint: `${plazo} cuotas` },
    { label: 'Total a pagar', value: fmtMoney(totalPagado) },
    { label: 'Costo del crédito (intereses)', value: fmtMoney(costoCredito), hint: `≈ ${fmtPct((costoCredito / monto) * 100, 0)} sobre el capital` },
    { label: 'Relación cuota / ingreso', value: fmtPct(dtiCuota, 0), hint: 'saludable: menos del 25%' },
    { label: 'Relación deuda total / ingreso', value: fmtPct(dtiTotal, 0), hint: 'incluye otras deudas' },
    { label: 'Cuota máxima saludable', value: fmtMoney(cuotaMaxSaludable), hint: '25% del ingreso − otras deudas' },
    { label: 'Te queda libre por mes', value: fmtMoney(sobranteDespues), hint: 'tras gastos fijos, deudas y esta cuota' },
  ];

  const nextActions = [
    dtiTotal > 35
      ? `La cuota compromete el ${fmtPct(dtiTotal, 0)} de tu ingreso, por encima del 35% saludable. **Pedí un plazo más largo o un monto menor** para bajar la cuota a unos ${fmtMoney(cuotaMaxSaludable)}.`
      : `La cuota entra dentro de lo saludable. Aun así, antes de firmar **confirmá el CFT real** (con seguros y comisiones), que es más alto que la TNA.`,
    `Tras pagar todo te quedan ${fmtMoney(sobranteDespues)}/mes: ${sobranteDespues > 0 ? 'asegurate de que alcancen para imprevistos y para ahorrar algo.' : 'no alcanza: este préstamo te deja en rojo, no lo tomes así.'}`,
    'Compará al menos **3 ofertas por su CFT** (no por la TNA ni por "la cuota más baja"): la cuota baja con plazos largos suele esconder un costo total mucho mayor.',
    'Si la cuota es fija en pesos y hay inflación, con el tiempo pesa menos sobre tu sueldo: tenelo en cuenta, pero no tomes deuda contando con eso.',
  ];

  const notes = [
    'La cuota se calcula con el sistema francés (cuota fija): cuota = V·i / (1−(1+i)⁻ⁿ), con i = TNA/12. No incluye seguros ni comisiones, así que el CFT real es más alto.',
    'La regla del 25-35% es una guía general de salud financiera: idealmente las cuotas de todas tus deudas no deberían superar el 25-35% de tu ingreso neto.',
    'No es asesoramiento financiero. Antes de firmar, leé el contrato, confirmá el CFT y verificá el costo de cancelación anticipada.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(cuota) + '/mes',
      label: 'Cuota del préstamo',
      sub: `Es el **${fmtPct(dtiCuota, 0)}** de tu ingreso. Tu cuota máxima saludable: **${fmtMoney(cuotaMaxSaludable)}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'puedo-pagar-este-prestamo',
  title: '¿Puedo pagar este préstamo? Calculá la cuota y si te entra 2026',
  h1: '¿Puedo pagar este préstamo?',
  description:
    'Calculá la cuota del préstamo y cruzala con tu ingreso, gastos y deudas para saber si te entra sin asfixiarte. Usa la relación cuota/ingreso (regla del 25-35%) y te dice tu cuota máxima saludable.',
  intro:
    'Antes de firmar un préstamo, la pregunta no es "¿cuánto me prestan?" sino "¿puedo pagar la cuota sin quedarme sin aire?". Esta sala calcula la cuota por el sistema francés y la cruza con tu ingreso, tus gastos fijos y tus otras deudas para darte un semáforo claro: si entra cómodo, si quedás justo o si te deja en rojo.',
  icon: '🏦',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    monto: 3000000,
    tnaPorcentaje: 85,
    plazoMeses: 24,
    ingresoNeto: 1300000,
    gastosFijos: 700000,
    otrasDeudas: 100000,
  },
  fields: [
    { id: 'monto', label: 'Monto del préstamo', type: 'number', prefix: '$', required: true, min: 0, placeholder: '3000000', help: 'Capital que vas a pedir.', group: 'El préstamo', groupIcon: '🏦' },
    { id: 'tnaPorcentaje', label: 'Tasa (TNA)', type: 'number', suffix: '%', required: true, min: 0, placeholder: '85', help: 'Tasa nominal anual que te ofrecen.', group: 'El préstamo' },
    { id: 'plazoMeses', label: 'Plazo (meses)', type: 'number', required: true, min: 1, max: 120, placeholder: '24', help: 'En cuántas cuotas lo pagás.', group: 'El préstamo' },
    { id: 'ingresoNeto', label: 'Tu ingreso neto mensual', type: 'number', prefix: '$', required: true, min: 0, placeholder: '1300000', profileKey: 'trabajo.sueldoNeto', help: 'Lo que te queda en mano por mes, ya con descuentos.', group: 'Tu economía', groupIcon: '💰' },
    { id: 'gastosFijos', label: 'Gastos fijos mensuales', type: 'number', prefix: '$', recommended: true, min: 0, placeholder: '700000', profileKey: 'gastos.recurrentesMensual', help: 'Alquiler, servicios, comida, transporte: lo que pagás sí o sí.', group: 'Tu economía' },
    { id: 'otrasDeudas', label: 'Cuotas de otras deudas', type: 'number', prefix: '$', default: 0, min: 0, placeholder: '100000', help: 'Suma de cuotas mensuales de otros préstamos o tarjetas.', group: 'Tu economía' },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
    { slug: 'calculadora-cft-prestamo-personal-comparativa', label: 'CFT de un préstamo' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
  ],
  howItWorks: `Esta sala no calcula solo la cuota: te dice si tu bolsillo la banca.

1. **La cuota.** Con el monto, la tasa (TNA) y el plazo, calcula la cuota fija por el sistema francés, el más usado en préstamos personales: cuota = V·i / (1−(1+i)⁻ⁿ).
2. **El costo total.** Multiplica la cuota por el plazo para mostrarte cuánto pagás en total y cuánto de eso son intereses.
3. **Relación cuota/ingreso (DTI).** Divide la cuota por tu ingreso neto. La regla de salud financiera dice que tus cuotas no deberían superar el 25-35% de lo que ganás.
4. **Tu cuota máxima saludable.** Calcula cuánto es el 25% de tu ingreso menos lo que ya te llevan otras deudas: ese es el techo recomendable para la nueva cuota.
5. **El veredicto.** Cruza todo (ingreso, gastos fijos, otras deudas y la cuota) y te dice cuánto te queda libre por mes y si el préstamo entra cómodo, justo o te deja en rojo.`,
  faq: [
    { q: '¿Qué porcentaje de mi sueldo puede ir a la cuota?', a: 'Como guía de salud financiera, la suma de todas tus cuotas de deuda no debería superar el 25-35% de tu ingreso neto. Por debajo del 25% estás cómodo; entre 25% y 35% vas justo; por encima del 35% el riesgo de ahogarte es alto.' },
    { q: '¿Cómo se calcula la cuota de un préstamo?', a: 'Con el sistema francés, que da una cuota fija durante todo el plazo: cuota = V·i / (1−(1+i)⁻ⁿ), donde V es el monto, i la tasa mensual (TNA dividido 12) y n la cantidad de cuotas. Al principio pagás más interés y menos capital; al final, al revés.' },
    { q: '¿Por qué la cuota real puede ser mayor a la que calculo?', a: 'Porque la cuota del sistema francés usa solo la tasa de interés. El CFT (Costo Financiero Total) suma seguros de vida, comisiones e IVA, así que la cuota que te cobra el banco suele ser más alta. Pedí siempre la cuota final con CFT incluido.' },
    { q: '¿Conviene un plazo más largo para bajar la cuota?', a: 'Baja la cuota mensual, sí, pero pagás muchos más intereses en total. Un plazo largo solo conviene si necesitás que la cuota entre en tu presupuesto; si podés, elegí el plazo más corto que puedas sostener para pagar menos.' },
    { q: '¿Qué pasa si la cuota me deja sin margen para imprevistos?', a: 'Es una señal de alerta. Si después de pagar gastos fijos, deudas y la cuota no te queda un colchón para imprevistos, cualquier gasto inesperado te empuja a más deuda. Mejor bajar el monto, alargar el plazo o postergar el préstamo.' },
    { q: '¿La inflación me ayuda a pagar el préstamo?', a: 'Si la cuota es fija en pesos y tu sueldo se actualiza, con el tiempo la cuota pesa menos sobre tu ingreso. Es un alivio real, pero no tomes deuda contando con eso: si tu sueldo no acompaña la inflación, el alivio no aparece.' },
    { q: '¿Debo incluir mis otras deudas en el cálculo?', a: 'Sí. Lo que importa para tu salud financiera es la suma de TODAS las cuotas, no solo la nueva. Por eso esta sala te pide tus otras cuotas mensuales y calcula la relación deuda total sobre ingreso, que es la que mira un banco.' },
    { q: '¿Esto reemplaza la evaluación del banco?', a: 'No. Es una herramienta orientativa para que decidas con tus propios números antes de pedir. El banco hará su propio análisis crediticio. Para decisiones grandes, consultá además con un asesor financiero matriculado.' },
  ],
  sources: [
    { name: 'BCRA — Costo Financiero Total (CFT)', url: 'https://www.bcra.gob.ar/' },
    { name: 'BCRA — Préstamos y sistema francés', url: 'https://www.bcra.gob.ar/BCRAyVos/default.asp' },
  ],
};
