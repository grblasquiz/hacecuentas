import type { HubData } from './types';

/**
 * Hub de decisión — "¿Tengo humedad en casa y a qué temperatura condensa?"
 *
 * Arquetipo CÁLCULO DOMINANTE (sin `cases`): la respuesta es el punto de rocío
 * y el diagnóstico contra el rango ideal del ambiente. El ambiente se elige en
 * un `select`.
 *
 * Absorbe 4 calculadoras (ver `replaces`):
 *   - humedad-ideal-ambiente            → rango ideal por ambiente + diagnóstico
 *   - humedad-absoluta-relativa         → HR (%) → humedad absoluta (g/m³), Magnus
 *   - punto-de-rocio                    → Td por Magnus-Tetens + bandas de confort
 *   - velocidad-viento-beaufort         → ABSORBIDA SÓLO POR URL (viento exterior,
 *     no entra al cálculo; ver reporte)
 *
 * EXTENSIONES sobre las fórmulas originales (documentadas en el reporte):
 *   1. Superficie fría (vidrio / pared al norte-sur frío): si su temperatura
 *      queda por debajo del punto de rocío, ahí condensa. Es la pregunta real
 *      detrás de "tengo humedad": dónde aparece el moho.
 *   2. Agua contenida en el aire del ambiente (g y mL a extraer) a partir de la
 *      humedad absoluta × volumen. Dimensiona el deshumidificador.
 *   Ninguna extensión toca la matemática original: con los mismos inputs, AH,
 *   Td y el rango ideal salen idénticos a las fórmulas viejas.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay plata. El resultado declara `format:'unit'` y TODAS las filas
 *    declaran el suyo: el runtime hace Object.assign y una fila sin `format`
 *    propio se imprime en pesos.
 *  - Gráfico `scale` posicional: hay que devolver `position` (0-100) y
 *    `positionLabel`. Las franjas son las bandas de confort del punto de rocío
 *    de `punto-de-rocio.ts`, mapeadas al eje −10 °C … 30 °C.
 */

/** Rango ideal de humedad relativa por ambiente. Copia fiel de humedad-ideal-ambiente.ts. */
export const AMBIENTES: Record<string, { label: string; min: number; max: number }> = {
  dormitorio: { label: 'Dormitorio', min: 40, max: 60 },
  living: { label: 'Living / comedor', min: 40, max: 55 },
  bebe: { label: 'Cuarto del bebé', min: 45, max: 55 },
  cocina: { label: 'Cocina', min: 40, max: 60 },
  bano: { label: 'Baño', min: 40, max: 65 },
  bodega: { label: 'Bodega / depósito', min: 30, max: 50 },
};

/** Constantes de Magnus (mismas que humedad-absoluta-relativa.ts y punto-de-rocio.ts). */
export const MAGNUS = { a: 17.625, b: 243.04, es0: 6.112, k: 216.7 };

/** Bandas de confort del punto de rocío, en °C. Copia de punto-de-rocio.ts. */
export const BANDAS_TD: Array<{ label: string; from: number; to: number; tone: 'good' | 'warn' | 'bad' | 'neutral' }> = [
  { label: 'Muy seco', from: -10, to: 5, tone: 'neutral' },
  { label: 'Ideal / fresco', from: 5, to: 13, tone: 'good' },
  { label: 'Confortable', from: 13, to: 18, tone: 'good' },
  { label: 'Húmedo', from: 18, to: 21, tone: 'warn' },
  { label: 'Opresivo', from: 21, to: 24, tone: 'warn' },
  { label: 'Sofocante', from: 24, to: 30, tone: 'bad' },
];

/** Altura de cielorraso supuesta para pasar de m² a m³. */
export const ALTURA_M = 2.6;

export const hub: HubData = {
  slug: 'hogar/humedad-en-casa',
  title: 'Humedad en casa: rango ideal, punto de rocío y dónde condensa',
  description:
    'Poné temperatura y humedad relativa y calculá el punto de rocío, la humedad absoluta en g/m³, si estás dentro del rango ideal del ambiente y en qué superficie va a condensar el agua.',
  silo: 'Hogar',
  siloHref: '/hogar',

  eyebrow: 'Hogar · Humedad y condensación',
  h1: '¿Tengo humedad en casa y dónde va a condensar?',
  lede:
    'La humedad relativa sola no dice nada: 60 % a 25 °C y 60 % a 12 °C son cantidades de agua muy distintas. Lo que decide si aparece moho es el punto de rocío contra la temperatura de la superficie más fría del ambiente. Acá calculás las tres cosas de una: cuánta agua hay en el aire, a qué temperatura condensa y si estás dentro del rango sano.',
  stamps: [
    'Fórmula Magnus-Tetens',
    'Rango de confort ASHRAE 30–50 %',
    'Reemplaza 4 calculadoras sueltas',
  ],

  resultLabel: 'Punto de rocío del ambiente',

  inputsTitle: 'Los datos del ambiente',
  inputsIntro:
    'Temperatura y humedad relativa las da cualquier termohigrómetro de $10.000 o la estación meteorológica del celular si medís adentro. La superficie fría es el vidrio de la ventana o la pared que da al exterior: medila con un termómetro infrarrojo o poné 3–5 °C menos que el aire si no la tenés.',
  fields: [
    {
      id: 'ambiente',
      label: 'Ambiente',
      type: 'select',
      value: 'dormitorio',
      options: Object.entries(AMBIENTES).map(([value, a]) => ({ value, label: a.label })),
      help: 'Cada ambiente tiene su rango sano: el cuarto del bebé es más estrecho que un baño.',
    },
    {
      id: 'temperatura',
      label: 'Temperatura del aire',
      type: 'number',
      value: 21,
      suffix: '°C',
      min: -40,
      max: 60,
      step: 0.5,
    },
    {
      id: 'humedadRelativa',
      label: 'Humedad relativa',
      type: 'number',
      value: 68,
      suffix: '%',
      min: 1,
      max: 100,
      step: 1,
    },
    {
      id: 'tempSuperficie',
      label: 'Temperatura de la superficie más fría',
      type: 'number',
      value: 13,
      suffix: '°C',
      min: -40,
      max: 60,
      step: 0.5,
      help: 'El vidrio de la ventana o la pared exterior. Es donde condensa primero.',
    },
    {
      id: 'superficieM2',
      label: 'Superficie del ambiente',
      type: 'number',
      value: 12,
      suffix: 'm²',
      min: 1,
      max: 500,
      step: 1,
      help: 'Sirve para estimar cuántos mL de agua hay que sacar del aire.',
    },
  ],
  fineprint:
    'Estimación orientativa para decidir si ventilás, humidificás o deshumidificás. No reemplaza el diagnóstico de un profesional: si hay moho negro extendido, manchas que vuelven o humedad de cimiento, el problema es constructivo y no se arregla con un deshumidificador.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu punto de rocío',
    caption:
      'El punto de rocío mide la humedad real del aire, sin depender de la temperatura. Por debajo de 13 °C el ambiente se siente fresco y seco; arriba de 18 °C ya se siente pegajoso y arriba de 21 °C es opresivo.',
    bands: BANDAS_TD,
  },
  breakdownTitle: 'Los números del ambiente',
  breakdownIntro:
    'Arriba, el diagnóstico contra el rango ideal del ambiente elegido. En el medio, cuánta agua hay realmente en el aire. Abajo, el margen que te separa de la condensación en la superficie fría.',

  answer: {
    title: 'Qué mirar antes de comprar nada',
    copy:
      'Un deshumidificador ataca el síntoma. Antes de comprarlo, revisá si la humedad la estás generando vos (cocinar sin extractor, secar ropa adentro, duchas largas sin ventilar) o si entra por una filtración. Ventilar 5–10 minutos dos veces por día saca más agua del ambiente que la mayoría de los equipos chicos, y no cuesta nada.',
    yes: [
      'La humedad relativa ideal es 40–60 % en general, y 45–55 % en el cuarto del bebé.',
      'Si la superficie fría está por debajo del punto de rocío, ahí condensa: es el punto exacto donde aparece el moho.',
      'La humedad absoluta (g/m³) es la que no miente: es la cantidad real de agua en el aire.',
      'Debajo de 30 % de humedad relativa se resecan mucosas, piso de madera y muebles.',
      'Arriba de 70 % sostenido hay riesgo de moho, ácaros y daño en paredes.',
    ],
    warn: [
      'Estimación orientativa. Si hay moho negro extendido o manchas que reaparecen, el problema es constructivo y necesita un profesional.',
      'Los termohigrómetros baratos suelen tener ±5 % de error en la humedad: leé la tendencia, no el número exacto.',
      'Un deshumidificador sube la temperatura del ambiente unos grados: no lo uses en verano esperando frescura.',
      'Secar ropa adentro puede sumar 2 a 4 litros de agua al aire de la casa por tanda.',
    ],
    plazo:
      'Medí a la misma hora durante una semana antes de decidir: la humedad de un ambiente varía 15–20 puntos entre la mañana y la noche.',
  },

  faq: [
    {
      q: '¿Cuál es la humedad ideal en una casa?',
      a: 'Entre 40 % y 60 % de humedad relativa como regla general. En el dormitorio conviene 40–60 %, en el living 40–55 %, en el cuarto de un bebé 45–55 %, en el baño hasta 65 % y en una bodega o depósito 30–50 %. El rango de confort de ASHRAE es todavía más estrecho: 30–50 %.',
    },
    {
      q: '¿Qué es el punto de rocío y para qué me sirve?',
      a: 'Es la temperatura a la que el aire ya no puede sostener el agua que tiene y la suelta en forma de gotas. Si el vidrio de tu ventana está a 12 °C y el punto de rocío del ambiente es 15 °C, en ese vidrio condensa sí o sí. Sirve para saber dónde va a aparecer el moho antes de que aparezca.',
    },
    {
      q: '¿Por qué 60 % de humedad se siente distinto en verano que en invierno?',
      a: 'Porque la humedad relativa es un porcentaje sobre el máximo que aguanta el aire a esa temperatura, y ese máximo crece rápido con el calor. A 30 °C, 60 % de humedad relativa son unos 18 g de agua por m³; a 10 °C, el mismo 60 % son apenas 5,6 g/m³. Tres veces menos agua para el mismo número.',
    },
    {
      q: '¿Cuál es la diferencia entre humedad relativa y humedad absoluta?',
      a: 'La relativa (%) compara el agua que hay con la máxima que ese aire podría sostener a su temperatura. La absoluta (g/m³) es la cantidad real de agua, sin comparar con nada. Para ventilar o deshumidificar la que importa es la absoluta: si afuera hay menos agua por m³ que adentro, abrir la ventana seca; si hay más, moja.',
    },
    {
      q: '¿Ventilar en un día húmedo empeora la humedad de adentro?',
      a: 'Depende de la humedad absoluta, no de la relativa. En invierno, aire de afuera a 8 °C y 90 % de humedad tiene ~7,3 g/m³; adentro a 21 °C y 65 % hay ~12 g/m³. Ventilar seca, aunque afuera "esté más húmedo". En un día de verano a 28 °C y 85 %, en cambio, entra más agua de la que sacás.',
    },
    {
      q: '¿A partir de qué humedad aparece el moho?',
      a: 'El moho necesita humedad relativa sostenida sobre 70 % en la superficie, no en el aire. Por eso condensa primero en los rincones fríos y detrás de los muebles pegados a la pared exterior: ahí la superficie está más fría, la humedad relativa local sube y el hongo prende aunque el higrómetro del centro del cuarto marque 55 %.',
    },
    {
      q: '¿Cuánta agua saca un deshumidificador por día?',
      a: 'Los domésticos de 10 a 20 litros nominales sacan bastante menos en la práctica, porque la capacidad se mide a 30 °C y 80 % de humedad. En un ambiente a 20 °C y 60 % rinden entre un tercio y la mitad de lo que dice la caja. Dimensionalo por los m³ del ambiente, no por la etiqueta.',
    },
    {
      q: '¿Por qué se empañan los vidrios por dentro?',
      a: 'Porque el vidrio es la superficie más fría del ambiente y su temperatura queda por debajo del punto de rocío. Un vidrio simple en invierno puede estar 8 a 10 °C por debajo del aire. La solución de fondo es el doble vidriado (sube la temperatura de la cara interior); la de todos los días, ventilar y no tapar la ventana con cortina pesada.',
    },
    {
      q: '¿Sirve poner un recipiente con agua sobre la estufa para humidificar?',
      a: 'Sirve, y bastante: la evaporación pasiva de un recipiente ancho puede sumar medio litro por día al ambiente. Es la opción barata cuando la humedad baja de 30 % en invierno con calefacción. Cambiale el agua seguido, porque el agua estancada tibia es un buen medio de cultivo.',
    },
    {
      q: '¿La humedad afecta a la madera y a los instrumentos?',
      a: 'Sí, es lo que más los rompe. Los pisos y muebles de madera maciza piden 40–55 % estable; abajo de 30 % se abren las juntas y arriba de 65 % se hinchan y se traban las puertas. Las guitarras y pianos son todavía más sensibles: 45–55 % es el rango que recomiendan los luthiers.',
    },
    {
      q: '¿Qué humedad tiene que tener el cuarto de un bebé?',
      a: 'Entre 45 % y 55 %, con temperatura de 20 a 22 °C. Es un rango más estrecho que el del resto de la casa porque las vías respiratorias chicas se resienten tanto con el aire reseco (mucosas irritadas, más infecciones) como con el exceso de humedad (ácaros y moho). Esto es orientativo: ante síntomas respiratorios, consultá al pediatra.',
    },
    {
      q: '¿Cuánta humedad genera una persona viviendo en la casa?',
      a: 'Una persona adulta libera entre 1 y 2 litros de agua por día sólo respirando y transpirando. Sumale una ducha (0,5 L), cocinar sin extractor (1 a 2 L) y secar una tanda de ropa adentro (2 a 4 L). Una familia tipo puede estar largando 10 a 15 litros diarios al aire de la casa.',
    },
  ],

  sources: [
    {
      name: 'ANSI/ASHRAE Standard 55 — Thermal Environmental Conditions for Human Occupancy',
      url: 'https://www.ashrae.org/technical-resources/bookstore/standard-55-thermal-environmental-conditions-for-human-occupancy',
      publisher: 'ASHRAE',
    },
    {
      name: 'Damp and mould: health risks, advice and actions',
      url: 'https://www.gov.uk/government/publications/damp-and-mould-understanding-and-addressing-the-health-risks-for-rented-housing-providers',
      publisher: 'UK Health Security Agency',
    },
    {
      name: 'WHO Guidelines for Indoor Air Quality: Dampness and Mould',
      url: 'https://www.who.int/publications/i/item/9789289041683',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'Alden, A. — The Magnus formula for saturation vapour pressure (NOAA/NWS dew point reference)',
      url: 'https://www.weather.gov/epz/wxcalc_rh',
      publisher: 'National Weather Service (NOAA)',
    },
    {
      name: 'Mold Course — Moisture and Mold Prevention',
      url: 'https://www.epa.gov/mold/mold-course-chapter-2',
      publisher: 'US EPA',
    },
  ],

  replaces: [
    '/calculadora-humedad-relativa-ideal-ambiente',
    '/calculadora-humedad-absoluta-relativa-confort',
    '/calculadora-punto-de-rocio-dew-point-temperatura-humedad',
    '/calculadora-velocidad-viento-beaufort-escala-0-12',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
};
