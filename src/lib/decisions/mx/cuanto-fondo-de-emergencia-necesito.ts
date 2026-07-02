/**
 * Sala de decisión (México) — "¿Cuánto fondo de emergencia necesito?"
 *
 * Patrón DIMENSIONAMIENTO + PLAN. Ajusta la regla de 3–6 meses de gastos
 * esenciales según la estabilidad del ingreso (nómina IMSS vs honorarios o
 * informal) y las personas que dependen de ti. Además del monto meta, calcula
 * cuánto te falta y en cuántos meses lo logras con tu aporte, con y sin
 * rendimiento (CETES 28 días, cuentas con rendimiento). El aguinaldo y la
 * prima vacacional entran como refuerzos puntuales del plan.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num, bool } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

/** Meses para llegar a la meta aportando cada mes, con rendimiento anual dado. */
function mesesHastaMeta(meta: number, inicial: number, aporte: number, rendAnualPct: number): number {
  if (inicial >= meta) return 0;
  if (aporte <= 0 && rendAnualPct <= 0) return Infinity;
  const r = rendAnualPct / 12 / 100;
  let saldo = inicial;
  let meses = 0;
  const MAX = 600;
  while (saldo < meta && meses < MAX) {
    meses++;
    saldo = saldo * (1 + r) + aporte;
    if (aporte <= 0 && r <= 0) break;
  }
  return meses >= MAX ? Infinity : meses;
}

const fmtMeses = (m: number) => {
  if (!Number.isFinite(m)) return 'sin fecha (no hay aporte)';
  if (m <= 0) return 'ya lo lograste';
  if (m < 12) return `${m} ${m === 1 ? 'mes' : 'meses'}`;
  const a = Math.floor(m / 12);
  const r = m % 12;
  return r === 0 ? `${a} ${a === 1 ? 'año' : 'años'}` : `${a} ${a === 1 ? 'año' : 'años'} y ${r} ${r === 1 ? 'mes' : 'meses'}`;
};

function compute(inputs: Record<string, any>): DecisionResult {
  const gastos = Math.max(0, num(inputs.gastosEsenciales));
  const tipo = String(inputs.tipoIngreso || 'nomina'); // nomina | mixto | independiente
  const dependientes = bool(inputs.dependientes);
  const ahorroActual = Math.max(0, num(inputs.ahorroActual));
  const aporte = Math.max(0, num(inputs.aporteMensual));

  if (!gastos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Ingresa tus gastos esenciales del mes para dimensionar tu fondo de emergencia. Ajustamos los meses según la estabilidad de tu ingreso (nómina, honorarios, informal) y te decimos cuánto te falta y cuándo lo logras.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Fondo de emergencia recomendado' },
      scenarios: [],
      nextActions: [
        'Ingresa tus **gastos esenciales mensuales** (renta, súper, servicios, transporte).',
        'Indica **cómo cobras** (nómina IMSS, honorarios, negocio propio) y cuánto puedes **apartar al mes**.',
      ],
    };
  }

  // Base por estabilidad del ingreso; +1 mes si hay dependientes; techo en 6.
  const base = tipo === 'independiente' ? 6 : tipo === 'mixto' ? 4 : 3;
  const meses = Math.min(6, base + (dependientes ? 1 : 0));
  const meta = meses * gastos;
  const falta = Math.max(0, meta - ahorroActual);
  const cobertura = meta > 0 ? (ahorroActual / meta) * 100 : 0;

  // Plan: meses para lograrlo guardando "en el colchón" vs con rendimiento tipo CETES.
  const mesesSinRend = mesesHastaMeta(meta, ahorroActual, aporte, 0);
  const mesesConCetes = mesesHastaMeta(meta, ahorroActual, aporte, 9);
  const mesesAporteExtra = mesesHastaMeta(meta, ahorroActual, aporte * 1.5, 9);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let title: string;
  if (falta <= 0) {
    status = 'b';
    tone = 'good';
    badge = 'Meta cumplida';
    title = 'Tu fondo de emergencia ya está completo';
  } else if (aporte > 0 && mesesConCetes <= 18) {
    status = 'tie';
    tone = 'neutral';
    badge = 'En camino';
    title = `Te faltan ${fmtMoney(falta)}: lo logras en ${fmtMeses(mesesConCetes)}`;
  } else if (aporte > 0) {
    status = 'a';
    tone = 'warn';
    badge = 'Ritmo corto';
    title = 'A este ritmo tardarás mucho: sube el aporte';
  } else {
    status = 'a';
    tone = 'warn';
    badge = 'Sin plan';
    title = 'Tienes meta pero no plan: define un aporte mensual';
  }

  const detail =
    falta <= 0
      ? `Con ${fmtMoney(ahorroActual)} guardados ya cubres los ${meses} meses de gastos esenciales que tu perfil necesita (${fmtMoney(meta)}). Ahora el trabajo es mantenerlo líquido y con rendimiento, no dejarlo perder valor en una cuenta sin intereses.`
      : `Por la estabilidad de tu ingreso, tu fondo debería cubrir ${meses} meses de gastos esenciales: ${fmtMoney(meta)}. Ya tienes ${fmtMoney(ahorroActual)} (${fmtPct(cobertura, 0)} de la meta) y te faltan ${fmtMoney(falta)}. Apartando ${fmtMoney(aporte)} al mes con rendimiento tipo CETES lo completas en ${fmtMeses(mesesConCetes)}.`;

  const scenarios = [
    { label: 'Guardando sin rendimiento', value: fmtMeses(mesesSinRend), detail: 'Si dejas el dinero en una cuenta que no paga nada (o debajo del colchón).' },
    { label: 'Con rendimiento (~9% anual)', value: fmtMeses(mesesConCetes), detail: 'En CETES 28 días o una cuenta con rendimiento: el interés acelera el plan.' },
    { label: 'Subiendo el aporte 50%', value: fmtMeses(mesesAporteExtra), detail: `Si apartas ${fmtMoney(aporte * 1.5)} al mes en lugar de ${fmtMoney(aporte)}.` },
  ];

  const breakdown = [
    { label: 'Gastos esenciales mensuales', value: fmtMoney(gastos), hint: 'la base del cálculo' },
    { label: 'Estabilidad de tu ingreso', value: tipo === 'independiente' ? 'Honorarios / negocio / informal' : tipo === 'mixto' ? 'Nómina con parte variable' : 'Nómina fija (IMSS)', hint: `base: ${base} meses` },
    ...(dependientes ? [{ label: 'Personas que dependen de ti', value: '+1 mes' }] : []),
    { label: 'Meses recomendados', value: `${meses} meses` },
    { label: 'Fondo de emergencia meta', value: fmtMoney(meta) },
    { label: 'Lo que ya tienes', value: fmtMoney(ahorroActual), hint: `${fmtPct(cobertura, 0)} de la meta` },
    { label: 'Lo que te falta', value: fmtMoney(falta) },
    { label: 'Tiempo estimado para completarlo', value: fmtMeses(mesesConCetes), hint: `apartando ${fmtMoney(aporte)}/mes con rendimiento` },
  ];

  const nextActions = [
    falta <= 0
      ? `Meta cumplida. Mantén el fondo **separado de tu cuenta de gasto** y con rendimiento: si supera los ${fmtMoney(meta)}, el excedente ya puede ir a inversiones de más plazo.`
      : `Tu meta es **${fmtMoney(meta)}** (${meses} meses de gastos esenciales). Programa una transferencia automática de ${fmtMoney(Math.max(aporte, 1))} cada quincena o cada mes, el mismo día que cobras.`,
    'Dónde ponerlo: **CETES a 28 días** (en cetesdirecto puedes empezar desde $100), una **cuenta de ahorro con rendimiento** o un **fondo de deuda de liquidez diaria**. Nada de plazos largos ni instrumentos volátiles: es dinero que debe estar disponible en días.',
    'Usa los ingresos puntuales como turbo: destina **la mitad de tu aguinaldo de diciembre y tu prima vacacional** directo al fondo. Un aguinaldo de 15 días de sueldo puede adelantarte varios meses de golpe.',
    'El fondo es **intocable salvo emergencia real** (pérdida de ingreso, salud, una avería seria). La tarjeta de crédito no es tu fondo de emergencia: es deuda cara esperando su momento.',
  ];

  const notes = [
    'El cálculo parte de 3 meses de gastos esenciales para nómina fija, 4 si tu ingreso tiene parte variable y 6 si vives de honorarios, negocio propio o ingreso informal; suma 1 mes si hay personas que dependen de ti, con techo en 6 meses.',
    'Usa tus gastos ESENCIALES (lo mínimo para vivir un mes), no tu ingreso: el fondo cubre subsistencia mientras te reacomodas, no reemplaza tu sueldo completo.',
    'El escenario con rendimiento asume ~9% anual, en línea con lo que han pagado los CETES; la tasa real varía con las decisiones de Banxico. No es asesoría financiera.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(meta),
      label: 'Fondo de emergencia recomendado',
      sub: falta <= 0
        ? `**${meses} meses** de tus gastos esenciales. Ya lo tienes cubierto.`
        : `**${meses} meses** de gastos. Te faltan **${fmtMoney(falta)}**: lo logras en ${fmtMeses(mesesConCetes)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-fondo-de-emergencia-necesito',
  title: '¿Cuánto fondo de emergencia necesito en México? Meta y plan 2026',
  h1: '¿Cuánto fondo de emergencia necesito?',
  description:
    'Dimensiona tu fondo de emergencia en México: 3–6 meses de gastos esenciales según cobres por nómina, honorarios o negocio propio. Te dice el monto meta, cuánto te falta y en cuántos meses lo completas con CETES o cuenta con rendimiento.',
  intro:
    '"De tres a seis meses de gastos" es la regla que todos repiten, pero el número correcto depende de cómo cobras: no es lo mismo una nómina fija con IMSS que vivir de honorarios o de un negocio propio, donde un mes malo llega sin aviso. Esta sala dimensiona tu fondo según tu estabilidad, te dice cuánto te falta y arma el plan: cuánto apartar, dónde ponerlo (CETES 28 días, cuenta con rendimiento) y cómo usar el aguinaldo para acelerarlo.',
  icon: '🛟',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    gastosEsenciales: 15000,
    tipoIngreso: 'nomina',
    dependientes: 'si',
    ahorroActual: 20000,
    aporteMensual: 3000,
  },
  fields: [
    { id: 'gastosEsenciales', label: 'Tus gastos esenciales al mes', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '15,000', help: 'Lo mínimo para vivir un mes: renta o mantenimiento, súper, servicios, transporte, colegiaturas.', group: 'Tus gastos', groupIcon: '🧾' },
    {
      id: 'tipoIngreso', label: '¿Cómo cobras tu ingreso?', type: 'select', default: 'nomina', recommended: true,
      options: [
        { value: 'nomina', label: 'Nómina fija (IMSS, sueldo estable)' },
        { value: 'mixto', label: 'Nómina con parte variable (comisiones, propinas)' },
        { value: 'independiente', label: 'Honorarios, negocio propio o informal' },
      ],
      help: 'Cuanto menos predecible es tu ingreso, más meses de colchón necesitas.', group: 'Tu riesgo', groupIcon: '⚖️',
    },
    { id: 'dependientes', label: '¿Alguien depende de tu ingreso?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí (hijos, padres, pareja sin ingreso)' }], help: 'Más personas a tu cargo = un mes extra de colchón.', group: 'Tu riesgo' },
    { id: 'ahorroActual', label: 'Lo que ya tienes guardado', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '20,000', help: 'Ahorro líquido disponible hoy para emergencias (no cuenta tu Afore ni inversiones a plazo).', group: 'Tu plan', groupIcon: '📈' },
    { id: 'aporteMensual', label: 'Cuánto puedes apartar al mes', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '3,000', help: 'Lo que puedes transferir al fondo cada mes (o divídelo en dos quincenas).', group: 'Tu plan' },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-fondo-emergencia-mexico-meses-gastos', label: 'Fondo de emergencia en meses de gastos' },
    { slug: 'mx/calculadora-cetes-mexico-rendimiento-28-91-182-364-dias', label: 'Rendimiento de CETES' },
    { slug: 'mx/calculadora-cuenta-de-ahorro-mexico-rendimiento-cetes-directo-nu-mercado-pago', label: 'Cuentas de ahorro con rendimiento' },
    { slug: 'mx/calculadora-aguinaldo-mexico-2026-15-dias-tope-30', label: 'Aguinaldo 2026' },
  ],
  howItWorks: `Esta sala convierte la regla genérica de los "3 a 6 meses" en una meta y un plan con fechas.

1. **La base según cómo cobras.** Nómina fija con IMSS: 3 meses de gastos esenciales (tienes prestaciones y cierta protección ante despido). Ingreso con parte variable: 4 meses. Honorarios, negocio propio o informal: 6 meses, porque no hay finiquito ni incapacidad pagada que te respalde.
2. **Tu carga familiar.** Si alguien depende de tu ingreso, suma un mes más (con techo en 6): sus gastos no se pausan cuando el tuyo falla.
3. **La meta en pesos.** Multiplica los meses por tus gastos esenciales reales — no por tu ingreso — y compara contra lo que ya tienes guardado: eso te da cuánto falta.
4. **El plan con fechas.** Simula mes a mes tu aporte, sin rendimiento y con rendimiento tipo CETES (~9% anual), para decirte en cuántos meses completas el fondo y cuánto acelera cada palanca.
5. **Los refuerzos.** Te sugiere dónde tenerlo líquido y cómo usar aguinaldo y prima vacacional como aportes extraordinarios que adelantan el plan de golpe.`,
  faq: [
    { q: '¿Por qué 3 meses si tengo nómina y 6 si soy independiente?', a: 'Porque el riesgo es distinto. Con nómina formal tienes IMSS, posible finiquito o liquidación y un flujo predecible cada quincena. Con honorarios, negocio propio o ingreso informal no hay red: un cliente que se cae o un mes flojo golpea directo, así que necesitas el doble de colchón.' },
    { q: '¿El fondo se calcula sobre mis gastos o sobre mi sueldo?', a: 'Sobre tus gastos esenciales: renta, súper, servicios, transporte, colegiaturas. Si gastas $15,000 al mes en lo esencial, tu fondo de 4 meses es $60,000, aunque ganes $25,000. El fondo cubre subsistencia mientras te recuperas, no reemplaza tu sueldo completo.' },
    { q: '¿Dónde guardo el fondo de emergencia en México?', a: 'En instrumentos líquidos y de bajo riesgo: CETES a 28 días (en cetesdirecto entras desde $100 y sin comisiones), cuentas de ahorro con rendimiento o fondos de deuda con liquidez diaria. La clave es poder disponer del dinero en horas o pocos días sin castigo.' },
    { q: '¿Los CETES son seguros para este dinero?', a: 'Son de los instrumentos más seguros del país: deuda del Gobierno federal. A 28 días el plazo es corto; un truco útil es escalonar (dividir el fondo en varias emisiones que vencen en semanas distintas) para tener liquidez rodante sin perder rendimiento.' },
    { q: '¿Cómo uso el aguinaldo y la prima vacacional para el fondo?', a: 'Son el turbo perfecto porque no salen de tu quincena normal. El aguinaldo mínimo por ley es de 15 días de sueldo antes del 20 de diciembre: destinar la mitad al fondo puede equivaler a 3 o 4 aportes mensuales de golpe. Lo mismo aplica a la prima vacacional y al reparto de utilidades (PTU) si te toca.' },
    { q: '¿Qué hago si hoy no puedo apartar casi nada?', a: 'Empieza aunque sea con $500 al mes: el hábito importa más que el monto inicial. Ponte como primer objetivo 1 mes de gastos, luego 3. Automatiza la transferencia el día que cae tu quincena, para que el ahorro no dependa de lo que "sobre" a fin de mes (nunca sobra).' },
    { q: '¿Mi tarjeta de crédito no cuenta como fondo de emergencia?', a: 'No. La tarjeta es deuda con CAT alto disfrazada de solución: si la usas en una crisis sin ingreso, el problema se duplica al mes siguiente. El fondo es dinero tuyo, líquido y sin costo. La tarjeta puede ser puente de unos días, nunca el plan.' },
    { q: '¿Puedo usar el fondo para una oportunidad de inversión?', a: 'No. Si lo inviertes en algo volátil o a plazo y justo llega la emergencia, tendrás que vender mal o endeudarte caro, que es exactamente lo que el fondo evita. Cuando la meta esté completa, todo el ahorro adicional sí puede ir a inversiones de más plazo y rendimiento.' },
  ],
  sources: [
    { name: 'CONDUSEF — Educación financiera: ahorro y emergencias', url: 'https://www.condusef.gob.mx/' },
    { name: 'Banxico — Tasas de interés y CETES', url: 'https://www.banxico.org.mx/' },
  ],
};
