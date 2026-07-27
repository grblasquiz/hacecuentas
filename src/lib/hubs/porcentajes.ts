import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo calculo un porcentaje?"
 * Arquetipo RAMIFICADO: 6 ramas = las 6 formas en que la gente pregunta por
 * un porcentaje. Absorbe 6 calculadoras sueltas (ver `replaces`).
 *
 * FORMATO: el runtime ya soporta `format: 'ars' | 'plain' | 'unit'` + `unit` +
 * `decimals` por fila (ver types.ts → HubRow / HubResult). Este hub devuelve
 * números pelados, porcentajes y decimales, así que cada rama declara su
 * formato en compute(): 'plain' para cantidades, 'unit' con `unit: '%'` para
 * porcentajes y 'ars' SOLO en la rama de descuento, donde los valores sí son
 * plata. Los decimales son obligatorios acá: sin ellos un 0,25 se renderiza
 * como "0" y la página miente.
 */
export const hub: HubData = {
  slug: 'matematica/porcentajes',
  title: '¿Cómo calculo un porcentaje? — Calculadora de porcentajes 2026',
  description:
    'Cuánto es el X% de un número, qué porcentaje es A de B, cuánto aumentó o bajó algo, el precio con descuento, el número original antes del porcentaje y cómo pasar un porcentaje a fracción y decimal. Con la cuenta paso a paso.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de matemática',
  h1: '¿Cómo calculo un porcentaje?',
  lede:
    'Empezamos por la pregunta más común: cuánto es el X% de un número. Si tu cuenta es otra —qué porcentaje representa algo, cuánto subió un precio, cuánto pagás con descuento— la cambiás abajo y el hub la resuelve igual.',
  stamps: ['Actualizado 27-07-2026', '6 tipos de cuenta adentro', 'Con el paso a paso'],

  resultLabel: 'Resultado',

  cases: {
    title: '¿Qué cuenta necesitás hacer?',
    intro: 'Elegí cómo está formulada tu pregunta. La fórmula y los campos se adaptan solos.',
    items: [
      {
        id: 'pct-de-n',
        label: 'Cuánto es el X% de un número',
        hint: 'Ej.: "cuánto es el 21 por ciento de 4.500"',
        answer: 'Multiplicás el número por el porcentaje y dividís por 100.',
        yes: [
          'Fórmula: resultado = A × P ÷ 100',
          'Usá el campo "Porcentaje (P)" y el campo "Primer número (A)"',
          'Atajo mental: 10% es correr la coma un lugar; 1% es correrla dos',
          'Sirve igual para IVA (21%), propinas (10%) o comisiones',
        ],
        warn: [
          'El porcentaje se escribe sin el símbolo: 21, no 0,21 (0,21 sería el 0,21%)',
          'Un porcentaje mayor a 100 es válido: el 150% de 200 es 300',
        ],
        plazo: 'atajo: el X% de Y es siempre igual al Y% de X (el 8% de 50 = el 50% de 8 = 4).',
      },
      {
        id: 'a-de-b',
        label: 'Qué porcentaje es A de B',
        hint: 'Ej.: "30 qué porcentaje es de 200"',
        answer: 'Dividís la parte por el total y multiplicás por 100.',
        yes: [
          'Fórmula: P = A ÷ B × 100',
          '"A" es la parte y "B" es el total: 30 de 200 es el 15%',
          'Sirve para saber qué tajada del sueldo se te va en el alquiler',
          'Si A es mayor que B, el resultado pasa de 100% y está bien',
        ],
        warn: [
          'No lo confundas con la variación: acá A es una parte de B, no un valor anterior',
          'Si el total (B) es 0 no hay porcentaje posible: no se puede dividir por cero',
        ],
        plazo: 'chequeo rápido: el porcentaje que da, aplicado a B, tiene que devolverte A.',
      },
      {
        id: 'variacion',
        label: 'De cuánto aumentó o bajó',
        hint: 'Ej.: "de 200 a 240, cuánto aumentó"',
        answer: 'Restás, dividís por el valor inicial y multiplicás por 100.',
        yes: [
          'Fórmula: variación = (B − A) ÷ A × 100',
          '"A" es el valor viejo y "B" el nuevo: de 200 a 240 hay un +20%',
          'Resultado positivo = aumento; negativo = baja',
          'Es la cuenta de la inflación, de los aumentos de sueldo y de las subas de precios',
        ],
        warn: [
          'Siempre se divide por el valor INICIAL, no por el final: es el error más común',
          'Bajar 20% y después subir 20% no te devuelve al precio original: quedás 4% abajo',
        ],
        plazo: 'para volver de un −20% al precio original hace falta un +25%, no un +20%.',
      },
      {
        id: 'descuento',
        label: 'Precio con el descuento aplicado',
        hint: 'Ej.: "30% off de $45.000"',
        answer: 'Pagás el precio por (100 − descuento) dividido 100.',
        yes: [
          'Fórmula: precio final = A × (100 − P) ÷ 100',
          '"A" es el precio de lista y "P" el porcentaje de descuento',
          'Te muestra cuánto pagás y cuánto ahorrás',
          'Atajo: 30% off = pagás el 70%',
        ],
        warn: [
          'Dos descuentos seguidos no se suman: 20% + 10% da 28% efectivo, no 30%',
          'Si el descuento es "hasta X%", el X% es el tope, no lo que te van a hacer',
        ],
        plazo: 'para descuentos encadenados, aplicá el hub una vez por cada descuento, en orden.',
      },
      {
        id: 'inverso',
        label: 'El número original antes del porcentaje',
        hint: 'Ej.: "de qué número el 30 es el 15%"',
        answer: 'Despejás: el total es la parte por 100 dividido el porcentaje.',
        yes: [
          'Fórmula: total = A × 100 ÷ P',
          '"A" es el resultado que conocés y "P" el porcentaje que representa',
          'Si 30 es el 15%, el número original es 200',
          'Sirve para sacar el precio sin IVA o el sueldo bruto desde el neto',
        ],
        warn: [
          'Para sacar el precio sin IVA no se resta el 21%: se divide por 1,21',
          'Con P = 0 no hay solución: el 0% de cualquier número siempre da 0',
        ],
        plazo: 'verificá siempre: aplicá el P% al número que dio y tiene que volver a darte A.',
      },
      {
        id: 'convertir',
        label: 'Pasar el porcentaje a fracción y decimal',
        hint: 'Ej.: "25% en fracción y decimal"',
        answer: 'Un porcentaje dividido 100 es su decimal; sobre 100 y simplificado, su fracción.',
        yes: [
          'Fórmula: decimal = P ÷ 100 · fracción = P/100 simplificada',
          'Sólo se usa el campo "Porcentaje (P)"',
          '25% = 0,25 = 1/4 · 50% = 0,5 = 1/2 · 75% = 0,75 = 3/4',
          'Para multiplicar por un porcentaje en una cuenta, usá siempre la forma decimal',
        ],
        warn: [
          '0,5% no es 0,5: es 0,005. El error de la coma corrida es el más caro de todos',
          'Un porcentaje con decimales (12,5%) da una fracción menos redonda (1/8)',
        ],
        plazo: 'regla: "por ciento" quiere decir literalmente "sobre cien".',
      },
    ],
  },

  inputsTitle: 'Poné tus números',
  inputsIntro:
    'Según la rama que elijas se usan uno o dos campos. Los que sobran quedan ahí sin molestar: el resultado te dice cuáles entraron.',
  fields: [
    // Campo de texto a propósito: con type:'number' el parser del runtime borra
    // los puntos y "12.5" se convertiría en 125. Acá lo parseamos con H.num(),
    // que acepta la coma decimal rioplatense ("12,5" → 12.5).
    { id: 'pct', label: 'Porcentaje (P)', suffix: '%', value: '15' },
    { id: 'a', label: 'Primer número (A) — la parte, el precio o el valor inicial', prefix: '', value: '200', thousands: true },
    { id: 'b', label: 'Segundo número (B) — el total o el valor final', prefix: '', value: '240', thousands: true },
  ],
  fineprint:
    'Los decimales se muestran hasta donde hacen falta. En la rama de descuentos, A es el precio de lista; en la de variación, A es el valor viejo y B el nuevo.',

  chart: {
    type: 'bars',
    title: 'La parte sobre el total',
    caption:
      'La barra muestra qué tajada del total ocupa el resultado. Cuando ves la proporción dibujada, el porcentaje deja de ser una cuenta y pasa a ser una imagen: 15% es una franja finita; 80% es casi todo.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso de la fórmula, con su unidad: los porcentajes salen con el símbolo % y las cantidades sin símbolo. En la rama de descuento, donde los valores son plata, salen en pesos.',

  faq: [
    {
      q: '¿Cómo calculo el 21% de un número?',
      a: 'Multiplicás el número por 21 y dividís por 100. El 21% de 4.500 es 4.500 × 21 ÷ 100 = <b>945</b>. Atajo: el 21% es el 20% (la quinta parte) más el 1% (correr dos comas): 900 + 45 = 945.',
    },
    {
      q: '¿Qué porcentaje es 30 de 200?',
      a: 'Se divide la parte por el total y se multiplica por 100: 30 ÷ 200 × 100 = <b>15%</b>. La verificación es al revés: el 15% de 200 = 200 × 0,15 = 30 ✓.',
    },
    {
      q: 'Un precio pasó de $200 a $240, ¿cuánto aumentó en porcentaje?',
      a: 'Se resta, se divide por el valor <b>inicial</b> y se multiplica por 100: (240 − 200) ÷ 200 × 100 = <b>+20%</b>. Si lo dividieras por 240 te daría 16,7%, que es el error más frecuente en esta cuenta.',
    },
    {
      q: 'De qué número el 30 es el 15%?',
      a: 'Se despeja el total: 30 × 100 ÷ 15 = <b>200</b>. Es la cuenta inversa: conocés la parte y el porcentaje, y buscás el entero. Verificación: el 15% de 200 = 30 ✓.',
    },
    {
      q: '¿Cuánto pago con un 30% de descuento sobre $45.000?',
      a: 'Pagás el 70%: 45.000 × 70 ÷ 100 = <b>$31.500</b>, y ahorrás $13.500. El atajo es no calcular el descuento y restar, sino calcular directo lo que queda: 100 − 30 = 70.',
    },
    {
      q: '¿Por qué un 20% de descuento más un 10% no es un 30%?',
      a: 'Porque el segundo descuento se aplica sobre el precio ya rebajado, no sobre el original. Sobre $1.000: el 20% deja $800, y el 10% de $800 son $80, así que quedan <b>$720</b>. El descuento efectivo es del <b>28%</b>, no del 30%.',
    },
    {
      q: 'Si algo bajó 20%, ¿cuánto tiene que subir para volver al precio original?',
      a: 'Un <b>25%</b>, no un 20%. De $100 el −20% deja $80, y para volver a $100 hay que sumar $20 sobre una base de $80: 20 ÷ 80 × 100 = 25%. Las subas y bajas porcentuales no son simétricas porque cambia la base.',
    },
    {
      q: '¿Cómo paso 25% a fracción y a decimal?',
      a: 'El decimal es dividir por 100: 25 ÷ 100 = <b>0,25</b>. La fracción es el porcentaje sobre 100 simplificado: 25/100 → dividiendo ambos por 25 → <b>1/4</b>. Los clásicos: 50% = 0,5 = 1/2, 75% = 0,75 = 3/4, 10% = 0,1 = 1/10, 12,5% = 0,125 = 1/8.',
    },
    {
      q: '¿Cómo saco el precio sin IVA a partir del precio final?',
      a: 'No se resta el 21%: se <b>divide por 1,21</b>. Sobre $12.100 el neto es 12.100 ÷ 1,21 = <b>$10.000</b> y el IVA es $2.100. Si restaras el 21% de $12.100 te daría $9.559, que está mal por $441.',
    },
    {
      q: '¿Se puede tener un porcentaje mayor a 100?',
      a: 'Sí, siempre que la parte sea mayor que el total de referencia. Si un precio pasa de $200 a $600, el nuevo precio es el <b>300%</b> del viejo y el aumento es del <b>200%</b>. "Aumentó un 100%" quiere decir que se duplicó.',
    },
    {
      q: '¿Cuál es la forma más rápida de calcular porcentajes de memoria?',
      a: 'Descomponer en 10% y 1%. El 10% es correr la coma un lugar (de 850 → 85) y el 1% dos lugares (8,5). Con eso armás casi cualquiera: el 35% de 850 = 3 × 85 + 5 × 8,5 = 255 + 42,5 = <b>297,5</b>. Otro atajo: el X% de Y es igual al Y% de X.',
    },
  ],

  sources: [
    {
      name: 'Porcentajes: concepto, cálculo y variación porcentual (material didáctico)',
      url: 'https://www.educ.ar/recursos/buscar?tema=matematica',
      publisher: 'Educ.ar — Ministerio de Educación de la Nación',
    },
    {
      name: 'Percentages — apuntes de aritmética elemental',
      url: 'https://www.khanacademy.org/math/arithmetic/arith-review-percentages',
      publisher: 'Khan Academy',
    },
    {
      name: 'Baldor, A. — «Aritmética», capítulo de tanto por ciento (razones, proporciones y porcentajes)',
      url: 'https://openlibrary.org/search?q=baldor+aritmetica',
      publisher: 'Open Library (ficha bibliográfica)',
    },
  ],

  replaces: [
    '/calculadora-porcentajes',
    '/calculadora-porcentaje-aumento-disminucion',
    '/calculadora-porcentaje-de-numero-calculadora',
    '/calculadora-descuento-precio-final',
    '/calculadora-conversion-porcentaje-fraccion-decimal',
    '/porcentaje-inverso-de-que-numero',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
