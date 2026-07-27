import type { HubData } from './types';

export const hub: HubData = {
  slug: 'trabajo/aguinaldo',
  title: '¿Cuánto cobro de aguinaldo? — Calculadora de SAC 2026 (Argentina)',
  description:
    'Calculá tu aguinaldo según tu caso: empleado en relación de dependencia, empleada de casas particulares, medio semestre trabajado o jubilado de ANSES. Bruto, descuentos y neto, con la LCT art. 121-123 y la ley 27.073 aplicadas.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación laboral',
  h1: '¿Cuánto cobro de aguinaldo?',
  lede:
    'El SAC es la mitad de tu mejor remuneración del semestre, proporcional a los meses que trabajaste. Partimos del caso más común —empleado en relación de dependencia— y lo ajustás con tus datos.',
  stamps: ['Actualizado 27-07-2026', 'LCT art. 121-123 · Ley 27.073', '6 calculadoras adentro'],

  resultLabel: 'Aguinaldo estimado (neto)',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'dependencia',
        label: 'Trabajo en relación de dependencia',
        hint: 'El caso más común',
        answer: 'El aguinaldo es el 50% de tu mejor remuneración mensual del semestre.',
        yes: [
          'Base: la MEJOR remuneración mensual devengada del semestre, no el promedio ni el último sueldo',
          'Entran horas extra, comisiones, premios y todo lo remunerativo del mejor mes',
          'Se paga en dos cuotas: hasta el 30 de junio y hasta el 18 de diciembre (ley 27.073)',
          'Sobre el aguinaldo se descuentan los mismos aportes que sobre el sueldo (17%)',
        ],
        warn: [
          'Los conceptos NO remunerativos (viáticos sin comprobante, sumas fijas de acta) no engrosan la base del SAC',
          'Si cobrás quincenal, la base sigue siendo el mejor MES devengado, no el promedio de quincenas',
        ],
        plazo: 'la 1ª cuota vence el 30 de junio y la 2ª el 18 de diciembre, con 4 días hábiles de gracia.',
      },
      {
        id: 'casas-particulares',
        label: 'Soy empleada de casas particulares',
        hint: 'Ley 26.844 art. 39',
        answer: 'Rige el mismo SAC: medio mejor sueldo del semestre, aun con jornada parcial.',
        yes: [
          'Misma fórmula que la LCT: medio mejor sueldo del semestre, proporcional a los meses',
          'La base es el sueldo mensual de tu categoría según la escala de la CNTCP',
          'Corresponde igual si trabajás por hora, por día o medio tiempo: se devenga proporcional',
          'Si trabajás en varias casas, cada empleador te paga su propio aguinaldo',
        ],
        warn: [
          'Si te pagan por hora, el "sueldo mensual" es la suma de lo devengado en el mejor mes del semestre',
          'El pago va con recibo y se declara en el Registro Simplificado de AFIP/ARCA',
          'No se le descuenta el 17% de aportes del régimen general: en casas particulares los aportes son importes fijos mensuales según las horas semanales, así que el aguinaldo se cobra prácticamente en bruto',
        ],
        plazo: 'se paga hasta el último día hábil de junio y de diciembre.',
      },
      {
        id: 'medio-semestre',
        label: 'Trabajé medio semestre',
        hint: 'SAC proporcional',
        answer: 'Cobrás el SAC proporcional a los días efectivamente trabajados del semestre.',
        yes: [
          'La cuenta se hace por días: medio mejor sueldo × días trabajados ÷ días del semestre',
          'Aplica si entraste a mitad de semestre, renunciaste o te despidieron',
          'En una liquidación final el SAC proporcional se paga siempre, cualquiera sea el motivo de egreso',
          'Las licencias pagas (vacaciones, enfermedad, maternidad) computan como tiempo trabajado',
        ],
        warn: [
          'Si el egreso fue por despido, el SAC proporcional va aparte de la indemnización: no lo absorbe',
          'Las licencias sin goce de sueldo no computan y bajan la proporción',
        ],
        plazo: 'en caso de egreso, se paga con la liquidación final dentro de los 4 días hábiles.',
      },
      {
        id: 'jubilado',
        label: 'Soy jubilado o pensionado de ANSES',
        hint: 'Ley 24.241',
        answer: 'El SAC previsional es el 50% del mejor haber del semestre y se cobra con el haber del mes.',
        yes: [
          'Base: el mejor haber mensual del semestre, sin contar bonos ni refuerzos',
          'Se cobra junto con el haber de junio y de diciembre, según el calendario por terminación de DNI',
          'Si tenés más de una prestación, cada una genera su propio aguinaldo',
        ],
        warn: [
          'El bono o refuerzo previsional NO genera aguinaldo: se suma aparte al cobro del mes',
          'Sobre el haber corre el descuento del 3% de PAMI, pero no los aportes del trabajador activo',
        ],
        plazo: 'ANSES lo abona con el haber del mes según tu terminación de DNI.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'sueldo',
      label: 'Mejor remuneración bruta del semestre',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: 'El mejor mes devengado, no el promedio.',
    },
    { id: 'meses', label: 'Meses trabajados en el semestre', type: 'number', min: 0, max: 6, value: 6 },
    { id: 'dias', label: 'Días sueltos además de esos meses', type: 'number', min: 0, max: 30, value: 0 },
    {
      id: 'bono',
      label: 'Bono o refuerzo previsional (solo jubilados)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'No genera aguinaldo: se informa aparte.',
    },
  ],
  fineprint:
    'Es una orientación bruta. Convenios, adicionales no remunerativos y topes de aportes pueden cambiar el resultado final del recibo.',

  chart: {
    type: 'timeline',
    title: 'Los 6 meses del semestre',
    caption:
      'El SAC se calcula sobre la MEJOR remuneración del semestre, proporcional a los meses que trabajaste. La barra marca cuántos de los 6 meses computan y cuántos quedan afuera.',
  },
  breakdownTitle: 'Cómo se arma tu aguinaldo',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande.',

  faq: [
    {
      q: '¿Cómo se calcula el aguinaldo en Argentina?',
      a: 'El SAC es el 50% de la mayor remuneración mensual devengada dentro del semestre (LCT art. 121 y 122). Si no trabajaste el semestre completo, ese medio sueldo se prorratea por los días efectivamente trabajados sobre los 181 del semestre.',
    },
    {
      q: '¿Se toma el mejor sueldo o el promedio del semestre?',
      a: 'El mejor. La ley habla de la mayor remuneración mensual devengada, así que un mes con horas extra o un premio levanta toda la base del aguinaldo. Si tu empleador promedió los meses, la cuenta está mal hecha.',
    },
    {
      q: '¿Cuándo se cobra el aguinaldo?',
      a: 'La ley 27.073 fijó dos fechas: la primera cuota hasta el 30 de junio y la segunda hasta el 18 de diciembre. El empleador tiene además 4 días hábiles de gracia para depositarlo.',
    },
    {
      q: '¿Qué descuentos tiene el aguinaldo?',
      a: 'Los mismos aportes que el sueldo: 11% jubilación, 3% PAMI y 3% obra social, un 17% total, calculado sobre una base con tope. Si tu sueldo supera la base imponible máxima, el descuento efectivo es menor al 17%. Además puede retenerse Impuesto a las Ganancias si superás el mínimo no imponible.',
    },
    {
      q: 'Trabajé solo 3 meses del semestre, ¿cobro aguinaldo?',
      a: 'Sí. Cobrás el proporcional: medio mejor sueldo multiplicado por los días trabajados y dividido por los días del semestre. Con 3 meses de 6 cobrás aproximadamente la mitad del medio aguinaldo.',
    },
    {
      q: '¿La empleada de casas particulares cobra aguinaldo?',
      a: 'Sí, el art. 39 de la ley 26.844 le da el mismo derecho que la LCT: medio mejor sueldo del semestre. Corresponde también con jornada parcial, por hora o por día, calculado en proporción a lo devengado, y lo paga cada empleador por separado.',
    },
    {
      q: 'Cobro quincenal, ¿cómo se calcula mi aguinaldo?',
      a: 'La base sigue siendo la mejor remuneración MENSUAL devengada: se suman las dos quincenas de cada mes y se toma el mes más alto. Promediar las seis quincenas del semestre suele dar un número distinto (y en general menor) al que manda la ley.',
    },
    {
      q: '¿Los jubilados de ANSES cobran aguinaldo?',
      a: 'Sí. El SAC previsional es el 50% del mejor haber mensual del semestre y se abona con el haber de junio y de diciembre según el calendario por terminación de DNI. Los bonos y refuerzos no integran la base: se pagan aparte y no generan aguinaldo.',
    },
    {
      q: 'Me despidieron, ¿pierdo el aguinaldo?',
      a: 'No. El SAC proporcional se paga siempre en la liquidación final, cualquiera sea la causa del egreso, y va aparte de la indemnización por antigüedad. También corresponde el SAC sobre el preaviso y sobre la integración del mes de despido (art. 123 LCT).',
    },
    {
      q: '¿Qué pasa si mi empleador no paga el aguinaldo en fecha?',
      a: 'Podés intimarlo por telegrama laboral, que es gratuito. El pago fuera de término devenga intereses y, si el incumplimiento persiste, habilita a considerarte injuriado y colocarte en situación de despido indirecto.',
    },
  ],

  sources: [
    {
      name: 'Ley de Contrato de Trabajo 20.744, arts. 121, 122 y 123 (Sueldo Anual Complementario)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 27.073 — fechas de pago del SAC: 30 de junio y 18 de diciembre',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/240000-244999/240560/norma.htm',
      publisher: 'InfoLeg',
      date: '2014',
    },
    {
      name: 'Ley 26.844, art. 39 — Régimen Especial de Personal de Casas Particulares',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/210000-214999/210489/norma.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Escala salarial vigente del personal de casas particulares (CNTCP)',
      url: 'https://www.argentina.gob.ar/trabajo/casasparticulares',
      publisher: 'Ministerio de Capital Humano',
    },
    {
      name: 'Aguinaldo de jubilados y pensionados — calendario de pagos',
      url: 'https://www.anses.gob.ar/informacion/cronograma-de-pagos',
      publisher: 'ANSES',
    },
  ],

  replaces: [
    '/calculadora-aguinaldo-sac',
    '/calculadora-aguinaldo-empleada-casa-particular-medio-tiempo-categoria',
    '/calculadora-cuanto-falta-aguinaldo-junio-diciembre',
    '/calculadora-aguinaldo-empleado-mensual-quincenal-vs-quincena',
    '/calculadora-sac-proporcional',
    '/calculadora-aguinaldo-jubilados-anses-diciembre-2026',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Parámetros por rama.
 *  - aportes: alícuota de aportes personales sobre el SAC (0 donde no hay retención porcentual).
 *  - bono: si la rama muestra el bono/refuerzo (no genera SAC, se informa aparte).
 *  - baseLabel: cómo se llama la base en esa rama.
 *  - notaSinAportes: leyenda cuando aportes = 0 (por qué no hay descuento).
 */
export const CASE_MATH: Record<
  string,
  { aportes: number; bono: boolean; baseLabel: string; norma: string; notaSinAportes?: string }
> = {
  dependencia: { aportes: 0.17, bono: false, baseLabel: 'Mejor remuneración del semestre', norma: 'Art. 121' },
  // Casas particulares: aportes de importe FIJO por horas semanales (Ley 26.844 / Ley 25.239
  // tít. XVIII), no el 17% del régimen general → el SAC no sufre retención porcentual.
  'casas-particulares': {
    aportes: 0,
    bono: false,
    baseLabel: 'Mejor sueldo mensual del semestre',
    norma: 'Ley 26.844 art. 39',
    notaSinAportes: 'sin retención del 17%: los aportes son de importe fijo',
  },
  'medio-semestre': { aportes: 0.17, bono: false, baseLabel: 'Mejor remuneración del semestre', norma: 'Art. 123' },
  jubilado: {
    aportes: 0,
    bono: true,
    baseLabel: 'Mejor haber del semestre',
    norma: 'Ley 24.241',
    notaSinAportes: 'sin aportes: régimen previsional',
  },
};

/** Días que la liquidación toma por semestre (art. 122 LCT, criterio 181 días). */
export const DIAS_SEMESTRE = 181;
