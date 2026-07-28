import type { HubData } from '../types';
import { ECUADOR_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "¿Cuánto voy a pagar de verdad por este crédito, o cuánto gano si ahorro?"
 *
 * Ecuador está DOLARIZADO: todo va en USD, sin conversión ni indexación.
 *
 * Cálculo espejado de las fórmulas vivas:
 *   credito-hipotecario-biess-ecuador.ts · prestamo-quirografario-iess-ecuador.ts ·
 *   tabla-amortizacion-frances-aleman-ecuador.ts · credito-vehicular-ecuador.ts ·
 *   tarjeta-credito-pago-minimo-ecuador.ts · deposito-plazo-fijo-ecuador.ts
 *
 * OJO con la convención de tasa, que NO es la misma en todas las ramas y por eso da cuotas
 * distintas con el mismo número escrito:
 *  - BIESS hipotecario y quirografario del IESS publican una tasa NOMINAL anual → la tasa
 *    mensual es tasa/12 (así lo hace el simulador oficial del BIESS).
 *  - Banca privada, vehicular y tarjeta publican la tasa EFECTIVA anual (TEA) → la tasa
 *    mensual es (1+TEA)^(1/12) − 1. Dividir una TEA por 12 subestima la cuota.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const SBU = ECUADOR_2026.sbu;

/** Tasa del Plan Credicasa / Vivienda Premier del BIESS para primera vivienda (% NOMINAL anual). */
export const TASA_BIESS = 2.99;
/** Plazo máximo del hipotecario BIESS (años), ampliado a 30 en 2026. */
export const PLAZO_MAX_BIESS_ANIOS = 30;
/** Ingreso familiar máximo para calificar a Credicasa (USD/mes, 3,17 SBU). */
export const INGRESO_MAX_CREDICASA = 1527.94;
/** Tope del préstamo quirografario del IESS: 80 SBU. */
export const TOPE_QUIROGRAFARIO = 80 * ECUADOR_2026.sbu;
/** Tasa efectiva máxima del segmento consumo que fija el BCE (% TEA). Techo legal de tarjetas. */
export const TEA_MAX_CONSUMO_BCE = 16.77;
/** TEA referencial del crédito vehicular en banca privada (Guayaquil/Pichincha). */
export const TEA_VEHICULAR_REF = 15.6;
/** TEA referencial de un crédito de consumo en banca privada. */
export const TEA_CONSUMO_REF = 16.5;
/** Tasa pasiva referencial del BCE para pólizas de 181 a 360 días (% TEA). */
export const TEA_PLAZO_FIJO_REF = 5.36;
/** Cobertura máxima del seguro de depósitos COSEDE, por depositante y por entidad. */
export const COSEDE_COBERTURA = 32000;
/** Plazo mínimo (días) para que el rendimiento quede exonerado del IR (LRTI art. 9 num. 15.1). */
export const PLAZO_EXONERACION_DIAS = 180;
/** Retención en la fuente sobre rendimientos financieros a menos de 180 días (%). */
export const RETENCION_RENDIMIENTOS = 3;

/** Tasa NOMINAL anual del quirografario del IESS por plazo (decimal). Tarifario BIESS. */
export const TASAS_QUIROGRAFARIO = [
  { hastaMeses: 6, tasa: 0.065 },
  { hastaMeses: 9, tasa: 0.075 },
  { hastaMeses: 12, tasa: 0.085 },
  { hastaMeses: 48, tasa: 0.11 },
  { hastaMeses: 60, tasa: 0.1299 },
];

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/finanzas-personales/creditos-y-ahorro',
  title: 'Créditos y ahorro en Ecuador: cuánto pagas de verdad y cuánto ganas',
  description:
    'Calcula la cuota real de un crédito hipotecario del BIESS, un quirografario del IESS, un consumo en banca privada, un vehicular o la deuda de tu tarjeta, y compáralo con lo que rinde una póliza a plazo fijo. Sistema francés y alemán, tasa nominal contra tasa efectiva y el costo total del crédito.',
  silo: 'Finanzas personales',
  siloHref: '/ec/finanzas-personales',
  locale: 'ec',

  eyebrow: 'Ecuador · dolarizado · BIESS, IESS, banca privada y BCE',
  h1: '¿Cuánto te cuesta de verdad ese crédito, y cuánto ganas si en vez de pedirlo ahorras?',
  lede:
    'La cuota que te dicen en la ventanilla no es el costo del crédito: el costo es todo lo que devuelves de más. Aquí ves la cuota, los intereses totales y cuánto encarece el crédito lo que estás comprando, con la convención de tasa que usa cada entidad. Y del otro lado, lo que rinde el mismo dinero en una póliza a plazo fijo.',
  stamps: [
    `SBU ${usd(SBU)} · tope quirografario 80 SBU (${usd(TOPE_QUIROGRAFARIO)})`,
    `BIESS 2,99% nominal · techo BCE consumo ${TEA_MAX_CONSUMO_BCE}% efectivo`,
    '7 calculadoras adentro',
  ],

  resultLabel: 'Cuota mensual estimada',

  cases: {
    title: '¿Qué estás mirando?',
    intro:
      'La fórmula de la cuota es la misma, pero la tasa que publica cada entidad no significa lo mismo. El BIESS y el IESS publican tasa nominal; la banca privada publica tasa efectiva anual. Esa diferencia cambia la cuota aunque el número escrito sea idéntico.',
    items: [
      {
        id: 'biess',
        label: 'Hipotecario del BIESS',
        hint: 'Credicasa / Vivienda Premier · 2,99% nominal',
        answer: 'Con la tasa Credicasa del 2,99% para primera vivienda, un crédito del BIESS a 30 años tiene la cuota más baja del mercado ecuatoriano.',
        yes: [
          'Tasa del 2,99% anual nominal para primera vivienda (Plan Credicasa / Vivienda Premier)',
          'Plazo de hasta 30 años, ampliado desde los 25 años iniciales',
          'Sistema francés: cuota fija durante todo el crédito',
          'La tasa mensual se calcula como tasa anual ÷ 12, que es la convención del simulador oficial del BIESS',
          'Financiamiento de hasta el 100% del avalúo cuando el avalúo no supera los USD 50.000',
        ],
        warn: [
          DISCLAIMER_FIN,
          `El Plan Credicasa exige un ingreso familiar máximo de ${usd(INGRESO_MAX_CREDICASA)} al mes (3,17 SBU): si tu hogar gana más, no calificas a esa tasa y te aplican la tasa general`,
          'El monto que el BIESS aprueba depende de tus aportes, de tu capacidad de pago y del avalúo del inmueble: el resultado de aquí es el costo del crédito, no una precalificación',
          'La cuota que financia la vivienda no incluye seguros de desgravamen e incendio, avalúo, ni gastos de escrituración y registro',
        ],
        plazo: 'la solicitud se hace en línea en el portal del BIESS con el avalúo del inmueble y el certificado de aportes al día.',
      },
      {
        id: 'quirografario',
        label: 'Quirografario del IESS',
        hint: 'Hasta 80 SBU · tasa nominal por plazo',
        answer: `El quirografario tiene un tope general de 80 SBU (${usd(TOPE_QUIROGRAFARIO)}) y una tasa nominal que sube con el plazo, del 6,5% a 6 meses al 12,99% a 60 meses.`,
        yes: [
          `Tope general del monto: 80 SBU, ${usd(TOPE_QUIROGRAFARIO)} con el SBU vigente`,
          'Tasa nominal escalonada por plazo: 6,5% hasta 6 meses · 7,5% hasta 9 · 8,5% hasta 12 · 11% hasta 48 · 12,99% de 49 a 60 meses',
          'Plazo máximo de 60 meses, con descuento por rol o débito directo',
          'La cuota sale por sistema francés con tasa mensual igual a la nominal anual ÷ 12',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El tope de 80 SBU es el máximo legal, no lo que te van a aprobar: el monto real depende de tus fondos de reserva, tu cesantía y tu capacidad de pago. No es "80 veces tu sueldo"',
          'Si la cuota supera el 40% de tu ingreso líquido, el propio BIESS suele recortar el monto aprobado',
          'Tener un quirografario vigente reduce lo que puedes pedir en un hipotecario del BIESS',
        ],
        plazo: 'se solicita en el portal del BIESS con la firma electrónica; el desembolso llega a tu cuenta en pocos días hábiles.',
      },
      {
        id: 'consumo',
        label: 'Consumo en banca privada',
        hint: 'Tasa efectiva anual · francés o alemán',
        answer: 'En banca privada la tasa que te ofrecen es efectiva anual, así que la tasa mensual es (1+TEA)^(1/12)−1 y no la TEA dividida entre 12.',
        yes: [
          'La entidad publica la tasa efectiva anual (TEA): la mensual equivalente se obtiene con la raíz doceava, no dividiendo entre 12',
          'Sistema francés: cuota fija de principio a fin, con más interés al comienzo',
          'Sistema alemán: amortizas capital fijo cada mes, la cuota arranca más alta y va bajando, y pagas menos intereses en total',
          `El BCE fija una tasa efectiva máxima del ${TEA_MAX_CONSUMO_BCE}% para el segmento de consumo: ninguna entidad puede cobrar por encima`,
        ],
        warn: [
          DISCLAIMER_FIN,
          'La tasa no es el costo total: seguros de desgravamen, comisiones y gastos administrativos suben lo que realmente pagas. Pide siempre la tabla de amortización firmada antes de aceptar',
          'Con la misma tasa y el mismo plazo, el sistema alemán paga menos intereses que el francés, pero exige aguantar cuotas iniciales más altas',
          'Alargar el plazo baja la cuota y sube el total de intereses: es el mismo crédito costando más',
        ],
        plazo: 'la tasa efectiva máxima del segmento la publica el Banco Central del Ecuador en su circular mensual de tasas.',
      },
      {
        id: 'vehicular',
        label: 'Crédito vehicular',
        hint: 'Entrada + cuotas · TEA de mercado',
        answer: 'El auto no cuesta el precio de lista: cuesta la entrada más todas las cuotas, y esa diferencia suele ser de miles de dólares.',
        yes: [
          'Se financia el precio menos la entrada; la entrada típica del mercado ecuatoriano va del 10% al 25%, y lo habitual es 20%',
          `Tasa efectiva anual de mercado en torno al ${String(TEA_VEHICULAR_REF).replace('.', ',')}% en banca grande, y desde ~13,5% en financiamiento de concesionaria`,
          'Plazos habituales de 72 a 84 meses',
          'Subir la entrada baja la cuota y, sobre todo, baja el total de intereses',
        ],
        warn: [
          DISCLAIMER_FIN,
          `Si la tasa que te ofrecen supera el ${TEA_MAX_CONSUMO_BCE}% efectivo, está por encima del techo del BCE para consumo: reclama`,
          'El costo del auto no termina en la cuota: matriculación, SPPAT, revisión técnica y combustible son un gasto anual aparte',
          'El seguro vehicular suele ser obligatorio mientras dure el crédito y no está incluido en esta cuota',
        ],
        plazo: 'la tasa se pacta al firmar; revisa que la tabla de amortización coincida con la cuota que te prometieron.',
      },
      {
        id: 'tarjeta',
        label: 'Deuda de tarjeta pagando poco',
        hint: 'Pago mínimo · la trampa más cara',
        answer: 'Pagar el mínimo de la tarjeta estira la deuda durante años y multiplica lo que devuelves; si el pago no cubre el interés del mes, la deuda crece.',
        yes: [
          'Se simula mes a mes: el interés se calcula sobre el saldo y lo que sobra del pago baja el capital',
          `El techo legal de la tarjeta es la tasa efectiva máxima de consumo del BCE, ${TEA_MAX_CONSUMO_BCE}% anual`,
          'El pago mínimo típico en Ecuador ronda el 5% del saldo y va bajando con el saldo, por eso el plazo se estira tanto',
          'Cada dólar extra por encima del mínimo se va íntegro a capital y acorta el plazo más de lo que parece',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Si tu pago mensual es menor al interés del primer mes, la deuda no baja nunca: crece todos los meses aunque estés pagando',
          'Los diferidos con interés que sigues consumiendo se suman al saldo y reinician el problema',
          'Esta simulación asume que no vuelves a consumir con la tarjeta: cualquier compra nueva alarga el plazo',
        ],
        plazo: 'la fecha de corte y la de pago son distintas: pagar el día del corte no evita el interés del consumo de ese mes.',
      },
      {
        id: 'plazofijo',
        label: 'Póliza a plazo fijo',
        hint: 'Base 360 · exoneración desde 180 días',
        answer: 'Una póliza a 180 días o más tiene el rendimiento exonerado del impuesto a la renta, así que no sufre retención en la fuente.',
        yes: [
          'El rendimiento se capitaliza con la tasa efectiva sobre base 360 días, la convención financiera ecuatoriana',
          `Plazos de ${PLAZO_EXONERACION_DIAS} días o más: rendimiento exonerado del impuesto a la renta (LRTI art. 9 num. 15.1), sin retención`,
          `Plazos menores a ${PLAZO_EXONERACION_DIAS} días: retención en la fuente del ${RETENCION_RENDIMIENTOS}% sobre el interés, vigente desde marzo del año en curso`,
          `El seguro de depósitos del COSEDE cubre hasta ${usd(COSEDE_COBERTURA)} por depositante y por entidad en bancos y cooperativas del segmento 1`,
        ],
        warn: [
          DISCLAIMER_FIN,
          'Las cooperativas suelen pagar tasas bastante más altas que los bancos, pero el tope de cobertura del COSEDE es menor en los segmentos 2 a 5: mira el segmento antes de comparar solo la tasa',
          `El COSEDE cubre el capital, no los intereses devengados: si tu capital supera ${usd(COSEDE_COBERTURA)} conviene repartirlo entre varias entidades`,
          'Cancelar la póliza antes del vencimiento normalmente implica perder parte del rendimiento pactado',
        ],
        plazo: 'la tasa pasiva referencial por plazo la publica el Banco Central del Ecuador todos los meses.',
      },
    ],
  },

  inputsTitle: 'Tus números',
  inputsIntro:
    'Todo en dólares. Si dejas la tasa en blanco o en cero, se usa la tasa de referencia de la rama que elegiste. Puedes dejar el ejemplo cargado y volver después con tus cifras.',
  fields: [
    {
      id: 'monto',
      label: 'Monto del crédito o del depósito ($)',
      prefix: '$',
      value: '30.000',
      thousands: true,
      help: 'En el crédito vehicular escribe el precio del vehículo: la entrada se descuenta aparte. En la tarjeta, el saldo que debes hoy.',
    },
    {
      id: 'plazoMeses',
      label: 'Plazo en meses',
      type: 'number',
      value: 60,
      min: 1,
      max: 360,
      step: 1,
      help: 'Hipotecario BIESS hasta 360 meses (30 años); quirografario del IESS hasta 60. En la póliza a plazo fijo, cada mes se cuenta como 30 días sobre base 360.',
    },
    {
      id: 'tasaAnual',
      label: 'Tasa anual que te ofrecen (%)',
      type: 'number',
      value: 0,
      min: 0,
      max: 100,
      step: 0.01,
      help: 'Déjala en 0 para usar la tasa de referencia de cada rama. En BIESS e IESS es nominal; en banca privada, vehicular, tarjeta y póliza es efectiva anual.',
    },
    {
      id: 'sistema',
      label: 'Sistema de amortización',
      type: 'select',
      value: 'frances',
      options: [
        { value: 'frances', label: 'Francés (cuota fija)' },
        { value: 'aleman', label: 'Alemán (capital fijo, cuota decreciente)' },
      ],
      help: 'Solo cambia el resultado en las ramas de crédito. El BIESS y el IESS trabajan con sistema francés.',
    },
    {
      id: 'entradaPct',
      label: 'Entrada del vehículo (% del precio)',
      type: 'number',
      value: 20,
      min: 0,
      max: 90,
      step: 1,
      help: 'Solo se usa en la rama del crédito vehicular. En el mercado ecuatoriano va del 10% al 25%.',
    },
    {
      id: 'pagoMensual',
      label: 'Cuánto pagas por mes en la tarjeta ($)',
      prefix: '$',
      value: '150',
      thousands: true,
      help: 'Solo se usa en la rama de la tarjeta de crédito. Escribe lo que realmente abonas cada mes.',
    },
    {
      id: 'ingresoMensual',
      label: 'Tu ingreso líquido mensual ($)',
      prefix: '$',
      value: '900',
      thousands: true,
      help: 'Sirve para ver qué porcentaje de tu ingreso se lleva la cuota. La referencia prudente es no pasar del 40%.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'Cuánto es capital y cuánto es el costo del dinero',
    caption:
      'En las ramas de crédito compara el capital que realmente recibes con los intereses que devuelves de más: la porción de intereses es el precio del crédito. En la póliza a plazo fijo la comparación se invierte y muestra tu capital contra lo que ganas.',
  },
  breakdownTitle: 'El crédito, línea por línea',
  breakdownIntro:
    'Cuota, intereses, desembolso total y el peso de la cuota sobre tu ingreso. En crédito también verás cuánto cambiaría el total con el otro sistema de amortización.',

  faq: [
    {
      q: '¿Por qué la misma tasa da cuotas distintas según la entidad?',
      a: 'Porque no todas publican lo mismo. El BIESS y el IESS publican una tasa nominal anual, y la mensual se obtiene dividiéndola entre 12. La banca privada publica la tasa efectiva anual, que ya incluye el efecto de la capitalización, y la mensual equivalente se obtiene con la raíz doceava: (1+TEA)^(1/12)−1. Si divides una tasa efectiva entre 12 te sale una cuota más baja que la real, y ese es el error más común al comparar créditos en el Ecuador.',
    },
    {
      q: '¿Cuál es la tasa del crédito hipotecario del BIESS?',
      a: `El Plan Credicasa / Vivienda Premier tiene una tasa del ${String(TASA_BIESS).replace('.', ',')}% anual para primera vivienda, la más baja registrada en el país, con plazo de hasta ${PLAZO_MAX_BIESS_ANIOS} años. Para calificar a esa tasa el ingreso familiar no puede superar ${usd(INGRESO_MAX_CREDICASA)} al mes. Por encima de ese ingreso el BIESS aplica su tasa general, que es más alta.`,
    },
    {
      q: '¿Cuánto me puede prestar el IESS en un quirografario?',
      a: `El tope general del quirografario es de 80 SBU, es decir ${usd(TOPE_QUIROGRAFARIO)} con el salario básico vigente. Pero ese es el máximo legal, no lo que te aprueban: el monto real depende de tus fondos de reserva, tu cesantía acumulada y tu capacidad de pago. La creencia de que te prestan "80 veces tu sueldo" es falsa.`,
    },
    {
      q: '¿Conviene el sistema francés o el alemán?',
      a: 'A igual tasa y plazo, el alemán siempre paga menos intereses en total, porque amortizas capital más rápido desde la primera cuota. A cambio, las primeras cuotas son bastante más altas y hay que poder sostenerlas. El francés reparte todo en una cuota fija, que es más fácil de presupuestar y por eso es el estándar del mercado. Si el flujo te alcanza, el alemán es más barato; si estás justo, el francés es más seguro.',
    },
    {
      q: '¿Cuál es la tasa máxima que me pueden cobrar en Ecuador?',
      a: `El Banco Central del Ecuador fija tasas efectivas máximas por segmento y las publica cada mes. En el segmento de consumo, que es el que aplica a créditos personales y tarjetas de crédito, el techo es del ${TEA_MAX_CONSUMO_BCE}% efectivo anual. Ninguna entidad puede cobrar por encima de esa tasa; si tu contrato dice más, tienes derecho a reclamar ante la Superintendencia de Bancos.`,
    },
    {
      q: '¿Qué pasa si pago solo el mínimo de la tarjeta?',
      a: 'El pago mínimo suele ser alrededor del 5% del saldo, y como el saldo baja, el mínimo también baja: la deuda se estira durante años y terminas devolviendo mucho más de lo que gastaste. En el caso extremo, si tu pago mensual es menor al interés del mes, el saldo crece aunque estés pagando puntualmente. La regla práctica es simple: paga siempre por encima del interés mensual, y si puedes, una cuota fija en vez del mínimo.',
    },
    {
      q: '¿Me retienen impuestos por los intereses de una póliza a plazo fijo?',
      a: `Depende del plazo. Los rendimientos de depósitos a plazo fijo emitidos a ${PLAZO_EXONERACION_DIAS} días o más y mantenidos ese tiempo están exonerados del impuesto a la renta por el artículo 9, numeral 15.1 de la LRTI, así que no sufren retención. Por debajo de ${PLAZO_EXONERACION_DIAS} días el rendimiento sí es gravado y la entidad retiene el ${RETENCION_RENDIMIENTOS}% sobre el interés, retención que después usas como crédito tributario.`,
    },
    {
      q: '¿Mi dinero está protegido si el banco quiebra?',
      a: `El COSEDE cubre hasta ${usd(COSEDE_COBERTURA)} por depositante y por entidad en bancos privados y públicos, mutualistas y cooperativas del segmento 1. En cooperativas de los segmentos 2 a 5 la cobertura es menor. La cobertura es sobre el capital, no sobre los intereses devengados, y aplica por entidad: si tienes más de ese monto, repartirlo entre varias instituciones es lo que te deja todo asegurado.`,
    },
    {
      q: '¿Cuánta cuota puedo pagar sin ahogarme?',
      a: 'La referencia que usan las propias entidades ecuatorianas es que la cuota no supere el 40% del ingreso líquido del hogar, y en hipotecario suele ser el criterio de aprobación. Si además tienes un quirografario, un vehicular o saldos de tarjeta, todo eso suma: lo que importa es el total de cuotas contra tu ingreso, no cada crédito por separado.',
    },
    {
      q: '¿Alargar el plazo es buena idea para bajar la cuota?',
      a: 'Baja la cuota y sube el costo, siempre. Cada mes extra de plazo es un mes más de intereses sobre el saldo. En un crédito de consumo pasar de 36 a 60 meses puede bajar la cuota un tercio y subir los intereses totales más de la mitad. Tiene sentido si el problema es de flujo mensual; no lo tiene si el objetivo es "que salga más barato".',
    },
    {
      q: '¿La tasa es todo lo que pago?',
      a: 'No. En Ecuador, además del interés, el crédito suele traer seguro de desgravamen, y en el hipotecario también seguro de incendio, avalúo del inmueble y gastos de escrituración y registro. En el vehicular se suma el seguro del auto. Esos rubros no entran en la tasa que te publican pero sí en lo que sale de tu cuenta: pide siempre el costo total del crédito por escrito.',
    },
    {
      q: '¿Conviene pagar el crédito antes de tiempo?',
      a: 'En un crédito con sistema francés, adelantar capital al principio es cuando más ahorra, porque es cuando el interés sobre el saldo es más alto. Al abonar a capital pides que se reduzca el plazo, no la cuota: así el ahorro de intereses es mayor. Verifica en tu contrato que el prepago no tenga penalidad, que en la banca ecuatoriana normalmente no la tiene sobre el capital.',
    },
  ],

  sources: [
    { name: 'BIESS — Créditos hipotecarios y quirografarios', url: 'https://www.biess.fin.ec/', publisher: 'Banco del Instituto Ecuatoriano de Seguridad Social' },
    { name: 'IESS — Prestaciones y préstamos al afiliado', url: 'https://www.iess.gob.ec/', publisher: 'Instituto Ecuatoriano de Seguridad Social' },
    { name: 'BCE — Tasas de interés activas efectivas vigentes por segmento', url: 'https://contenido.bce.fin.ec/documentos/Estadisticas/SectorMonFin/TasasInteres/Indice.htm', publisher: 'Banco Central del Ecuador' },
    { name: 'BCE — Tasa pasiva referencial por plazo', url: 'https://contenido.bce.fin.ec/documentos/informacioneconomica/indicadores/monetario/indTasaPasiva.html', publisher: 'Banco Central del Ecuador' },
    { name: 'SRI — Retenciones en la fuente sobre rendimientos financieros', url: 'https://www.sri.gob.ec/retenciones-en-la-fuente', publisher: 'Servicio de Rentas Internas' },
    { name: 'COSEDE — Conoce tu monto de cobertura del seguro de depósitos', url: 'https://www.cosede.gob.ec/conoce-tu-monto-de-cobertura/', publisher: 'Corporación del Seguro de Depósitos' },
    { name: 'Superintendencia de Bancos del Ecuador', url: 'https://www.superbancos.gob.ec/', publisher: 'Superintendencia de Bancos' },
  ],

  replaces: [
    '/ec/calculadora-credito-hipotecario-biess-ecuador',
    '/ec/calculadora-prestamo-quirografario-iess-ecuador',
    // Misma fórmula que la de abajo (formulaId tabla-amortizacion-frances-aleman-ecuador):
    // eran dos URLs para una sola calculadora, canibalizándose entre sí.
    '/ec/calculadora-credito-banco-pichincha-cuotas-ecuador',
    '/ec/calculadora-tabla-amortizacion-frances-aleman-ecuador',
    '/ec/calculadora-credito-vehicular-ecuador',
    '/ec/calculadora-tarjeta-credito-pago-minimo-ecuador',
    '/ec/calculadora-deposito-plazo-fijo-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
