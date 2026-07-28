import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Me conviene Fonasa o una Isapre, y cuánto pago de mi bolsillo?"
 *
 * Absorbe cuatro calculadoras de salud (tramos Fonasa, cotización Isapre, copago/bonificación
 * y comparación con el médico particular) más una de calorías que sólo se absorbe por URL.
 *
 * ─── Por qué este hub NO copia las fórmulas viejas ───────────────────────────────────────
 * 1) `fonasa-chile-tramos-a-b-c-d-cobertura.ts:29` define `const UF_2026 = 780000` y arma los
 *    cortes de tramo como UF_2026 × 0,5 ($390.000) y UF_2026 × 1,0 ($780.000). Ese número no
 *    es la UF (la UF vale ~$40.845) ni ninguna magnitud legal: es una variable inventada y mal
 *    nombrada. El criterio real (DFL 1/2005 Salud, Art. 160) se define contra el INGRESO MÍNIMO
 *    MENSUAL: B = ingreso ≤ IMM, C = > IMM y ≤ 1,46 × IMM, D = > 1,46 × IMM.
 * 2) La misma fórmula cobra 10% de copago en tramo C y 20% en tramo D. Eso dejó de existir:
 *    desde septiembre de 2022 rige el Copago Cero en la red pública (MAI) para TODOS los tramos.
 *    La diferencia real entre B, C y D está en la Modalidad de Libre Elección (bonos en
 *    prestadores privados en convenio), no en el hospital público.
 *
 * Los cortes de tramo se calculan con la REGLA (IMM y 1,46 × IMM) sobre un IMM editable, no con
 * un par de números fijos: Fonasa publica su tabla con rezago y suele mostrar el IMM anterior.
 * UF y UTM son datos VIVOS (src/data/live/chile.json). El tope imponible son 90 UF.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'health'). */
export const DISCLAIMER_HEALTH =
  'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.';

/** Indicadores vivos, con el mismo fallback que usan las fórmulas del repo. */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

export const SALUD = {
  /** 7% legal de cotización de salud — Ley 18.469 / DFL 1 de 2005. */
  cotizacionLegal: CHILE_2026.saludFonasa,
  /** Tope imponible de las cotizaciones, en UF — Superintendencia de Pensiones. */
  topeImponibleUf: CHILE_2026.topeImponibleAfpUf,
  /** Ingreso mínimo mensual vigente — Ley 21.830, desde 01-05-2026. */
  imm: CHILE_2026.imm,
  /** Factor legal que separa el tramo C del D: 1,46 veces el ingreso mínimo mensual. */
  factorTramoC: 1.46,
  /** Cargas familiares acreditadas que bajan un tramo (C→B, D→C). */
  cargasParaBajarTramo: 3,
  /** Fecha del dato del IMM: es el parámetro que mueve los cortes de tramo. */
  immFecha: '2026-05-01',
} as const;

/**
 * Bonificación referencial de la Modalidad de Libre Elección por nivel del prestador
 * (fracción del arancel que cubre Fonasa). Espejo EXACTO de BONIF_MLE en
 * src/lib/formulas/copago-bonificacion-fonasa-chile.ts. El valor exacto depende del código de
 * prestación y del arancel MLE vigente: es orientativo, no un porcentaje garantizado.
 */
export const BONIF_MLE: Array<{ id: string; nombre: string; bonif: number }> = [
  { id: '1', nombre: 'Nivel 1 — arancel base, la que más bonifica', bonif: 0.6 },
  { id: '2', nombre: 'Nivel 2 — intermedio', bonif: 0.45 },
  { id: '3', nombre: 'Nivel 3 — prestador más caro, menos bonificación', bonif: 0.3 },
];

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/vida/fonasa-o-isapre',
  title: 'Fonasa o Isapre: en qué tramo caes y cuánto pagas de tu bolsillo',
  description:
    'Compara el 7% legal de Fonasa contra el precio de un plan de Isapre en UF, mira en qué tramo de Fonasa caes según el ingreso mínimo mensual, cuánto es el copago de una atención con bono, en la red pública o de forma particular, y cuánto te cuesta cada sistema al año.',
  silo: 'Vida',
  siloHref: '/cl/vida',
  locale: 'cl',

  eyebrow: 'Chile · salud previsional',
  h1: '¿Me conviene Fonasa o una Isapre, y cuánto voy a pagar de mi bolsillo?',
  lede:
    'Los dos sistemas parten del mismo 7% legal de tu renta imponible. La diferencia es qué haces con él: en Fonasa te ubica en un tramo (A, B, C o D) y en una Isapre compra un plan que casi siempre cuesta más. Pon tu sueldo y mira en qué tramo caes, cuánto pagarías por una atención en cada vía y cuánto suma el año completo.',
  stamps: [
    `Ingreso mínimo mensual: ${fmt(SALUD.imm)} · Ley 21.830`,
    `Cortes de tramo: ${fmt(SALUD.imm)} y ${fmt(SALUD.imm * SALUD.factorTramoC)} (1,46 × IMM)`,
    `Tope imponible: ${SALUD.topeImponibleUf} UF = ${fmt(SALUD.topeImponibleUf * UF)}`,
    'Copago Cero en la red pública para todos los tramos',
    '4 situaciones en una sola página',
  ],

  resultLabel: 'Gasto anual estimado en salud',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos por lo más consultado: estás en Fonasa y quieres saber qué tramo te toca y cuánto te cuesta atenderte.',
    items: [
      {
        id: 'fonasa-tramo',
        label: 'Estoy en Fonasa: ¿qué tramo soy y cuánto copago?',
        hint: 'El tramo se define contra el ingreso mínimo mensual, no contra la UF.',
        yes: [
          'Cotización del 7% legal sobre tu renta imponible, topada en 90 UF',
          'Tramo A, B, C o D según tu ingreso imponible comparado con el ingreso mínimo mensual',
          'Copago Cero en la red pública (MAI): hospital, Cesfam y CRS no te cobran, seas del tramo que seas',
          'Copago de la Modalidad de Libre Elección si compras un bono en un prestador privado en convenio',
          'Si tienes 3 o más cargas acreditadas, bajas un tramo (D pasa a C, C pasa a B)',
        ],
        warn: [
          DISCLAIMER_HEALTH,
          'Los cortes de tramo son el ingreso mínimo mensual y 1,46 veces ese valor: como el IMM se reajusta por ley, los cortes se mueven con él (por eso el campo es editable)',
          'Fonasa actualiza su tabla publicada con rezago y puede estar mostrando todavía el ingreso mínimo anterior: si el corte que ves en fonasa.cl no coincide, manda el de Fonasa',
          'En la red pública tu tramo ya no cambia lo que pagas: desde el Copago Cero la diferencia entre B, C y D se nota sólo al comprar bonos en la Modalidad de Libre Elección',
          'La bonificación de la libre elección depende del nivel del prestador y del código de la prestación: acá va un porcentaje referencial, no el valor exacto de tu bono',
        ],
        plazo:
          'el tramo se actualiza cuando cambia tu renta informada; puedes revisarlo y acreditar cargas en cualquier momento en sucursal o en el sitio de Fonasa.',
        answer:
          'Tu tramo de Fonasa sale de comparar tu ingreso imponible con el ingreso mínimo mensual: hasta el IMM eres B, hasta 1,46 veces el IMM eres C y por encima eres D. En la red pública no pagas copago en ningún tramo.',
      },
      {
        id: 'isapre-plan',
        label: 'Me ofrecen un plan de Isapre: ¿cuánto sale sobre el 7%?',
        hint: 'El plan está pactado en UF, así que el descuento en pesos cambia todos los meses.',
        yes: [
          'El 7% legal de tu renta imponible topada, que es el piso obligatorio en cualquiera de los dos sistemas',
          'El precio del plan en UF convertido a pesos con la UF de hoy',
          'El excedente: todo lo que el plan cueste por encima del 7% sale de tu líquido',
          'Cuánto significa ese excedente al año y qué porcentaje real de tu renta terminas destinando a salud',
        ],
        warn: [
          DISCLAIMER_HEALTH,
          'Si el plan cuesta menos del 7%, la diferencia no se te devuelve en efectivo: queda como excedente de cotización en tu cuenta de la Isapre',
          'El precio del plan se reajusta una vez al año en el mes de aniversario del contrato, y además sube por tramo de edad según la tabla de factores del plan',
          'Sumar cargas encarece el plan: cada beneficiario tiene su propio factor, así que el precio en UF no es el mismo con una carga que con tres',
          'Un plan barato suele significar tope de cobertura bajo o red cerrada de prestadores: compara la cobertura, no sólo el precio',
        ],
        plazo:
          'puedes cambiarte de Isapre o volver a Fonasa después de 12 meses de permanencia; el cambio a Fonasa se puede hacer en cualquier momento.',
        answer:
          'Con Isapre pagas el 7% legal más el excedente del plan. Sobre un sueldo típico, un plan de 4 a 5 UF suele costar bastante más que el 7%, y esa diferencia completa sale de tu bolsillo.',
      },
      {
        id: 'atencion-puntual',
        label: 'Atención puntual: bono Fonasa vs Isapre vs particular',
        hint: 'Una consulta o un examen concreto, sin cambiarte de sistema.',
        yes: [
          'Cuánto pagas por esa prestación en la red pública (Copago Cero: cero)',
          'Cuánto pagas comprando un bono en la Modalidad de Libre Elección, según el nivel del prestador',
          'Cuánto pagas con la cobertura de tu plan de Isapre',
          'Cuánto pagas si vas directo como particular, sin usar ningún seguro',
        ],
        warn: [
          DISCLAIMER_HEALTH,
          'El valor del bono de libre elección no depende de tu tramo sino del prestador y del código de la prestación: dos consultas con el mismo nombre pueden costar distinto',
          'La red pública es gratis pero tiene lista de espera: la comparación honesta incluye cuánto vas a esperar, no sólo cuánto vas a pagar',
          'Las prestaciones cubiertas por GES/AUGE tienen su propia garantía de plazo y de copago máximo, distinta de este cálculo',
          'Muchas coberturas de Isapre tienen tope anual por prestación: pasado ese tope vuelves a pagar el valor completo',
        ],
        plazo:
          'los bonos de libre elección se compran antes de la atención y tienen vigencia de 30 días desde la emisión.',
        answer:
          'Para una atención suelta, la red pública es la más barata (no pagas copago) y el particular la más cara. El bono de libre elección y la Isapre quedan en el medio, y el orden entre ellos depende del prestador que elijas.',
      },
      {
        id: 'independiente',
        label: 'Soy independiente o emito boletas de honorarios',
        hint: 'Tu cotización de salud no sale de una liquidación: se calcula en la Operación Renta.',
        yes: [
          'La cotización de salud del 7% se aplica sobre la renta imponible del año, que es el 80% de tus honorarios brutos',
          'El equivalente mensual de esa cotización, para comparar contra el precio de un plan de Isapre',
          'El mismo tope de 90 UF que rige para los trabajadores dependientes',
          'La comparación con lo que gastarías atendiéndote de forma particular',
        ],
        warn: [
          DISCLAIMER_HEALTH,
          'La cotización del independiente se paga una vez al año, en la Operación Renta, con las retenciones que te hicieron durante el año: si no alcanzan, la diferencia se descuenta de tu devolución',
          'Tu tramo de Fonasa como independiente se determina con la renta que quedó declarada, no con lo que ganaste el mes pasado',
          'La renta imponible del independiente es el 80% de los honorarios brutos anuales, no el 100%: la base es menor que la de un sueldo del mismo monto',
          'Si tus honorarios son irregulares, el equivalente mensual de esta página es un promedio y no representa ningún mes en particular',
        ],
        plazo:
          'la cotización se determina en la Operación Renta de abril del año siguiente, con las retenciones del año anterior.',
        answer:
          'El independiente también cotiza el 7% de salud, pero sobre el 80% de sus honorarios y una vez al año en la Operación Renta, no mes a mes en una liquidación.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Todo mensual y en pesos chilenos, salvo el precio del plan de Isapre, que va en UF porque así se pacta. El ingreso mínimo mensual es editable a propósito: es el parámetro que define los cortes de tramo y cambia cada vez que se reajusta por ley.',
  fields: [
    {
      id: 'ingreso',
      label: 'Ingreso imponible mensual (CLP)',
      prefix: '$',
      value: '900.000',
      thousands: true,
      help: 'Renta bruta imponible. Si eres independiente, pon tus honorarios brutos mensuales promedio: la base se ajusta sola al 80%.',
    },
    {
      id: 'imm',
      label: 'Ingreso mínimo mensual vigente (CLP)',
      prefix: '$',
      value: '553.553',
      thousands: true,
      help: `Dato al ${SALUD.immFecha} (Ley 21.830). Define los cortes de tramo: B hasta el IMM, C hasta 1,46 veces el IMM. Cámbialo si se reajustó o si Fonasa publica todavía el valor anterior.`,
    },
    {
      id: 'cargas',
      label: 'Cargas familiares acreditadas en Fonasa',
      type: 'number',
      value: 0,
      min: 0,
      max: 12,
      step: 1,
      help: 'Con 3 o más cargas acreditadas bajas un tramo: el D pasa a C y el C pasa a B.',
    },
    {
      id: 'planUf',
      label: 'Precio del plan de Isapre (UF al mes)',
      suffix: 'UF',
      type: 'number',
      value: 4.5,
      min: 0.5,
      max: 20,
      step: 0.1,
      help: 'El precio pactado del plan, no el 7%. Un plan individual típico va entre 3 y 6 UF; con cargas sube.',
    },
    {
      id: 'coberturaIsapre',
      label: 'Cobertura ambulatoria de tu plan de Isapre',
      suffix: '%',
      type: 'number',
      value: 70,
      min: 0,
      max: 100,
      step: 5,
      help: 'Porcentaje de la prestación que cubre el plan en prestadores de su red. El resto es tu copago.',
    },
    {
      id: 'nivelMle',
      label: 'Nivel del prestador en la Modalidad de Libre Elección',
      type: 'select',
      value: '1',
      options: BONIF_MLE.map((n) => ({ value: n.id, label: n.nombre })),
      help: 'A mayor nivel, el prestador cobra más sobre el mismo arancel y tu copago sube. Porcentajes referenciales.',
    },
    {
      id: 'valorPrestacion',
      label: 'Valor particular de la atención (CLP)',
      prefix: '$',
      value: '45.000',
      thousands: true,
      help: 'Lo que cuesta esa consulta o examen pagando de forma particular, sin usar seguro.',
    },
    {
      id: 'atenciones',
      label: 'Atenciones al año',
      type: 'number',
      value: 6,
      min: 0,
      max: 60,
      step: 1,
      help: 'Consultas y exámenes que estimas usar en un año. Es lo que multiplica el copago en el total anual.',
    },
  ],
  fineprint: DISCLAIMER_HEALTH,

  chart: {
    type: 'bars',
    title: 'Cuánto te cuesta el año en cada vía',
    caption:
      'Compara el gasto anual total (cotización o precio del plan, más los copagos de tus atenciones) entre Fonasa en la red pública, Fonasa con bonos de libre elección, una Isapre y pagar todo particular.',
  },
  breakdownTitle: 'Peso por peso',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cómo se define realmente mi tramo de Fonasa?',
      a: 'Con tu ingreso imponible mensual comparado con el ingreso mínimo mensual. El tramo A es para personas carentes de recursos o causantes de subsidio familiar; el B llega hasta el ingreso mínimo mensual; el C va desde ahí hasta 1,46 veces el ingreso mínimo; y el D es todo lo que supere esa cifra. Como el ingreso mínimo se reajusta por ley, los cortes en pesos cambian con él: por eso esta página los calcula con la regla y deja el ingreso mínimo como campo editable en vez de fijar dos números que caducan.',
    },
    {
      q: '¿Es verdad que en Fonasa ya no pago copago?',
      a: 'En la red pública, sí. Desde septiembre de 2022 rige el Copago Cero: la atención en hospitales, Cesfam y CRS es gratuita para los cuatro tramos, incluidos medicamentos, prótesis, urgencias con hospitalización, GES y salud mental. Antes el tramo C pagaba 10% y el D un 20%, y esos porcentajes ya no existen. Donde sí pagas copago es en la Modalidad de Libre Elección, cuando compras un bono para atenderte con un prestador privado en convenio.',
    },
    {
      q: 'Entonces, ¿para qué sirve saber mi tramo?',
      a: 'Para tres cosas. Primera, el tramo A no accede a la Modalidad de Libre Elección: sólo se atiende en la red pública. Segunda, el tramo condiciona el acceso a varios beneficios asociados (subsidios, programas focalizados). Y tercera, para efectos de cargas y de acreditación de renta sigue siendo el dato que ordena tu situación en Fonasa. Lo que ya no hace el tramo es cambiar lo que pagas en el hospital público.',
    },
    {
      q: 'Tengo tres hijos como cargas. ¿Eso me cambia algo?',
      a: 'Sí. Con tres o más cargas familiares acreditadas bajas un tramo: si eras D pasas a C, y si eras C pasas a B. El efecto práctico se nota sobre todo en la Modalidad de Libre Elección y en el acceso a beneficios asociados al tramo. Las cargas hay que acreditarlas: no se aplican solas por tener hijos.',
    },
    {
      q: '¿Por qué mi plan de Isapre cuesta más que el 7% legal?',
      a: 'Porque el 7% es el mínimo obligatorio de cotización, no el precio del plan. La Isapre te vende un plan pactado en UF, y ese precio depende de la cobertura, de la red de prestadores y de la tabla de factores por edad y sexo de cada beneficiario. Si el precio del plan supera el 7% de tu renta imponible, la diferencia —el excedente— la pagas tú y sale de tu líquido todos los meses. Si el plan cuesta menos que el 7%, el saldo queda como excedente de cotización a tu favor en la cuenta de la Isapre.',
    },
    {
      q: 'Si mi plan cuesta menos del 7%, ¿me devuelven la diferencia?',
      a: 'No en efectivo. Esa diferencia se acumula como excedente de cotización en una cuenta a tu nombre en la Isapre, y se puede usar para pagar copagos, prestaciones no cubiertas o cotizaciones futuras. No es plata que te llegue al bolsillo cada mes, pero tampoco se pierde.',
    },
    {
      q: '¿Desde qué sueldo conviene una Isapre?',
      a: 'No hay un umbral único, porque la comparación no es sólo de precio. Como el 7% es un porcentaje y el plan es un monto fijo en UF, mientras más alto el sueldo más chico es el excedente en términos relativos, y a partir de cierto punto el 7% incluso supera el precio del plan. Pero por encima del tope imponible de 90 UF tu cotización deja de crecer, así que la ventaja se aplana. Lo que suele decidir es otra cosa: si valoras la red privada y las horas rápidas, o si te alcanza con la red pública y prefieres esa plata en el bolsillo.',
    },
    {
      q: '¿Qué es el tope imponible y cómo me afecta en salud?',
      a: `Es la renta máxima sobre la que se calculan las cotizaciones previsionales, fijada en ${SALUD.topeImponibleUf} UF. Como está en UF, en pesos se mueve todos los días: hoy equivale a ${fmt(SALUD.topeImponibleUf * UF)}. Lo que ganas por encima de ese tope no cotiza, así que tu 7% de salud deja de crecer aunque el sueldo siga subiendo. El precio del plan de Isapre, en cambio, no tiene tope: lo fija el contrato.`,
    },
    {
      q: '¿Cuánto bonifica Fonasa cuando compro un bono?',
      a: 'Depende del nivel del prestador y del código de la prestación, no de tu tramo. Los prestadores en convenio se agrupan en niveles: el nivel 1 cobra el arancel base y es el que deja el copago más bajo, y a mayor nivel el prestador cobra más sobre el mismo arancel, así que tu copago sube. Los porcentajes de esta página son referenciales para que puedas dimensionar el orden de magnitud; el valor exacto de tu bono lo entrega Fonasa para la prestación puntual.',
    },
    {
      q: 'Soy independiente y emito boletas. ¿Cómo cotizo salud?',
      a: 'No con un descuento mensual en una liquidación, sino una vez al año en la Operación Renta. La cotización del 7% se calcula sobre la renta imponible anual, que corresponde al 80% de tus honorarios brutos, y se paga con las retenciones que te hicieron durante el año. Si las retenciones alcanzan, queda cubierto; si no, la diferencia se descuenta de tu devolución de impuestos. Tu tramo de Fonasa se fija con esa renta declarada.',
    },
    {
      q: '¿Cuándo conviene pagar particular en vez de usar el seguro?',
      a: 'Cuando el copago del bono o de la Isapre queda cerca del valor particular, cosa que pasa sobre todo en prestaciones baratas y en prestadores de nivel alto. También cuando el prestador que quieres no está en convenio con Fonasa ni en la red de tu plan. Pero para consultas frecuentes y sobre todo para cualquier cosa que implique hospitalización, pagar particular es siempre bastante más caro: el seguro existe justamente para eso.',
    },
    {
      q: '¿Puedo cambiarme de Isapre a Fonasa cuando quiera?',
      a: 'Volver a Fonasa se puede hacer en cualquier momento. Cambiarte de una Isapre a otra requiere cumplir 12 meses de permanencia en el plan vigente, salvo excepciones como el cambio de condiciones del contrato. Al volver a Fonasa quedas cubierto de inmediato en la red pública, y tu tramo se determina con tu renta imponible.',
    },
  ],

  sources: [
    {
      name: 'Fonasa — tramos A, B, C y D y cómo se determinan',
      url: 'https://nuevo.fonasa.gob.cl/tramos/',
      publisher: 'Fondo Nacional de Salud',
    },
    {
      name: 'Fonasa — Copago Cero en la red pública de salud',
      url: 'https://nuevo.fonasa.gob.cl/derechos-y-proteccion-financiera/copago-cero/',
      publisher: 'Fondo Nacional de Salud',
    },
    {
      name: 'ChileAtiende — Copago Cero de Fonasa',
      url: 'https://www.chileatiende.gob.cl/fichas/9793-copago-cero-de-fonasa',
      publisher: 'ChileAtiende',
    },
    {
      name: 'Superintendencia de Salud — cotización legal del 7%, planes de Isapre y tabla de factores',
      url: 'https://www.superdesalud.gob.cl/',
      publisher: 'Superintendencia de Salud',
    },
    {
      name: 'Dirección del Trabajo — ingreso mínimo mensual vigente (Ley 21.830)',
      url: 'https://www.dt.gob.cl/portal/1628/w3-article-60141.html',
      publisher: 'Dirección del Trabajo',
    },
    {
      name: 'Superintendencia de Pensiones — topes imponibles en UF',
      url: 'https://www.spensiones.cl/',
      publisher: 'Superintendencia de Pensiones',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://si3.bcentral.cl/indicadoressiete/secure/Serie.aspx?gcode=UF&param=RABmAFYAWQB3AGYAaQBuAEkALQAzADUAbgBNAGgAaAAkA',
      publisher: 'Banco Central de Chile',
    },
  ],

  replaces: [
    '/calculadora-fonasa-chile-tramos-a-b-c-d-cobertura',
    '/calculadora-isapre-cotizacion-chile-7-porcentaje-plan',
    '/calculadora-copago-bonificacion-fonasa-chile',
    '/calculadora-coste-medico-particular-vs-fonasa-isapre-chile',
    // Absorbida SÓLO por URL: era un estimador de calorías diarias (Mifflin-St Jeor) etiquetado
    // como "INTA Chile". No aporta nada a la decisión Fonasa/Isapre y no se integra al cálculo;
    // se redirige acá porque es la página de salud chilena más cercana del catálogo vivo.
    '/calculadora-inta-calorias-diarias-chile',
  ],

  lastReviewed: '2026-07-28',
};
