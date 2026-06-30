/**
 * Sala de decisión — "¿Cómo cambia nuestro presupuesto con un hijo?"
 *
 * Patrón BREAKDOWN. Parte del presupuesto mensual actual de la familia y le suma
 * los gastos nuevos del bebé (recurrentes + guardería + cobertura médica) y la
 * reducción de ingreso durante la licencia, para mostrar el NUEVO presupuesto
 * mensual y si el ingreso lo sigue cubriendo.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const presupuestoActual = Math.max(0, num(inputs.presupuestoActualMensual));
  const gastosBebe = Math.max(0, num(inputs.gastosNuevosBebeMes));
  const guarderia = Math.max(0, num(inputs.guarderiaMes));
  const cobertura = Math.max(0, num(inputs.coberturaMedicaMes));
  const mesesLicencia = Math.max(0, Math.min(12, num(inputs.mesesLicencia)));
  const reduccionIngreso = Math.max(0, num(inputs.reduccionIngresoLicencia));

  if (!presupuestoActual || (!gastosBebe && !guarderia && !cobertura)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu presupuesto mensual actual y los gastos nuevos que sumaría el bebé (pañales, alimentación, guardería, cobertura) para ver cómo cambia tu presupuesto.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Cuánto sube el gasto mensual' },
      scenarios: [],
      nextActions: [
        'Cargá tu **presupuesto mensual actual** (todo lo que gasta hoy la familia).',
        'Sumá los **gastos nuevos del bebé**: pañales, alimentación, salud y, si aplica, guardería.',
      ],
    };
  }

  const sumaGastosNuevos = gastosBebe + guarderia + cobertura;
  const nuevoPresupuesto = presupuestoActual + sumaGastosNuevos;
  const aumentoPct = presupuestoActual > 0 ? (sumaGastosNuevos / presupuestoActual) * 100 : 0;

  // Durante la licencia: gasto mayor + ingreso reducido = presión sobre el mes.
  // Asumimos que el presupuesto actual estaba cubierto por el ingreso actual, así
  // que el "hueco" del período de licencia es lo nuevo que se suma menos lo que
  // dejás de cobrar. Mostramos el faltante mensual durante la licencia.
  const faltanteLicencia = sumaGastosNuevos + reduccionIngreso;
  const huecoLicenciaTotal = faltanteLicencia * mesesLicencia;

  // — Veredicto: tamaño del salto del presupuesto —
  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (aumentoPct <= 20) {
    status = 'b';
    tone = 'good';
    title = 'El presupuesto sube poco: lo absorbés bien';
    badge = 'Sube poco';
  } else if (aumentoPct <= 40) {
    status = 'tie';
    tone = 'neutral';
    title = 'El presupuesto pega un salto: hay que reordenar';
    badge = 'Salto medio';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'El presupuesto sube fuerte: revisá ingresos y recortes';
    badge = 'Salto grande';
  }

  const detail = `Tu presupuesto pasa de ${fmtMoney(presupuestoActual)} a ${fmtMoney(nuevoPresupuesto)} por mes: sube ${fmtMoney(sumaGastosNuevos)} (${fmtPct(aumentoPct)}).${mesesLicencia > 0 ? ` Durante los ${mesesLicencia} meses de licencia, con el ingreso reducido en ${fmtMoney(reduccionIngreso)}, te falta cubrir ${fmtMoney(faltanteLicencia)} por mes.` : ''}`;

  const scenarios = [
    {
      label: 'Mes normal (post-licencia)',
      value: '+' + fmtMoney(sumaGastosNuevos).replace('-', ''),
      detail: `Gasto extra estable una vez que volvés a tu ingreso pleno (${fmtPct(aumentoPct)}).`,
    },
    {
      label: 'Durante la licencia',
      value: '-' + fmtMoney(faltanteLicencia).replace('-', ''),
      detail: mesesLicencia > 0
        ? `Hueco mensual: gastos nuevos + ${fmtMoney(reduccionIngreso)} de ingreso que no cobrás.`
        : 'Sin meses de licencia cargados: solo el gasto extra mensual.',
    },
    {
      label: 'Colchón para la licencia',
      value: fmtMoney(huecoLicenciaTotal),
      detail: mesesLicencia > 0
        ? `Total a tener ahorrado para cubrir los ${mesesLicencia} meses de licencia.`
        : 'Cargá los meses de licencia para ver cuánto colchón necesitás.',
    },
  ];

  const breakdown = [
    { label: 'Presupuesto mensual actual', value: fmtMoney(presupuestoActual) },
    { label: '+ Gastos del bebé (pañales, comida, salud)', value: '+' + fmtMoney(gastosBebe).replace('-', '') },
    ...(guarderia > 0
      ? [{ label: '+ Guardería', value: '+' + fmtMoney(guarderia).replace('-', '') }]
      : []),
    ...(cobertura > 0
      ? [{ label: '+ Cobertura médica del bebé', value: '+' + fmtMoney(cobertura).replace('-', '') }]
      : []),
    { label: 'Nuevo presupuesto mensual', value: fmtMoney(nuevoPresupuesto), hint: `${fmtPct(aumentoPct)} vs hoy` },
    ...(mesesLicencia > 0
      ? [{ label: `Ingreso reducido durante licencia (${mesesLicencia} meses)`, value: '-' + fmtMoney(reduccionIngreso).replace('-', '') + '/mes' }]
      : []),
  ];

  const nextActions = [
    `Tu gasto fijo sube ${fmtMoney(sumaGastosNuevos)}/mes: revisá tu presupuesto con la **regla 50/30/20** y recortá de los "deseos" para hacerle lugar al bebé.`,
    mesesLicencia > 0
      ? `Armá un colchón de **${fmtMoney(huecoLicenciaTotal)}** ANTES del nacimiento para cubrir los ${mesesLicencia} meses de licencia con ingreso reducido.`
      : 'Si vas a tomar licencia sin goce de sueldo, calculá los meses y armá el colchón previo al nacimiento.',
    'Renegociá o pausá gastos no esenciales (suscripciones, salidas) durante los primeros meses, que son los de mayor desembolso.',
    'Tramitá las **asignaciones familiares de ANSES**: bajan el costo neto mensual del bebé.',
  ];

  const notes = [
    'Asumimos que tu presupuesto actual ya estaba cubierto por tu ingreso; el cálculo muestra cuánto SUMA el bebé, no recalcula tus ingresos totales.',
    'El "hueco de la licencia" combina el gasto extra con el ingreso que dejás de cobrar: si tu licencia es paga, dejá la reducción en 0.',
    'Es orientativo y no es asesoramiento financiero. Ajustá los montos a tu realidad y recordá que la inflación los mueve mes a mes.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: '+' + fmtMoney(sumaGastosNuevos).replace('-', '') + '/mes',
      label: 'Cuánto sube tu gasto mensual',
      sub: `Presupuesto: **${fmtMoney(presupuestoActual)} → ${fmtMoney(nuevoPresupuesto)}** (${fmtPct(aumentoPct)})${mesesLicencia > 0 ? ` · Colchón licencia: **${fmtMoney(huecoLicenciaTotal)}**` : ''}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'como-cambia-mi-presupuesto-con-un-hijo',
  title: '¿Cómo cambia nuestro presupuesto con un hijo? 2026',
  h1: '¿Cómo cambia nuestro presupuesto con un hijo?',
  description:
    'Mirá cómo cambia tu presupuesto mensual cuando llega un bebé: gastos nuevos (pañales, alimentación, guardería, cobertura) más la reducción de ingreso por la licencia. Con el colchón que necesitás.',
  intro:
    'Un hijo no solo agrega gastos: cambia el presupuesto entero de la familia, sobre todo durante la licencia, cuando gastás más y a veces cobrás menos. Esta sala parte de tu presupuesto actual, le suma los gastos nuevos del bebé y la reducción de ingreso, y te muestra el nuevo presupuesto mensual y cuánto colchón necesitás para los meses de licencia.',
  icon: '📊',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    presupuestoActualMensual: 1200000,
    gastosNuevosBebeMes: 190000,
    guarderiaMes: 0,
    coberturaMedicaMes: 50000,
    mesesLicencia: 3,
    reduccionIngresoLicencia: 400000,
  },
  fields: [
    {
      id: 'presupuestoActualMensual',
      label: 'Presupuesto mensual actual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1200000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Todo lo que gasta hoy la familia por mes (alquiler, comida, servicios, etc.).',
      group: 'Tu presupuesto hoy',
      groupIcon: '🏠',
    },
    {
      id: 'gastosNuevosBebeMes',
      label: 'Gastos del bebé por mes',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '190000',
      help: 'Pañales, alimentación, ropa y salud del bebé que se suman cada mes.',
      group: 'Gastos nuevos',
      groupIcon: '🍼',
    },
    {
      id: 'guarderiaMes',
      label: 'Guardería por mes',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      help: 'Si vas a usar guardería. Si no, dejá 0.',
      group: 'Gastos nuevos',
    },
    {
      id: 'coberturaMedicaMes',
      label: 'Cobertura médica del bebé',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      help: 'Plus de obra social / prepaga por sumar al bebé al plan.',
      group: 'Gastos nuevos',
    },
    {
      id: 'mesesLicencia',
      label: 'Meses de licencia',
      type: 'number',
      default: 0,
      min: 0,
      max: 12,
      help: 'Meses en los que tu ingreso baja por la licencia de maternidad/paternidad.',
      group: 'Licencia',
      groupIcon: '🗓️',
    },
    {
      id: 'reduccionIngresoLicencia',
      label: 'Reducción de ingreso en licencia ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      help: 'Cuánto menos entra por mes durante la licencia. Si es paga al 100%, dejá 0.',
      group: 'Licencia',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'regla-50-30-20', label: 'Presupuesto 50/30/20' },
    { slug: 'calculadora-interes-compuesto', label: 'Armar el colchón (interés compuesto)' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `Esta sala te muestra el antes y el después de tu presupuesto familiar.

1. **Presupuesto actual.** Parte de todo lo que gasta hoy la familia por mes, asumiendo que tu ingreso ya lo cubre.
2. **Gastos nuevos del bebé.** Suma los gastos recurrentes (pañales, alimentación, salud), la guardería si la usás y la cobertura médica del bebé.
3. **Nuevo presupuesto mensual.** Suma todo para mostrarte el gasto mensual con el bebé y cuánto representa en porcentaje sobre el presupuesto de hoy.
4. **El hueco de la licencia.** Durante la licencia combinás más gasto con menos ingreso: la sala calcula cuánto te falta cubrir por mes y el colchón total que necesitás para esos meses.
5. **Veredicto.** Según cuánto sube tu gasto en porcentaje, te dice si lo absorbés bien, si pega un salto o si conviene revisar ingresos y recortes.`,
  faq: [
    {
      q: '¿Cuánto sube el presupuesto familiar con un hijo?',
      a: 'Depende de tu presupuesto de partida y de cuánto sumes en pañales, alimentación, salud y guardería. Esta sala te muestra el aumento en pesos y en porcentaje sobre tu gasto actual, además del hueco específico de los meses de licencia.',
    },
    {
      q: '¿Por qué la licencia es el momento más difícil?',
      a: 'Porque se juntan dos cosas: aparecen los gastos nuevos del bebé justo cuando tu ingreso suele bajar por la licencia. Por eso la sala calcula aparte cuánto te falta cubrir por mes durante la licencia y el colchón total que necesitás.',
    },
    {
      q: '¿Cuánto colchón debería tener antes de que nazca?',
      a: 'Al menos lo suficiente para cubrir el hueco de todos los meses de licencia: los gastos nuevos más el ingreso que no vas a cobrar. La sala te calcula ese monto total para que lo tengas ahorrado antes del nacimiento.',
    },
    {
      q: '¿Conviene incluir la guardería desde el primer año?',
      a: 'Solo si la vas a usar. La guardería es uno de los gastos mensuales más pesados, así que cargala únicamente si la pensás contratar; si no, dejá ese campo en 0 para no inflar el presupuesto.',
    },
    {
      q: '¿Las asignaciones de ANSES achican este aumento?',
      a: 'Sí. La asignación por hijo o las asignaciones familiares compensan parte del gasto mensual. Esta sala no las descuenta, así que el aumento neto de tu presupuesto puede ser algo menor al que muestra.',
    },
    {
      q: '¿Qué hago si el nuevo presupuesto supera mi ingreso?',
      a: 'Primero revisá los gastos no esenciales con una regla tipo 50/30/20 y recortá de los "deseos". Si aun así no cierra, conviene planificar ingresos extra o ajustar decisiones grandes (guardería, vivienda) antes de la llegada del bebé.',
    },
    {
      q: '¿Esto sirve para un segundo hijo?',
      a: 'Sí. Cargá tu presupuesto actual (que ya incluye al primer hijo) y sumá solo los gastos nuevos del segundo. El cálculo es el mismo: cuánto se suma al gasto mensual y qué hueco genera la nueva licencia.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa para planificar con números reales. Ajustá los montos a tu familia y recordá que la inflación mueve estos valores; para decisiones grandes consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'ANSES — Asignaciones familiares', url: 'https://www.anses.gob.ar/' },
    { name: 'INDEC — Inflación y canasta básica', url: 'https://www.indec.gob.ar/' },
  ],
};
