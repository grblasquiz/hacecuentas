import type { HubData } from '../types';
import { TIPO_CAMBIO_PY, PARAGUAY_2026 } from '../../data/paraguay-2026';
import live from '../../../data/live/paraguay.json';

/**
 * Hub de decisión PY — "Tu plata en guaraníes: cambiar, recibir, guardar".
 *
 * Cotizaciones: dato VIVO de src/data/live/paraguay.json cuando existe, con
 * fallback al snapshot de TIPO_CAMBIO_PY. El euro NO está en el feed vivo: el
 * valor es el snapshot de referencia que ya usaban las fórmulas y queda editable.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

const L: any = live as any;

/** 1 USD = X guaraníes. Dato vivo con fallback al snapshot del BCP. */
export const USD_PYG: number =
  typeof L?.usdpyg?.valor === 'number' ? L.usdpyg.valor : TIPO_CAMBIO_PY.usdPyg;

/** 1 BRL = X guaraníes. Dato vivo con fallback al snapshot del BCP. */
export const BRL_PYG: number =
  typeof L?.brlpyg?.valor === 'number' ? L.brlpyg.valor : TIPO_CAMBIO_PY.brlPyg;

/**
 * 1 ARS = X guaraníes. El feed vivo publica el valor por CADA 1.000 pesos
 * (`arspyg1000`), porque el peso vale fracciones de guaraní.
 */
export const ARS_PYG: number =
  typeof L?.arspyg1000?.valor === 'number' ? L.arspyg1000.valor / 1000 : TIPO_CAMBIO_PY.arsPyg;

/**
 * 1 EUR = X guaraníes. ⚠️ NO viene del feed vivo: es el snapshot de referencia
 * que ya usaban las fórmulas de euro y remesas. Editable en el formulario.
 */
export const EUR_PYG = 6884.58;

export const FX_AS_OF: string =
  typeof L?._meta?.fetchedAt === 'string' ? L._meta.fetchedAt.slice(0, 10) : TIPO_CAMBIO_PY.asOf;

/** IPC del BCP: variación interanual del último período publicado. */
export const IPC = {
  interanual: typeof L?.ipc?.variacionInteranual === 'number' ? L.ipc.variacionInteranual : 2.1,
  acumuladaAnio: typeof L?.ipc?.acumuladaAnio === 'number' ? L.ipc.acumuladaAnio : 1.9,
  periodo: typeof L?.ipc?.periodo === 'string' ? L.ipc.periodo : '2026-06',
};

/** IRP sobre rentas del capital: 8% sobre los intereses (Ley 6380/19). */
export const IRP_CAPITAL = PARAGUAY_2026.irp.tasaRentaCapital;

/** Parámetros por defecto de una remesa: comisión fija y spread cambiario. */
export const REMESA = { comisionEurDefault: 3.99, spreadPctDefault: 2 };

export const SMVM = PARAGUAY_2026.salarioMinimo;

const gs = (n: number) => 'Gs. ' + Math.round(n).toLocaleString('de-DE');
const dec = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'py/finanzas/guaranies',
  title: 'Dólar hoy en Paraguay: cotización en guaraníes y remesas',
  description:
    'Cotización del dólar, euro y peso argentino en guaraníes hoy: cuánto llega de una remesa, cuánto rinde un plazo fijo y cuánto se licuó por inflación.',
  silo: 'Finanzas',
  siloHref: '/py/finanzas',
  locale: 'py',

  eyebrow: 'Paraguay · BCP · cotización de referencia',
  h1: '¿Cuánto vale tu plata en guaraníes hoy?',
  lede:
    'Cambiar, recibir del exterior, poner a plazo fijo o simplemente ver si tu plata sigue valiendo lo mismo son cuatro versiones de la misma pregunta. Esta cuenta las resuelve con la cotización de referencia del BCP y el IPC del último período publicado.',
  stamps: [
    `1 USD = ${gs(USD_PYG)}`,
    `1 EUR = Gs. ${dec(EUR_PYG)} (referencia)`,
    `Inflación interanual: ${IPC.interanual.toLocaleString('es', { maximumFractionDigits: 2 })}%`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Guaraníes que recibís',

  cases: {
    title: '¿Qué querés hacer con la plata?',
    intro:
      'La cotización de referencia es la misma para todos, pero lo que llega a tu bolsillo cambia mucho según el camino. Partimos del más consultado.',
    items: [
      {
        id: 'cambiar',
        label: 'Cambiar dólares, euros o pesos',
        hint: 'Cotización de referencia del BCP',
        answer: `La referencia del BCP es de ${gs(USD_PYG)} por dólar, pero la casa de cambio te va a dar menos por el spread.`,
        yes: [
          'La cotización de referencia del BCP, que es un promedio ponderado de operaciones interbancarias',
          'El spread de la casa de cambio, que es la diferencia entre lo que compra y lo que vende',
          'En zona de frontera, la cotización de real y de peso argentino se aparta bastante de la referencia',
          'Para pasar de guaraníes a moneda extranjera se divide, no se multiplica',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La referencia del BCP NO es el precio al que vas a operar: es un promedio mayorista. Siempre vas a comprar más caro y vender más barato que esa cifra',
          'Las casas de cambio de frontera cotizan con márgenes propios que varían por hora y por monto',
        ],
        plazo: 'la cotización cambia todos los días hábiles: verificá antes de operar montos grandes.',
      },
      {
        id: 'remesa',
        label: 'Recibir una remesa del exterior',
        hint: 'Comisión fija más spread cambiario',
        answer: 'El costo real de una remesa casi nunca es la comisión visible: el grueso está en el tipo de cambio aplicado.',
        yes: [
          'La comisión fija que cobra el operador por el envío',
          'El spread cambiario: la diferencia entre la cotización de referencia y la que te aplican',
          'El costo total es la suma de los dos, y conviene medirlo como porcentaje del envío',
          'Comparar operadores con el mismo monto y el mismo día es la única forma seria de elegir',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Un servicio con "comisión cero" puede salir más caro que otro con comisión, si el tipo de cambio que aplica está peor: mirá siempre cuántos guaraníes llegan, no cuánto dice cobrar',
          'La cotización del euro de esta cuenta es un valor de referencia y no se actualiza en vivo: editalo con el que te ofrezca tu operador',
        ],
        plazo: 'los tipos de cambio de los operadores se congelan al iniciar la operación: compará antes de confirmar.',
      },
      {
        id: 'plazo-fijo',
        label: 'Poner la plata a plazo fijo',
        hint: 'CDA · IRP del 8% sobre intereses',
        answer: `Los intereses de un plazo fijo tributan IRP de rentas del capital al ${(IRP_CAPITAL * 100).toFixed(0)}% si estás incidido.`,
        yes: [
          'El interés se calcula sobre el capital, la tasa nominal anual y los días del plazo',
          `Si estás incidido por el IRP, sobre los intereses corre el ${(IRP_CAPITAL * 100).toFixed(0)}% de rentas del capital`,
          'La comparación relevante es la tasa contra la inflación interanual, no la tasa sola',
          'Retirar antes del vencimiento suele hacer perder el interés pactado',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La tasa que te ofrece cada entidad varía por monto y plazo: la de esta cuenta la cargás vos, no es una tasa de mercado',
          'Una tasa nominal por debajo de la inflación significa perder poder de compra aunque el saldo en guaraníes crezca',
        ],
        plazo: 'el interés se liquida al vencimiento del certificado de depósito de ahorro.',
      },
      {
        id: 'inflacion',
        label: 'Ver cuánto se licuó mi plata',
        hint: `IPC del BCP · ${IPC.interanual.toLocaleString('es', { maximumFractionDigits: 2 })}% interanual`,
        answer: `Con una inflación interanual del ${IPC.interanual.toLocaleString('es', { maximumFractionDigits: 2 })}%, un monto guardado un año vale hoy algo menos de lo que valía.`,
        yes: [
          'Actualizar un monto viejo por la inflación acumulada del período',
          'Medir cuánto poder de compra perdiste si tu ingreso no se movió',
          'Comparar un precio de hace años contra su equivalente de hoy',
          `Paraguay tiene una de las inflaciones más bajas de la región: la interanual del último período fue del ${IPC.interanual.toLocaleString('es', { maximumFractionDigits: 2 })}%`,
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El IPC es un promedio de la canasta general: tu inflación personal puede ser bastante distinta según en qué gastes',
          'Actualizar por inflación no es lo mismo que actualizar por tipo de cambio: para deudas o precios en dólares, la cuenta que corresponde es la cambiaria',
        ],
        plazo: 'el BCP publica el IPC mensualmente; el dato de esta cuenta corresponde al último período cargado.',
      },
    ],
  },

  inputsTitle: 'Tus montos',
  inputsIntro:
    'Cada bloque se calcula solo: cargá lo que te interese y dejá el resto como viene.',
  fields: [
    {
      id: 'montoUsd',
      label: 'Dólares a cambiar (US$)',
      prefix: 'US$',
      value: '500',
      thousands: true,
      help: `Cotización de referencia del BCP: ${gs(USD_PYG)} por dólar.`,
    },
    {
      id: 'montoArs',
      label: 'Pesos argentinos a cambiar ($)',
      prefix: '$',
      value: '100.000',
      thousands: true,
      help: `Referencia: 1 peso = Gs. ${ARS_PYG.toLocaleString('de-DE', { maximumFractionDigits: 4 })}. En Encarnación la cotización real difiere.`,
    },
    {
      id: 'montoEur',
      label: 'Euros de la remesa (€)',
      prefix: '€',
      value: '300',
      thousands: true,
      help: 'El monto que se envía desde el exterior, antes de comisiones.',
    },
    {
      id: 'tcEur',
      label: 'Cotización del euro a usar (Gs. por €)',
      type: 'number',
      value: EUR_PYG,
      min: 1,
      max: 50000,
      step: 0.01,
      help: 'Editable: el valor por defecto es una referencia y no se actualiza en vivo.',
    },
    {
      id: 'comision',
      label: 'Comisión del operador (€)',
      prefix: '€',
      value: REMESA.comisionEurDefault,
      help: 'La comisión fija que te cobran por el envío.',
    },
    {
      id: 'spread',
      label: 'Spread cambiario del operador (%)',
      type: 'number',
      value: REMESA.spreadPctDefault,
      min: 0,
      max: 15,
      step: 0.1,
      help: 'Cuánto peor que la referencia es el tipo de cambio que te aplican.',
    },
    {
      id: 'capital',
      label: 'Capital para el plazo fijo (Gs.)',
      prefix: 'Gs.',
      value: '20.000.000',
      thousands: true,
      help: 'Lo que vas a depositar en el certificado de ahorro.',
    },
    {
      id: 'tasaAnual',
      label: 'Tasa nominal anual del plazo fijo (%)',
      type: 'number',
      value: 8,
      min: 0,
      max: 60,
      step: 0.1,
      help: 'La que te ofrece la entidad. Compará contra la inflación interanual.',
    },
    {
      id: 'plazoDias',
      label: 'Plazo del depósito (días)',
      type: 'number',
      value: 365,
      min: 1,
      max: 3650,
      step: 1,
      help: 'El interés se calcula proporcional a los días sobre base 365.',
    },
    {
      id: 'aplicaIrp',
      label: '¿Estás incidido por el IRP?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No: no supero el umbral' },
        { value: 'si', label: `Sí: descontar el ${(IRP_CAPITAL * 100).toFixed(0)}% sobre los intereses` },
      ],
      help: 'Las rentas del capital tributan al 8% sólo si sos contribuyente incidido.',
    },
    {
      id: 'montoViejo',
      label: 'Monto a actualizar por inflación (Gs.)',
      prefix: 'Gs.',
      value: '5.000.000',
      thousands: true,
      help: 'Un precio o un ingreso de hace un tiempo, para llevarlo a valores de hoy.',
    },
    {
      id: 'inflacionPct',
      label: 'Inflación acumulada del período (%)',
      type: 'number',
      value: IPC.interanual,
      min: 0,
      max: 500,
      step: 0.1,
      help: `Por defecto, la interanual del último período publicado por el BCP (${IPC.periodo}).`,
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'Qué llega y qué se pierde en el camino',
    caption:
      'Sobre una remesa, separa los guaraníes que efectivamente recibís de lo que se lleva la comisión y de lo que se lleva el spread cambiario, que suele ser la parte invisible.',
  },
  breakdownTitle: 'Cada cuenta por separado',
  breakdownIntro:
    'Primero el cambio directo, después la remesa con sus costos, luego el rendimiento del plazo fijo y al final el efecto de la inflación.',

  faq: [
    {
      q: '¿Cuánto está el dólar en Paraguay hoy?',
      a: `La cotización de referencia que usa esta cuenta es de ${gs(USD_PYG)} por dólar, tomada del último dato disponible al ${FX_AS_OF}. Es una referencia mayorista: en la casa de cambio vas a comprar algo más caro y vender algo más barato, porque cada operador aplica su propio spread.`,
    },
    {
      q: '¿Por qué la casa de cambio me da menos que la cotización oficial?',
      a: 'Porque la referencia del BCP es un promedio ponderado de operaciones interbancarias, no un precio al público. Las casas de cambio compran por debajo y venden por encima de esa referencia, y esa diferencia es su ganancia. Cuanto más chico el monto y más alejado el lugar, más ancho suele ser el spread.',
    },
    {
      q: '¿Cómo paso de guaraníes a dólares?',
      a: `Dividiendo por la cotización, no multiplicando. Si el dólar está a ${gs(USD_PYG)}, un millón de guaraníes son un millón dividido por esa cifra. Es un error frecuente hacer la cuenta al revés y llevarse una sorpresa desagradable en la ventanilla.`,
    },
    {
      q: '¿Cuánto llega realmente de una remesa?',
      a: 'Menos de lo que sugiere la comisión visible. Al monto enviado se le resta la comisión fija y después se convierte al tipo de cambio del operador, que está por debajo de la referencia. Ese segundo costo, el spread, suele ser mayor que la comisión y no aparece destacado en ningún lado. La única comparación válida es cuántos guaraníes llegan a destino.',
    },
    {
      q: '¿Conviene un servicio de remesas con comisión cero?',
      a: 'No necesariamente. "Comisión cero" casi siempre significa que el costo está metido en el tipo de cambio. Un operador que cobra comisión pero aplica una cotización más cercana a la referencia puede terminar entregando más guaraníes que uno sin comisión. Corré la cuenta completa con el mismo monto y el mismo día.',
    },
    {
      q: '¿Cuánto rinde un plazo fijo en Paraguay?',
      a: `El interés se calcula sobre el capital, la tasa nominal anual y los días del plazo, con base 365. La tasa concreta la fija cada entidad según monto y plazo. Lo que define si conviene no es la tasa sola sino la tasa contra la inflación: con la interanual del ${IPC.interanual.toLocaleString('es', { maximumFractionDigits: 2 })}%, cualquier tasa por debajo de eso implica perder poder de compra.`,
    },
    {
      q: '¿Los intereses del plazo fijo pagan impuesto?',
      a: `Las rentas del capital, entre ellas los intereses, tributan IRP a una tasa única del ${(IRP_CAPITAL * 100).toFixed(0)}%, separada de la escala progresiva de servicios personales. Si no estás incidido por el IRP, no corresponde el descuento. Es un impuesto sobre el interés ganado, no sobre el capital depositado.`,
    },
    {
      q: '¿Cuál es la inflación en Paraguay?',
      a: `Según el IPC del BCP, la variación interanual del último período publicado (${IPC.periodo}) fue del ${IPC.interanual.toLocaleString('es', { maximumFractionDigits: 2 })}%, con una acumulada del año del ${IPC.acumuladaAnio.toLocaleString('es', { maximumFractionDigits: 2 })}%. Paraguay tiene históricamente una de las inflaciones más bajas de la región, lo que hace que el guaraní sea bastante más estable que otras monedas vecinas.`,
    },
    {
      q: '¿Cómo actualizo un monto por inflación?',
      a: 'Multiplicás el monto original por uno más la inflación acumulada del período expresada en decimales. Si un precio era de un millón y la inflación acumulada fue del 10%, el equivalente de hoy es 1.100.000. La pérdida de poder de compra, en cambio, no es ese 10%: es algo menos, porque se mide sobre el valor actualizado.',
    },
    {
      q: '¿Por qué el peso argentino se cotiza en fracciones de guaraní?',
      a: 'Porque un peso vale hoy una fracción muy chica de guaraní, así que se suele publicar la cotización por cada mil pesos. Es la razón por la que en Encarnación y en la frontera los precios se muestran en ambas monedas: convertir de memoria lleva a errores de un orden de magnitud.',
    },
    {
      q: '¿Conviene cambiar en la frontera?',
      a: 'A veces sí, sobre todo para reales en Ciudad del Este y pesos en Encarnación, donde el volumen de operaciones es alto y los márgenes se aprietan. Pero la cotización varía por hora y por monto, y la referencia del BCP no te dice a qué precio vas a operar ahí. Preguntá en varias casas antes de cambiar montos importantes.',
    },
    {
      q: '¿Es mejor ahorrar en guaraníes o en dólares?',
      a: 'Depende de en qué moneda vas a gastar. Si tus gastos son en guaraníes y la inflación local es baja, un plazo fijo con tasa por encima del IPC conserva poder de compra sin riesgo cambiario. Si tenés compromisos en dólares, ahorrar en guaraníes te expone a que un salto del tipo de cambio te coma el ahorro. La regla práctica es calzar la moneda del ahorro con la de tus gastos futuros.',
    },
  ],

  sources: [
    {
      name: 'BCP — Cotización referencial de monedas',
      url: 'https://www.bcp.gov.py/webapps/web/cotizacion/monedas',
      publisher: 'Banco Central del Paraguay',
    },
    {
      name: 'BCP — Índices de precios (IPC)',
      url: 'https://www.bcp.gov.py/indices-de-precios',
      publisher: 'Banco Central del Paraguay',
    },
    {
      name: 'Ley N° 6380/19 — rentas del capital (IRP)',
      url: 'https://www.bacn.gov.py/leyes-paraguayas/8993/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional',
      publisher: 'Biblioteca y Archivo Central del Congreso Nacional',
    },
    {
      name: 'DNIT — Impuesto a la Renta Personal',
      url: 'https://www.dnit.gov.py/web/portal-institucional/irp',
      publisher: 'Dirección Nacional de Ingresos Tributarios',
    },
  ],

  replaces: [
    '/py/dolar-hoy-paraguay',
    '/py/calculadora-euro-a-guarani',
    '/py/cuanto-es-en-guaranies-peso-argentino',
    '/py/calculadora-remesas-espana-paraguay',
    '/py/calculadora-plazo-fijo-paraguay',
    '/py/calculadora-actualizacion-inflacion-ipc-paraguay',
  ],

  lastReviewed: '2026-08-16',
};
