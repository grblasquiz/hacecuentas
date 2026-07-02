/**
 * Sala de decisión — "¿Me conviene construir o comprar terminado?"
 *
 * Patrón VIVIENDA / COMPARACIÓN A vs B. Construir = terreno + (m2 * costoM2) +
 * alquiler durante la obra + costo financiero de inmovilizar plata durante meses.
 * Comprar terminado = precio (ya con todo resuelto, sin esperar). Compara el
 * costo total de cada camino y el factor tiempo.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const precioTerminado = Math.max(0, num(inputs.precioTerminado));
  const valorTerreno = Math.max(0, num(inputs.valorTerreno));
  const metros2 = Math.max(0, num(inputs.metros2));
  const costoM2 = Math.max(0, num(inputs.costoM2Construccion));
  const mesesObra = Math.max(0, num(inputs.mesesObra));
  const alquilerDuranteObra = Math.max(0, num(inputs.alquilerDuranteObra));
  const costoFinancieroPct = Math.max(0, num(inputs.costoFinanciero));

  if (!precioTerminado || !metros2 || !costoM2) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el precio de comprar terminado, los metros a construir y el costo por m². Con eso comparamos construir contra comprar, sumando alquiler durante la obra y costo financiero.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Costo total más bajo' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio de comprar terminado** y el **valor del terreno** que ya tenés o necesitás.',
        'Indicá los **metros a construir**, el **costo por m²** y los **meses de obra**.',
      ],
    };
  }

  // — Construir —
  const costoConstruccion = metros2 * costoM2;
  const subtotalConstruir = valorTerreno + costoConstruccion;
  const alquilerTotal = alquilerDuranteObra * mesesObra;
  // Costo financiero: inmovilizás el grueso del capital durante la obra. Lo
  // aproximamos como el costo de oportunidad sobre el subtotal por los meses.
  const costoFinanciero = subtotalConstruir * (costoFinancieroPct / 100) * (mesesObra / 12);
  const costoTotalConstruir = subtotalConstruir + alquilerTotal + costoFinanciero;

  // — Comprar terminado —
  const costoTotalComprar = precioTerminado;

  const diff = costoTotalComprar - costoTotalConstruir; // + => construir más barato
  const ahorroM2Construir = metros2 > 0 ? (costoTotalConstruir / metros2) : 0;
  const costoM2Comprar = metros2 > 0 ? (precioTerminado / metros2) : 0;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  const base = Math.max(costoTotalConstruir, costoTotalComprar, 1);
  if (diff > base * 0.05) {
    status = 'a'; // A = construir
    tone = 'good';
    title = 'Construir sale más barato';
    badge = 'Construí';
    detail = `Construir te sale ${fmtMoney(Math.abs(diff))} menos que comprar terminado, incluso sumando ${fmtMoney(alquilerTotal)} de alquiler durante la obra y el costo financiero. Pero tardás ${mesesObra} meses y tenés que gestionar la obra.`;
  } else if (diff < -base * 0.05) {
    status = 'b'; // B = comprar terminado
    tone = 'good';
    title = 'Conviene comprar terminado';
    badge = 'Comprá hecho';
    detail = `Comprar terminado te sale ${fmtMoney(Math.abs(diff))} menos y entrás ya, sin ${mesesObra} meses de obra ni ${fmtMoney(alquilerTotal)} de alquiler en el medio. Construir no compensa el esfuerzo ni la espera.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decidí por el tiempo y las ganas';
    badge = 'Es parejo';
    detail = `Los costos totales están muy cerca (diferencia de ${fmtMoney(Math.abs(diff))}). Si querés algo a tu gusto y bancás ${mesesObra} meses de obra, construí; si querés entrar ya y sin líos, comprá terminado.`;
  }

  const scenarios = [
    {
      label: 'Construir',
      value: fmtMoney(costoTotalConstruir),
      detail: `Terreno + obra + ${fmtMoney(alquilerTotal)} de alquiler + costo financiero. ${mesesObra} meses.`,
    },
    {
      label: 'Comprar terminado',
      value: fmtMoney(costoTotalComprar),
      detail: 'Precio total, sin esperar y sin gestionar obra.',
    },
    {
      label: 'Si la obra se atrasa 50%',
      value: fmtMoney(
        subtotalConstruir +
          alquilerDuranteObra * mesesObra * 1.5 +
          subtotalConstruir * (costoFinancieroPct / 100) * ((mesesObra * 1.5) / 12),
      ),
      detail: 'Las obras se atrasan. Con 50% más de tiempo, ¿sigue conviniendo construir?',
    },
  ];

  const comparison = {
    columns: ['Construir', 'Comprar terminado'] as [string, string],
    rows: [
      {
        label: 'Terreno + construcción',
        a: fmtMoney(subtotalConstruir),
        b: fmtMoney(precioTerminado),
        hint: `Construcción: ${metros2} m² × ${fmtMoney(costoM2)}`,
      },
      {
        label: 'Alquiler durante la obra',
        a: '+' + fmtMoney(alquilerTotal),
        b: fmtMoney(0),
        hint: `${mesesObra} meses de espera`,
      },
      {
        label: 'Costo financiero (capital inmovilizado)',
        a: '+' + fmtMoney(costoFinanciero),
        b: fmtMoney(0),
      },
      {
        label: 'Costo total',
        a: fmtMoney(costoTotalConstruir),
        b: fmtMoney(costoTotalComprar),
      },
      {
        label: 'Costo por m²',
        a: fmtMoney(ahorroM2Construir),
        b: fmtMoney(costoM2Comprar),
      },
      {
        label: '¿Cuándo entrás?',
        a: `En ${mesesObra} meses`,
        b: 'Ya',
        hint: 'El factor tiempo no se mide en plata',
      },
    ],
  };

  const nextActions = [
    diff >= 0
      ? `Construir gana por **${fmtMoney(Math.abs(diff))}**, pero tardás **${mesesObra} meses**. Asegurate de tener el flujo de fondos para sostener la obra sin frenarla (frenarla la encarece).`
      : `Comprar terminado gana por **${fmtMoney(Math.abs(diff))}** y entrás ya. Antes de decidir, verificá que el precio de la propiedad terminada no esté inflado comparándolo con el costo de construir.`,
    'Mirá el escenario de **obra atrasada 50%**: las obras casi nunca terminan a tiempo. Si construir pierde ahí, comprar terminado es más seguro.',
    'Si construís, actualizá el **costo por m²** con regularidad: la inflación lo mueve y es el factor que más cambia el total. Usá la calculadora de costo de obra para detallarlo.',
    'Sumá lo intangible: construir da una casa a tu gusto pero te consume tiempo y energía; comprar terminado es inmediato pero te adaptás a lo que hay.',
  ];

  const notes = [
    'El costo de construir suma el terreno, la obra (m² × costo por m²), el alquiler que pagás mientras tanto y un costo financiero por inmovilizar capital durante la obra.',
    'El costo por m² es un valor de referencia; el costo real depende de la calidad de terminaciones, la zona y la inflación durante la obra. Construir bien puede pasarse del presupuesto.',
    'No incluye honorarios profesionales, permisos ni conexión de servicios al construir, ni los gastos de escrituración al comprar: súmalos para una comparación completa.',
    'No es asesoramiento financiero ni técnico. Es una estimación orientativa; pedí presupuestos reales y consultá a un arquitecto y un escribano matriculados.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: diff >= 0 ? 'Construir: ' + fmtMoney(costoTotalConstruir) : 'Comprar: ' + fmtMoney(costoTotalComprar),
      label: 'Costo total más bajo',
      sub: `Construir ${fmtMoney(costoTotalConstruir)} (en ${mesesObra} meses) vs comprar terminado ${fmtMoney(costoTotalComprar)} (ya).`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'construir-o-comprar-terminado',
  title: '¿Me conviene construir o comprar terminado? Comparador 2026',
  h1: '¿Me conviene construir o comprar terminado?',
  description:
    'Compará el costo total de construir (terreno + obra + alquiler durante la obra + costo financiero) contra comprar una propiedad terminada. Te decimos cuál sale más barato y cuánto pesa el tiempo de espera.',
  intro:
    'Construir parece más barato que comprar terminado, pero hay que sumar lo que no se ve: el terreno, los meses de alquiler mientras dura la obra y el costo de tener la plata inmovilizada. Esta sala compara el costo total de construir contra comprar algo hecho, te muestra el costo por m² de cada camino y te recuerda que las obras se atrasan, para que decidas con todos los números sobre la mesa.',
  icon: '🧱',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    precioTerminado: 110000000,
    valorTerreno: 30000000,
    metros2: 100,
    costoM2Construccion: 650000,
    mesesObra: 12,
    alquilerDuranteObra: 550000,
    costoFinanciero: 30,
  },
  fields: [
    {
      id: 'precioTerminado',
      label: 'Precio de comprar terminado',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '110000000',
      help: 'Lo que costaría una propiedad terminada equivalente a la que construirías.',
      group: 'Comprar',
      groupIcon: '🏠',
    },
    {
      id: 'valorTerreno',
      label: 'Valor del terreno',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '30000000',
      help: 'El valor del lote (si ya lo tenés, igual cuenta como capital aportado).',
      group: 'Construir',
      groupIcon: '🧱',
    },
    {
      id: 'metros2',
      label: 'Metros a construir',
      type: 'number',
      suffix: 'm²',
      required: true,
      min: 0,
      placeholder: '100',
      help: 'Superficie de la vivienda a construir.',
      group: 'Construir',
    },
    {
      id: 'costoM2Construccion',
      label: 'Costo por m² de construcción',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '650000',
      help: 'Costo total de construcción por m² (materiales + mano de obra), a valores de hoy.',
      group: 'Construir',
    },
    {
      id: 'mesesObra',
      label: 'Duración de la obra (meses)',
      type: 'number',
      recommended: true,
      default: 12,
      min: 0,
      placeholder: '12',
      help: 'Cuánto tardás en terminar. Durante ese tiempo pagás alquiler.',
      group: 'Construir',
    },
    {
      id: 'alquilerDuranteObra',
      label: 'Alquiler durante la obra',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '550000',
      profileKey: 'vivienda.alquilerMensual',
      help: 'Lo que pagás de alquiler por mes mientras dura la construcción.',
      group: 'Construir',
    },
    {
      id: 'costoFinanciero',
      label: 'Costo financiero anual',
      type: 'number',
      suffix: '%',
      default: 30,
      min: 0,
      placeholder: '30',
      advanced: true,
      help: 'Costo de oportunidad de tener el capital inmovilizado en la obra (lo que rendiría invertido).',
      group: 'Construir',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-costo-m2-construccion-argentina', label: 'Costo por m² de construcción' },
    { slug: 'calculadora-costo-total-comprar-propiedad-gastos', label: 'Costo total de comprar' },
    { slug: 'calculadora-hierro-construccion-losa-m2', label: 'Hierro para losa' },
    { slug: 'calculadora-alquiler-vs-comprar', label: 'Alquilar vs comprar' },
  ],
  howItWorks: `Esta sala compara el costo total de cada camino, no solo el precio cara a cara.

1. **Costo de construir.** Suma el valor del terreno y la construcción (metros por costo por m²), el alquiler que pagás durante los meses de obra y un costo financiero por tener el capital inmovilizado mientras construís.
2. **Costo de comprar terminado.** Es el precio de la propiedad ya hecha: entrás de inmediato, sin esperar ni gestionar nada.
3. **Comparación.** Pone ambos costos totales y el costo por m² de cada opción cara a cara.
4. **Escenario de atraso.** Como las obras se atrasan, muestra qué pasa si la construcción tarda 50% más: más alquiler, más costo financiero. Si construir sigue ganando ahí, la decisión es sólida.
5. **El factor tiempo.** Te recuerda que construir te hace esperar meses y gestionar la obra, mientras que comprar terminado es inmediato.`,
  faq: [
    {
      q: '¿Construir es más barato que comprar terminado?',
      a: 'Puede serlo, pero hay que sumar el terreno, el alquiler durante la obra y el costo de tener la plata inmovilizada. Cuando se cuentan todos esos costos, la diferencia con comprar terminado suele ser menor de lo que parece a primera vista.',
    },
    {
      q: '¿Por qué se suma el alquiler durante la obra?',
      a: 'Porque mientras construís tenés que vivir en algún lado, normalmente pagando alquiler. Esos meses de alquiler son un costo real de construir que comprar terminado no tiene, ya que entrás de inmediato.',
    },
    {
      q: '¿Qué es el costo financiero de construir?',
      a: 'Es el costo de oportunidad de tener tu capital inmovilizado en la obra en lugar de invertido. Durante los meses de construcción, esa plata podría estar rindiendo; al no hacerlo, hay un costo implícito que sumamos a la comparación.',
    },
    {
      q: '¿Cuánto se atrasan las obras?',
      a: 'Casi siempre algo. Por eso mostramos un escenario con la obra 50% más larga: más meses de alquiler y más costo financiero. Si construir sigue conviniendo en ese escenario, la decisión es robusta; si pierde, comprar terminado es más seguro.',
    },
    {
      q: '¿El costo por m² incluye todo?',
      a: 'Depende de cómo lo cargues. El costo total de construcción por m² suele incluir materiales y mano de obra, pero no honorarios profesionales, permisos ni conexión de servicios. Sumá esos extras para una comparación completa.',
    },
    {
      q: '¿Conviene construir si ya tengo el terreno?',
      a: 'Tener el terreno ayuda, pero igual cuenta como capital aportado en la comparación (vale plata que podrías usar de otra forma). Aun así, no pagar el terreno aparte suele inclinar la balanza hacia construir.',
    },
    {
      q: '¿Qué ventajas no económicas tiene cada opción?',
      a: 'Construir te da una vivienda a tu gusto y con materiales que elegís, pero consume tiempo y energía. Comprar terminado es inmediato y sin sorpresas de obra, pero te adaptás a lo que hay. Pesá eso además del número.',
    },
    {
      q: '¿Esto reemplaza el consejo de un profesional?',
      a: 'No. Es una estimación orientativa para decidir con números, no asesoramiento financiero ni técnico. Pedí presupuestos reales de obra y tasaciones, y consultá a un arquitecto y un escribano matriculados.',
    },
  ],
  sources: [
    { name: 'INDEC — Índice del costo de la construcción', url: 'https://www.indec.gob.ar/' },
    { name: 'Cámara Argentina de la Construcción (CAC)', url: 'https://www.camarco.org.ar/' },
  ],
};
