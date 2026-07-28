import type { HubData } from '../types';
import { PERU_2026 } from '../../data/peru-2026';

/**
 * Hub de decisión PE — "¿Cuánto voy a pagar de verdad por este crédito, o cuánto gano si ahorro?"
 *
 * Absorbe: préstamo personal (TCEA), crédito hipotecario, Nuevo Crédito MIVIVIENDA con
 * Bono del Buen Pagador, crédito vehicular y depósito a plazo fijo (TREA).
 *
 * Matemática espejada de las fórmulas vivas prestamo-personal-tcea-peru.ts,
 * credito-hipotecario-peru.ts, credito-mivivienda-bono-buen-pagador-peru.ts,
 * credito-vehicular-peru.ts y deposito-plazo-fijo-peru.ts: todas usan la tasa
 * efectiva mensual equivalente ((1+tasa)^(1/12)−1) y el sistema francés, que es
 * lo correcto en un mercado que publica TEA/TCEA efectivas anuales.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa basada en los parámetros indicados. No constituye asesoramiento financiero ni de inversión; verificá las condiciones vigentes con tu entidad antes de decidir.';

export const UIT = PERU_2026.uit;

/**
 * Bono del Buen Pagador por tramo de valor de vivienda (S/), Fondo MIVIVIENDA.
 * Se toma la tabla con fuente publicada verificable (gob.pe / Ministerio de Vivienda,
 * "bonos de hasta S/ 27.400"). El campo del formulario permite pisar el monto con el
 * de la circular vigente, porque el Fondo lo actualiza por circular sin aviso previo.
 * https://www.gob.pe/institucion/vivienda/noticias/1272417
 */
export const BBP_TRAMOS = [
  { min: 68800, max: 98100, bono: 27400 },
  { min: 98100, max: 146900, bono: 22800 },
  { min: 146900, max: 244600, bono: 20900 },
  { min: 244600, max: 362100, bono: 7800 },
];

/** Programa Nuevo Crédito MIVIVIENDA: rango de valor de vivienda, inicial mínima y plazo máximo. */
export const MIVIVIENDA = {
  viviendaMin: 68800,
  viviendaMax: 488800,
  inicialMinPct: 7.5,
  plazoMaxAnios: 25,
};

/** Monto Máximo de Cobertura del Fondo de Seguro de Depósitos (trimestre jun–ago). */
export const FSD_COBERTURA = 122000;

/** Tasa máxima convencional de consumo en soles (BCRP, serie PD38590DD). */
export const TOPE_TCEA_CONSUMO = 114.13;

/** Costo anual típico de seguros y comisiones sobre el saldo hipotecario (hojas resumen SBS). */
export const SEGUROS_HIPOTECARIO_PCT = 1.3;

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/finanzas-personales/creditos-y-ahorro',
  title: 'Créditos y ahorro en Perú: cuánto pagas de verdad y cuánto ganas',
  description:
    'Calcula la cuota real y el costo total de un préstamo personal, un crédito hipotecario, el Nuevo Crédito MIVIVIENDA con Bono del Buen Pagador o un crédito vehicular, y del otro lado cuánto rinde un depósito a plazo fijo según su TREA.',
  silo: 'Finanzas personales',
  siloHref: '/pe/finanzas-personales',
  locale: 'pe',

  eyebrow: 'Perú · TCEA y TREA · sistema francés',
  h1: '¿Cuánto voy a pagar de verdad por este crédito, o cuánto gano si ahorro?',
  lede:
    'En el Perú la cuota no dice nada por sí sola: una cuota baja a plazo largo puede costar el doble. El número que manda es la TCEA, la tasa que la SBS obliga a publicar y que ya incluye intereses, seguros, portes y comisiones. Del lado del ahorro el equivalente es la TREA. Acá ves la cuota, el costo total y cuánto de lo que pagas no es capital.',
  stamps: [
    'TCEA / TREA · metodología SBS',
    `Tope legal de consumo en soles: ${TOPE_TCEA_CONSUMO}% anual (BCRP)`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Cuota mensual estimada',

  cases: {
    title: '¿Qué estás evaluando?',
    intro:
      'La matemática de fondo es la misma (sistema francés, tasa efectiva mensual), pero cada producto tiene su propio piso legal, su propio bono y su propia trampa. Elige tu caso.',
    items: [
      {
        id: 'personal',
        label: 'Un préstamo personal',
        hint: 'Consumo · comparar por TCEA',
        answer: 'La cuota sale de la TCEA, no de la "tasa" que te dicen por teléfono: la TCEA ya trae seguros y comisiones adentro.',
        yes: [
          'Cuota fija por el sistema francés, con la tasa efectiva mensual equivalente a la TCEA',
          'Costo total de todas las cuotas y cuánto de eso es interés y gastos',
          'Sobrecosto en porcentaje sobre lo que te prestaron',
          'Aviso si la TCEA supera la tasa máxima convencional de consumo en soles',
        ],
        warn: [
          DISCLAIMER_FIN,
          `El BCRP fija una tasa máxima convencional para créditos de consumo en soles (${TOPE_TCEA_CONSUMO}% anual en la vigencia citada): por encima de eso el cobro es ilegal`,
          'Comparar por cuota en vez de por TCEA es el error más caro: estirar el plazo baja la cuota y sube el total pagado',
        ],
        plazo: 'la entidad tiene que entregarte la hoja resumen con la TCEA antes de que firmes; es el documento donde comparar.',
      },
      {
        id: 'hipotecario',
        label: 'Un crédito hipotecario',
        hint: 'TEA + seguros = TCEA',
        answer: 'En el hipotecario la TEA es solo el interés: el desgravamen, el seguro del inmueble y los portes suman por encima.',
        yes: [
          'Monto a financiar = precio menos la cuota inicial',
          'Cuota mensual con la TEA pactada, por sistema francés',
          'TCEA estimada sumando el costo anual de seguros y comisiones que indiques',
          'Cuánto sube la cuota cuando el seguro entra al cálculo',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La TCEA que se muestra es una estimación: la TCEA exacta la calcula la entidad sobre el cronograma real con seguros mes a mes, y figura en la hoja resumen',
          'Los bancos suelen exigir que la cuota no supere el 30%–40% de tu ingreso neto: si la cuota calculada pasa ese umbral, el crédito probablemente no se aprueba',
        ],
        plazo: 'la tasa se pacta al desembolso; pedir la hoja resumen de dos o tres bancos antes de firmar es lo que más plata ahorra.',
      },
      {
        id: 'mivivienda',
        label: 'Nuevo Crédito MIVIVIENDA (con Bono del Buen Pagador)',
        hint: 'Inicial mínima 7,5% · bono no reembolsable',
        answer: 'El Bono del Buen Pagador es un subsidio del Estado que no se devuelve: baja el monto que financias, no la tasa.',
        yes: [
          'Bono del Buen Pagador según el tramo de valor de la vivienda',
          `Cuota inicial mínima del ${MIVIVIENDA.inicialMinPct}% del valor de la vivienda`,
          'Monto a financiar = valor menos cuota inicial menos bono',
          `Plazo de hasta ${MIVIVIENDA.plazoMaxAnios} años`,
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los tramos y montos del bono los actualiza el Fondo MIVIVIENDA por circular: el campo del bono es editable justamente para que pongas el monto vigente de tu carta de aprobación',
          'El bono exige pagar puntualmente: atrasarte en las cuotas puede costarte el beneficio',
          `Fuera del rango de valor del programa (aprox. ${sol(MIVIVIENDA.viviendaMin)} a ${sol(MIVIVIENDA.viviendaMax)}) no hay bono ni crédito MIVIVIENDA`,
        ],
        plazo: 'el bono se solicita a través de la entidad financiera al momento de la evaluación, no después del desembolso.',
      },
      {
        id: 'vehicular',
        label: 'Un crédito vehicular',
        hint: 'Cuota inicial + seguro todo riesgo obligatorio',
        answer: 'En el vehicular el seguro todo riesgo es obligatorio mientras dure el crédito y por eso la TCEA se despega tanto de la TEA.',
        yes: [
          'Monto a financiar = precio del vehículo menos cuota inicial',
          'Cuota fija por sistema francés con la TCEA informada por el banco',
          'Desembolso total del auto: cuota inicial más todas las cuotas',
          'Cuánto encarece el crédito al vehículo, en porcentaje',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El seguro vehicular contra todo riesgo es obligatorio durante el crédito y se renueva todos los años: entra en la TCEA pero también en tu presupuesto',
          'Un auto usado suele tener TCEA bastante más alta que uno nuevo, por el mayor riesgo de la garantía',
        ],
        plazo: 'la cuota inicial habitual va del 10% al 20%; con menos inicial la cuota y la tasa suben.',
      },
      {
        id: 'plazofijo',
        label: 'Un depósito a plazo fijo',
        hint: 'TREA · cobertura del FSD',
        answer: 'En el ahorro la tasa comparable es la TREA, que es el rendimiento neto anualizado después de los costos del producto.',
        yes: [
          'Monto final y el interés ganado con capitalización efectiva sobre base 360 días',
          'Rendimiento del período completo, no solo la tasa anual',
          `Cuánto de tu depósito queda cubierto por el Fondo de Seguro de Depósitos (${sol(FSD_COBERTURA)} por persona y por entidad)`,
          'Los intereses de depósitos de personas naturales no pagan impuesto a la renta',
        ],
        warn: [
          DISCLAIMER_FIN,
          `Si el monto final supera el tope del Fondo de Seguro de Depósitos, el excedente queda sin cobertura: conviene repartir el ahorro entre entidades`,
          'El monto máximo de cobertura del FSD se reajusta cada trimestre por el índice de precios al por mayor: verifica el vigente antes de depositar',
          'Retirar antes del vencimiento suele castigar la tasa: el rendimiento pactado supone que llegas al final del plazo',
        ],
        plazo: 'la TREA se pacta al abrir el depósito y queda fija hasta el vencimiento.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Un solo juego de campos para los cinco productos: el monto es el préstamo, el precio de la vivienda o del auto, o el capital que vas a depositar, según el caso que elijas arriba.',
  fields: [
    {
      id: 'monto',
      label: 'Monto (préstamo, precio del bien o capital a depositar)',
      type: 'number',
      prefix: 'S/',
      value: 120000,
      min: 0,
      step: 100,
      help: 'En préstamo personal es lo que te prestan; en hipotecario, MIVIVIENDA y vehicular es el precio del bien; en plazo fijo es el capital que depositas.',
    },
    {
      id: 'tasa',
      label: 'Tasa anual del producto (%)',
      type: 'number',
      value: 9.5,
      min: 0,
      max: 200,
      step: 0.01,
      suffix: '%',
      help: 'TCEA en préstamo personal y vehicular, TEA en hipotecario y MIVIVIENDA, TREA en el plazo fijo. Está siempre en la hoja resumen.',
    },
    {
      id: 'plazoMeses',
      label: 'Plazo en meses',
      type: 'number',
      value: 240,
      min: 1,
      max: 360,
      step: 1,
      help: 'En el plazo fijo se convierte a días con la base comercial de 30 días por mes que usa el sistema financiero peruano.',
    },
    {
      id: 'inicialPct',
      label: 'Cuota inicial (% del precio)',
      type: 'number',
      value: 20,
      min: 0,
      max: 90,
      step: 0.5,
      suffix: '%',
      help: `Solo se usa en hipotecario, MIVIVIENDA y vehicular. En MIVIVIENDA el mínimo es ${MIVIVIENDA.inicialMinPct}%: si pones menos, se aplica el mínimo. Un 0% legítimo se respeta en los otros dos casos.`,
    },
    {
      id: 'segurosPct',
      label: 'Costo anual de seguros y comisiones (%)',
      type: 'number',
      value: SEGUROS_HIPOTECARIO_PCT,
      min: 0,
      max: 10,
      step: 0.1,
      suffix: '%',
      help: 'Desgravamen, seguro del inmueble o del vehículo y portes, como porcentaje anual del saldo. Es lo que separa la TEA de la TCEA. El rango típico del mercado es 1% a 2%.',
    },
    {
      id: 'bonoManual',
      label: 'Bono del Buen Pagador vigente (S/)',
      type: 'number',
      prefix: 'S/',
      value: 0,
      min: 0,
      step: 100,
      help: 'Déjalo en 0 para usar el bono por tramo de valor de vivienda. Si ya tienes la carta de aprobación, pon el monto exacto: el Fondo MIVIVIENDA lo actualiza por circular.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'Cuánto de lo que pagas es capital',
    caption:
      'En los créditos compara el capital que realmente recibes contra los intereses, seguros y comisiones que devuelves encima. En el plazo fijo, tu capital contra el interés que ganas.',
  },
  breakdownTitle: 'El crédito, línea por línea',
  breakdownIntro:
    'Cuota, costo total y sobrecosto. Si el producto lo permite, también la cuota inicial, el bono y la TCEA estimada con seguros.',

  faq: [
    {
      q: '¿Qué es la TCEA y por qué es la única tasa que sirve para comparar?',
      a: 'La TCEA (Tasa de Costo Efectivo Anual) es el costo total del crédito expresado en una sola tasa anual: incluye el interés, los seguros obligatorios, las comisiones y los portes. La SBS obliga a que figure en la hoja resumen de todo crédito. Comparar por "tasa de interés" o por cuota mensual es lo que hace que dos créditos parezcan iguales cuando uno cuesta bastante más. Si comparas dos ofertas y solo miras una cosa, mira la TCEA.',
    },
    {
      q: '¿Y la TREA?',
      a: 'La TREA (Tasa de Rendimiento Efectivo Anual) es el espejo de la TCEA del lado del ahorro: el rendimiento neto anualizado de un depósito, ya descontados los costos del producto. Es obligatoria en depósitos de ahorro, a plazo y CTS, y es el número con el que se comparan entidades de forma justa. Una entidad puede publicitar una "tasa" alta y tener una TREA menor.',
    },
    {
      q: '¿Por qué la cuota no se calcula con la tasa anual dividida entre 12?',
      a: 'Porque en el Perú las tasas se publican como efectivas anuales, no nominales. Dividir la tasa anual entre 12 da una cuota equivocada, siempre más alta de lo que corresponde. La conversión correcta es la tasa efectiva mensual equivalente: elevar (1 + tasa anual) a la potencia de un doceavo y restar uno. Es lo que hace esta calculadora y es lo que hacen los cronogramas de los bancos.',
    },
    {
      q: '¿Cuánto es el Bono del Buen Pagador y quién lo recibe?',
      a: `Es un subsidio no reembolsable del Fondo MIVIVIENDA que se aplica como parte de la cuota inicial y baja el monto a financiar. El monto depende del tramo de valor de la vivienda y va disminuyendo a medida que la vivienda es más cara: el tramo más bajo recibe hasta ${sol(27400)} y el más alto del rango bastante menos. Como el Fondo actualiza los montos por circular, este hub trae un campo editable para que pongas el bono exacto de tu carta de aprobación.`,
    },
    {
      q: '¿Cuál es la cuota inicial mínima del Nuevo Crédito MIVIVIENDA?',
      a: `El ${MIVIVIENDA.inicialMinPct}% del valor de la vivienda, y el plazo llega hasta ${MIVIVIENDA.plazoMaxAnios} años. El programa cubre viviendas dentro de un rango de valor definido por el Fondo: por debajo o por encima de ese rango no hay crédito MIVIVIENDA ni bono, y la compra se financia con un hipotecario tradicional.`,
    },
    {
      q: '¿Existe un tope legal a la tasa que me pueden cobrar?',
      a: `Sí, para créditos de consumo y de pequeña y microempresa. El Banco Central de Reserva publica cada semestre las tasas máximas convencionales; en la vigencia citada el tope en soles para consumo es de ${TOPE_TCEA_CONSUMO}% anual. Cobrar por encima de ese tope está prohibido y la entidad puede ser sancionada. Si te ofrecen un crédito con una TCEA que supera ese número, revisa las condiciones antes de firmar.`,
    },
    {
      q: '¿Conviene alargar el plazo para que la cuota me entre en el presupuesto?',
      a: 'Baja la cuota, sube el total. Cada mes extra es un mes más de intereses sobre un saldo que baja más lento, así que el mismo crédito termina costando bastante más. La regla práctica: elige el plazo más corto cuya cuota puedas pagar con holgura, y si la entidad lo permite sin penalidad, haz amortizaciones de capital cuando tengas un extra. Amortizar capital reduce intereses futuros; adelantar cuotas, no siempre.',
    },
    {
      q: '¿Cuánto de mi ingreso puede irse en la cuota?',
      a: 'Como referencia de mercado, los bancos suelen exigir que la cuota del crédito no supere entre el 30% y el 40% de tu ingreso neto mensual, y consideran también las deudas que ya tienes en el sistema. Si la cuota estimada de este hub se pasa de ese umbral, es probable que la evaluación crediticia no apruebe el monto: conviene subir la cuota inicial o bajar el monto financiado antes de presentar la solicitud.',
    },
    {
      q: '¿Mi plazo fijo está asegurado si el banco quiebra?',
      a: `Hasta el Monto Máximo de Cobertura del Fondo de Seguro de Depósitos, que es por persona y por entidad y se reajusta cada trimestre según el índice de precios al por mayor. Al momento de esta revisión ronda los ${sol(FSD_COBERTURA)}. Si tu depósito más los intereses superan ese tope, el excedente queda sin cobertura, y la solución práctica es repartir el ahorro entre dos o más entidades.`,
    },
    {
      q: '¿Los intereses de mi plazo fijo pagan impuestos?',
      a: 'Los intereses de depósitos de personas naturales en el sistema financiero peruano están exonerados del impuesto a la renta, y tampoco pagan IGV. El rendimiento que ves es el que recibes. Distinto es el caso de personas jurídicas y de otros instrumentos de inversión, que sí tienen tratamiento tributario propio.',
    },
    {
      q: '¿Por qué la TCEA del hipotecario que calculo no coincide exacto con la del banco?',
      a: 'Porque la TCEA exacta se calcula sobre el cronograma real, con el costo del seguro de desgravamen y del seguro del inmueble aplicados mes a mes sobre el saldo y la suma asegurada, que cambian a lo largo del crédito. Acá se estima sumando a la tasa el costo anual de seguros y comisiones que indiques, que es una buena aproximación para comparar ofertas, pero el número contractual es siempre el de la hoja resumen.',
    },
    {
      q: '¿Puedo pagar el crédito antes y ahorrarme intereses?',
      a: 'Sí. La normativa peruana reconoce el derecho al pago anticipado, y hay que pedir expresamente que se aplique a reducción de capital (no a adelantar cuotas). Reduciendo capital bajas los intereses futuros, y puedes elegir entre acortar el plazo o bajar la cuota. Las entidades no pueden cobrar penalidades desproporcionadas por prepago; revisa el contrato antes.',
    },
  ],

  sources: [
    { name: 'SBS — Tasas de interés y hoja resumen (TCEA y TREA)', url: 'https://www.sbs.gob.pe/app/pp/EstadisticasSAEEPortal/Paginas/TIActivaTipoCreditoEmpresa.aspx', publisher: 'Superintendencia de Banca, Seguros y AFP' },
    { name: 'BCRP — Tasas máximas convencionales (serie PD38590DD)', url: 'https://estadisticas.bcrp.gob.pe/estadisticas/series/diarias/resultados/PD38590DD/html', publisher: 'Banco Central de Reserva del Perú' },
    { name: 'Fondo MIVIVIENDA — Nuevo Crédito MIVIVIENDA y Bono del Buen Pagador', url: 'https://www.gob.pe/institucion/vivienda/noticias/1272417-credito-mivivienda-otorga-bonos-de-hasta-s-27-400-para-adquirir-un-inmueble-propio', publisher: 'Ministerio de Vivienda, Construcción y Saneamiento' },
    { name: 'Fondo de Seguro de Depósitos — Cobertura vigente', url: 'https://fsd.org.pe/cobertura/', publisher: 'Fondo de Seguro de Depósitos' },
    { name: 'SBS — Portal del usuario: pago anticipado y derechos del cliente financiero', url: 'https://www.sbs.gob.pe/usuarios', publisher: 'Superintendencia de Banca, Seguros y AFP' },
  ],

  replaces: [
    '/pe/calculadora-prestamo-personal-tcea-peru',
    '/pe/calculadora-credito-hipotecario-peru',
    '/pe/calculadora-credito-mivivienda-bono-buen-pagador-peru',
    '/pe/calculadora-credito-vehicular-peru',
    '/pe/calculadora-deposito-plazo-fijo-peru',
  ],

  lastReviewed: '2026-07-28',
};
