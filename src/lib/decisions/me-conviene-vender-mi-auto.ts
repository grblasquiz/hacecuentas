/**
 * Sala de decisión — "¿Me conviene vender mi auto?"
 *
 * Patrón BREAKDOWN (una columna). Calcula cuánta plata liberás vendiendo
 * (valor de venta − deuda pendiente) y cuánto ahorrás por mes al dejar de pagar
 * los costos del auto, neto de lo que te costaría moverte de otra forma. Si pensás
 * reemplazarlo, descuenta el costo del auto futuro. Devuelve neto liberado +
 * ahorro mensual y los meses para "recuperar" un reemplazo.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const valorVenta = Math.max(0, num(inputs.valorVenta));
  const deuda = Math.max(0, num(inputs.deudaPendiente));
  const costosEvitados = Math.max(0, num(inputs.costosMensualesEvitados));
  const transporteAlt = Math.max(0, num(inputs.costoTransporteAlternativoMensual));
  const costoReemplazo = Math.max(0, num(inputs.costoReemplazoFuturo));

  if (!valorVenta) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá por cuánto podés vender el auto y la deuda que te queda. Sumá los costos mensuales que te ahorrarías y lo que gastarías en transporte alternativo.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Plata que liberás' },
      scenarios: [],
      nextActions: [
        'Cargá el **valor de venta** del auto y la **deuda pendiente** (si tiene prenda o crédito).',
        'Sumá los **costos mensuales que te ahorrarías** (seguro, patente, service, combustible).',
      ],
    };
  }

  // Plata neta que te queda al vender (descontando la deuda).
  const netoVenta = valorVenta - deuda;
  // Ahorro mensual real = lo que dejás de gastar − lo que gastás en moverte de otra forma.
  const ahorroMensual = costosEvitados - transporteAlt;
  const ahorroAnual = ahorroMensual * 12;

  // Si pensás reemplazarlo, lo que te queda en el bolsillo tras comprar el otro.
  const netoTrasReemplazo = netoVenta - costoReemplazo;

  // Meses para que el ahorro mensual "pague" un eventual reemplazo (si hay reemplazo
  // y hay ahorro positivo). Métrica informativa.
  const mesesRecupero = costoReemplazo > 0 && ahorroMensual > 0
    ? costoReemplazo / ahorroMensual
    : 0;

  const fmtMeses = (m: number) =>
    m <= 0 ? '—' : `${m.toFixed(0)} meses`;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (ahorroMensual > 0 && netoVenta > 0) {
    status = 'b'; // B = conviene vender
    tone = 'good';
    title = 'Sí, vender te libera plata y baja tus gastos';
    badge = 'Conviene vender';
    detail = `Vendiendo liberás ${fmtMoney(netoVenta)} netos (después de cancelar la deuda) y te ahorrás ${fmtMoney(ahorroMensual)} por mes (${fmtMoney(ahorroAnual)} al año) en costos que ya no vas a pagar.`;
  } else if (netoVenta > 0 && ahorroMensual <= 0) {
    status = 'tie';
    tone = 'neutral';
    title = 'Liberás plata, pero moverte sin auto te cuesta parecido';
    badge = 'Ajustado';
    detail = `Vendiendo liberás ${fmtMoney(netoVenta)} netos, pero el transporte alternativo (${fmtMoney(transporteAlt)}/mes) se come casi todo el ahorro de los costos del auto. La decisión pasa más por la comodidad que por la plata.`;
  } else {
    status = 'a'; // A = no conviene / cuidado
    tone = 'warn';
    title = 'Ojo: la deuda se come la venta';
    badge = 'Revisar';
    detail = `Después de cancelar la deuda de ${fmtMoney(deuda)}, te quedan ${fmtMoney(netoVenta)}. Vender en estas condiciones libera poco o nada: evaluá esperar, renegociar la deuda o vender por un valor mayor.`;
  }

  const scenarios = [
    {
      label: 'Solo vender',
      value: fmtMoney(netoVenta),
      detail: deuda > 0
        ? `Valor de venta ${fmtMoney(valorVenta)} − deuda ${fmtMoney(deuda)}.`
        : 'Plata neta que te queda en mano al vender.',
    },
    {
      label: 'Ahorro al año',
      value: fmtMoney(ahorroAnual),
      detail: `Costos que dejás de pagar (${fmtMoney(costosEvitados)}/mes) menos transporte alternativo (${fmtMoney(transporteAlt)}/mes).`,
    },
    {
      label: 'Vender y reemplazar',
      value: fmtMoney(netoTrasReemplazo),
      detail: costoReemplazo > 0
        ? `Lo que te queda tras comprar otro auto de ${fmtMoney(costoReemplazo)}.`
        : 'Cargá el costo del auto de reemplazo para ver este escenario.',
    },
  ];

  const breakdown = [
    { label: 'Valor de venta', value: fmtMoney(valorVenta) },
    { label: '− Deuda pendiente', value: '-' + fmtMoney(deuda).replace('-', '') },
    { label: 'Plata neta liberada', value: fmtMoney(netoVenta), hint: deuda > 0 ? `${valorVenta > 0 ? Math.round((deuda / valorVenta) * 100) : 0}% del valor se va en deuda` : undefined },
    { label: 'Costos mensuales que evitás', value: fmtMoney(costosEvitados), hint: 'seguro + patente + service + combustible' },
    { label: '− Transporte alternativo', value: '-' + fmtMoney(transporteAlt).replace('-', '') },
    { label: 'Ahorro mensual real', value: fmtMoney(ahorroMensual) },
    { label: 'Ahorro anual real', value: fmtMoney(ahorroAnual) },
    ...(costoReemplazo > 0
      ? [{ label: 'Neto tras reemplazar el auto', value: fmtMoney(netoTrasReemplazo), hint: mesesRecupero > 0 ? `el ahorro paga el reemplazo en ${fmtMeses(mesesRecupero)}` : undefined }]
      : []),
  ];

  const nextActions = [
    netoVenta > 0
      ? `Vender libera **${fmtMoney(netoVenta)}**. Antes de gastarlos, decidí destino: cancelar deuda cara, fondo de emergencia o inversión. Esa plata trabajando es parte del beneficio.`
      : `La deuda casi iguala el valor del auto. Pedí en la prenda el **monto exacto de cancelación anticipada** (suele tener quita de intereses) antes de descartar la venta.`,
    ahorroMensual > 0
      ? `Te ahorrás **${fmtMoney(ahorroMensual)}/mes**. Verificá que el transporte alternativo realmente te alcance: si después tenés que volver a comprar auto, el ahorro se evapora.`
      : 'Si moverte sin auto cuesta casi lo mismo, la venta se justifica solo si necesitás la plata o usás muy poco el auto. Compará con la sala "¿Auto, transporte público, taxi o app?".',
    'Para vender mejor: ponelo a punto (service al día, detallado), reuní toda la documentación (cédula, VTV, libre deuda de patentes e infracciones) y publicá en varios canales para no rematarlo.',
    'Si vendés para comprar otro auto, corré primero la sala "¿Me conviene comprar un auto nuevo o usado?" con la plata liberada como referencia.',
  ];

  const notes = [
    'El ahorro mensual real resta el transporte alternativo: vender el auto no es "ahorro puro" si después gastás en colectivo, taxi o app para moverte igual.',
    'No incluye el costo de oportunidad de la plata liberada ni la depreciación futura del auto si lo conservás (que también es un costo).',
    'Orientativo, no es asesoramiento financiero. Confirmá el monto de cancelación de la prenda con la entidad: la cancelación anticipada suele tener quita de intereses.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(netoVenta),
      label: 'Plata neta que liberás',
      sub: `Más un ahorro de **${fmtMoney(ahorroMensual)}/mes** (${fmtMoney(ahorroAnual)} al año) en costos que dejás de pagar.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'me-conviene-vender-mi-auto',
  title: '¿Me conviene vender mi auto? Cuánto liberás y ahorrás 2026',
  h1: '¿Me conviene vender mi auto?',
  description:
    'Calculá cuánta plata liberás al vender tu auto (descontando la deuda) y cuánto ahorrás por mes en seguro, patente, service y combustible, neto del transporte alternativo.',
  intro:
    'Vender el auto tiene dos efectos: te entra plata de golpe (descontando la deuda que tenga) y dejás de pagar todos sus costos mensuales. Pero si después tenés que moverte en colectivo, taxi o app, ese gasto se descuenta del ahorro. Esta sala calcula cuánto liberás de verdad y cuánto ahorrás por mes, para que la decisión sea con números y no con corazonadas.',
  icon: '🔑',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    valorVenta: 16000000,
    deudaPendiente: 3000000,
    costosMensualesEvitados: 450000,
    costoTransporteAlternativoMensual: 120000,
    costoReemplazoFuturo: 0,
  },
  fields: [
    {
      id: 'valorVenta',
      label: 'Por cuánto podés venderlo',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '16000000',
      profileKey: 'vehiculo.valor',
      help: 'Precio realista de venta (mirá publicaciones de tu mismo modelo y año).',
      group: 'La venta',
      groupIcon: '🔑',
    },
    {
      id: 'deudaPendiente',
      label: 'Deuda pendiente (prenda / crédito)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '3000000',
      help: 'Saldo que te queda del crédito prendario. Si está sin deuda, dejá 0.',
      group: 'La venta',
    },
    {
      id: 'costosMensualesEvitados',
      label: 'Costos mensuales que te ahorrarías',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '450000',
      help: 'Seguro + patente + service + combustible que dejás de pagar por mes.',
      group: 'Lo que cambia',
      groupIcon: '🔄',
    },
    {
      id: 'costoTransporteAlternativoMensual',
      label: 'Transporte alternativo (mensual)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '120000',
      help: 'Lo que gastarías en colectivo, subte, taxi o app para moverte sin auto.',
      group: 'Lo que cambia',
    },
    {
      id: 'costoReemplazoFuturo',
      label: 'Costo del auto de reemplazo',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      placeholder: '0',
      help: 'Si pensás comprar otro auto, cuánto te costaría. Dejá 0 si no vas a reemplazarlo.',
      group: 'Lo que cambia',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-combustible-viaje-auto', label: 'Costo de combustible' },
    { slug: 'calculadora-cuota-prestamo', label: 'Saldo de la prenda' },
    { slug: 'calculadora-plazo-fijo', label: 'Invertir lo liberado' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Regla 50/30/20' },
  ],
  howItWorks: `La sala mide los dos beneficios de vender —plata de golpe y ahorro mensual— netos de lo que cambia.

1. **Plata neta liberada.** Toma el valor de venta y le resta la deuda pendiente (prenda o crédito). Es la plata que realmente te queda en mano.
2. **Ahorro mensual real.** Suma los costos que dejás de pagar (seguro, patente, service, combustible) y le resta el transporte alternativo que vas a usar para moverte sin auto.
3. **Ahorro anual.** Lleva ese ahorro mensual a 12 meses, para dimensionar el impacto en tu presupuesto.
4. **Reemplazo (opcional).** Si pensás comprar otro auto, descuenta su costo para mostrarte cuánto te queda neto y en cuántos meses el ahorro lo "paga".
5. **Veredicto.** Conviene vender si liberás plata y bajás gastos. Si el transporte alternativo se come el ahorro, la decisión pasa más por la comodidad que por la plata.`,
  faq: [
    {
      q: '¿Cómo sé cuánto vale realmente mi auto?',
      a: 'Mirá publicaciones de tu mismo modelo, año y kilometraje en los portales de venta, y restá un poco respecto del precio publicado (suele negociarse). Tené en cuenta el estado, el service al día y la documentación, que influyen bastante en el valor final.',
    },
    {
      q: '¿Qué pasa si todavía debo el crédito prendario?',
      a: 'Tenés que cancelar la prenda para poder transferir el auto. El saldo pendiente se descuenta de lo que liberás. Pedí a la entidad el monto exacto de cancelación anticipada: suele tener una quita de intereses respecto de pagar todas las cuotas.',
    },
    {
      q: '¿Vender el auto es ahorro puro?',
      a: 'No siempre. Si después tenés que moverte en transporte público, taxi o app, ese gasto se descuenta del ahorro de los costos del auto. Por eso esta sala calcula el ahorro neto: costos que evitás menos transporte alternativo.',
    },
    {
      q: '¿Conviene vender para comprar uno más barato?',
      a: 'Puede convenir si liberás capital y bajás costos (seguro y patente más baratos en un auto de menor valor). Cargá el costo del auto de reemplazo y la sala te muestra cuánto te queda neto y en cuántos meses el ahorro mensual lo compensa.',
    },
    {
      q: '¿Qué hago con la plata que libero?',
      a: 'Lo más eficiente suele ser cancelar deuda cara (tarjeta, descubierto) o, si no tenés, armar o reforzar tu fondo de emergencia e invertir el resto. Dejar esa plata quieta en pesos la licúa la inflación.',
    },
    {
      q: '¿Qué documentación necesito para vender?',
      a: 'Cédula verde (o azul si corresponde), título del automotor, VTV vigente, libre deuda de patentes e infracciones y, si tuvo prenda, el certificado de cancelación. Tener todo en regla acelera la venta y mejora el precio.',
    },
    {
      q: '¿Esto incluye la depreciación del auto?',
      a: 'No directamente, pero conservar el auto implica que va a seguir perdiendo valor. Si dudás entre vender ahora o más adelante, considerá que cada año que pasa el auto vale menos, y eso juega a favor de vender antes.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa con datos que cargás vos. No considera el costo de oportunidad de la plata liberada ni todos los gastos posibles. Para decisiones grandes, asesorate con un profesional de confianza.',
    },
  ],
  sources: [
    { name: 'DNRPA — Trámites del automotor', url: 'https://www.dnrpa.gov.ar/' },
    { name: 'Superintendencia de Seguros de la Nación', url: 'https://www.argentina.gob.ar/ssn' },
  ],
};
