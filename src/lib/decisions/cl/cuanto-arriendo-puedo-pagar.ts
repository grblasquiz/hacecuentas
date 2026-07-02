/**
 * Sala de decisión CL — "¿Cuánto arriendo puedo pagar?"
 *
 * Regla del 30% del sueldo líquido (35% como techo) aplicada a la realidad
 * chilena: los GASTOS COMUNES van aparte del arriendo pero cuentan dentro de la
 * carga de vivienda, el contrato se reajusta por IPC (o está en UF), y entrar
 * cuesta caro: mes de garantía + comisión de corretaje + primer mes adelantado.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoLiquido));
  const deudas = Math.max(0, num(inputs.deudasMensuales));
  const gastosComunes = Math.max(0, num(inputs.gastosComunes));
  const servicios = Math.max(0, num(inputs.serviciosEstimados));
  const ahorroObjetivoPct = Math.max(0, Math.min(100, num(inputs.ahorroObjetivo)));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Carga tu sueldo líquido (lo que te llega al banco después de AFP, salud e impuesto). Con eso calculamos el arriendo máximo que puedes pagar sin ahogarte, descontando deudas, gastos comunes, cuentas y tu meta de ahorro.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Arriendo máximo saludable' },
      scenarios: [],
      nextActions: [
        'Carga tu **sueldo líquido mensual** (o la suma de los ingresos líquidos del hogar).',
        'Agrega tus **deudas mensuales, gastos comunes estimados y cuentas** para afinar el número.',
      ],
    };
  }

  const ingresoNetoDeudas = Math.max(0, ingreso - deudas);

  // Carga de vivienda = arriendo + gastos comunes. Regla: ≤30% del líquido, 35% techo.
  const techo30 = ingreso * 0.30;
  const techo35 = ingreso * 0.35;
  const margenAhorro = ingreso * (ahorroObjetivoPct / 100);
  const recomendadoCarga = Math.max(0, Math.min(techo30, ingresoNetoDeudas - margenAhorro - servicios));

  const arriendoMax30 = Math.max(0, techo30 - gastosComunes);
  const arriendoMax35 = Math.max(0, techo35 - gastosComunes);
  const arriendoRecomendado = Math.max(0, recomendadoCarga - gastosComunes);

  const cargaRecomendadaPct = ingreso > 0 ? ((arriendoRecomendado + gastosComunes) / ingreso) * 100 : 0;
  // Costo de entrada típico: primer mes + mes de garantía + comisión de
  // corretaje (50% de un arriendo + IVA ≈ 0,6 arriendos) ≈ 2,6 arriendos.
  const costoEntrada = arriendoRecomendado * 2.6;

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
    title = 'Puedes arrendar, pero justo';
    badge = 'Justo';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Con estos números el arriendo te aprieta';
    badge = 'Apretado';
  }
  const detail = `Con un sueldo líquido de ${fmtMoney(ingreso)}, tu arriendo máximo saludable es ${fmtMoney(arriendoRecomendado)} (más ${fmtMoney(gastosComunes)} de gastos comunes = ${cargaRecomendadaPct.toFixed(0)}% del líquido). Estirándote al 35% podrías llegar a ${fmtMoney(arriendoMax35)}, pero ahí queda muy poco aire para deudas, cuentas, ahorro y el reajuste por IPC que viene durante el contrato.`;

  const scenarios = [
    { label: 'Cómodo (30% con ahorro)', value: fmtMoney(arriendoRecomendado), detail: `Deja espacio a tu meta de ahorro (${ahorroObjetivoPct}%), a las deudas y a las cuentas. Es el número recomendado.` },
    { label: 'Estándar (30% del líquido)', value: fmtMoney(arriendoMax30), detail: 'La regla clásica: arriendo + gastos comunes ≤ 30% del sueldo líquido.' },
    { label: 'Techo (35% del líquido)', value: fmtMoney(arriendoMax35), detail: 'El máximo absoluto. Por encima, la vivienda se come el presupuesto.' },
  ];

  const breakdown = [
    { label: 'Sueldo líquido del hogar', value: fmtMoney(ingreso) },
    { label: '− Deudas mensuales', value: '-' + fmtMoney(deudas).replace('-', ''), hint: 'Cuotas de crédito, tarjeta, línea' },
    { label: '− Cuentas estimadas', value: '-' + fmtMoney(servicios).replace('-', ''), hint: 'Luz, agua, gas, internet' },
    { label: `− Ahorro objetivo (${ahorroObjetivoPct}%)`, value: '-' + fmtMoney(margenAhorro).replace('-', '') },
    { label: 'Disponible para vivienda', value: fmtMoney(Math.max(0, ingresoNetoDeudas - servicios - margenAhorro)) },
    { label: 'Gastos comunes estimados', value: fmtMoney(gastosComunes), hint: 'Van aparte del arriendo, pero cuentan en el 30%' },
    { label: 'Arriendo máximo saludable', value: fmtMoney(arriendoRecomendado), hint: `${cargaRecomendadaPct.toFixed(0)}% del líquido con gastos comunes` },
    { label: 'Costo de entrada estimado', value: fmtMoney(costoEntrada), hint: 'Primer mes + garantía + comisión corredora' },
  ];

  const nextActions = [
    `Busca arriendos de hasta **${fmtMoney(arriendoRecomendado)}** (más gastos comunes): así aguantas los reajustes por IPC sin desarmar el presupuesto.`,
    `No pases de **${fmtMoney(arriendoMax35)}** bajo ningún escenario: sobre el 35% del líquido, cualquier imprevisto te deja corto.`,
    `Junta la entrada antes de buscar: entre el primer mes, el **mes de garantía** y la **comisión de la corredora** (medio arriendo + IVA, si corresponde), necesitas cerca de ${fmtMoney(costoEntrada)} disponibles al firmar.`,
    deudas > ingreso * 0.2
      ? `Tus deudas se llevan el ${((deudas / ingreso) * 100).toFixed(0)}% del líquido: bajarlas libera cupo directo para un mejor arriendo o más ahorro.`
      : 'Pregunta siempre cuánto son los gastos comunes ANTES de visitar: en edificios nuevos con amenities pueden ser el 15-20% extra sobre el arriendo.',
    'Revisa la cláusula de reajuste del contrato: si es por IPC trimestral o está en UF, tu arriendo sube varias veces al año, no una.',
  ];

  const notes = [
    'La regla de referencia: arriendo más gastos comunes no deberían superar el 30% del sueldo líquido (35% como techo). Es una guía de salud financiera, no una norma legal.',
    'El cálculo descuenta deudas, cuentas y tu meta de ahorro para darte un número sostenible, no solo el máximo teórico que un corredor te aprobaría.',
    `No incluye los reajustes futuros: los contratos chilenos suelen reajustarse por IPC (trimestral, semestral o anual según lo pactado) o estar directamente en UF. Con IPC al ${fmtPct(3.5, 1).replace('+', '')} anual, en dos años tu arriendo sube en torno al 7%.`,
    'No es asesoría financiera. Adapta el resultado a tu situación y lee el contrato completo antes de firmar.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(arriendoRecomendado),
      label: 'Arriendo máximo saludable',
      sub: `Más ${fmtMoney(gastosComunes)} de gastos comunes = ${cargaRecomendadaPct.toFixed(0)}% de tu líquido. Techo absoluto: ${fmtMoney(arriendoMax35)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-arriendo-puedo-pagar',
  title: '¿Cuánto arriendo puedo pagar en Chile? Tu tope sano 2026',
  h1: '¿Cuánto arriendo puedo pagar?',
  description:
    'Calcula el arriendo máximo que puedes pagar con tu sueldo líquido usando la regla del 30-35%, contando los gastos comunes aparte, el reajuste por IPC y la entrada (garantía + comisión corredora). Con el reparto completo de tu ingreso.',
  intro:
    'Antes de recorrer departamentos conviene saber tu tope real. La regla sana en Chile: arriendo más gastos comunes no deberían superar el 30% de tu sueldo líquido (35% como techo absoluto). Esta sala calcula tu arriendo máximo descontando deudas, cuentas y lo que quieres ahorrar, estima cuánta plata necesitas para entrar — garantía, comisión de corretaje y primer mes — y te recuerda que el contrato se reajusta por IPC, así que el número de hoy no es el de dentro de un año.',
  icon: '🔑',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    ingresoLiquido: 1100000,
    deudasMensuales: 100000,
    gastosComunes: 80000,
    serviciosEstimados: 90000,
    ahorroObjetivo: 10,
  },
  fields: [
    { id: 'ingresoLiquido', label: 'Sueldo líquido del hogar', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '1100000', help: 'Lo que llega al banco cada mes, después de AFP, salud e impuesto. Si arriendan entre dos, suma ambos líquidos.', group: 'Tus ingresos', groupIcon: '💵' },
    { id: 'deudasMensuales', label: 'Deudas mensuales', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '100000', help: 'Cuotas de créditos de consumo, tarjeta, línea de crédito o CAE que pagas todos los meses.', group: 'Tus gastos', groupIcon: '🧾' },
    { id: 'gastosComunes', label: 'Gastos comunes estimados', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '80000', help: 'Van aparte del arriendo pero cuentan dentro del 30%. En edificios nuevos con amenities pueden superar los $100.000.', group: 'Tus gastos' },
    { id: 'serviciosEstimados', label: 'Cuentas estimadas', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '90000', help: 'Luz, agua, gas e internet al mes.', group: 'Tus gastos' },
    { id: 'ahorroObjetivo', label: 'Meta de ahorro', type: 'number', suffix: '%', recommended: true, default: 10, min: 0, max: 100, placeholder: '10', help: 'Qué porcentaje del líquido quieres guardar cada mes (la regla 50/30/20 sugiere 20%).', group: 'Tu meta', groupIcon: '🎯' },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-arriendo-santiago-vina-concepcion-precio-promedio', label: 'Precios de arriendo por ciudad' },
    { slug: 'cl/calculadora-reajuste-arriendo-ipc-chile', label: 'Reajuste de arriendo por IPC' },
    { slug: 'cl/calculadora-sueldo-liquido-chile-2026-impuesto-segunda-categoria', label: 'Sueldo líquido' },
    { slug: 'cl/calculadora-arriendo-vs-comprar-chile-10-anos-uf', label: 'Arrendar vs comprar' },
  ],
  howItWorks: `Esta sala traduce tu sueldo líquido en un arriendo que puedes sostener todo el contrato, no solo el primer mes.

1. **Punto de partida.** Toma el sueldo líquido del hogar y le resta las deudas mensuales que pagas sí o sí.
2. **Regla del 30-35%.** Calcula el techo clásico: arriendo más gastos comunes no deberían superar el 30% del líquido (35% como máximo absoluto).
3. **Gastos comunes aparte.** En Chile los gastos comunes se pagan además del arriendo, así que la sala los resta del techo para darte el arriendo puro que puedes ofrecer.
4. **Cuentas y ahorro.** Reserva espacio para luz, agua, gas, internet y tu meta de ahorro, para que la vivienda no se coma todo el presupuesto.
5. **La entrada y el reajuste.** Estima la plata que necesitas al firmar (primer mes + garantía + comisión de corretaje ≈ 2,6 arriendos) y te recuerda que el contrato se reajusta por IPC o UF: deja margen para eso.`,
  faq: [
    { q: '¿Qué porcentaje del sueldo se puede destinar al arriendo en Chile?', a: 'La regla sana es que arriendo más gastos comunes no superen el 30% del sueldo líquido, con un techo absoluto del 35%. Sobre eso, cualquier reajuste por IPC, cuenta alta o imprevisto te deja sin margen. Los propios arrendadores y corredoras suelen exigir una renta líquida de al menos 3 veces el arriendo, que es la misma regla mirada al revés.' },
    { q: '¿Los gastos comunes cuentan dentro del 30%?', a: 'Sí. Se pagan aparte del arriendo, pero son parte del costo de vivir ahí y no son opcionales. Por eso la sala te pide estimarlos y los descuenta del techo: un arriendo de $450.000 con $110.000 de gastos comunes cuesta lo mismo que uno de $560.000 sin ellos.' },
    { q: '¿Cuánta plata necesito para entrar a un arriendo?', a: 'Típicamente el primer mes adelantado, un mes de garantía y la comisión de la corredora (en general el 50% de un arriendo más IVA, cuando la paga el arrendatario). En total, cerca de 2,5 a 2,6 arriendos juntos al momento de firmar. Para un arriendo de $500.000, unos $1.300.000.' },
    { q: '¿Cómo se reajusta el arriendo durante el contrato?', a: 'Según lo que diga el contrato: lo más común es reajuste por la variación del IPC cada 3, 6 o 12 meses, o directamente un arriendo pactado en UF que se mueve a diario. Con IPC en torno al 3,5-4% anual, un arriendo de $500.000 sube unos $18.000-$20.000 al año. Léelo antes de firmar: no todos los reajustes son iguales.' },
    { q: '¿Qué pasa con la garantía al final del contrato?', a: 'El mes de garantía respalda deudas de cuentas, gastos comunes y daños más allá del desgaste normal. El arrendador debe devolverla al restituir la propiedad, descontando lo que corresponda con respaldo. No es legal usarla como "último mes de arriendo" salvo acuerdo entre las partes.' },
    { q: '¿Y si mi ingreso es variable o boleteo a honorarios?', a: 'Usa un promedio conservador de tus últimos 6-12 meses líquidos (después de la retención de honorarios y cotizaciones). Además, prepárate para que te pidan más respaldo: a los independientes suelen exigirles aval, más meses de garantía o demostrar ingresos con las boletas del SII.' },
    { q: '¿Debería arrendar por el máximo que me da la sala?', a: 'No: el techo es un límite, no una meta. Cuanto más abajo del 30% quedes, más aire tienes para ahorrar el pie de una futura compra, absorber reajustes y cubrir imprevistos. El número cómodo — el que deja espacio a tu meta de ahorro — es el que conviene usar.' },
    { q: '¿Conviene arrendar con o sin corredora?', a: 'La corredora formaliza el contrato y filtra a las partes, pero cuesta medio arriendo más IVA a cada lado (según lo pactado). Arrendar directo ahorra esa comisión, pero exige más cuidado: contrato por escrito siempre, inventario firmado y verificación de dominio de la propiedad.' },
  ],
  sources: [
    { name: 'INE — Índice de Precios al Consumidor (IPC)', url: 'https://www.ine.gob.cl/' },
    { name: 'SERNAC — Derechos en el arriendo de viviendas', url: 'https://www.sernac.cl/' },
    { name: 'Banco Central de Chile — UF y estadísticas de precios', url: 'https://www.bcentral.cl/' },
  ],
};
