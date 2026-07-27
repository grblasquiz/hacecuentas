import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me toca de la herencia y cuánto cuesta la sucesión?"
 *
 * Une las dos mitades de la misma pregunta, que hoy viven en calculadoras
 * sueltas: el reparto forzoso del Código Civil y Comercial (legítima, arts.
 * 2444-2450) y el costo real de tramitar el juicio sucesorio (honorarios,
 * tasa de justicia, aportes y gastos).
 *
 * Los números salen de las fórmulas reales:
 *  - src/lib/formulas/herencia-legitima.ts  (fracciones de legítima y reparto)
 *  - src/lib/formulas/sucesion-costo.ts     (escala de honorarios, tasa, otros)
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'legal'). */
const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

export const hub: HubData = {
  slug: 'familia/herencia',
  title: '¿Cuánto me toca de la herencia y cuánto cuesta la sucesión? — Calculadora',
  description:
    'Calculá la legítima que protege el Código Civil y Comercial (2/3 para los hijos, 1/2 para el cónyuge o los padres), cuánto le queda a cada heredero y cuánto se lleva la sucesión en honorarios, tasa de justicia y gastos.',
  silo: 'Familia',
  siloHref: '/familia',

  eyebrow: 'Guía y estimación sucesoria',
  h1: 'Falleció un familiar: cuánto te toca y cuánto cuesta la sucesión.',
  lede:
    'Partimos del caso más habitual: hijos que heredan sin cónyuge. Vas a ver la legítima que la ley les blinda, la porción que se puede testar libremente y lo que se lleva el trámite antes de que la plata llegue a los herederos.',
  stamps: ['Código Civil y Comercial, arts. 2444-2450', 'Costos de sucesión estimados', '5 calculadoras adentro'],

  resultLabel: 'Lo que le queda a cada heredero',

  cases: {
    title: '¿Quiénes heredan?',
    intro: 'El orden de los herederos forzosos define la fracción protegida. Elegí el que corresponda.',
    items: [
      {
        id: 'hijos',
        label: 'Hijos, sin cónyuge',
        hint: 'El caso más común',
        answer: 'Con hijos, la legítima es 2/3 del acervo y se reparte en partes iguales.',
        yes: [
          'Legítima de 2/3 del acervo hereditario (Art. 2445 CCyC)',
          'Se divide en partes iguales entre todos los hijos, sin importar el orden ni si son de distintas parejas',
          'El tercio restante es porción disponible: se puede dejar por testamento a quien sea',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Los hijos adoptivos y los nacidos fuera del matrimonio heredan exactamente igual que los demás (Art. 2430 CCyC)',
        ],
        plazo: 'no hay plazo para iniciar la sucesión, pero la tasa de justicia y los honorarios se calculan sobre valores actualizados: cuanto más tardás, más caro sale.',
      },
      {
        id: 'hijos-conyuge',
        label: 'Hijos y cónyuge',
        hint: 'Art. 2433 CCyC',
        answer: 'El cónyuge hereda como un hijo más sobre los bienes propios del causante.',
        yes: [
          'Legítima de 2/3, dividida entre los hijos y el cónyuge en partes iguales',
          'Sobre los bienes propios, el cónyuge concurre como un hijo más (Art. 2433 CCyC)',
          'Sobre los gananciales el cónyuge ya se queda con su mitad y no hereda de la otra',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Esta estimación trata todo el acervo como bien propio. Si hay gananciales, el reparto real cambia: la mitad ganancial del cónyuge no entra en la masa hereditaria',
        ],
        plazo: 'antes de calcular, separá bienes propios de gananciales: es lo que más mueve el resultado.',
      },
      {
        id: 'conyuge-solo',
        label: 'Solo el cónyuge',
        hint: 'Sin hijos ni ascendientes',
        answer: 'Sin descendientes ni ascendientes, la legítima del cónyuge es 1/2.',
        yes: [
          'Legítima de 1/2 del acervo para el cónyuge supérstite (Art. 2444 y 2445 CCyC)',
          'La otra mitad es porción disponible y puede testarse a favor de cualquiera',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El divorcio hace perder la vocación hereditaria. La separación de hecho sin voluntad de unirse también (Art. 2437 CCyC)',
        ],
        plazo: 'el conviviente en unión convivencial NO es heredero forzoso: si no hay testamento, no hereda.',
      },
      {
        id: 'padres',
        label: 'Los padres',
        hint: 'Sin hijos ni cónyuge',
        answer: 'Los ascendientes tienen una legítima de 1/2, que se reparte entre ellos.',
        yes: [
          'Legítima de 1/2 del acervo para los ascendientes (Art. 2445 CCyC)',
          'Se divide en partes iguales entre los padres vivos',
          'La otra mitad es porción disponible',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Los ascendientes heredan solo si no hay descendientes: un solo hijo los desplaza por completo',
        ],
        plazo: 'si vive un solo padre, se lleva toda la legítima de los ascendientes.',
      },
      {
        id: 'padres-conyuge',
        label: 'Padres y cónyuge',
        hint: 'Concurrencia Art. 2434',
        answer: 'Cónyuge y ascendientes concurren: mitad y mitad de la legítima.',
        yes: [
          'Legítima de 1/2 del acervo',
          'La mitad de esa legítima va al cónyuge y la otra mitad se reparte entre los ascendientes (Art. 2434 CCyC)',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Si hay bienes gananciales, el cónyuge desplaza a los ascendientes sobre esa masa: acá se estima todo como bien propio',
        ],
        plazo: 'pedí el certificado de dominio y el informe de bienes antes de acordar el reparto.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después con el avalúo real.',
  fields: [
    {
      id: 'acervo',
      label: 'Valor total del acervo hereditario',
      prefix: '$',
      value: '120.000.000',
      thousands: true,
      help: 'Todo lo que deja el causante: inmuebles, autos, plazos fijos, acciones. Si hay deudas, restalas antes.',
    },
    { id: 'hijos', label: 'Cantidad de hijos', type: 'number', min: 0, max: 15, value: 2 },
    {
      id: 'jurisdiccion',
      label: 'Dónde tramita la sucesión',
      type: 'select',
      value: 'caba',
      options: [
        { value: 'caba', label: 'CABA (tasa 3%)' },
        { value: 'pba', label: 'Provincia de Buenos Aires (tasa 2,2%)' },
        { value: 'otra', label: 'Otra provincia (tasa 2,5%)' },
      ],
    },
    {
      id: 'tipo',
      label: 'Tipo de sucesión',
      type: 'select',
      value: 'intestada',
      options: [
        { value: 'intestada', label: 'Sin testamento (ab intestato)' },
        { value: 'testamentaria', label: 'Con testamento' },
      ],
    },
  ],
  fineprint: DISCLAIMER_LEGAL,

  chart: {
    type: 'donut',
    title: 'A dónde va el acervo',
    caption:
      'Tres destinos: la legítima que la ley blinda para los herederos forzosos, la porción de libre disposición y lo que se lleva el trámite en honorarios, tasa y gastos.',
  },
  breakdownTitle: 'Cómo se parte el acervo',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande.',

  faq: [
    {
      q: '¿Qué es la legítima y quiénes son herederos forzosos?',
      a: 'La legítima es la porción del patrimonio que el Código Civil y Comercial reserva por ley a ciertos parientes y que el causante no puede sacarles por testamento. Son herederos forzosos los descendientes, los ascendientes y el cónyuge (Art. 2444). La legítima es de 2/3 para los descendientes y de 1/2 para ascendientes y cónyuge (Art. 2445).',
    },
    {
      q: '¿Cuánto puedo dejar libremente por testamento?',
      a: 'La porción disponible es lo que queda después de la legítima: un tercio del acervo si hay hijos, y la mitad si heredan el cónyuge o los ascendientes. Sobre esa porción podés testar a favor de quien quieras, incluso de alguien que no es familiar.',
    },
    {
      q: '¿Puedo mejorar a un hijo con discapacidad?',
      a: 'Sí. El Art. 2448 permite disponer, además de la porción disponible, de un tercio más de las porciones legítimas para mejorar a un heredero con discapacidad. Es la única mejora reforzada que admite el Código.',
    },
    {
      q: '¿Qué pasa si el causante donó bienes en vida?',
      a: 'Las donaciones se traen a colación y se computan para calcular la legítima (Art. 2445). Si una donación la afecta, los herederos forzosos pueden pedir la reducción o la acción de complemento dentro de los plazos de los arts. 2450 a 2459.',
    },
    {
      q: '¿Cuánto cuesta hacer una sucesión?',
      a: 'La estimación habitual combina tres cosas: honorarios del abogado —que se regulan sobre el acervo con una escala decreciente, del orden del 10% en acervos chicos al 3% en los grandes—, la tasa de justicia de la jurisdicción (3% en CABA, 2,2% en provincia de Buenos Aires) y entre 1% y 2% de aportes previsionales, edictos, certificados e inscripciones registrales.',
    },
    {
      q: '¿La sucesión con testamento es más cara?',
      a: 'Suele serlo. El trámite testamentario suma la protocolización y el control de forma del testamento, y esa etapa extra se refleja en los honorarios: en esta estimación agrega alrededor de un punto porcentual sobre el acervo.',
    },
    {
      q: '¿El conviviente hereda?',
      a: 'No como heredero forzoso. La unión convivencial no genera vocación hereditaria: si el causante no dejó testamento a su favor, el conviviente no hereda, aunque sí puede reclamar la atribución de la vivienda por hasta dos años (Art. 527 CCyC).',
    },
    {
      q: '¿Qué pasa si un heredero no quiere firmar?',
      a: 'La sucesión sigue igual. El juez declara herederos a quienes acrediten el vínculo, y si no hay acuerdo sobre la partición se recurre a la partición judicial con tasación y sorteo de hijuelas. Eso alarga el trámite y encarece los honorarios.',
    },
    {
      q: '¿Se paga impuesto a la herencia en Argentina?',
      a: 'A nivel nacional no existe. La provincia de Buenos Aires tiene un impuesto a la transmisión gratuita de bienes con mínimos no imponibles y alícuotas propias; el resto de las jurisdicciones no lo aplica. Esta estimación no lo incluye: verificalo en ARBA si el trámite es bonaerense.',
    },
    {
      q: '¿Hay plazo para iniciar la sucesión?',
      a: 'No hay un plazo de caducidad para abrirla, pero conviene no demorar: sin declaratoria de herederos no se puede vender ni escriturar ningún bien, las expensas e impuestos siguen corriendo y la base de cálculo de honorarios y tasa se actualiza con el valor del bien.',
    },
    {
      q: '¿Los honorarios del abogado se pactan o los regula el juez?',
      a: 'Se pueden pactar por escrito, pero el juez los regula al final del proceso según la ley arancelaria y el valor del acervo. Si el pacto es muy superior a la regulación, se discute; si es muy inferior, el abogado igual puede reclamar el mínimo arancelario.',
    },
    {
      q: '¿Se puede renunciar a la herencia?',
      a: 'Sí, con una renuncia expresa hecha por escritura pública o en el expediente (Art. 2299). Se usa cuando el pasivo supera al activo: quien renuncia se considera que nunca fue heredero y no responde por las deudas.',
    },
  ],

  sources: [
    {
      name: 'Código Civil y Comercial de la Nación (Ley 26.994) — arts. 2444 a 2450, legítima y porción disponible',
      url: 'https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975',
      publisher: 'Argentina.gob.ar — Normativa',
    },
    {
      name: 'Derecho Fácil — Sucesiones y herencia explicadas',
      url: 'https://www.argentina.gob.ar/justicia/derechofacil',
      publisher: 'Ministerio de Justicia de la Nación',
    },
    {
      name: 'Colegio Público de Abogados de la Capital Federal — aranceles y honorarios profesionales',
      url: 'https://www.cpacf.org.ar/',
      publisher: 'CPACF',
    },
    {
      name: 'Poder Judicial de la Nación — tasa de justicia y trámite sucesorio',
      url: 'https://www.pjn.gov.ar/',
      publisher: 'PJN',
    },
  ],

  replaces: [
    '/calculadora-sucesion-costo',
    '/calculadora-honorarios-abogado',
    '/calculadora-sucesion-costo-honorarios-abogado-inmueble',
    '/calculadora-herencia-legitima',
    '/calculadora-sucesiones-costo-total-argentina-abogado',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Fracción de legítima y cómo se reparte, por caso.
 * Espejo de src/lib/formulas/herencia-legitima.ts.
 *  - fraccion: porción del acervo protegida por la ley
 *  - reparto:  'hijos' | 'hijos+conyuge' | 'unico' | 'padres' | 'conyuge+padres'
 */
export const CASE_HERENCIA: Record<string, { fraccion: number; reparto: string; ref: string }> = {
  hijos: { fraccion: 2 / 3, reparto: 'hijos', ref: 'Art. 2445' },
  'hijos-conyuge': { fraccion: 2 / 3, reparto: 'hijos+conyuge', ref: 'Art. 2433' },
  'conyuge-solo': { fraccion: 1 / 2, reparto: 'unico', ref: 'Art. 2445' },
  padres: { fraccion: 1 / 2, reparto: 'padres', ref: 'Art. 2445' },
  'padres-conyuge': { fraccion: 1 / 2, reparto: 'conyuge+padres', ref: 'Art. 2434' },
};

/** Tasa de justicia por jurisdicción. Espejo de src/lib/formulas/sucesion-costo.ts. */
export const TASA_JUSTICIA: Record<string, number> = { caba: 0.03, pba: 0.022, otra: 0.025 };

/** Otros gastos: aportes, edictos, certificados e inscripciones. */
export const OTROS_GASTOS = 0.015;
