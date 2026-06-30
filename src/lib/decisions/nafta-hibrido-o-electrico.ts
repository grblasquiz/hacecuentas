/**
 * Sala de decisión — "¿Nafta, híbrido o eléctrico?"
 *
 * Patrón COMPARACIÓN de 3 opciones (mostradas en breakdown). Costo total a N años:
 * precio de compra + costo de energía/combustible × años + mantenimiento × años.
 * El eléctrico cuesta más al comprar pero gasta mucho menos en energía y
 * mantenimiento; se "amortiza" recorriendo km. Calcula además el punto de
 * equilibrio en años a partir del cual el eléctrico le gana a la nafta.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const precioNafta = Math.max(0, num(inputs.precioNafta));
  const precioHibrido = Math.max(0, num(inputs.precioHibrido));
  const precioElectrico = Math.max(0, num(inputs.precioElectrico));
  const kmAnuales = Math.max(0, num(inputs.kmAnuales));
  const consumoNafta = Math.max(0, num(inputs.consumoNafta)); // L/100km
  const precioLitro = Math.max(0, num(inputs.precioNaftaLitro));
  const consumoElec = Math.max(0, num(inputs.consumoElectrico)); // kWh/100km
  const precioKwh = Math.max(0, num(inputs.precioKwh));
  const mantNaftaAnual = Math.max(0, num(inputs.mantenimientoNaftaAnual));
  const mantElecAnual = Math.max(0, num(inputs.mantenimientoElectricoAnual));
  const anios = Math.max(1, num(inputs.aniosTenencia));

  if (!precioNafta || !precioElectrico || !kmAnuales) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá los precios de los autos a comparar, los km que hacés por año y los consumos (L/100km del nafta y kWh/100km del eléctrico) con sus precios de energía.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Costo total a N años' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio** de cada auto y los **km que hacés por año**.',
        'Cargá el **consumo** (L/100km y kWh/100km) y los precios de nafta y electricidad.',
      ],
    };
  }

  // Costo de energía anual por tipo.
  const combNaftaAnual = (kmAnuales / 100) * consumoNafta * precioLitro;
  const combElecAnual = (kmAnuales / 100) * consumoElec * precioKwh;
  // Híbrido: aproximamos 60% del consumo de nafta (ahorra ~40% en ciudad/mixto).
  const combHibridoAnual = combNaftaAnual * 0.6;
  // Mantenimiento del híbrido: intermedio entre nafta y eléctrico.
  const mantHibridoAnual = (mantNaftaAnual + mantElecAnual) / 2;

  const tco = (precio: number, energiaAnual: number, mantAnual: number) =>
    precio + (energiaAnual + mantAnual) * anios;

  const tcoNafta = tco(precioNafta, combNaftaAnual, mantNaftaAnual);
  const tcoHibrido = precioHibrido > 0 ? tco(precioHibrido, combHibridoAnual, mantHibridoAnual) : Infinity;
  const tcoElec = tco(precioElectrico, combElecAnual, mantElecAnual);

  const opciones = [
    { key: 'nafta', label: 'Nafta', tco: tcoNafta },
    { key: 'hibrido', label: 'Híbrido', tco: tcoHibrido },
    { key: 'electrico', label: 'Eléctrico', tco: tcoElec },
  ].filter((o) => Number.isFinite(o.tco));

  const ordenadas = [...opciones].sort((a, b) => a.tco - b.tco);
  const ganadora = ordenadas[0];
  const segunda = ordenadas[1];
  const diff = segunda ? segunda.tco - ganadora.tco : 0;
  const margenPct = segunda && segunda.tco > 0 ? (diff / segunda.tco) * 100 : 100;

  // Punto de equilibrio eléctrico vs nafta: a partir de qué año el eléctrico
  // (más caro de compra, más barato de uso) le gana a la nafta.
  const sobreprecioElec = precioElectrico - precioNafta; // suele ser > 0
  const ahorroAnualElecVsNafta = (combNaftaAnual + mantNaftaAnual) - (combElecAnual + mantElecAnual);
  const breakevenAnios = ahorroAnualElecVsNafta > 0 && sobreprecioElec > 0
    ? sobreprecioElec / ahorroAnualElecVsNafta
    : 0;
  // Km de equilibrio: km/año necesarios para que el eléctrico se amortice dentro del horizonte.
  const ahorroPorKmElec = ((consumoNafta * precioLitro) - (consumoElec * precioKwh)) / 100
    + (mantNaftaAnual - mantElecAnual) / Math.max(1, kmAnuales);

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let title: string;
  let detail: string;

  if (margenPct < 5 && segunda) {
    status = 'tie';
    tone = 'neutral';
    title = `${ganadora.label} y ${segunda.label} salen casi igual`;
    badge = 'Es parejo';
    detail = `A ${anios} años, ${ganadora.label} cuesta ${fmtMoney(ganadora.tco)} y ${segunda.label} ${fmtMoney(segunda.tco)}: diferencia de apenas ${fmtMoney(diff)}. Con esa brecha decidí por uso, autonomía y carga.`;
  } else {
    status = ganadora.key === 'electrico' ? 'b' : 'a';
    tone = 'good';
    title = `Te conviene: ${ganadora.label}`;
    badge = ganadora.label;
    detail = `A ${anios} años y ${kmAnuales.toLocaleString('es-AR')} km/año, el ${ganadora.label.toLowerCase()} es el más barato: ${fmtMoney(ganadora.tco)} de costo total, ${fmtMoney(diff)} menos que el ${segunda ? segunda.label.toLowerCase() : '—'}.`;
  }

  const scenarios = [
    {
      label: 'Costo de energía/año',
      value: `${fmtMoney(combNaftaAnual)} vs ${fmtMoney(combElecAnual)}`,
      detail: 'Nafta vs eléctrico: el eléctrico gasta mucho menos por km.',
    },
    {
      label: 'Punto de equilibrio eléctrico',
      value: breakevenAnios > 0 ? `${breakevenAnios.toFixed(1).replace('.', ',')} años` : 'No se amortiza',
      detail: breakevenAnios > 0
        ? `Año a partir del cual el eléctrico le gana a la nafta con tu uso.`
        : 'Con estos números, el ahorro de uso no alcanza a cubrir el sobreprecio.',
    },
    {
      label: 'Ahorro eléctrico vs nafta (anual)',
      value: fmtMoney(ahorroAnualElecVsNafta),
      detail: 'Lo que el eléctrico ahorra por año en energía y mantenimiento.',
    },
  ];

  const breakdown = [
    { label: 'Nafta — precio + uso a ' + anios + ' años', value: fmtMoney(tcoNafta), hint: `energía ${fmtMoney(combNaftaAnual)}/año` },
    ...(Number.isFinite(tcoHibrido)
      ? [{ label: 'Híbrido — precio + uso a ' + anios + ' años', value: fmtMoney(tcoHibrido), hint: `energía ~${fmtMoney(combHibridoAnual)}/año` }]
      : []),
    { label: 'Eléctrico — precio + uso a ' + anios + ' años', value: fmtMoney(tcoElec), hint: `energía ${fmtMoney(combElecAnual)}/año` },
    { label: 'Diferencia (ganador vs segundo)', value: fmtMoney(diff), hint: `gana el ${ganadora.label.toLowerCase()}` },
    { label: 'Sobreprecio del eléctrico', value: fmtMoney(Math.max(0, sobreprecioElec)) },
    { label: 'Punto de equilibrio eléctrico', value: breakevenAnios > 0 ? `${breakevenAnios.toFixed(1).replace('.', ',')} años` : 'No se amortiza' },
  ];

  const nextActions = [
    `Para tus ${kmAnuales.toLocaleString('es-AR')} km/año, el **${ganadora.label.toLowerCase()}** es el más barato a ${anios} años (${fmtMoney(ganadora.tco)}).`,
    breakevenAnios > 0
      ? `El eléctrico se amortiza en **${breakevenAnios.toFixed(1).replace('.', ',')} años**: si lo vas a tener más que eso, su menor costo de uso lo hace conveniente. Cuantos más km hagas, antes conviene.`
      : 'Con tu kilometraje, el eléctrico no llega a amortizar su sobreprecio. Recién conviene si hacés bastantes más km al año o si baja su precio de compra.',
    'Confirmá que podés **cargar en casa**: el costo de energía del eléctrico se dispara si dependés solo de cargadores públicos. Y revisá la **autonomía real** para tu uso.',
    'Si dudás entre nafta y conversión a GNC para bajar el costo por km, esa es otra vía de ahorro: compará el costo de combustible con la calculadora de combustible.',
  ];

  const notes = [
    'Costo total = precio de compra + (energía + mantenimiento) × años. El híbrido se estima en ~60% del consumo del nafta y mantenimiento intermedio (aproximación).',
    'No incluye depreciación ni incentivos/impuestos especiales para eléctricos, que pueden cambiar la cuenta. El precio de la electricidad doméstica vs pública varía mucho.',
    'Orientativo, no es asesoramiento financiero. Los consumos reales dependen del modelo, el estilo de manejo y la ruta. Ajustá los valores a tu caso.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ganadora.tco),
      label: `Más barato a ${anios} años: ${ganadora.label}`,
      sub: segunda ? `Ahorra **${fmtMoney(diff)}** frente al ${segunda.label.toLowerCase()}. Eléctrico se amortiza en **${breakevenAnios > 0 ? breakevenAnios.toFixed(1).replace('.', ',') + ' años' : 'no se amortiza'}**.` : undefined,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'nafta-hibrido-o-electrico',
  title: '¿Nafta, híbrido o eléctrico? Comparador de costo total 2026',
  h1: '¿Nafta, híbrido o eléctrico?',
  description:
    'Compará el costo total a varios años de un auto a nafta, híbrido o eléctrico: precio, combustible o energía y mantenimiento. Te decimos cuál sale menos y a partir de cuántos años conviene el eléctrico.',
  intro:
    'El eléctrico cuesta más al comprar pero gasta una fracción en energía y casi nada en mantenimiento; el nafta es barato de entrada pero caro de usar; el híbrido queda en el medio. Lo que decide es el costo total a los años que lo vas a tener, según tus kilómetros. Esta sala lo calcula para los tres y te dice cuál gana y a partir de cuántos años el eléctrico se amortiza.',
  icon: '⚡',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    precioNafta: 25000000,
    precioHibrido: 32000000,
    precioElectrico: 40000000,
    kmAnuales: 15000,
    consumoNafta: 8,
    precioNaftaLitro: 1300,
    consumoElectrico: 16,
    precioKwh: 90,
    mantenimientoNaftaAnual: 700000,
    mantenimientoElectricoAnual: 250000,
    aniosTenencia: 8,
  },
  fields: [
    {
      id: 'precioNafta',
      label: 'Precio del nafta',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '25000000',
      profileKey: 'vehiculo.valor',
      help: 'Precio del modelo a combustión que comparás.',
      group: 'Precios',
      groupIcon: '🏷️',
    },
    {
      id: 'precioHibrido',
      label: 'Precio del híbrido',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '32000000',
      help: 'Precio del híbrido equivalente. Dejá 0 si no comparás híbrido.',
      group: 'Precios',
    },
    {
      id: 'precioElectrico',
      label: 'Precio del eléctrico',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '40000000',
      help: 'Precio del eléctrico equivalente.',
      group: 'Precios',
    },
    {
      id: 'aniosTenencia',
      label: '¿Cuántos años lo vas a tener?',
      type: 'number',
      required: true,
      min: 1,
      max: 30,
      default: 8,
      help: 'Horizonte de tenencia: cuanto más años, más pesa el ahorro de uso del eléctrico.',
      group: 'Precios',
    },
    {
      id: 'kmAnuales',
      label: 'Kilómetros por año',
      type: 'number',
      required: true,
      min: 0,
      placeholder: '15000',
      help: 'Cuántos km hacés al año. Más km favorecen al eléctrico.',
      group: 'Tu uso',
      groupIcon: '🛣️',
    },
    {
      id: 'consumoNafta',
      label: 'Consumo nafta (L/100km)',
      type: 'number',
      suffix: 'L',
      default: 8,
      min: 0,
      placeholder: '8',
      help: 'Litros cada 100 km del auto a combustión.',
      group: 'Energía',
      groupIcon: '⛽',
    },
    {
      id: 'precioNaftaLitro',
      label: 'Precio del litro de nafta',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '1300',
      help: 'Precio actual del litro de nafta.',
      group: 'Energía',
    },
    {
      id: 'consumoElectrico',
      label: 'Consumo eléctrico (kWh/100km)',
      type: 'number',
      suffix: 'kWh',
      default: 16,
      min: 0,
      placeholder: '16',
      help: 'Kilovatios-hora cada 100 km del eléctrico (típico 14–20).',
      group: 'Energía',
    },
    {
      id: 'precioKwh',
      label: 'Precio del kWh',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '90',
      help: 'Precio del kWh eléctrico (mejor el de carga domiciliaria).',
      group: 'Energía',
    },
    {
      id: 'mantenimientoNaftaAnual',
      label: 'Mantenimiento nafta (anual)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '700000',
      help: 'Service anual del nafta (aceite, filtros, etc.).',
      group: 'Mantenimiento',
      groupIcon: '🔧',
    },
    {
      id: 'mantenimientoElectricoAnual',
      label: 'Mantenimiento eléctrico (anual)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '250000',
      help: 'Service anual del eléctrico (mucho menor: no tiene aceite ni embrague).',
      group: 'Mantenimiento',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-combustible-viaje-auto', label: 'Costo de combustible' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota del crédito' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `La sala compara el costo total de propiedad de las tres tecnologías a tus años de tenencia.

1. **Costo de energía anual.** Para el nafta: km/año ÷ 100 × consumo (L/100km) × precio del litro. Para el eléctrico: km/año ÷ 100 × consumo (kWh/100km) × precio del kWh. El híbrido se estima en ~60% del consumo del nafta.
2. **Costo total (TCO).** Precio de compra + (energía + mantenimiento) × años. El eléctrico arranca más caro pero suma mucho menos por año de uso.
3. **Veredicto.** Gana el menor costo total. Si las dos mejores quedan a menos de 5%, lo declaramos parejo y manda la autonomía y la carga.
4. **Punto de equilibrio.** Calcula a partir de qué año el eléctrico le gana a la nafta: divide su sobreprecio por el ahorro anual de uso. Cuantos más km hagas, antes conviene.
5. **Escenarios.** Muestra el costo de energía de cada uno, el año de equilibrio y el ahorro anual del eléctrico frente al nafta.`,
  faq: [
    {
      q: '¿A partir de cuántos kilómetros conviene un auto eléctrico?',
      a: 'Depende del sobreprecio frente al nafta y de la diferencia de costo por kilómetro. Cuantos más km hagas por año, más rápido el ahorro de energía y mantenimiento cubre el mayor precio de compra. La sala calcula el punto de equilibrio exacto en años para tu kilometraje.',
    },
    {
      q: '¿Por qué el eléctrico gasta tan poco en energía?',
      a: 'Porque un motor eléctrico es mucho más eficiente que uno a combustión: recorrer 100 km en eléctrico cuesta una fracción de lo que cuesta en nafta, sobre todo cargando en casa. A eso se suma que casi no tiene mantenimiento (no usa aceite, filtros ni embrague).',
    },
    {
      q: '¿El híbrido es el punto medio ideal?',
      a: 'Suele serlo para quien hace ciudad y no puede cargar un eléctrico: ahorra combustible sin depender de un enchufe ni preocuparse por la autonomía. Esta sala lo estima en ~60% del consumo del nafta; cargá el precio real del híbrido para verlo en tu caso.',
    },
    {
      q: '¿Conviene el eléctrico si no puedo cargar en casa?',
      a: 'Pierde buena parte de su ventaja. El bajo costo por km depende de la carga domiciliaria; si dependés de cargadores públicos, el precio del kWh sube y el ahorro se achica. Cargá el precio de kWh que realmente vas a pagar para que la cuenta sea honesta.',
    },
    {
      q: '¿Esto incluye la depreciación de cada auto?',
      a: 'No. La sala compara precio de compra, energía y mantenimiento. La depreciación es un costo adicional que varía mucho por tecnología y mercado. Para esa parte usá la sala "¿Me conviene comprar un auto nuevo o usado?".',
    },
    {
      q: '¿Qué pasa con la batería del eléctrico a largo plazo?',
      a: 'Las baterías se degradan con los años y los ciclos de carga, y reemplazarlas es caro, aunque la mayoría dura bien más allá de la garantía (8 años o 160.000 km es común). Si vas a tener el auto muchos años, tenelo en cuenta como un riesgo de costo futuro.',
    },
    {
      q: '¿La nafta puede convenir igual?',
      a: 'Sí, si hacés pocos kilómetros al año o vas a tener el auto poco tiempo: ahí el menor precio de compra pesa más que el ahorro de uso. La sala te dice exactamente cuándo, comparando el costo total de las tres opciones para tu caso.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa con supuestos que cargás vos. No incluye incentivos impositivos, depreciación ni el costo de reemplazo de batería. Para una compra grande, asesorate con un profesional de confianza.',
    },
  ],
  sources: [
    { name: 'Secretaría de Energía — Precios de combustibles', url: 'https://www.argentina.gob.ar/energia' },
    { name: 'ACARA — Mercado automotor', url: 'https://www.acara.org.ar/' },
  ],
};
