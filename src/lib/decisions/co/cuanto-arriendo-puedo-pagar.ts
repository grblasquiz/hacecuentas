/**
 * Sala de decisión CO — "¿Cuánto arriendo puedo pagar?"
 *
 * Patrón VIVIENDA / BREAKDOWN. Regla sana: arriendo MÁS cuota de administración
 * no deberían superar el 30% del ingreso neto (35% como techo). Descuenta deudas,
 * servicios públicos (que en Colombia varían fuerte por estrato) y el ahorro
 * objetivo, y proyecta el incremento anual legal del arriendo: por la Ley 820 de
 * 2003, el canon de vivienda urbana solo puede subir hasta el IPC del año
 * anterior (~5%).
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const deudas = Math.max(0, num(inputs.deudasMensuales));
  const administracion = Math.max(0, num(inputs.administracion));
  const servicios = Math.max(0, num(inputs.serviciosPublicos));
  const ahorroObjetivoPct = Math.max(0, Math.min(100, num(inputs.ahorroObjetivo)));
  const ipcAnual = Math.max(0, num(inputs.ipcAnual));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga tu ingreso neto mensual (el de tu hogar si arriendan juntos). Con eso calculamos el arriendo máximo que puedes pagar sin ahogarte, descontando deudas, administración, servicios y tu meta de ahorro.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Arriendo máximo saludable' },
      scenarios: [],
      nextActions: [
        'Carga tu **ingreso neto mensual** (lo que te queda después de salud, pensión y retención).',
        'Suma tus **deudas mensuales**, la **cuota de administración** y los **servicios públicos** estimados para afinar el resultado.',
      ],
    };
  }

  // Carga de vivienda = arriendo + administración. Techos sobre el ingreso.
  const techo30 = ingreso * 0.30;
  const techo35 = ingreso * 0.35;
  const margenAhorro = ingreso * (ahorroObjetivoPct / 100);
  const disponibleVivienda = Math.max(0, ingreso - deudas - servicios - margenAhorro);
  const recomendadoCarga = Math.max(0, Math.min(techo30, disponibleVivienda));

  const arriendoMax30 = Math.max(0, techo30 - administracion);
  const arriendoMax35 = Math.max(0, techo35 - administracion);
  const arriendoRecomendado = Math.max(0, recomendadoCarga - administracion);

  const cargaPct = ingreso > 0 ? ((arriendoRecomendado + administracion) / ingreso) * 100 : 0;
  // Proyección Ley 820: el canon puede subir hasta el IPC del año anterior.
  const arriendoAnio2 = arriendoRecomendado * (1 + ipcAnual / 100);

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;

  if (arriendoRecomendado >= arriendoMax30 * 0.9 && deudas <= ingreso * 0.2) {
    status = 'b';
    tone = 'good';
    title = 'Tienes margen sano para arrendar';
    badge = 'Margen sano';
  } else if (arriendoRecomendado > 0) {
    status = 'tie';
    tone = 'neutral';
    title = 'Puedes arrendar, pero vas ajustado';
    badge = 'Ajustado';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Con estos números el arriendo te aprieta';
    badge = 'Apretado';
  }

  const detail = `Con un ingreso de ${fmtMoney(ingreso)}, tu arriendo máximo saludable es ${fmtMoney(arriendoRecomendado)} (más ${fmtMoney(administracion)} de administración = ${cargaPct.toFixed(0)}% del ingreso). El techo absoluto, estirándote al 35%, es ${fmtMoney(arriendoMax35)} de canon — pero ahí queda poco aire para deudas, servicios y ahorro. Recuerda que al año el canon puede subir hasta el IPC (${fmtPct(ipcAnual, 1)}).`;

  const scenarios = [
    {
      label: 'Cómodo (30% con ahorro)',
      value: fmtMoney(arriendoRecomendado),
      detail: `Deja espacio a tu meta de ahorro (${ahorroObjetivoPct}%), deudas y servicios. Es el número recomendado.`,
    },
    {
      label: 'Estándar (30% del ingreso)',
      value: fmtMoney(arriendoMax30),
      detail: 'La regla clásica: arriendo más administración ≤ 30% del ingreso neto.',
    },
    {
      label: 'Techo (35% del ingreso)',
      value: fmtMoney(arriendoMax35),
      detail: 'El máximo que no conviene superar. Por encima, la vivienda te asfixia.',
    },
  ];

  const breakdown = [
    { label: 'Ingreso neto del hogar', value: fmtMoney(ingreso) },
    { label: '− Deudas mensuales', value: '-' + fmtMoney(deudas).replace('-', ''), hint: 'Tarjetas, libranza, otros créditos' },
    { label: '− Servicios públicos', value: '-' + fmtMoney(servicios).replace('-', ''), hint: 'Luz, agua, gas, internet — varían por estrato' },
    { label: `− Ahorro objetivo (${ahorroObjetivoPct}%)`, value: '-' + fmtMoney(margenAhorro).replace('-', '') },
    { label: 'Disponible para vivienda', value: fmtMoney(disponibleVivienda) },
    { label: 'Cuota de administración', value: fmtMoney(administracion), hint: 'Cuenta dentro del 30%' },
    { label: 'Arriendo máximo saludable', value: fmtMoney(arriendoRecomendado), hint: `${cargaPct.toFixed(0)}% del ingreso con administración` },
    { label: `Canon en el año 2 (IPC ${ipcAnual.toFixed(1).replace('.', ',')}%)`, value: fmtMoney(arriendoAnio2), hint: 'Incremento máximo legal (Ley 820)' },
  ];

  const nextActions = [
    `Busca arriendos de hasta **${fmtMoney(arriendoRecomendado)}** (más administración): así te queda aire para imprevistos y para ahorrar.`,
    `No firmes por encima de **${fmtMoney(arriendoMax35)}** de canon: sobre el 35% del ingreso, la vivienda te deja sin margen para todo lo demás.`,
    deudas > ingreso * 0.2
      ? `Tus deudas se llevan el ${((deudas / ingreso) * 100).toFixed(0)}% de tu ingreso: bajarlas primero te libera plata para un mejor arriendo o más ahorro.`
      : 'Antes de firmar, pregunta por los requisitos: en Colombia suelen pedir codeudor con finca raíz o una póliza/afianzadora que cuesta entre 30% y 50% de un canon al año.',
    `Presupuesta el incremento anual: por la Ley 820 el canon solo puede subir hasta el IPC del año anterior (~${ipcAnual.toFixed(0)}%), y solo cada 12 meses. Si te piden más, es ilegal y puedes negarte.`,
    'Confirma el estrato del inmueble antes de decidir: entre estrato 2 y estrato 5 la factura de servicios puede duplicarse por la estructura de subsidios y contribuciones.',
  ];

  const notes = [
    'La regla de referencia es que arriendo más cuota de administración no superen el 30% del ingreso neto (35% como techo). Es una guía de salud financiera, no una norma legal.',
    'El cálculo descuenta deudas, servicios públicos y tu meta de ahorro para darte un número sostenible, no solo el máximo teórico.',
    'El incremento proyectado usa la regla de la Ley 820 de 2003 para vivienda urbana: máximo el IPC del año calendario anterior certificado por el DANE.',
    'No incluye costos de entrada (póliza o afianzadora, depósitos, trasteo) ni es asesoría financiera: ajusta el resultado a tu situación.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(arriendoRecomendado),
      label: 'Arriendo máximo saludable',
      sub: `Más ${fmtMoney(administracion)} de administración = ${cargaPct.toFixed(0)}% de tu ingreso. Techo absoluto: ${fmtMoney(arriendoMax35)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-arriendo-puedo-pagar',
  title: '¿Cuánto arriendo puedo pagar en Colombia? Tu tope sano 2026',
  h1: '¿Cuánto arriendo puedo pagar?',
  description:
    'Calcula el arriendo máximo que puedes pagar sin ahogarte: regla del 30-35% del ingreso neto, cuota de administración aparte, servicios según estrato y el incremento anual legal del canon (Ley 820, tope IPC).',
  intro:
    'Antes de salir a buscar apartamento conviene saber hasta dónde te alcanza. La regla sana es que el arriendo más la cuota de administración no superen el 30% de tu ingreso neto (35% como techo). Esta sala calcula tu canon máximo saludable descontando deudas, servicios públicos — que en Colombia cambian mucho según el estrato — y tu meta de ahorro, y te proyecta el incremento anual que permite la Ley 820 (máximo el IPC del año anterior).',
  icon: '🔑',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    ingresoNeto: 4500000,
    deudasMensuales: 400000,
    administracion: 250000,
    serviciosPublicos: 350000,
    ahorroObjetivo: 10,
    ipcAnual: 5,
  },
  fields: [
    { id: 'ingresoNeto', label: 'Ingreso neto mensual del hogar', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '4500000', help: 'Lo que entra al mes después de salud, pensión y retención. Suma los ingresos de quienes arriendan juntos.', group: 'Tus ingresos', groupIcon: '💵' },
    { id: 'deudasMensuales', label: 'Deudas mensuales', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '400000', help: 'Cuotas de tarjeta, libranza, crédito de libre inversión u otras deudas fijas del mes.', group: 'Tus gastos', groupIcon: '🧾' },
    { id: 'administracion', label: 'Cuota de administración estimada', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '250000', help: 'La administración del conjunto o edificio donde buscarías. Cuenta dentro del 30%.', group: 'Tus gastos' },
    { id: 'serviciosPublicos', label: 'Servicios públicos estimados', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '350000', help: 'Luz, agua, gas e internet al mes. Varían fuerte según el estrato del inmueble.', group: 'Tus gastos' },
    { id: 'ahorroObjetivo', label: 'Meta de ahorro', type: 'number', suffix: '%', recommended: true, default: 10, min: 0, max: 100, placeholder: '10', help: 'Qué porcentaje de tu ingreso quieres guardar cada mes (la regla 50-30-20 sugiere 20%).', group: 'Tu meta', groupIcon: '🎯' },
    { id: 'ipcAnual', label: 'IPC del año anterior', type: 'number', suffix: '%', default: 5, min: 0, max: 20, placeholder: '5', advanced: true, help: 'Tope legal del incremento anual del canon de vivienda (Ley 820). Referencia 2026: ~5%.', group: 'Tu meta' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-canon-arrendamiento-vivienda-aumento-anual-colombia-ipc', label: 'Aumento anual del arriendo' },
    { slug: 'co/calculadora-arriendo-bogota-medellin-cali-precio-promedio', label: 'Arriendo promedio por ciudad' },
    { slug: 'co/calculadora-salario-neto-colombia-2026-bruto-a-neto', label: 'Salario neto' },
    { slug: 'co/calculadora-coste-arriendo-vs-comprar-colombia-10-anos', label: 'Arriendo vs compra' },
  ],
  howItWorks: `Esta sala convierte tu ingreso en un canon de arriendo que puedes sostener sin apretarte.

1. **Punto de partida.** Toma tu ingreso neto mensual (el del hogar, si arriendan entre varios) y le resta las deudas que pagas sí o sí cada mes.
2. **Regla del 30-35%.** Calcula el techo clásico: arriendo más cuota de administración no deberían superar el 30% del ingreso, con 35% como máximo absoluto.
3. **Servicios y ahorro.** Reserva espacio para los servicios públicos — que dependen del estrato — y para tu meta de ahorro, de modo que el arriendo no se coma todo el sueldo.
4. **Canon máximo saludable.** Resta la cuota de administración del techo recomendado: ese es el arriendo puro que puedes pagar con comodidad.
5. **Proyección legal.** Aplica la regla de la Ley 820: el canon solo puede subir una vez al año y máximo el IPC del año anterior, para que veas cuánto pagarías al renovar.`,
  faq: [
    { q: '¿Qué porcentaje del sueldo se recomienda gastar en arriendo?', a: 'La regla sana es que el arriendo más la cuota de administración no superen el 30% de tu ingreso neto, con un techo absoluto del 35%. Por encima de eso te quedas sin margen para deudas, ahorro e imprevistos, y cualquier alza de servicios o del canon te descuadra el mes.' },
    { q: '¿La cuota de administración cuenta dentro del 30%?', a: 'Sí. Lo que importa es el costo total de vivir ahí, y en conjuntos y edificios colombianos la administración puede ser 10-20% del canon. Por eso esta sala te da el arriendo puro ya descontando la administración estimada del techo del 30%.' },
    { q: '¿Cuánto puede subir mi arriendo cada año?', a: 'Para vivienda urbana, la Ley 820 de 2003 fija el tope: máximo el IPC del año calendario anterior certificado por el DANE (alrededor de 5% en 2026), y solo cada 12 meses de contrato. Si el arrendador pide más, ese incremento es ilegal y no estás obligado a aceptarlo.' },
    { q: '¿Por qué importa el estrato del inmueble?', a: 'Porque define cuánto pagas de servicios públicos: los estratos 1 a 3 reciben subsidio y los estratos 5 y 6 pagan contribución adicional. Entre un apartamento de estrato 2 y uno de estrato 5, la factura mensual puede duplicarse, y eso cambia cuánto canon te queda disponible.' },
    { q: '¿Qué piden para arrendar en Colombia además del canon?', a: 'Lo usual es codeudor con finca raíz o, cada vez más, un estudio con póliza o afianzadora que cuesta entre el 30% y el 50% de un canon al año, más el primer mes por adelantado. Presupuesta esa entrada antes de firmar: es bastante más que un mes de arriendo.' },
    { q: '¿Debería arrendar por el máximo que me da la sala?', a: 'No. El techo es un límite, no una meta. Cuanto más abajo del 30% quedes, más aire tienes para ahorrar, cubrir imprevistos y absorber el incremento anual del canon. Apunta al escenario "cómodo", que ya descuenta tu meta de ahorro.' },
    { q: '¿Y si mis ingresos son variables (independiente)?', a: 'Usa un promedio conservador de tus últimos 6-12 meses, descontando lo que pagas de PILA como independiente. Es mejor calcular el arriendo sobre un ingreso prudente que firmar un contrato de un año que no puedes sostener en los meses flojos.' },
    { q: '¿El cálculo incluye el incremento anual del canon?', a: 'Te lo proyecta: el desglose muestra cuánto quedaría tu arriendo en el año 2 si sube el máximo legal (el IPC). Conviene elegir un canon con margen para ese ajuste, porque tu salario no siempre sube al mismo ritmo que el IPC.' },
  ],
  sources: [
    { name: 'Ley 820 de 2003 — Régimen de arrendamiento de vivienda urbana', url: 'https://www.minvivienda.gov.co/' },
    { name: 'DANE — Índice de Precios al Consumidor (IPC)', url: 'https://www.dane.gov.co/' },
    { name: 'Banco de la República — Estadísticas de inflación', url: 'https://www.banrep.gov.co/' },
  ],
};
