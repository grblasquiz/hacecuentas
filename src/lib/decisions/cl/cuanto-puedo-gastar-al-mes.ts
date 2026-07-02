/**
 * Sala de decisión CL — "¿Cuánto puedo gastar al mes sin endeudarme?"
 *
 * Patrón PRESUPUESTO. Adapta la regla 50/30/20 a la billetera chilena: del
 * sueldo líquido descuenta los fijos (arriendo o dividendo, gastos comunes,
 * cuentas, transporte, cuotas) y el ahorro objetivo, y devuelve el tope de
 * gasto variable por mes, semana y día. El enemigo acá no es la inflación:
 * son las cuotas y el gasto hormiga.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

const pct = (n: number) => `${n.toFixed(0)}%`;

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoLiquido));
  const fijos = Math.max(0, num(inputs.gastosFijos));
  const ahorroPct = Math.max(0, Math.min(100, num(inputs.ahorroObjetivo)));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Ingresa tu sueldo líquido mensual y tus gastos fijos. Te decimos cuánto puedes gastar en lo variable cada mes sin endeudarte, apartando primero un ahorro objetivo.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Gasto variable disponible al mes' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **sueldo líquido mensual** (lo que llega a tu cuenta).',
        'Suma tus **gastos fijos** (arriendo o dividendo, gastos comunes, cuentas, cuotas) y define un **% de ahorro**.',
      ],
    };
  }

  const ahorro = ingreso * (ahorroPct / 100);
  const gastable = ingreso - fijos - ahorro;

  const ref50 = ingreso * 0.5;
  const ref30 = ingreso * 0.3;
  const ref20 = ingreso * 0.2;
  const pctFijos = (fijos / ingreso) * 100;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (gastable < 0) {
    status = 'a';
    tone = 'bad';
    title = 'Tus fijos ya superan lo que te entra';
    badge = 'En rojo';
    detail = `Entre gastos fijos (${fmtMoney(fijos)}) y el ahorro objetivo (${fmtMoney(ahorro)}) te pasas de tu líquido de ${fmtMoney(ingreso)}: faltan ${fmtMoney(-gastable)} antes de gastar un peso en lo variable. Hay que recortar fijos —las cuotas y las suscripciones son lo primero—, bajar el ahorro objetivo o subir el ingreso.`;
  } else if (pctFijos > 60) {
    status = 'tie';
    tone = 'warn';
    title = 'Puedes gastar poco: tus fijos pesan demasiado';
    badge = 'Al justo';
    detail = `Te quedan ${fmtMoney(gastable)} al mes para gasto variable, pero tus fijos se llevan el ${pct(pctFijos)} del líquido (lo sano es hasta 50%). Con tan poco margen, cualquier imprevisto termina en la tarjeta o en un avance.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tienes un margen sano para gastar';
    badge = 'Equilibrado';
    detail = `Después de cubrir los fijos (${fmtMoney(fijos)}) y apartar ${fmtMoney(ahorro)} de ahorro, puedes gastar hasta ${fmtMoney(gastable)} al mes en lo variable sin endeudarte. Si respetas ese tope, no necesitas ni rotativo ni avances para llegar a fin de mes.`;
  }

  const porSemana = gastable > 0 ? gastable / 4.33 : 0;
  const porDia = gastable > 0 ? gastable / 30 : 0;

  const scenarios = [
    { label: 'Al mes', value: fmtMoney(Math.max(0, gastable)), detail: 'Tu tope de gasto variable mensual sin endeudarte.' },
    { label: 'A la semana', value: fmtMoney(porSemana), detail: 'El mismo tope en porciones semanales, más fácil de controlar.' },
    { label: 'Al día', value: fmtMoney(porDia), detail: 'Lo que puedes gastar por día en lo no esencial (el café, el delivery, la micro extra).' },
  ];

  const breakdown = [
    { label: 'Sueldo líquido mensual', value: fmtMoney(ingreso) },
    { label: 'Gastos fijos (necesidades)', value: fmtMoney(fijos), hint: `${pct(pctFijos)} del líquido (ref. 50%: ${fmtMoney(ref50)})` },
    { label: 'Ahorro objetivo', value: fmtMoney(ahorro), hint: `${pct(ahorroPct)} (ref. 20%: ${fmtMoney(ref20)})` },
    { label: 'Gasto variable disponible', value: fmtMoney(Math.max(0, gastable)), hint: `ref. 30%: ${fmtMoney(ref30)}` },
  ];

  const nextActions = [
    gastable < 0
      ? 'Estás en rojo estructural: congela el gasto variable y renegocia los fijos grandes (arriendo, plan de isapre, cuotas) antes de sumar cualquier deuda nueva.'
      : `Tu tope de gasto variable es **${fmtMoney(gastable)}/mes** (${fmtMoney(porSemana)}/semana). Revisa la app del banco cada domingo y frena al llegar al tope.`,
    pctFijos > 50
      ? `Tus fijos se llevan el ${pct(pctFijos)} del líquido (lo sano es hasta 50%): revisa arriendo, plan de salud, cuotas y suscripciones — son los que más mueven la aguja.`
      : 'Tus fijos están en un nivel sano (≤50%): el desafío es que el gasto hormiga —delivery, apps, carrete— no se coma el margen mes a mes.',
    ahorroPct < 10 && gastable > 0
      ? `Estás ahorrando ${fmtPct(ahorroPct, 0).replace('+', '')}: poco. Sube el porcentaje apenas puedas — el ahorro que no se aparta el día de pago, no se ahorra.`
      : 'Aparta el ahorro el mismo día que te pagan (transferencia automática a otra cuenta) y gasta tranquilo con lo que queda.',
    'Cuidado con pagar el mínimo de la tarjeta: el rotativo es de las deudas más caras de Chile y convierte el gasto variable de este mes en un fijo de los próximos doce.',
  ];

  const notes = [
    'Adapta la regla 50/30/20 (50% necesidades, 30% gustos, 20% ahorro) a tus números reales: el gasto variable disponible es tu líquido menos los fijos y el ahorro objetivo.',
    'En los fijos incluye arriendo o dividendo, gastos comunes, cuentas (luz, agua, gas, internet, plan del celular), transporte, comida básica del hogar y TODAS tus cuotas. Lo variable es lo discrecional: salidas, ropa, delivery, panoramas.',
    'Como contexto: el ingreso mínimo mensual 2026 ronda los $550.000 brutos, y el costo de vida de una persona sola en Santiago suele superar los $800.000 al mes — por eso los porcentajes exactos importan menos que respetar el tope que te da tu propio número.',
    'No es asesoría financiera: es una guía de presupuesto orientativa.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.max(0, gastable)) + '/mes',
      label: 'Puedes gastar en lo variable sin endeudarte',
      sub: `≈ ${fmtMoney(porSemana)} por semana, tras cubrir fijos (${fmtMoney(fijos)}) y ahorrar ${fmtMoney(ahorro)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-puedo-gastar-al-mes',
  title: '¿Cuánto puedo gastar al mes sin endeudarme? Chile 2026',
  h1: '¿Cuánto puedo gastar al mes sin endeudarme?',
  description:
    'Calcula tu tope de gasto variable mensual en Chile con la regla 50/30/20 adaptada: de tu sueldo líquido restamos arriendo o dividendo, gastos comunes, cuentas, cuotas y tu ahorro objetivo. Tope por mes, semana y día sin caer en la tarjeta.',
  intro:
    'Gastar sin un número en la cabeza es la forma más rápida de terminar pagando el mínimo de la tarjeta. Esta sala adapta la regla 50/30/20 a tu billetera: toma tu sueldo líquido, descuenta los fijos (arriendo o dividendo, gastos comunes, cuentas, transporte y las cuotas que ya arrastras) y el ahorro que quieres sostener, y te devuelve un tope claro de gasto variable por mes, semana y día. Con la inflación controlada, en Chile el presupuesto no se lo come la subida de precios: se lo comen las cuotas y el gasto hormiga.',
  icon: '🧮',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    ingresoLiquido: 1100000,
    gastosFijos: 650000,
    ahorroObjetivo: 10,
  },
  fields: [
    { id: 'ingresoLiquido', label: 'Tu sueldo líquido mensual', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '1100000', help: 'Lo que llega a tu cuenta cada mes, ya descontadas AFP y salud. Suma todos tus ingresos.', group: 'Tu plata', groupIcon: '💰' },
    { id: 'gastosFijos', label: 'Gastos fijos mensuales', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '650000', help: 'Arriendo o dividendo, gastos comunes, cuentas, plan del celular, transporte, comida básica y cuotas de deudas.', group: 'Tu plata' },
    { id: 'ahorroObjetivo', label: '% de ahorro que quieres sostener', type: 'number', suffix: '%', default: 20, min: 0, max: 100, placeholder: '10', help: 'Qué porcentaje del líquido quieres guardar cada mes. La regla 50/30/20 sugiere 20%; parte con lo que puedas cumplir.', group: 'Tu plata' },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-sueldo-liquido-chile-2026-impuesto-segunda-categoria', label: 'Sueldo líquido' },
    { slug: 'cl/calculadora-coste-vida-mensual-chile-soltero-pareja-familia', label: 'Costo de vida mensual' },
    { slug: 'cl/calculadora-canasta-basica-mensual-chile-ine-2026', label: 'Canasta básica mensual' },
    { slug: 'cl/calculadora-tarjeta-credito-chile-tasa-rotativa-pago-minimo', label: 'Tarjeta: rotativo y pago mínimo' },
  ],
  howItWorks: `Esta sala convierte la regla 50/30/20 en un tope concreto para tu billetera.

1. **Tu líquido real.** Parte de lo que efectivamente llega a tu cuenta cada mes (después de AFP y salud), sumando todas tus fuentes.
2. **Necesidades primero.** Resta tus fijos: arriendo o dividendo, gastos comunes, cuentas, transporte, comida básica y las cuotas que ya pagas. La regla dice que no deberían superar el 50% del líquido.
3. **Ahórrate a ti primero.** Aparta el porcentaje de ahorro que elijas (la referencia es 20%) antes de gastar en cualquier otra cosa: lo que no se separa el día de pago, no se ahorra.
4. **Lo que queda es tu tope.** El resto es tu gasto variable: salidas, ropa, delivery, panoramas. Mientras no lo pases, no necesitas tarjeta ni avances para cerrar el mes.
5. **En porciones manejables.** Reparte el tope por semana y por día, y enciende una alerta si tus fijos pesan más del 50-60% del líquido.`,
  faq: [
    { q: '¿Qué es la regla 50/30/20?', a: 'Una guía de presupuesto: 50% del ingreso a necesidades, 30% a gustos (gasto variable) y 20% a ahorro. Esta sala no impone los porcentajes: usa tus fijos y tu ahorro reales, y te devuelve el gasto variable que de verdad te queda.' },
    { q: '¿Qué cuenta como gasto fijo en Chile?', a: 'Todo lo que pagas sí o sí cada mes: arriendo o dividendo, gastos comunes, cuentas de luz, agua, gas e internet, plan del celular, transporte (Bip!, bencina, TAG), comida básica del hogar, plan de isapre o adicionales de salud, colegios y TODAS las cuotas de créditos y tarjetas.' },
    { q: '¿Las cuotas van en fijos o en variable?', a: 'En fijos, siempre: ya te comprometiste y no puedes recortarlas sin repactar. Ese es justamente el problema de comprar todo en cuotas — convierte el gusto de hoy en un fijo de los próximos 12 o 24 meses y te achica el tope disponible cada mes.' },
    { q: '¿Cuánto debería ahorrar al mes?', a: 'La referencia es 20% del líquido, pero lo importante es la constancia. Si hoy no te da, parte con 5-10% automático el día de pago y súbelo cuando sueltes alguna cuota. El hábito le gana al porcentaje.' },
    { q: '¿Qué hago si mis fijos superan el 50% del sueldo?', a: 'Es la causa número uno de vivir al justo. Ataca los rubros grandes: el arriendo (¿cambio de comuna o compartir?), el plan de salud (¿tu plan de isapre corresponde a tu renta o te conviene Fonasa?), las cuotas (¿repactar a una tasa menor?) y las suscripciones que ya no usas.' },
    { q: '¿Sirve si mi ingreso es variable (boletas, comisiones)?', a: 'Sí, pero usa el promedio de tus últimos 6 meses o directamente el mes más bajo razonable, no el mejor. Con ingreso variable el tope conservador es tu amigo: los meses buenos alimentan el ahorro, no el gasto.' },
    { q: '¿Con la inflación baja igual tengo que presupuestar?', a: 'Más que nunca: con el IPC en torno al 3-4% anual, ya no puedes culpar a los precios de que no te alcance. En Chile el presupuesto se rompe por las cuotas acumuladas, el rotativo de la tarjeta y el gasto hormiga — y esos sí los controlas tú.' },
    { q: '¿El sueldo mínimo alcanza para este esquema?', a: 'Con el ingreso mínimo (en torno a $550.000 brutos en 2026) y el costo de vida actual, es probable que los fijos superen el 50% y el margen variable sea chico: la sala te lo va a mostrar en rojo o al justo. Ahí el valor está en conocer tu número diario exacto y en proteger aunque sea un ahorro mínimo.' },
  ],
  sources: [
    { name: 'CMF — Educación financiera: presupuesto y endeudamiento', url: 'https://www.cmfchile.cl/educa/' },
    { name: 'Banco Central de Chile — IPC e indicadores', url: 'https://www.bcentral.cl/' },
    { name: 'SERNAC — Endeudamiento responsable', url: 'https://www.sernac.cl/' },
  ],
};
