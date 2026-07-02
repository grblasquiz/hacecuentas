/**
 * Sala de decisión — "¿Podemos afrontar este viaje familiar?"
 *
 * Patrón BREAKDOWN. Suma el costo total de un viaje (vuelos, alojamiento, comidas
 * por día, seguros, cambio de moneda, gastos post-viaje) y lo cruza con el ahorro
 * disponible para decir si te deja colchón o, si lo financiás, en cuántas cuotas
 * y a qué cuota mensual queda.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const vuelos = Math.max(0, num(inputs.vuelos));
  const alojamiento = Math.max(0, num(inputs.alojamiento));
  const comidasDia = Math.max(0, num(inputs.comidasDia));
  const dias = Math.max(0, Math.min(120, num(inputs.dias)));
  const seguros = Math.max(0, num(inputs.seguros));
  const cambioMoneda = Math.max(0, num(inputs.cambioMoneda));
  const postViaje = Math.max(0, num(inputs.gastosPostViaje));
  const ahorro = Math.max(0, num(inputs.ahorroDisponible));
  const cuotas = Math.max(1, num(inputs.cuotasTarjeta) || 1);

  const comidasTotal = comidasDia * dias;

  if (!vuelos && !alojamiento && !comidasTotal) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá al menos los vuelos, el alojamiento y las comidas por día para estimar el costo total del viaje.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Costo total del viaje' },
      scenarios: [],
      nextActions: [
        'Cargá **vuelos**, **alojamiento** y **comidas por día** (× cantidad de días).',
        'Sumá tu **ahorro disponible** para ver si el viaje te deja colchón o lo financiás.',
      ],
    };
  }

  const costoTotal = vuelos + alojamiento + comidasTotal + seguros + cambioMoneda + postViaje;
  const colchonRestante = ahorro - costoTotal; // + sobra; − no alcanza
  const cubreConAhorro = colchonRestante >= 0;
  const cuotaMensual = costoTotal / cuotas;
  const faltante = Math.max(0, costoTotal - ahorro);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (cubreConAhorro && colchonRestante >= costoTotal * 0.5) {
    status = 'b';
    tone = 'good';
    title = 'Sí: lo pagás y te queda colchón de sobra';
    badge = 'Lo pagás cómodo';
    detail = `El viaje cuesta ${fmtMoney(costoTotal)} y tenés ${fmtMoney(ahorro)} de ahorro: lo pagás de contado y te quedan ${fmtMoney(colchonRestante)}. Podés afrontarlo sin endeudarte y conservando un buen colchón.`;
  } else if (cubreConAhorro) {
    status = 'tie';
    tone = 'neutral';
    title = 'Lo pagás, pero te quedás justo de ahorro';
    badge = 'Justo';
    detail = `El viaje cuesta ${fmtMoney(costoTotal)} y tenés ${fmtMoney(ahorro)}: lo cubrís, pero te quedan solo ${fmtMoney(colchonRestante)} de colchón. Pensá si querés vaciar el ahorro o financiar parte para no quedarte sin red.`;
  } else {
    status = 'a';
    tone = 'warn';
    title = 'No te alcanza de contado: lo financiarías';
    badge = 'Hay que financiar';
    detail = `El viaje cuesta ${fmtMoney(costoTotal)} y tu ahorro es ${fmtMoney(ahorro)}: te faltan ${fmtMoney(faltante)}. En ${cuotas} ${cuotas === 1 ? 'pago' : 'cuotas'} la cuota queda en ${fmtMoney(cuotaMensual)}/mes. Asegurate de poder bancar esa cuota sin descuidar el resto.`;
  }

  const scenarios = [
    {
      label: 'De contado',
      value: cubreConAhorro ? 'Te quedan ' + fmtMoney(colchonRestante) : 'Faltan ' + fmtMoney(faltante),
      detail: cubreConAhorro
        ? 'Lo que te sobra del ahorro después de pagar todo el viaje.'
        : 'Lo que te falta para cubrirlo con el ahorro actual.',
    },
    {
      label: `En ${cuotas} ${cuotas === 1 ? 'pago' : 'cuotas'}`,
      value: fmtMoney(cuotaMensual) + '/mes',
      detail: `Cuota mensual si financiás el total del viaje (${fmtMoney(costoTotal)}).`,
    },
    {
      label: 'Viaje austero (−20%)',
      value: fmtMoney(costoTotal * 0.8),
      detail: 'Recortando alojamiento/comidas: vuelos en oferta, menos días o destino más barato.',
    },
  ];

  const breakdown = [
    { label: 'Vuelos / pasajes', value: fmtMoney(vuelos) },
    { label: 'Alojamiento', value: fmtMoney(alojamiento) },
    { label: `Comidas (${dias} días × ${fmtMoney(comidasDia)})`, value: fmtMoney(comidasTotal) },
    ...(seguros > 0 ? [{ label: 'Seguros y asistencia', value: fmtMoney(seguros) }] : []),
    ...(cambioMoneda > 0 ? [{ label: 'Cambio de moneda / impuestos', value: fmtMoney(cambioMoneda) }] : []),
    ...(postViaje > 0 ? [{ label: 'Gastos post-viaje (resumen tarjeta)', value: fmtMoney(postViaje) }] : []),
    { label: 'Costo total del viaje', value: fmtMoney(costoTotal), hint: dias > 0 ? `≈ ${fmtMoney(costoTotal / dias)}/día` : undefined },
    { label: 'Ahorro disponible', value: fmtMoney(ahorro) },
    {
      label: cubreConAhorro ? 'Colchón que te queda' : 'Te falta',
      value: cubreConAhorro ? fmtMoney(colchonRestante) : '-' + fmtMoney(faltante).replace('-', ''),
    },
  ];

  const nextActions = [
    cubreConAhorro
      ? `Pagalo con el ahorro y conservá al menos un fondo de emergencia: no vacíes la cuenta por el viaje. Te quedarían ${fmtMoney(colchonRestante)}.`
      : `Si financiás, confirmá que la cuota de ${fmtMoney(cuotaMensual)}/mes entra cómoda en tu presupuesto durante los ${cuotas} meses, sin pisar otros pagos.`,
    'Cuando viajás al exterior, recordá los **impuestos sobre consumos en moneda extranjera** (PAIS/percepciones): cargá ese recargo en "cambio de moneda" para no llevarte sorpresas en el resumen.',
    'Los **vuelos y el alojamiento** son los rubros más grandes: comprarlos con anticipación o en ofertas baja el total más que recortar comidas.',
    'Pagar en cuotas SIN interés es financiación gratis si la inflación licúa la cuota; pagar con interés encarece el viaje: revisá el CFT antes de elegir el plan.',
  ];

  const notes = [
    'El costo es la suma de lo que cargás: no incluye gastos imprevistos (médicos, traslados extra). Conviene dejar un margen del 10-15%.',
    'La cuota mensual es el total dividido por la cantidad de cuotas, sin contar intereses. Si el plan tiene interés, la cuota real será mayor: mirá el CFT.',
    'Es orientativo y no es asesoramiento financiero. Viajar endeudándote a tasa alta puede salir muy caro: priorizá pagar de contado o en cuotas sin interés.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(costoTotal),
      label: 'Costo total del viaje',
      sub: cubreConAhorro
        ? `Lo pagás de contado y te quedan **${fmtMoney(colchonRestante)}** de colchón.`
        : `Te faltan **${fmtMoney(faltante)}**: en ${cuotas} cuotas son **${fmtMoney(cuotaMensual)}/mes**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'podemos-afrontar-este-viaje-familiar',
  title: '¿Podemos afrontar este viaje familiar? Calculadora 2026',
  h1: '¿Podemos afrontar este viaje familiar?',
  description:
    'Sumá el costo real de tu viaje familiar (vuelos, alojamiento, comidas, seguros, cambio de moneda, gastos post-viaje) y mirá si te alcanza el ahorro o en cuántas cuotas conviene financiarlo.',
  intro:
    'Un viaje en familia no es solo los vuelos: son las comidas de cada día, el alojamiento, los seguros, el recargo por moneda extranjera y los gastos que aparecen en el resumen después. Esta sala suma todo el costo real y lo cruza con tu ahorro para decirte si lo pagás de contado y con qué colchón quedás, o cuánto te falta y a qué cuota mensual.',
  icon: '✈️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    vuelos: 1800000,
    alojamiento: 1200000,
    comidasDia: 90000,
    dias: 10,
    seguros: 150000,
    cambioMoneda: 400000,
    gastosPostViaje: 200000,
    ahorroDisponible: 3000000,
    cuotasTarjeta: 6,
  },
  fields: [
    {
      id: 'vuelos',
      label: 'Vuelos / pasajes',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1800000',
      help: 'Total de pasajes para toda la familia (ida y vuelta).',
      group: 'Costos del viaje',
      groupIcon: '🧳',
    },
    {
      id: 'alojamiento',
      label: 'Alojamiento',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1200000',
      help: 'Total de hotel / alquiler por todas las noches.',
      group: 'Costos del viaje',
    },
    {
      id: 'comidasDia',
      label: 'Comidas por día',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '90000',
      help: 'Lo que gasta la familia en comer por día (se multiplica por los días).',
      group: 'Costos del viaje',
    },
    {
      id: 'dias',
      label: 'Días de viaje',
      type: 'number',
      required: true,
      min: 1,
      max: 120,
      default: 7,
      placeholder: '10',
      suffix: 'días',
      help: 'Cuántos días dura el viaje.',
      group: 'Costos del viaje',
    },
    {
      id: 'seguros',
      label: 'Seguros y asistencia',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '150000',
      help: 'Seguro de viaje / asistencia al viajero para todos los integrantes.',
      group: 'Otros costos',
      groupIcon: '🧾',
    },
    {
      id: 'cambioMoneda',
      label: 'Cambio de moneda / impuestos',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '400000',
      help: 'Recargo por consumos en moneda extranjera (impuesto PAIS/percepciones) o costo de cambiar plata.',
      group: 'Otros costos',
    },
    {
      id: 'gastosPostViaje',
      label: 'Gastos post-viaje',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      placeholder: '200000',
      help: 'Consumos que caen en el resumen de tarjeta después (compras, excursiones cargadas al volver).',
      group: 'Otros costos',
    },
    {
      id: 'ahorroDisponible',
      label: 'Ahorro disponible para el viaje',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '3000000',
      profileKey: 'finanzas.ahorros',
      help: 'Plata que tenés guardada y estás dispuesto a usar para este viaje.',
      group: 'Tu plata',
      groupIcon: '💰',
    },
    {
      id: 'cuotasTarjeta',
      label: 'Si lo financiás, ¿en cuántas cuotas?',
      type: 'select',
      default: '1',
      options: [
        { value: '1', label: '1 pago (de contado)' },
        { value: '3', label: '3 cuotas' },
        { value: '6', label: '6 cuotas' },
        { value: '9', label: '9 cuotas' },
        { value: '12', label: '12 cuotas' },
        { value: '18', label: '18 cuotas' },
      ],
      help: 'Para ver la cuota mensual si financiás el viaje con tarjeta.',
      group: 'Tu plata',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
    { slug: 'calculadora-combustible-viaje-auto', label: 'Costo de combustible (si vas en auto)' },
    { slug: 'calculadora-interes-compuesto', label: 'Ahorrar para el viaje' },
  ],
  howItWorks: `Esta sala arma el costo real del viaje y lo cruza con tu plata.

1. **Suma todos los rubros.** Vuelos, alojamiento, comidas (por día × cantidad de días), seguros, cambio de moneda y los gastos que caen en el resumen después. Ese es el costo total real, no solo el de los pasajes.
2. **Lo cruza con tu ahorro.** Resta el costo a tu ahorro disponible: si sobra, te dice cuánto colchón te queda; si falta, cuánto te falta.
3. **Calcula la cuota.** Si tuvieras que financiarlo, divide el total por la cantidad de cuotas para mostrarte la cuota mensual (sin intereses).
4. **Veredicto.** Concluye si lo pagás cómodo y con colchón, si lo cubrís pero quedás justo, o si no te alcanza de contado y conviene financiar o ajustar el viaje.
5. **Escenarios.** Muestra el contado, las cuotas y una versión austera (−20%) para que veas el margen de recorte.`,
  faq: [
    {
      q: '¿Cómo calculo el costo total de un viaje familiar?',
      a: 'Sumando todos los rubros, no solo los pasajes: vuelos, alojamiento, comidas por día multiplicadas por los días, seguros, el recargo por moneda extranjera y los gastos que aparecen en el resumen de tarjeta al volver. Esta sala los junta y te da el total real.',
    },
    {
      q: '¿Conviene pagar el viaje de contado o en cuotas?',
      a: 'Si tenés el ahorro y te queda colchón, pagar de contado evita intereses. Las cuotas SIN interés pueden convenir porque la inflación licúa la cuota; las cuotas CON interés encarecen el viaje. Revisá siempre el CFT del plan antes de elegir.',
    },
    {
      q: '¿Qué es el recargo por consumos en moneda extranjera?',
      a: 'Cuando pagás en el exterior con tarjeta argentina se aplican impuestos y percepciones sobre el consumo en moneda extranjera. Eso encarece bastante el viaje, así que conviene estimarlo y cargarlo en "cambio de moneda / impuestos" para no llevarte sorpresas.',
    },
    {
      q: '¿Por qué aparecen gastos después de volver?',
      a: 'Muchos consumos del viaje (compras, excursiones, alquiler de auto) se debitan en el resumen de tarjeta del mes siguiente. Cargarlos en "gastos post-viaje" hace que el cálculo refleje el impacto real en tu economía cuando ya volviste.',
    },
    {
      q: '¿Debería vaciar mis ahorros para el viaje?',
      a: 'No es recomendable. Conviene conservar siempre un fondo de emergencia. Si pagar el viaje te deja sin colchón, evaluá financiar una parte, recortar gastos del viaje o postergarlo hasta tener más ahorrado.',
    },
    {
      q: '¿Cómo puedo abaratar el viaje sin resignar mucho?',
      a: 'Los vuelos y el alojamiento son los rubros más pesados: comprarlos con anticipación o en ofertas baja el total más que recortar comidas. Viajar en temporada baja, elegir alojamiento con cocina o reducir un par de días también ayuda. La sala muestra un escenario austero (−20%).',
    },
    {
      q: '¿Y si viajamos en auto en vez de avión?',
      a: 'Reemplazá el costo de vuelos por el de combustible, peajes y desgaste. Podés estimar el combustible con la calculadora de combustible de viaje y cargar ese número en "vuelos / pasajes".',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa para que decidas con el costo real a la vista. Endeudarte a tasa alta para viajar puede salir caro: priorizá el contado o las cuotas sin interés y dejá siempre un margen para imprevistos.',
    },
  ],
  sources: [
    { name: 'BCRA — Costo Financiero Total (financiación con tarjeta)', url: 'https://www.bcra.gob.ar/' },
    { name: 'ARCA — Percepciones sobre consumos en moneda extranjera', url: 'https://www.arca.gob.ar/' },
  ],
};
