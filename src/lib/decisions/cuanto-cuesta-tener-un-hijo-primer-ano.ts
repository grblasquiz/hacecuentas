/**
 * Sala de decisión — "¿Cuánto cuesta tener un hijo el primer año?"
 *
 * Patrón BREAKDOWN. Suma el costo total del primer año de un bebé:
 * gastos mensuales recurrentes × 12 (pañales, alimentación, salud, guardería)
 * + el desembolso inicial de equipamiento (cuna, cochecito, ropa) + la caída de
 * ingreso por la licencia sin goce de sueldo. Devuelve el costo total y, sobre
 * todo, el impacto MENSUAL que tenés que poder bancar.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const panales = Math.max(0, num(inputs.gastoPanalesMes));
  const alimentacion = Math.max(0, num(inputs.gastoAlimentacionMes));
  const salud = Math.max(0, num(inputs.saludMensual));
  const equipamiento = Math.max(0, num(inputs.ropaEquipamientoInicial));
  const cunaCochecito = Math.max(0, num(inputs.cunaCochecito));
  const guarderia = Math.max(0, num(inputs.guarderiaMensual));
  const caidaMeses = Math.max(0, Math.min(12, num(inputs.caidaIngresoMeses)));
  const ingreso = Math.max(0, num(inputs.ingresoMensual));

  const gastoMensualRecurrente = panales + alimentacion + salud + guarderia;

  if (!gastoMensualRecurrente && !equipamiento && !cunaCochecito) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá al menos los gastos mensuales del bebé (pañales, alimentación, salud) y el equipamiento inicial para estimar el costo del primer año.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Costo total del primer año' },
      scenarios: [],
      nextActions: [
        'Cargá los **gastos mensuales** del bebé: pañales, alimentación (leche/papillas) y salud.',
        'Sumá el **equipamiento inicial** (cuna, cochecito, ropa) que se paga una sola vez.',
      ],
    };
  }

  const gastosAnuales = gastoMensualRecurrente * 12;
  const equipamientoInicial = equipamiento + cunaCochecito;
  const caidaIngreso = ingreso * caidaMeses;
  const totalPrimerAnio = gastosAnuales + equipamientoInicial + caidaIngreso;

  // Impacto mensual promedio (todo el costo prorrateado en 12 meses).
  const impactoMensual = totalPrimerAnio / 12;

  // — Veredicto: el peso del primer año sobre el presupuesto —
  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  const ratio = ingreso > 0 ? impactoMensual / ingreso : 0;
  if (ingreso > 0 && ratio <= 0.25) {
    status = 'b';
    tone = 'good';
    title = 'El primer año entra cómodo en tu presupuesto';
    badge = 'Manejable';
  } else if (ingreso > 0 && ratio <= 0.5) {
    status = 'tie';
    tone = 'neutral';
    title = 'El primer año pesa: vas a tener que reordenar gastos';
    badge = 'Ajustado';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'El primer año es un esfuerzo grande: planificá con tiempo';
    badge = 'Esfuerzo alto';
  }

  const detail = `Tener un hijo el primer año te cuesta unos ${fmtMoney(totalPrimerAnio)} en total: ${fmtMoney(gastosAnuales)} de gastos mensuales (${fmtMoney(gastoMensualRecurrente)}/mes × 12), ${fmtMoney(equipamientoInicial)} de equipamiento inicial${caidaIngreso > 0 ? ` y ${fmtMoney(caidaIngreso)} de ingreso que resignás durante la licencia` : ''}. Prorrateado, son ${fmtMoney(impactoMensual)} por mes.`;

  const scenarios = [
    {
      label: 'Austero',
      value: fmtMoney(totalPrimerAnio * 0.8),
      detail: 'Lactancia, ropa y equipamiento de segunda mano o prestados (−20%).',
    },
    {
      label: 'Probable',
      value: fmtMoney(totalPrimerAnio),
      detail: 'Con los gastos que cargaste, a 12 meses.',
    },
    {
      label: 'Holgado',
      value: fmtMoney(totalPrimerAnio * 1.25),
      detail: 'Equipamiento nuevo, leche de fórmula y algún imprevisto de salud (+25%).',
    },
  ];

  const breakdown = [
    { label: 'Pañales (×12 meses)', value: fmtMoney(panales * 12), hint: `${fmtMoney(panales)}/mes` },
    { label: 'Alimentación (×12 meses)', value: fmtMoney(alimentacion * 12), hint: `${fmtMoney(alimentacion)}/mes` },
    { label: 'Salud / obra social (×12 meses)', value: fmtMoney(salud * 12), hint: `${fmtMoney(salud)}/mes` },
    ...(guarderia > 0
      ? [{ label: 'Guardería (×12 meses)', value: fmtMoney(guarderia * 12), hint: `${fmtMoney(guarderia)}/mes` }]
      : []),
    { label: 'Cuna + cochecito (único)', value: fmtMoney(cunaCochecito) },
    { label: 'Ropa y equipamiento inicial (único)', value: fmtMoney(equipamiento) },
    ...(caidaIngreso > 0
      ? [{ label: `Ingreso resignado (${caidaMeses} meses de licencia)`, value: '-' + fmtMoney(caidaIngreso).replace('-', '') }]
      : []),
    { label: 'Costo total primer año', value: fmtMoney(totalPrimerAnio), hint: `≈ ${fmtMoney(impactoMensual)}/mes` },
  ];

  const nextActions = [
    `Apartá un fondo para el **equipamiento inicial** (${fmtMoney(equipamientoInicial)}): es el desembolso fuerte y concentrado de los primeros meses.`,
    caidaIngreso > 0
      ? `Durante la licencia resignás ${fmtMoney(caidaIngreso)}: armá un colchón ANTES del nacimiento para cubrir esos ${caidaMeses} meses sin ese ingreso.`
      : 'Revisá tu licencia: si es sin goce de sueldo, sumá esos meses de ingreso resignado a tu colchón previo al nacimiento.',
    'Comprá lo grande (cuna, cochecito, huevito) **usado o prestado**: bajan rapidísimo de precio y se usan poco tiempo.',
    'Tramitá la **Asignación por Hijo / asignación familiar de ANSES** apenas nazca: ayuda a compensar parte del gasto mensual.',
  ];

  const notes = [
    'Es una estimación orientativa: el costo real varía muchísimo según lactancia vs fórmula, obra social, ciudad y si comprás nuevo o usado.',
    'El "ingreso resignado" cuenta la licencia sin goce de sueldo como costo de oportunidad; si cobrás licencia paga, dejá ese campo en 0.',
    'No es asesoramiento financiero. Ajustá los montos a tu realidad y considerá que la inflación mueve estos valores mes a mes.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(totalPrimerAnio),
      label: 'Costo total del primer año',
      sub: `Impacto mensual: **${fmtMoney(impactoMensual)}/mes** prorrateado · Gasto recurrente: **${fmtMoney(gastoMensualRecurrente)}/mes**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cuesta-tener-un-hijo-primer-ano',
  title: '¿Cuánto cuesta tener un hijo el primer año? 2026',
  h1: '¿Cuánto cuesta tener un hijo el primer año?',
  description:
    'Calculá el costo total del primer año de un bebé en Argentina: pañales, alimentación, salud, guardería, cuna, cochecito y la caída de ingreso por la licencia. Con el impacto mensual real.',
  intro:
    'Tener un hijo no es un solo gasto: son los pañales y la leche todos los meses, el equipamiento que comprás de golpe (cuna, cochecito, ropa) y el ingreso que resignás durante la licencia. Esta sala suma todo y te dice cuánto te cuesta el primer año completo y, sobre todo, cuánto pesa por mes en tu presupuesto.',
  icon: '👶',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    gastoPanalesMes: 80000,
    gastoAlimentacionMes: 60000,
    saludMensual: 50000,
    ropaEquipamientoInicial: 250000,
    cunaCochecito: 450000,
    guarderiaMensual: 0,
    caidaIngresoMeses: 3,
    ingresoMensual: 900000,
  },
  fields: [
    {
      id: 'gastoPanalesMes',
      label: 'Pañales por mes',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '80000',
      help: 'Un recién nacido usa entre 6 y 10 pañales por día.',
      group: 'Gastos mensuales',
      groupIcon: '🍼',
    },
    {
      id: 'gastoAlimentacionMes',
      label: 'Alimentación por mes',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '60000',
      help: 'Leche de fórmula, papillas y, más adelante, comida. La lactancia baja mucho este costo.',
      group: 'Gastos mensuales',
    },
    {
      id: 'saludMensual',
      label: 'Salud por mes',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '50000',
      help: 'Plus de obra social / prepaga por el bebé, vacunas no cubiertas, farmacia.',
      group: 'Gastos mensuales',
    },
    {
      id: 'guarderiaMensual',
      label: 'Guardería por mes',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      help: 'Opcional. Solo si pensás usar guardería durante el primer año.',
      group: 'Gastos mensuales',
    },
    {
      id: 'cunaCochecito',
      label: 'Cuna + cochecito (único)',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '450000',
      help: 'Equipamiento grande que comprás una sola vez: cuna, cochecito, huevito, cambiador.',
      group: 'Equipamiento inicial',
      groupIcon: '🛏️',
    },
    {
      id: 'ropaEquipamientoInicial',
      label: 'Ropa y ajuar inicial (único)',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '250000',
      help: 'Bodies, mamaderas, bañera, monitor y demás de los primeros meses.',
      group: 'Equipamiento inicial',
    },
    {
      id: 'ingresoMensual',
      label: 'Tu ingreso mensual',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '900000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'Para medir cuánto pesa el bebé sobre lo que entra por mes.',
      group: 'Tu ingreso',
      groupIcon: '💵',
    },
    {
      id: 'caidaIngresoMeses',
      label: 'Meses de licencia sin goce',
      type: 'number',
      default: 0,
      min: 0,
      max: 12,
      advanced: true,
      help: 'Meses que NO vas a cobrar sueldo por la licencia. Si cobrás licencia paga, dejá 0.',
      group: 'Tu ingreso',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-interes-compuesto', label: 'Ahorro con interés compuesto' },
  ],
  howItWorks: `Esta sala suma los tres tipos de costo que tiene el primer año de un bebé.

1. **Gastos mensuales recurrentes.** Suma pañales, alimentación, salud y (si la usás) guardería, y los multiplica por 12 meses. Es el gasto que vas a sostener todos los meses.
2. **Equipamiento inicial.** Suma la cuna, el cochecito y el ajuar/ropa: el desembolso fuerte y concentrado que pagás una sola vez al principio.
3. **Ingreso resignado.** Si tomás licencia sin goce de sueldo, cuenta esos meses de ingreso que dejás de cobrar como un costo real del año.
4. **Costo total y por mes.** Suma todo para darte el costo del primer año completo y lo prorratea en 12 para mostrarte el impacto mensual promedio.
5. **Veredicto.** Compara ese impacto mensual contra tu ingreso para decirte si entra cómodo, si vas a tener que reordenar gastos o si requiere planificar con tiempo.`,
  faq: [
    {
      q: '¿Cuánto cuesta tener un bebé el primer año en Argentina?',
      a: 'Depende mucho de la lactancia, la obra social y si comprás nuevo o usado, pero entre gastos mensuales (pañales, alimentación, salud), el equipamiento inicial (cuna, cochecito, ropa) y la eventual caída de ingreso por la licencia, el primer año suele ser el más caro. Esta sala suma todos esos rubros con tus propios números.',
    },
    {
      q: '¿Cuál es el gasto más grande del primer año?',
      a: 'Suele haber dos: el equipamiento inicial (cuna, cochecito, huevito) que se paga de golpe al principio, y los pañales, que se compran todos los meses. La lactancia, cuando es posible, baja muchísimo el costo de alimentación.',
    },
    {
      q: '¿Conviene comprar la cuna y el cochecito nuevos o usados?',
      a: 'El equipamiento grande se usa muy poco tiempo y baja rápido de precio, así que comprarlo usado o aceptarlo prestado ahorra una parte importante del desembolso inicial. La excepción habitual es el huevito/sillita de auto, donde conviene revisar que esté en buen estado y no haya tenido choques.',
    },
    {
      q: '¿Cómo afecta la licencia sin goce de sueldo?',
      a: 'Si tomás meses de licencia sin cobrar sueldo, ese ingreso resignado es un costo real del año aunque no sea un gasto. Esta sala te deja sumarlo: cargá cuántos meses no vas a cobrar y tu ingreso mensual para verlo reflejado en el total.',
    },
    {
      q: '¿La asignación de ANSES ayuda a cubrir estos gastos?',
      a: 'Sí. Según tu situación laboral podés cobrar la asignación por hijo o la asignación familiar, que compensan parte del gasto mensual. Conviene tramitarlas apenas nace el bebé. Esta sala no las descuenta del total, así que el costo neto puede ser algo menor.',
    },
    {
      q: '¿Cuánto debería ahorrar antes de que nazca?',
      a: 'Como mínimo, lo suficiente para cubrir el equipamiento inicial más los meses de licencia sin goce de sueldo. Tener ese colchón armado antes del nacimiento evita arrancar la maternidad/paternidad endeudándote.',
    },
    {
      q: '¿Esta estimación incluye los gastos del parto?',
      a: 'No. Se enfoca en el costo de criar al bebé el primer año (gastos recurrentes + equipamiento + ingreso resignado). Los gastos del embarazo y el parto dependen de tu cobertura médica y conviene estimarlos aparte con tu obra social o prepaga.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa para que planifiques con números reales. Ajustá los montos a tu situación y recordá que la inflación mueve estos valores; para decisiones grandes consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'ANSES — Asignaciones familiares', url: 'https://www.anses.gob.ar/' },
    { name: 'INDEC — Canasta básica e inflación', url: 'https://www.indec.gob.ar/' },
  ],
};
