/**
 * Sala de decisión CO — "¿Cuánto puedo gastar al mes sin endeudarme?"
 *
 * Patrón PRESUPUESTO localizado a Colombia: adapta la regla 50/30/20 al
 * ingreso real — descuenta fijos (arriendo + administración, servicios,
 * transporte) y cuotas de deuda por separado, aparta la meta de ahorro y
 * devuelve el tope de gasto variable por mes, semana y día. Contexto local:
 * SMLV 2026 ($1.750.905), quincenas y costo de vida DANE.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

const SMLV_2026 = 1750905;

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const fijos = Math.max(0, num(inputs.gastosFijos));
  const cuotasDeuda = Math.max(0, num(inputs.cuotasDeuda));
  const ahorroPct = Math.max(0, Math.min(100, num(inputs.ahorroPct)));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún faltan datos para darte una respuesta',
        detail:
          'Ingresa tu ingreso neto mensual, tus gastos fijos y las cuotas que pagas. Te decimos cuánta plata te queda libre para gastar cada mes, semana y día sin caer en la tarjeta.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tope de gasto libre al mes' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **ingreso neto mensual**: lo que te consignan después de salud, pensión y retención.',
        'Suma tus **gastos fijos** (arriendo y administración, servicios, transporte, mercado base) y las **cuotas** que ya pagas.',
      ],
    };
  }

  const ahorro = ingreso * (ahorroPct / 100);
  const compromisos = fijos + cuotasDeuda;
  const gastoLibre = ingreso - compromisos - ahorro;
  const pctCompromisos = (compromisos / ingreso) * 100;

  // Referencias 50/30/20 con el ingreso real.
  const ref50 = ingreso * 0.5;
  const ref30 = ingreso * 0.3;
  const ref20 = ingreso * 0.2;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (gastoLibre < 0) {
    status = 'a';
    tone = 'bad';
    title = 'Los números no dan: gastas más de lo que te entra';
    badge = 'En rojo';
    detail = `Entre gastos fijos y cuotas (${fmtMoney(compromisos)}) más el ahorro que quieres sostener (${fmtMoney(ahorro)}), superas tu ingreso de ${fmtMoney(ingreso)} por ${fmtMoney(-gastoLibre)}. Antes de pensar en gasto libre toca recortar fijos, renegociar deudas o bajar la meta de ahorro — y sobre todo, no tapar el hueco con la tarjeta.`;
  } else if (pctCompromisos > 60) {
    status = 'tie';
    tone = 'warn';
    title = 'Te queda algo, pero tus fijos te tienen contra las cuerdas';
    badge = 'Apretado';
    detail = `Puedes gastar hasta ${fmtMoney(gastoLibre)} al mes en lo variable, pero tus fijos y cuotas se llevan el ${fmtPct(pctCompromisos, 0)} del ingreso (la referencia sana es hasta 50%). Con tan poco margen, cualquier imprevisto te empuja al pago mínimo de la tarjeta.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tienes un margen sano para gastar tranquilo';
    badge = 'Equilibrado';
    detail = `Cubiertos tus fijos y cuotas (${fmtMoney(compromisos)}) y apartado el ahorro (${fmtMoney(ahorro)}), tu tope de gasto libre es ${fmtMoney(gastoLibre)} al mes. Mientras no lo cruces, no necesitas financiarte con la tarjeta ni tocar el ahorro.`;
  }

  const porSemana = gastoLibre > 0 ? gastoLibre / 4.33 : 0;
  const porDia = gastoLibre > 0 ? gastoLibre / 30 : 0;

  const scenarios = [
    { label: 'Al mes', value: fmtMoney(Math.max(0, gastoLibre)), detail: 'Tu tope mensual para salidas, ropa, domicilios y gustos.' },
    { label: 'A la semana', value: fmtMoney(porSemana), detail: 'El mismo tope repartido por semana — más fácil de vigilar.' },
    { label: 'Al día', value: fmtMoney(porDia), detail: 'Tu referencia diaria para el gasto de bolsillo.' },
  ];

  const breakdown = [
    { label: 'Ingreso neto mensual', value: fmtMoney(ingreso), hint: ingreso < SMLV_2026 * 1.05 ? 'cerca del SMLV 2026 ($1.750.905)' : `≈ ${(ingreso / SMLV_2026).toFixed(1)} salarios mínimos de 2026` },
    { label: 'Gastos fijos', value: fmtMoney(fijos), hint: 'arriendo + administración, servicios, transporte, mercado base' },
    { label: 'Cuotas de deudas', value: fmtMoney(cuotasDeuda), hint: 'tarjetas, créditos, compras a cuotas' },
    { label: 'Fijos + cuotas sobre el ingreso', value: fmtPct(pctCompromisos, 0), hint: `referencia 50%: ${fmtMoney(ref50)}` },
    { label: 'Ahorro que apartas', value: fmtMoney(ahorro), hint: `${fmtPct(ahorroPct, 0)} (la regla sugiere 20%: ${fmtMoney(ref20)})` },
    { label: 'Gasto libre disponible', value: fmtMoney(Math.max(0, gastoLibre)), hint: `referencia 30%: ${fmtMoney(ref30)}` },
  ];

  const nextActions = [
    gastoLibre < 0
      ? 'Estás en déficit estructural: revisa primero las **cuotas de deuda** (¿puedes recoger todo en un solo crédito con mejor tasa?) y después el arriendo, que suele ser el fijo más pesado.'
      : `Tu tope es **${fmtMoney(gastoLibre)}/mes** (${fmtMoney(porSemana)}/semana). Anota el gasto variable — domicilios, salidas, antojos — y frena al llegar al tope, no al llegar al extracto.`,
    pctCompromisos > 50
      ? `Fijos y cuotas se llevan el ${fmtPct(pctCompromisos, 0)} de tu ingreso: por encima del 50% de referencia. El arriendo con administración y las cuotas de tarjeta son los rubros que más mueven la aguja en Colombia — empieza por ahí.`
      : 'Tus compromisos fijos están en zona sana (≤50% del ingreso): tu reto no es recortar sino evitar que el gasto hormiga — domicilios, apps, antojos de quincena — se coma el margen.',
    'Aparta el ahorro **el día que te consignan**, no al final del mes: pásalo de una a una cuenta remunerada aparte. Lo que se queda en la cuenta de gastos, se gasta.',
    'Si tu ingreso llega por quincenas, divide el tope mensual en dos y asigna cada mitad a su quincena: la primera suele cargar el arriendo y la segunda queda más liviana para lo variable.',
  ];

  const notes = [
    'Adapta la regla 50/30/20 (50% necesidades, 30% gustos, 20% ahorro) a tus números reales: el gasto libre sale de restar a tu ingreso los fijos, las cuotas de deuda y el ahorro objetivo, en vez de imponer porcentajes teóricos.',
    'Cuenta como "fijo" lo que pagas sí o sí: arriendo y administración, servicios públicos, plan de celular e internet, transporte y el mercado base del hogar. Lo recortable (comer afuera, ropa, planes) es gasto variable.',
    `Referencia local: el salario mínimo 2026 es $1.750.905 más auxilio de transporte de $249.095, y el DANE estima el costo de vida de un soltero en las ciudades grandes por encima de los $2.000.000 mensuales.`,
    'Es una guía de presupuesto, no asesoría financiera: ajusta los porcentajes a tu realidad.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.max(0, gastoLibre)) + '/mes',
      label: 'Tope de gasto libre sin endeudarte',
      sub: `≈ **${fmtMoney(porSemana)}** por semana, ya cubiertos fijos, cuotas y un ahorro de ${fmtMoney(ahorro)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-puedo-gastar-al-mes',
  title: '¿Cuánto puedo gastar al mes sin endeudarme? Colombia 2026',
  h1: '¿Cuánto puedo gastar al mes sin endeudarme?',
  description:
    'Calcula tu tope de gasto libre mensual en Colombia con la regla 50/30/20 adaptada: a tu ingreso neto le restamos arriendo, servicios, cuotas y tu meta de ahorro. Resultado por mes, semana y día, con referencia al SMLV 2026.',
  intro:
    'Entre el arriendo con administración, los recibos, las cuotas de la tarjeta y los domicilios, la quincena se esfuma sin que sepas en qué. Esta sala adapta la regla 50/30/20 a tus números: toma tu ingreso neto, descuenta los fijos y las cuotas que ya tienes comprometidos, aparta la meta de ahorro y te devuelve un tope claro de cuánta plata puedes gastar en lo variable cada mes, semana y día — sin terminar pagando el mínimo de la tarjeta.',
  icon: '🧮',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    ingresoNeto: 4500000,
    gastosFijos: 2200000,
    cuotasDeuda: 300000,
    ahorroPct: 15,
  },
  fields: [
    { id: 'ingresoNeto', label: 'Tu ingreso neto mensual', type: 'number', prefix: '$', required: true, min: 0, format: 'thousands', placeholder: '4.500.000', help: 'Lo que te consignan al mes, ya descontados salud, pensión y retención. Suma todas tus fuentes.', group: 'Tu plata', groupIcon: '💰' },
    { id: 'gastosFijos', label: 'Gastos fijos mensuales', type: 'number', prefix: '$', required: true, min: 0, format: 'thousands', placeholder: '2.200.000', help: 'Arriendo y administración, servicios públicos, celular e internet, transporte y mercado base.', group: 'Tus compromisos', groupIcon: '🧾' },
    { id: 'cuotasDeuda', label: 'Cuotas de deudas al mes', type: 'number', prefix: '$', default: 0, min: 0, format: 'thousands', placeholder: '300.000', help: 'Tarjetas de crédito, créditos de libre inversión o libranza, compras a cuotas.', group: 'Tus compromisos' },
    { id: 'ahorroPct', label: '% de ahorro que quieres sostener', type: 'number', suffix: '%', default: 20, min: 0, max: 100, placeholder: '15', help: 'La regla 50/30/20 sugiere 20%. Si estás empezando, arranca con lo que puedas cumplir.', group: 'Tu plata' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-salario-neto-colombia-2026-bruto-a-neto', label: 'Salario neto (bruto a neto)' },
    { slug: 'co/calculadora-coste-vida-mensual-colombia-soltero-pareja', label: 'Costo de vida mensual' },
    { slug: 'co/calculadora-canasta-familiar-colombia-dane-mes', label: 'Canasta familiar DANE' },
    { slug: 'co/calculadora-salario-minimo-colombia-2026-auxilio-transporte', label: 'Salario mínimo 2026' },
  ],
  howItWorks: `Esta sala convierte la regla 50/30/20 en un tope de gasto concreto para tu bolsillo colombiano.

1. **Tu ingreso real.** Parte de lo que efectivamente te consignan cada mes — después de salud, pensión y retención en la fuente — sumando todas tus fuentes.
2. **Los compromisos primero.** Resta los fijos (arriendo y administración, servicios, transporte, mercado base) y, por separado, las cuotas de deuda. Juntos no deberían pasar del 50% del ingreso; si lo hacen, la sala te lo advierte.
3. **Págate a ti primero.** Aparta el porcentaje de ahorro que elijas — la regla sugiere 20% — antes de contar el gasto libre. El ahorro que se deja "para lo que sobre" nunca sobra.
4. **Lo que queda es tu tope.** El resto es gasto variable: salidas, ropa, domicilios, planes. Ese número es lo que puedes gastar sin financiarte con la tarjeta.
5. **En porciones de la vida real.** Reparte el tope por semana y por día, y lo contrasta con referencias locales: el SMLV 2026 y el costo de vida que mide el DANE.`,
  faq: [
    { q: '¿Qué es la regla 50/30/20 y cómo se aplica en Colombia?', a: 'Es una guía de presupuesto: 50% del ingreso a necesidades, 30% a gustos y 20% a ahorro. En Colombia el reto es que el arriendo con administración de las ciudades grandes puede comerse solo el 30-40% del ingreso, así que esta sala usa tus números reales en lugar de forzar los porcentajes teóricos.' },
    { q: '¿Qué cuenta como gasto fijo?', a: 'Lo que pagas sí o sí cada mes: arriendo y cuota de administración, servicios públicos, plan de celular e internet, transporte para trabajar y el mercado base del hogar. Las cuotas de deuda van aparte porque son negociables: se pueden reestructurar o recoger en un crédito más barato, cosa que con el arriendo no puedes hacer.' },
    { q: '¿Cuánto debería estar ahorrando?', a: 'La regla sugiere el 20% del ingreso, pero el hábito vale más que el porcentaje: si hoy no ahorras nada, arrancar con un 5-10% sostenido es mejor que prometer 20% y abandonarlo en un mes. Con un ingreso de $4.500.000, un 15% son $675.000 mensuales — más de 4 SMLV ahorrados al año.' },
    { q: '¿Qué hago si mis fijos y cuotas pasan del 50% del ingreso?', a: 'Ataca primero las cuotas: recoger varias deudas de tarjeta (que pueden costar hasta la tasa de usura, 28,79% EA en jun-2026) en un solo crédito de libranza o libre inversión más barato libera flujo de inmediato. Después mira el arriendo: mudarse o compartir es duro, pero es el fijo que más pesa en el presupuesto colombiano.' },
    { q: '¿El mercado va en fijos o en gasto libre?', a: 'El mercado base del hogar — lo del DANE llamaría canasta básica — va en fijos, porque no es recortable de verdad. Los domicilios, restaurantes y antojos van en el gasto libre. Separarlos es clave: mucha gente cree que "no gasta en nada" porque mete todos los domicilios en la bolsa del mercado.' },
    { q: '¿Cómo manejo el presupuesto si me pagan por quincenas?', a: 'Divide el tope mensual en dos y dale a cada quincena su mitad. La primera quincena suele cargar el arriendo y los recibos, así que déjale menos gasto libre; la segunda queda más holgada. Lo que no funciona es gastar la primera quincena como si la segunda ya estuviera en la cuenta.' },
    { q: '¿Este cálculo sirve si gano el salario mínimo?', a: 'Sirve, con una advertencia honesta: con el SMLV 2026 ($1.750.905 más $249.095 de auxilio de transporte) los fijos de una ciudad grande dejan muy poco margen, y la meta de ahorro razonable puede ser 5% o incluso 0% por temporadas. En ese caso el valor de la sala está en ponerle número al tope diario y evitar la deuda de tarjeta, que es la trampa más cara.' },
    { q: '¿Qué hago con la plata que me sobra un mes bueno?', a: 'Primero completa tu fondo de emergencia (3 a 6 meses de gastos esenciales según tu contrato); después abona a capital de la deuda más cara; y solo entonces súbele al gasto o a la inversión. Un excedente que se queda en la cuenta corriente termina convertido en gasto hormiga antes del día 15.' },
  ],
  sources: [
    { name: 'DANE — IPC y canasta familiar', url: 'https://www.dane.gov.co/' },
    { name: 'Ministerio del Trabajo — Salario mínimo 2026', url: 'https://www.mintrabajo.gov.co/' },
    { name: 'Banco de la República — Inflación y estadísticas', url: 'https://www.banrep.gov.co/' },
  ],
};
