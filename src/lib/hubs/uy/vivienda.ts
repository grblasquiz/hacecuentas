import type { HubData } from '../types';
import { IP_PATRIMONIO_UY, IRPF_INMUEBLE_UY, COMPRAVENTA_UY } from '../../data/uruguay-2026';

/**
 * Hub de decisión UY — "Comprar, tener, alquilar o vender un inmueble: qué impuestos pagás".
 *
 * Reúne gastos de compraventa (ITP + escribano), contribución inmobiliaria,
 * impuesto de primaria, impuesto al patrimonio, IRPF de alquileres e IRPF por
 * venta de inmueble.
 *
 * ⚠️ Constantes que NO están en el data file del país y vienen de las fórmulas
 * viejas: los cortes intermedios de la escala de contribución inmobiliaria de
 * Montevideo, el mínimo no imponible y la escala del impuesto de primaria, y las
 * tasas del IRPF de arrendamientos. Quedan editables y hay que contrastarlas con
 * la Intendencia y la DGI.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const COMPRAVENTA = COMPRAVENTA_UY;
export const IRPF_VENTA = IRPF_INMUEBLE_UY;
export const PATRIMONIO = IP_PATRIMONIO_UY;

/**
 * Contribución inmobiliaria — escala de Montevideo. ⚠️ El primer corte y las
 * tasas de los extremos son oficiales; los cortes intermedios son de referencia.
 */
export const CONTRIBUCION = {
  umbralReducida: 2481577,
  tasaReducida: 0.0018,
  cuotas: 3,
  franjas: [
    { hasta: 2481577, tasa: 0.0025 },
    { hasta: 5000000, tasa: 0.005 },
    { hasta: 10000000, tasa: 0.009 },
    { hasta: 15000000, tasa: 0.012 },
    { hasta: 25000000, tasa: 0.015 },
    { hasta: null as number | null, tasa: 0.018 },
  ],
};

/** Impuesto de primaria (DGI). ⚠️ Mínimo no imponible oficial; cortes intermedios de referencia. */
export const PRIMARIA = {
  minimoNoImponible: 282612,
  franjas: [
    { hasta: 282612, tasa: 0 },
    { hasta: 2500000, tasa: 0.0015 },
    { hasta: 5000000, tasa: 0.002 },
    { hasta: 10000000, tasa: 0.0025 },
    { hasta: null as number | null, tasa: 0.003 },
  ],
};

/** IRPF de arrendamientos (Cat. I). Anticipo mensual y liquidación anual. */
export const ALQUILER = { tasaAnticipo: 0.105, tasaAnual: 0.12 };

const uyu = (n: number) => '$U ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'uy/impuestos/vivienda',
  title: 'Impuestos de la vivienda en Uruguay: comprar, tener, alquilar y vender',
  description:
    'Todos los impuestos de un inmueble en Uruguay: ITP y honorarios de escribano al comprar, contribución inmobiliaria e impuesto de primaria mientras lo tenés, impuesto al patrimonio, IRPF sobre el alquiler e IRPF por incremento patrimonial al vender.',
  silo: 'Impuestos',
  siloHref: '/uy/impuestos',
  locale: 'uy',

  eyebrow: 'Uruguay · DGI · Intendencias',
  h1: 'Tu casa, del escribano a la venta: ¿cuánto pagás de impuestos en cada etapa?',
  lede:
    'Un inmueble en Uruguay paga tributos en cuatro momentos distintos y ante tres organismos: la DGI, la Intendencia y, si lo alquilás, otra vez la DGI. La escritura se lleva entre un 5% y un 7% del precio, la tenencia paga todos los años, el alquiler tiene anticipo mensual y liquidación anual, y la venta tiene dos criterios para elegir. Acá están las cuatro etapas en una sola cuenta.',
  stamps: [
    `ITP ${(COMPRAVENTA.itpPorParte * 100).toLocaleString('de-DE')}% por parte`,
    `IRPF por venta ${(IRPF_VENTA.tasa * 100).toLocaleString('de-DE')}%`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Impuesto de esta etapa',

  cases: {
    title: '¿En qué etapa estás?',
    intro:
      'Elegí el momento: cada uno usa distintos campos del formulario y responde con su propia cuenta.',
    items: [
      {
        id: 'comprar',
        label: 'Estoy comprando',
        hint: 'ITP + honorarios del escribano',
        answer: `Entre el ITP y el escribano, el comprador pone alrededor de un 6% del precio por encima del precio.`,
        yes: [
          `ITP: ${(COMPRAVENTA.itpPorParte * 100).toLocaleString('de-DE')}% por cada parte, calculado sobre el valor catastral, no sobre el precio de mercado`,
          `Honorarios del escribano: arancel de referencia del ${(COMPRAVENTA.escribanoHonorario * 100).toLocaleString('de-DE')}%, más el aporte a la Caja Notarial del ${(COMPRAVENTA.cajaNotarialSobreHonorario * 100).toLocaleString('de-DE')}% del honorario y el IVA sobre el honorario`,
          'El escribano lo paga el comprador y lo elige el comprador: el honorario es negociable',
        ],
        warn: [
          DISCLAIMER_TAX,
          'No incluye la comisión inmobiliaria, que suele rondar el 3% más IVA y se pacta aparte',
          'El valor catastral casi siempre es menor que el precio de mercado: por eso el ITP pesa menos de lo que parece, pero el honorario se calcula sobre el mayor de los dos',
          'Si comprás con crédito hipotecario hay gastos adicionales de la hipoteca y del banco',
        ],
        plazo: 'el ITP lo retiene y vuelca el escribano en el momento de la escritura.',
      },
      {
        id: 'tener',
        label: 'Ya soy propietario',
        hint: 'Contribución inmobiliaria + primaria + patrimonio',
        answer: 'La tenencia paga todos los años: contribución a la Intendencia, primaria a la DGI y, si tu patrimonio es alto, impuesto al patrimonio.',
        yes: [
          'Contribución inmobiliaria: tributo departamental sobre el valor de catastro, con escala progresiva y cuotas durante el año',
          `Impuesto de primaria: tributo nacional de la DGI, con mínimo no imponible por padrón (${uyu(PRIMARIA.minimoNoImponible)}); por debajo de eso el padrón está exento`,
          `Impuesto al patrimonio: sólo si tu patrimonio neto supera el mínimo no imponible de ${uyu(PATRIMONIO.mniPersonaFisica)} por persona`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'La escala de contribución inmobiliaria la fija cada Intendencia: la que usa esta cuenta es la de Montevideo, y los cortes intermedios son de referencia',
          'El impuesto al patrimonio de esta cuenta no computa el ajuar de la casa-habitación ni la deducción del 50% del valor de tu vivienda: la liquidación real puede dar distinto',
          'Los no residentes que no tributan IRNR mantienen una escala progresiva del impuesto al patrimonio mucho más alta que la tasa de residente',
        ],
        plazo: 'la contribución inmobiliaria de Montevideo se paga en tres cuotas; pagar contado suele tener descuento.',
      },
      {
        id: 'alquilar',
        label: 'Lo tengo alquilado',
        hint: `Anticipo ${(ALQUILER.tasaAnticipo * 100).toLocaleString('de-DE')}% · anual ${(ALQUILER.tasaAnual * 100).toLocaleString('de-DE')}%`,
        answer: `El arrendamiento tiene un anticipo mensual del ${(ALQUILER.tasaAnticipo * 100).toLocaleString('de-DE')}% y una liquidación anual al ${(ALQUILER.tasaAnual * 100).toLocaleString('de-DE')}% sobre la renta neta.`,
        yes: [
          `Anticipo mensual del ${(ALQUILER.tasaAnticipo * 100).toLocaleString('de-DE')}% sobre el alquiler bruto`,
          `Liquidación anual al ${(ALQUILER.tasaAnual * 100).toLocaleString('de-DE')}% sobre la renta neta, descontando los gastos admitidos`,
          'Los anticipos se acreditan contra el impuesto anual: si sobran, queda crédito a favor',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La contribución inmobiliaria y el impuesto de primaria del inmueble arrendado suelen ser gastos admitidos: no los dejes fuera de la liquidación',
          'Si el inquilino es agente de retención, el anticipo lo retiene él; si no, lo tenés que anticipar vos',
          'Alquilar sin declarar deja al inquilino sin poder deducir el alquiler de su propio IRPF, lo que suele terminar en conflicto',
        ],
        plazo: 'los anticipos se vuelcan mensualmente y la liquidación anual se presenta ante la DGI.',
      },
      {
        id: 'vender',
        label: 'Estoy vendiendo',
        hint: `IRPF por incremento patrimonial · ${(IRPF_VENTA.tasa * 100).toLocaleString('de-DE')}%`,
        answer: `El vendedor paga su ITP más el ${(IRPF_VENTA.tasa * 100).toLocaleString('de-DE')}% de IRPF sobre la renta de la operación.`,
        yes: [
          `Criterio ficto, sólo para inmuebles adquiridos antes de la fecha de corte: la renta se estima en el ${(IRPF_VENTA.fictoPorcentaje * 100).toLocaleString('de-DE')}% del precio, lo que da un impuesto efectivo del ${(IRPF_VENTA.tasa * IRPF_VENTA.fictoPorcentaje * 100).toLocaleString('de-DE')}% del precio`,
          'Criterio real, obligatorio para los adquiridos después: renta igual a precio menos costo actualizado, menos mejoras y menos el ITP que pagaste al comprar',
          'Para los adquiridos antes de la fecha de corte se puede optar por el criterio que pague menos',
          `El vendedor también paga su ${(COMPRAVENTA.itpPorParte * 100).toLocaleString('de-DE')}% de ITP`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'Existe una exoneración por venta de la vivienda permanente cuando el importe se reinvierte en otra vivienda, sujeta a condiciones de la DGI: no está calculada acá',
          'El escribano actúa como agente de retención y liquida el impuesto en la escritura: no es un pago que puedas postergar',
          'La comisión inmobiliaria del vendedor tampoco está incluida en esta cuenta',
        ],
        plazo: 'el impuesto se retiene en el acto de la escritura, no después.',
      },
    ],
  },

  inputsTitle: 'Los datos del inmueble',
  inputsIntro:
    'En pesos uruguayos. El valor catastral suele ser bastante menor al precio de mercado y es la base de varios de estos tributos.',
  fields: [
    {
      id: 'precio',
      label: 'Precio de la operación ($U)',
      prefix: '$U',
      value: '6.000.000',
      thousands: true,
      help: 'El precio acordado de compra o de venta.',
    },
    {
      id: 'catastral',
      label: 'Valor real de catastro ($U)',
      prefix: '$U',
      value: '3.500.000',
      thousands: true,
      help: 'Base del ITP, de la contribución inmobiliaria y del impuesto de primaria. Figura en la cédula catastral.',
    },
    {
      id: 'alquiler',
      label: 'Alquiler mensual ($U)',
      prefix: '$U',
      value: '30.000',
      thousands: true,
      help: 'El bruto que cobrás por mes, antes del anticipo.',
    },
    {
      id: 'gastosAdmitidos',
      label: 'Gastos anuales admitidos del alquiler ($U)',
      prefix: '$U',
      value: '40.000',
      thousands: true,
      help: 'Contribución inmobiliaria, primaria, comisiones y otros gastos deducibles del arrendamiento.',
    },
    {
      id: 'costo',
      label: 'Costo de adquisición actualizado + mejoras ($U)',
      prefix: '$U',
      value: '3.000.000',
      thousands: true,
      help: 'Sólo para la venta con criterio real. Incluye las mejoras documentadas.',
    },
    {
      id: 'adquisicion',
      label: '¿Cuándo lo compraste?',
      type: 'select',
      value: 'despues-2007',
      options: [
        { value: 'despues-2007', label: 'Después del 1/7/2007' },
        { value: 'antes-2007', label: 'Antes del 1/7/2007' },
      ],
      help: 'Antes de esa fecha podés optar por el criterio ficto; después, el criterio real es obligatorio.',
    },
    {
      id: 'patrimonio',
      label: 'Patrimonio neto total al 31/12 ($U)',
      prefix: '$U',
      value: '8.000.000',
      thousands: true,
      help: 'Activos gravados menos deudas computables, incluyendo este inmueble a valor catastral.',
    },
    {
      id: 'declaracion',
      label: 'Impuesto al patrimonio: forma de declaración',
      type: 'select',
      value: 'persona',
      options: [
        { value: 'persona', label: 'Persona física' },
        { value: 'nucleo', label: 'Núcleo familiar' },
      ],
      help: `El mínimo no imponible del núcleo familiar duplica el individual (${uyu(PATRIMONIO.mniNucleoFamiliar)}).`,
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte el costo tributario',
    caption:
      'En la compra muestra el peso relativo del ITP y de cada componente del costo notarial. En la tenencia compara los tributos anuales entre sí. En el alquiler y la venta enfrenta lo que te queda contra lo que se lleva el impuesto.',
  },
  breakdownTitle: 'El detalle de cada tributo',
  breakdownIntro:
    'Cada línea aclara sobre qué base se calcula, qué organismo lo cobra y con qué frecuencia se paga.',

  faq: [
    {
      q: '¿Cuánto cuesta escriturar una casa en Uruguay?',
      a: `Para el comprador, entre el ${(COMPRAVENTA.itpPorParte * 100).toLocaleString('de-DE')}% de ITP sobre el valor catastral y el costo notarial —honorario del ${(COMPRAVENTA.escribanoHonorario * 100).toLocaleString('de-DE')}% más aporte a la Caja Notarial e IVA, que en conjunto rondan el 4,2% del precio— el total suele quedar entre el 5% y el 7% del precio. El vendedor paga su propio ITP, y por afuera de todo esto queda la comisión inmobiliaria.`,
    },
    {
      q: '¿El ITP se calcula sobre el precio o sobre el valor catastral?',
      a: `Sobre el valor real de catastro del padrón, que suele estar bastante por debajo del precio de mercado. Cada parte paga su ${(COMPRAVENTA.itpPorParte * 100).toLocaleString('de-DE')}%: comprador y vendedor. El honorario del escribano, en cambio, se calcula sobre el mayor entre el precio y el valor catastral, así que ahí no hay ventaja.`,
    },
    {
      q: '¿Qué es la contribución inmobiliaria y quién la cobra?',
      a: 'Es un tributo departamental: lo cobra la Intendencia, no la DGI. Se calcula sobre el valor de catastro con una escala progresiva, de modo que cada tasa se aplica sólo a la porción del valor que cae en su tramo. En Montevideo se paga en cuotas a lo largo del año y hay tasa reducida para los padrones de menor valor, que son la mayoría. Cada departamento tiene su propia escala.',
    },
    {
      q: '¿Qué es el impuesto de primaria y cuándo estoy exento?',
      a: `Es un tributo nacional que administra la DGI y financia la educación primaria. Se calcula sobre el valor imponible de catastro de cada padrón y tiene un mínimo no imponible de ${uyu(PRIMARIA.minimoNoImponible)}: los padrones por debajo de ese valor están exentos. La evaluación es por padrón, no por propietario, así que quien tiene varios inmuebles chicos puede estar exento en todos.`,
    },
    {
      q: '¿Desde qué patrimonio se paga impuesto al patrimonio?',
      a: `El mínimo no imponible es de ${uyu(PATRIMONIO.mniPersonaFisica)} por persona física, o ${uyu(PATRIMONIO.mniNucleoFamiliar)} si se liquida por núcleo familiar. Por encima de eso, el residente paga una tasa única del ${(PATRIMONIO.tasaResidente * 100).toLocaleString('de-DE')}% sobre el excedente. Ojo con dos cosas que esta cuenta no calcula: el ajuar de la casa-habitación, que suma, y la deducción del 50% del valor de tu vivienda, que resta.`,
    },
    {
      q: '¿Cuánto IRPF pago por alquilar mi casa?',
      a: `Hay dos momentos. Durante el año se anticipa el ${(ALQUILER.tasaAnticipo * 100).toLocaleString('de-DE')}% del alquiler bruto mes a mes. Al cierre se liquida el ${(ALQUILER.tasaAnual * 100).toLocaleString('de-DE')}% sobre la renta neta, es decir el alquiler anual menos los gastos admitidos. Los anticipos se acreditan contra ese impuesto anual, y como la tasa del anticipo es menor que la anual pero se aplica sobre el bruto, según tus gastos podés terminar con crédito o con saldo a pagar.`,
    },
    {
      q: '¿Qué gastos puedo descontar del alquiler?',
      a: 'Los vinculados al inmueble arrendado y documentados: la contribución inmobiliaria, el impuesto de primaria, las comisiones de administración y, según el caso, gastos comunes y reparaciones. Es el rubro que más gente se olvida de cargar, y es justamente el que puede convertir un saldo a pagar en un crédito a favor.',
    },
    {
      q: '¿Cuánto pago de impuestos al vender un inmueble?',
      a: `Tu ${(COMPRAVENTA.itpPorParte * 100).toLocaleString('de-DE')}% de ITP más el IRPF por incremento patrimonial, que es del ${(IRPF_VENTA.tasa * 100).toLocaleString('de-DE')}% sobre la renta de la operación. Cómo se calcula esa renta depende de cuándo compraste: si fue antes de la fecha de corte podés usar el criterio ficto, que estima la renta en el ${(IRPF_VENTA.fictoPorcentaje * 100).toLocaleString('de-DE')}% del precio y deja un impuesto efectivo del ${(IRPF_VENTA.tasa * IRPF_VENTA.fictoPorcentaje * 100).toLocaleString('de-DE')}% del precio; si fue después, va el criterio real obligatorio.`,
    },
    {
      q: '¿Cuándo me conviene el criterio ficto y cuándo el real?',
      a: 'Sólo podés elegir si compraste antes de la fecha de corte. El ficto conviene cuando la ganancia real fue grande, porque te fija la renta en un porcentaje bajo del precio sin importar cuánto ganaste. El real conviene cuando compraste caro y vendés poco más arriba, o incluso a pérdida, porque ahí la renta gravada es chica o cero. La cuenta corre las dos y aplica la que menos paga.',
    },
    {
      q: 'Vendo mi casa para comprar otra: ¿pago igual?',
      a: 'Puede que no. Existe una exoneración del IRPF por venta de la vivienda permanente cuando el importe se reinvierte en otra vivienda, sujeta a condiciones que fija la DGI en cuanto a plazos, montos y carácter de vivienda permanente. No es automática: hay que encuadrar bien la operación y documentarla, y conviene consultarlo con el escribano antes de escriturar, no después.',
    },
    {
      q: '¿Quién retiene y paga estos impuestos?',
      a: 'En la compraventa, el escribano: retiene el ITP de ambas partes y el IRPF del vendedor, y los vuelca a la DGI. En el alquiler, el anticipo lo retiene el inquilino si es agente de retención, y si no lo anticipa el propietario. La contribución inmobiliaria y el impuesto de primaria los paga el propietario directamente, cada uno ante su organismo.',
    },
  ],

  sources: [
    {
      name: 'DGI — Impuesto a las Transmisiones Patrimoniales (ITP)',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
    {
      name: 'DGI — Impuesto de Enseñanza Primaria',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
    {
      name: 'DGI — Impuesto al Patrimonio de personas físicas',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
    {
      name: 'Intendencia de Montevideo — Contribución inmobiliaria',
      url: 'https://montevideo.gub.uy/',
      publisher: 'Intendencia de Montevideo',
    },
    {
      name: 'DGI — IRPF Categoría I: arrendamientos e incremento patrimonial',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
    {
      name: 'Asociación de Escribanos del Uruguay — arancel de referencia',
      url: 'https://www.aeu.org.uy/',
      publisher: 'AEU',
    },
  ],

  replaces: [
    '/uy/calculadora-gastos-compraventa-inmueble-uruguay',
    '/uy/calculadora-contribucion-inmobiliaria-uruguay',
    '/uy/calculadora-impuesto-primaria-uruguay',
    '/uy/calculadora-impuesto-patrimonio-uruguay',
    '/uy/calculadora-irpf-alquiler-uruguay',
    '/uy/calculadora-irpf-venta-inmueble-uruguay',
  ],

  lastReviewed: '2026-07-28',
};
