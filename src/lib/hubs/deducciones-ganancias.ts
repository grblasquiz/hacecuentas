import type { HubData } from './types';
import {
  GNI_ANUAL,
  MNI_MENSUAL_BASE,
  DEDUCCION_ESPECIAL_AUTONOMOS_ANUAL,
  INCREMENTO_CONYUGE_MENSUAL,
  INCREMENTO_HIJO_MENSUAL,
  INCREMENTO_HIJO_INCAPACITADO_MENSUAL,
  ESCALA,
} from '../formulas/_ganancias-escala';

/**
 * Hub de decisión — "¿Qué me puedo deducir de Ganancias y cuánto me baja?"
 *
 * NO recalcula el impuesto de cuarta categoría (eso es
 * `impuestos/ganancias-cuarta-categoria`): responde qué deducciones podés
 * computar, cuánto bajan la base imponible y cuánto impuesto te ahorran.
 *
 * Todas las constantes salen de `src/lib/formulas/_ganancias-escala.ts`, la
 * misma fuente única que usan las tres calculadoras que este hub absorbe.
 */

/** Disclaimer YMYL — textual de getCalculatorDisclaimer(), dominio 'tax'. */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'impuestos/deducciones-ganancias',
  title: '¿Qué me puedo deducir de Ganancias y cuánto me baja? — Alquiler, familia y prepaga',
  description:
    'Calculá cuánto podés deducir de Ganancias: 40% del alquiler con tope de la ganancia no imponible, cónyuge e hijos a cargo y la prepaga con su tope del 5%. Verás el total deducible, la base imponible antes y después, y el impuesto que te ahorrás.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Guía y estimación impositiva',
  h1: '¿Qué me puedo deducir de Ganancias y cuánto me baja?',
  lede:
    'Partimos del caso más habitual: empleado en relación de dependencia que alquila. Cargá el alquiler, las cargas de familia y la prepaga, y mirá cuánto baja tu base imponible y cuánto impuesto dejás de pagar. Si tu situación es otra, la cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Arts. 30 y 85 LIG · topes vigentes', '3 calculadoras adentro'],

  resultLabel: 'Total deducible por año',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'empleado-alquiler',
        label: 'Trabajo en relación de dependencia y alquilo',
        hint: 'El caso más común',
        answer: 'Podés deducir el 40% del alquiler, con tope de la ganancia no imponible anual.',
        yes: [
          'El 40% de lo que pagás de alquiler de tu vivienda (art. 85 inc. h LIG)',
          'Con tope: lo deducible no puede superar la ganancia no imponible del período',
          'Se suma a la ganancia no imponible y a la deducción especial de empleados que ya te computan de oficio',
          'Se carga en el SiRADIG con el contrato y las facturas del locador',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La deducción exige que no seas titular de ningún inmueble, en ninguna proporción: si tenés una propiedad aunque sea en parte, no la podés tomar',
          'El contrato tiene que estar registrado en ARCA y el locador emitir comprobante por cada mes que declarás',
        ],
        plazo: 'el SiRADIG se puede cargar durante todo el año; el 31 de marzo cierra para incidir en la liquidación anual del período anterior.',
      },
      {
        id: 'familia',
        label: 'Tengo cónyuge y/o hijos a cargo',
        hint: 'Cargas de familia · art. 30 inc. b',
        answer: 'Cada carga de familia declarada baja tu base imponible todos los meses del año.',
        yes: [
          'Cónyuge o conviviente a cargo (art. 30 inc. b apt. 1)',
          'Hijos menores de 18 años o incapacitados para el trabajo (art. 30 inc. b apt. 2)',
          'El hijo incapacitado computa el doble que un hijo menor',
          'Se declara en el SiRADIG con el vínculo y el CUIL de cada familiar',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El familiar tiene que ser residente en el país y no tener ingresos netos anuales superiores a la ganancia no imponible',
          'Si el hijo lo deducen los dos progenitores, cada uno computa el 50%: no se toma entero dos veces',
        ],
        plazo: 'las altas y bajas de familiares se cargan en el SiRADIG en el mes en que ocurren; los cambios se prorratean por mes.',
      },
      {
        id: 'prepaga',
        label: 'Pago prepaga o gastos médicos',
        hint: 'Tope del 5% de la ganancia neta',
        answer: 'La cuota de prepaga se deduce hasta el 5% de tu ganancia neta anual.',
        yes: [
          'Cuota de medicina prepaga tuya y de las cargas de familia que declarás (art. 85 inc. g LIG)',
          'Honorarios médicos facturados, con el mismo tope del 5%',
          'De los honorarios se computa el 40% de lo facturado, y sólo la parte no reintegrada por la obra social',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los honorarios médicos y la cuota de prepaga comparten el mismo tope del 5%: no es 5% para cada uno',
          'Lo que excede el tope se pierde: no se traslada al año siguiente',
        ],
        plazo: 'los gastos médicos se cargan en el SiRADIG hasta el 31 de marzo del año siguiente al que se pagaron.',
      },
      {
        id: 'autonomo',
        label: 'Soy autónomo en régimen general',
        hint: 'Deducción especial más baja',
        answer: 'Deducís lo mismo, pero con la deducción especial de autónomos, bastante menor.',
        yes: [
          'Alquiler, cargas de familia y prepaga se computan igual que un empleado',
          'La ganancia no imponible del art. 30 inc. a también se computa',
          'Pero la deducción especial es la del art. 30 inc. c apt. 1 (autónomos), no la incrementada de empleados',
          'Además deducís los gastos necesarios de tu actividad, que un empleado no tiene',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La deducción especial de autónomos exige tener los aportes previsionales al día: en mora no se puede computar y el impuesto sube',
          'Acá no se descuenta el 17% de aportes personales del recibo: la base arranca de tu utilidad, no de un bruto',
        ],
        plazo: 'la declaración jurada anual de personas humanas vence en junio del año siguiente.',
      },
      {
        id: 'monotributo',
        label: 'Soy monotributista',
        hint: 'No deducís nada',
        answer: 'En monotributo no se deduce alquiler, familia ni prepaga: pagás una cuota fija.',
        yes: [
          'El monotributo es un régimen simplificado: la cuota mensual reemplaza a Ganancias',
          'No hay base imponible que reducir, así que ninguna deducción del art. 30 o del art. 85 aplica',
          'Si además sos empleado en relación de dependencia, por ESE sueldo sí deducís todo lo demás',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La componente de obra social del monotributo no es deducible como prepaga: ya está dentro de la cuota',
          'Si te excluyen del régimen por superar el tope de facturación, pasás a régimen general de forma retroactiva y ahí sí conviene tener las deducciones documentadas',
        ],
        plazo: 'la recategorización es en enero y julio; la exclusión por exceso de tope opera desde el mes en que ocurre.',
      },
      {
        id: 'jubilado',
        label: 'Soy jubilado o pensionado',
        hint: 'Opción de deducción específica',
        answer: 'Deducís como un empleado, o podés optar por la deducción específica de jubilados.',
        yes: [
          'La jubilación es renta de cuarta categoría y computa la deducción especial incrementada, igual que un empleado',
          'Alquiler, cargas de familia y prepaga se deducen con los mismos topes',
          'Del haber sólo se descuenta el aporte a la obra social, no el 17% completo de un recibo de sueldo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La deducción específica del art. 30 para jubilados es EXCLUYENTE de la ganancia no imponible y de la deducción especial: no se suman, se elige la más conveniente',
          'La deducción específica no se puede tomar si tenés otros ingresos gravados o si estás obligado a tributar Bienes Personales por algo distinto de tu casa',
        ],
        plazo: 'ANSES actúa como agente de retención: los datos se cargan igual por SiRADIG.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después. Cada campo pesa sólo si corresponde a tu caso.',
  fields: [
    {
      id: 'ingreso',
      label: 'Ingreso bruto mensual (sueldo, haber o utilidad)',
      prefix: '$',
      value: '3.500.000',
      thousands: true,
      help: 'En relación de dependencia, el bruto del recibo. Si sos autónomo, tu utilidad mensual antes de deducciones personales.',
    },
    {
      id: 'alquiler',
      label: 'Alquiler de vivienda por mes',
      prefix: '$',
      value: '600.000',
      thousands: true,
      help: 'Se deduce el 40%, con tope de la ganancia no imponible anual. Dejalo en 0 si no alquilás.',
    },
    {
      id: 'conyuge',
      label: 'Cónyuge o conviviente a cargo',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
    },
    { id: 'hijos', label: 'Hijos menores a cargo', type: 'number', min: 0, max: 10, value: 2 },
    { id: 'hijosInca', label: 'Hijos incapacitados para el trabajo', type: 'number', min: 0, max: 10, value: 0 },
    {
      id: 'prepaga',
      label: 'Cuota de prepaga y gastos médicos por mes',
      prefix: '$',
      value: '180.000',
      thousands: true,
      help: 'Tope del 5% de la ganancia neta anual. Dejalo en 0 si no pagás prepaga.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu deducción',
    caption:
      'El donut muestra cuánto aporta cada concepto al total deducible del año: alquiler, cargas de familia y prepaga. Si un rubro no aparece, es porque el tope lo dejó en cero o no corresponde a tu caso.',
  },
  breakdownTitle: 'Cuánto deducís y cuánto impuesto te ahorra',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cuánto del alquiler puedo deducir de Ganancias?',
      a: 'El 40% de lo que pagás de alquiler de tu vivienda, según el art. 85 inc. h de la ley 20.628. Ese 40% tiene un tope: no puede superar la ganancia no imponible del período. Con un alquiler alto, el tope te recorta y el excedente se pierde.',
    },
    {
      q: '¿Puedo deducir el alquiler si tengo un departamento heredado?',
      a: 'No. La deducción exige no ser titular de ningún inmueble, en ninguna proporción. Si figurás como condómino de una propiedad heredada, aunque sea de un porcentaje chico, quedás fuera del beneficio.',
    },
    {
      q: '¿Qué documentación me piden por el alquiler?',
      a: 'El contrato de locación registrado en ARCA y un comprobante por cada mes que declarás. El locador tiene que emitir factura o recibo con su CUIT. Sin comprobante, ese mes no entra en la deducción.',
    },
    {
      q: '¿Cuánto se deduce por cónyuge y por cada hijo?',
      a: 'Son importes fijos anuales que ARCA actualiza por IPC cada semestre. El cónyuge computa aproximadamente el doble que un hijo menor, y el hijo incapacitado para el trabajo computa el doble que un hijo menor. El hub usa los valores vigentes del art. 30 inc. b y te muestra el total mensual y anual.',
    },
    {
      q: '¿Hasta qué edad puedo deducir un hijo?',
      a: 'Hasta los 18 años. Después de esa edad sólo se puede deducir si está incapacitado para el trabajo, sin límite de edad. Estudiar no habilita a seguir deduciéndolo.',
    },
    {
      q: '¿Los dos padres pueden deducir al mismo hijo?',
      a: 'Sí, pero cada uno computa el 50% del importe, o uno solo lo toma al 100%. No se puede deducir entero dos veces: si ARCA lo detecta, ajusta la liquidación anual y queda saldo a pagar.',
    },
    {
      q: '¿Cuál es el tope de la deducción de prepaga?',
      a: 'El 5% de la ganancia neta del período. La cuota de medicina prepaga y los honorarios médicos comparten ese mismo tope: no es un 5% para cada concepto. Lo que excede se pierde, no se traslada al año siguiente.',
    },
    {
      q: '¿Los honorarios médicos se deducen enteros?',
      a: 'No. Se computa el 40% de lo facturado y sólo por la parte que la obra social o prepaga no te reintegró, y siempre dentro del tope del 5% de la ganancia neta.',
    },
    {
      q: '¿Un monotributista puede deducir alquiler o prepaga?',
      a: 'No. El monotributo es un régimen simplificado con cuota fija que reemplaza a Ganancias: no hay base imponible que reducir. Si además tenés un sueldo en relación de dependencia, por ese sueldo sí computás todas las deducciones.',
    },
    {
      q: '¿Cuánto impuesto me ahorra realmente una deducción?',
      a: 'No te ahorra el monto deducido: te ahorra ese monto multiplicado por tu alícuota marginal de la escala del art. 94. Si caés en el tramo del 27%, cada peso deducido te devuelve 27 centavos de impuesto. Por eso el hub muestra el total deducible y, aparte, el ahorro real.',
    },
    {
      q: '¿Dónde se cargan estas deducciones?',
      a: 'En el portal SiRADIG - Trabajador de ARCA, con clave fiscal. El empleador las toma para calcular la retención mensual. Lo que no cargues no entra ni en la retención ni en la liquidación anual: esa plata no vuelve sola.',
    },
    {
      q: '¿Qué otras deducciones existen además de estas tres?',
      a: 'Intereses de crédito hipotecario, servicio doméstico, seguros de vida y de retiro, sepelio, donaciones, aportes a sociedades de garantía recíproca, alquileres percibidos con el régimen especial y los aportes obligatorios a cajas previsionales. Cada una tiene su tope propio y todas se cargan en el SiRADIG.',
    },
  ],

  sources: [
    {
      name: 'Ley 20.628 de Impuesto a las Ganancias — arts. 30 (deducciones personales) y 85 (deducciones generales)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/44911/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Deducciones personales del art. 30 — importes vigentes 2026',
      url: 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-ene-a-jun-2026.pdf',
      publisher: 'ARCA (ex AFIP)',
      date: 'período 2026',
    },
    {
      name: 'Tabla del art. 94 LIG — escala progresiva vigente',
      url: 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-ene-a-jun-2026.pdf',
      publisher: 'ARCA (ex AFIP)',
      date: 'período 2026',
    },
    {
      name: 'RG 4003/2017 — régimen de retención de cuarta categoría y SiRADIG',
      url: 'https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-4003-2017-272205',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'SiRADIG - Trabajador: cómo informar deducciones',
      url: 'https://www.afip.gob.ar/gananciasYBienes/ganancias/sujetos/personas-fisicas/siradig-trabajador.asp',
      publisher: 'ARCA (ex AFIP)',
    },
  ],

  replaces: [
    '/calculadora-deduccion-alquiler-ganancias-40-porciento',
    '/calculadora-deduccion-familia-conyuge-hijo-ganancias',
    '/calculadora-deduccion-prepaga-medicina-ganancias',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Constantes que consume el compute() de la página. Se derivan del módulo real
 * (`_ganancias-escala`) — nada duplicado a mano.
 *
 * `especialMensual` del empleado sale de MNI_MENSUAL_BASE menos la GNI mensual:
 * MNI_MENSUAL_BASE = (GNI_ANUAL + deducción especial apt. 2) / 12.
 */
const GNI_MENSUAL = GNI_ANUAL / 12;
const ESPECIAL_EMPLEADO_MENSUAL = MNI_MENSUAL_BASE - GNI_MENSUAL;
const ESPECIAL_AUTONOMO_MENSUAL = DEDUCCION_ESPECIAL_AUTONOMOS_ANUAL / 12;

export const DEDUC = {
  gniAnual: GNI_ANUAL,
  gniMensual: GNI_MENSUAL,
  conyugeMensual: INCREMENTO_CONYUGE_MENSUAL,
  hijoMensual: INCREMENTO_HIJO_MENSUAL,
  hijoIncaMensual: INCREMENTO_HIJO_INCAPACITADO_MENSUAL,
  /** Tope del art. 85 inc. g: 5% de la ganancia neta. */
  topePrepaga: 0.05,
  /** Porcentaje deducible del alquiler, art. 85 inc. h. */
  pctAlquiler: 0.4,
};

/**
 * Escala del art. 94 serializable para `define:vars`: el último tramo usa
 * `hasta: null` porque `Infinity` no sobrevive a JSON.
 */
export const ESCALA_JSON = ESCALA.map((t) => ({
  hasta: Number.isFinite(t.hasta) ? t.hasta : null,
  tasa: t.tasa,
  acumulado: t.acumulado,
}));

/**
 * Parámetros por rama: qué régimen aplica.
 *  - aportes: descuento personal sobre el bruto antes de la base de Ganancias.
 *  - especial: deducción especial mensual del art. 30 inc. c.
 *  - deduce: si el régimen admite deducciones (el monotributo no).
 */
export const CASE_MATH: Record<string, { aportes: number; especial: number; deduce: boolean }> = {
  'empleado-alquiler': { aportes: 0.17, especial: ESPECIAL_EMPLEADO_MENSUAL, deduce: true },
  familia: { aportes: 0.17, especial: ESPECIAL_EMPLEADO_MENSUAL, deduce: true },
  prepaga: { aportes: 0.17, especial: ESPECIAL_EMPLEADO_MENSUAL, deduce: true },
  autonomo: { aportes: 0, especial: ESPECIAL_AUTONOMO_MENSUAL, deduce: true },
  monotributo: { aportes: 0, especial: 0, deduce: false },
  jubilado: { aportes: 0.03, especial: ESPECIAL_EMPLEADO_MENSUAL, deduce: true },
};
