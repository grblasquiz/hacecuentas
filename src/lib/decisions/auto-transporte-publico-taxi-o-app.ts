/**
 * Sala de decisión — "¿Auto, transporte público, taxi o app?"
 *
 * Patrón COMPARACIÓN de 4 opciones (mostradas en breakdown). Calcula el costo
 * mensual total de moverte por cada medio según tu nivel de uso (viajes/mes), y
 * le suma el VALOR DEL TIEMPO perdido (horas estimadas × valor hora). El auto es
 * costo fijo alto (TCO) sin importar cuánto lo uses; los viajes sueltos escalan
 * con el uso. Gana el de menor costo mensual total.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const viajes = Math.max(0, num(inputs.viajesMensuales));
  const costoAuto = Math.max(0, num(inputs.costoAutoMensual));
  const costoTransp = Math.max(0, num(inputs.costoTransportePublicoMensual));
  const taxiPorViaje = Math.max(0, num(inputs.costoTaxiPromedioViaje));
  const appPorViaje = Math.max(0, num(inputs.costoAppPromedioViaje));
  const valorHora = Math.max(0, num(inputs.valorHora));
  const minutosExtraTransp = Math.max(0, num(inputs.minutosExtraTransportePorViaje));

  if (!viajes || (!costoAuto && !costoTransp && !taxiPorViaje && !appPorViaje)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá cuántos viajes hacés por mes y el costo de cada opción: el costo mensual del auto, el abono de transporte público y el promedio por viaje en taxi y en app.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Opción más barata por mes' },
      scenarios: [],
      nextActions: [
        'Cargá tus **viajes por mes** (ida y vuelta cuentan como 2).',
        'Cargá el **costo mensual del auto** (TCO) y los **promedios por viaje** de taxi y app.',
      ],
    };
  }

  // Costo de transporte por opción (sin tiempo).
  const costoTaxiMes = taxiPorViaje * viajes;
  const costoAppMes = appPorViaje * viajes;

  // Valor del tiempo: el transporte público suele tardar más por viaje.
  // El valor del tiempo extra del transporte público (las otras opciones se toman
  // como baseline de tiempo). horas extra/mes = viajes × minutos extra / 60.
  const valorTiempoTranspMes = valorHora > 0
    ? (viajes * minutosExtraTransp / 60) * valorHora
    : 0;

  const opciones = [
    { key: 'auto', label: 'Auto propio', costo: costoAuto, tiempo: 0 },
    { key: 'transporte', label: 'Transporte público', costo: costoTransp, tiempo: valorTiempoTranspMes },
    { key: 'taxi', label: 'Taxi', costo: costoTaxiMes, tiempo: 0 },
    { key: 'app', label: 'App (Uber/Cabify)', costo: costoAppMes, tiempo: 0 },
  ].map((o) => ({ ...o, total: o.costo + o.tiempo }));

  // Solo consideramos opciones con costo > 0 (las que cargaste).
  const validas = opciones.filter((o) => o.costo > 0 || (o.key === 'transporte' && o.tiempo > 0));
  const ordenadas = [...validas].sort((a, b) => a.total - b.total);
  const ganadora = ordenadas[0];
  const segunda = ordenadas[1];
  const diff = segunda ? segunda.total - ganadora.total : 0;
  const margenPct = segunda && segunda.total > 0 ? (diff / segunda.total) * 100 : 100;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let title: string;
  let detail: string;

  // status: 'a' si gana el auto, 'b' si gana una alternativa, 'tie' si es parejo.
  if (margenPct < 8 && segunda) {
    status = 'tie';
    tone = 'neutral';
    title = `${ganadora.label} y ${segunda.label} salen casi lo mismo`;
    badge = 'Es parejo';
    detail = `${ganadora.label} cuesta ${fmtMoney(ganadora.total)}/mes y ${segunda.label} ${fmtMoney(segunda.total)}/mes: diferencia de apenas ${fmtMoney(diff)}. Con esa brecha decidí por comodidad y flexibilidad.`;
  } else {
    status = ganadora.key === 'auto' ? 'a' : 'b';
    tone = 'good';
    title = `Te conviene: ${ganadora.label}`;
    badge = ganadora.label;
    detail = `Para tus ${viajes} viajes al mes, ${ganadora.label} es la opción más barata: ${fmtMoney(ganadora.total)}/mes${valorHora > 0 ? ' (incluyendo el valor de tu tiempo)' : ''}. Te ahorra ${fmtMoney(diff)}/mes frente a la siguiente opción (${segunda ? segunda.label : '—'}).`;
  }

  // Escenarios: cómo cambia el ganador a distintos niveles de uso.
  const ganadorEn = (v: number) => {
    const opts = [
      { label: 'Auto', total: costoAuto },
      { label: 'Transp.', total: costoTransp + (valorHora > 0 ? (v * minutosExtraTransp / 60) * valorHora : 0) },
      { label: 'Taxi', total: taxiPorViaje * v },
      { label: 'App', total: appPorViaje * v },
    ].filter((o) => o.total > 0);
    if (!opts.length) return '—';
    return opts.sort((a, b) => a.total - b.total)[0].label;
  };

  const scenarios = [
    {
      label: 'Uso bajo (10 viajes/mes)',
      value: ganadorEn(10),
      detail: 'Con poco uso, el costo fijo del auto pesa más: ganan los viajes sueltos.',
    },
    {
      label: `Tu uso (${viajes} viajes/mes)`,
      value: ganadora.label.split(' ')[0],
      detail: `${fmtMoney(ganadora.total)}/mes, la opción más barata para vos.`,
    },
    {
      label: 'Uso alto (60 viajes/mes)',
      value: ganadorEn(60),
      detail: 'Con mucho uso, el auto y el transporte público diluyen su costo fijo.',
    },
  ];

  const breakdown = opciones.map((o) => ({
    label: o.label,
    value: o.costo > 0 || o.tiempo > 0 ? fmtMoney(o.total) + '/mes' : '—',
    hint: o.key === o.key && o === ganadora
      ? 'la más barata'
      : o.key === 'transporte' && o.tiempo > 0
        ? `incluye ${fmtMoney(o.tiempo)} de tu tiempo`
        : o.key === 'taxi' && o.costo > 0
          ? `${viajes} viajes × ${fmtMoney(taxiPorViaje)}`
          : o.key === 'app' && o.costo > 0
            ? `${viajes} viajes × ${fmtMoney(appPorViaje)}`
            : undefined,
  }));

  const nextActions = [
    `Para tus ${viajes} viajes al mes, **${ganadora.label}** es lo más barato (${fmtMoney(ganadora.total)}/mes). ${diff > 0 ? `Cambiar a esta opción te ahorra ${fmtMoney(diff)}/mes.` : ''}`,
    ganadora.key === 'auto'
      ? 'El auto te conviene por tu nivel de uso. Igual revisá que el costo mensual (TCO) esté completo: usá la sala "¿Puedo mantener este auto?".'
      : 'Si pensás dejar el auto, recordá que vender libera plata y baja gastos: corré la sala "¿Me conviene vender mi auto?".',
    valorHora > 0
      ? 'Cargaste el valor de tu tiempo: por eso el transporte público suma las horas extra que perdés. Si tu tiempo vale mucho, las opciones puerta a puerta ganan terreno.'
      : 'Cargá el **valor de tu hora** para que la cuenta incluya el tiempo perdido: el transporte público es barato en plata pero caro en horas.',
    'Considerá un **mix**: transporte público para la rutina + app para casos puntuales suele ganarle al auto si no lo usás todos los días.',
  ];

  const notes = [
    'El costo del auto es su TCO mensual (cuota, seguro, patente, combustible, service prorrateados), no solo la nafta: por eso compite aunque parezca "ya lo tengo".',
    'El valor del tiempo se aplica solo al transporte público (suele tardar más). Es un supuesto: ajustá los minutos extra y tu valor hora a tu realidad.',
    'Orientativo, no es asesoramiento financiero. No incluye comodidad, clima ni disponibilidad, que también pesan en la decisión real.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ganadora.total) + '/mes',
      label: `Opción más barata: ${ganadora.label}`,
      sub: segunda ? `Te ahorra **${fmtMoney(diff)}/mes** frente a ${segunda.label} (${fmtMoney(segunda.total)}/mes).` : undefined,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'auto-transporte-publico-taxi-o-app',
  title: '¿Auto, transporte público, taxi o app? Comparador de costos 2026',
  h1: '¿Auto, transporte público, taxi o app?',
  description:
    'Compará el costo mensual real de moverte en auto propio, transporte público, taxi o app según cuánto viajes, incluyendo el valor de tu tiempo. Te decimos cuál te sale más barato.',
  intro:
    'Tener auto es un costo fijo alto lo uses o no; los viajes sueltos en taxi o app escalan con el uso; el transporte público es lo más barato en plata pero te cuesta tiempo. La opción más conveniente depende de cuánto te movés. Esta sala calcula el costo mensual de las cuatro —incluyendo el valor de tu tiempo— y te dice cuál gana para tu nivel de uso.',
  icon: '🚦',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    viajesMensuales: 40,
    costoAutoMensual: 700000,
    costoTransportePublicoMensual: 70000,
    costoTaxiPromedioViaje: 12000,
    costoAppPromedioViaje: 9000,
    valorHora: 8000,
    minutosExtraTransportePorViaje: 25,
  },
  fields: [
    {
      id: 'viajesMensuales',
      label: 'Viajes por mes',
      type: 'number',
      required: true,
      min: 0,
      placeholder: '40',
      help: 'Cantidad de viajes mensuales. Ida y vuelta cuentan como 2.',
      group: 'Tu uso',
      groupIcon: '🧭',
    },
    {
      id: 'costoAutoMensual',
      label: 'Costo mensual del auto (TCO)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '700000',
      help: 'Cuota + seguro + patente + combustible + service por mes. Dejá 0 si no tenés auto.',
      group: 'Costos por opción',
      groupIcon: '💸',
    },
    {
      id: 'costoTransportePublicoMensual',
      label: 'Transporte público (mensual)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '70000',
      help: 'Lo que gastás por mes en colectivo, subte o tren (con SUBE).',
      group: 'Costos por opción',
    },
    {
      id: 'costoTaxiPromedioViaje',
      label: 'Taxi: promedio por viaje',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '12000',
      help: 'Cuánto te sale en promedio un viaje en taxi.',
      group: 'Costos por opción',
    },
    {
      id: 'costoAppPromedioViaje',
      label: 'App: promedio por viaje',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '9000',
      help: 'Promedio por viaje en Uber, Cabify, DiDi, etc.',
      group: 'Costos por opción',
    },
    {
      id: 'valorHora',
      label: 'Valor de tu hora',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '8000',
      help: 'Cuánto vale una hora de tu tiempo (sueldo por hora o lo que te pagarían).',
      group: 'Tu tiempo',
      groupIcon: '⏱️',
    },
    {
      id: 'minutosExtraTransportePorViaje',
      label: 'Minutos extra del transporte público',
      type: 'number',
      default: 0,
      min: 0,
      max: 180,
      advanced: true,
      placeholder: '25',
      help: 'Cuántos minutos más tarda cada viaje en transporte público vs puerta a puerta.',
      group: 'Tu tiempo',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-combustible-viaje-auto', label: 'Costo de combustible' },
    { slug: 'sueldo-en-mano-argentina', label: 'Tu sueldo por hora' },
    { slug: 'regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `La sala calcula cuánto te cuesta moverte por mes con cada medio, según tu nivel de uso, y le suma el valor de tu tiempo.

1. **Costo de cada opción.** El auto y el transporte público son costos mensuales fijos; el taxi y la app escalan con tus viajes (precio por viaje × cantidad).
2. **Valor del tiempo.** El transporte público suele tardar más: multiplica los minutos extra por viaje por tu valor hora y lo suma a su costo. Las demás opciones se toman como baseline de tiempo.
3. **Costo mensual total.** Para cada opción suma plata + tiempo. Es lo que realmente te cuesta moverte.
4. **Veredicto.** Gana el menor costo total para tu nivel de uso. Si las dos mejores quedan a menos de 8%, lo declaramos parejo y manda la comodidad.
5. **Escenarios.** Muestra cómo cambia el ganador con uso bajo (10 viajes), tu uso, y uso alto (60 viajes): el auto conviene cuanto más lo uses.`,
  faq: [
    {
      q: '¿Cuándo conviene tener auto en vez de usar apps?',
      a: 'Cuanto más te movés. El auto tiene un costo fijo alto (cuota, seguro, patente) que pagás uses o no, pero por viaje sale barato. Si hacés muchos viajes al mes, ese costo fijo se diluye y el auto gana; si te movés poco, los viajes sueltos en app o taxi salen más baratos.',
    },
    {
      q: '¿Por qué el costo del auto incluye más que la nafta?',
      a: 'Porque tener el auto cuesta aunque esté parado: seguro, patente, cuota del crédito y service son gastos fijos. Para comparar de verdad hay que usar el costo total de propiedad (TCO) mensual, no solo el combustible. Si solo contás la nafta, el auto parece mucho más barato de lo que es.',
    },
    {
      q: '¿Por qué la sala suma el valor de mi tiempo?',
      a: 'Porque el transporte público es barato en plata pero suele tardar más, y ese tiempo tiene valor. Si tu hora vale mucho, las opciones puerta a puerta (auto, app, taxi) ganan terreno aunque cuesten más en pesos. Cargá tu valor hora para una comparación realista.',
    },
    {
      q: '¿Cómo calculo el valor de mi hora?',
      a: 'Una referencia simple es tu sueldo neto dividido por las horas que trabajás al mes. Por ejemplo, $1.500.000 / 180 horas ≈ $8.300 por hora. También podés usar lo que te pagarían por una hora extra de trabajo o de freelance.',
    },
    {
      q: '¿Conviene combinar medios de transporte?',
      a: 'Muy seguido sí. Transporte público para la rutina diaria + app para casos puntuales (lluvia, horarios complicados, traslados con bultos) suele ser más barato que sostener un auto, sobre todo si no lo usás todos los días.',
    },
    {
      q: '¿Vale la pena vender el auto y pasarme a apps?',
      a: 'Depende de tu uso. Si la sala muestra que el auto no es la opción más barata para vos, vender libera plata y baja gastos. Para ver cuánto liberás y ahorrás, usá la sala "¿Me conviene vender mi auto?".',
    },
    {
      q: '¿La sala considera la comodidad?',
      a: 'No, solo costos de plata y tiempo. La comodidad, el clima, la disponibilidad y la seguridad también pesan en la decisión real. Usá el resultado como base económica y sumale tu criterio sobre esos factores.',
    },
  ],
  sources: [
    { name: 'SUBE — Tarifas de transporte público', url: 'https://www.argentina.gob.ar/sube' },
    { name: 'ACARA — Mercado automotor', url: 'https://www.acara.org.ar/' },
  ],
};
