import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto peso tengo que subir en el embarazo, y cuánto
 * comer?" Arquetipo RAMIFICADO: la rama es la ETAPA (trimestre, gemelar,
 * lactancia, posparto), que cambia tanto el rango de kilos como las calorías.
 *
 * Absorbe 7 URLs (ver hub.replaces).
 *
 * DIFERENCIA con los hubs de /embarazo — no se pisan:
 *   · /embarazo/semanas-embarazo → en qué semana estás y qué mide el bebé
 *   · /embarazo/fecha-de-parto   → cuándo nace
 *   · /embarazo/dias-fertiles    → antes del embarazo
 *   · /salud/peso-ideal-imc      → IMC fuera del embarazo
 *   Ninguno calcula kilos a ganar ni calorías del embarazo o la lactancia.
 *
 * NÚMEROS: rangos de ganancia de peso del IOM 2009 (adoptados por la OMS y por
 * el Ministerio de Salud argentino), espejo de src/lib/formulas/peso-embarazo.ts.
 * Calorías: Mifflin-St Jeor + extras ACOG por trimestre (+0 / +340 / +450) y
 * extras de lactancia (500 exclusiva / 300 mixta / 150 parcial), espejo de
 * calorias-embarazo-trimestre.ts y calorias-lactancia.ts.
 *
 * YMYL DE SALUD: aviso textual del dominio `health` de src/lib/disclaimers.ts
 * en `fineprint` y como PRIMER `warn` de cada rama.
 *
 * NOTAS DE CONTRATO: acá no hay plata. TODA fila lleva `format` explícito.
 */

export const DISCLAIMER =
  'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.';

export const hub: HubData = {
  slug: 'salud/peso-en-el-embarazo',
  title: '¿Cuánto peso tengo que subir en el embarazo? Kilos por semana y calorías por trimestre',
  description:
    'Tu rango de aumento de peso según el IMC previo al embarazo (IOM 2009), cuánto deberías haber subido a la semana en la que estás, las calorías extra de cada trimestre y de la lactancia, y el plazo realista para volver al peso de antes.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación del embarazo',
  h1: '¿Cuánto peso tengo que subir en el embarazo?',
  lede:
    'No es un número igual para todas: el rango lo define tu IMC antes de quedar embarazada, y lo que te toca hoy depende de la semana. Partimos del segundo trimestre, que es cuando aparece la pregunta. Si estás en otra etapa —gemelar, dando la teta o ya en el posparto— la cambiás abajo.',
  stamps: [
    'Rangos IOM 2009 · OMS',
    'Calorías extra ACOG por trimestre',
    '7 calculadoras adentro',
  ],

  resultLabel: 'Aumento total recomendado',

  cases: {
    title: '¿En qué etapa estás?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 't2',
        label: 'Segundo trimestre',
        hint: 'Semanas 14 a 27',
        answer: 'Con IMC previo normal corresponde ganar entre 11,5 y 16 kg en todo el embarazo.',
        yes: [
          'Rango total de kilos según tu IMC previo (IOM 2009)',
          'Cuánto deberías pesar a la semana en la que estás',
          'Calorías del día con el extra de +340 kcal del segundo trimestre (ACOG)',
        ],
        warn: [
          DISCLAIMER,
          'El aumento de peso lo controla tu obstetra en cada consulta: un desvío del rango se evalúa, no se corrige por cuenta propia',
          'En el embarazo no se hacen dietas de descenso, ni siquiera con sobrepeso previo: se ajusta la calidad, no se restringe la energía',
        ],
        plazo: 'del segundo trimestre en adelante el ritmo esperable es de 0,3 a 0,5 kg por semana.',
      },
      {
        id: 't1',
        label: 'Primer trimestre',
        hint: 'Semanas 1 a 13',
        answer: 'En el primer trimestre se sube poco: alrededor de 1 a 2 kg en total.',
        yes: [
          'El aumento esperable del trimestre entero es de 0,5 a 2 kg',
          'Todavía no hay calorías extra: el requerimiento es el mismo de antes (ACOG)',
          'Con náuseas y vómitos es normal no subir nada, o incluso bajar un poco',
        ],
        warn: [
          DISCLAIMER,
          'Los vómitos incoercibles con pérdida de peso (hiperémesis) son motivo de consulta, no algo para aguantar',
          'El ácido fólico se indica idealmente desde antes de la concepción y durante todo el primer trimestre',
        ],
        plazo: 'la primera ecografía y el control inicial se hacen dentro de las primeras 12 semanas.',
      },
      {
        id: 't3',
        label: 'Tercer trimestre',
        hint: 'Semana 28 en adelante',
        answer: 'En el tercer trimestre se suman +450 kcal por día sobre el gasto previo.',
        yes: [
          'El extra calórico sube a +450 kcal por día (ACOG)',
          'El ritmo semanal se mantiene, pero el total acumulado es el que más se mira',
          'Buena parte del aumento de esta etapa es el crecimiento del bebé y el líquido amniótico',
        ],
        warn: [
          DISCLAIMER,
          'Un salto brusco de peso con hinchazón de manos y cara, dolor de cabeza o visión borrosa es señal de alarma de preeclampsia: consulta inmediata',
          'El reflujo y la saciedad temprana de esta etapa se manejan con comidas más chicas y frecuentes, no comiendo menos en total',
        ],
        plazo: 'los controles pasan a ser quincenales y después semanales cerca del término.',
      },
      {
        id: 'gemelar',
        label: 'Embarazo gemelar',
        hint: 'Rango ampliado',
        answer: 'En un embarazo gemelar el rango de aumento sube unos 5 a 10 kg.',
        yes: [
          'Al rango que te corresponde por IMC se le suman 5 kg al piso y 10 kg al techo',
          'Con IMC previo normal el objetivo habitual queda en 16,5 a 24,5 kg',
          'El requerimiento calórico también es mayor que en un embarazo único',
        ],
        warn: [
          DISCLAIMER,
          'El embarazo múltiple es de alto riesgo por definición: el seguimiento es más frecuente y el rango de peso lo ajusta el equipo tratante',
          'El parto pretérmino es mucho más probable: el plan de control lo define tu obstetra, no una tabla',
        ],
        plazo: 'el rango gemelar del IOM está definido con menos evidencia que el de embarazo único.',
      },
      {
        id: 'lactancia',
        label: 'Estoy amamantando',
        hint: 'Calorías extra por la teta',
        answer: 'La lactancia exclusiva suma unas 500 kcal por día.',
        yes: [
          'Extra calórico: +500 kcal en lactancia exclusiva, +300 mixta, +150 parcial',
          'Hidratación: 2,5 a 3 litros por día con lactancia exclusiva',
          'Un vaso de agua en cada toma es la regla práctica más simple',
        ],
        warn: [
          DISCLAIMER,
          'No bajes de 1.800 kcal por día mientras amamantás: un déficit agresivo hace caer la producción de leche',
          'Si querés bajar de peso amamantando, el déficit máximo razonable es de 300 a 500 kcal',
        ],
        plazo: 'la producción se estabiliza recién alrededor de la sexta semana.',
      },
      {
        id: 'posparto',
        label: 'Ya nació: quiero volver a mi peso',
        hint: 'Plazo realista',
        answer: 'Un ritmo seguro es de 0,5 kg por semana, sin bajar de 1.800 kcal si amamantás.',
        yes: [
          'Cuántos kilos te separan de tu peso previo y cuántas semanas son a ritmo seguro',
          'El parto y los días siguientes ya se llevan entre 5 y 9 kg de golpe',
          'El ritmo saludable de referencia es 0,5 kg por semana',
        ],
        warn: [
          DISCLAIMER,
          'El alta para volver a hacer ejercicio la da el control posparto: alrededor de la semana 6, y más tarde si fue cesárea',
          'Con diástasis abdominal los abdominales tradicionales empeoran el cuadro: eso lo evalúa un kinesiólogo de piso pélvico',
          'Tristeza persistente, angustia o desconexión con el bebé más allá de las dos primeras semanas no son "baby blues": consultá',
        ],
        plazo: 'el control posparto estándar es a las 6 semanas del parto.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'pesoPrevio', label: 'Peso antes del embarazo', type: 'number', min: 30, max: 200, value: 62, suffix: 'kg' },
    { id: 'altura', label: 'Altura', type: 'number', min: 130, max: 210, value: 165, suffix: 'cm' },
    { id: 'semana', label: 'Semana de embarazo', type: 'number', min: 1, max: 42, value: 20 },
    { id: 'edad', label: 'Tu edad', type: 'number', min: 14, max: 55, value: 32 },
    {
      id: 'actividad',
      label: 'Actividad física',
      type: 'select',
      value: 'ligero',
      options: [
        { value: 'sedentario', label: 'Sedentaria' },
        { value: 'ligero', label: 'Ligera (1-3 días por semana)' },
        { value: 'moderado', label: 'Moderada (3-5 días)' },
        { value: 'activo', label: 'Activa (6-7 días)' },
      ],
    },
    {
      id: 'lactancia',
      label: 'Tipo de lactancia',
      type: 'select',
      value: 'exclusiva',
      options: [
        { value: 'exclusiva', label: 'Exclusiva' },
        { value: 'mixta', label: 'Mixta' },
        { value: 'parcial', label: 'Parcial' },
        { value: 'no', label: 'No amamanto' },
      ],
      help: 'Sólo cambia el resultado en las ramas de lactancia y posparto.',
    },
    { id: 'pesoActual', label: 'Tu peso hoy (para el posparto)', type: 'number', min: 30, max: 220, value: 70, suffix: 'kg' },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu IMC previo',
    caption:
      'El eje es el índice de masa corporal ANTES del embarazo, que es lo que define tu rango de kilos. El marcador muestra en qué franja caés: cuanto más alto el IMC previo, menos kilos recomienda el IOM ganar durante el embarazo.',
    bands: [
      { label: 'Bajo peso', from: 15, to: 18.5, tone: 'warn' },
      { label: 'Normal', from: 18.5, to: 25, tone: 'good' },
      { label: 'Sobrepeso', from: 25, to: 30, tone: 'warn' },
      { label: 'Obesidad', from: 30, to: 40, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tus números de la etapa',
  breakdownIntro: 'Las barras comparan cada número con el más grande del desglose.',

  faq: [
    {
      q: '¿Cuántos kilos se suben en el embarazo?',
      a: 'Depende del IMC previo, según los rangos del IOM 2009: con bajo peso (IMC menor a 18,5) de 12,5 a 18 kg; con peso normal (18,5 a 24,9) de 11,5 a 16 kg; con sobrepeso (25 a 29,9) de 7 a 11,5 kg; con obesidad (30 o más) de 5 a 9 kg. Son los rangos que adoptan la OMS y el Ministerio de Salud argentino.',
    },
    {
      q: '¿Cuánto tengo que haber subido a la semana 20?',
      a: 'Con IMC previo normal, alrededor de 4 a 5 kg: 1,5 kg del primer trimestre más unos 0,42 kg por semana desde la 14. El primer trimestre aporta muy poco y el grueso del aumento llega en la segunda mitad.',
    },
    {
      q: '¿Cuántas calorías extra se comen en el embarazo?',
      a: 'Según el ACOG, ninguna en el primer trimestre, +340 kcal por día en el segundo y +450 kcal en el tercero, siempre sobre tu gasto energético previo. El famoso "comer por dos" no existe: 340 kcal son un yogur con una fruta y un puñado de frutos secos.',
    },
    {
      q: '¿Puedo hacer dieta si tengo sobrepeso y estoy embarazada?',
      a: 'No se planifican dietas de descenso durante el embarazo. Lo que sí cambia es el rango: con obesidad previa el objetivo de ganancia es 5 a 9 kg, bastante menor. El manejo lo lleva el equipo obstétrico junto con nutrición, no una calculadora.',
    },
    {
      q: '¿Cuánto se sube en un embarazo gemelar?',
      a: 'El rango se amplía: al que te corresponde por IMC se le suman aproximadamente 5 kg en el piso y 10 kg en el techo. Con IMC normal queda en torno a 16,5 a 24,5 kg. El IOM aclara que la evidencia para múltiples es más débil que para embarazo único.',
    },
    {
      q: '¿Cuántas calorías necesito amamantando?',
      a: 'Unas 500 kcal por día por encima de tu mantenimiento con lactancia exclusiva, 300 con lactancia mixta y 150 con lactancia parcial. Producir leche es la demanda energética más alta de todo el proceso, mayor incluso que el tercer trimestre.',
    },
    {
      q: '¿Cuánta agua tengo que tomar dando la teta?',
      a: 'Entre 2,5 y 3 litros por día con lactancia exclusiva. La regla práctica que mejor funciona es tomar un vaso de agua en cada toma: sigue la demanda real sin tener que contar.',
    },
    {
      q: '¿Cuánto tarda en volver el peso de antes?',
      a: 'El parto y los primeros días se llevan entre 5 y 9 kg (bebé, placenta, líquidos). Lo que queda baja a un ritmo seguro de alrededor de 0,5 kg por semana. Para 8 kg de diferencia, son unos 4 meses. Muchas mujeres tardan de 6 a 12 meses, y algunas no vuelven exactamente al número previo: eso también es normal.',
    },
    {
      q: '¿Amamantar hace bajar de peso?',
      a: 'Ayuda, porque suma un gasto de unas 500 kcal diarias, pero no es automático: el apetito también sube y muchas mujeres retienen peso mientras amamantan. Lo que sí es claro es que no conviene bajar de 1.800 kcal por día mientras se amamanta.',
    },
    {
      q: '¿Cuándo puedo volver a hacer ejercicio después del parto?',
      a: 'El alta la da el control posparto, habitualmente a las 6 semanas, y más tarde si fue cesárea. Antes de eso se camina y se hacen ejercicios de piso pélvico. Los abdominales tradicionales se posponen hasta descartar diástasis.',
    },
    {
      q: '¿Qué pasa si subo más de lo recomendado?',
      a: 'Se asocia a mayor probabilidad de bebé grande para la edad gestacional, de cesárea y de retención de peso posparto. No es una emergencia ni algo para corregir con restricción: se le avisa al obstetra, que evalúa curva de crecimiento fetal y factores como la diabetes gestacional.',
    },
  ],

  sources: [
    {
      name: 'Weight Gain During Pregnancy: Reexamining the Guidelines',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK32813/',
      publisher: 'Institute of Medicine / National Research Council',
      date: '2009',
    },
    {
      name: 'Nutrition During Pregnancy — FAQ del ACOG',
      url: 'https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy',
      publisher: 'American College of Obstetricians and Gynecologists',
    },
    {
      name: 'Recomendaciones para la práctica del control preconcepcional, prenatal y puerperal',
      url: 'https://www.argentina.gob.ar/salud/embarazo',
      publisher: 'Ministerio de Salud de la Nación (Argentina)',
    },
    {
      name: 'Maternal, newborn, child and adolescent health — nutrición en lactancia',
      url: 'https://www.who.int/health-topics/breastfeeding',
      publisher: 'Organización Mundial de la Salud',
    },
  ],

  replaces: [
    '/calculadora-aumento-peso-recomendado-embarazo',
    '/calculadora-embarazada-aumento-peso-semana-imc-previo',
    '/calculadora-peso-ideal-embarazo-imc-previo',
    '/calculadora-calorias-embarazo-trimestre',
    '/calculadora-calorias-lactancia',
    '/calculadora-peso-posparto',
    '/calculadora-posparto-recuperacion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Rangos de ganancia total de peso (kg) y tasa semanal del 2º y 3er trimestre,
 * por categoría de IMC previo. IOM 2009 — espejo de peso-embarazo.ts.
 */
export const IOM_2009: Array<{
  imcHasta: number;
  cat: string;
  min: number;
  max: number;
  tasaSemanal: number;
}> = [
  { imcHasta: 18.5, cat: 'Bajo peso', min: 12.5, max: 18.0, tasaSemanal: 0.51 },
  { imcHasta: 25, cat: 'Normal', min: 11.5, max: 16.0, tasaSemanal: 0.42 },
  { imcHasta: 30, cat: 'Sobrepeso', min: 7.0, max: 11.5, tasaSemanal: 0.28 },
  { imcHasta: Infinity, cat: 'Obesidad', min: 5.0, max: 9.0, tasaSemanal: 0.22 },
];

/** Extra calórico por trimestre (ACOG). */
export const EXTRA_TRIMESTRE: Record<string, number> = { t1: 0, t2: 340, t3: 450, gemelar: 340 };

/** Extra calórico por tipo de lactancia. */
export const EXTRA_LACTANCIA: Record<string, number> = { exclusiva: 500, mixta: 300, parcial: 150, no: 0 };

/** Factores de actividad de Mifflin-St Jeor. */
export const ACTIVIDAD: Record<string, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  activo: 1.725,
};

/** Ampliación del rango en embarazo gemelar (kg sobre el piso y sobre el techo). */
export const GEMELAR_EXTRA = { min: 5, max: 10 };

/** Ritmo seguro de descenso posparto y piso calórico con lactancia. */
export const POSPARTO = { kgPorSemana: 0.5, pisoKcal: 1800 };
