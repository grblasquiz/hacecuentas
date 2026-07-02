/**
 * Sala de decisión — "¿Cuánto va a costar terminar mi obra?"
 *
 * Patrón VIVIENDA / BREAKDOWN. Proyecta el costo de lo que falta de una obra:
 *   costoRestante = m2 * costoM2 * (1 - avance/100) * (1+desperdicio) * (1+contingencia)
 * y lo ajusta por inflación a lo largo de los meses que falten. Devuelve el total
 * para terminar y el desembolso mensual estimado.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const metros2 = Math.max(0, num(inputs.metros2));
  const costoM2 = Math.max(0, num(inputs.costoM2));
  const avancePct = Math.max(0, Math.min(100, num(inputs.porcentajeAvanzado)));
  const desperdicioPct = Math.max(0, num(inputs.desperdicio));
  const inflacionMensual = Math.max(0, num(inputs.inflacionMensual));
  const meses = Math.max(0, num(inputs.mesesEstimados));
  const contingenciaPct = Math.max(0, num(inputs.contingencia));

  if (!metros2 || !costoM2) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá los metros cuadrados de la obra y el costo por m² actualizado. Con eso estimamos cuánto falta para terminar, con desperdicio, contingencia e inflación.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Costo para terminar' },
      scenarios: [],
      nextActions: [
        'Cargá los **metros cuadrados** de tu obra y el **costo por m²** actualizado.',
        'Indicá el **porcentaje avanzado** y los **meses** que falten para terminar.',
      ],
    };
  }

  // Costo base de lo que FALTA, con desperdicio y contingencia.
  const restanteFactor = 1 - avancePct / 100;
  const costoBaseRestante =
    metros2 * costoM2 * restanteFactor * (1 + desperdicioPct / 100) * (1 + contingenciaPct / 100);

  // Ajuste por inflación: el gasto se hace gradualmente, así que aplicamos la
  // inflación al gasto promedio en la mitad del período (aproximación estándar).
  const factorInflacionMedio = Math.pow(1 + inflacionMensual / 100, meses / 2);
  const costoRestante = costoBaseRestante * factorInflacionMedio;

  // Sin ajuste por inflación (referencia "a pesos de hoy").
  const costoHoy = costoBaseRestante;
  const impactoInflacion = costoRestante - costoHoy;

  // Desembolso mensual estimado para terminar en los meses indicados.
  const desembolsoMensual = meses > 0 ? costoRestante / meses : costoRestante;

  // Costo total de la obra completa (referencia).
  const costoTotalObra =
    metros2 * costoM2 * (1 + desperdicioPct / 100) * (1 + contingenciaPct / 100);

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;

  // Semáforo por impacto inflacionario sobre lo que falta.
  const impactoPct = costoHoy > 0 ? (impactoInflacion / costoHoy) * 100 : 0;
  if (impactoPct <= 8) {
    status = 'b';
    tone = 'good';
    title = 'La obra es manejable: poco impacto inflacionario';
    badge = 'Manejable';
  } else if (impactoPct <= 20) {
    status = 'tie';
    tone = 'neutral';
    title = 'Ojo con el ritmo: la inflación encarece la obra';
    badge = 'Cuidado';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Atención: estirar la obra la encarece mucho';
    badge = 'Riesgo inflación';
  }
  const detail = `Te falta el ${(100 - avancePct).toFixed(0)}% de la obra. Terminarla cuesta ${fmtMoney(costoRestante)} a precios proyectados, de los cuales ${fmtMoney(impactoInflacion)} (${fmtPct(impactoPct)}) son por la inflación de estirarla ${meses} meses. Necesitás unos ${fmtMoney(desembolsoMensual)}/mes.`;

  const scenarios = [
    {
      label: 'Si la terminás ya (hoy)',
      value: fmtMoney(costoHoy),
      detail: 'Costo de lo que falta a precios de hoy, sin ajuste por inflación.',
    },
    {
      label: `En ${meses} meses (proyectado)`,
      value: fmtMoney(costoRestante),
      detail: `Ajustado por inflación de ${fmtPct(inflacionMensual)} mensual.`,
    },
    {
      label: 'Si se estira al doble',
      value: fmtMoney(costoBaseRestante * Math.pow(1 + inflacionMensual / 100, meses)),
      detail: 'Cuánto más cara sale si la obra tarda el doble de lo previsto.',
    },
  ];

  const breakdown = [
    { label: 'Superficie total', value: `${metros2} m²`, hint: `Costo de referencia: ${fmtMoney(costoM2)}/m²` },
    { label: 'Avance actual', value: `${avancePct.toFixed(0)}%`, hint: `Falta el ${(100 - avancePct).toFixed(0)}%` },
    { label: 'Costo base de lo que falta', value: fmtMoney(metros2 * costoM2 * restanteFactor) },
    { label: `+ Desperdicio (${fmtPct(desperdicioPct)})`, value: fmtMoney(metros2 * costoM2 * restanteFactor * (desperdicioPct / 100)) },
    { label: `+ Contingencia (${fmtPct(contingenciaPct)})`, value: fmtMoney(metros2 * costoM2 * restanteFactor * (1 + desperdicioPct / 100) * (contingenciaPct / 100)) },
    { label: `+ Inflación (${meses} meses a ${fmtPct(inflacionMensual)})`, value: fmtMoney(impactoInflacion) },
    { label: 'Costo total para terminar', value: fmtMoney(costoRestante), hint: `Obra completa: ${fmtMoney(costoTotalObra)}` },
    { label: 'Desembolso mensual estimado', value: fmtMoney(desembolsoMensual) + '/mes' },
  ];

  const nextActions = [
    `Reservá unos **${fmtMoney(desembolsoMensual)}/mes** para terminar en ${meses} meses. Si no tenés ese flujo, la obra se estira y se encarece por inflación.`,
    impactoPct > 12
      ? `Estirar la obra te cuesta caro: cada mes de demora suma inflación. Si podés, **comprá materiales clave por adelantado** para fijar precios.`
      : 'Comprar los materiales más sensibles a la inflación por adelantado ayuda a fijar el costo, sobre todo si la obra se demora.',
    `Pediste ${fmtPct(contingenciaPct)} de contingencia: mantené ese fondo aparte y no lo gastes salvo imprevisto real. Las obras siempre sorprenden.`,
    'Actualizá el **costo por m²** cada par de meses: es el dato que más mueve el total y cambia rápido. No uses el de cuando arrancaste.',
  ];

  const notes = [
    'El costo se calcula sobre la parte de la obra que falta, con desperdicio de materiales y un fondo de contingencia, ajustado por inflación a lo largo de los meses estimados.',
    'La inflación se aplica al gasto promedio (mitad del período): es una aproximación, ya que el gasto real se distribuye en el tiempo.',
    'El costo por m² es un valor de referencia (tipo CAC/INDEC): variá según calidad de terminaciones, zona y tipo de obra. Pedí presupuestos reales.',
    'No es asesoramiento financiero ni técnico. Es una estimación orientativa para presupuestar; consultá a tu arquitecto o constructor para un cómputo preciso.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(costoRestante),
      label: 'Costo para terminar la obra',
      sub: `Falta el ${(100 - avancePct).toFixed(0)}%. A pesos de hoy: ${fmtMoney(costoHoy)}; la inflación de ${meses} meses suma ${fmtMoney(impactoInflacion)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cuesta-terminar-mi-obra',
  title: '¿Cuánto va a costar terminar mi obra? Estimador 2026',
  h1: '¿Cuánto va a costar terminar mi obra?',
  description:
    'Estimá cuánto falta para terminar tu obra: costo por m² de lo pendiente, con desperdicio, contingencia e inflación por los meses que falten. Te damos el total y el desembolso mensual.',
  intro:
    'Una obra a medias es un agujero negro: nunca sabés cuánto falta de verdad. Esta sala estima el costo de lo que queda según los metros cuadrados, el costo por m² actualizado y el porcentaje avanzado, le suma el desperdicio de materiales y un fondo de contingencia, y lo ajusta por inflación a lo largo de los meses que falten. El resultado: cuánto necesitás para terminar y cuánto por mes.',
  icon: '🏗️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    metros2: 90,
    costoM2: 650000,
    porcentajeAvanzado: 60,
    desperdicio: 10,
    inflacionMensual: 2.5,
    mesesEstimados: 8,
    contingencia: 10,
  },
  fields: [
    {
      id: 'metros2',
      label: 'Metros cuadrados',
      type: 'number',
      suffix: 'm²',
      required: true,
      min: 0,
      placeholder: '90',
      help: 'Superficie total de la obra.',
      group: 'La obra',
      groupIcon: '🏗️',
    },
    {
      id: 'costoM2',
      label: 'Costo por m² (actualizado)',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '650000',
      help: 'Costo de construcción por m² a valores de hoy (tipo CAC/INDEC para tu calidad de obra).',
      group: 'La obra',
    },
    {
      id: 'porcentajeAvanzado',
      label: 'Porcentaje ya avanzado',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      max: 100,
      placeholder: '60',
      help: 'Cuánto de la obra ya está hecho. El cálculo es sobre lo que falta.',
      group: 'La obra',
    },
    {
      id: 'desperdicio',
      label: 'Desperdicio de materiales',
      type: 'number',
      suffix: '%',
      default: 10,
      min: 0,
      placeholder: '10',
      help: 'Material que se pierde en cortes, roturas y sobrantes. ~10% es típico.',
      group: 'Ajustes',
      groupIcon: '⚙️',
    },
    {
      id: 'contingencia',
      label: 'Contingencia (imprevistos)',
      type: 'number',
      suffix: '%',
      default: 10,
      min: 0,
      placeholder: '10',
      help: 'Fondo para lo inesperado. ~10% es prudente; en obras viejas, más.',
      group: 'Ajustes',
    },
    {
      id: 'mesesEstimados',
      label: 'Meses para terminar',
      type: 'number',
      recommended: true,
      default: 6,
      min: 0,
      placeholder: '8',
      help: 'En cuántos meses pensás terminar. Cuanto más se estira, más pesa la inflación.',
      group: 'Ajustes',
    },
    {
      id: 'inflacionMensual',
      label: 'Inflación mensual esperada',
      type: 'number',
      suffix: '%',
      recommended: true,
      default: 2.5,
      min: 0,
      placeholder: '2.5',
      help: 'Cuánto suben los materiales y la mano de obra por mes.',
      group: 'Ajustes',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-costo-m2-construccion-argentina', label: 'Costo por m² de construcción' },
    { slug: 'calculadora-hierro-construccion-losa-m2', label: 'Hierro para losa' },
    { slug: 'calculadora-paritaria-uocra-construccion-2026-categoria', label: 'Paritaria UOCRA' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `Esta sala proyecta el costo de lo que falta, no el de la obra entera.

1. **Lo que falta.** Toma los metros cuadrados por el costo por m² y lo multiplica por el porcentaje pendiente. Esa es la base de lo que queda por gastar.
2. **Desperdicio.** Suma el material que se pierde en cortes, roturas y sobrantes (alrededor del 10%).
3. **Contingencia.** Agrega un fondo para imprevistos, porque las obras siempre sorprenden, sobre todo las viejas.
4. **Inflación.** Ajusta el gasto por la inflación mensual esperada a lo largo de los meses que falten. Cuanto más se estira la obra, más caro sale: por eso mostramos qué pasa si tarda el doble.
5. **Desembolso mensual.** Divide el total por los meses para decirte cuánta plata por mes necesitás reservar para no frenar la obra.`,
  faq: [
    {
      q: '¿Cómo se calcula lo que falta de una obra?',
      a: 'Se toma el costo total estimado (metros cuadrados por costo por m²) y se multiplica por el porcentaje que falta. A eso se le suma el desperdicio de materiales, un fondo de contingencia y el ajuste por inflación de los meses que falten.',
    },
    {
      q: '¿Por qué estirar la obra la encarece?',
      a: 'Porque los materiales y la mano de obra suben con la inflación. Cada mes que la obra se demora, lo que falta cuesta un poco más. Por eso conviene terminar al ritmo más rápido que tu flujo de fondos permita.',
    },
    {
      q: '¿Qué porcentaje de desperdicio uso?',
      a: 'Alrededor del 10% es típico para una obra estándar: es el material que se pierde en cortes, roturas y sobrantes. En obras complejas o con terminaciones especiales puede ser mayor.',
    },
    {
      q: '¿Para qué sirve la contingencia?',
      a: 'Es un fondo para imprevistos: una cañería que aparece, un muro que estaba peor de lo esperado, un cambio de material. Un 10% es prudente; en remodelaciones de construcciones viejas conviene reservar más.',
    },
    {
      q: '¿Cómo consigo el costo por m² actualizado?',
      a: 'Usá índices de referencia como el de la Cámara Argentina de la Construcción (CAC) o el INDEC, ajustados a la calidad de tu obra. Actualizalo cada par de meses: es el dato que más mueve el total y cambia rápido.',
    },
    {
      q: '¿Conviene comprar materiales por adelantado?',
      a: 'Si hay inflación alta y la obra se va a estirar, comprar los materiales clave por adelantado fija su precio y te protege de los aumentos. El riesgo es inmovilizar plata y el almacenamiento, así que priorizá los más sensibles.',
    },
    {
      q: '¿El cálculo incluye la mano de obra?',
      a: 'Sí, si el costo por m² que cargás es el costo total de construcción (materiales más mano de obra), que es lo habitual en los índices de referencia. Si solo cargaste materiales, sumá la mano de obra aparte.',
    },
    {
      q: '¿Esto reemplaza el cómputo de un arquitecto?',
      a: 'No. Es una estimación orientativa para presupuestar y planificar el flujo de fondos, no un cómputo y presupuesto profesional. Para precisión, consultá a tu arquitecto o constructor.',
    },
  ],
  sources: [
    { name: 'INDEC — Índice del costo de la construcción', url: 'https://www.indec.gob.ar/' },
    { name: 'Cámara Argentina de la Construcción (CAC)', url: 'https://www.camarco.org.ar/' },
  ],
};
