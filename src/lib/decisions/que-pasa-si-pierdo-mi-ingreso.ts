/**
 * Sala de decisión — "¿Qué pasa si pierdo mi ingreso mañana?"
 *
 * Patrón STRESS TEST. Simula el peor escenario: cero ingresos desde mañana.
 * Calcula tu fondo de supervivencia (activos líquidos + indemnización −
 * deudas), tu "burn rate" reducido al mínimo (gastos − gastos recortables) y
 * cuántos meses aguantás. El número decisivo: meses de supervivencia.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const gastos = Math.max(0, num(inputs.gastosMensuales));
  const reducibles = Math.max(0, Math.min(gastos, num(inputs.gastosReducibles)));
  const activos = Math.max(0, num(inputs.activosLiquidos));
  const indemnizacion = Math.max(0, num(inputs.indemnizacionEstimada));
  const deudas = Math.max(0, num(inputs.deudas));

  if (!gastos || (activos <= 0 && indemnizacion <= 0)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tus gastos mensuales y tus activos líquidos (y la indemnización estimada, si aplica) para simular cuántos meses aguantás sin ingresos.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Meses de supervivencia' },
      scenarios: [],
      nextActions: [
        'Cargá tus **gastos mensuales** y tus **activos líquidos** (plata a la que podés echar mano ya).',
        'Si te corresponde, sumá la **indemnización estimada** y restá tus **deudas**.',
      ],
    };
  }

  const fondo = activos + indemnizacion - deudas;
  const burnNormal = gastos;
  const burnReducido = Math.max(1, gastos - reducibles); // evitar /0

  const mesesNormal = fondo > 0 ? fondo / burnNormal : 0;
  const mesesReducido = fondo > 0 ? fondo / burnReducido : 0;
  const mesesPrincipal = mesesReducido; // el escenario realista de crisis

  const fmtMeses = (m: number) =>
    m <= 0 ? '0 meses' : `${m.toFixed(1).replace('.', ',').replace(',0', '')} meses`;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  if (mesesPrincipal >= 6) {
    status = 'b';
    tone = 'good';
    title = 'Estás bien preparado: aguantás el golpe';
    badge = 'Sólido';
  } else if (mesesPrincipal >= 3) {
    status = 'tie';
    tone = 'neutral';
    title = 'Aguantás un tiempo, pero el colchón es justo';
    badge = 'Ajustado';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Estás expuesto: poco aire si perdés el ingreso';
    badge = 'Riesgo alto';
  }

  const detail = `Si perdés tu ingreso mañana, tu fondo de ${fmtMoney(fondo)} (activos + indemnización − deudas) cubre ${fmtMeses(mesesNormal)} a tus gastos actuales. Recortando lo prescindible (${fmtMoney(reducibles)}/mes), estirás hasta ${fmtMeses(mesesReducido)}. La meta sana es 6 meses.`;

  const scenarios = [
    {
      label: 'Sin recortar',
      value: fmtMeses(mesesNormal),
      detail: `Manteniendo tus gastos actuales de ${fmtMoney(burnNormal)}/mes.`,
    },
    {
      label: 'Modo crisis',
      value: fmtMeses(mesesReducido),
      detail: reducibles > 0
        ? `Recortando ${fmtMoney(reducibles)}/mes de gastos prescindibles.`
        : 'Cargá tus gastos recortables para ver cuánto estirás el aire.',
    },
    {
      label: 'Meta saludable',
      value: '6 meses',
      detail: `Necesitarías un fondo de ${fmtMoney(burnReducido * 6)} para cubrir 6 meses en modo crisis.`,
    },
  ];

  const breakdown = [
    { label: 'Activos líquidos', value: fmtMoney(activos), hint: 'plata disponible ya' },
    { label: '+ Indemnización estimada', value: fmtMoney(indemnizacion) },
    { label: '− Deudas a cubrir', value: '-' + fmtMoney(deudas).replace('-', '') },
    { label: 'Fondo de supervivencia', value: fmtMoney(fondo) },
    { label: 'Gastos mensuales actuales', value: fmtMoney(burnNormal) },
    { label: 'Gastos recortables', value: '-' + fmtMoney(reducibles).replace('-', ''), hint: 'lo que podés suspender en una crisis' },
    { label: 'Gasto mínimo en modo crisis', value: fmtMoney(burnReducido) },
    { label: 'Meses que aguantás (modo crisis)', value: fmtMeses(mesesReducido) },
  ];

  const faltanteSeis = Math.max(0, burnReducido * 6 - fondo);
  const nextActions = [
    mesesPrincipal < 6
      ? `Te faltan **${fmtMoney(faltanteSeis)}** de fondo para llegar a los 6 meses de aire en modo crisis. Apuntá a sumarlo de a poco, es tu red de seguridad.`
      : `Tenés más de 6 meses de aire: excelente. Mantené ese colchón intacto y solo usalo en una emergencia real.`,
    'Identificá hoy tus **gastos recortables** (suscripciones, salidas, consumos no esenciales): saber qué cortar primero te da meses extra cuando más los necesitás.',
    'Tené el fondo en algo **líquido y de bajo riesgo** (caja de ahorro, money market, plazo fijo corto): en una emergencia necesitás la plata disponible, no inmovilizada.',
    'Si sos empleado en relación de dependencia, sumá a tu cálculo el **seguro de desempleo de ANSES** y la indemnización: son parte de tu red ante un despido.',
  ];

  const notes = [
    'El fondo de supervivencia = activos líquidos + indemnización − deudas. Los meses se calculan dividiendo ese fondo por el gasto mensual (normal o recortado al mínimo).',
    'Es un stress test orientativo: asume cero ingresos desde mañana. No contempla nuevos ingresos (changas, freelance) ni el seguro de desempleo, que extenderían tu aire.',
    'No es asesoramiento financiero. La meta de 6 meses es una regla práctica; ajustala según la estabilidad de tu trabajo y tus responsabilidades familiares.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMeses(mesesPrincipal),
      label: 'Meses que aguantás sin ingresos',
      sub: `Fondo de supervivencia **${fmtMoney(fondo)}** ÷ gasto mínimo **${fmtMoney(burnReducido)}/mes**. Meta sana: 6 meses.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'que-pasa-si-pierdo-mi-ingreso',
  title: '¿Qué pasa si pierdo mi ingreso mañana? Test de supervivencia 2026',
  h1: '¿Qué pasa si pierdo mi ingreso mañana?',
  description:
    'Simulá el peor escenario: cero ingresos desde mañana. Calculá tu fondo de supervivencia (ahorros + indemnización − deudas) y cuántos meses aguantás recortando lo prescindible. La meta sana es 6 meses.',
  intro:
    'Nadie quiere pensarlo, pero saberlo da tranquilidad: si mañana perdés tu ingreso, ¿cuántos meses aguantás? Esta sala hace el stress test. Suma tus activos líquidos y tu indemnización, resta tus deudas y divide por tus gastos (normales y recortados al mínimo) para decirte cuántos meses de aire tenés y cuánto te falta para llegar a los 6 que se consideran sanos.',
  icon: '🛟',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    gastosMensuales: 900000,
    gastosReducibles: 250000,
    activosLiquidos: 2500000,
    indemnizacionEstimada: 1500000,
    deudas: 400000,
  },
  fields: [
    {
      id: 'gastosMensuales',
      label: 'Gastos mensuales',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '900000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Todo lo que gastás por mes para vivir hoy.',
      group: 'Tus gastos',
      groupIcon: '💸',
    },
    {
      id: 'gastosReducibles',
      label: 'Gastos recortables',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '250000',
      help: 'De esos gastos, cuánto podrías suspender en una crisis (salidas, suscripciones, ocio).',
      group: 'Tus gastos',
    },
    {
      id: 'activosLiquidos',
      label: 'Activos líquidos',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '2500000',
      profileKey: 'finanzas.ahorros',
      help: 'Plata a la que podés echar mano ya: pesos, dólares, plazo fijo, caja de ahorro.',
      group: 'Tu red de seguridad',
      groupIcon: '🛟',
    },
    {
      id: 'indemnizacionEstimada',
      label: 'Indemnización estimada',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '1500000',
      help: 'Si sos empleado y te despidieran sin causa, lo que cobrarías de liquidación. Poné 0 si no aplica.',
      group: 'Tu red de seguridad',
    },
    {
      id: 'deudas',
      label: 'Deudas a cubrir',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '400000',
      profileKey: 'finanzas.deudas',
      help: 'Deudas que tendrías que pagar igual aunque pierdas el ingreso.',
      group: 'Tu red de seguridad',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-indemnizacion-despido', label: 'Indemnización por despido' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
  ],
  howItWorks: `Esta sala simula el peor escenario para que sepas qué tan expuesto estás.

1. **Fondo de supervivencia.** Suma tus activos líquidos y la indemnización que cobrarías, y resta las deudas que tendrías que pagar igual. Esa es la plata real con la que contás.
2. **Burn rate normal.** Tus gastos mensuales actuales: lo que te "quema" el fondo cada mes si no cambiás nada.
3. **Burn rate en modo crisis.** A tus gastos les resta lo prescindible (salidas, suscripciones, ocio). Es el mínimo al que podrías bajar para estirar el aire.
4. **Meses de supervivencia.** Divide el fondo por cada burn rate. El número clave es el de modo crisis: cuántos meses aguantás apretando el cinturón.
5. **Brecha hasta 6 meses.** Compara contra la meta sana de seis meses de gastos cubiertos y te dice cuánto fondo te falta para llegar.`,
  faq: [
    {
      q: '¿Cuántos meses de gastos debería tener cubiertos?',
      a: 'La regla práctica es un fondo de emergencia de 3 a 6 meses de gastos. Seis meses es lo recomendado si tu ingreso es inestable o tenés personas a cargo; con un empleo muy estable, tres puede alcanzar. Esta sala te dice cuántos cubrís hoy.',
    },
    {
      q: '¿Qué cuenta como activo líquido?',
      a: 'Plata a la que podés acceder rápido y sin perder valor: efectivo, caja de ahorro, dólares, plazo fijo, money market. No cuentan el auto, la propiedad ni inversiones difíciles de vender en una urgencia, porque no las podés convertir en gastos del mes que viene.',
    },
    {
      q: '¿Por qué resto las deudas del fondo?',
      a: 'Porque son plata que vas a tener que pagar igual aunque pierdas el ingreso. Si tenés $2.500.000 de ahorros pero $400.000 de deuda inminente, tu fondo real es $2.100.000. Ignorar las deudas infla tu colchón.',
    },
    {
      q: '¿Qué es el "modo crisis"?',
      a: 'El escenario donde recortás todo lo prescindible: salidas, suscripciones, ocio, gastos no esenciales. Tu gasto baja al mínimo de subsistencia y el fondo te dura más. La sala calcula tus meses tanto sin recortar como en modo crisis.',
    },
    {
      q: '¿Incluye el seguro de desempleo?',
      a: 'No directamente, para ser conservadora. Si sos empleado en relación de dependencia y te despiden sin causa, podés cobrar el seguro de desempleo de ANSES, que extiende tu aire. Sumalo aparte a tu planificación: es plata real disponible.',
    },
    {
      q: '¿La indemnización va antes o después de impuestos?',
      a: 'La indemnización por antigüedad suele estar exenta de Ganancias hasta un tope; otros rubros pueden tener descuentos. Cargá una estimación neta y conservadora. Para calcularla en detalle, usá nuestra calculadora de indemnización por despido.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es un stress test orientativo para que dimensiones tu exposición. Para armar un plan de emergencia y de inversión a medida, consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'ANSES — Prestación por desempleo', url: 'https://www.anses.gob.ar/' },
    { name: 'BCRA — Saber más (fondo de emergencia)', url: 'https://www.bcra.gob.ar/' },
  ],
};
