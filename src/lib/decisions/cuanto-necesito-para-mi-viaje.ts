/**
 * Sala de decisión — "¿Cuánto necesito para mi viaje?"
 *
 * La "mega calculadora" de presupuesto de viaje en formato sala: arma el costo
 * TOTAL por rubros (pasajes, alojamiento por noche, comida por persona/día,
 * transporte local, actividades, compras, seguro, trámites), le aplica el
 * recargo por pagar en moneda extranjera y un margen de imprevistos, y cruza
 * el total con tu plan de ahorro (lo que ya tenés + lo que apartás por mes ×
 * meses que faltan) para decirte si llegás a la fecha del viaje o cuánto
 * tendrías que ahorrar por mes para llegar.
 *
 * Anti-canibalización: la calc `calculadora-presupuesto-viaje-vacaciones`
 * ataca la intención transaccional ("presupuesto de viaje"); esta sala ataca
 * la decisional ("¿me alcanza? ¿cómo llego?") y la sala
 * `podemos-afrontar-este-viaje-familiar` la de afrontar un viaje YA cotizado
 * con el ahorro actual. Acá el eje es ARMAR el presupuesto desde cero y el
 * plan de ahorro hacia adelante.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const viajeros = Math.max(1, Math.min(20, num(inputs.viajeros) || 1));
  const dias = Math.max(1, Math.min(120, num(inputs.dias) || 1));
  const meses = Math.max(0, Math.min(36, num(inputs.mesesHastaViaje)));

  const pasajes = Math.max(0, num(inputs.pasajes));
  const alojamientoNoche = Math.max(0, num(inputs.alojamientoNoche));
  const comidaPersonaDia = Math.max(0, num(inputs.comidaPersonaDia));
  const transporteLocalDia = Math.max(0, num(inputs.transporteLocalDia));
  const actividades = Math.max(0, num(inputs.actividades));
  const compras = Math.max(0, num(inputs.compras));
  const seguro = Math.max(0, num(inputs.seguro));
  const tramites = Math.max(0, num(inputs.tramites));
  const recargoPct = Math.max(0, num(inputs.recargoPct));
  const imprevistosPct = Math.max(0, num(inputs.imprevistosPct));

  const ahorroActual = Math.max(0, num(inputs.ahorroActual));
  const ahorroMensual = Math.max(0, num(inputs.ahorroMensual));

  if (!pasajes && !alojamientoNoche && !comidaPersonaDia) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá al menos los pasajes, el alojamiento por noche y la comida por persona por día para armar el presupuesto total del viaje.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Presupuesto total del viaje' },
      scenarios: [],
      nextActions: [
        'Cargá **pasajes**, **alojamiento por noche** y **comida por persona por día**: son los tres rubros que definen el 70-80% del presupuesto.',
        'Después sumá tu **ahorro actual** y cuánto podés **apartar por mes** para ver si llegás a la fecha del viaje.',
      ],
    };
  }

  // — Presupuesto por rubros —
  const noches = Math.max(1, dias - 1);
  const costoAlojamiento = alojamientoNoche * noches;
  const costoComida = comidaPersonaDia * viajeros * dias;
  const costoTransporteLocal = transporteLocalDia * dias;

  // El recargo por moneda extranjera aplica a lo que gastás EN destino con
  // tarjeta argentina; los pasajes y el seguro suelen pagarse antes en pesos.
  const gastosEnDestino = costoAlojamiento + costoComida + costoTransporteLocal + actividades + compras;
  const recargo = gastosEnDestino * (recargoPct / 100);

  const subtotal = pasajes + gastosEnDestino + recargo + seguro + tramites;
  const imprevistos = subtotal * (imprevistosPct / 100);
  const total = subtotal + imprevistos;

  const porPersona = total / viajeros;
  const porDia = total / dias;

  // — Plan de ahorro —
  const disponibleAlViaje = ahorroActual + ahorroMensual * meses;
  const faltante = Math.max(0, total - disponibleAlViaje);
  const sobra = Math.max(0, disponibleAlViaje - total);
  const necesitoPorMes = meses > 0 ? Math.max(0, (total - ahorroActual) / meses) : 0;
  const hayPlan = ahorroActual > 0 || ahorroMensual > 0;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (!hayPlan) {
    status = 'tie';
    tone = 'neutral';
    title = `Tu viaje cuesta ${fmtMoney(total)}: armá el plan para llegar`;
    badge = 'Presupuesto armado';
    detail =
      meses > 0
        ? `El presupuesto completo da ${fmtMoney(total)} (${fmtMoney(porPersona)} por persona). Faltan ${meses} ${meses === 1 ? 'mes' : 'meses'}: necesitarías ahorrar ${fmtMoney(total / meses)}/mes partiendo de cero. Cargá tu ahorro actual y cuánto podés apartar por mes para ver si llegás.`
        : `El presupuesto completo da ${fmtMoney(total)} (${fmtMoney(porPersona)} por persona y ${fmtMoney(porDia)} por día). Cargá tu ahorro disponible para ver si lo cubrís.`;
  } else if (disponibleAlViaje >= total * 1.1) {
    status = 'b';
    tone = 'good';
    title = 'Llegás al viaje con margen';
    badge = 'Llegás con margen';
    detail = `El viaje cuesta ${fmtMoney(total)} y para la fecha vas a juntar ${fmtMoney(disponibleAlViaje)} (${fmtMoney(ahorroActual)} que ya tenés + ${fmtMoney(ahorroMensual)}/mes × ${meses} ${meses === 1 ? 'mes' : 'meses'}). Te sobran ${fmtMoney(sobra)}: podés viajar sin vaciar el ahorro o subir un escalón de confort.`;
  } else if (disponibleAlViaje >= total) {
    status = 'tie';
    tone = 'neutral';
    title = 'Llegás, pero justo';
    badge = 'Llegás justo';
    detail = `El viaje cuesta ${fmtMoney(total)} y para la fecha juntás ${fmtMoney(disponibleAlViaje)}: lo cubrís con apenas ${fmtMoney(sobra)} de margen. Cualquier imprevisto te obliga a financiar. Considerá recortar algún rubro o sumar ${fmtMoney(Math.max(0, necesitoPorMes - ahorroMensual))}/mes extra para viajar con colchón.`;
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Con el ritmo actual no llegás';
    badge = 'No llegás';
    detail =
      meses > 0
        ? `El viaje cuesta ${fmtMoney(total)} y con tu plan actual juntás ${fmtMoney(disponibleAlViaje)}: te faltan ${fmtMoney(faltante)}. Para llegar tendrías que ahorrar ${fmtMoney(necesitoPorMes)}/mes (hoy apartás ${fmtMoney(ahorroMensual)}), recortar el presupuesto o postergar el viaje ${Math.ceil(ahorroMensual > 0 ? faltante / ahorroMensual : 0) || 'unos'} ${ahorroMensual > 0 && Math.ceil(faltante / ahorroMensual) === 1 ? 'mes' : 'meses'} más.`
        : `El viaje cuesta ${fmtMoney(total)} y tenés ${fmtMoney(ahorroActual)}: te faltan ${fmtMoney(faltante)}. Postergalo, recortá el presupuesto o evaluá financiar esa diferencia (con cuidado del costo de las cuotas).`;
  }

  const scenarios = [
    {
      label: 'Ajustado (−20%)',
      value: fmtMoney(total * 0.8),
      detail: 'Alojamiento más simple, cocinar algunas comidas, menos excursiones pagas.',
    },
    {
      label: 'Tu presupuesto',
      value: fmtMoney(total),
      detail: `${fmtMoney(porPersona)} por persona · ${fmtMoney(porDia)} por día, imprevistos incluidos.`,
    },
    {
      label: 'Con más confort (+20%)',
      value: fmtMoney(total * 1.2),
      detail: 'Mejor ubicación, más salidas a comer y margen extra para compras.',
    },
  ];

  const breakdown = [
    { label: 'Pasajes / vuelos', value: fmtMoney(pasajes) },
    { label: `Alojamiento (${noches} ${noches === 1 ? 'noche' : 'noches'} × ${fmtMoney(alojamientoNoche)})`, value: fmtMoney(costoAlojamiento) },
    { label: `Comida (${viajeros} × ${dias} días × ${fmtMoney(comidaPersonaDia)})`, value: fmtMoney(costoComida) },
    ...(costoTransporteLocal > 0
      ? [{ label: `Transporte local (${dias} días × ${fmtMoney(transporteLocalDia)})`, value: fmtMoney(costoTransporteLocal) }]
      : []),
    ...(actividades > 0 ? [{ label: 'Actividades y excursiones', value: fmtMoney(actividades) }] : []),
    ...(compras > 0 ? [{ label: 'Compras y regalos', value: fmtMoney(compras) }] : []),
    ...(seguro > 0 ? [{ label: 'Seguro / asistencia al viajero', value: fmtMoney(seguro) }] : []),
    ...(tramites > 0 ? [{ label: 'Trámites (visas, pasaportes, vacunas)', value: fmtMoney(tramites) }] : []),
    ...(recargo > 0
      ? [{ label: `Recargo moneda extranjera (${recargoPct}% s/ gastos en destino)`, value: fmtMoney(recargo), hint: 'No aplica sobre pasajes ni seguro pagados en pesos.' }]
      : []),
    ...(imprevistos > 0 ? [{ label: `Imprevistos (${imprevistosPct}%)`, value: fmtMoney(imprevistos) }] : []),
    { label: 'Presupuesto total', value: fmtMoney(total), hint: `${fmtMoney(porPersona)}/persona · ${fmtMoney(porDia)}/día` },
    ...(hayPlan
      ? [
          { label: `Juntás para la fecha (ahorro + ${meses} ${meses === 1 ? 'mes' : 'meses'})`, value: fmtMoney(disponibleAlViaje) },
          {
            label: faltante > 0 ? 'Te falta' : 'Te sobra',
            value: faltante > 0 ? '-' + fmtMoney(faltante).replace('-', '') : fmtMoney(sobra),
          },
        ]
      : []),
  ];

  const nextActions = [
    meses > 0 && necesitoPorMes > 0
      ? `Automatizá el ahorro: apartá **${fmtMoney(necesitoPorMes)}/mes** apenas cobrás (y ponelo a rendir en un plazo fijo o fondo money market para que la inflación no te lo coma).`
      : 'Poné la plata del viaje a rendir hasta la fecha de salida: un plazo fijo o fondo money market evita que la inflación te achique el presupuesto.',
    `Los **pasajes y el alojamiento** son ${total > 0 ? Math.round(((pasajes + costoAlojamiento) / total) * 100) : 0}% de tu presupuesto: comprarlos con anticipación o en ofertas mueve el total mucho más que recortar comidas.`,
    recargoPct > 0
      ? `Cada peso que pagás con tarjeta argentina en el exterior lleva **${recargoPct}% de recargo**: compará contra pagar con dólares propios (billete o MEP) — suele ser más barato.`
      : 'Si el viaje es al exterior, definí cómo vas a pagar allá: tarjeta con percepciones vs. dólar billete/MEP cambia el costo total varios puntos.',
    'Revisá el presupuesto un mes antes de viajar: recotizá pasajes de ida al aeropuerto, entradas y traslados — los precios de 2026 se mueven rápido y el margen de imprevistos está para eso.',
  ];

  const notes = [
    `El alojamiento se calcula por ${noches} ${noches === 1 ? 'noche' : 'noches'} (días − 1). Si tu itinerario tiene noches extra (vuelos nocturnos, escalas), sumalas en el precio por noche.`,
    'El recargo por moneda extranjera se aplica sobre los gastos en destino (alojamiento, comida, transporte local, actividades y compras), no sobre pasajes ni seguro. Verificá el porcentaje vigente de percepciones en ARCA antes de viajar.',
    'El plan de ahorro es lineal (no capitaliza intereses). Si ponés la plata a rendir, vas a llegar un poco más holgado que lo que muestra la sala.',
    'Es una herramienta orientativa y no es asesoramiento financiero. Endeudarse a tasa alta para viajar sale caro: priorizá llegar con ahorro.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(total),
      label: 'Presupuesto total del viaje',
      sub: hayPlan
        ? faltante > 0
          ? `Con tu plan juntás **${fmtMoney(disponibleAlViaje)}**: te faltan **${fmtMoney(faltante)}** (necesitás ${fmtMoney(necesitoPorMes)}/mes).`
          : `Con tu plan juntás **${fmtMoney(disponibleAlViaje)}** para la fecha: te sobran **${fmtMoney(sobra)}**.`
        : `**${fmtMoney(porPersona)}** por persona · **${fmtMoney(porDia)}** por día de viaje.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-necesito-para-mi-viaje',
  title: '¿Cuánto necesito para mi viaje? Presupuesto completo y plan de ahorro 2026',
  h1: '¿Cuánto necesito para mi viaje?',
  description:
    'Armá el presupuesto completo de tu viaje rubro por rubro (pasajes, alojamiento, comida, actividades, recargo por moneda extranjera, imprevistos) y mirá si con tu ritmo de ahorro llegás a la fecha o cuánto tenés que apartar por mes.',
  intro:
    'Un viaje no es solo el pasaje: es el alojamiento por noche, la comida de cada persona cada día, los traslados, las excursiones, el seguro, el recargo por pagar en moneda extranjera y los imprevistos que siempre aparecen. Esta sala arma el presupuesto completo rubro por rubro — total, por persona y por día — y lo cruza con tu plan de ahorro: cuánto tenés hoy, cuánto apartás por mes y cuántos meses faltan. El resultado no es solo el costo: es si llegás a la fecha del viaje, y si no, exactamente cuánto tenés que ahorrar por mes para llegar.',
  icon: '🧳',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-07-02',
  example: {
    viajeros: 2,
    dias: 10,
    mesesHastaViaje: 5,
    pasajes: 2400000,
    alojamientoNoche: 140000,
    comidaPersonaDia: 45000,
    transporteLocalDia: 25000,
    actividades: 350000,
    compras: 200000,
    seguro: 160000,
    tramites: 0,
    recargoPct: '30',
    imprevistosPct: '10',
    ahorroActual: 2000000,
    ahorroMensual: 900000,
  },
  fields: [
    {
      id: 'viajeros',
      label: '¿Cuántos viajan?',
      type: 'number',
      required: true,
      min: 1,
      max: 20,
      default: 2,
      suffix: 'personas',
      help: 'Cantidad de viajeros: multiplica la comida y divide el total por persona.',
      group: 'El viaje',
      groupIcon: '🧭',
    },
    {
      id: 'dias',
      label: 'Días de viaje',
      type: 'number',
      required: true,
      min: 1,
      max: 120,
      default: 7,
      suffix: 'días',
      placeholder: '10',
      help: 'Duración total. Las noches de alojamiento se calculan como días − 1.',
      group: 'El viaje',
    },
    {
      id: 'mesesHastaViaje',
      label: '¿En cuántos meses viajás?',
      type: 'number',
      min: 0,
      max: 36,
      default: 4,
      suffix: 'meses',
      recommended: true,
      help: 'Meses que faltan hasta la salida: arma tu plan de ahorro mes a mes.',
      group: 'El viaje',
    },
    {
      id: 'pasajes',
      label: 'Pasajes / vuelos',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '2400000',
      help: 'Total de pasajes ida y vuelta para todos los viajeros. Si vas en auto, cargá acá nafta + peajes.',
      group: 'Transporte',
      groupIcon: '✈️',
    },
    {
      id: 'transporteLocalDia',
      label: 'Transporte en destino (por día)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '25000',
      help: 'Subte, colectivos, taxis y traslados por día para todo el grupo (incluí el aeropuerto).',
      group: 'Transporte',
    },
    {
      id: 'alojamientoNoche',
      label: 'Alojamiento por noche',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '140000',
      help: 'Precio por noche del hotel o alquiler (total del grupo, no por persona).',
      group: 'Alojamiento y comida',
      groupIcon: '🏨',
    },
    {
      id: 'comidaPersonaDia',
      label: 'Comida por persona por día',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '45000',
      help: 'Desayuno, almuerzo y cena de UNA persona en UN día (se multiplica por viajeros × días).',
      group: 'Alojamiento y comida',
    },
    {
      id: 'actividades',
      label: 'Actividades y excursiones',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '350000',
      help: 'Total de entradas, tours y excursiones de todo el viaje.',
      group: 'Extras',
      groupIcon: '🎟️',
    },
    {
      id: 'compras',
      label: 'Compras y regalos',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      placeholder: '200000',
      help: 'Souvenirs, ropa, regalos: lo que sabés que vas a gastar aunque no esté planificado.',
      group: 'Extras',
    },
    {
      id: 'seguro',
      label: 'Seguro / asistencia al viajero',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '160000',
      help: 'Asistencia médica de viaje para todos los viajeros (obligatoria en varios destinos).',
      group: 'Extras',
    },
    {
      id: 'tramites',
      label: 'Trámites (visas, pasaportes, vacunas)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      placeholder: '150000',
      help: 'Visas, renovación de pasaportes, vacunas o certificados que exija el destino.',
      group: 'Extras',
    },
    {
      id: 'recargoPct',
      label: 'Recargo por pagar en moneda extranjera',
      type: 'select',
      default: '0',
      options: [
        { value: '0', label: 'No aplica (viaje nacional o pago con dólares propios)' },
        { value: '30', label: '30% — tarjeta argentina en el exterior (percepción)' },
      ],
      help: 'Percepciones sobre consumos con tarjeta argentina en moneda extranjera. Se aplica a los gastos en destino, no a los pasajes. Verificá el % vigente en ARCA.',
      group: 'Ajustes',
      groupIcon: '⚙️',
    },
    {
      id: 'imprevistosPct',
      label: 'Margen de imprevistos',
      type: 'select',
      default: '10',
      options: [
        { value: '0', label: 'Sin margen (0%)' },
        { value: '5', label: '5% — viaje conocido, todo reservado' },
        { value: '10', label: '10% — recomendado' },
        { value: '15', label: '15% — destino nuevo o viaje largo' },
      ],
      help: 'Colchón sobre el subtotal para gastos que no planificaste (médicos, traslados extra, precios que subieron).',
      group: 'Ajustes',
    },
    {
      id: 'ahorroActual',
      label: 'Lo que ya tenés ahorrado para el viaje',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '2000000',
      profileKey: 'finanzas.ahorros',
      help: 'Plata que ya apartaste (o estás dispuesto a usar) para este viaje.',
      group: 'Tu plan de ahorro',
      groupIcon: '💰',
    },
    {
      id: 'ahorroMensual',
      label: 'Cuánto podés apartar por mes',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '900000',
      help: 'Lo que podés guardar cada mes de acá a la fecha del viaje.',
      group: 'Tu plan de ahorro',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-presupuesto-viaje-vacaciones', label: 'Presupuesto de viaje (versión rápida)' },
    { slug: 'calculadora-dias-ideales-viaje-destino', label: 'Días ideales según destino' },
    { slug: 'calculadora-costo-viaje-combustible-kilometros', label: 'Costo del viaje en auto' },
    { slug: 'calculadora-valor-millas-viajero-frecuente', label: 'Valor de tus millas' },
    { slug: 'calculadora-interes-compuesto', label: 'Hacer rendir el ahorro hasta la fecha' },
  ],
  howItWorks: `Esta sala arma el presupuesto completo y te dice si llegás a la fecha.

1. **Suma rubro por rubro.** Pasajes + alojamiento (precio por noche × noches) + comida (por persona × viajeros × días) + transporte local + actividades + compras + seguro + trámites. Nada queda afuera del total.
2. **Aplica el recargo por moneda extranjera.** Si pagás con tarjeta argentina en el exterior, suma el porcentaje de percepciones sobre los gastos en destino (no sobre los pasajes, que pagás antes en pesos).
3. **Agrega el margen de imprevistos.** Un porcentaje sobre el subtotal para lo que nunca está en el plan: gastos médicos, traslados extra, precios que subieron entre que cotizaste y viajaste.
4. **Cruza el total con tu plan de ahorro.** Lo que ya tenés + lo que apartás por mes × los meses que faltan = lo que juntás para la fecha. Si sobra, te dice el margen; si falta, exactamente cuánto tenés que ahorrar por mes para llegar.
5. **Escenarios.** Muestra la versión ajustada (−20%), tu presupuesto y una con más confort (+20%), para que veas cuánto mueve recortar o sumar margen.`,
  faq: [
    {
      q: '¿Cómo armo el presupuesto completo de un viaje?',
      a: 'Rubro por rubro: pasajes, alojamiento por noche × noches, comida por persona por día × viajeros × días, transporte en destino, actividades, compras, seguro y trámites. A eso se le suma el recargo por moneda extranjera si pagás con tarjeta argentina afuera y un margen de imprevistos del 5-15%. Esta sala hace toda esa cuenta y te da el total, por persona y por día.',
    },
    {
      q: '¿Cuánto tengo que ahorrar por mes para llegar al viaje?',
      a: 'La cuenta es (costo total − lo que ya tenés) ÷ meses que faltan. La sala la hace automáticamente: cargás cuánto tenés, cuánto apartás por mes y en cuántos meses viajás, y te dice si llegás, con cuánto margen, o cuánto más tendrías que apartar cada mes.',
    },
    {
      q: '¿Qué es el recargo por pagar en moneda extranjera?',
      a: 'Cuando pagás consumos en el exterior con tarjeta argentina se aplican percepciones impositivas sobre el monto en moneda extranjera. La sala lo aplica sobre los gastos en destino (alojamiento, comida, transporte, actividades y compras), no sobre pasajes o seguro que pagás antes en pesos. El porcentaje vigente conviene verificarlo en ARCA antes de viajar, porque cambió varias veces.',
    },
    {
      q: '¿Conviene pagar con tarjeta o llevar dólares?',
      a: 'Depende de la brecha entre el dólar tarjeta (oficial + percepciones) y el dólar al que conseguís billetes o MEP. Si el recargo de la tarjeta supera esa brecha, conviene llevar dólares propios o pagar los consumos del resumen con dólar MEP. Cargá el escenario con recargo y sin recargo en la sala y compará los totales.',
    },
    {
      q: '¿Cuánto margen de imprevistos conviene dejar?',
      a: 'Entre 5% y 15% del subtotal. 5% si es un destino conocido con todo reservado; 10% como regla general; 15% si es un destino nuevo, un viaje largo o cotizaste con mucha anticipación (los precios se mueven entre que armás el presupuesto y viajás).',
    },
    {
      q: '¿Cómo calculo la comida por persona por día?',
      a: 'Buscá precios reales del destino: un almuerzo promedio + una cena + desayuno/snacks. Si el alojamiento incluye desayuno o tiene cocina, bajá el número: cocinar algunas comidas es el recorte más fácil del presupuesto. La sala multiplica ese valor por viajeros × días, que es donde el número chico se hace grande.',
    },
    {
      q: '¿Qué hago si no llego a la fecha del viaje?',
      a: 'Tenés tres caminos que la sala te cuantifica: subir el ahorro mensual (te dice exactamente a cuánto), recortar el presupuesto (el escenario −20% muestra cuánto mueve) o correr la fecha (cada mes extra suma tu ahorro mensual al plan). Financiar la diferencia es la última opción: con interés, el viaje sale más caro.',
    },
    {
      q: '¿Dónde conviene guardar la plata del viaje mientras ahorro?',
      a: 'En algo que rinda y sea líquido a la fecha de salida: plazo fijo, fondo money market o dólares si el viaje es al exterior (así fijás el costo en la moneda en que vas a gastar). Dejarla en la cuenta a la vista hace que la inflación te achique el presupuesto mes a mes.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa para planificar con el costo real a la vista. Los precios y percepciones cambian: verificá los valores vigentes antes de comprar, y evitá endeudarte a tasa alta para viajar.',
    },
  ],
  sources: [
    { name: 'ARCA — Percepciones sobre consumos en moneda extranjera', url: 'https://www.arca.gob.ar/' },
    { name: 'BCRA — Tipos de cambio y Costo Financiero Total', url: 'https://www.bcra.gob.ar/' },
  ],
};
