/**
 * Sala de decisión MX — "¿Cuánta renta puedo pagar?"
 *
 * Regla del 30% del ingreso neto (35% como techo) aplicada a la realidad
 * mexicana: la cuota de mantenimiento cuenta dentro del tope, el costo de
 * entrada suele ser de 2-3 rentas (depósito + póliza jurídica o aval), y el
 * contrato sube cada año por INPC o por el porcentaje pactado (~5%).
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoFamiliar));
  const deudas = Math.max(0, num(inputs.deudasMensuales));
  const mantenimiento = Math.max(0, num(inputs.cuotaMantenimiento));
  const servicios = Math.max(0, num(inputs.serviciosEstimados));
  const ahorroObjetivoPct = Math.max(0, Math.min(100, num(inputs.ahorroObjetivo)));
  const incrementoAnual = Math.max(0, num(inputs.incrementoAnual));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Carga tu ingreso familiar neto mensual (si cobras por quincena, multiplica por dos). Con eso calculamos la renta máxima que puedes pagar sin ahogarte, descontando deudas, servicios y tu meta de ahorro.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Renta máxima saludable' },
      scenarios: [],
      nextActions: [
        'Carga tu **ingreso familiar neto** (lo que llega a la cuenta cada mes, sumando quincenas).',
        'Agrega tus **deudas, servicios** y tu **meta de ahorro** para afinar el número.',
      ],
    };
  }

  // Carga de vivienda = renta + cuota de mantenimiento, medida sobre el ingreso.
  const techo30 = ingreso * 0.30;
  const techo35 = ingreso * 0.35;
  const margenAhorro = ingreso * (ahorroObjetivoPct / 100);
  const disponibleVivienda = Math.max(0, ingreso - deudas - servicios - margenAhorro);
  const cargaRecomendada = Math.max(0, Math.min(techo30, disponibleVivienda));

  const rentaRecomendada = Math.max(0, cargaRecomendada - mantenimiento);
  const rentaMax30 = Math.max(0, techo30 - mantenimiento);
  const rentaMax35 = Math.max(0, techo35 - mantenimiento);

  const cargaPct = ingreso > 0 ? ((rentaRecomendada + mantenimiento) / ingreso) * 100 : 0;

  // Costo de entrada típico en México: 1 mes de depósito + póliza jurídica o
  // trámite de aval (~1 renta) + primer mes por adelantado ≈ 3 rentas.
  const costoEntrada = rentaRecomendada * 3;
  const rentaAno2 = rentaRecomendada * (1 + incrementoAnual / 100);

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;

  if (rentaRecomendada >= rentaMax30 * 0.9 && deudas <= ingreso * 0.2) {
    status = 'b';
    tone = 'good';
    title = 'Tienes margen sano para rentar';
    badge = 'Margen sano';
  } else if (rentaRecomendada > 0) {
    status = 'tie';
    tone = 'neutral';
    title = 'Puedes rentar, pero vas justo';
    badge = 'Justo';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Con estos números la renta te aprieta';
    badge = 'Apretado';
  }

  const detail = `Con un ingreso de ${fmtMoney(ingreso)}, tu renta máxima saludable es ${fmtMoney(rentaRecomendada)} (más ${fmtMoney(mantenimiento)} de mantenimiento = ${cargaPct.toFixed(0)}% del ingreso). Estirándote al 35%, el tope absoluto sería ${fmtMoney(rentaMax35)}, pero ahí casi no queda aire para deudas, servicios ni ahorro — y recuerda que al renovar, la renta sube (~${incrementoAnual.toFixed(0)}% al año por INPC o lo pactado).`;

  const scenarios = [
    {
      label: 'Cómodo (30% con ahorro)',
      value: fmtMoney(rentaRecomendada),
      detail: `Deja lugar a tu meta de ahorro (${ahorroObjetivoPct}%) y a tus deudas. Es el número recomendado.`,
    },
    {
      label: 'Estándar (30% del ingreso)',
      value: fmtMoney(rentaMax30),
      detail: 'La regla clásica: renta más mantenimiento ≤ 30% del ingreso neto.',
    },
    {
      label: 'Tope (35% del ingreso)',
      value: fmtMoney(rentaMax35),
      detail: 'El máximo que no conviene rebasar. Arriba de esto, la vivienda te ahoga.',
    },
  ];

  const breakdown = [
    { label: 'Ingreso familiar neto', value: fmtMoney(ingreso) },
    { label: '− Deudas mensuales', value: '-' + fmtMoney(deudas).replace('-', ''), hint: 'Tarjetas, créditos, MSI' },
    { label: '− Servicios estimados', value: '-' + fmtMoney(servicios).replace('-', ''), hint: 'Luz (CFE), agua, gas, internet' },
    { label: `− Ahorro objetivo (${ahorroObjetivoPct}%)`, value: '-' + fmtMoney(margenAhorro).replace('-', '') },
    { label: 'Disponible para vivienda', value: fmtMoney(disponibleVivienda) },
    { label: 'Cuota de mantenimiento', value: fmtMoney(mantenimiento), hint: 'Cuenta dentro del 30%' },
    { label: 'Renta máxima saludable', value: fmtMoney(rentaRecomendada), hint: `${cargaPct.toFixed(0)}% del ingreso con mantenimiento` },
    { label: 'Costo de entrada estimado', value: fmtMoney(costoEntrada), hint: 'Depósito + póliza jurídica/aval + primer mes (~3 rentas)' },
  ];

  const nextActions = [
    `Busca departamentos de hasta **${fmtMoney(rentaRecomendada)}** de renta (más mantenimiento): así te queda aire para imprevistos, para ahorrar y para el incremento anual.`,
    `Junta unos **${fmtMoney(costoEntrada)}** antes de firmar: la entrada típica es un mes de depósito, la póliza jurídica o el trámite del aval (~1 renta más) y el primer mes por adelantado.`,
    deudas > ingreso * 0.2
      ? `Tus deudas se llevan el ${fmtPct((deudas / ingreso) * 100, 0).replace('+', '')} de tu ingreso: bajarlas te libera dinero para una mejor renta o más ahorro.`
      : `Presupuesta la renovación: con un incremento del ${incrementoAnual.toFixed(0)}% anual, esta renta sería ${fmtMoney(rentaAno2)} el año que entra. Que el año 2 también te salga la cuenta.`,
    'Antes de firmar revisa el contrato: monto y fórmula del incremento (INPC o % fijo), quién paga la póliza jurídica, y condiciones de devolución del depósito.',
  ];

  const notes = [
    'La regla de referencia es que renta más cuota de mantenimiento no superen el 30% del ingreso neto (35% como tope). Es una guía de salud financiera, no una norma legal.',
    'El cálculo descuenta deudas, servicios y tu meta de ahorro para darte un número sostenible, no el máximo teórico que un arrendador te aceptaría.',
    'El costo de entrada (≈3 rentas) es una estimación típica: depósito de un mes, póliza jurídica o aval, y primer mes adelantado. En algunas ciudades piden dos meses de depósito.',
    'No es asesoría financiera. Es una guía para presupuestar; ajústala a tu caso y, ante dudas, consulta a un profesional.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(rentaRecomendada),
      label: 'Renta máxima saludable',
      sub: `Más ${fmtMoney(mantenimiento)} de mantenimiento = ${cargaPct.toFixed(0)}% de tu ingreso. Tope absoluto: ${fmtMoney(rentaMax35)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanta-renta-puedo-pagar',
  title: '¿Cuánta renta puedo pagar? Tu tope sano en México 2026',
  h1: '¿Cuánta renta puedo pagar?',
  description:
    'Calcula la renta máxima que puedes pagar sin ahogarte con la regla del 30-35% del ingreso neto, descontando deudas, servicios, cuota de mantenimiento y tu meta de ahorro. Incluye el costo de entrada (depósito + póliza jurídica) y el incremento anual.',
  intro:
    'Antes de salir a ver departamentos conviene saber hasta dónde te alcanza. La regla sana en México es que la renta más la cuota de mantenimiento no pasen del 30% de tu ingreso neto (35% como tope). Esta sala calcula tu renta máxima saludable descontando deudas, servicios y lo que quieres ahorrar, te estima el costo de entrada — depósito, póliza jurídica o aval, primer mes — y te recuerda que la renta sube cada año por INPC o lo que pactes.',
  icon: '🔑',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    ingresoFamiliar: 40000,
    deudasMensuales: 3000,
    cuotaMantenimiento: 1200,
    serviciosEstimados: 2200,
    ahorroObjetivo: 10,
    incrementoAnual: 5,
  },
  fields: [
    { id: 'ingresoFamiliar', label: 'Ingreso familiar neto mensual', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '40000', help: 'Lo que llega a la cuenta cada mes entre todos los que aportan. Si cobras por quincena, suma las dos.', group: 'Tus ingresos', groupIcon: '💵' },
    { id: 'deudasMensuales', label: 'Deudas mensuales', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '3000', help: 'Mensualidades de tarjetas, MSI, crédito de nómina o personal que pagas cada mes.', group: 'Tus gastos', groupIcon: '🧾' },
    { id: 'cuotaMantenimiento', label: 'Cuota de mantenimiento', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '1200', help: 'La cuota mensual del edificio o coto en la zona que buscas. Cuenta dentro del 30%.', group: 'Tus gastos' },
    { id: 'serviciosEstimados', label: 'Servicios estimados', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '2200', help: 'Luz (CFE), agua, gas e internet al mes.', group: 'Tus gastos' },
    { id: 'ahorroObjetivo', label: 'Meta de ahorro', type: 'number', suffix: '%', recommended: true, default: 10, min: 0, max: 100, placeholder: '10', help: 'Qué porcentaje de tu ingreso quieres apartar cada mes (la regla 50-30-20 sugiere 20%).', group: 'Tu meta', groupIcon: '🎯' },
    { id: 'incrementoAnual', label: 'Incremento anual de la renta', type: 'number', suffix: '%', default: 5, min: 0, max: 30, placeholder: '5', advanced: true, help: 'Lo que sube la renta al renovar: por INPC (~4%) o el porcentaje pactado en el contrato (típico 5%).', group: 'Tu meta' },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-renta-mensual-cdmx-vs-guadalajara-monterrey', label: 'Renta CDMX vs GDL vs MTY' },
    { slug: 'mx/calculadora-sueldo-neto-mexico', label: 'Sueldo neto México' },
    { slug: 'mx/calculadora-coste-vida-mensual-mexico-soltero-pareja-familia', label: 'Costo de vida mensual' },
    { slug: 'mx/calculadora-fondo-emergencia-mexico-meses-gastos', label: 'Fondo de emergencia' },
  ],
  howItWorks: `Esta sala convierte tu ingreso en una renta que puedes sostener sin ahogarte.

1. **Punto de partida.** Toma tu ingreso familiar neto mensual (tus quincenas juntas) y le resta las deudas que pagas sí o sí.
2. **Regla del 30-35%.** Calcula el tope clásico: renta más cuota de mantenimiento no deberían pasar del 30% del ingreso, con 35% como máximo absoluto.
3. **Servicios y ahorro.** Aparta lo de luz, agua, gas e internet y tu meta de ahorro, para que la renta no se coma todo el presupuesto.
4. **Renta máxima saludable.** Resta la cuota de mantenimiento del tope recomendado: ese es el número que te conviene buscar en los portales.
5. **La entrada y el año 2.** Estima el costo de entrada (depósito + póliza jurídica o aval + primer mes ≈ 3 rentas) y cuánto quedaría la renta tras el incremento anual, para que la cuenta te salga también al renovar.`,
  faq: [
    { q: '¿Qué porcentaje del sueldo se puede ir a la renta?', a: 'La regla sana es que la renta más la cuota de mantenimiento no pasen del 30% de tu ingreso neto mensual, con un tope absoluto del 35%. Por ejemplo: con $40,000 netos al mes, buscar rentas de hasta $11,000-12,000. Arriba de eso, la vivienda te deja sin margen para deudas, ahorro e imprevistos.' },
    { q: '¿La cuota de mantenimiento cuenta dentro del 30%?', a: 'Sí. Lo que importa es el costo total de vivir ahí. Un departamento de $10,000 con $2,000 de mantenimiento cuesta lo mismo que uno de $12,000 sin cuota. Por eso esta sala te da la renta pura ya descontando el mantenimiento estimado de la zona.' },
    { q: '¿Cuánto necesito para la entrada, además de la renta?', a: 'Lo típico en México son unas 3 rentas: un mes de depósito en garantía, el costo de la póliza jurídica o del trámite del aval (alrededor de una renta más) y el primer mes por adelantado. Para una renta de $12,000, presupuesta unos $36,000 de entrada. En algunas ciudades piden dos meses de depósito.' },
    { q: '¿Qué es la póliza jurídica y quién la paga?', a: 'Es un contrato con una empresa que investiga al inquilino y respalda al arrendador en caso de impago, y cada vez sustituye más al aval con propiedad. Cuesta entre 30% y 50% de una renta mensual (a veces una renta completa). Lo usual es que la pague el inquilino, aunque es negociable: pregunta antes de firmar.' },
    { q: '¿Cuánto puede subir la renta cada año?', a: 'Lo que diga el contrato: lo más común es un incremento anual conforme al INPC (la inflación, ~4% en 2026) o un porcentaje fijo pactado, típicamente 5%. En CDMX, el Código Civil local limita el incremento en vivienda a la inflación del año anterior. Si el contrato no dice nada, negocia la fórmula antes de firmar.' },
    { q: '¿Por qué se descuentan mis deudas del cálculo?', a: 'Porque las mensualidades de tarjetas, MSI o crédito de nómina se pagan sí o sí. Si ya se llevan más del 20% de tu ingreso, la renta que puedes sostener baja. La sala las resta para darte un número realista, no el máximo teórico.' },
    { q: '¿Y si mis ingresos son variables o cobro por honorarios?', a: 'Usa un promedio conservador de tus últimos 6 meses, tirándole hacia abajo. Además, ten en cuenta que sin recibos de nómina muchos arrendadores piden más requisitos (más depósito, póliza jurídica obligatoria o estados de cuenta), así que el costo de entrada puede subir.' },
    { q: '¿Debería rentar por el máximo que me da la calculadora?', a: 'No. El tope es un límite, no una meta. Cuanto más abajo del 30% quedes, más aire tienes para ahorrar el enganche de una casa propia, para imprevistos y para absorber los incrementos anuales sin dolor. Apunta al escenario cómodo, no al tope.' },
    { q: '¿Me piden comprobar ingresos por 3 veces la renta, es lo mismo que esta regla?', a: 'Es la misma lógica vista al revés: pedir ingresos de 3 veces la renta equivale a que la renta sea el 33% de tu ingreso. Esta sala es un poco más exigente (30% incluyendo mantenimiento, y descontando tus deudas), porque el requisito del arrendador protege al arrendador — esta regla te protege a ti.' },
  ],
  sources: [
    { name: 'INEGI — Índice Nacional de Precios al Consumidor (INPC)', url: 'https://www.inegi.org.mx/' },
    { name: 'CONDUSEF — Presupuesto y salud financiera', url: 'https://www.condusef.gob.mx/' },
    { name: 'PROFECO — Derechos al rentar vivienda', url: 'https://www.gob.mx/profeco' },
  ],
};
