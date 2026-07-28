import type { HubData } from './types';

/**
 * Hub de decisión — "Convertir metros, pies y pulgadas"
 * Arquetipo: CONVERSOR. NO usa `cases`: la respuesta fija va en `answer` y la
 * ramificación real la hacen los dos `select` (unidad de origen y destino) más
 * el selector de familia (longitud / superficie / metros lineales → m²).
 *
 * Absorbe 15 calculadoras sueltas de longitud y superficie (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - FORMATO: RESUELTO. El contrato ya tiene `format: 'ars'|'plain'|'unit'`,
 *    `unit` y `decimals` en HubRow/HubResult. Cada fila del desglose sale con
 *    `format: 'unit'`, el símbolo real de la unidad y decimales adaptativos
 *    (7 cifras significativas, ver `decFor()` en la página): así 25,4 mm se lee
 *    "25,40000 mm" y no "$25", y 0,00064516 m² no colapsa a "$0". El valor NO
 *    va dentro del texto de `k`.
 *  - `chart.type: 'scale'` todavía no tiene render propio: `paint()` dibuja
 *    siempre un donut y sólo usa `positionLabel` para el aria-label. Declaro
 *    `bands` y devuelvo `position` igual porque es el dato correcto de la
 *    escala comparativa (la magnitud convertida contra 1 m, una puerta de 2 m
 *    y una cancha de 100 m).
 *  - Sin `cases`, el runtime no llena las listas de "Qué te corresponde":
 *    las puebla la página desde `hub.answer` (mismo patrón que dias-entre-fechas).
 */
export const hub: HubData = {
  slug: 'conversores/longitud',
  title: 'Convertir metros, pies y pulgadas — conversor de longitud y superficie 2026',
  description:
    'Convertí metros, centímetros, milímetros, pulgadas, pies, yardas, millas, brazas y varas, y también superficies: m², hectáreas, acres y pulgadas cuadradas. Con factores exactos del Sistema Internacional y la conversión de metros lineales a metros cuadrados.',
  silo: 'Conversores',
  siloHref: '/conversores',

  eyebrow: 'Conversor de unidades',
  h1: 'Convertir metros, pies y pulgadas',
  lede:
    'Elegí la unidad que tenés y la que querés, escribí el número y listo. Sirve para longitud (metros, pulgadas, pies, millas, brazas, varas) y para superficie (m², hectáreas, acres). Si tenés metros lineales de una tela o un rollo, también te los pasamos a metros cuadrados con el ancho.',
  stamps: ['Actualizado 27-07-2026', 'Factores exactos del SI (BIPM/NIST)', '15 conversores adentro'],

  resultLabel: 'Resultado de la conversión',

  inputsTitle: 'Qué querés convertir',
  inputsIntro:
    'Primero elegí la familia de unidades: si mezclás longitud con superficie el resultado no tiene sentido. El ancho sólo se usa para pasar metros lineales a metros cuadrados.',
  fields: [
    {
      id: 'familia',
      label: 'Qué estás midiendo',
      type: 'select',
      value: 'longitud',
      options: [
        { value: 'longitud', label: 'Longitud (largo, distancia)' },
        { value: 'superficie', label: 'Superficie (área)' },
        { value: 'lineal', label: 'Metros lineales → metros cuadrados' },
      ],
    },
    // OJO: van como `text` a propósito. El parser del runtime (`num()`) borra
    // los puntos para leer miles al estilo es-AR, así que un `number` con
    // "1.5" se leería 15. Como `text` llega el string crudo y lo parseamos acá,
    // aceptando tanto coma como punto decimal.
    { id: 'valor', label: 'Cantidad a convertir', value: '1' },
    {
      id: 'desde',
      label: 'Unidad de origen',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'Metro (m)' },
        { value: 'cm', label: 'Centímetro (cm)' },
        { value: 'mm', label: 'Milímetro (mm)' },
        { value: 'km', label: 'Kilómetro (km)' },
        { value: 'in', label: 'Pulgada (in)' },
        { value: 'ft', label: 'Pie / foot (ft)' },
        { value: 'yd', label: 'Yarda (yd)' },
        { value: 'mi', label: 'Milla terrestre (mi)' },
        { value: 'nmi', label: 'Milla náutica (M)' },
        { value: 'braza', label: 'Braza / fathom (1,8288 m)' },
        { value: 'vara', label: 'Vara castellana (0,8359 m)' },
        { value: 'varaar', label: 'Vara argentina (0,866 m)' },
        { value: 'm2', label: 'Metro cuadrado (m²)' },
        { value: 'cm2', label: 'Centímetro cuadrado (cm²)' },
        { value: 'km2', label: 'Kilómetro cuadrado (km²)' },
        { value: 'ha', label: 'Hectárea (ha)' },
        { value: 'acre', label: 'Acre' },
        { value: 'in2', label: 'Pulgada cuadrada (in²)' },
        { value: 'ft2', label: 'Pie cuadrado (ft²)' },
        { value: 'vara2', label: 'Vara cuadrada castellana (vr²)' },
      ],
    },
    {
      id: 'hasta',
      label: 'Unidad de destino',
      type: 'select',
      value: 'ft',
      options: [
        { value: 'm', label: 'Metro (m)' },
        { value: 'cm', label: 'Centímetro (cm)' },
        { value: 'mm', label: 'Milímetro (mm)' },
        { value: 'km', label: 'Kilómetro (km)' },
        { value: 'in', label: 'Pulgada (in)' },
        { value: 'ft', label: 'Pie / foot (ft)' },
        { value: 'yd', label: 'Yarda (yd)' },
        { value: 'mi', label: 'Milla terrestre (mi)' },
        { value: 'nmi', label: 'Milla náutica (M)' },
        { value: 'braza', label: 'Braza / fathom (1,8288 m)' },
        { value: 'vara', label: 'Vara castellana (0,8359 m)' },
        { value: 'varaar', label: 'Vara argentina (0,866 m)' },
        { value: 'm2', label: 'Metro cuadrado (m²)' },
        { value: 'cm2', label: 'Centímetro cuadrado (cm²)' },
        { value: 'km2', label: 'Kilómetro cuadrado (km²)' },
        { value: 'ha', label: 'Hectárea (ha)' },
        { value: 'acre', label: 'Acre' },
        { value: 'in2', label: 'Pulgada cuadrada (in²)' },
        { value: 'ft2', label: 'Pie cuadrado (ft²)' },
        { value: 'vara2', label: 'Vara cuadrada castellana (vr²)' },
      ],
    },
    {
      id: 'ancho',
      label: 'Ancho del rollo o de la tela (sólo para metros lineales → m²)',
      suffix: 'm',
      value: '1,50',
    },
  ],
  fineprint:
    'Los factores pulgada, pie, yarda, milla, milla náutica, braza y acre son exactos por definición internacional. La vara es una unidad histórica: fijate cuál usa tu escritura antes de confiar el número.',

  chart: {
    type: 'scale',
    title: 'Qué tamaño es eso, en la vida real',
    caption:
      'La regla va de 1 milímetro a 1 kilómetro en escala logarítmica, con referencias reconocibles: una moneda de 1 cm, una regla de 30 cm, 1 metro, una puerta de 2 m, una pileta de 25 m y una cancha de fútbol de 100 m. Tu medida convertida queda marcada sobre esa regla, así ves la magnitud y no sólo el número.',
    bands: [
      { label: '1 mm a 1 cm — grosor de un cable', from: 0.001, to: 0.01, tone: 'neutral' },
      { label: '1 cm a 10 cm — una moneda, un celular', from: 0.01, to: 0.1, tone: 'neutral' },
      { label: '10 cm a 1 m — una regla de 30 cm, un paso', from: 0.1, to: 1, tone: 'good' },
      { label: '1 m a 10 m — una puerta de 2 m, un auto', from: 1, to: 10, tone: 'good' },
      { label: '10 m a 100 m — una pileta de 25 m, una cancha', from: 10, to: 100, tone: 'warn' },
      { label: '100 m a 1 km — una cuadra, diez canchas', from: 100, to: 1000, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Tu medida en todas las unidades de la familia',
  breakdownIntro:
    'La conversión que pediste queda destacada. Las barras comparan el número de cada unidad entre sí, así que las unidades chicas (mm, cm²) siempre dan barras largas: mirá el valor, no la barra.',

  answer: {
    title: 'Los factores que importan, sin vueltas',
    copy:
      'Todas estas conversiones son factores fijos definidos por acuerdo internacional: no cambian con el tiempo ni con el país. La pulgada mide exactamente 25,4 mm desde 1959 y de ahí salen el pie, la yarda y la milla.',
    yes: [
      '1 pulgada = 25,4 mm exactos (0,0254 m) — de ahí, 1 mm = 0,03937 pulgadas',
      '1 pie = 12 pulgadas = 0,3048 m exactos · 1 yarda = 3 pies = 0,9144 m',
      '1 milla terrestre = 1.609,344 m · 1 milla náutica = 1.852 m exactos',
      '1 braza (fathom) = 6 pies = 1,8288 m — la unidad de las cartas náuticas',
      '1 hectárea = 10.000 m² · 1 acre = 4.046,8564224 m² ≈ 0,4047 ha',
      '1 vara castellana = 0,8359 m · 1 vara argentina = 0,866 m (escrituras previas a 1871)',
      'Metros lineales a m²: metros lineales × ancho del rollo en metros',
    ],
    warn: [
      'Longitud y superficie no se convierten entre sí: un metro no se transforma en un metro cuadrado sin un ancho',
      'Al pasar a unidades cuadradas el factor va al cuadrado: 1 m = 3,2808 ft, pero 1 m² = 10,7639 ft²',
      'La vara no es única: la castellana (0,8359 m) y la argentina o bonaerense (0,866 m) difieren casi 4 cm por vara, y en un lote grande eso son metros',
      'El acre estadounidense de agrimensura (survey acre) difiere en 4 partes por millón del acre internacional: en agro no cambia nada, en catastro sí puede',
      'En pantallas, las pulgadas se miden sobre la diagonal, no sobre el ancho',
    ],
    plazo: 'los factores del SI son permanentes; no hay actualización anual que esperar.',
  },

  faq: [
    {
      q: '¿Cuánto es 1 metro en pies y pulgadas?',
      a: '1 metro = 3,28084 pies = 39,3701 pulgadas. Expresado como los anglosajones lo dicen, 1 metro son 3 pies con 3,37 pulgadas. El camino inverso: 1 pie = 0,3048 m exactos y 1 pulgada = 0,0254 m exactos.',
    },
    {
      q: '¿Cuánto es 1 pulgada en centímetros y en milímetros?',
      a: '1 pulgada = 2,54 cm = 25,4 mm, y es un valor exacto por definición desde el acuerdo de la yarda y la libra de 1959 (recogido por el NIST). No es una aproximación: la pulgada internacional se define a partir del metro.',
    },
    {
      q: '¿Cómo paso metros lineales a metros cuadrados?',
      a: 'Multiplicando por el ancho del rollo o de la pieza: metros cuadrados = metros lineales × ancho en metros. Con una tela de 1,50 m de ancho, 10 metros lineales son 15 m². Sin el ancho la conversión no existe, porque un metro lineal no contiene información de área. Elegí la opción "Metros lineales → metros cuadrados" y completá el ancho.',
    },
    {
      q: '¿Cuántos metros cuadrados tiene una hectárea y cuántos un acre?',
      a: 'Una hectárea son 10.000 m², es decir un cuadrado de 100 × 100 m. Un acre son 4.046,8564224 m², o sea 0,404686 hectáreas. Al revés: 1 hectárea = 2,47105 acres. Para el campo argentino la unidad de referencia es la hectárea; el acre aparece en documentación en inglés.',
    },
    {
      q: '¿Por qué el factor cambia cuando la unidad es cuadrada?',
      a: 'Porque la superficie es una longitud al cuadrado, así que el factor también se eleva al cuadrado. 1 pie = 0,3048 m, entonces 1 pie² = 0,3048² = 0,09290304 m². Lo mismo con la pulgada: 1 in = 2,54 cm y 1 in² = 6,4516 cm². Es el error más común al convertir planos.',
    },
    {
      q: '¿Cuánto es una milla en kilómetros, y una milla náutica?',
      a: 'La milla terrestre son 1,609344 km exactos, así que 5 millas son 8,05 km y una ida y vuelta de 5 millas son 16,09 km. La milla náutica es otra unidad: 1.852 m exactos, definida sobre un minuto de arco de meridiano, y es la que se usa en navegación y aviación junto al nudo (1 nudo = 1 milla náutica por hora).',
    },
    {
      q: '¿Cuánto mide una braza y para qué se usa?',
      a: 'La braza o fathom equivale a 6 pies, es decir 1,8288 m exactos. Se usa para profundidades en cartas náuticas y para cabos y cadenas: 10 brazas de profundidad son 18,29 m. Muchas cartas antiguas están en brazas y las modernas en metros, así que conviene revisar la leyenda antes de fondear.',
    },
    {
      q: '¿Cuánto vale una vara en metros?',
      a: 'Depende de cuál. La vara castellana mide 0,8359 m y la vara argentina o bonaerense, fijada en 1835, mide 0,866 m. Argentina adoptó el sistema métrico en 1871, pero las escrituras rurales siguieron en varas durante décadas: si el documento es de Buenos Aires y previo a 1871, lo más probable es que use la vara de 0,866 m. En varas cuadradas los factores son 0,699 m² y 0,750 m².',
    },
    {
      q: '¿Las pulgadas de un televisor se miden igual?',
      a: 'La pulgada es la misma (2,54 cm), pero se mide sobre la diagonal de la pantalla, no sobre el ancho. Un televisor de 55 pulgadas tiene 139,7 cm de diagonal; su ancho real, en formato 16:9, ronda los 121,8 cm. Para saber si entra en un mueble, convertí el ancho, no la diagonal.',
    },
    {
      q: '¿Cuántos milímetros tiene un centímetro y cuántos una pulgada?',
      a: '1 centímetro = 10 mm y 1 pulgada = 25,4 mm. Para pasar de milímetros a pulgadas se divide por 25,4: 100 mm son 3,937 pulgadas. Es la conversión típica de tornillería, caños y llaves, donde media pulgada son 12,7 mm y tres cuartos de pulgada, 19,05 mm.',
    },
  ],

  sources: [
    {
      name: 'El Sistema Internacional de Unidades (SI), 9.ª edición — definición del metro',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
      date: '9.ª edición vigente',
    },
    {
      name: 'NIST Special Publication 811 — Guide for the Use of the International System of Units (factores de conversión exactos)',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology (NIST)',
    },
    {
      name: 'NIST Handbook 44, Apéndice C — tablas de unidades y equivalencias (pulgada, pie, yarda, milla, acre)',
      url: 'https://www.nist.gov/pml/owm/publications/nist-handbooks/nist-handbook-44',
      publisher: 'NIST Office of Weights and Measures',
    },
  ],

  replaces: [
    '/calculadora-conversor-metros-lineales-a-metros-cuadrados',
    '/calculadora-conversor-milimetros-a-pulgadas',
    '/conversor-pulgadas-a-centimetros',
    '/calculadora-conversion-millas-kilometros-nudos-velocidad',
    '/conversor-metros-cuadrados-hectareas-acres',
    '/calculadora-conversion-milla-kilometro-ida-vuelta',
    '/calculadora-conversion-metro-pie-feet-exacto',
    '/calculadora-conversor-brazas-a-metros',
    '/calculadora-conversor-pies-a-metros',
    '/calculadora-conversor-varas-a-metros',
    '/calculadora-conversor-pulgadas-cuadradas-a-centimetros-cuadrados',
    '/calculadora-conversor-acres-a-hectareas',
    '/calculadora-conversor-pies-a-pulgadas',
    '/calculadora-conversor-hectareas-a-metros-cuadrados',
    '/calculadora-conversion-pulgada-centimetro-screen',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-conversor-micrometros-a-milimetros',
    '/calculadora-anos-luz-distancia-conversion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Factores a la unidad base de cada familia.
 *  - longitud   → metros
 *  - superficie → metros cuadrados
 * Los marcados "exacto" lo son por definición internacional (NIST SP 811).
 */
export const UNITS: Record<
  string,
  { fam: 'longitud' | 'superficie'; f: number; sym: string; name: string }
> = {
  m: { fam: 'longitud', f: 1, sym: 'm', name: 'Metros' },
  cm: { fam: 'longitud', f: 0.01, sym: 'cm', name: 'Centímetros' },
  mm: { fam: 'longitud', f: 0.001, sym: 'mm', name: 'Milímetros' },
  km: { fam: 'longitud', f: 1000, sym: 'km', name: 'Kilómetros' },
  in: { fam: 'longitud', f: 0.0254, sym: 'in', name: 'Pulgadas' },
  ft: { fam: 'longitud', f: 0.3048, sym: 'ft', name: 'Pies' },
  yd: { fam: 'longitud', f: 0.9144, sym: 'yd', name: 'Yardas' },
  mi: { fam: 'longitud', f: 1609.344, sym: 'mi', name: 'Millas terrestres' },
  nmi: { fam: 'longitud', f: 1852, sym: 'M', name: 'Millas náuticas' },
  braza: { fam: 'longitud', f: 1.8288, sym: 'br', name: 'Brazas' },
  vara: { fam: 'longitud', f: 0.8359, sym: 'vr', name: 'Varas castellanas' },
  varaar: { fam: 'longitud', f: 0.866, sym: 'vr arg', name: 'Varas argentinas' },

  m2: { fam: 'superficie', f: 1, sym: 'm²', name: 'Metros cuadrados' },
  cm2: { fam: 'superficie', f: 0.0001, sym: 'cm²', name: 'Centímetros cuadrados' },
  km2: { fam: 'superficie', f: 1e6, sym: 'km²', name: 'Kilómetros cuadrados' },
  ha: { fam: 'superficie', f: 10000, sym: 'ha', name: 'Hectáreas' },
  acre: { fam: 'superficie', f: 4046.8564224, sym: 'ac', name: 'Acres' },
  in2: { fam: 'superficie', f: 0.00064516, sym: 'in²', name: 'Pulgadas cuadradas' },
  ft2: { fam: 'superficie', f: 0.09290304, sym: 'ft²', name: 'Pies cuadrados' },
  vara2: { fam: 'superficie', f: 0.69873, sym: 'vr²', name: 'Varas cuadradas' },
};

/** Regla comparativa: logarítmica, de 1 mm a 1 km, con referencias reales. */
export const SCALE = {
  min: 0.001,
  max: 1000,
  refs: [
    { m: 0.0254, label: 'una pulgada' },
    { m: 0.3, label: 'una regla de 30 cm' },
    { m: 1, label: '1 metro' },
    { m: 2, label: 'una puerta de 2 m' },
    { m: 25, label: 'una pileta de 25 m' },
    { m: 100, label: 'una cancha de fútbol' },
  ],
};
