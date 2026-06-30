/**
 * Sala de decisión — "¿Me conviene refaccionar o mudarme?"
 *
 * Patrón VIVIENDA / COMPARACIÓN A vs B. Refaccionar tiene un costo (obra +
 * sobrecosto típico de toda obra) pero suma valor a tu propiedad. Mudarte tiene
 * costo de mudanza más una diferencia de precio/alquiler por una vivienda mejor.
 * Compara el COSTO NETO de cada camino (refaccionar descuenta el valor agregado).
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const costoObra = Math.max(0, num(inputs.costoObra));
  const sobrecostoPct = Math.max(0, num(inputs.sobrecostoEstimado));
  const mesesObra = Math.max(0, num(inputs.mesesObra));
  const aumentoValor = Math.max(0, num(inputs.aumentoValorPropiedad));
  const costoMudanza = Math.max(0, num(inputs.costoMudanza));
  const diferenciaPrecio = Math.max(0, num(inputs.diferenciaAlquilerOPropiedad));

  if (!costoObra && !diferenciaPrecio) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el costo de la obra para refaccionar y la diferencia de precio para mudarte a algo mejor. Con eso comparamos el costo neto de cada camino.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Costo neto más bajo' },
      scenarios: [],
      nextActions: [
        'Cargá el **costo de la obra** que necesitás para refaccionar tu vivienda actual.',
        'Cargá la **diferencia de precio o alquiler** para mudarte a una vivienda equivalente a la refaccionada.',
      ],
    };
  }

  // — Refaccionar —
  const costoObraTotal = costoObra * (1 + sobrecostoPct / 100);
  // El valor que la obra agrega a tu propiedad recupera parte del gasto.
  const costoNetoRefaccionar = Math.max(0, costoObraTotal - aumentoValor);

  // — Mudarse —
  const costoNetoMudarse = costoMudanza + diferenciaPrecio;

  const diff = costoNetoMudarse - costoNetoRefaccionar; // + => refaccionar más barato

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  const base = Math.max(costoNetoRefaccionar, costoNetoMudarse, 1);
  if (diff > base * 0.05) {
    status = 'a'; // A = refaccionar
    tone = 'good';
    title = 'Conviene refaccionar';
    badge = 'Refaccioná';
    detail = `Refaccionar te sale ${fmtMoney(Math.abs(diff))} menos a costo neto. La obra cuesta ${fmtMoney(costoObraTotal)} (con sobrecosto), pero suma ${fmtMoney(aumentoValor)} de valor a tu propiedad, así que el costo real es ${fmtMoney(costoNetoRefaccionar)}.`;
  } else if (diff < -base * 0.05) {
    status = 'b'; // B = mudarse
    tone = 'good';
    title = 'Conviene mudarte';
    badge = 'Mudate';
    detail = `Mudarte te sale ${fmtMoney(Math.abs(diff))} menos a costo neto. La obra para dejar tu casa como querés (${fmtMoney(costoNetoRefaccionar)} netos) supera lo que te cuesta mudarte a algo equivalente (${fmtMoney(costoNetoMudarse)}).`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decidí por las molestias';
    badge = 'Es parejo';
    detail = `Los costos netos están muy cerca (diferencia de ${fmtMoney(Math.abs(diff))}). Decidí por lo que no es plata: refaccionar son ${mesesObra} meses de obra y desorden; mudarte es empezar de cero en otro lado. Elegí según tu cabeza.`;
  }

  const scenarios = [
    {
      label: 'Refaccionar',
      value: fmtMoney(costoNetoRefaccionar),
      detail: `Obra ${fmtMoney(costoObraTotal)} − ${fmtMoney(aumentoValor)} de valor agregado.`,
    },
    {
      label: 'Mudarse',
      value: fmtMoney(costoNetoMudarse),
      detail: `Mudanza ${fmtMoney(costoMudanza)} + diferencia de precio ${fmtMoney(diferenciaPrecio)}.`,
    },
    {
      label: 'Si la obra se pasa 30%',
      value: fmtMoney(Math.max(0, costoObra * 1.3 - aumentoValor)),
      detail: 'Escenario realista: las obras suelen pasarse del presupuesto. ¿Sigue conviniendo?',
    },
  ];

  const comparison = {
    columns: ['Refaccionar', 'Mudarme'] as [string, string],
    rows: [
      {
        label: 'Costo directo',
        a: fmtMoney(costoObraTotal),
        b: fmtMoney(costoNetoMudarse),
        hint: `Obra con ${fmtPct(sobrecostoPct)} de sobrecosto vs mudanza + diferencia`,
      },
      {
        label: 'Valor que recuperás',
        a: '+' + fmtMoney(aumentoValor),
        b: fmtMoney(0),
        hint: 'La obra revaloriza tu propiedad',
      },
      {
        label: 'Costo neto real',
        a: fmtMoney(costoNetoRefaccionar),
        b: fmtMoney(costoNetoMudarse),
      },
      {
        label: 'Molestia / tiempo',
        a: `${mesesObra} meses de obra`,
        b: 'Mudanza + adaptación',
        hint: 'Lo que no se mide en plata',
      },
    ],
  };

  const nextActions = [
    diff >= 0
      ? `Refaccionar gana por **${fmtMoney(Math.abs(diff))}** a costo neto. Pedí **3 presupuestos** de obra y elegí con un contrato cerrado para acotar el sobrecosto.`
      : `Mudarte gana por **${fmtMoney(Math.abs(diff))}** a costo neto. Antes de decidir, confirmá la diferencia de precio real visitando propiedades equivalentes a la que tendrías refaccionada.`,
    `Presupuestá la obra con margen: cargaste ${fmtPct(sobrecostoPct)} de sobrecosto, pero las obras suelen pasarse más. Mirá el escenario de +30% antes de decidir.`,
    'Verificá que el **valor agregado** sea real: no toda reforma se recupera al vender. La cocina y el baño suelen rendir; los gustos muy personales, menos.',
    `Pesá la **molestia**: ${mesesObra} meses de obra con la casa patas para arriba tienen un costo en calidad de vida que no aparece en los números.`,
  ];

  const notes = [
    'El costo de refaccionar descuenta el valor que la obra agrega a tu propiedad: solo cuenta el gasto que NO recuperás. No toda reforma se recupera por igual.',
    'El sobrecosto estimado intenta capturar que las obras casi siempre se pasan del presupuesto inicial. Aun así, conviene mirar el escenario más pesimista.',
    'No incluye los costos de operación de mudarte de propiedad (escritura, comisión) si fuera una compra: para eso usá la sala de costo de comprar.',
    'No es asesoramiento financiero ni inmobiliario. Es una estimación orientativa; pedí presupuestos reales y consultá a un profesional matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: diff >= 0 ? 'Refaccionar: ' + fmtMoney(costoNetoRefaccionar) : 'Mudarme: ' + fmtMoney(costoNetoMudarse),
      label: 'Costo neto más bajo',
      sub: `Refaccionar ${fmtMoney(costoNetoRefaccionar)} (obra − valor agregado) vs mudarte ${fmtMoney(costoNetoMudarse)} (mudanza + diferencia).`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'refaccionar-o-mudarme',
  title: '¿Me conviene refaccionar o mudarme? Comparador 2026',
  h1: '¿Me conviene refaccionar o mudarme?',
  description:
    'Compará el costo neto de refaccionar tu vivienda (obra + sobrecosto − valor agregado) contra mudarte a algo mejor (mudanza + diferencia de precio). Te decimos cuál sale mejor económicamente.',
  intro:
    'Tu casa te quedó chica o vieja: ¿la refaccionás o te mudás a algo mejor? Refaccionar cuesta la obra (que casi siempre se pasa del presupuesto) pero suma valor a tu propiedad. Mudarte cuesta la mudanza más la diferencia de precio por algo equivalente a lo refaccionado. Esta sala compara el costo NETO de cada camino para decirte cuál sale mejor económicamente, y te recuerda pesar las molestias.',
  icon: '🔨',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    costoObra: 18000000,
    sobrecostoEstimado: 20,
    mesesObra: 4,
    aumentoValorPropiedad: 12000000,
    costoMudanza: 500000,
    diferenciaAlquilerOPropiedad: 15000000,
  },
  fields: [
    {
      id: 'costoObra',
      label: 'Costo de la obra',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '18000000',
      help: 'Presupuesto de la refacción que necesitás (materiales + mano de obra).',
      group: 'Refaccionar',
      groupIcon: '🔨',
    },
    {
      id: 'sobrecostoEstimado',
      label: 'Sobrecosto estimado',
      type: 'number',
      suffix: '%',
      recommended: true,
      default: 20,
      min: 0,
      placeholder: '20',
      help: 'Las obras casi siempre se pasan del presupuesto. Un 15-25% es prudente.',
      group: 'Refaccionar',
    },
    {
      id: 'mesesObra',
      label: 'Duración de la obra (meses)',
      type: 'number',
      default: 0,
      min: 0,
      placeholder: '4',
      help: 'Cuánto tiempo viviste con la obra encima (afecta tu calidad de vida).',
      group: 'Refaccionar',
    },
    {
      id: 'aumentoValorPropiedad',
      label: 'Valor que suma a tu propiedad',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '12000000',
      help: 'Cuánto más valdría tu propiedad después de la obra. Es lo que recuperás al vender.',
      group: 'Refaccionar',
    },
    {
      id: 'costoMudanza',
      label: 'Costo de la mudanza',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '500000',
      help: 'Flete y traslado si te mudás.',
      group: 'Mudarme',
      groupIcon: '📦',
    },
    {
      id: 'diferenciaAlquilerOPropiedad',
      label: 'Diferencia de precio al mudarte',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '15000000',
      help: 'Cuánto más caro es comprar (o, anualizado, alquilar) algo equivalente a tu casa ya refaccionada.',
      group: 'Mudarme',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'costo-m2-construccion', label: 'Costo por m² de construcción' },
    { slug: 'calculadora-costo-total-comprar-propiedad-gastos', label: 'Costo total de comprar' },
    { slug: 'alquiler-vs-comprar', label: 'Alquilar vs comprar' },
    { slug: 'calculadora-rentabilidad-alquiler-cap-rate', label: 'Rentabilidad de alquiler' },
  ],
  howItWorks: `Esta sala compara el costo real de cada camino, no el costo a secas.

1. **Costo de refaccionar.** Toma el presupuesto de la obra y le suma un sobrecosto (porque las obras casi siempre se pasan), pero le RESTA el valor que la reforma agrega a tu propiedad. Ese valor lo recuperás al vender, así que el costo real es lo que no recuperás.
2. **Costo de mudarte.** Suma la mudanza más la diferencia de precio por mudarte a una vivienda equivalente a la que tendrías ya refaccionada.
3. **Comparación de costos netos.** Pone ambos números cara a cara para ver cuál sale más barato.
4. **Escenario pesimista.** Como las obras se pasan, muestra qué pasa si la obra termina costando 30% más. Si refaccionar sigue ganando ahí, la decisión es sólida.
5. **Lo intangible.** Te recuerda pesar los meses de obra y la molestia de mudarte, que no se miden en plata pero pesan.`,
  faq: [
    {
      q: '¿Refaccionar suma valor a mi propiedad?',
      a: 'Sí, pero no todo lo que gastás se recupera. Reformas de cocina, baño y mejoras estructurales suelen revalorizar bien; los gustos muy personales o el exceso de lujo, menos. Esta sala descuenta el valor agregado real para mostrarte el costo neto.',
    },
    {
      q: '¿Por qué se suma un sobrecosto a la obra?',
      a: 'Porque las obras casi siempre terminan costando más que el presupuesto inicial: imprevistos, cambios sobre la marcha, aumento de materiales. Cargar un 15-25% de sobrecosto es prudente, y conviene también mirar el escenario de +30%.',
    },
    {
      q: '¿Qué es el costo neto de refaccionar?',
      a: 'Es lo que gastás en la obra (con sobrecosto) menos el valor que esa obra agrega a tu propiedad. Solo cuenta la plata que no recuperás. Por eso una reforma que revaloriza mucho puede tener un costo neto bajo aunque la obra sea cara.',
    },
    {
      q: '¿Cómo estimo la diferencia de precio al mudarme?',
      a: 'Mirá cuánto cuesta una propiedad equivalente a la que tendrías ya refaccionada y restale lo que vale tu propiedad hoy. Esa diferencia es lo que pagás de más por mudarte en lugar de mejorar lo que tenés.',
    },
    {
      q: '¿Y si la obra se pasa del presupuesto?',
      a: 'Es lo más probable. Por eso mostramos un escenario con la obra 30% más cara. Si refaccionar sigue conviniendo ahí, la decisión es robusta; si en ese escenario pierde, mudarte es la opción más segura.',
    },
    {
      q: '¿Cuánto pesa la molestia de la obra?',
      a: 'No se mide en plata, pero vivir meses con la casa en obra tiene un costo en calidad de vida. Si la obra es larga, ese factor puede inclinar la balanza hacia mudarte aunque sea un poco más caro.',
    },
    {
      q: '¿Conviene mudarme si mi casa necesita mucha obra?',
      a: 'Suele convenir cuando la obra es muy grande respecto al valor de la propiedad, o cuando lo que gastarías no se recupera al vender. Si la reforma es puntual y revaloriza, refaccionar gana casi siempre.',
    },
    {
      q: '¿Esto reemplaza el consejo de un profesional?',
      a: 'No. Es una estimación orientativa para decidir con números, no asesoramiento financiero ni inmobiliario. Pedí presupuestos reales de obra y tasaciones, y consultá a un profesional matriculado.',
    },
  ],
  sources: [
    { name: 'Costo de construcción por m² (CAC / INDEC)', url: 'https://www.indec.gob.ar/' },
  ],
};
