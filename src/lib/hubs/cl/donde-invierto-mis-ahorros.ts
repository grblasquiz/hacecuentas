import type { HubData } from '../types';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Dónde conviene que tenga mi plata?"
 *
 * Fondo de emergencia, depósito a plazo, fondo mutuo, renta fija del Banco Central /
 * Tesorería y acciones en la Bolsa de Santiago. La pregunta que responde es cuánto
 * queda EN EL BOLSILLO después de comisiones e Impuesto Global Complementario.
 *
 * UTM y UF son datos VIVOS: las exenciones del Art. 57 LIR están expresadas en UTM
 * (20 UTM para intereses, 30 UTM para el mayor valor de fondos mutuos), así que el
 * umbral en pesos se mueve todos los meses. Las fórmulas viejas las hardcodeaban.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'investment'). */
export const DISCLAIMER_INVESTMENT =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.';

/** Indicadores vivos (mindicador.cl vía src/data/live/chile.json). */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);
export const UTM_FECHA = String((clLive as any)?.utm?.fecha ?? '').slice(0, 10);

/**
 * Exenciones del Art. 57 de la Ley de la Renta (DL 824), en UTM anuales.
 * Aplican a trabajadores del Art. 42 N°1, pensionados y pequeños contribuyentes.
 */
export const EXENCION = {
  interesesUtm: 20, // intereses de depósitos y capitales mobiliarios
  fondosMutuosUtm: 30, // mayor valor en el rescate de cuotas de fondos mutuos
};

/** Meses de gastos de fondo de emergencia según estabilidad del ingreso. */
export const PERFILES_EMERGENCIA: Array<{ id: string; nombre: string; meses: number }> = [
  { id: 'indefinido', nombre: 'Contrato indefinido', meses: 3 },
  { id: 'plazo_fijo', nombre: 'Contrato a plazo fijo o por obra', meses: 4 },
  { id: 'honorarios', nombre: 'Boleta de honorarios', meses: 6 },
  { id: 'independiente', nombre: 'Independiente o negocio propio', meses: 8 },
  { id: 'jubilado', nombre: 'Pensionado', meses: 6 },
];

/** Meses adicionales según carga familiar. */
export const DEPENDIENTES: Array<{ id: string; nombre: string; extra: number }> = [
  { id: 'no', nombre: 'Nadie depende de mí', extra: 0 },
  { id: '1_2', nombre: '1 o 2 personas dependen de mí', extra: 1 },
  { id: '3_mas', nombre: '3 o más personas dependen de mí', extra: 2 },
];

/** Derecho de bolsa de la Bolsa de Santiago sobre el monto transado (referencial). */
export const DERECHO_BOLSA_PCT = 0.0045;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/dinero/donde-invierto-mis-ahorros',
  title: 'Dónde invertir tus ahorros en Chile: depósito, fondo mutuo, bonos o acciones',
  description:
    'Compara depósito a plazo, fondo mutuo, renta fija del Banco Central y acciones de la Bolsa de Santiago con el número que importa: cuánto te queda neto después de comisiones y del Impuesto Global Complementario, con las exenciones de 20 y 30 UTM del Art. 57 LIR calculadas con la UTM vigente.',
  silo: 'Dinero',
  siloHref: '/cl/dinero',
  locale: 'cl',

  eyebrow: 'Chile · ahorro e inversión',
  h1: '¿Dónde conviene que tenga mi plata?',
  lede:
    'Antes de elegir instrumento hay que responder dos cosas: cuánta plata necesitas poder sacar mañana y cuánto te come el costo antes de que rinda. Pon el monto, el plazo y la rentabilidad que te ofrecen, y mira cuánto queda neto de comisiones y de Impuesto Global Complementario en cada opción.',
  stamps: [
    `UTM del mes: ${fmt(UTM)}`,
    `Exención de intereses: ${EXENCION.interesesUtm} UTM = ${fmt(EXENCION.interesesUtm * UTM)} al año`,
    `Exención de fondos mutuos: ${EXENCION.fondosMutuosUtm} UTM = ${fmt(EXENCION.fondosMutuosUtm * UTM)} al año`,
    'Art. 57 LIR · DL 824',
    '5 destinos comparados en una página',
  ],

  resultLabel: 'Lo que te queda neto',

  cases: {
    title: '¿Qué estás decidiendo?',
    intro:
      'Partimos por lo primero de todo: cuánta plata deberías tener guardada y disponible antes de invertir nada.',
    items: [
      {
        id: 'emergencia',
        label: 'Primero: cuánto dejo líquido por si acaso',
        hint: 'El colchón que evita que tengas que endeudarte cuando pasa algo.',
        yes: [
          'Cuántos meses de gastos esenciales deberías tener guardados según la estabilidad de tu ingreso',
          'Ajuste por las personas que dependen de ti',
          'El monto objetivo en pesos, mínimo y holgado',
          'Cuánto te falta todavía para llegar y en cuánto tiempo llegarías con tu ahorro mensual',
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'El fondo de emergencia no es una inversión: su objetivo es estar disponible, no rendir. Va en instrumentos líquidos, no en acciones',
          'Con boleta de honorarios o ingresos variables el colchón tiene que ser más grande, porque no tienes seguro de cesantía',
          'Si tienes deuda de tarjeta rotativa, pagarla rinde más que cualquier depósito: te ahorras una tasa muy superior a la que ganas',
        ],
        plazo:
          'apunta a completarlo antes de comprometer plata a plazos largos; sin colchón, cualquier imprevisto te obliga a rescatar en el peor momento.',
        answer:
          'Con contrato indefinido el piso son 3 meses de gastos esenciales; con honorarios o negocio propio, entre 6 y 8, más un mes por cada carga familiar.',
      },
      {
        id: 'deposito',
        label: 'Depósito a plazo',
        hint: 'Tasa conocida de antemano, plazo fijo, capital garantizado por el banco.',
        yes: [
          'Interés del período, prorrateado por los días efectivos sobre base 365',
          'Impuesto Global Complementario sólo sobre el interés que excede la exención de 20 UTM al año',
          'Rentabilidad neta anualizada, que es la comparable con cualquier otro instrumento',
          'Comparación contra un depósito reajustable en UF',
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'No existe ninguna retención fija sobre los intereses: el tributo final es el Global Complementario progresivo del año siguiente',
          'La exención de 20 UTM del Art. 57 LIR aplica a trabajadores dependientes, pensionados y pequeños contribuyentes, no a todo el mundo',
          'Rescatar antes del vencimiento normalmente significa perder el interés pactado',
          'Un depósito nominal que rinde menos que la inflación te hace perder poder de compra aunque el número suba',
        ],
        plazo:
          'los depósitos a plazo fijo se renuevan automáticamente si no avisas: revisa la fecha de vencimiento para no quedar amarrado a una tasa vieja.',
        answer:
          'El depósito a plazo te da certeza de tasa y de capital; en Chile los primeros 20 UTM de interés al año no pagan Global Complementario.',
      },
      {
        id: 'fondo-mutuo',
        label: 'Fondo mutuo',
        hint: 'Rescate en días, rentabilidad no garantizada y una comisión que se cobra todos los años.',
        yes: [
          'Rentabilidad compuesta del período según la rentabilidad anual que le pongas',
          'Remuneración de la administradora, que se descuenta del valor cuota todos los años',
          'Mayor valor del rescate y su tributación con la exención de 30 UTM del Art. 57 LIR',
          'Comparación directa contra el depósito a plazo del mismo monto y plazo',
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'La rentabilidad pasada de un fondo mutuo no garantiza nada: puedes rescatar con menos plata de la que pusiste',
          'La comisión es lo único seguro del fondo: se cobra rinda o no rinda, y en fondos de deuda de corto plazo puede llevarse buena parte del retorno',
          'La exención de 30 UTM para el mayor valor de fondos mutuos opera de forma acotada y no cubre a todos los contribuyentes: si superas el umbral, confirma con tu contador cómo tributa el total',
          'Fondo mutuo no es lo mismo que depósito: no hay tasa pactada ni capital garantizado',
        ],
        plazo:
          'el rescate se liquida en un plazo que fija el reglamento interno del fondo, típicamente entre el mismo día y 10 días hábiles.',
        answer:
          'El fondo mutuo puede rendir más que el depósito, pero la comisión anual se cobra igual y la rentabilidad no está garantizada.',
      },
      {
        id: 'renta-fija',
        label: 'Bonos del Banco Central o de Tesorería',
        hint: 'BCU y BTU en UF, BCP y BTP en pesos: cupones semestrales y devolución del capital al vencimiento.',
        yes: [
          'Cupones semestrales sobre el valor nominal, según la tasa de carátula',
          'Ganancia o pérdida de capital según el precio al que compres respecto del par',
          'Todo expresado también en pesos con la UF viva cuando el bono está en UF',
          'Sensibilidad del precio a un alza de tasas, aproximada con la duración',
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'Los bonos en UF protegen de la inflación y los bonos en pesos no: su rendimiento es nominal y la inflación se lo come',
          'Si vendes antes del vencimiento el precio depende de las tasas del día: cuando las tasas suben, el precio de tu bono baja',
          'La tributación del mayor valor de instrumentos de deuda con oferta pública tiene reglas propias en la LIR: no supongas que se le aplica la tasa del Global Complementario sin revisarlo',
          'No existe ningún IVA sobre la ganancia de capital de un bono: si un cálculo te lo suma, está mal',
        ],
        plazo:
          'los cupones se pagan cada seis meses hasta el vencimiento, y en esa última fecha te devuelven el capital nominal.',
        answer:
          'Un bono te fija el flujo de cupones y la devolución del capital; el riesgo real es tener que venderlo antes de tiempo si las tasas subieron.',
      },
      {
        id: 'acciones',
        label: 'Acciones en la Bolsa de Santiago',
        hint: 'Vía corredora: comisión de compra, comisión de venta, derecho de bolsa y custodia.',
        yes: [
          'Comisión de la corredora en la compra y en la venta',
          'Derecho de bolsa sobre cada operación',
          'Custodia proporcional al tiempo que mantienes la posición',
          'Cuánto de tu ganancia esperada se lo comen los costos antes de mirar impuestos',
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'Las acciones pueden perder valor: el capital no está garantizado y el horizonte razonable es de años, no de meses',
          'Los costos se pagan dos veces, al comprar y al vender, así que operar seguido destruye rentabilidad',
          'El mayor valor de acciones con presencia bursátil vendidas en bolsa tiene un régimen tributario especial en el Art. 107 LIR: no se le aplica sin más la tasa marginal, confírmalo con tu contador',
          'Concentrar el ahorro en dos o tres papeles del mercado local es riesgo no remunerado',
        ],
        plazo:
          'la liquidación de una operación en la Bolsa de Santiago se cumple en dos días hábiles desde el cierre del negocio.',
        answer:
          'En acciones los costos se pagan al comprar y al vender: en montos chicos y plazos cortos, la comisión se come la ganancia esperada.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Todo en pesos chilenos. En el caso del fondo de emergencia el primer campo no se usa: lo que manda ahí son tus gastos mensuales.',
  fields: [
    {
      id: 'monto',
      label: 'Monto que vas a invertir (CLP)',
      prefix: '$',
      value: '5.000.000',
      thousands: true,
      help: 'Capital inicial. En el caso de bonos es el valor nominal de la lámina.',
    },
    {
      id: 'plazoDias',
      label: 'Plazo en días',
      type: 'number',
      value: 365,
      min: 7,
      max: 3650,
      step: 1,
      help: 'Días efectivos de la inversión. En bonos y acciones se usa el campo de años y de meses respectivamente.',
    },
    {
      id: 'tasa',
      label: 'Tasa o rentabilidad anual esperada (%)',
      suffix: '%',
      type: 'number',
      value: 5,
      min: 0,
      max: 30,
      step: 0.1,
      help: 'Tasa del depósito, rentabilidad esperada del fondo, tasa de carátula del bono o rentabilidad esperada de las acciones.',
    },
    {
      id: 'comision',
      label: 'Comisión anual del fondo o de la corredora (%)',
      suffix: '%',
      type: 'number',
      value: 1,
      min: 0,
      max: 5,
      step: 0.05,
      help: 'Remuneración anual de la administradora del fondo mutuo, o comisión por operación de la corredora en el caso de acciones.',
    },
    {
      id: 'igc',
      label: 'Tu tasa marginal de Global Complementario (%)',
      suffix: '%',
      type: 'number',
      value: 0,
      min: 0,
      max: 40,
      step: 0.5,
      help: 'Deja 0 si tu renta anual cae en el tramo exento. Es la tasa del último tramo que te toca en la Operación Renta.',
    },
    {
      id: 'gastoMensual',
      label: 'Tus gastos esenciales del mes (CLP)',
      prefix: '$',
      value: '900.000',
      thousands: true,
      help: 'Arriendo o dividendo, cuentas, alimentación, transporte, salud y pagos mínimos de deuda. Sólo se usa en el fondo de emergencia.',
    },
    {
      id: 'contrato',
      label: 'Tu situación laboral',
      type: 'select',
      value: 'indefinido',
      options: PERFILES_EMERGENCIA.map((p) => ({ value: p.id, label: `${p.nombre} — ${p.meses} meses de piso` })),
    },
    {
      id: 'dependientes',
      label: 'Personas que dependen de ti',
      type: 'select',
      value: 'no',
      options: DEPENDIENTES.map((d) => ({ value: d.id, label: d.nombre })),
    },
    {
      id: 'ahorroMensual',
      label: 'Cuánto puedes ahorrar al mes (CLP)',
      prefix: '$',
      value: '200.000',
      thousands: true,
      help: 'Sirve para estimar en cuánto tiempo completas el fondo de emergencia.',
    },
    {
      id: 'yaAhorrado',
      label: 'Cuánto llevas ahorrado hoy (CLP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Lo que ya tienes disponible para emergencias.',
    },
    {
      id: 'anios',
      label: 'Años al vencimiento del bono',
      type: 'number',
      value: 10,
      min: 1,
      max: 30,
      step: 1,
      help: 'Sólo se usa en el caso de renta fija.',
    },
    {
      id: 'precio',
      label: 'Precio de compra del bono (% del par)',
      suffix: '%',
      type: 'number',
      value: 100,
      min: 40,
      max: 150,
      step: 0.1,
      help: '100 es a la par. Bajo 100 compras con descuento; sobre 100, con premio.',
    },
    {
      id: 'enUf',
      label: '¿El bono está en UF?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí — BCU o BTU, reajustable en UF' },
        { value: 'no', label: 'No — BCP o BTP, nominal en pesos' },
      ],
    },
    {
      id: 'meses',
      label: 'Meses que mantendrías las acciones',
      type: 'number',
      value: 12,
      min: 1,
      max: 240,
      step: 1,
      help: 'Sólo se usa en el caso de acciones, para prorratear la custodia.',
    },
    {
      id: 'custodia',
      label: 'Custodia anual de la corredora (CLP)',
      prefix: '$',
      value: '10.000',
      thousands: true,
      help: 'Cargo anual por mantener los papeles en custodia. Varía por corredora: revisa tu contrato.',
    },
  ],
  fineprint: DISCLAIMER_INVESTMENT,

  chart: {
    type: 'donut',
    title: 'A dónde va tu rentabilidad',
    caption:
      'Muestra cuánto de lo que rinde tu plata te queda efectivamente a ti y cuánto se lo llevan la comisión y el impuesto.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada partida contra la mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánta plata debería tener en el fondo de emergencia?',
      a: 'La referencia habitual son 3 meses de gastos esenciales con contrato indefinido, 4 con contrato a plazo fijo, y entre 6 y 8 con boleta de honorarios o negocio propio, porque ahí no hay seguro de cesantía ni indemnización. A eso conviene sumarle un mes por cada persona que dependa de ti. Lo importante es que sean gastos esenciales, no tu gasto total: arriendo o dividendo, cuentas, comida, transporte, salud y los mínimos de deuda.',
    },
    {
      q: '¿Los intereses de un depósito a plazo pagan impuesto en Chile?',
      a: 'Los intereses son renta de capitales mobiliarios y van a la base del Impuesto Global Complementario, que es progresivo. El Art. 57 de la Ley de la Renta exime los primeros 20 UTM de interés al año para trabajadores dependientes, pensionados y pequeños contribuyentes. No hay ninguna retención fija al momento del depósito: lo que corresponda se paga en la Operación Renta del año siguiente y depende de tu tramo.',
    },
    {
      q: '¿Cuánto valen hoy esas 20 y 30 UTM de exención?',
      a: `Con la UTM vigente de ${fmt(UTM)}, la exención de intereses de 20 UTM equivale a ${fmt(20 * UTM)} al año y la de fondos mutuos de 30 UTM a ${fmt(30 * UTM)}. Como la UTM se reajusta todos los meses con el IPC, esos umbrales se mueven: por eso esta página los calcula con el valor vigente y no con un número fijo.`,
    },
    {
      q: '¿Conviene un fondo mutuo o un depósito a plazo?',
      a: 'Depende de dos cosas: cuánta comisión te cobra el fondo y cuánta certeza necesitas. El depósito te da tasa conocida y capital garantizado por el banco; el fondo puede rendir más, pero no promete nada y la comisión se cobra igual. En fondos de deuda de corto plazo, una comisión anual alta puede dejarte por debajo del depósito. La comparación honesta es después de comisiones y después de impuesto, que es lo que hace este hub.',
    },
    {
      q: '¿Qué diferencia hay entre un bono en UF y uno en pesos?',
      a: 'Un BCU o un BTU está expresado en UF, así que su capital y sus cupones se reajustan con la inflación: la tasa que te pagan es real. Un BCP o un BTP está en pesos nominales: si la inflación sube más de lo esperado, tu rentabilidad real cae. Por eso las tasas nominales suelen ser bastante más altas que las reales, y comparar una contra otra directamente no tiene sentido.',
    },
    {
      q: '¿Por qué baja el precio de mi bono cuando suben las tasas?',
      a: 'Porque el cupón de tu bono es fijo. Si el mercado pasa a ofrecer papeles nuevos con un cupón mayor, nadie va a pagar el precio antiguo por el tuyo: el precio ajusta hacia abajo hasta que el rendimiento se empareja. Cuánto cae depende de la duración: mientras más largo el bono, más golpea el alza de tasas. Si mantienes el bono hasta el vencimiento cobras igual todos los cupones y el capital, y la caída de precio no te afecta.',
    },
    {
      q: '¿Cuánto cuesta comprar acciones en la Bolsa de Santiago?',
      a: 'Pagas comisión de la corredora al comprar y al vender, derecho de bolsa sobre cada operación, y una custodia por mantener los papeles. Como los costos se pagan dos veces, en montos chicos y horizontes cortos se comen la ganancia esperada. La comisión varía mucho entre corredoras tradicionales y plataformas digitales: es el primer número que hay que comparar antes de abrir cuenta.',
    },
    {
      q: '¿Cómo tributa la ganancia de las acciones?',
      a: 'El régimen general lleva el mayor valor a la base del Global Complementario, pero el Art. 107 de la Ley de la Renta establece un tratamiento especial para acciones con presencia bursátil adquiridas y vendidas en bolsa, con un tope anual expresado en UF. Como el resultado depende de cómo compraste y vendiste, esta página no aplica una tasa automática sobre la ganancia de acciones: confirma tu caso con un contador.',
    },
    {
      q: '¿Existe algún IVA sobre las ganancias de inversión?',
      a: 'No. El IVA es un impuesto al consumo de bienes y servicios, no a las rentas de capital. Ninguna ganancia de un depósito, un fondo mutuo, un bono o una acción paga IVA. Si un simulador te suma un 19% sobre la ganancia de capital de un bono, ese cálculo está equivocado y te va a mostrar una rentabilidad neta mucho menor que la real.',
    },
    {
      q: '¿Qué pasa si tengo deuda de tarjeta y también ahorros?',
      a: 'Pagar la deuda casi siempre gana. La CAE de una línea rotativa es varias veces la rentabilidad de cualquier instrumento de bajo riesgo, así que amortizar deuda es una inversión con retorno garantizado e igual a esa tasa. La excepción es el fondo de emergencia mínimo: conviene conservar un colchón chico para no volver a endeudarte al primer imprevisto.',
    },
    {
      q: '¿Dónde dejo la plata del fondo de emergencia?',
      a: 'En algo que puedas rescatar rápido y sin perder capital: cuenta de ahorro, depósitos a plazo cortos y escalonados, o fondos mutuos de deuda de muy corto plazo con comisión baja. Lo que no corresponde es tenerlo en acciones o en fondos accionarios: justo cuando lo necesitas puede estar valiendo menos, que es exactamente lo que un fondo de emergencia debe evitar.',
    },
    {
      q: '¿Por qué mi rendimiento real da distinto a esta estimación?',
      a: 'Las diferencias habituales vienen del cálculo exacto de días de cada instrumento, de comisiones de entrada o salida que no están en la remuneración anual, del reajuste de la UF cuando el instrumento es reajustable, del momento en que efectivamente se hace el rescate y de tu tramo real de Global Complementario, que se conoce recién al cerrar el año. Esta página estima el caso base con los parámetros que le pongas.',
    },
  ],

  sources: [
    {
      name: 'SII — Art. 57 de la Ley de la Renta, rentas exentas de Global Complementario',
      url: 'https://www.sii.cl/normativa_legislacion/renta/ley_impuesto_renta.pdf',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'SII — valores de la UTM y la UTA',
      url: 'https://www.sii.cl/valores_y_fechas/utm/utm2026.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'CMF — fondos mutuos: remuneraciones, series y prospectos',
      url: 'https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18574.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'CMF Educa — depósitos a plazo, fondos mutuos y acciones',
      url: 'https://www.cmfeduca.cl/educa/portal/w3-propertyname-548.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'Bolsa de Santiago — tarifas y derechos de bolsa',
      url: 'https://www.bolsadesantiago.com/',
      publisher: 'Bolsa de Santiago',
    },
    {
      name: 'Banco Central de Chile — instrumentos de deuda BCU, BCP y estadísticas de tasas',
      url: 'https://www.bcentral.cl/areas/mercados-financieros/instrumentos-de-deuda',
      publisher: 'Banco Central de Chile',
    },
    {
      name: 'Tesorería General de la República — bonos de Tesorería BTU y BTP',
      url: 'https://www.tesoreria.cl/',
      publisher: 'Tesorería General de la República',
    },
  ],

  replaces: [
    '/calculadora-deposito-plazo-chile-bancos-2026-tasa',
    '/calculadora-fondo-mutuo-vs-deposito-plazo-chile-rendimiento',
    '/calculadora-fondos-mutuos-chile-rentabilidad-comparativa-2026',
    '/calculadora-bonos-tesoro-chile-bcu-bce-rendimiento',
    '/calculadora-acciones-bolsa-santiago-chile-comisiones-broker',
    '/calculadora-fondo-emergencia-chile-meses-gastos-recomendado',
    // Absorbidas SÓLO por URL: son tarifarios de cuentas y medios de pago, no una
    // decisión de dónde poner los ahorros. Sus constantes de comisiones no son
    // verificables contra ninguna publicación oficial. Ver reporte.
    '/calculadora-deposito-vista-vs-cuenta-corriente-chile-comisiones',
    '/calculadora-banca-digital-mach-tenpo-chita-tarjeta-comisiones',
    '/calculadora-pago-electronico-chile-transbank-comisiones-onepay-mach',
  ],

  lastReviewed: '2026-07-28',
};
