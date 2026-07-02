/**
 * Sala de decisión — "¿Cuánto debería cobrar por mi producto o servicio?"
 *
 * Patrón PRICING + BREAKDOWN. Toma el costo variable unitario y el prorrateo de
 * costos fijos por unidad, y le aplica el margen objetivo y los impuestos, más un
 * ajuste por el descuento promedio que terminás dando. Devuelve el precio
 * sugerido y el punto de equilibrio (unidades que cubren los costos fijos).
 * Math inline determinístico.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const costoVar = Math.max(0, num(inputs.costoVariableUnitario));
  const costosFijos = Math.max(0, num(inputs.costosFijosMes));
  const unidades = Math.max(0, num(inputs.unidadesVendidasMes));
  const margenPct = Math.min(95, Math.max(0, num(inputs.margenObjetivo)));
  const impuestosPct = Math.min(95, Math.max(0, num(inputs.impuestos)));
  const descuentoPct = Math.min(90, Math.max(0, num(inputs.descuentoPromedio)));

  if (!costoVar && !costosFijos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el costo variable por unidad y tus costos fijos mensuales para calcular el precio sugerido y tu punto de equilibrio.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Precio sugerido' },
      scenarios: [],
      nextActions: [
        'Cargá el **costo variable por unidad** (lo que te cuesta producir/entregar cada uno).',
        'Sumá tus **costos fijos del mes** y cuántas **unidades vendés** para repartirlos.',
      ],
    };
  }

  // Costo fijo prorrateado por unidad (si no hay volumen, no se prorratea).
  const fijoPorUnidad = unidades > 0 ? costosFijos / unidades : 0;
  const costoUnitarioTotal = costoVar + fijoPorUnidad;

  // Precio que deja el margen objetivo después de impuestos: el denominador no
  // puede ser <= 0 (margen + impuestos no pueden sumar 100%+).
  const denom = 1 - margenPct / 100 - impuestosPct / 100;
  const precioBase = denom > 0 ? costoUnitarioTotal / denom : Infinity;

  // Ajuste por descuento: si das X% de descuento promedio, subí el precio de lista
  // para que el precio efectivo siga dejando el margen.
  const precioLista = descuentoPct > 0 ? precioBase / (1 - descuentoPct / 100) : precioBase;
  const precioEfectivo = precioBase;

  // — Punto de equilibrio: unidades que cubren los costos fijos —
  // Contribución marginal por unidad al precio efectivo (después de impuestos).
  const contribUnit = precioEfectivo * (1 - impuestosPct / 100) - costoVar;
  const puntoEquilibrioUnid = contribUnit > 0 ? Math.ceil(costosFijos / contribUnit) : Infinity;
  const puntoEquilibrioPesos = Number.isFinite(puntoEquilibrioUnid)
    ? puntoEquilibrioUnid * precioEfectivo
    : Infinity;

  const gananciaUnit = precioEfectivo - costoUnitarioTotal - precioEfectivo * (impuestosPct / 100);

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (!Number.isFinite(precioBase)) {
    status = 'a';
    tone = 'bad';
    title = 'Margen + impuestos no pueden sumar 100%';
    badge = 'Revisá los %';
    detail = 'El margen objetivo y los impuestos juntos llegan o superan el 100% de la facturación: bajá alguno para poder fijar un precio.';
  } else if (Number.isFinite(puntoEquilibrioUnid) && unidades > 0 && puntoEquilibrioUnid > unidades) {
    status = 'tie';
    tone = 'warn';
    title = 'A ese precio no llegás a cubrir los fijos';
    badge = 'Equilibrio lejos';
    detail = `El precio sugerido es ${fmtMoney(precioLista)} por unidad, pero a ese precio necesitás vender ${puntoEquilibrioUnid} unidades/mes para cubrir tus costos fijos, y hoy vendés ${unidades.toFixed(0)}. Subí el precio, vendé más o bajá los fijos.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tu precio sugerido';
    badge = 'Precio listo';
    detail = `Cobrá ${fmtMoney(precioLista)} por unidad${descuentoPct > 0 ? ` de lista (queda ${fmtMoney(precioEfectivo)} tras el ${descuentoPct}% de descuento)` : ''}. A ese precio dejás un margen objetivo del ${margenPct}% y cubrís tus costos fijos vendiendo ${Number.isFinite(puntoEquilibrioUnid) ? puntoEquilibrioUnid : '∞'} unidades/mes.`;
  }

  const scenarios = [
    {
      label: 'Margen −10 pts',
      value: fmtMoney(denom + 0.1 > 0 ? costoUnitarioTotal / (1 - Math.max(0, margenPct - 10) / 100 - impuestosPct / 100) : 0),
      detail: 'Precio si bajás el margen objetivo 10 puntos (más competitivo).',
    },
    {
      label: 'Tu margen',
      value: fmtMoney(precioLista),
      detail: `Precio de lista con margen ${margenPct}%${descuentoPct > 0 ? ` y descuento ${descuentoPct}%` : ''}.`,
    },
    {
      label: 'Margen +10 pts',
      value: fmtMoney(1 - (margenPct + 10) / 100 - impuestosPct / 100 > 0 ? costoUnitarioTotal / (1 - (margenPct + 10) / 100 - impuestosPct / 100) : 0),
      detail: 'Precio si apuntás a un margen 10 puntos mayor (premium).',
    },
  ];

  const breakdown = [
    { label: 'Costo variable por unidad', value: fmtMoney(costoVar) },
    { label: 'Costo fijo prorrateado por unidad', value: fmtMoney(fijoPorUnidad), hint: unidades > 0 ? `${fmtMoney(costosFijos)} ÷ ${unidades.toFixed(0)} u.` : 'cargá unidades para prorratear' },
    { label: 'Costo unitario total', value: fmtMoney(costoUnitarioTotal) },
    { label: `Precio para margen ${margenPct}% (post impuestos)`, value: fmtMoney(precioBase) },
    { label: descuentoPct > 0 ? `Precio de lista (cubre ${descuentoPct}% descuento)` : 'Precio de lista', value: fmtMoney(precioLista) },
    { label: 'Ganancia por unidad', value: fmtMoney(gananciaUnit) },
    { label: 'Punto de equilibrio (unidades)', value: Number.isFinite(puntoEquilibrioUnid) ? `${puntoEquilibrioUnid} u./mes` : '—' },
    { label: 'Punto de equilibrio ($)', value: Number.isFinite(puntoEquilibrioPesos) ? fmtMoney(puntoEquilibrioPesos) : '—' },
  ];

  const nextActions = [
    `Poné el precio de lista en **${fmtMoney(precioLista)}**${descuentoPct > 0 ? `: así, después del ${descuentoPct}% de descuento que solés dar, el precio efectivo (${fmtMoney(precioEfectivo)}) todavía deja tu margen.` : '.'}`,
    Number.isFinite(puntoEquilibrioUnid)
      ? `Tu punto de equilibrio es **${puntoEquilibrioUnid} unidades/mes**: por debajo de eso, los costos fijos te dejan en pérdida. Tenelo como meta mínima de ventas.`
      : 'A este precio no cubrís los costos fijos: necesitás subir el precio o bajar los fijos para tener un punto de equilibrio alcanzable.',
    'No fijes el precio solo por costo: mirá también el **valor percibido y la competencia**. Si el mercado paga más, capturá ese margen; si paga menos, revisá tus costos antes de bajar el precio.',
    descuentoPct > 0
      ? `Estás dando ${descuentoPct}% de descuento promedio: cada punto de descuento sale de tu margen. Limitá los descuentos o subí el precio de lista (como ya hace esta sala).`
      : 'Si empezás a dar descuentos, recordá subir el precio de lista para no comerte el margen: cargá el descuento promedio acá para verlo.',
  ];

  const notes = [
    'El precio se calcula como costo unitario total ÷ (1 − margen − impuestos), y luego se infla por el descuento promedio para que el precio efectivo siga dejando el margen.',
    'El costo fijo por unidad depende del volumen: si vendés menos de lo previsto, el costo real por unidad sube y el margen baja. El punto de equilibrio es la cantidad mínima para no perder.',
    'El margen objetivo se aplica sobre el precio (markup sobre venta), no sobre el costo. Verificá que tu definición de margen coincida.',
    'No es asesoramiento financiero. Es una guía de pricing por costos: combinala con análisis de valor y de competencia, y consultá a un contador para tu carga impositiva exacta.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(precioLista),
      label: 'Precio sugerido por unidad',
      sub: `Margen objetivo ${margenPct}%. Punto de equilibrio: **${Number.isFinite(puntoEquilibrioUnid) ? `${puntoEquilibrioUnid} u./mes` : 'inalcanzable a este precio'}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cobrar-por-mi-producto-o-servicio',
  title: '¿Cuánto cobrar por mi producto o servicio? Calculadora de precio 2026',
  h1: '¿Cuánto debería cobrar por mi producto o servicio?',
  description:
    'Calculá el precio de tu producto o servicio a partir de costos, margen objetivo, impuestos y el descuento promedio que das. Incluye precio de lista, ganancia por unidad y punto de equilibrio.',
  intro:
    'Poner precio "a ojo" o copiando a la competencia es la forma más rápida de trabajar a pérdida. Esta sala parte de tu costo real (variable por unidad + fijos prorrateados), le suma el margen que querés y los impuestos, y ajusta por el descuento que terminás dando, para darte un precio que de verdad deja ganancia. Y te dice cuántas unidades necesitás vender para no perder.',
  icon: '🏷️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    costoVariableUnitario: 4_500,
    costosFijosMes: 1_500_000,
    unidadesVendidasMes: 600,
    margenObjetivo: 30,
    impuestos: 25,
    descuentoPromedio: 10,
  },
  fields: [
    {
      id: 'costoVariableUnitario',
      label: 'Costo variable por unidad',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '4500',
      help: 'Lo que te cuesta producir o entregar cada unidad (materiales, comisiones, packaging).',
      group: 'Tus costos',
      groupIcon: '📦',
    },
    {
      id: 'costosFijosMes',
      label: 'Costos fijos del mes',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Alquiler, sueldos, servicios: lo que pagás todos los meses sin importar cuánto vendas.',
      group: 'Tus costos',
    },
    {
      id: 'unidadesVendidasMes',
      label: 'Unidades vendidas por mes',
      type: 'number',
      recommended: true,
      min: 0,
      placeholder: '600',
      help: 'Cuántas unidades vendés (o esperás vender) por mes. Sirve para prorratear los fijos.',
      group: 'Tus costos',
    },
    {
      id: 'margenObjetivo',
      label: 'Margen objetivo',
      type: 'number',
      suffix: '%',
      default: 30,
      min: 0,
      max: 95,
      help: 'La ganancia que querés dejar sobre el precio de venta.',
      group: 'Precio',
      groupIcon: '🎯',
    },
    {
      id: 'impuestos',
      label: 'Impuestos sobre la venta',
      type: 'number',
      suffix: '%',
      default: 25,
      min: 0,
      max: 95,
      help: 'Porcentaje aproximado de la venta que se va en impuestos (IVA, IIBB, etc.).',
      group: 'Precio',
    },
    {
      id: 'descuentoPromedio',
      label: 'Descuento promedio que das',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      max: 90,
      help: 'Descuento típico que terminás aplicando (promos, regateo). Se compensa en el precio de lista.',
      group: 'Precio',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-cafeteria-cuanto-cobrar-pais-cafe-medialuna-margen', label: 'Cuánto cobrar (cafetería)' },
    { slug: 'calculadora-punto-equilibrio-break-even', label: 'Punto de equilibrio' },
    { slug: 'calculadora-costo-hora-empleado-real', label: 'Costo real de la hora' },
    { slug: 'calculadora-monotributo-2026', label: 'Cuota de monotributo' },
  ],
  howItWorks: `Esta sala fija el precio desde tus costos reales, no a ojo.

1. **Costo unitario total.** Suma tu costo variable por unidad y el prorrateo de los costos fijos (costos fijos ÷ unidades vendidas). Ese es lo que de verdad te cuesta cada unidad.
2. **Aplicar margen e impuestos.** Divide el costo unitario por (1 − margen − impuestos). Así, después de pagar impuestos, te queda exactamente el margen que buscás. (El margen es sobre el precio, no sobre el costo.)
3. **Compensar el descuento.** Si solés dar descuentos, infla el precio de lista para que, tras el descuento promedio, el precio efectivo siga dejando tu margen.
4. **Punto de equilibrio.** Calcula la contribución marginal por unidad y cuántas unidades necesitás vender para cubrir los costos fijos. Por debajo de ese número, perdés plata.
5. **Escenarios.** Muestra cómo se mueve el precio si bajás o subís el margen 10 puntos, para que veas el rango entre competitivo y premium.`,
  faq: [
    {
      q: '¿Cómo calculo el precio de un producto?',
      a: 'Sumá el costo variable por unidad más los costos fijos prorrateados por unidad, y dividí ese costo total por (1 − margen − impuestos). El resultado es el precio que, después de impuestos, te deja el margen que buscás. Si das descuentos, subí el precio de lista para compensarlos.',
    },
    {
      q: '¿Qué diferencia hay entre costo variable y costo fijo?',
      a: 'El costo variable cambia con cada venta (materiales, comisiones, packaging): si no vendés, no lo pagás. El costo fijo lo pagás igual vendas o no (alquiler, sueldos, servicios). Para fijar precio, repartís los fijos entre las unidades que vendés.',
    },
    {
      q: '¿Qué es el punto de equilibrio y por qué importa?',
      a: 'Es la cantidad de unidades que necesitás vender para cubrir tus costos fijos: a partir de ahí, cada venta es ganancia; por debajo, perdés plata. Es tu meta mínima de ventas. Si el punto de equilibrio queda por encima de lo que vendés, tenés que subir el precio o bajar los fijos.',
    },
    {
      q: '¿El margen se calcula sobre el costo o sobre el precio?',
      a: 'Esta sala usa el margen sobre el precio de venta (markup sobre venta), que es lo más común para hablar de "margen". No es lo mismo que el markup sobre el costo: un 30% sobre el precio equivale a un ~43% sobre el costo. Asegurate de usar la misma convención en todos tus cálculos.',
    },
    {
      q: '¿Por qué tengo que inflar el precio de lista si doy descuentos?',
      a: 'Porque cada peso de descuento sale directo de tu margen. Si querés dejar un 30% pero das un 10% de descuento promedio, tenés que partir de un precio de lista más alto para que, ya descontado, el precio efectivo siga dejando ese 30%. Si no, el descuento te come la ganancia.',
    },
    {
      q: '¿Debería fijar el precio solo por costos?',
      a: 'No. El costo te da el piso (por debajo perdés), pero el techo lo ponen el valor percibido y la competencia. Si tu producto resuelve un problema importante, podés cobrar más que costo + margen. Usá esta sala como base y ajustá hacia arriba según el valor que entregás.',
    },
    {
      q: '¿Qué pasa si vendo menos unidades de las previstas?',
      a: 'El costo fijo por unidad sube (los mismos fijos se reparten entre menos ventas), así que tu margen real baja. Por eso conviene ser conservador con las unidades estimadas y vigilar el punto de equilibrio: es el número que no podés bajar sin entrar en pérdida.',
    },
    {
      q: '¿Esto sirve para servicios además de productos?',
      a: 'Sí. Para un servicio, el "costo variable por unidad" es lo que te cuesta entregar cada servicio (tu tiempo valorizado, insumos) y las unidades son la cantidad de servicios por mes. Para tarifas por hora, mirá también nuestra sala "¿Cuánto cobrar por hora como freelance?".',
    },
  ],
  sources: [
    { name: 'ARCA — IVA e Ingresos Brutos', url: 'https://www.arca.gob.ar/' },
    { name: 'INDEC — Índice de Precios al Consumidor', url: 'https://www.indec.gob.ar/' },
  ],
};
