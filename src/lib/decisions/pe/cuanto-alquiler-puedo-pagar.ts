/**
 * Sala de decisión PE — "¿Cuánto alquiler puedo pagar?"
 *
 * Patrón VIVIENDA / BREAKDOWN, con la realidad del alquiler peruano: la regla
 * del 30% del ingreso neto (35% de techo) se aplica sobre alquiler MÁS
 * mantenimiento (que en edificios de Lima se paga aparte), la entrada exige
 * garantía de 1-2 meses más un mes adelantado, y el incremento anual no lo fija
 * ningún índice legal: es lo que pactes en el contrato. También responde a
 * quien busca "renta", como se dice en parte del país.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPEN as fmtMoney } from '../locales';
import { num } from '../types';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const deudas = Math.max(0, num(inputs.deudasMensuales));
  const mantenimiento = Math.max(0, num(inputs.mantenimientoEstimado));
  const servicios = Math.max(0, num(inputs.serviciosEstimados));
  const ahorroObjetivoPct = Math.max(0, Math.min(100, num(inputs.ahorroObjetivo)));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga tu ingreso neto mensual (lo que te depositan, ya con descuentos de AFP/ONP e impuestos). Con eso calculamos cuánto alquiler puedes pagar sin ahogarte, descontando deudas, servicios y tu meta de ahorro.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Alquiler máximo saludable' },
      scenarios: [],
      nextActions: [
        'Carga tu **ingreso neto mensual** (o el familiar, si alquilan entre dos).',
        'Suma tus **cuotas de deudas, servicios** y tu **meta de ahorro** para afinar el resultado.',
      ],
    };
  }

  const ingresoNetoDeudas = Math.max(0, ingreso - deudas);

  // Umbrales de carga de vivienda (alquiler + mantenimiento) sobre el ingreso.
  const techo30 = ingreso * 0.3;
  const techo35 = ingreso * 0.35;
  const margenAhorro = ingreso * (ahorroObjetivoPct / 100);
  const recomendadoCarga = Math.max(0, Math.min(techo30, ingresoNetoDeudas - margenAhorro - servicios));

  const alquilerMax30 = Math.max(0, techo30 - mantenimiento);
  const alquilerMax35 = Math.max(0, techo35 - mantenimiento);
  const alquilerRecomendado = Math.max(0, recomendadoCarga - mantenimiento);
  const cargaRecomendadaPct = ingreso > 0 ? ((alquilerRecomendado + mantenimiento) / ingreso) * 100 : 0;

  // Costo de entrada típico en el Perú: 1 mes adelantado + 1-2 de garantía.
  const entradaMin = alquilerRecomendado * 2; // adelanto + 1 garantía
  const entradaMax = alquilerRecomendado * 3; // adelanto + 2 garantías

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;

  if (alquilerRecomendado >= alquilerMax30 * 0.9 && deudas <= ingreso * 0.2) {
    status = 'b';
    tone = 'good';
    title = 'Tienes margen sano para alquilar';
    badge = 'Margen sano';
  } else if (alquilerRecomendado > 0) {
    status = 'tie';
    tone = 'neutral';
    title = 'Puedes alquilar, pero con presupuesto ajustado';
    badge = 'Ajustado';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Con estos números el alquiler te asfixia';
    badge = 'Apretado';
  }

  const detail = `Con un ingreso neto de ${fmtMoney(ingreso)}, tu alquiler máximo saludable es ${fmtMoney(alquilerRecomendado)} (más ${fmtMoney(mantenimiento)} de mantenimiento = ${cargaRecomendadaPct.toFixed(0)}% del ingreso). Estirándote al 35% llegarías a ${fmtMoney(alquilerMax35)}, pero ahí te queda muy poco aire para deudas, servicios y ahorro. Y recuerda: para entrar necesitas entre ${fmtMoney(entradaMin)} y ${fmtMoney(entradaMax)} juntos (adelanto más garantía).`;

  const scenarios = [
    { label: 'Cómodo (30% con ahorro)', value: fmtMoney(alquilerRecomendado), detail: `Deja espacio a tu meta de ahorro (${ahorroObjetivoPct}%) y a tus deudas. Es el número recomendado.` },
    { label: 'Estándar (30% del ingreso)', value: fmtMoney(alquilerMax30), detail: 'La regla clásica: alquiler más mantenimiento no deben superar el 30% del neto.' },
    { label: 'Techo (35% del ingreso)', value: fmtMoney(alquilerMax35), detail: 'El máximo absoluto. Por encima, la vivienda se come tu presupuesto.' },
  ];

  const breakdown = [
    { label: 'Ingreso neto mensual', value: fmtMoney(ingreso), hint: 'Ya descontados AFP/ONP y renta de quinta' },
    { label: '− Cuotas de deudas', value: '-' + fmtMoney(deudas).replace('-', ''), hint: 'Tarjetas, préstamos, línea paralela' },
    { label: '− Servicios estimados', value: '-' + fmtMoney(servicios).replace('-', ''), hint: 'Luz, agua, internet, gas' },
    { label: `− Ahorro objetivo (${ahorroObjetivoPct}%)`, value: '-' + fmtMoney(margenAhorro).replace('-', '') },
    { label: 'Disponible para vivienda', value: fmtMoney(Math.max(0, ingresoNetoDeudas - servicios - margenAhorro)) },
    { label: 'Mantenimiento estimado', value: fmtMoney(mantenimiento), hint: 'Cuenta dentro del 30%' },
    { label: 'Alquiler máximo saludable', value: fmtMoney(alquilerRecomendado), hint: `${cargaRecomendadaPct.toFixed(0)}% del ingreso con mantenimiento` },
  ];

  const nextActions = [
    `Busca departamentos de hasta **${fmtMoney(alquilerRecomendado)}** de alquiler (pregunta SIEMPRE cuánto es el mantenimiento aparte: en Lima puede sumar S/ 150-500).`,
    `Junta la entrada antes de buscar: **${fmtMoney(entradaMin)} a ${fmtMoney(entradaMax)}** entre el mes adelantado y la garantía de 1-2 meses que piden casi todos los propietarios.`,
    'Firma el incremento anual EN el contrato: en el Perú no hay índice legal de reajuste, así que lo que pactes (por ejemplo, 3-5% anual o según inflación) es lo que vale. Sin pacto, el propietario puede pedir lo que quiera al renovar.',
    deudas > ingreso * 0.2
      ? `Tus deudas se llevan el ${((deudas / ingreso) * 100).toFixed(0)}% del ingreso: bajarlas te libera presupuesto para un mejor alquiler o más ahorro.`
      : 'Pide recibo o factura por el alquiler: te sirve como historial de pagos y el propietario debe declarar renta de primera categoría — un contrato formal te protege a ti.',
  ];

  const notes = [
    'La regla de referencia: alquiler más mantenimiento no deberían superar el 30% del ingreso neto (35% como techo). Es una guía de salud financiera, no una norma legal peruana.',
    'El cálculo descuenta deudas, servicios y tu meta de ahorro para darte un número sostenible, no el máximo teórico.',
    'No incluye el costo de entrada (garantía de 1-2 meses + mes adelantado) ni el incremento anual que pactes en el contrato: considera ambos antes de firmar.',
    'No es asesoría financiera; es una guía para presupuestar. Adáptala a tu situación.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(alquilerRecomendado),
      label: 'Alquiler máximo saludable',
      sub: `Más ${fmtMoney(mantenimiento)} de mantenimiento = ${cargaRecomendadaPct.toFixed(0)}% de tu ingreso. Techo absoluto: ${fmtMoney(alquilerMax35)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-alquiler-puedo-pagar',
  title: '¿Cuánto alquiler puedo pagar? Tu tope sano en el Perú 2026',
  h1: '¿Cuánto alquiler puedo pagar?',
  description:
    'Calcula el alquiler máximo que puedes pagar en el Perú sin ahogarte: regla del 30-35% del ingreso neto, mantenimiento aparte, y cuánto necesitas juntar de garantía y adelanto para entrar al departamento.',
  intro:
    'Antes de recorrer departamentos conviene saber hasta dónde te alcanza. La regla sana es que el alquiler (o renta, como también se le dice) más el mantenimiento no superen el 30% de tu ingreso neto, con 35% de techo absoluto. Esta sala calcula tu alquiler máximo saludable descontando deudas, servicios y tu meta de ahorro, te muestra cómo queda repartido tu ingreso y cuánto necesitas juntar para la entrada: en el Perú te van a pedir un mes adelantado más una garantía de uno o dos meses.',
  icon: '🔑',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    ingresoNeto: 5500,
    deudasMensuales: 400,
    mantenimientoEstimado: 250,
    serviciosEstimados: 350,
    ahorroObjetivo: 10,
  },
  fields: [
    { id: 'ingresoNeto', label: 'Ingreso neto mensual', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '5,500', help: 'Lo que te depositan al mes, ya descontados AFP/ONP e impuesto a la renta. Si alquilan entre dos, suma ambos ingresos.', group: 'Tus ingresos', groupIcon: '💵' },
    { id: 'deudasMensuales', label: 'Cuotas de deudas al mes', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '400', help: 'Tarjetas, préstamos personales o vehicular: lo que pagas sí o sí cada mes.', group: 'Tus gastos', groupIcon: '🧾' },
    { id: 'mantenimientoEstimado', label: 'Mantenimiento estimado', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '250', help: 'La cuota del edificio o condominio, que casi siempre se paga aparte del alquiler. Cuenta dentro del 30%.', group: 'Tus gastos' },
    { id: 'serviciosEstimados', label: 'Servicios estimados', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '350', help: 'Luz, agua, internet y gas al mes.', group: 'Tus gastos' },
    { id: 'ahorroObjetivo', label: 'Meta de ahorro', type: 'number', suffix: '%', recommended: true, default: 10, min: 0, max: 100, placeholder: '10', help: 'Qué porcentaje de tu ingreso quieres guardar cada mes (la regla 50-30-20 sugiere 20%).', group: 'Tu meta', groupIcon: '🎯' },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-alquiler-asequible-ingreso-peru', label: 'Alquiler según tu ingreso' },
    { slug: 'pe/calculadora-sueldo-bruto-a-neto-peru', label: 'Sueldo bruto a neto' },
    { slug: 'pe/calculadora-costo-vida-mensual-peru', label: 'Costo de vida mensual' },
  ],
  howItWorks: `Esta sala traduce tu ingreso neto en un alquiler que puedes sostener sin ahogarte.

1. **Punto de partida.** Toma tu ingreso neto (ya con descuentos de AFP/ONP y renta de quinta) y le resta las cuotas de deudas que pagas cada mes.
2. **Regla del 30-35%.** Calcula el techo clásico: alquiler más mantenimiento no deberían pasar del 30% del ingreso, con 35% como máximo absoluto.
3. **Servicios y ahorro.** Reserva espacio para luz, agua e internet y para tu meta de ahorro mensual, de modo que el alquiler no se coma todo tu presupuesto.
4. **Alquiler máximo saludable.** Resta el mantenimiento (que en el Perú se paga aparte) del techo recomendado y te da el alquiler puro que puedes pagar cómodo.
5. **La entrada.** Estima cuánto necesitas juntar antes de firmar: el mes adelantado más la garantía de 1-2 meses que piden los propietarios. Es el costo oculto que descoloca a la mayoría.`,
  faq: [
    { q: '¿Qué porcentaje del sueldo se puede gastar en alquiler en el Perú?', a: 'La regla sana es que el alquiler más el mantenimiento no superen el 30% de tu ingreso neto, con un techo absoluto de 35%. Con un sueldo neto de S/ 3,500, eso significa un alquiler de hasta S/ 1,000-1,200 aproximadamente, según el mantenimiento de la zona.' },
    { q: '¿El mantenimiento cuenta dentro del 30%?', a: 'Sí. En Lima y las principales ciudades, el mantenimiento del edificio (S/ 150-500 según el distrito y las áreas comunes) se paga aparte del alquiler, pero es parte del costo de vivir ahí. Por eso esta sala lo resta del techo antes de darte tu alquiler máximo.' },
    { q: '¿Cuánta plata necesito para entrar a un departamento alquilado?', a: 'Lo usual en el Perú es un mes de adelanto más una garantía de uno o dos meses de alquiler. Para un alquiler de S/ 1,500, eso significa juntar entre S/ 3,000 y S/ 4,500 antes de firmar. La garantía se devuelve al final del contrato si entregas el inmueble en buen estado.' },
    { q: '¿Cuánto puede subir el alquiler cada año?', a: 'En el Perú no existe un índice legal de reajuste: el incremento es el que pactes en el contrato. Lo razonable es acordar un porcentaje explícito (3-5% anual o ligado a la inflación, que ronda 2-3%). Si el contrato no dice nada, al renovar el propietario puede proponer el precio que quiera.' },
    { q: '¿Es lo mismo alquiler que renta?', a: 'En el uso cotidiano sí: en el Perú se dice sobre todo "alquiler", aunque también se usa "renta" o "arriendo". Ojo con no confundirlo con la "renta de primera categoría", que es el impuesto que paga el propietario a la SUNAT por alquilar su inmueble.' },
    { q: '¿Y si mis ingresos son variables o cobro por recibos por honorarios?', a: 'Usa un promedio conservador de tus últimos 6 meses, tirando hacia abajo, y descuenta la retención o pago a cuenta de cuarta categoría. Muchos propietarios piden demostrar ingresos de 3 veces el alquiler; con ingresos variables suelen pedir más garantía o un fiador.' },
    { q: '¿Debo firmar contrato aunque el propietario no quiera?', a: 'Sí, siempre. El contrato escrito (idealmente con firmas legalizadas ante notario) fija el precio, el incremento anual, la garantía y las condiciones de salida. Sin contrato no tienes cómo probar lo pactado, y para el propietario formalizar implica declarar el impuesto a la renta de primera categoría.' },
    { q: '¿Debería gastar el máximo que me da la calculadora?', a: 'No: el máximo es un techo, no una meta. Cuanto más abajo del 30% te quedes, más aire tienes para ahorrar la cuota inicial de tu propia vivienda, cubrir imprevistos y absorber los incrementos de contrato sin mudarte.' },
  ],
  sources: [
    { name: 'INEI — Encuesta Nacional de Hogares y estadísticas de gasto', url: 'https://www.inei.gob.pe/' },
    { name: 'BCRP — Reporte de Inflación (expectativas de precios)', url: 'https://www.bcrp.gob.pe/' },
  ],
};
