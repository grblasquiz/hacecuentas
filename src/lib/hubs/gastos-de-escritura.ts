import type { HubData } from './types';

export const hub: HubData = {
  slug: 'vivienda/gastos-de-escritura',
  title: '¿Cuánto sale escriturar una propiedad? — Gastos de escritura CABA y PBA 2026',
  description:
    'Calculá los gastos de escritura de una compraventa: honorarios del escribano, impuesto de sellos (2,7% CABA / 2% PBA), comisión inmobiliaria, inscripción registral e impuestos del vendedor. Con la exención de vivienda única aplicada.',
  silo: 'Vivienda',
  siloHref: '/vivienda',

  eyebrow: 'Guía y estimación inmobiliaria',
  h1: '¿Cuánto sale escriturar una propiedad?',
  lede:
    'Partimos del caso más habitual: comprás en CABA. Ya podés ver una estimación y ajustarla con tus datos. Si comprás en Provincia, es tu primera vivienda o estás vendiendo, lo cambiás abajo: la jurisdicción cambia todo.',
  stamps: ['Actualizado 27-07-2026', 'Ley Tarifaria CABA 6.927 · Ley Impositiva PBA 15.558', '13 calculadoras adentro'],

  resultLabel: 'Gastos estimados de escrituración',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Los sellos, las alícuotas y las exenciones son distintos en CABA y en Provincia de Buenos Aires. Elegí tu caso: es lo que más mueve el número.',
    items: [
      {
        id: 'caba',
        label: 'Compro en CABA',
        hint: 'El caso más común',
        answer: 'Comprando en CABA, escriturar suele costar entre 5% y 8% del precio.',
        yes: [
          'Honorarios del escribano por escala del Colegio de Escribanos de CABA, más IVA 21% y aportes a la Caja Notarial',
          'Impuesto de sellos al 2,7% sobre el precio de escritura si la operación no supera $226.100.000, y 3,5% si lo supera (alícuota diferencial de la Ley Tarifaria 2026); suele repartirse 50% y 50% entre comprador y vendedor',
          'Comisión inmobiliaria: el tope orientativo de CUCICBA es 4% más IVA por parte',
          'Inscripción en el Registro de la Propiedad Inmueble, certificados de dominio e inhibición y estudio de títulos',
        ],
        warn: [
          'El escribano lo elige y lo paga el comprador salvo pacto en contrario: pedí presupuesto por escrito antes de firmar el boleto',
          'Los sellos se calculan sobre el mayor valor entre el precio de escritura y la valuación fiscal',
        ],
        plazo: 'el escribano retiene y deposita los sellos en el acto de escritura: tenés que llevar la plata ese día.',
      },
      {
        id: 'pba',
        label: 'Compro en Provincia de Buenos Aires',
        hint: 'ARBA · Ley Impositiva 15.558',
        answer: 'En Provincia de Buenos Aires los sellos son 2%: 1% el comprador y 1% el vendedor.',
        yes: [
          'Impuesto de sellos al 2% de la operación (1% cada parte), sobre el mayor entre el precio y la valuación fiscal',
          'Honorarios del escribano más IVA y aportes al Colegio de Escribanos de la Provincia',
          'Comisión inmobiliaria (práctica de 3% a 4% por parte, Decreto-Ley 10.973/89)',
          'Inscripción registral y certificados',
        ],
        warn: [
          'La exención de vivienda única en PBA se mide sobre la VALUACIÓN FISCAL, no sobre el precio, y el tope es bajo (del orden de $1.154.400): en la práctica casi todas las operaciones pagan el 2%',
          'ARBA suele exigir el certificado catastral vigente: pedilo con anticipación porque demora',
        ],
        plazo: 'consultá la valuación fiscal en ARBA antes de presupuestar los sellos.',
      },
      {
        id: 'primera-vivienda',
        label: 'Es mi primera vivienda',
        hint: 'Exención de sellos',
        answer:
          'En CABA la vivienda única, familiar y de ocupación permanente está exenta de sellos hasta $226.100.000; sobre el excedente se paga 3,5%.',
        yes: [
          'Exención total del impuesto de sellos en CABA si el inmueble es vivienda única, familiar y de ocupación permanente y no supera $226.100.000',
          'Si el precio supera ese tope, el 3,5% se aplica sólo sobre el excedente, no sobre todo el valor',
          'Los honorarios del escribano, la comisión y la inscripción registral NO están exentos: se pagan igual',
        ],
        warn: [
          'La exención se pierde si ya tenés otra propiedad a tu nombre, aunque sea una parte indivisa heredada',
          'En PBA el beneficio equivalente se mide sobre la valuación fiscal con un tope muy bajo, así que casi nunca aplica',
          'Hay que declararla ante el escribano en el acto: no se pide después ni se devuelve',
        ],
        plazo: 'la declaración jurada de vivienda única se firma en la escritura, no hay reclamo posterior.',
      },
      {
        id: 'vendo',
        label: 'Vendo (ITI y plusvalía)',
        hint: 'Ley 27.743 y Ley 27.802',
        answer:
          'El ITI del 1,5% fue derogado y desde 2026 el impuesto cedular del 15% está eximido para personas humanas no habitualistas.',
        yes: [
          'Tu mitad del impuesto de sellos (1,35% en CABA, 1% en PBA) salvo pacto distinto',
          'La comisión inmobiliaria del vendedor, más IVA',
          'El impuesto cedular del 15% sobre la ganancia sólo si sos habitualista, desarrollador o persona jurídica',
        ],
        warn: [
          'El ITI (1,5%) fue derogado por la Ley 27.743, art. 67, vigente desde el 8/7/2024: ya no se paga en ninguna venta',
          'El cedular del 15% se calcula sobre la GANANCIA (precio menos costo actualizado), nunca sobre el precio total',
          'La venta de la casa-habitación siempre estuvo exenta, incluso antes de la exención de la Ley 27.802',
        ],
        plazo: 'si sos habitualista, el escribano actúa como agente de retención en la escritura.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'precio', label: 'Precio de la operación', prefix: '$', value: '150.000.000', thousands: true },
    { id: 'comision', label: 'Comisión inmobiliaria', type: 'number', min: 0, max: 10, step: 0.5, value: 4, suffix: '%' },
    {
      id: 'precioCompra',
      label: 'Precio al que lo compraste (sólo si vendés)',
      prefix: '$',
      value: '90.000.000',
      thousands: true,
      help: 'Se usa para estimar la ganancia del impuesto cedular.',
    },
    {
      id: 'vendedor',
      label: 'Tipo de vendedor',
      type: 'select',
      value: 'humana',
      options: [
        { value: 'humana', label: 'Persona humana no habitualista' },
        { value: 'habitualista', label: 'Habitualista, desarrollador o empresa' },
      ],
    },
  ],
  fineprint:
    'Es una orientación. Los honorarios del escribano se pactan, la comisión se negocia y la valuación fiscal puede mover los sellos.',

  chart: {
    type: 'donut',
    title: 'Quién cobra qué',
    caption:
      'Cada porción es un cobrador distinto: el escribano, la provincia (sellos), la inmobiliaria, el fisco nacional y el Registro. Sirve para entender por qué el total parece tan alto.',
  },
  breakdownTitle: 'Adónde va cada peso',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande.',

  faq: [
    {
      q: '¿Cuánto sale escriturar una propiedad en 2026?',
      a: 'Comprando en CABA, entre 5% y 8% del precio: honorarios del escribano (alrededor de 1% a 1,25% más IVA y aportes), tu mitad del impuesto de sellos (1,35%), la comisión inmobiliaria (hasta 4% más IVA) y unos cientos de miles de pesos de inscripción y certificados. En PBA los sellos bajan a 1% por parte, así que el total baja.',
    },
    {
      q: '¿Cuál es la alícuota del impuesto de sellos en CABA y en PBA?',
      a: 'En CABA la Ley Tarifaria 2026 (Ley 6.927, art. 34) fijó una alícuota diferencial: 2,7% cuando el precio, el valor fiscal o el valor inmobiliario de referencia no supera $226.100.000, y 3,5% cuando lo supera. No son tramos marginales: si la operación pasa el umbral, el 3,5% se aplica sobre todo el valor. La vivienda única, familiar y de ocupación permanente está exenta hasta $226.100.000 y tributa 3,5% sólo sobre el excedente. En Provincia de Buenos Aires la alícuota es única, 20‰ = 2% (Ley Impositiva 15.558), repartida en 1% cada parte.',
    },
    {
      q: '¿Quién paga los gastos de escritura, el comprador o el vendedor?',
      a: 'Por costumbre el comprador elige y paga al escribano, la inscripción registral y los certificados. El impuesto de sellos se divide en partes iguales entre comprador y vendedor salvo pacto distinto. Cada parte paga la comisión del corredor que la representa.',
    },
    {
      q: '¿Cuánto es el tope de exención por primera vivienda?',
      a: 'En CABA la vivienda única, familiar y de ocupación permanente está exenta de sellos hasta $226.100.000; si el precio lo supera, se tributa 3,5% sólo sobre el excedente. En PBA el beneficio existe pero se mide sobre la valuación fiscal con un tope del orden de $1.154.400, por lo que rara vez alcanza.',
    },
    {
      q: '¿Se sigue pagando el ITI al vender?',
      a: 'No. El Impuesto a la Transferencia de Inmuebles (1,5%, Ley 23.905) fue derogado por la Ley 27.743, art. 67, con vigencia desde el 8 de julio de 2024. Ninguna venta lo tributa hoy.',
    },
    {
      q: '¿Y el impuesto cedular del 15% sobre la ganancia?',
      a: 'Se aplicaba a inmuebles adquiridos desde el 1/1/2018 sobre la ganancia (precio de venta menos costo de adquisición actualizado y gastos). La Ley 27.802 lo eximió para personas humanas y sucesiones indivisas no habitualistas en las ventas realizadas desde el 1/1/2026. Sigue vigente para habitualistas, desarrolladores y personas jurídicas.',
    },
    {
      q: '¿Cómo se calculan los honorarios del escribano?',
      a: 'Por una escala decreciente sobre el valor de escritura: en CABA arranca en torno al 1,25% en el primer tramo y baja a 1%, 0,85% y 0,7% en los tramos superiores. A eso se le suma IVA 21% y aportes a la Caja Notarial de alrededor del 10% sobre los honorarios. Es un arancel orientativo y se puede negociar.',
    },
    {
      q: '¿Sobre qué valor se calculan los sellos: el precio o la valuación fiscal?',
      a: 'Sobre el mayor de los dos. Si la valuación fiscal supera el precio pactado, el fisco toma la valuación. Por eso conviene pedir el certificado catastral antes de cerrar el presupuesto, sobre todo en PBA.',
    },
    {
      q: '¿La comisión inmobiliaria tiene tope legal?',
      a: 'En CABA la Ley 2.340 y CUCICBA fijan un tope orientativo del 4% más IVA por parte. En PBA rige el Decreto-Ley 10.973/89 y la práctica va de 3% a 4%. El corredor tiene que estar matriculado y facturar: si no, la comisión no es exigible.',
    },
    {
      q: '¿Qué gastos aparecen además de honorarios y sellos?',
      a: 'Inscripción en el Registro de la Propiedad Inmueble, certificados de dominio e inhibición, estudio de títulos, informe de deuda de impuestos y expensas, y el sellado de los formularios. Sumados suelen representar unos pocos décimos del valor de la operación.',
    },
    {
      q: '¿Puedo escriturar sin inmobiliaria y ahorrarme la comisión?',
      a: 'Sí. La comisión es del corredor, no del escribano: si la operación se cerró entre particulares no hay comisión que pagar. Los honorarios notariales, los sellos y la inscripción se pagan igual porque la escritura pública es obligatoria para transferir el dominio.',
    },
  ],

  sources: [
    {
      name: 'Ley Tarifaria 2026 de la Ciudad de Buenos Aires (Ley 6.927), art. 34 — alícuotas de sellos y exención de vivienda única',
      url: 'https://documentosboletinoficial.buenosaires.gob.ar/publico/PL-LEY-LCABA-LCBA-6927-25-ANX.pdf',
      publisher: 'Boletín Oficial de la Ciudad de Buenos Aires',
      date: '2026',
    },
    {
      name: 'Actualización del SIE: implementación de alícuotas diferenciales — Ley Tarifaria 2026 (2,7% hasta $226.100.000, 3,5% por encima)',
      url: 'https://www.colegio-escribanos.org.ar/2026/01/30/actualizacion-del-sie-implementacion-de-alicuotas-diferenciales-ley-tarifaria-2026/',
      publisher: 'Colegio de Escribanos de la Ciudad de Buenos Aires',
      date: '30-01-2026',
    },
    {
      name: 'Ley Impositiva 2026 de la Provincia de Buenos Aires (Ley 15.558) — sellos sobre transferencia de dominio de inmuebles, 20‰',
      url: 'https://www.arba.gov.ar/archivos/Publicaciones/leyimpositiva2026.pdf',
      publisher: 'ARBA — Agencia de Recaudación de la Provincia de Buenos Aires',
      date: '2026',
    },
    {
      name: 'Arancel orientativo de honorarios notariales',
      url: 'https://www.colegio-escribanos.org.ar/',
      publisher: 'Colegio de Escribanos de la Ciudad de Buenos Aires',
    },
    {
      name: 'Ley 27.743 — derogación del Impuesto a la Transferencia de Inmuebles (art. 67)',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/311463/20240708',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '08-07-2024',
    },
    {
      name: 'Impuesto cedular sobre enajenación de inmuebles — régimen vigente',
      url: 'https://www.afip.gob.ar/gananciasYBienes/',
      publisher: 'ARCA (ex AFIP)',
    },
  ],

  replaces: [
    '/calculadora-gastos-escritura-compra-inmueble',
    '/calculadora-impuesto-sellos-inmueble-contrato',
    '/calculadora-gastos-escritura-compraventa',
    '/calculadora-plusvalia-inmueble-pba-venta-impuesto-2026',
    '/calculadora-sellos-compra-inmueble-caba-pba',
    '/calculadora-arba-sellos-inmobiliarios-pba-compraventa',
    '/calculadora-honorarios-escribano-caba-compraventa',
    '/calculadora-comision-inmobiliaria-venta-inmueble-4-porciento',
    '/calculadora-impuesto-transferencia-itu-iti-inmueble',
    '/calculadora-costo-total-comprar-propiedad-gastos',
    '/calculadora-costo-escritura-inmueble-porcentaje-valor',
    '/calculadora-gastos-escriturar-vivienda-primera-casa',
    '/calculadora-estampillado-sellado-inmueble-pba-caba-2026',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Parámetros fiscales por rama — VERIFICADO contra normativa vigente 2026 (27-07-2026).
 *
 * CABA — Ley Tarifaria 2026 (Ley 6.927), art. 34: la transferencia de dominio de inmuebles
 * tributa 2,7% cuando el precio, el valor fiscal o el VIR es IGUAL O INFERIOR a $226.100.000,
 * y 3,5% cuando lo supera. Es una alícuota diferencial POR OPERACIÓN (no tramos marginales):
 * si la operación cae bajo el umbral, todo el monto va al 2,7%.
 *   Fuente: Colegio de Escribanos CABA, "Actualización del SIE: implementación de alícuotas
 *   diferenciales — Ley Tarifaria 2026" (30-01-2026)
 *   https://www.colegio-escribanos.org.ar/2026/01/30/actualizacion-del-sie-implementacion-de-alicuotas-diferenciales-ley-tarifaria-2026/
 *   Texto legal: anexo Ley 6.927 (Boletín Oficial CABA)
 *   https://documentosboletinoficial.buenosaires.gob.ar/publico/PL-LEY-LCABA-LCBA-6927-25-ANX.pdf
 * Vivienda única, familiar y de ocupación permanente: exenta hasta $226.100.000; sobre el
 * excedente tributa 3,5%.
 *
 * PBA — Ley Impositiva 2026 (Ley 15.558): compraventa / transferencia de dominio de inmuebles
 * al 20‰ = 2% (1% cada parte), salvo prescripción adquisitiva (3,5%). La exención de vivienda
 * única se mide sobre la VALUACIÓN FISCAL con un tope muy bajo (~$1.154.400), por lo que en la
 * práctica casi todas las operaciones tributan 2%.
 *   Fuente: ARBA, Ley Impositiva 2026 (PDF oficial)
 *   https://www.arba.gov.ar/archivos/Publicaciones/leyimpositiva2026.pdf
 *
 * NOTA: en el repo conviven módulos con 3,5% CABA / 3,6% PBA. Ésos son valores PRE-2026
 * (CABA bajó de 3,5% a 2,7% el 1/1/2026; el 3,6% de PBA nunca fue la alícuota de compraventa
 * de la Ley 15.558). El hub usa los valores verificados de arriba, coincidentes con
 * sellos-compra-inmueble-caba-pba.ts y arba-sellos-inmobiliarios-pba-compraventa.ts.
 *
 * Resto de los parámetros:
 *  - escala de honorarios notariales y gastos fijos: src/lib/formulas/honorarios-escribano-caba.ts
 *  - cedular 15% e ITI derogado: src/lib/formulas/impuesto-transferencia-itu-iti-inmueble.ts
 */
export const CASE_MATH: Record<
  string,
  {
    jur: string;
    /** Alícuota de sellos aplicable hasta el umbral (o única si no hay umbral). */
    sellos: number;
    /** Alícuota aplicable cuando la operación supera el umbral. */
    sellosSobreUmbral: number;
    /** Umbral de la alícuota diferencial CABA (0 = sin umbral). */
    umbral: number;
    /** Tope exento de sellos (0 = sin exención). */
    exencion: number;
    /** Rol de quien consulta: paga honorarios e inscripción sólo el comprador. */
    rol: 'comprador' | 'vendedor';
  }
> = {
  // CABA sin beneficio: 2,7% hasta $226.100.000, 3,5% por encima (Ley 6.927 art. 34).
  caba: { jur: 'CABA', sellos: 0.027, sellosSobreUmbral: 0.035, umbral: 226_100_000, exencion: 0, rol: 'comprador' },
  // PBA: alícuota única 2% (Ley 15.558), sin umbral diferencial.
  pba: { jur: 'PBA', sellos: 0.02, sellosSobreUmbral: 0.02, umbral: 0, exencion: 0, rol: 'comprador' },
  // Vivienda única CABA: exenta hasta el tope; 3,5% sólo sobre el excedente.
  'primera-vivienda': {
    jur: 'CABA',
    sellos: 0.035,
    sellosSobreUmbral: 0.035,
    umbral: 226_100_000,
    exencion: 226_100_000,
    rol: 'comprador',
  },
  vendo: { jur: 'CABA', sellos: 0.027, sellosSobreUmbral: 0.035, umbral: 226_100_000, exencion: 0, rol: 'vendedor' },
};

/** Escala de honorarios notariales CABA (tramos y alícuotas del módulo honorarios-escribano-caba.ts). */
export const HONORARIOS = {
  T1: 30_000_000,
  T2: 100_000_000,
  T3: 300_000_000,
  A1: 0.0125,
  A2: 0.01,
  A3: 0.0085,
  A4: 0.007,
  IVA: 0.21,
  APORTES: 0.1,
  /** Sellados, inscripción registral y certificados (aprox.). */
  GASTOS_FIJOS: 180_000,
};

/** Alícuota del impuesto cedular sobre la ganancia (sólo habitualistas / personas jurídicas). */
export const CEDULAR = 0.15;
