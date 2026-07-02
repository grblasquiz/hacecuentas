/**
 * Sala de decisión — "¿Conviene reparar o reemplazar un electrodoméstico?"
 *
 * Patrón COMPARACIÓN A vs B con métrica "costo por mes de uso". No alcanza con
 * mirar el precio de la reparación contra el de uno nuevo: lo que importa es
 * cuánto te cuesta cada mes de vida útil, sumando el consumo de energía (un equipo
 * nuevo suele consumir menos).
 *   A) Reparar:    reparacion/vidaReparado + energiaViejo/mes
 *   B) Reemplazar: precioNuevo/vidaNuevo   + energiaNuevo/mes
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const costoReparacion = Math.max(0, num(inputs.costoReparacion));
  const vidaReparado = Math.max(0, num(inputs.vidaUtilEsperadaReparadoMeses));
  const precioNuevo = Math.max(0, num(inputs.precioNuevo));
  const vidaNuevo = Math.max(0, num(inputs.vidaUtilNuevoMeses));
  const energiaViejo = Math.max(0, num(inputs.consumoEnergiaViejoMes));
  const energiaNuevo = Math.max(0, num(inputs.consumoEnergiaNuevoMes));
  const garantiaNuevo = Math.max(0, num(inputs.garantiaNuevoMeses));

  if (!costoReparacion || !vidaReparado || !precioNuevo || !vidaNuevo) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el costo de la reparación y los meses que duraría reparado, más el precio del nuevo y su vida útil, para comparar el costo por mes de uso.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Costo por mes de uso' },
      scenarios: [],
      nextActions: [
        'Cargá el **costo de la reparación** y cuántos **meses más** duraría el equipo reparado.',
        'Cargá el **precio del nuevo** y su **vida útil** esperada en meses.',
      ],
    };
  }

  // Costo por mes de uso = amortización + energía mensual.
  const amortReparar = costoReparacion / vidaReparado;
  const amortNuevo = precioNuevo / vidaNuevo;
  const costoMesReparar = amortReparar + energiaViejo;
  const costoMesNuevo = amortNuevo + energiaNuevo;

  const diff = costoMesNuevo - costoMesReparar; // + => conviene reparar; − => reemplazar
  const ahorroEnergiaMes = Math.max(0, energiaViejo - energiaNuevo);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;
  const umbral = Math.max(costoMesReparar, costoMesNuevo) * 0.08; // 8% = parejo

  if (diff > umbral) {
    status = 'a'; // A = reparar
    tone = 'good';
    title = 'Conviene reparar';
    badge = 'Reparar';
    detail = `Reparar cuesta ${fmtMoney(costoMesReparar)} por mes de uso y comprar uno nuevo ${fmtMoney(costoMesNuevo)}: reparar te sale ${fmtMoney(diff)}/mes más barato. La reparación amortiza bien sobre los ${vidaReparado} meses que sumaría el equipo.`;
  } else if (diff < -umbral) {
    status = 'b'; // B = reemplazar
    tone = 'good';
    title = 'Conviene reemplazar';
    badge = 'Comprar nuevo';
    detail = `Uno nuevo cuesta ${fmtMoney(costoMesNuevo)} por mes de uso contra ${fmtMoney(costoMesReparar)} de repararlo: el nuevo te sale ${fmtMoney(-diff)}/mes más barato${ahorroEnergiaMes > 0 ? `, en parte porque consume ${fmtMoney(ahorroEnergiaMes)}/mes menos de energía` : ''}. Además arrancás la garantía de cero.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por garantía y molestias';
    badge = 'Es parejo';
    detail = `Reparar (${fmtMoney(costoMesReparar)}/mes) y comprar nuevo (${fmtMoney(costoMesNuevo)}/mes) cuestan casi lo mismo por mes de uso. Decidí por lo demás: garantía, riesgo de que vuelva a fallar y si tenés la plata del nuevo ahora.`;
  }

  const scenarios = [
    {
      label: 'Reparar',
      value: fmtMoney(costoMesReparar) + '/mes',
      detail: `Amortización (${fmtMoney(amortReparar)}) + energía (${fmtMoney(energiaViejo)}) por mes de uso.`,
    },
    {
      label: 'Reemplazar',
      value: fmtMoney(costoMesNuevo) + '/mes',
      detail: `Amortización (${fmtMoney(amortNuevo)}) + energía (${fmtMoney(energiaNuevo)}) por mes de uso.`,
    },
    {
      label: 'Si vuelve a fallar',
      value: fmtMoney((costoReparacion * 1.5) / vidaReparado + energiaViejo) + '/mes',
      detail: 'Costo de reparar si en el camino necesitás otro arreglo (+50% en reparaciones).',
    },
  ];

  const comparison = {
    columns: ['Reparar', 'Comprar nuevo'] as [string, string],
    rows: [
      { label: 'Desembolso inicial', a: fmtMoney(costoReparacion), b: fmtMoney(precioNuevo) },
      { label: 'Vida útil esperada', a: `${vidaReparado} meses`, b: `${vidaNuevo} meses` },
      { label: 'Amortización por mes', a: fmtMoney(amortReparar), b: fmtMoney(amortNuevo) },
      { label: 'Energía por mes', a: fmtMoney(energiaViejo), b: fmtMoney(energiaNuevo), hint: ahorroEnergiaMes > 0 ? `el nuevo ahorra ${fmtMoney(ahorroEnergiaMes)}/mes` : undefined },
      { label: 'Costo total por mes de uso', a: fmtMoney(costoMesReparar), b: fmtMoney(costoMesNuevo), hint: `${diff >= 0 ? '+' : ''}${fmtMoney(diff)} a favor de reparar` },
      { label: 'Garantía', a: 'Sin garantía nueva', b: garantiaNuevo > 0 ? `${garantiaNuevo} meses` : 'según vendedor' },
    ],
  };

  const nextActions = [
    'Pedí el **presupuesto de reparación por escrito** y preguntá si el arreglo tiene alguna garantía: una reparación sin garantía que vuelve a fallar tira el cálculo por la borda.',
    ahorroEnergiaMes > 0
      ? `El equipo nuevo consume ${fmtMoney(ahorroEnergiaMes)}/mes menos: en ${vidaNuevo} meses eso es ${fmtMoney(ahorroEnergiaMes * vidaNuevo)} de ahorro de energía que el viejo no te da.`
      : 'Si el modelo nuevo tiene mejor etiqueta de eficiencia energética (clase A), cargá su consumo menor: a la larga puede inclinar la balanza.',
    'Regla práctica: si la reparación supera el **50% del precio de uno nuevo** y el equipo ya es viejo, suele convenir reemplazar.',
    'Si reemplazás, fijate si podés **entregar el usado** o venderlo: ese ingreso baja el costo real del nuevo.',
  ];

  const notes = [
    'Compara el costo por mes de uso = (desembolso / vida útil esperada) + consumo de energía mensual. Es la forma justa de comparar un arreglo barato y corto contra una compra cara y larga.',
    'Las vidas útiles son estimaciones: un equipo reparado puede durar más o menos de lo previsto, y ahí está el riesgo principal de reparar.',
    'No incluye el valor de tu tiempo ni las molestias de un equipo que falla seguido. Es orientativo y no es asesoramiento financiero.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.min(costoMesReparar, costoMesNuevo)) + '/mes',
      label: diff >= 0 ? 'Reparar cuesta menos por mes de uso' : 'El nuevo cuesta menos por mes de uso',
      sub: `Reparar: **${fmtMoney(costoMesReparar)}/mes** vs nuevo: **${fmtMoney(costoMesNuevo)}/mes** de uso.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'reparar-o-reemplazar-electrodomestico',
  title: '¿Reparar o reemplazar el electrodoméstico? Comparador 2026',
  h1: '¿Conviene reparar o reemplazar un electrodoméstico?',
  description:
    'Compará reparar tu electrodoméstico contra comprar uno nuevo midiendo el costo por mes de uso: desembolso, vida útil y consumo de energía. Te decimos cuál te sale más barato a la larga.',
  intro:
    'Se rompió la heladera o el lavarropas y aparece la duda: ¿lo arreglo o compro uno nuevo? Mirar solo el precio engaña. Lo que importa es el costo por mes de uso: un arreglo barato que dura poco puede salir más caro que un equipo nuevo que dura años y consume menos energía. Esta sala compara las dos opciones con esa métrica justa.',
  icon: '🔧',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    costoReparacion: 180000,
    vidaUtilEsperadaReparadoMeses: 24,
    precioNuevo: 900000,
    vidaUtilNuevoMeses: 120,
    consumoEnergiaViejoMes: 18000,
    consumoEnergiaNuevoMes: 9000,
    garantiaNuevoMeses: 12,
  },
  fields: [
    {
      id: 'costoReparacion',
      label: 'Costo de la reparación',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '180000',
      help: 'Presupuesto del arreglo (mano de obra + repuestos).',
      group: 'Reparar',
      groupIcon: '🔧',
    },
    {
      id: 'vidaUtilEsperadaReparadoMeses',
      label: 'Meses que duraría reparado',
      type: 'number',
      required: true,
      min: 1,
      placeholder: '24',
      suffix: 'meses',
      help: 'Cuántos meses más esperás que funcione el equipo después del arreglo.',
      group: 'Reparar',
    },
    {
      id: 'consumoEnergiaViejoMes',
      label: 'Energía del viejo por mes',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '18000',
      help: 'Cuánto suma a tu factura de luz por mes el equipo actual.',
      group: 'Reparar',
    },
    {
      id: 'precioNuevo',
      label: 'Precio del nuevo',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '900000',
      help: 'Precio del electrodoméstico nuevo equivalente.',
      group: 'Comprar nuevo',
      groupIcon: '🆕',
    },
    {
      id: 'vidaUtilNuevoMeses',
      label: 'Vida útil del nuevo',
      type: 'number',
      required: true,
      min: 1,
      placeholder: '120',
      suffix: 'meses',
      help: 'Cuántos meses esperás que dure el nuevo (una heladera ronda los 10 años = 120 meses).',
      group: 'Comprar nuevo',
    },
    {
      id: 'consumoEnergiaNuevoMes',
      label: 'Energía del nuevo por mes',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '9000',
      help: 'Cuánto sumaría a tu factura el nuevo. Los modelos eficientes (clase A) consumen bastante menos.',
      group: 'Comprar nuevo',
    },
    {
      id: 'garantiaNuevoMeses',
      label: 'Garantía del nuevo',
      type: 'number',
      default: 12,
      min: 0,
      advanced: true,
      suffix: 'meses',
      help: 'Meses de garantía del equipo nuevo. No entra en el costo, pero pesa en la decisión.',
      group: 'Comprar nuevo',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota si lo financiás' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
  ],
  howItWorks: `Esta sala compara las dos opciones con una métrica justa: el costo por mes de uso.

1. **Amortización de cada opción.** Divide el desembolso por la vida útil esperada: la reparación entre los meses que duraría reparado, y el precio del nuevo entre su vida útil. Así un arreglo barato pero corto no parece automáticamente mejor.
2. **Consumo de energía.** Suma el gasto de luz mensual de cada opción. Un equipo nuevo suele consumir menos, y ese ahorro cuenta a su favor mes a mes.
3. **Costo total por mes de uso.** Suma amortización + energía para cada opción. Ese es el número comparable de verdad.
4. **Veredicto.** Si la diferencia supera el 8%, marca la opción más barata por mes de uso; si es chica, te dice que decidas por garantía, riesgo de nueva falla y disponibilidad de plata.
5. **Escenario de nueva falla.** Muestra cuánto sube el costo de reparar si el equipo vuelve a romperse, el principal riesgo de arreglar algo viejo.`,
  faq: [
    {
      q: '¿Conviene reparar o cambiar un electrodoméstico?',
      a: 'Depende del costo por mes de uso de cada opción, no solo del precio. Una reparación barata que dura poco puede salir más cara por mes que un equipo nuevo que dura años y consume menos energía. Esta sala calcula ese costo por mes de uso para los dos casos y te dice cuál gana.',
    },
    {
      q: '¿Qué es el "costo por mes de uso"?',
      a: 'Es el desembolso dividido por la vida útil esperada (cuánto te cuesta cada mes que lo usás) más el consumo de energía mensual. Permite comparar de forma justa un arreglo barato y corto contra una compra cara y larga.',
    },
    {
      q: '¿Cuándo conviene claramente reemplazar?',
      a: 'Una regla práctica: si la reparación supera el 50% del precio de uno nuevo y el equipo ya tiene varios años, suele convenir reemplazar. También cuando el nuevo consume mucha menos energía o cuando el viejo ya falló varias veces.',
    },
    {
      q: '¿Cuánto pesa el consumo de energía?',
      a: 'Bastante en electrodomésticos de uso continuo como la heladera. Un modelo eficiente (clase A) puede ahorrar miles de pesos al mes frente a uno viejo, y ese ahorro sumado a lo largo de su vida útil puede justificar la compra. Cargá ambos consumos para verlo.',
    },
    {
      q: '¿Por qué importa cuánto duraría reparado?',
      a: 'Porque ese es el plazo sobre el que se reparte el costo del arreglo. Si la reparación dura solo unos meses, su costo por mes de uso es alto; si extiende la vida varios años, es bajo. El riesgo es que no dure lo previsto.',
    },
    {
      q: '¿Y la garantía del equipo nuevo?',
      a: 'Es una ventaja real del nuevo que el cálculo no monetiza: te cubre ante fallas durante un tiempo y reduce el riesgo. Por eso, cuando las dos opciones empatan en costo por mes, la garantía suele inclinar la balanza hacia comprar nuevo.',
    },
    {
      q: '¿Conviene si tengo que financiar el nuevo?',
      a: 'Si lo financiás, sumale el interés al costo del nuevo (mirá el CFT) y volvé a comparar. A veces reparar gana solo porque evita endeudarte a tasa alta. Podés estimar la cuota con la calculadora de cuota de préstamo.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa que compara costos por mes de uso. No incluye el valor de tu tiempo ni las molestias de un equipo que falla seguido. Para compras grandes, considerá también esos factores.',
    },
  ],
  sources: [
    { name: 'Secretaría de Energía — Etiquetado de eficiencia energética', url: 'https://www.argentina.gob.ar/economia/energia' },
    { name: 'INDEC — Precios de electrodomésticos', url: 'https://www.indec.gob.ar/' },
  ],
};
