/**
 * Sala de decisión — "¿Me conviene aceptar este cliente o proyecto?"
 *
 * Patrón BREAKDOWN. Toma el monto del proyecto y le descuenta impuestos, el
 * costo de oportunidad de las horas (incluyendo revisiones) y el riesgo de
 * demora en el cobro, para devolver el margen REAL y el valor por hora del
 * proyecto. Si el valor hora real cae por debajo de tu costo de oportunidad,
 * el proyecto te hace perder plata. Math inline determinístico.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const monto = Math.max(0, num(inputs.montoProyecto));
  const horas = Math.max(0, num(inputs.horasEstimadas));
  const revisiones = Math.max(0, num(inputs.revisionesEstimadas));
  const impuestosPct = Math.min(95, Math.max(0, num(inputs.impuestos)));
  const probDemoraPct = Math.min(100, Math.max(0, num(inputs.probabilidadDemora)));
  const costoOportHora = Math.max(0, num(inputs.costoOportunidadHora));

  if (!monto || !horas) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el monto del proyecto y las horas estimadas para calcular el margen real y el valor por hora una vez descontados impuestos, revisiones y el riesgo de cobro.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Margen real del proyecto' },
      scenarios: [],
      nextActions: [
        'Cargá el **monto del proyecto** y las **horas estimadas** para hacerlo.',
        'Sumá tu **costo de oportunidad por hora** (lo que ganarías con otro trabajo) para ver el margen real.',
      ],
    };
  }

  const horasTotales = horas + revisiones;
  const montoNeto = monto * (1 - impuestosPct / 100);
  const costoHoras = horasTotales * costoOportHora;

  // Margen antes de riesgo: neto menos el costo de oportunidad del tiempo.
  const margenBruto = montoNeto - costoHoras;

  // Ajuste por riesgo de demora: la probabilidad de demora castiga el margen
  // (representa el costo financiero/incertidumbre de cobrar tarde). Aplicamos
  // un castigo proporcional: hasta 25% del neto si la probabilidad es 100%.
  const castigoRiesgo = montoNeto * (probDemoraPct / 100) * 0.25;
  const margenReal = margenBruto - castigoRiesgo;

  const valorHoraReal = horasTotales > 0 ? margenReal / horasTotales : 0;
  const valorHoraBruto = horasTotales > 0 ? monto / horasTotales : 0;
  // Relación contra tu costo de oportunidad: >1 conviene, <1 perdés tiempo.
  const ratio = costoOportHora > 0 ? valorHoraReal / costoOportHora : Infinity;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (margenReal < 0) {
    status = 'a';
    tone = 'bad';
    title = 'Rechazalo: este proyecto te hace perder';
    badge = 'No conviene';
    detail = `Tras impuestos, las ${horasTotales.toFixed(0)} horas (con revisiones) y el riesgo de cobro, el margen real es ${fmtMoney(margenReal)}: negativo. Tu tiempo vale más en otra cosa. Si lo tomás, que sea por estrategia, no por la plata.`;
  } else if (costoOportHora > 0 && ratio < 1.1) {
    status = 'tie';
    tone = 'warn';
    title = 'Está al límite: te paga apenas tu tiempo';
    badge = 'Ajustado';
    detail = `El valor hora real del proyecto es ${fmtMoney(valorHoraReal)}, apenas por encima de tu costo de oportunidad (${fmtMoney(costoOportHora)}). Te deja ${fmtMoney(margenReal)} de margen real: aceptalo solo si suma por otro lado (cliente estratégico, portfolio).`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Aceptalo: el proyecto conviene';
    badge = 'Conviene';
    detail = `El margen real es ${fmtMoney(margenReal)} y el valor hora real ${fmtMoney(valorHoraReal)}${costoOportHora > 0 ? ` (${ratio.toFixed(1).replace('.', ',')}× tu costo de oportunidad)` : ''}. Después de impuestos, revisiones y riesgo de cobro, sigue siendo buen negocio.`;
  }

  const scenarios = [
    {
      label: 'Sin imprevistos',
      value: fmtMoney(margenBruto),
      detail: 'Margen si cobrás a tiempo y no hay revisiones extra.',
    },
    {
      label: 'Probable',
      value: fmtMoney(margenReal),
      detail: 'Margen real con el riesgo de demora que cargaste.',
    },
    {
      label: 'Pesimista',
      value: fmtMoney(margenReal - costoOportHora * revisiones),
      detail: 'Si encima se duplican las revisiones previstas.',
    },
  ];

  const breakdown = [
    { label: 'Monto del proyecto', value: fmtMoney(monto) },
    { label: `− Impuestos (${impuestosPct}%)`, value: '-' + fmtMoney(monto * impuestosPct / 100).replace('-', '') },
    { label: 'Monto neto', value: fmtMoney(montoNeto) },
    { label: 'Horas estimadas (+ revisiones)', value: `${horasTotales.toFixed(0)} h`, hint: `${horas.toFixed(0)} + ${revisiones.toFixed(0)} revisiones` },
    { label: '− Costo de oportunidad del tiempo', value: '-' + fmtMoney(costoHoras).replace('-', ''), hint: `${horasTotales.toFixed(0)} h × ${fmtMoney(costoOportHora)}` },
    { label: '− Castigo por riesgo de demora', value: '-' + fmtMoney(castigoRiesgo).replace('-', ''), hint: `${probDemoraPct}% de probabilidad` },
    { label: 'Margen real', value: fmtMoney(margenReal) },
    { label: 'Valor por hora real', value: fmtMoney(valorHoraReal) + '/h', hint: `vs ${fmtMoney(valorHoraBruto)}/h bruto` },
  ];

  const nextActions = [
    margenReal < 0
      ? `El margen real es negativo (${fmtMoney(margenReal)}): renegociá el monto hacia arriba o pasá. Para que valga la pena, el proyecto debería pagar más de ${fmtMoney(costoHoras + castigoRiesgo)} netos.`
      : `Te deja ${fmtMoney(margenReal)} de margen real (${fmtMoney(valorHoraReal)}/hora): aceptalo, pero cerrá bien el alcance para que no se coma las horas.`,
    revisiones > 0
      ? `Calculaste ${revisiones.toFixed(0)} horas de revisiones: dejalo **por escrito en el contrato** (rondas incluidas y costo de las extra). Las revisiones infinitas son lo que más destruye el margen.`
      : 'Definí cuántas rondas de revisión incluye el precio: sin un límite escrito, las revisiones extra te comen el margen sin que lo notes.',
    probDemoraPct > 0
      ? `Hay ${probDemoraPct}% de riesgo de demora en el cobro: pedí **anticipo (30–50%)** y facturá por hitos para reducir ese castigo al margen.`
      : 'Pedí anticipo igual: aunque el cliente parezca seguro, el adelanto te protege el flujo de caja y filtra a los que no van en serio.',
    'Compará el **valor hora real** de este proyecto con el de tus otros clientes: si está por debajo, tu tiempo rinde más en otro lado. El costo de oportunidad es real aunque no lo veas.',
  ];

  const notes = [
    'El margen real = monto neto de impuestos − (horas + revisiones) × costo de oportunidad por hora − castigo por riesgo de demora. El valor hora real divide ese margen por las horas totales.',
    'El castigo por riesgo de demora se modela como hasta 25% del neto a probabilidad 100% (aproxima el costo financiero y la incertidumbre de cobrar tarde). Ajustá la probabilidad a tu experiencia con el cliente.',
    'El costo de oportunidad por hora es lo que ganarías usando ese tiempo en tu mejor alternativa. Si lo dejás en 0, el análisis solo mira el margen contable, no el costo de tu tiempo.',
    'No es asesoramiento financiero. Es una guía para decidir con números; el valor estratégico de un cliente (referidos, portfolio, aprendizaje) puede justificar tomar un proyecto de margen ajustado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(margenReal),
      label: 'Margen real del proyecto',
      sub: `Valor por hora real: **${fmtMoney(valorHoraReal)}/h**${costoOportHora > 0 ? ` (vs tu costo de oportunidad de ${fmtMoney(costoOportHora)}/h)` : ''}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'me-conviene-aceptar-este-cliente',
  title: '¿Me conviene aceptar este cliente o proyecto? Calculadora 2026',
  h1: '¿Me conviene aceptar este cliente o proyecto?',
  description:
    'Calculá el margen real y el valor por hora de un proyecto descontando impuestos, revisiones, costo de oportunidad de tu tiempo y riesgo de demora en el cobro. Decidí con números si te conviene aceptarlo.',
  intro:
    'Un proyecto que paga bien puede dejarte poco si te lleva horas eternas, revisiones infinitas o un cobro que se demora. Esta sala toma el monto y le descuenta impuestos, el costo de oportunidad de tu tiempo (incluidas las revisiones) y el riesgo de demora, para mostrarte el margen real y el valor por hora verdadero. Así decidís con números si te conviene aceptar este cliente o tu tiempo rinde más en otro lado.',
  icon: '🤝',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    montoProyecto: 1_200_000,
    horasEstimadas: 60,
    revisionesEstimadas: 12,
    impuestos: 30,
    probabilidadDemora: 40,
    costoOportunidadHora: 9_000,
  },
  fields: [
    {
      id: 'montoProyecto',
      label: 'Monto del proyecto',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1200000',
      help: 'Lo que te pagaría el cliente por el proyecto completo.',
      group: 'El proyecto',
      groupIcon: '🤝',
    },
    {
      id: 'horasEstimadas',
      label: 'Horas estimadas',
      type: 'number',
      suffix: 'h',
      required: true,
      min: 0,
      placeholder: '60',
      help: 'Cuántas horas de trabajo te lleva el proyecto (sin contar revisiones).',
      group: 'El proyecto',
    },
    {
      id: 'revisionesEstimadas',
      label: 'Horas de revisiones',
      type: 'number',
      suffix: 'h',
      default: 0,
      min: 0,
      placeholder: '12',
      help: 'Horas extra que estimás en idas y vueltas, correcciones y reuniones.',
      group: 'El proyecto',
    },
    {
      id: 'costoOportunidadHora',
      label: 'Tu costo de oportunidad por hora',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '9000',
      help: 'Lo que ganarías por hora en tu mejor alternativa (otro cliente, tu tarifa habitual).',
      group: 'Tu tiempo',
      groupIcon: '⏱️',
    },
    {
      id: 'impuestos',
      label: 'Impuestos sobre el cobro',
      type: 'number',
      suffix: '%',
      default: 30,
      min: 0,
      max: 95,
      help: 'Porcentaje aproximado que se va en impuestos sobre lo que facturás.',
      group: 'Tu tiempo',
    },
    {
      id: 'probabilidadDemora',
      label: 'Riesgo de demora en el cobro',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      max: 100,
      help: 'Probabilidad de que el cliente pague tarde. Castiga el margen por el costo de cobrar a destiempo.',
      group: 'Tu tiempo',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-costo-hora-empleado-real', label: 'Costo real de la hora' },
    { slug: 'calculadora-punto-equilibrio-break-even', label: 'Break-even freelance' },
    { slug: 'calculadora-cuanto-cobrar-traduccion-palabra-2026-espanol-ingles', label: 'Cuánto cobrar' },
    { slug: 'calculadora-monotributo-2026', label: 'Cuota de monotributo' },
  ],
  howItWorks: `Esta sala revela el margen verdadero de un proyecto, más allá del monto que te ofrecen.

1. **Monto neto.** Al monto del proyecto le descuenta los impuestos: lo que realmente te entra, no lo que facturás.
2. **Costo de oportunidad del tiempo.** Suma las horas de trabajo y las de revisiones, y las valoriza a tu costo de oportunidad (lo que ganarías con otro trabajo). Ese es el costo real de dedicarle tu tiempo a este proyecto.
3. **Riesgo de cobro.** Aplica un castigo al margen según la probabilidad de que el cliente pague tarde: cobrar a destiempo tiene un costo financiero y de incertidumbre.
4. **Margen real.** Resta el costo del tiempo y el castigo de riesgo al monto neto. Es lo que de verdad ganás por encima de tu mejor alternativa.
5. **Valor por hora real.** Divide ese margen por las horas totales y lo compara con tu costo de oportunidad. Si queda por debajo, tu tiempo rinde más en otro lado, aunque el proyecto "pague bien".`,
  faq: [
    {
      q: '¿Por qué un proyecto que paga bien puede no convenir?',
      a: 'Porque el monto bruto no es lo que ganás. Después de impuestos, de las horas de trabajo y revisiones valorizadas a tu costo de oportunidad, y del riesgo de cobrar tarde, el margen real puede quedar muy chico o incluso negativo. Lo que importa es cuánto te queda por hora comparado con tu mejor alternativa.',
    },
    {
      q: '¿Qué es el costo de oportunidad por hora?',
      a: 'Es lo que ganarías usando esas horas en tu mejor alternativa: otro cliente, tu tarifa habitual, o desarrollar tu propio producto. Si un proyecto te paga menos por hora que tu costo de oportunidad, estás "perdiendo" la diferencia aunque el proyecto sea rentable en términos contables.',
    },
    {
      q: '¿Por qué cuentan las horas de revisiones?',
      a: 'Porque son tiempo real que dedicás y que casi nunca se cobra aparte. Las revisiones infinitas son la principal causa de que un proyecto rentable termine dejando poco. Estimarlas y sumarlas a las horas totales te muestra el valor por hora verdadero, no el optimista.',
    },
    {
      q: '¿Cómo afecta el riesgo de demora en el cobro?',
      a: 'Cobrar tarde tiene un costo: la plata pierde valor por inflación, tenés que financiar el desfasaje y hay incertidumbre. Esta sala lo modela como un castigo al margen proporcional a la probabilidad de demora. Cuanto más dudoso el cobro, menos vale realmente el proyecto.',
    },
    {
      q: '¿Cómo reduzco el riesgo de cobro de un cliente nuevo?',
      a: 'Pedí anticipo (30–50%), facturá por hitos y no entregues el trabajo final hasta cobrar. El anticipo además filtra: un cliente que no quiere adelantar nada suele ser el que después demora o no paga. Reducir ese riesgo mejora directamente el margen real del proyecto.',
    },
    {
      q: '¿Debería aceptar un proyecto de margen ajustado?',
      a: 'Solo si suma por otro lado: un cliente estratégico que trae referidos, un caso para tu portfolio, o aprendizaje que después monetizás. Por la plata sola, un proyecto que paga apenas tu costo de oportunidad no conviene: es mejor reservar ese tiempo para uno más rentable.',
    },
    {
      q: '¿Cómo uso esto para negociar el precio?',
      a: 'Mirá el monto neto que necesitarías para que el valor por hora real supere tu costo de oportunidad con margen. Esa es tu cifra piso de negociación. Si el cliente no llega, sabés exactamente cuánto pedir o cuándo retirarte sin culpa.',
    },
    {
      q: '¿Esto reemplaza el criterio profesional?',
      a: 'No. Te da el margen y el valor por hora con números, pero la decisión final pesa también factores no monetarios (relación, aprendizaje, reputación). Usá la sala para no aceptar a pérdida sin darte cuenta, y combiná el número con tu estrategia.',
    },
  ],
  sources: [
    { name: 'INDEC — Índice de Precios al Consumidor', url: 'https://www.indec.gob.ar/' },
    { name: 'ARCA — Régimen de monotributo y facturación', url: 'https://www.arca.gob.ar/' },
  ],
};
