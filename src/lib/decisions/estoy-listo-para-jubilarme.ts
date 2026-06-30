/**
 * Sala de decisión — "¿Estoy preparado para jubilarme?"
 *
 * Patrón EVALUACIÓN (¿puedo? salud). Cruza tres cosas: si llegás a la edad y los
 * aportes que pide la ley, la brecha entre lo que vas a cobrar de jubilación y lo
 * que gastás por mes, y cuánto te cubre tu ahorro complementario esa brecha.
 * Devuelve si estás listo, ajustado o con riesgo, y menciona la moratoria si te
 * faltan aportes.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

const EDAD_JUBILACION = 65; // referencia general (varones); mujeres pueden a los 60
const ANIOS_APORTES_REQUERIDOS = 30;

function compute(inputs: Record<string, any>): DecisionResult {
  const edad = Math.max(0, Math.min(100, num(inputs.edad)));
  const aniosAportados = Math.max(0, Math.min(60, num(inputs.aniosAportados)));
  const ingresoJubilacion = Math.max(0, num(inputs.ingresoJubilacionEstimado));
  const gastosMensuales = Math.max(0, num(inputs.gastosMensuales));
  const ahorro = Math.max(0, num(inputs.ahorroComplementario));

  if (!edad || !gastosMensuales || !ingresoJubilacion) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu edad, los años que aportaste, la jubilación que estimás cobrar y tus gastos mensuales. Con eso vemos si estás en condiciones de jubilarte y si te alcanza.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Brecha mensual al jubilarte' },
      scenarios: [],
      nextActions: [
        'Cargá tu **edad** y los **años de aportes** que tenés registrados.',
        'Sumá la **jubilación estimada** y tus **gastos mensuales** para ver si te alcanza.',
      ],
    };
  }

  const faltanAportes = Math.max(0, ANIOS_APORTES_REQUERIDOS - aniosAportados);
  const cumpleEdad = edad >= EDAD_JUBILACION;
  const cumpleAportes = faltanAportes <= 0;

  // Brecha mensual: lo que te falta para cubrir tus gastos con la jubilación.
  const brechaMensual = gastosMensuales - ingresoJubilacion; // + => te falta plata
  const mesesQueCubreAhorro = brechaMensual > 0 ? ahorro / brechaMensual : Infinity;
  const aniosQueCubre = mesesQueCubreAhorro / 12;

  // — Veredicto — salud financiera del retiro.
  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (brechaMensual <= 0) {
    status = 'b'; // listo
    tone = 'good';
    title = 'La jubilación te alcanza para cubrir tus gastos';
    badge = 'Listo';
    detail = `Tu jubilación estimada (${fmtMoney(ingresoJubilacion)}) cubre tus gastos mensuales (${fmtMoney(gastosMensuales)}) con ${fmtMoney(-brechaMensual)} de margen. ${cumpleAportes && cumpleEdad ? 'Cumplís edad y aportes: estás en condiciones de jubilarte.' : 'Financieramente estás bien; revisá igual los requisitos de edad y aportes.'}`;
  } else if (Number.isFinite(mesesQueCubreAhorro) && mesesQueCubreAhorro > 24) {
    status = 'tie'; // ajustado pero el ahorro aguanta
    tone = 'neutral';
    title = 'Te falta, pero tu ahorro complementario cubre la brecha un buen tiempo';
    badge = 'Ajustado';
    detail = `Te falta ${fmtMoney(brechaMensual)} por mes para llegar a tus gastos. Tu ahorro de ${fmtMoney(ahorro)} cubre esa brecha unos ${aniosQueCubre.toFixed(1).replace('.', ',')} años. Estás ajustado: reforzá el ahorro o bajá gastos antes de retirarte del todo.`;
  } else {
    status = 'a'; // riesgo
    tone = 'warn';
    title = 'Hoy no estás preparado para jubilarte: hay riesgo';
    badge = 'En riesgo';
    detail = `Tu jubilación deja una brecha de ${fmtMoney(brechaMensual)} por mes contra tus gastos, y tu ahorro complementario solo la cubre ${Number.isFinite(mesesQueCubreAhorro) ? `${mesesQueCubreAhorro.toFixed(0)} meses` : 'muy poco'}. Conviene seguir trabajando/aportando, reforzar el ahorro o ajustar el nivel de gastos antes de jubilarte.`;
  }

  const reqDetalle = `${cumpleEdad ? `Cumplís la edad (${edad} años)` : `Te faltan ${EDAD_JUBILACION - edad} años para los ${EDAD_JUBILACION}`} · ${cumpleAportes ? `Tenés los ${ANIOS_APORTES_REQUERIDOS} años de aportes` : `Te faltan ${faltanAportes} años de aportes`}`;

  const scenarios = [
    {
      label: 'Solo con la jubilación',
      value: brechaMensual <= 0 ? 'Te alcanza' : `Faltan ${fmtMoney(brechaMensual)}/mes`,
      detail: `Jubilación ${fmtMoney(ingresoJubilacion)} contra gastos ${fmtMoney(gastosMensuales)}.`,
    },
    {
      label: 'Con tu ahorro',
      value: brechaMensual <= 0 ? 'No lo necesitás' : Number.isFinite(mesesQueCubreAhorro) ? `${aniosQueCubre.toFixed(1).replace('.', ',')} años` : '—',
      detail: brechaMensual <= 0
        ? 'Tu jubilación ya cubre los gastos; el ahorro queda de respaldo.'
        : `Cuánto tiempo tu ahorro de ${fmtMoney(ahorro)} cubre la brecha mensual.`,
    },
    {
      label: 'Requisitos legales',
      value: cumpleEdad && cumpleAportes ? 'Cumplís' : 'Te faltan',
      detail: reqDetalle,
    },
  ];

  const breakdown = [
    { label: 'Edad actual', value: edad + ' años', hint: cumpleEdad ? 'Cumplís la edad jubilatoria' : `Faltan ${EDAD_JUBILACION - edad} para los ${EDAD_JUBILACION}` },
    { label: 'Años aportados', value: aniosAportados + ' años', hint: cumpleAportes ? 'Llegás a los 30 requeridos' : `Faltan ${faltanAportes} años` },
    { label: 'Jubilación estimada', value: fmtMoney(ingresoJubilacion) + '/mes' },
    { label: 'Gastos mensuales', value: fmtMoney(gastosMensuales) + '/mes' },
    { label: 'Brecha mensual', value: brechaMensual > 0 ? '-' + fmtMoney(brechaMensual).replace('-', '') + '/mes' : '+' + fmtMoney(-brechaMensual) + '/mes', hint: brechaMensual > 0 ? 'Lo que te falta cada mes' : 'Te sobra cada mes' },
    { label: 'Ahorro complementario', value: fmtMoney(ahorro) },
    { label: 'Tiempo que cubre el ahorro', value: brechaMensual <= 0 ? 'No lo necesitás' : Number.isFinite(mesesQueCubreAhorro) ? `${aniosQueCubre.toFixed(1).replace('.', ',')} años` : '—' },
  ];

  const nextActions = [
    brechaMensual > 0
      ? `Te falta **${fmtMoney(brechaMensual)} por mes**. Reforzá tu ahorro o tu inversión de retiro: con interés compuesto, cada año extra de aportes pesa mucho.`
      : `Tu jubilación cubre los gastos con **${fmtMoney(-brechaMensual)} de margen** por mes. Mantené ese colchón invertido para que no lo licúe la inflación.`,
    faltanAportes > 0
      ? `Te faltan **${faltanAportes} años de aportes**. Podés seguir trabajando para completarlos o evaluar la **moratoria previsional** (Ley 27.705 / plan de regularización vigente), que permite comprar aportes faltantes y descontarlos del haber.`
      : 'Tenés los años de aportes requeridos: verificá en ANSES que estén todos registrados antes de iniciar el trámite.',
    'Pedí en **ANSES tu historia laboral completa** y simulá el haber: la jubilación estimada que cargaste conviene confirmarla con datos oficiales.',
    'Si te alcanza el tiempo, considerá **retrasar el retiro** o un retiro parcial: cada año más de aporte y de ahorro mejora bastante tu situación de largo plazo.',
  ];

  const notes = [
    'Los requisitos de referencia son 65 años de edad (los varones; las mujeres pueden optar a los 60) y 30 años de aportes (Ley 24.241). Hay regímenes diferenciales y la edad mínima puede variar.',
    'Si te faltan aportes, las moratorias previsionales permiten regularizar años faltantes pagándolos en cuotas que se descuentan del haber; su disponibilidad y condiciones cambian con la normativa vigente.',
    'La jubilación estimada y la brecha son orientativas: el haber real lo determina ANSES según tu historia laboral. No es asesoramiento previsional ni financiero; consultá en ANSES y con un profesional matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: brechaMensual > 0 ? '-' + fmtMoney(brechaMensual).replace('-', '') + '/mes' : 'Te alcanza',
      label: brechaMensual > 0 ? 'Brecha mensual al jubilarte' : 'Margen mensual',
      sub: brechaMensual > 0
        ? `Tu ahorro cubre esa brecha ${Number.isFinite(mesesQueCubreAhorro) ? `unos **${aniosQueCubre.toFixed(1).replace('.', ',')} años**` : 'muy poco tiempo'}. ${reqDetalle}.`
        : `Jubilación ${fmtMoney(ingresoJubilacion)} cubre tus gastos. ${reqDetalle}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'estoy-listo-para-jubilarme',
  title: '¿Estoy preparado para jubilarme? Test de retiro 2026',
  h1: '¿Estoy preparado para jubilarme?',
  description:
    'Verificá si estás listo para jubilarte: edad y años de aportes requeridos, la brecha entre tu jubilación estimada y tus gastos, y cuánto te cubre tu ahorro. Incluye la moratoria si te faltan aportes.',
  intro:
    'Jubilarte no es solo llegar a la edad: hay que ver si tenés los aportes, si la jubilación te alcanza para vivir y cuánto te cubre tu ahorro si queda una brecha. Esta sala cruza las tres cosas y te dice si estás listo, ajustado o con riesgo, y qué hacer en cada caso, incluida la moratoria si te faltan años de aportes.',
  icon: '👵',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    edad: 63,
    aniosAportados: 27,
    ingresoJubilacionEstimado: 850000,
    gastosMensuales: 1100000,
    ahorroComplementario: 12000000,
  },
  fields: [
    {
      id: 'edad',
      label: 'Tu edad actual',
      type: 'number',
      suffix: 'años',
      required: true,
      min: 18,
      max: 100,
      placeholder: '63',
      help: 'La edad jubilatoria de referencia es 65 (varones) o 60 (mujeres).',
      group: 'Tu situación previsional',
      groupIcon: '👴',
    },
    {
      id: 'aniosAportados',
      label: 'Años de aportes',
      type: 'number',
      suffix: 'años',
      required: true,
      min: 0,
      max: 60,
      placeholder: '27',
      help: 'Años con aportes registrados. Se requieren 30 para la jubilación ordinaria.',
      group: 'Tu situación previsional',
    },
    {
      id: 'ingresoJubilacionEstimado',
      label: 'Jubilación estimada por mes',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '850000',
      help: 'Lo que estimás cobrar de jubilación. Podés confirmarlo en ANSES.',
      group: 'Las cuentas',
      groupIcon: '💰',
    },
    {
      id: 'gastosMensuales',
      label: 'Gastos mensuales',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1100000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Todo lo que gastás por mes para vivir.',
      group: 'Las cuentas',
    },
    {
      id: 'ahorroComplementario',
      label: 'Ahorro complementario',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '12000000',
      profileKey: 'finanzas.ahorros',
      help: 'Plata o inversiones que tenés para complementar la jubilación.',
      group: 'Las cuentas',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-fire-retiro-temprano', label: 'FIRE / retiro temprano' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'regla-50-30-20', label: 'Presupuesto 50/30/20' },
  ],
  howItWorks: `Estar listo para jubilarte es cumplir los requisitos Y que te alcance. Esta sala mira las dos cosas.

1. **Requisitos legales.** Compara tu edad con la edad jubilatoria de referencia (65 varones / 60 mujeres) y tus años de aportes con los 30 que pide la jubilación ordinaria. Si te faltan aportes, te dice cuántos.
2. **Brecha mensual.** Resta tu jubilación estimada a tus gastos mensuales. Si la jubilación cubre todo, tenés margen; si no, esa brecha es lo que vas a necesitar de otra fuente cada mes.
3. **Cobertura del ahorro.** Calcula cuántos años cubre tu ahorro complementario esa brecha. Es lo que define si una situación ajustada es sostenible o riesgosa.
4. **Veredicto.** Listo (la jubilación alcanza), ajustado (falta, pero el ahorro aguanta más de dos años) o en riesgo (falta y el ahorro cubre poco).
5. **Moratoria si faltan aportes.** Si no llegás a los 30 años, te recuerda la opción de la moratoria previsional para regularizar los aportes faltantes en cuotas descontadas del haber.`,
  faq: [
    {
      q: '¿Qué requisitos necesito para jubilarme en Argentina?',
      a: 'La jubilación ordinaria pide, como regla general, 65 años de edad para los varones (60 para las mujeres, que pueden optar) y 30 años de aportes. Hay regímenes diferenciales y especiales con otros requisitos. Esta sala compara tu situación con esos parámetros de referencia.',
    },
    {
      q: '¿Qué pasa si no llego a los 30 años de aportes?',
      a: 'Tenés varias opciones: seguir trabajando para completarlos, esperar a la PUAM si llegás a la edad sin los aportes, o usar una moratoria previsional para comprar los años faltantes en cuotas que se descuentan del haber. Esta sala te dice cuántos años te faltan.',
    },
    {
      q: '¿Qué es la moratoria previsional?',
      a: 'Es un plan que permite regularizar aportes no realizados pagándolos en cuotas que se descuentan de la jubilación. Su disponibilidad y condiciones cambian con la normativa vigente (por ejemplo la Ley 27.705 y planes posteriores), así que conviene consultar en ANSES la opción activa.',
    },
    {
      q: '¿Cómo sé cuánto voy a cobrar de jubilación?',
      a: 'El haber lo determina ANSES según tu historia laboral y los últimos sueldos aportados. Podés pedir tu historia laboral y una simulación en ANSES. La jubilación estimada que cargás en esta sala conviene confirmarla con esos datos oficiales.',
    },
    {
      q: '¿Por qué importa la brecha entre jubilación y gastos?',
      a: 'Porque la jubilación suele ser menor que el último sueldo, y si tus gastos no bajan, queda un faltante mensual. Esa brecha es lo que vas a tener que cubrir con ahorro, inversiones u otros ingresos. Saberla con tiempo te permite prepararte.',
    },
    {
      q: '¿Cuánto ahorro complementario necesito para retirarme?',
      a: 'Depende de la brecha mensual y de cuántos años quieras cubrirla. Una referencia es que tu ahorro alcance para muchos años de esa brecha (idealmente invertido para no perder contra la inflación). La sala te muestra cuántos años cubre tu ahorro actual.',
    },
    {
      q: '¿Conviene retrasar la jubilación?',
      a: 'Si tu situación es ajustada o riesgosa, cada año más de aporte y de ahorro mejora bastante el panorama: sumás aportes, dejás crecer tu ahorro y acortás los años que tenés que financiar. Por eso un retiro parcial o postergado suele ser una buena salida.',
    },
    {
      q: '¿Esto reemplaza el asesoramiento de ANSES o un profesional?',
      a: 'No. Es una herramienta orientativa para ver si vas encaminado. El haber real, los requisitos exactos y la moratoria aplicable los define ANSES; para tu caso consultá en ANSES y, para la parte financiera, con un asesor matriculado.',
    },
  ],
  sources: [
    { name: 'ANSES — Jubilaciones y pensiones', url: 'https://www.anses.gob.ar/jubilados-y-pensionados' },
    { name: 'Ley 24.241 — Sistema Integrado Previsional Argentino (SIPA)', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-24241-639' },
    { name: 'Ley 27.705 — Plan de Pago de Deuda Previsional (moratoria)', url: 'https://www.argentina.gob.ar/normativa' },
  ],
};
