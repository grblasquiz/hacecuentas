import type { HubData } from './types';

/**
 * Hub de decisión — "Convertir litros, galones y onzas"
 * Absorbe 3 URLs de conversor suelto (ver `replaces`).
 *
 * Arquetipo CONVERSOR (mismo patrón que `convertir-peso.ts`): sin `cases`, la
 * ramificación la hacen los dos `select` de unidad y la respuesta fija vive en
 * `hub.answer`, que puebla la página.
 *
 * FACTORES: todos EXACTOS por definición, no recíprocos redondeados.
 *   1 pulgada = 25,4 mm exactos  →  1 in³ = 16,387064 cm³ exactos
 *   1 galón US = 231 in³         =  3,785411784 L exactos
 *   1 galón imperial = 4,54609 L exactos (definición de 1985)
 *   1 fl oz US = galón US / 128  ·  1 fl oz imperial = galón imperial / 160
 *   1 barril de petróleo = 42 galones US
 * De ahí salen pintas, cuartos, pie cúbico, cucharada y cucharadita.
 *
 * OJO con las fórmulas viejas: `litros-galones.ts` usaba 3,78541 y 29,5735
 * (truncados) y `conversion-litros-galones.ts` redondeaba la salida con
 * toFixed(4). Acá se usa el factor exacto, igual que en `convertir-peso.ts` y
 * `conversor-longitud.ts`, para que dos páginas del sitio no devuelvan números
 * distintos para la misma conversión.
 *
 * LA TRAMPA DEL HUB, que ninguna de las calcs viejas explicaba bien: el galón
 * imperial es un 20% MÁS GRANDE que el US, pero la onza líquida imperial es un
 * 4% MÁS CHICA que la US. No es una contradicción: el galón US se parte en 128
 * onzas y el imperial en 160.
 */
export const hub: HubData = {
  slug: 'conversores/volumen',
  title: 'Convertir litros, galones y onzas — conversor de volumen exacto',
  description:
    'Convertí litros, mililitros, metros cúbicos, galones US e imperiales, onzas líquidas, pintas, cuartos, barriles, pies cúbicos, tazas y cucharadas con los factores exactos: 1 galón US = 3,785411784 litros. Incluye la diferencia entre el galón americano y el británico.',
  silo: 'Conversores',
  siloHref: '/conversores',

  eyebrow: 'Conversor de unidades',
  h1: 'Convertir litros, galones y onzas',
  lede:
    'Elegí la unidad que tenés y la que querés, escribí el número y listo. Sirve para litros y mililitros, metros y centímetros cúbicos, los dos galones (el americano y el imperial británico), las dos onzas líquidas, pintas, cuartos, barriles de petróleo, pies cúbicos y las medidas de cocina. Los factores son los exactos por definición, no versiones redondeadas.',
  stamps: [
    'Factores exactos (NIST / definición internacional)',
    '1 gal US = 3,785411784 L exactos',
    '20 unidades adentro',
  ],

  resultLabel: 'Resultado de la conversión',

  inputsTitle: 'Qué querés convertir',
  inputsIntro:
    'Todas las unidades de la lista son de volumen o capacidad, así que cualquier combinación de origen y destino da un resultado válido. Las trampas son dos: hay dos galones (el US y el imperial) y hay dos onzas líquidas, y no se corresponden entre sí.',
  fields: [
    // OJO: `text` a propósito. El parser del runtime (`num()`) borra los puntos
    // para leer miles al estilo es-AR, así que un `number` con "1.5" se leería
    // 15. Como `text` llega el string crudo y lo parseamos acá, aceptando tanto
    // coma como punto decimal.
    { id: 'valor', label: 'Cantidad a convertir', value: '1' },
    {
      id: 'desde',
      label: 'Unidad de origen',
      type: 'select',
      value: 'l',
      options: [
        { value: 'ml', label: 'Mililitro (ml)' },
        { value: 'cl', label: 'Centilitro (cl)' },
        { value: 'l', label: 'Litro (l)' },
        { value: 'cm3', label: 'Centímetro cúbico (cm³ / cc)' },
        { value: 'm3', label: 'Metro cúbico (m³)' },
        { value: 'gal_us', label: 'Galón US (EE. UU.)' },
        { value: 'gal_uk', label: 'Galón imperial (Reino Unido)' },
        { value: 'oz_us', label: 'Onza líquida US (fl oz)' },
        { value: 'oz_uk', label: 'Onza líquida imperial (fl oz UK)' },
        { value: 'pt_us', label: 'Pinta US (16 fl oz)' },
        { value: 'pt_uk', label: 'Pinta imperial (20 fl oz UK)' },
        { value: 'qt_us', label: 'Cuarto US (quart)' },
        { value: 'qt_uk', label: 'Cuarto imperial (quart UK)' },
        { value: 'bbl', label: 'Barril de petróleo (42 gal US)' },
        { value: 'ft3', label: 'Pie cúbico (ft³)' },
        { value: 'in3', label: 'Pulgada cúbica (in³)' },
        { value: 'taza_us', label: 'Taza US (cup, 8 fl oz)' },
        { value: 'taza_metrica', label: 'Taza métrica (250 ml)' },
        { value: 'cda', label: 'Cucharada US (tbsp)' },
        { value: 'cdta', label: 'Cucharadita US (tsp)' },
      ],
    },
    {
      id: 'hasta',
      label: 'Unidad de destino',
      type: 'select',
      value: 'gal_us',
      options: [
        { value: 'ml', label: 'Mililitro (ml)' },
        { value: 'cl', label: 'Centilitro (cl)' },
        { value: 'l', label: 'Litro (l)' },
        { value: 'cm3', label: 'Centímetro cúbico (cm³ / cc)' },
        { value: 'm3', label: 'Metro cúbico (m³)' },
        { value: 'gal_us', label: 'Galón US (EE. UU.)' },
        { value: 'gal_uk', label: 'Galón imperial (Reino Unido)' },
        { value: 'oz_us', label: 'Onza líquida US (fl oz)' },
        { value: 'oz_uk', label: 'Onza líquida imperial (fl oz UK)' },
        { value: 'pt_us', label: 'Pinta US (16 fl oz)' },
        { value: 'pt_uk', label: 'Pinta imperial (20 fl oz UK)' },
        { value: 'qt_us', label: 'Cuarto US (quart)' },
        { value: 'qt_uk', label: 'Cuarto imperial (quart UK)' },
        { value: 'bbl', label: 'Barril de petróleo (42 gal US)' },
        { value: 'ft3', label: 'Pie cúbico (ft³)' },
        { value: 'in3', label: 'Pulgada cúbica (in³)' },
        { value: 'taza_us', label: 'Taza US (cup, 8 fl oz)' },
        { value: 'taza_metrica', label: 'Taza métrica (250 ml)' },
        { value: 'cda', label: 'Cucharada US (tbsp)' },
        { value: 'cdta', label: 'Cucharadita US (tsp)' },
      ],
    },
  ],
  fineprint:
    'El galón US mide 231 pulgadas cúbicas exactas, y como la pulgada son 25,4 mm exactos desde 1959, el galón son 3,785411784 litros exactos. El galón imperial son 4,54609 litros exactos por definición de 1985. Todo lo demás (onzas, pintas, cuartos, barriles) se deriva de esos dos números, así que también es exacto.',

  chart: {
    type: 'scale',
    title: 'Cuánto es eso, en la vida real',
    caption:
      'La regla va de 1 mililitro a 1000 litros en escala logarítmica, con referencias reconocibles: una cucharadita de 5 ml, una taza, una botella de gaseosa de 1,5 L, un balde de 10 L, el tanque de un auto y un tanque de agua domiciliario. Tu volumen convertido queda marcado sobre esa regla, así ves la magnitud y no sólo el número.',
    bands: [
      { label: '1 ml a 10 ml — una cucharadita, una ampolla', from: 1, to: 10, tone: 'neutral' },
      { label: '10 ml a 100 ml — un shot, una taza de café chica', from: 10, to: 100, tone: 'neutral' },
      { label: '100 ml a 1 L — un vaso, una lata, un litro de leche', from: 100, to: 1000, tone: 'good' },
      { label: '1 L a 10 L — una botella de 1,5 L, un bidón', from: 1000, to: 10000, tone: 'good' },
      { label: '10 L a 100 L — un balde, el tanque de un auto', from: 10000, to: 100000, tone: 'warn' },
      { label: '100 L a 1000 L — un termotanque, un tanque de agua', from: 100000, to: 1000000, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Tu volumen en todas las unidades',
  breakdownIntro:
    'La conversión que pediste queda destacada. Las barras comparan el número de cada unidad entre sí, así que las unidades chicas (mililitros, cucharaditas) siempre dan barras largas: mirá el valor, no la barra.',

  answer: {
    title: 'Los factores que importan, sin vueltas',
    copy:
      'Todas estas equivalencias son factores fijos definidos por acuerdo internacional: no cambian con el tiempo. El galón US se define como 231 pulgadas cúbicas y el imperial como 4,54609 litros exactos, y de ahí se derivan las onzas, las pintas, los cuartos y los barriles de cada sistema.',
    yes: [
      '1 litro = 1000 mililitros = 1000 cm³ = 0,001 m³ — exacto por definición del SI',
      '1 galón US = 3,785411784 litros exactos — al revés, 1 litro = 0,2641720524 gal US',
      '1 galón imperial = 4,54609 litros exactos — es un 20,09% más grande que el US',
      '1 onza líquida US = 1/128 de galón US = 29,5735295625 ml — 1 litro = 33,814 fl oz',
      '1 onza líquida imperial = 1/160 de galón imperial = 28,4130625 ml — es un 4% MÁS CHICA que la US',
      '1 pinta US = 473,176473 ml · 1 pinta imperial = 568,26125 ml (el vaso de cerveza británico)',
      '1 barril de petróleo = 42 galones US = 158,987294928 litros — es el barril del precio del crudo',
      '1 pie cúbico = 28,316846592 litros · 1 pulgada cúbica = 16,387064 ml, ambos exactos',
      '1 taza US (cup) = 8 fl oz = 236,5882365 ml · 1 taza métrica = 250 ml exactos',
    ],
    warn: [
      'Hay dos galones y ninguno avisa: el imperial es un 20% más grande, así que "20 millas por galón" en un auto británico y en uno americano no son el mismo consumo',
      'La onza líquida imperial es más chica que la US aunque el galón imperial sea más grande: el US se parte en 128 onzas y el imperial en 160',
      'La onza líquida mide VOLUMEN, no peso. Convertirla a gramos sólo funciona con agua: para harina, azúcar o aceite hace falta la densidad',
      'El cuarto y la pinta también vienen en versión US e imperial, y en Estados Unidos además existen la pinta y el cuarto "secos", para granos, que son todavía otro número',
      'Los recíprocos redondeados arrastran error: convertir con 3,78541 y volver con 0,264172 no devuelve el número original',
    ],
    plazo:
      'si la receta o el manual dice sólo "galón" u "onza" sin aclarar, mirá de dónde viene: si es de Estados Unidos es US, si es del Reino Unido, Irlanda o Canadá viejo es imperial.',
  },

  faq: [
    {
      q: '¿Cuántos litros tiene un galón?',
      a: 'Depende de cuál. El galón de Estados Unidos son 3,785411784 litros exactos y el galón imperial británico son 4,54609 litros exactos. La diferencia es del 20,09%, así que no son intercambiables: un galón imperial trae casi tres cuartos de litro más.',
    },
    {
      q: '¿Por qué el galón imperial es más grande pero la onza imperial es más chica?',
      a: 'Porque cada sistema parte su galón en una cantidad distinta de onzas. El galón US se divide en 128 onzas líquidas y el imperial en 160. Como 4,54609 dividido 160 da menos que 3,785411784 dividido 128, la onza imperial (28,41 ml) termina siendo un 4% más chica que la US (29,57 ml).',
    },
    {
      q: '¿Cuántos mililitros tiene una onza líquida?',
      a: '29,5735295625 ml si es la onza líquida de Estados Unidos y 28,4130625 ml si es la imperial. En la práctica, las recetas y las bebidas que ves en internet casi siempre usan la US, y muchas etiquetas la redondean a 30 ml.',
    },
    {
      q: '¿Un litro es lo mismo que un decímetro cúbico?',
      a: 'Sí, exactamente. Desde 1964 el litro se define como un decímetro cúbico, es decir 1000 centímetros cúbicos. Por eso 1 ml y 1 cm³ (o 1 cc, como se dice en mecánica y en medicina) son el mismo volumen, sin redondeo.',
    },
    {
      q: '¿Cuántos litros tiene un barril de petróleo?',
      a: '158,987294928 litros, porque el barril estándar son 42 galones US exactos. Es la unidad en la que se cotiza el crudo Brent y el WTI, y no coincide con ningún barril físico que se use hoy para transportar: quedó como convención del mercado.',
    },
    {
      q: '¿Cuánto es una taza en mililitros?',
      a: 'La taza estadounidense de las recetas (cup) son 8 onzas líquidas US, o sea 236,5882365 ml. La taza métrica que se usa en Australia y en buena parte de Europa son 250 ml exactos. Y las etiquetas nutricionales de Estados Unidos usan una tercera, la "legal cup" de 240 ml. En una receta chica la diferencia no se nota; en una masa, sí.',
    },
    {
      q: '¿Puedo pasar de litros a kilos con este conversor?',
      a: 'No, y no es un olvido: son magnitudes distintas. Un litro es volumen y un kilo es masa. Coinciden sólo en el agua a 4 °C, donde 1 litro pesa 1 kilo. Con aceite un litro pesa unos 920 g y con miel unos 1,4 kg. Para pasar de volumen a peso hace falta la densidad del producto.',
    },
    {
      q: '¿Cuánto es un pie cúbico en litros?',
      a: '28,316846592 litros exactos. Sale de que el pie son 12 pulgadas y la pulgada 25,4 mm exactos, así que el pie cúbico son 1728 pulgadas cúbicas de 16,387064 cm³ cada una. Es la unidad en la que vienen medidos los freezers, las heladeras y el gas natural en Estados Unidos.',
    },
    {
      q: '¿La pinta de cerveza es la misma en todos lados?',
      a: 'No. La pinta imperial, la del pub británico e irlandés, son 568,26125 ml. La pinta de Estados Unidos son 473,176473 ml, casi 100 ml menos. Por eso el mismo vaso "de una pinta" rinde distinto según de qué lado del Atlántico lo pidas.',
    },
    {
      q: '¿Por qué a veces me da un número apenas distinto al de otra calculadora?',
      a: 'Casi siempre es por los factores redondeados. Muchas calculadoras usan 3,78541 en vez de 3,785411784, o multiplican por un recíproco redondeado como 0,264172 en lugar de dividir por el factor exacto. Acá se divide siempre por el factor exacto, así que la ida y la vuelta devuelven el número original.',
    },
    {
      q: '¿Qué es el galón "seco" de Estados Unidos?',
      a: 'Es otra unidad, del sistema de áridos: mide 4,40488377086 litros y se usa para granos y frutas, no para líquidos. También existen la pinta y el cuarto secos. Este conversor trabaja con las unidades líquidas, que son las que aparecen en recetas, combustible y bebidas.',
    },
  ],

  sources: [
    {
      name: 'NIST Handbook 44 / SP 811 — Guide for the Use of the International System of Units (factores de conversión exactos)',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology (EE. UU.)',
    },
    {
      name: 'NIST Handbook 44, Appendix C — General Tables of Units of Measurement (galón US = 231 in³, galón seco, pintas y cuartos)',
      url: 'https://www.nist.gov/pml/owm/publications/nist-handbooks/handbook-44',
      publisher: 'National Institute of Standards and Technology (EE. UU.)',
    },
    {
      name: 'The Units of Measurement Regulations 1995 / Weights and Measures Act — definición del galón imperial (4,54609 L)',
      url: 'https://www.legislation.gov.uk/uksi/1995/1804/schedule/made',
      publisher: 'Legislation.gov.uk (Reino Unido)',
    },
    {
      name: 'El Sistema Internacional de Unidades (SI), 9ª edición — el litro como decímetro cúbico',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
    },
  ],

  replaces: [
    '/calculadora-conversion-litros-galones-onzas',
    '/conversor-litros-galones-mililitros',
    '/conversor-unidades-longitud-peso-volumen-temperatura',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Factor a MILILITROS de cada unidad. Todos exactos por definición.
 *  gal US = 231 in³ = 231 × 16,387064 cm³ = 3785,411784 ml
 *  gal UK = 4546,09 ml (definición legal de 1985)
 *  in³    = 25,4³ mm³ = 16,387064 ml
 */
export const UNITS: Record<string, { f: number; sym: string; name: string }> = {
  ml: { f: 1, sym: 'ml', name: 'Mililitros' },
  cl: { f: 10, sym: 'cl', name: 'Centilitros' },
  l: { f: 1000, sym: 'l', name: 'Litros' },
  cm3: { f: 1, sym: 'cm³', name: 'Centímetros cúbicos' },
  m3: { f: 1_000_000, sym: 'm³', name: 'Metros cúbicos' },
  gal_us: { f: 3785.411784, sym: 'gal US', name: 'Galones US' },
  gal_uk: { f: 4546.09, sym: 'gal UK', name: 'Galones imperiales' },
  oz_us: { f: 3785.411784 / 128, sym: 'fl oz', name: 'Onzas líquidas US' },
  oz_uk: { f: 4546.09 / 160, sym: 'fl oz UK', name: 'Onzas líquidas imperiales' },
  pt_us: { f: 3785.411784 / 8, sym: 'pt US', name: 'Pintas US' },
  pt_uk: { f: 4546.09 / 8, sym: 'pt UK', name: 'Pintas imperiales' },
  qt_us: { f: 3785.411784 / 4, sym: 'qt US', name: 'Cuartos US' },
  qt_uk: { f: 4546.09 / 4, sym: 'qt UK', name: 'Cuartos imperiales' },
  bbl: { f: 3785.411784 * 42, sym: 'bbl', name: 'Barriles de petróleo' },
  ft3: { f: 16.387064 * 1728, sym: 'ft³', name: 'Pies cúbicos' },
  in3: { f: 16.387064, sym: 'in³', name: 'Pulgadas cúbicas' },
  taza_us: { f: 3785.411784 / 16, sym: 'taza US', name: 'Tazas US (cup)' },
  taza_metrica: { f: 250, sym: 'taza', name: 'Tazas métricas' },
  cda: { f: 3785.411784 / 256, sym: 'cda', name: 'Cucharadas US' },
  cdta: { f: 3785.411784 / 768, sym: 'cdta', name: 'Cucharaditas US' },
};

/** Regla comparativa: logarítmica, de 1 ml a 1000 litros, en mililitros. */
export const SCALE = {
  min: 1,
  max: 1_000_000,
  refs: [
    { ml: 5, label: 'una cucharadita' },
    { ml: 29.5735295625, label: 'una onza líquida' },
    { ml: 250, label: 'una taza' },
    { ml: 1000, label: 'un litro de leche' },
    { ml: 1500, label: 'una botella de gaseosa de 1,5 L' },
    { ml: 10_000, label: 'un balde de 10 litros' },
    { ml: 50_000, label: 'el tanque de un auto chico' },
    { ml: 1_000_000, label: 'un tanque de agua de 1000 litros' },
  ],
};
