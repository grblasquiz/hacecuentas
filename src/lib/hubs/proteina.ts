import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánta proteína tengo que comer?"
 * Arquetipo RAMIFICADO: el objetivo cambia el factor g/kg, y nada más.
 *
 * Absorbe 8 URLs (ver hub.replaces).
 *
 * DIFERENCIA con los otros hubs del silo /salud — no se pisan:
 *   · /salud/peso-ideal-imc     → "¿estoy en mi peso?" (cuánto pesás para tu altura)
 *   · /salud/grasa-corporal     → "de ese peso, cuánto es grasa y cuánto músculo"
 *   · /salud/habitos            → alcohol, sol, pantallas, pasos
 *   · /nutricion/calorias-diarias → cuánta ENERGÍA total comer (TDEE)
 *   Este responde la pregunta que viene después de las calorías: de esa comida,
 *   cuánta proteína. Ninguno de los otros calcula gramos de proteína.
 *
 * YMYL DE SALUD: el aviso del dominio `health` de src/lib/disclaimers.ts viaja
 * textual en hub.fineprint y como PRIMER `warn` de cada rama. El hub estima y
 * remite al profesional: no prescribe dietas ni suplementos.
 *
 * NOTAS DE CONTRATO:
 *  - Acá no hay plata: TODA fila lleva `format` explícito ('unit' o 'plain').
 *  - `chart.type: 'scale'`: posición sobre el eje g/kg de peso corporal, con
 *    las franjas de OMS TRS-935 e ISSN 2017. compute() devuelve `position`.
 */
export const hub: HubData = {
  slug: 'salud/proteina',
  title: '¿Cuánta proteína tengo que comer por día? Gramos según tu peso y objetivo',
  description:
    'Calculá tus gramos de proteína diarios según tu peso, tu edad y tu objetivo: mantenimiento, ganar músculo o bajar grasa. Con el reparto por comida, el umbral de leucina, los scoops de whey que te faltan y las equivalencias en pollo y huevos.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación nutricional',
  h1: '¿Cuánta proteína tengo que comer?',
  lede:
    'La respuesta no es un número fijo: son gramos por kilo de peso, y el factor lo decide tu objetivo. Partimos del caso más común —actividad moderada, mantenimiento— y ya podés ver tu rango. Si tu situación es otra, la cambiás abajo.',
  stamps: [
    'Actualizado 27-07-2026',
    'OMS TRS-935 · ISSN 2017 · ESPEN 2014',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Tu objetivo diario de proteína',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Todas las ramas usan los mismos datos de arriba. Lo único que cambia es el factor de gramos por kilo, y con él el rango, el reparto por comida y los scoops que te faltan.',
    items: [
      {
        id: 'mantenimiento',
        label: 'Hago algo de actividad y quiero mantenerme',
        hint: 'El caso más común: 1,2 a 1,6 g por kilo de peso.',
        answer: 'Con actividad moderada, entre 1,2 y 1,6 g de proteína por kilo de peso.',
        yes: [
          'Rango diario de 1,2 a 1,6 g por kilo de peso corporal (ISSN 2017 para persona activa)',
          'El reparto por comida en el rango de 0,4 a 0,55 g por kilo por toma',
          'La leucina aproximada de cada comida, contra el umbral anabólico de 2,5 a 3 g',
          'Cuántos scoops de whey te faltarían para llegar, si la comida no alcanza',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Si tenés enfermedad renal, hepática o cualquier restricción proteica indicada, este rango no aplica: el valor te lo tiene que fijar tu médico.',
          'De 65 años en adelante sumamos un 20% por resistencia anabólica (ESPEN 2014): cambiá el campo de edad para verlo.',
        ],
        plazo: 'repartilo en 3 o 4 comidas: el total del día importa, pero el reparto también.',
      },
      {
        id: 'sedentario',
        label: 'Casi no me muevo',
        hint: 'El piso de la OMS: 0,8 a 1,0 g por kilo.',
        answer: 'Sin actividad, el piso son 0,8 g por kilo de peso.',
        yes: [
          'Rango diario de 0,8 a 1,0 g por kilo (OMS TRS-935: requerimiento mínimo del adulto sano)',
          'Es un piso para no perder masa muscular, no un objetivo de rendimiento',
          'El mismo reparto por comida y las mismas equivalencias en alimentos',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          '0,8 g/kg es el mínimo para no entrar en balance nitrogenado negativo, no el punto óptimo. Si empezás a entrenar, el rango sube.',
          'Con sedentarismo y edad avanzada juntos, el riesgo de sarcopenia es mayor: por eso el ajuste del 20% desde los 65.',
        ],
        plazo: 'aun sin entrenar, distribuir la proteína en las comidas rinde más que concentrarla en la cena.',
      },
      {
        id: 'musculo',
        label: 'Entreno fuerza para ganar músculo',
        hint: 'Hipertrofia: 1,6 a 2,2 g por kilo.',
        answer: 'Para hipertrofia, entre 1,6 y 2,2 g de proteína por kilo.',
        yes: [
          'Rango diario de 1,6 a 2,2 g por kilo (ISSN Position Stand 2017 para hipertrofia)',
          'Por encima de 2,2 g/kg no hay evidencia de más ganancia si el entrenamiento y las calorías no acompañan',
          'El reparto por comida es clave: cada toma tiene que superar el umbral de leucina para disparar la síntesis',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Sin estímulo de entrenamiento de fuerza, subir la proteína no construye músculo: el exceso se usa como energía.',
          'Ganar músculo también exige superávit calórico. La proteína sola no alcanza.',
        ],
        plazo: 'apuntá a 4 tomas repartidas cada 3 o 4 horas, con una cerca del entrenamiento.',
      },
      {
        id: 'deficit',
        label: 'Estoy bajando de peso y no quiero perder músculo',
        hint: 'Déficit con entrenamiento: 1,8 a 2,4 g por kilo.',
        answer: 'En déficit calórico la proteína sube: 1,8 a 2,4 g por kilo.',
        yes: [
          'Rango diario de 1,8 a 2,4 g por kilo (ISSN 2017 para déficit con entrenamiento de fuerza)',
          'Es el único escenario donde conviene ir a la parte alta del rango: la proteína protege la masa magra',
          'La proteína además sacia más que grasas e hidratos a igualdad de calorías',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Este rango asume que además entrenás fuerza. En un déficit sin entrenamiento, parte de lo que se pierde es músculo igual.',
          'Un déficit muy agresivo con proteína alta no compensa: el problema pasa a ser la energía total, no la proteína.',
        ],
        plazo: 'con menos comidas por hambre, subí los gramos de cada una: el umbral por toma no baja.',
      },
      {
        id: 'magra',
        label: 'Quiero calcularlo sobre mi masa magra',
        hint: 'Fisicoculturismo: 2,0 g por kilo de masa magra.',
        answer: 'Sobre masa magra el factor es 2,0 g por kilo, no sobre el peso total.',
        yes: [
          'Se descuenta primero el porcentaje de grasa y el factor se aplica sólo a la masa magra',
          'Rango de 1,6 g/kg de magra (mantener) a 2,5 g/kg de magra (definición estricta), con 2,0 como objetivo de ganancia',
          'Es el método que usan los planes de fisicoculturismo: con mucha grasa corporal, calcular sobre el peso total infla el número',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Depende de un porcentaje de grasa que casi nunca es exacto: una balanza de bioimpedancia puede errarle varios puntos.',
          'A esta rama no se le suma el ajuste del 20% por edad: el factor ya está calculado sobre tejido activo.',
        ],
        plazo: 'si no sabés tu porcentaje de grasa, estimalo primero y volvé con ese número.',
      },
      {
        id: 'suplemento',
        label: 'Sólo quiero saber cuántos scoops de whey tomar',
        hint: 'Objetivo hipertrofia ISSN: 1,8 g por kilo.',
        answer: 'Los scoops son el hueco entre tu objetivo y lo que ya comés.',
        yes: [
          'Objetivo fijado en 1,8 g por kilo, el punto medio del rango de hipertrofia del ISSN 2017',
          'Se resta la proteína que ya te aporta la comida y el resto se divide por los gramos de tu scoop',
          'Si la comida ya cubre el objetivo, el resultado es cero scoops: el whey es un complemento, no una obligación',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Los gramos de proteína por scoop varían mucho entre marcas: leé la etiqueta, no asumas 25 g.',
          'Más de 3 scoops por día suele indicar que la estimación de proteína de tu dieta está baja. Registrá tres días antes de suplementar más.',
        ],
        plazo: 'mirá los gramos de proteína por scoop en la etiqueta y cargalos en el campo de abajo.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Con el peso solo ya sale un número. La edad, las comidas y el resto afinan el reparto.',
  fields: [
    { id: 'peso', label: 'Tu peso corporal', type: 'number', min: 20, max: 250, value: 75, suffix: 'kg' },
    {
      id: 'edad',
      label: 'Tu edad',
      type: 'number',
      min: 14,
      max: 110,
      value: 35,
      suffix: 'años',
      help: 'Desde los 65 sumamos un 20% por resistencia anabólica y subimos el piso por comida a 0,55 g/kg (ESPEN 2014).',
    },
    {
      id: 'pctGrasa',
      label: 'Tu porcentaje de grasa corporal',
      type: 'number',
      min: 3,
      max: 60,
      value: 20,
      suffix: '%',
      help: 'Sólo se usa en la rama que calcula sobre masa magra. Si no lo sabés, dejalo como está.',
    },
    { id: 'comidas', label: 'Comidas por día', type: 'number', min: 1, max: 8, value: 4 },
    {
      id: 'proteinaDieta',
      label: 'Proteína que ya te aporta la comida',
      type: 'number',
      min: 0,
      max: 400,
      value: 90,
      suffix: 'g',
      help: 'Estimá lo que comés hoy sin suplemento. Se usa para calcular cuánto te falta.',
    },
    {
      id: 'proteinaScoop',
      label: 'Proteína por scoop de tu whey',
      type: 'number',
      min: 5,
      max: 50,
      value: 25,
      suffix: 'g',
      help: 'Está en la etiqueta del envase. Varía entre 20 y 30 g según la marca.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu objetivo',
    caption:
      'El eje son gramos de proteína por kilo de peso corporal. El marcador muestra dónde queda tu objetivo dentro de las franjas de la OMS y del ISSN. Más a la derecha no es mejor: es el rango que corresponde a lo que estás haciendo.',
  },
  breakdownTitle: 'Cómo se reparte tu proteína',
  breakdownIntro: 'Las barras comparan cada número con el más grande del desglose.',

  faq: [
    {
      q: '¿Cuánta proteína tengo que comer por día?',
      a: 'Depende del peso y del objetivo, no de un número único. El piso de la OMS para un adulto sedentario es 0,8 g por kilo; con actividad moderada se ubica entre 1,2 y 1,6; para hipertrofia entre 1,6 y 2,2; y en déficit calórico con entrenamiento de fuerza entre 1,8 y 2,4. Para 75 kg con actividad moderada eso da entre 90 y 120 g por día.',
    },
    {
      q: '¿Cuánta proteína puedo absorber por comida?',
      a: 'La absorción intestinal no tiene un tope práctico: lo que se satura es la síntesis muscular. El rango útil por toma va de 0,4 a 0,55 g por kilo de peso, o sea entre 30 y 41 g para alguien de 75 kg. Por encima de eso el excedente se sigue absorbiendo, pero se usa como energía en vez de sumar músculo.',
    },
    {
      q: '¿Es cierto que el cuerpo sólo aprovecha 30 g de proteína por comida?',
      a: 'Es una simplificación. El umbral no es un número fijo sino un porcentaje del peso corporal, y depende también de la calidad de la proteína: lo que dispara la síntesis muscular es llegar a unos 2,5 a 3 g de leucina por toma, que aporta aproximadamente el 10% de la proteína de fuentes completas como whey, carne, huevo o lácteos.',
    },
    {
      q: '¿Por qué después de los 65 hay que comer más proteína?',
      a: 'Por la resistencia anabólica: el músculo del adulto mayor responde menos al mismo estímulo proteico. El grupo de expertos de ESPEN recomienda subir aproximadamente un 20% el objetivo diario y elevar el piso por comida a 0,55 g por kilo, para superar el umbral de leucina en cada toma.',
    },
    {
      q: '¿Conviene calcular la proteína sobre el peso total o sobre la masa magra?',
      a: 'Con un porcentaje de grasa normal, los dos caminos dan parecido. Con obesidad, calcular sobre el peso total infla mucho el objetivo, porque el tejido graso no demanda proteína: ahí conviene descontar la grasa y aplicar el factor sobre la masa magra.',
    },
    {
      q: '¿Cuántos scoops de whey necesito por día?',
      a: 'Los que hagan falta para tapar el hueco entre tu objetivo y lo que ya comés, nada más. Si tu objetivo son 135 g y la comida te aporta 90, faltan 45 g: con un scoop de 25 g de proteína son 1,8 scoops. Si la comida ya cubre el objetivo, el resultado es cero.',
    },
    {
      q: '¿Comer mucha proteína daña los riñones?',
      a: 'En personas con función renal normal no hay evidencia de daño con ingestas altas sostenidas. En cambio, con enfermedad renal preexistente la proteína sí se restringe y el valor lo fija el médico, no una calculadora. Si tenés antecedentes renales o hepáticos, consultá antes de subir la ingesta.',
    },
    {
      q: '¿Qué alimentos rinden más proteína?',
      a: 'Cada 100 g: pechuga de pollo cocida aporta unos 31 g, atún al agua escurrido 26, tofu firme 17, huevo entero 13 y lentejas cocidas 9. Un huevo mediano ronda los 6,5 g. Combinar fuentes suele ser más práctico y más nutritivo que cubrir todo con una sola.',
    },
    {
      q: '¿Sirve tomar toda la proteína en una comida?',
      a: 'El total del día es lo que más pesa, pero repartir en 3 o 4 tomas que superen el umbral por comida rinde mejor para la síntesis muscular que concentrar todo en la cena. Con menos comidas hay que subir los gramos de cada una, porque el umbral por toma no baja.',
    },
    {
      q: '¿La proteína vegetal cuenta igual que la animal?',
      a: 'Cuenta, pero suele tener menos leucina y un perfil de aminoácidos menos completo. En una dieta vegetariana o vegana conviene combinar fuentes (legumbres con cereales, soja, seitán) y apuntar a la parte alta del rango para compensar la menor calidad proteica.',
    },
    {
      q: '¿Necesito proteína durante el ejercicio?',
      a: 'Durante el esfuerzo el combustible son los hidratos, no la proteína. En sesiones de más de una hora se recomiendan entre 30 y 90 g de carbohidratos por hora según intensidad y duración, empezando a los 30 a 45 minutos. La proteína se acomoda en el total del día, antes y después.',
    },
    {
      q: '¿Cambia el cálculo si estoy embarazada o amamantando?',
      a: 'Sí, y bastante: el requerimiento sube por encima del rango de mantenimiento y depende del trimestre. Este hub no cubre ese caso; el objetivo te lo tiene que fijar tu obstetra o un nutricionista.',
    },
  ],

  sources: [
    {
      name: 'ISSN Position Stand: Protein and Exercise (Jäger et al., 2017)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/',
      publisher: 'Journal of the International Society of Sports Nutrition',
      date: '2017',
    },
    {
      name: 'Protein and amino acid requirements in human nutrition — TRS 935',
      url: 'https://www.who.int/publications/i/item/WHO-TRS-935',
      publisher: 'Organización Mundial de la Salud',
      date: '2007',
    },
    {
      name: 'ESPEN Expert Group: protein intake and exercise for optimal muscle function with ageing',
      url: 'https://pubmed.ncbi.nlm.nih.gov/24814383/',
      publisher: 'Clinical Nutrition (ESPEN)',
      date: '2014',
    },
    {
      name: 'FoodData Central — composición proteica de alimentos',
      url: 'https://fdc.nal.usda.gov/',
      publisher: 'USDA',
    },
    {
      name: 'Nutrición y actividad física — recomendaciones alimentarias',
      url: 'https://www.argentina.gob.ar/salud/alimentacion-saludable',
      publisher: 'Ministerio de Salud de la Nación',
    },
  ],

  replaces: [
    '/calculadora-proteina-diaria-objetivo',
    '/calculadora-proteina-gramos-por-peso-actividad',
    '/calculadora-proteina-por-comida-absorcion',
    '/calculadora-proteina-diaria-fisicoculturismo-ganar-musculo',
    '/calculadora-whey-protein-dosis-diaria-scoop',
    '/calculadora-carbohidratos-durante-ejercicio',
    '/calculadora-proteina-por-comida-anabolismo',
    '/calculadora-proteina-diaria-gramos-objetivo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Factores g/kg por rama.
 *  - `sobre: 'peso'`  → el factor se aplica al peso corporal total.
 *  - `sobre: 'magra'` → se descuenta el % de grasa primero (fisicoculturismo).
 *  - `senior: true`   → admite el ajuste +20% de ESPEN 2014 desde los 65.
 *
 * Fuente de cada par: PROTEIN_FACTORS de proteina-diaria-gramos-objetivo.ts
 * (OMS TRS-935 + ISSN 2017); la rama `magra` sale del mapa `mult` de
 * proteina-diaria-fisicoculturismo-ganar-musculo.ts; la rama `suplemento`
 * usa el 1,8 g/kg de hipertrofia del rateMap de whey-protein-dosis-diaria-scoop.ts.
 */
export const RANGOS: Record<
  string,
  { min: number; mid: number; max: number; sobre: 'peso' | 'magra'; senior: boolean; etiqueta: string }
> = {
  mantenimiento: { min: 1.2, mid: 1.4, max: 1.6, sobre: 'peso', senior: true, etiqueta: 'actividad moderada' },
  sedentario: { min: 0.8, mid: 0.9, max: 1.0, sobre: 'peso', senior: true, etiqueta: 'vida sedentaria' },
  musculo: { min: 1.6, mid: 1.9, max: 2.2, sobre: 'peso', senior: true, etiqueta: 'ganancia muscular' },
  deficit: { min: 1.8, mid: 2.1, max: 2.4, sobre: 'peso', senior: true, etiqueta: 'déficit con entrenamiento' },
  magra: { min: 1.6, mid: 2.0, max: 2.5, sobre: 'magra', senior: false, etiqueta: 'masa magra' },
  suplemento: { min: 1.8, mid: 1.8, max: 1.8, sobre: 'peso', senior: true, etiqueta: 'hipertrofia ISSN' },
};

/** Constantes compartidas por todas las ramas. */
export const NUTRI = {
  /** ESPEN 2014: +20% desde los 65 por resistencia anabólica. */
  SENIOR_MULT: 1.2,
  SENIOR_EDAD: 65,
  /** Rango por comida en g/kg de peso (piso adulto / piso 65+ / techo). */
  COMIDA_MIN: 0.4,
  COMIDA_MIN_SENIOR: 0.55,
  COMIDA_MAX: 0.55,
  /** Fracción de leucina de una proteína completa y umbral anabólico. */
  LEUCINA_FRAC: 0.1,
  LEUCINA_UMBRAL: 2.5,
  /** g de proteína por 100 g de alimento (USDA FoodData Central). */
  POLLO_100: 31,
  HUEVO_UNIDAD: 6.5,
  /** Tope del eje del gráfico, en g/kg. */
  ESCALA_MAX: 3,
};
