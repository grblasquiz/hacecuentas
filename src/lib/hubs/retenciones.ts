import type { HubData } from './types';
import { MIS_FACILIDADES_RG5828 } from '../data/argentina-2026';

/**
 * Hub de decisión — "¿Qué retenciones y percepciones me hacen al facturar?"
 *
 * Absorbe 7 URLs sueltas del silo de impuestos AR (ver `replaces`). Todos los
 * números salen de las fórmulas reales:
 *   - src/lib/formulas/retencion-afip-cuit-regimen-general.ts   (RG 830)
 *   - src/lib/formulas/impuesto-debitos-creditos.ts             (ley 25.413)
 *   - src/lib/formulas/percepciones-impositivas.ts              (percepción genérica)
 *   - src/lib/formulas/percepcion-dolar-tarjeta-impuesto-pais.ts
 *   - src/lib/formulas/intereses-resarcitorios-punitorios-afip.ts
 *   - src/lib/formulas/plan-pagos-arca-mis-facilidades.ts
 *   - src/lib/formulas/factura-electronica-afip-primera-vez.ts
 */

/** RG 830: alícuotas por régimen, espejo de retencion-afip-cuit-regimen-general.ts */
export const RG830_RATES: Record<string, number> = {
  'inscripto_ganancias_2%': 0.02,
  'alquiler_inmueble_6%': 0.06,
  'profesional_liberal_10%': 0.1,
  'no_inscripto_ganancias_28%': 0.28,
};

/**
 * Constantes del hub. Todas replican la fórmula de origen; ninguna es inventada.
 *  - IDC_UNILATERAL / IDC_COMPUTABLE: ley 25.413 + cómputo a cuenta de Ganancias.
 *  - INTERES_*: Res. 823/2025 del Ministerio de Economía (tasas mensuales en pesos).
 *    Se actualizan bimestralmente: hay que verificar el bimestre vigente en ARCA.
 *  - PERCEPCION_TURISMO_PESOS: RG 5617/2024, único caso que sigue alcanzado.
 *  - PERCEPCION_MONEDA_EXTRANJERA: 0 desde el 02-01-2026.
 */
export const TAX = {
  idcUnilateral: 0.006,
  idcComputable: 0.33,
  interesResarcitorioMensual: 0.0275,
  interesPunitorioMensual: 0.035,
  percepcionTurismoPesos: 0.3,
  percepcionMonedaExtranjera: 0,
  plan: MIS_FACILIDADES_RG5828,
};

const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'impuestos/retenciones',
  title: 'Retenciones y percepciones al facturar: cuánto te descuentan | ARCA',
  description:
    'Calculá qué te retienen y qué te perciben cuando facturás o movés plata: retención de Ganancias RG 830, impuesto al cheque, percepciones, intereses por mora y plan de pagos de ARCA.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Guía y estimación impositiva',
  h1: 'Facturaste, ¿y por qué te llega menos plata?',
  lede:
    'Entre la retención de Ganancias, el impuesto al cheque y las percepciones, lo que cobrás casi nunca es lo que facturaste. Elegí tu situación y mirá el número real.',
  stamps: ['Régimen general RG 830', 'Impuesto al cheque ley 25.413', '7 calculadoras adentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué te pasó?',
    intro: 'Arrancamos por el caso más frecuente: te retienen Ganancias al cobrar una factura.',
    items: [
      {
        id: 'rg830',
        label: 'Me retuvieron Ganancias al cobrar la factura',
        hint: 'RG 830 · régimen general',
        answer: 'La retención de RG 830 es un pago a cuenta: no la perdés, la computás.',
        yes: [
          'Retención de Ganancias sobre el importe del comprobante, según el régimen que te corresponde',
          'El neto que efectivamente entra a tu cuenta',
          'El certificado de retención que el agente tiene que entregarte',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La RG 830 tiene mínimos no imponibles por régimen: si el pago del mes queda debajo, no corresponde retención. Acá calculamos la alícuota plena.',
          'Si no estás inscripto en Ganancias la alícuota salta al 28% sin mínimo: conviene regularizar antes de facturar.',
        ],
        plazo: 'exigí el certificado de retención en el mismo momento del pago: sin él no podés computarla.',
      },
      {
        id: 'cheque',
        label: 'Me cobraron impuesto al cheque en la cuenta',
        hint: 'Ley 25.413 · débitos y créditos',
        answer: 'El impuesto al cheque es 0,6% por lado: 1,2% si entra y sale.',
        yes: [
          '0,6% sobre el débito y 0,6% sobre el crédito de cada movimiento alcanzado',
          'El 33% del impuesto se computa como pago a cuenta de Ganancias si estás inscripto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Monotributistas y cuentas de micro y pequeñas empresas tienen alícuotas reducidas o exenciones: el cálculo usa el régimen general.',
          'Las cajas de ahorro de personas humanas están exentas; las cuentas corrientes no.',
        ],
        plazo: 'el banco lo debita solo: revisá el extracto y guardá el resumen para computar el 33%.',
      },
      {
        id: 'percepcion',
        label: 'Me percibieron un impuesto en una compra',
        hint: 'Percepción con alícuota',
        answer: 'La percepción se suma a la factura y después la descontás en tu DDJJ.',
        yes: [
          'Percepción sobre la base imponible según la alícuota del régimen aplicable',
          'El total que terminás pagando y la tasa efectiva sobre la base',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Cada régimen (IVA, Ganancias, IIBB provincial, aduana) tiene su propia alícuota y su propia base: cargá la que figura en tu comprobante.',
          'Si acumulás percepciones que no llegás a computar, generás saldo a favor: se pide devolución, no se pierde.',
        ],
        plazo: 'las percepciones del mes se computan en la DDJJ del período en que fueron practicadas.',
      },
      {
        id: 'tarjeta-fx',
        label: 'Compré en dólares o pagué un servicio del exterior',
        hint: 'Sin percepción desde 2026',
        answer: 'Desde el 02-01-2026 no hay percepción del 30% en consumos en moneda extranjera.',
        yes: [
          'El consumo se liquida al tipo de cambio de tu tarjeta, sin recargo impositivo',
          'El Impuesto PAÍS está derogado desde el 22-12-2024 (decreto 1057/2024)',
          'La percepción del 30% a cuenta de Ganancias y Bienes Personales dejó de aplicarse a estos consumos',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si tenés percepciones retenidas de años anteriores, se piden por el régimen de devolución de ARCA: no vencen automáticamente.',
          'Ojo con el caso inverso: los servicios turísticos abonados en pesos SIGUEN alcanzados por el 30%.',
        ],
        plazo: 'las percepciones viejas se reclaman con el trámite de devolución en el portal de ARCA.',
      },
      {
        id: 'tarjeta-turismo',
        label: 'Pagué un paquete o pasaje en pesos a una agencia',
        hint: 'Percepción 30% vigente',
        answer: 'El turismo pagado en pesos sigue con la percepción del 30%.',
        yes: [
          'Percepción del 30% a cuenta de Ganancias y Bienes Personales sobre el importe en pesos',
          'Es recuperable: se computa en la DDJJ o se pide devolución si no tributás',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Pasajes internacionales, hoteles del exterior y paquetes contratados en pesos con agencia local quedan alcanzados; el mismo consumo pagado en dólares, no.',
          'Si no estás inscripto en Ganancias ni en Bienes Personales, la percepción se pide por el régimen de devolución.',
        ],
        plazo: 'la devolución para no inscriptos se tramita desde enero del año siguiente al consumo.',
      },
      {
        id: 'deuda',
        label: 'Me atrasé con un pago a ARCA',
        hint: 'Intereses resarcitorios',
        answer: 'La mora corre por día: los resarcitorios se devengan desde el vencimiento.',
        yes: [
          'Intereses resarcitorios sobre el capital adeudado, prorrateados por día de atraso',
          'El total a regularizar hoy',
          'Los punitorios, que solo aplican si ARCA inicia juicio de ejecución fiscal',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las tasas se actualizan bimestralmente: confirmá la vigente en la calculadora de intereses de ARCA antes de pagar.',
          'Los punitorios no se suman a los resarcitorios: los reemplazan a partir de la demanda judicial.',
        ],
        plazo: 'pagá el mismo día que calculás: un día más de atraso cambia el importe.',
      },
      {
        id: 'plan',
        label: 'Quiero pasar la deuda a un plan de cuotas',
        hint: 'Mis Facilidades',
        answer: 'El plan pide un pago a cuenta y financia el resto en cuotas fijas.',
        yes: [
          'Pago a cuenta al adherir, según el tipo de contribuyente',
          'Cuotas fijas por sistema francés a tasa de financiación mensual',
          'El costo total de la financiación',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Hay cuota y pago a cuenta mínimos: si tu cuota queda por debajo, ARCA te obliga a menos cuotas.',
          'Las cuotas se debitan automáticamente de la cuenta declarada; dos cuotas impagas caducan el plan y vuelven los intereses.',
        ],
        plazo: 'la caducidad del plan reactiva la deuda original con todos los intereses corridos.',
      },
      {
        id: 'primera-factura',
        label: 'Nunca facturé: ¿qué me van a descontar?',
        hint: 'Monotributo · primera factura',
        answer: 'Como monotributista no te retienen Ganancias ni IVA por RG 830.',
        yes: [
          'Emitir la factura es gratis desde el comprobante en línea de ARCA',
          'El monotributo está excluido del régimen de retención de Ganancias de la RG 830',
          'Cobrás el importe completo del comprobante',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si superás el tope de facturación de tu categoría y quedás excluido, pasás a responsable inscripto y ahí sí empiezan las retenciones.',
          'IIBB provincial es aparte: varias provincias sí retienen o perciben a monotributistas.',
        ],
        plazo: 'dás de alta el punto de venta y emitís el mismo día, sin costo ni facturador externo.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada caso usa solo los campos que necesita. Los demás podés dejarlos como están.',
  fields: [
    {
      id: 'importe',
      label: 'Importe de la operación, en pesos',
      prefix: '$',
      value: '1.000.000',
      thousands: true,
      help: 'Es el monto del comprobante, del movimiento bancario, del consumo ya pasado a pesos o de la deuda, según tu caso.',
    },
    {
      id: 'regimen',
      label: 'Régimen de retención (RG 830)',
      type: 'select',
      value: 'inscripto_ganancias_2%',
      options: [
        { value: 'inscripto_ganancias_2%', label: 'Venta de bienes o servicios, inscripto en Ganancias — 2%' },
        { value: 'alquiler_inmueble_6%', label: 'Alquiler de inmueble — 6%' },
        { value: 'profesional_liberal_10%', label: 'Honorarios de profesión liberal — 10%' },
        { value: 'no_inscripto_ganancias_28%', label: 'No inscripto en Ganancias — 28%' },
      ],
    },
    {
      id: 'alicuota',
      label: 'Alícuota de la percepción, en %',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.5,
      value: 3,
      help: 'La que figura en tu comprobante. Solo se usa en el caso de percepciones.',
    },
    {
      id: 'dias',
      label: 'Días de atraso',
      type: 'number',
      min: 0,
      value: 30,
      help: 'Días corridos entre el vencimiento y el día que vas a pagar.',
    },
    {
      id: 'cuotas',
      label: 'Cuotas del plan de pagos',
      type: 'number',
      min: 1,
      max: 18,
      value: 12,
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué te queda y qué se lleva el fisco',
    caption:
      'El anillo separa la plata que efectivamente movés de lo que se va en retenciones, percepciones, impuestos o intereses.',
  },
  breakdownTitle: 'Cómo se arma el número',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿La retención de Ganancias es plata que pierdo?',
      a: 'No. La retención de la RG 830 es un pago a cuenta del impuesto anual: se computa en la declaración jurada de Ganancias contra el impuesto determinado. Si retuvieron de más, genera saldo a favor y se pide devolución. Lo que sí perdés es el certificado si no lo reclamás: sin certificado no podés computarla.',
    },
    {
      q: '¿Cuánto me retienen si no estoy inscripto en Ganancias?',
      a: 'La alícuota del régimen general para sujetos no inscriptos es del 28% y se aplica sin mínimo no imponible. Es el peor escenario posible y suele ser más caro que el costo de inscribirse y presentar la declaración.',
    },
    {
      q: '¿Qué es el mínimo no imponible de la RG 830?',
      a: 'Cada régimen de la RG 830 tiene un importe mensual por debajo del cual el agente de retención no debe retener. Se computa por el acumulado de pagos del mes calendario entre el mismo agente y el mismo beneficiario, no por factura individual: dos facturas chicas en el mismo mes pueden sumar y disparar la retención.',
    },
    {
      q: '¿Cuánto es exactamente el impuesto al cheque?',
      a: 'La alícuota general de la ley 25.413 es 0,6% sobre los débitos y 0,6% sobre los créditos de la cuenta. Si el mismo dinero entra y sale, el costo efectivo es 1,2%. Hay alícuotas reducidas para micro y pequeñas empresas y exenciones para cajas de ahorro de personas humanas.',
    },
    {
      q: '¿Qué parte del impuesto al cheque puedo recuperar?',
      a: 'El 33% del impuesto se computa como pago a cuenta de Ganancias para contribuyentes inscriptos. El 67% restante es costo puro. Para micro y pequeñas empresas el porcentaje computable es mayor según el régimen de la ley 27.264.',
    },
    {
      q: '¿Sigue existiendo el Impuesto PAÍS en las compras con tarjeta?',
      a: 'No. El Impuesto PAÍS quedó derogado el 22 de diciembre de 2024 al vencer su plazo legal, sin prórroga. Cualquier cálculo que todavía sume 30% de PAÍS a un consumo en dólares está usando un dato muerto.',
    },
    {
      q: '¿Y la percepción del 30% del dólar tarjeta?',
      a: 'Desde el 2 de enero de 2026 ARCA dejó de aplicar la percepción del 30% a cuenta de Ganancias y Bienes Personales sobre los consumos con tarjeta en moneda extranjera y con proveedores del exterior. Sigue vigente únicamente para servicios turísticos abonados en pesos: pasajes internacionales, hoteles del exterior y paquetes contratados en pesos.',
    },
    {
      q: '¿Cómo recupero percepciones de años anteriores?',
      a: 'Si estás inscripto, las computás en la declaración jurada de Ganancias o Bienes Personales del período en que te las practicaron. Si no tributás ninguno de los dos, se pide por el régimen de devolución de percepciones del portal de ARCA, con clave fiscal y CBU declarado.',
    },
    {
      q: '¿Cuál es la diferencia entre intereses resarcitorios y punitorios?',
      a: 'Los resarcitorios corren desde el vencimiento y son los que pagás cuando regularizás por tu cuenta. Los punitorios son más altos y solo aplican cuando ARCA inicia el juicio de ejecución fiscal: no se suman a los resarcitorios, los reemplazan a partir de la demanda. Ambas tasas se actualizan bimestralmente.',
    },
    {
      q: '¿Me conviene un plan de pagos o pagar con intereses resarcitorios?',
      a: 'Depende del plazo. Si podés pagar en pocos días, los resarcitorios prorrateados suelen ser más baratos que la financiación del plan más el pago a cuenta. Si la deuda te lleva meses, el plan corta el devengamiento de intereses de mora y te da previsibilidad, a costa del interés de financiación.',
    },
    {
      q: '¿A un monotributista le retienen algo al facturar?',
      a: 'En el régimen nacional, no: el monotributo está excluido del régimen de retención de Ganancias e IVA de la RG 830. Lo que sí puede aparecer es la retención o percepción de Ingresos Brutos provincial, que depende de cada jurisdicción y del régimen en el que estés inscripto.',
    },
    {
      q: '¿Emitir la primera factura tiene costo?',
      a: 'No. El comprobante en línea de ARCA es gratuito: se da de alta el punto de venta desde el portal con clave fiscal y se emite la factura en el momento. No hace falta contratar un facturador externo ni un sistema pago.',
    },
  ],

  sources: [
    {
      name: 'RG 830/2000 — Régimen de retención del Impuesto a las Ganancias',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/62761/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto actualizado',
    },
    {
      name: 'Ley 25.413 — Impuesto sobre los créditos y débitos en cuentas bancarias',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/65000-69999/66533/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Decreto 1057/2024 — fin del Impuesto PAÍS',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/319178/20241202',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '02-12-2024',
    },
    {
      name: 'RG 5617/2024 — percepción a cuenta de Ganancias y Bienes Personales',
      url: 'https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-5617-2024-404424',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Régimen de devolución de percepciones — operaciones en moneda extranjera',
      url: 'https://www.afip.gob.ar/regimen-devolucion-percepciones/percepcion/importe.asp',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Intereses resarcitorios y punitorios — calculadora oficial',
      url: 'https://www.afip.gob.ar/sitio/externos/default.asp',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Mis Facilidades — planes de pago RG 5828/2026',
      url: 'https://www.afip.gob.ar/misfacilidades/',
      publisher: 'ARCA (ex AFIP)',
    },
  ],

  replaces: [
    '/calculadora-impuesto-cheque-debitos-creditos',
    '/calculadora-retencion-afip-cuit-regimen-general',
    '/calculadora-intereses-resarcitorios-punitorios-afip',
    '/calculadora-plan-pagos-arca-mis-facilidades-cuota-interes',
    '/calculadora-percepcion-dolar-tarjeta-impuesto-pais',
    '/calculadora-percepciones-impositivas',
    '/calculadora-factura-electronica-afip-primera-vez',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-retencion-ganancias-rg-830',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
