/**
 * Sala de decisión — "¿Renuevo el alquiler o me mudo?"
 *
 * Patrón VIVIENDA / COMPARACIÓN A vs B. Quedarte tiene un costo nuevo (el
 * aumento del alquiler) pero cero costo de cambio. Mudarte puede tener un
 * alquiler más barato en otra zona, pero arranca con depósito + comisión +
 * mudanza + arreglos, y suele sumar tiempo de viaje. Compara el costo del PRIMER
 * AÑO de cada opción y dice cuánto tenés que ahorrar por mes para que mudarte
 * convenga.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const alquilerActual = Math.max(0, num(inputs.alquilerActual));
  const nuevoAlquiler = Math.max(0, num(inputs.nuevoAlquiler));
  const alquilerOtraZona = Math.max(0, num(inputs.alquilerOtraZona));
  const expensas = Math.max(0, num(inputs.expensas));
  const deposito = Math.max(0, num(inputs.deposito));
  const comision = Math.max(0, num(inputs.comision));
  const costoMudanza = Math.max(0, num(inputs.costoMudanza));
  const pinturaArreglos = Math.max(0, num(inputs.pinturaArreglos));
  const minutosViajeExtraDia = Math.max(0, num(inputs.minutosViajeExtraDia));

  if (!nuevoAlquiler || !alquilerOtraZona) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el alquiler que te ofrecen renovando y el alquiler de la otra zona donde te mudarías. Con eso comparamos el costo del primer año de cada opción.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Diferencia primer año' },
      scenarios: [],
      nextActions: [
        'Cargá el **nuevo alquiler** que te ofrecen al renovar y el **alquiler de la otra zona**.',
        'Sumá los costos de mudarte: **depósito, comisión, mudanza y arreglos** para ver el impacto real.',
      ],
    };
  }

  // — Costo del primer año de cada opción —
  // Quedarse: 12 meses del nuevo alquiler + expensas. Sin costo de cambio.
  const costoQuedarse = (nuevoAlquiler + expensas) * 12;
  // Mudarse: 12 meses del alquiler nuevo + expensas + costos de entrada únicos.
  // El depósito se recupera al irte, pero lo inmovilizás el primer año → lo
  // contamos como costo financiero del primer año (criterio conservador: depósito
  // entero, ya que en la práctica rara vez se devuelve completo y a tiempo).
  const costosEntrada = deposito + comision + costoMudanza + pinturaArreglos;
  const costoMudarse = (alquilerOtraZona + expensas) * 12 + costosEntrada;

  const diff = costoQuedarse - costoMudarse; // + => mudarse es más barato
  const ahorroMensualAlquiler = nuevoAlquiler - alquilerOtraZona; // lo que ahorrás por mes mudándote

  // Cuánto tenés que ahorrar por mes en alquiler para que mudarse "se pague"
  // (recuperar los costos de entrada en 12 meses).
  const ahorroNecesarioMensual = costosEntrada / 12;

  // Tiempo extra de viaje al año (informativo).
  const horasExtraAnio = (minutosViajeExtraDia / 60) * 22 * 12; // ~22 días hábiles/mes

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (diff > costoQuedarse * 0.03) {
    status = 'b'; // B = mudarse
    tone = 'good';
    title = 'Conviene mudarte';
    badge = 'Mudate';
    detail = `Mudarte a la otra zona te sale ${fmtMoney(Math.abs(diff))} menos en el primer año, aun pagando depósito, comisión, mudanza y arreglos. El menor alquiler (${fmtMoney(ahorroMensualAlquiler)}/mes) compensa de sobra los costos de entrada.`;
  } else if (diff < -costoQuedarse * 0.03) {
    status = 'a'; // A = quedarse / renovar
    tone = 'warn';
    title = 'Conviene renovar y quedarte';
    badge = 'Renová';
    detail = `Quedarte te sale ${fmtMoney(Math.abs(diff))} menos en el primer año. Los costos de mudarte (${fmtMoney(costosEntrada)} entre depósito, comisión, mudanza y arreglos) no se recuperan con el ahorro de alquiler en otra zona.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decidí por calidad de vida';
    badge = 'Es parejo';
    detail = `La diferencia del primer año es de apenas ${fmtMoney(Math.abs(diff))}: económicamente da casi igual. Decidí por lo que no es plata: ${minutosViajeExtraDia > 0 ? `mudarte suma ${Math.round(horasExtraAnio)} horas de viaje al año, ` : ''}el barrio, la cercanía al trabajo y las ganas de mudarte.`;
  }

  const scenarios = [
    {
      label: 'Renovar (quedarme)',
      value: fmtMoney(costoQuedarse),
      detail: `Costo del primer año: 12 meses de ${fmtMoney(nuevoAlquiler)} + expensas. Sin costos de cambio.`,
    },
    {
      label: 'Mudarme',
      value: fmtMoney(costoMudarse),
      detail: `12 meses de ${fmtMoney(alquilerOtraZona)} + expensas + ${fmtMoney(costosEntrada)} de entrada.`,
    },
    {
      label: 'Punto de equilibrio',
      value: ahorroMensualAlquiler > 0 ? fmtMoney(ahorroNecesarioMensual) + '/mes' : 'No alcanza',
      detail:
        ahorroMensualAlquiler > 0
          ? `Necesitás ahorrar al menos ${fmtMoney(ahorroNecesarioMensual)}/mes de alquiler para cubrir los costos de mudarte en un año. Hoy ahorrás ${fmtMoney(ahorroMensualAlquiler)}/mes.`
          : 'En la otra zona no pagás menos alquiler, así que mudarte no se paga solo con el ahorro.',
    },
  ];

  const comparison = {
    columns: ['Renovar', 'Mudarme'] as [string, string],
    rows: [
      {
        label: 'Alquiler mensual',
        a: fmtMoney(nuevoAlquiler),
        b: fmtMoney(alquilerOtraZona),
        hint: ahorroMensualAlquiler > 0 ? `Ahorrás ${fmtMoney(ahorroMensualAlquiler)}/mes mudándote` : 'No ahorrás alquiler mudándote',
      },
      {
        label: 'Costos de entrada (únicos)',
        a: fmtMoney(0),
        b: fmtMoney(costosEntrada),
        hint: 'Depósito + comisión + mudanza + arreglos',
      },
      {
        label: 'Costo total primer año',
        a: fmtMoney(costoQuedarse),
        b: fmtMoney(costoMudarse),
      },
      {
        label: 'Tiempo extra de viaje al año',
        a: '0 hs',
        b: `${Math.round(horasExtraAnio)} hs`,
        hint: minutosViajeExtraDia > 0 ? `${minutosViajeExtraDia} min extra por día` : 'Cargá el viaje extra para verlo',
      },
    ],
  };

  const nextActions = [
    diff > 0
      ? `Mudarte se paga: el menor alquiler recupera los ${fmtMoney(costosEntrada)} de entrada en **${ahorroMensualAlquiler > 0 ? Math.ceil(costosEntrada / ahorroMensualAlquiler) : '∞'} meses**. A partir de ahí, todo ahorro.`
      : `Para que mudarte convenga, el alquiler de la otra zona debería bajar al menos **${fmtMoney(nuevoAlquiler - alquilerOtraZona + ahorroNecesarioMensual)}/mes** respecto al que pagás al renovar.`,
    'Negociá la **renovación**: muchas veces el aumento ofrecido es el techo. Pedir una suba menor puede inclinar la balanza a quedarte sin mudarte.',
    'Confirmá la **comisión inmobiliaria** y el **depósito**: por ley pueden tener límites. No los des por hechos hasta firmar.',
    minutosViajeExtraDia > 0
      ? `Mudarte suma **${Math.round(horasExtraAnio)} horas de viaje al año**: poné un precio a tu tiempo antes de decidir solo por el alquiler.`
      : 'Si la otra zona te queda más lejos del trabajo, sumá el costo de transporte y el tiempo de viaje a la comparación.',
  ];

  const notes = [
    'Compara el costo del PRIMER año, que es donde pesan los costos de mudarte. A partir del segundo año solo cuenta la diferencia de alquiler.',
    'El depósito se cuenta como costo del primer año porque lo inmovilizás; en la práctica suele devolverse al irte (a veces incompleto o tarde).',
    'No es asesoramiento financiero ni inmobiliario. Es una estimación orientativa: confirmá comisiones, depósito y condiciones del contrato con tu inmobiliaria.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: diff >= 0 ? 'Mudarme: ' + fmtMoney(diff) : 'Renovar: ' + fmtMoney(-diff),
      label: 'Ahorro del primer año',
      sub: `Renovar cuesta ${fmtMoney(costoQuedarse)} y mudarte ${fmtMoney(costoMudarse)} el primer año (incluye ${fmtMoney(costosEntrada)} de costos de mudanza).`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'renovar-alquiler-o-mudarme',
  title: 'Renovar alquiler o mudarse: qué conviene en 2026 (comparador de costos)',
  h1: '¿Renovar el alquiler o mudarse? Compará el costo real',
  description:
    'Compará el costo del primer año de renovar el alquiler contra mudarte a otra zona, incluyendo depósito, comisión, mudanza, arreglos y tiempo de viaje. Te decimos cuánto tenés que ahorrar por mes para que mudarte valga la pena.',
  intro:
    'Te llega la renovación con un aumento y pensás: ¿aguanto o me mudo a una zona más barata? Mudarte parece tentador, pero arranca con depósito, comisión, mudanza y arreglos, y muchas veces suma tiempo de viaje. Esta sala compara el costo del primer año de cada opción y te dice cuánto tenés que ahorrar de alquiler por mes para que mudarte realmente convenga.',
  icon: '📦',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-07-21',
  example: {
    alquilerActual: 450000,
    nuevoAlquiler: 600000,
    alquilerOtraZona: 480000,
    expensas: 70000,
    deposito: 480000,
    comision: 480000,
    costoMudanza: 250000,
    pinturaArreglos: 150000,
    minutosViajeExtraDia: 40,
  },
  fields: [
    {
      id: 'alquilerActual',
      label: 'Alquiler que pagás hoy',
      type: 'number',
      prefix: '$',
      min: 0,
      placeholder: '450000',
      profileKey: 'vivienda.alquilerMensual',
      help: 'Lo que venís pagando antes de la renovación.',
      group: 'Tu alquiler',
      groupIcon: '🔑',
    },
    {
      id: 'nuevoAlquiler',
      label: 'Nuevo alquiler al renovar',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '600000',
      help: 'Lo que te quieren cobrar si renovás y te quedás.',
      group: 'Tu alquiler',
    },
    {
      id: 'alquilerOtraZona',
      label: 'Alquiler en la otra zona',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '480000',
      help: 'Lo que pagarías por una vivienda equivalente en el lugar donde te mudarías.',
      group: 'La mudanza',
      groupIcon: '📦',
    },
    {
      id: 'expensas',
      label: 'Expensas mensuales',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '70000',
      help: 'Para comparar parejo (si cambian, usá el promedio).',
      group: 'Tu alquiler',
    },
    {
      id: 'deposito',
      label: 'Depósito de garantía',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '480000',
      help: 'Lo que dejás al entrar (suele ser 1 mes). Se devuelve al irte, pero lo inmovilizás.',
      group: 'La mudanza',
    },
    {
      id: 'comision',
      label: 'Comisión inmobiliaria',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '480000',
      help: 'Honorarios de la inmobiliaria por el nuevo contrato.',
      group: 'La mudanza',
    },
    {
      id: 'costoMudanza',
      label: 'Costo de la mudanza',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '250000',
      help: 'Flete, embalaje y traslado de tus cosas.',
      group: 'La mudanza',
    },
    {
      id: 'pinturaArreglos',
      label: 'Pintura y arreglos',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '150000',
      help: 'Lo que gastás en dejar la nueva vivienda a punto (o reparar la actual al irte).',
      group: 'La mudanza',
    },
    {
      id: 'minutosViajeExtraDia',
      label: 'Tiempo de viaje extra por día',
      type: 'number',
      suffix: 'min',
      default: 0,
      min: 0,
      placeholder: '40',
      advanced: true,
      help: 'Minutos extra (ida y vuelta) que sumarías al mudarte más lejos del trabajo.',
      group: 'La mudanza',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-aumento-alquiler-trimestral-cuatrimestral-semestral', label: 'Aumento del alquiler' },
    { slug: 'calculadora-actualizacion-alquiler-icl', label: 'Actualización de alquiler (ICL)' },
    { slug: 'calculadora-comision-inmobiliaria-venta-inmueble-4-porciento', label: 'Comisión inmobiliaria' },
    { slug: 'calculadora-alquiler-vs-comprar', label: 'Alquilar vs comprar' },
  ],
  howItWorks: `Mudarte no se compara mes contra mes: hay que mirar el primer año entero, porque ahí pesan los costos de entrada.

1. **Costo de renovar.** Doce meses del nuevo alquiler más expensas. Quedarte no tiene costo de cambio.
2. **Costo de mudarte.** Doce meses del alquiler de la otra zona más expensas, más los costos únicos de entrar: depósito, comisión, mudanza y arreglos.
3. **Diferencia del primer año.** Resta ambos totales: ese es el ahorro (o sobrecosto) real de mudarte el primer año.
4. **Punto de equilibrio.** Calcula cuánto tenés que ahorrar por mes de alquiler para recuperar los costos de mudarte dentro del año, y en cuántos meses se pagan.
5. **Lo que no es plata.** Suma el tiempo de viaje extra al año si la otra zona te queda más lejos, para que no decidas solo por el alquiler.`,
  faq: [
    {
      q: '¿Por qué mudarme a un alquiler más barato puede no convenir?',
      a: 'Porque mudarte arranca con depósito, comisión, mudanza y arreglos. Si el ahorro mensual de alquiler es chico, esos costos de entrada pueden tardar años en recuperarse. Por eso comparamos el primer año completo, no solo la cuota mensual.',
    },
    {
      q: '¿En cuánto tiempo se paga una mudanza?',
      a: 'Dividí los costos de entrada (depósito, comisión, mudanza, arreglos) por el ahorro mensual de alquiler. Esa cantidad de meses es lo que tardás en recuperar la inversión de mudarte. Si supera el tiempo que pensás quedarte, no conviene.',
    },
    {
      q: '¿El depósito cuenta como costo?',
      a: 'En el primer año sí, porque lo inmovilizás al entrar. En teoría se devuelve cuando te vas, aunque en la práctica suele recuperarse incompleto o con demora. Lo contamos completo como criterio conservador.',
    },
    {
      q: '¿Conviene siempre negociar la renovación?',
      a: 'Sí. El aumento que te ofrecen suele ser el techo. Pedir una suba menor, mostrando que sos buen inquilino y que evaluás mudarte, muchas veces inclina la balanza a quedarte sin gastar en mudanza.',
    },
    {
      q: '¿Cómo valúo el tiempo de viaje extra?',
      a: 'Multiplicá los minutos extra por día por los días que viajás al mes. Acá te mostramos las horas extra al año; ponéles un valor según cuánto vale tu tiempo. Mudarte más lejos puede borrar el ahorro de alquiler si sumás muchas horas de viaje.',
    },
    {
      q: '¿Qué pasa con la comisión inmobiliaria?',
      a: 'Es un costo de entrada que puede tener topes legales según la normativa vigente. Confirmá el monto y a quién le corresponde pagarla antes de firmar: a veces es negociable o está limitada por ley.',
    },
    {
      q: '¿Y si el alquiler de la otra zona no es más barato?',
      a: 'Entonces mudarte no se paga solo: estarías pagando los costos de entrada sin un ahorro mensual que los recupere. En ese caso, mudarte solo se justifica por motivos no económicos (cercanía, barrio, calidad de vida).',
    },
    {
      q: '¿Esto reemplaza el consejo de un profesional?',
      a: 'No. Es una estimación orientativa para decidir con números, no asesoramiento inmobiliario. Confirmá comisiones, depósito y condiciones del contrato con tu inmobiliaria y, ante dudas legales, con un profesional matriculado.',
    },
  ],
  sources: [
    { name: 'Código Civil y Comercial — Locaciones', url: 'https://www.argentina.gob.ar/normativa' },
  ],
};
