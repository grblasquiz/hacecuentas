import type { HubData } from './types';
import inflacionLive from '../../data/live/inflacion.json';
import tasasLive from '../../data/live/tasas.json';

/**
 * Hub de decisión — "Pago el mínimo de la tarjeta: ¿cuánto me cuesta?"
 * Arquetipo RAMIFICADO: el motor es siempre el mismo —saldo que devenga interés
 * mes a mes, o flujo de cuotas traído a valor presente— y lo que cambia es la
 * forma de pago que estás evaluando.
 *
 * Absorbe 8 URLs (ver hub.replaces).
 *
 * DIFERENCIA con los hubs vecinos — no se pisan:
 *   · /finanzas-personales/prestamo → el momento ANTES de firmar un préstamo:
 *     cuota, TNA vs CFT y si te entra en el ingreso. Deuda a plazo cerrado.
 *   · /deudas/salir-de-deudas → ya estás endeudado y querés un PLAN DE SALIDA:
 *     avalancha vs bola de nieve, refinanciar, cancelar anticipado, prescripción.
 *   · /finanzas-personales/gastos-del-mes → a dónde se te va el sueldo.
 *   Este hub es la tarjeta como INSTRUMENTO DE PAGO del día a día: qué te sale
 *   cada forma de pagar el resumen (mínimo, monto fijo, meta de meses) y qué te
 *   sale cada forma de comprar (cuotas con recargo, cuotas "sin interés" contra
 *   contado con descuento). Es una decisión de compra y de pago, no un plan de
 *   salida de deuda: para eso está el hub de deudas, linkeado en el copy.
 *
 * EL PUNTO DEL HUB: el pago mínimo es una deuda rotativa, no una cuota. El
 * interés se capitaliza sobre el saldo del resumen y el mínimo se recalcula
 * sobre ese saldo YA con el interés adentro; por eso la cola es larguísima y el
 * total termina siendo un múltiplo del saldo original.
 *
 * DATOS VIVOS: la inflación mensual por defecto sale de src/data/live/inflacion.json
 * (INDEC, último dato publicado) y se usa como tasa de descuento en las ramas de
 * cuotas. La TNA de préstamos personales del BCRA (src/data/live/tasas.json)
 * viaja en los sellos como referencia contra la que mirar la tasa de tu tarjeta.
 * La TNA de tarjeta NO se hardcodea: se pide, porque varía muchísimo por banco.
 *
 * YMYL DE PLATA: el aviso del dominio `finance` de src/lib/disclaimers.ts viaja
 * textual en hub.fineprint y como PRIMER `warn` de cada rama.
 *
 * NOTAS DE CONTRATO:
 *  - Hub de plata: el default 'ars' sirve. Las filas de tasas, meses y
 *    multiplicadores llevan `format` explícito ('unit' o 'plain').
 *  - `chart.type: 'donut'`: composición de lo que terminás pagando. En las ramas
 *    de cuotas la composición es precio de contado contra recargo.
 */

const INFLACION_MES = inflacionLive.last_month;
const TASA_PERSONALES = tasasLive.prestamos_personales;

export const hub: HubData = {
  slug: 'finanzas-personales/tarjeta-de-credito',
  title: 'Pago el mínimo de la tarjeta: ¿cuánto me cuesta? Intereses, cuotas y contado',
  description:
    'Cuánto terminás pagando si abonás sólo el mínimo del resumen, cuánto tardás con un pago fijo y si las cuotas convienen contra el contado con descuento. Intereses, meses y tasa implícita real de la tarjeta.',
  silo: 'Finanzas personales',
  siloHref: '/finanzas-personales',

  eyebrow: 'Guía y estimación financiera',
  h1: 'Pago el mínimo de la tarjeta: ¿cuánto me cuesta?',
  lede:
    'El pago mínimo no es una cuota: es el permiso para seguir debiendo. El interés se suma al saldo todos los meses y el mínimo se recalcula sobre ese saldo nuevo, así que la deuda se estira años y el total termina siendo varias veces lo que gastaste. Acá ves el número completo, y también qué pasa si pagás un poco más, o si conviene la compra en cuotas.',
  stamps: [
    'Actualizado 27-07-2026',
    `Inflación mensual de referencia: ${INFLACION_MES.valor.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
    '8 calculadoras adentro',
  ],

  resultLabel: 'Lo que terminás pagando',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Las tres primeras ramas miran el saldo que ya tenés en la tarjeta; las dos últimas, una compra que estás por hacer. Todas usan el mismo motor: interés que se capitaliza sobre el saldo, o flujo de cuotas traído a valor presente.',
    items: [
      {
        id: 'minimo',
        label: 'Pago sólo el mínimo del resumen',
        hint: 'El caso más común y el más caro.',
        answer: 'Pagando el mínimo, los intereses terminan valiendo más que la compra.',
        yes: [
          'Simulación mes a mes: el interés del período se suma al saldo y recién después se calcula el mínimo',
          'El mínimo se toma como porcentaje del saldo del resumen —que ya incluye el interés del mes— con un piso en pesos si tu banco lo aplica',
          'Cuántos meses tardás en llegar a cero y cuántas veces el saldo original terminás pagando',
          'Si el mínimo no alcanza a cubrir el interés del mes, la deuda crece aunque pagues todos los meses',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'La TNA del resumen no es todo el costo: el CFT suma IVA sobre los intereses, seguros de la cuenta y cargos administrativos, así que lo real es más alto que esto.',
          'Si además pagás fuera de término corren intereses punitorios encima de los compensatorios, y esta simulación no los incluye.',
          'La simulación asume que no hacés consumos nuevos. Un solo consumo por mes puede volver la deuda prácticamente perpetua.',
        ],
        plazo:
          'el mínimo vence en la fecha del resumen. Pagar un día después ya activa punitorios sobre todo el saldo.',
      },
      {
        id: 'fijo',
        label: 'Pago un monto fijo por mes',
        hint: 'Cuánto tardo y cuánto interés pago.',
        answer: 'Un monto fijo por encima del mínimo acorta la deuda de forma brutal.',
        yes: [
          'Cuántos meses tardás en cancelar pagando siempre el mismo importe, sin volver a consumir',
          'El interés total acumulado hasta el último peso y cuánto pesa sobre el saldo original',
          'La comparación contra seguir pagando el mínimo: la diferencia suele ser de años, no de meses',
          'El aviso cuando el pago fijo no cubre ni el interés del mes, que es el escenario de deuda perpetua',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'El cálculo supone que el pago se mantiene constante y que no hay consumos nuevos con la misma tarjeta.',
          'Si el pago fijo es menor o igual al interés del primer mes, el saldo nunca baja: hay que subir el pago sí o sí.',
        ],
        plazo:
          'conviene fijar el pago apenas cierra el resumen, no cuando vence: los días de gracia no devengan interés si cancelás el total.',
      },
      {
        id: 'objetivo',
        label: 'Quiero salir en una cantidad de meses',
        hint: 'Qué pago mensual necesito.',
        answer: 'Poner una fecha de salida convierte la tarjeta en una cuota fija.',
        yes: [
          'El pago mensual constante que cancela el saldo exactamente en los meses que te propusiste',
          'La cuenta es la del sistema francés: pago = saldo × i × (1+i)^n ÷ ((1+i)^n − 1)',
          'El interés total de ese plan y cuánto ahorrás contra seguir pagando el mínimo',
          'Si el número te queda alto, comparalo contra la cuota de un préstamo personal: casi siempre la tasa del préstamo es menor que la de la tarjeta',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'Refinanciar el saldo en cuotas de la propia tarjeta suele salir más caro que un préstamo personal con la misma cantidad de cuotas.',
          'El plan sólo se cumple si dejás de usar esa tarjeta mientras dure: cada consumo nuevo reinicia la cuenta.',
        ],
        plazo:
          'si vas a refinanciar, pedí el CFT por escrito antes de aceptar el plan de la tarjeta y comparalo con el de un préstamo.',
      },
      {
        id: 'sin-interes',
        label: 'Cuotas "sin interés" contra contado con descuento',
        hint: 'Cuál gana en valor presente.',
        answer: 'Ganan las cuotas si el descuento por contado es menor que lo que licúa la inflación.',
        yes: [
          'El valor presente de las cuotas, descontando cada una por la inflación o por lo que te rinde la plata quieta',
          'El precio de contado neto, ya con el descuento que te ofrecen aplicado',
          'Cuál de los dos es más barato medido en plata de hoy, y por cuánto',
          'La regla corta: con inflación alta, las cuotas sin recargo casi siempre ganan salvo que el descuento por contado sea grande',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'La comparación vale sólo si vas a pagar el resumen completo todos los meses. Si esas cuotas te empujan al pago mínimo, la tasa de la tarjeta se come cualquier ventaja.',
          'La tasa de descuento es un supuesto tuyo sobre el futuro, no un dato. Probá con un valor optimista y otro pesimista antes de decidir.',
          'Las cuotas ocupan límite de la tarjeta durante todo el plazo, y eso tiene un costo de oportunidad que no aparece en el número.',
        ],
        plazo:
          'el descuento por pago de contado suele estar atado a un medio de pago o a un día puntual: confirmá la vigencia antes de comparar.',
      },
      {
        id: 'recargo',
        label: 'Las cuotas tienen recargo',
        hint: 'Cuota Simple, 3, 6 o 12 pagos con interés.',
        answer: 'Un recargo chico en pocas cuotas puede ser una tasa anual enorme.',
        yes: [
          'El recargo en pesos y en porcentaje sobre el precio de contado',
          'La tasa mensual implícita, resuelta desde el flujo real de cuotas y no como una regla de tres',
          'La tasa efectiva anual equivalente, que es la única forma de comparar 3 cuotas contra 12',
          'Cuánto pesa el recargo si además lo mirás en plata de hoy, descontado por inflación',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'Un 10% de recargo en 3 cuotas no es "10% de tasa": es una tasa efectiva anual de tres dígitos. El plazo cambia todo.',
          'La tasa efectiva anual que ves acá no incluye IVA sobre intereses ni sellos, así que el CFT que informa la entidad va a ser más alto.',
          'Los topes de tasa de los programas oficiales de cuotas se actualizan: cargá el precio total que te informan hoy en el comercio, no un tope de memoria.',
        ],
        plazo:
          'el comercio está obligado a informarte el precio de contado además del precio financiado: pedilo antes de firmar el cupón.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Los primeros tres campos alcanzan para las ramas del saldo. Los de abajo son para comparar una compra en cuotas contra el contado.',
  fields: [
    { id: 'saldo', label: 'Saldo de la tarjeta', prefix: '$', value: '300.000', thousands: true },
    {
      id: 'tna',
      label: 'TNA de financiación de tu tarjeta',
      type: 'number',
      min: 0,
      max: 500,
      step: 1,
      value: 120,
      suffix: '%',
      help: `Es la tasa nominal anual por financiar el saldo, no la TEA ni el CFT. Está en el resumen o en tu banca online, bajo "tasas vigentes". A modo de referencia, la TNA promedio de préstamos personales que publica el BCRA está hoy en ${TASA_PERSONALES.valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%, y la de tarjeta casi siempre es bastante más alta.`,
    },
    {
      id: 'minimoPct',
      label: 'Pago mínimo del resumen',
      type: 'number',
      min: 1,
      max: 100,
      step: 0.5,
      value: 15,
      suffix: '%',
      help: 'Porcentaje del saldo del resumen que te exigen como mínimo. Suele estar entre el 3% y el 15% según el banco y el producto. Ojo con los porcentajes bajos: si el mínimo no supera la tasa mensual, la deuda no se cancela nunca.',
    },
    {
      id: 'minimoFijo',
      label: 'Piso del pago mínimo',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Muchos bancos aplican un importe fijo cuando el porcentaje da menos que eso. Si tu resumen lo informa, cargalo acá; si no, dejalo en cero.',
    },
    {
      id: 'pagoFijo',
      label: 'Monto fijo que podés pagar por mes',
      prefix: '$',
      value: '50.000',
      thousands: true,
      help: 'Sólo se usa en la rama del pago fijo.',
    },
    {
      id: 'mesesObjetivo',
      label: 'En cuántos meses querés salir',
      type: 'number',
      min: 1,
      max: 120,
      value: 12,
      suffix: 'meses',
      help: 'Sólo se usa en la rama de la meta de meses.',
    },
    {
      id: 'precioContado',
      label: 'Precio de lista del producto',
      prefix: '$',
      value: '500.000',
      thousands: true,
      help: 'El precio sin financiar y sin descuento aplicado.',
    },
    {
      id: 'descuentoContado',
      label: 'Descuento por pagar de contado',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      value: 10,
      suffix: '%',
      help: 'Si no te ofrecen descuento, poné cero.',
    },
    {
      id: 'precioCuotas',
      label: 'Precio total financiado',
      prefix: '$',
      value: '500.000',
      thousands: true,
      help: 'La suma de todas las cuotas. En una promo realmente sin interés coincide con el precio de lista; si hay recargo, es más alto.',
    },
    {
      id: 'cantidadCuotas',
      label: 'Cantidad de cuotas',
      type: 'number',
      min: 1,
      max: 48,
      value: 12,
      suffix: 'cuotas',
    },
    {
      id: 'inflacion',
      label: 'Inflación mensual estimada',
      type: 'number',
      min: 0,
      max: 50,
      step: 0.1,
      value: INFLACION_MES.valor,
      suffix: '%',
      help: 'Viene precargada con el último dato mensual del INDEC. Es la tasa a la que se descuentan las cuotas futuras: si tenés la plata rindiendo por encima de la inflación, cargá ese rendimiento en su lugar.',
    },
  ],
  fineprint:
    'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',

  chart: {
    type: 'donut',
    title: 'De qué está hecho lo que pagás',
    caption:
      'En las ramas del saldo, el gráfico parte lo que vas a desembolsar entre el capital —lo que realmente gastaste— y los intereses. En las ramas de compra, entre el precio de contado y el recargo por financiar. Cuando la porción de interés se acerca o supera a la de capital, la forma de pago está costando más que la compra.',
  },
  breakdownTitle: 'El desglose de tu tarjeta',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del desglose.',

  faq: [
    {
      q: '¿Cuánto cuesta pagar el mínimo de la tarjeta?',
      a: 'Depende de la tasa y del porcentaje mínimo, pero el orden de magnitud es siempre el mismo: con una TNA de tres dígitos y un mínimo del 5%, un saldo tarda años en cancelarse y el total desembolsado termina siendo dos o tres veces el saldo original. El mínimo está calibrado para cubrir el interés del mes y poco más, así que el capital baja lentísimo.',
    },
    {
      q: '¿Cómo se calcula el pago mínimo?',
      a: 'Cada mes el banco suma al saldo el interés del período y sobre ese saldo nuevo aplica un porcentaje, en general entre el 3% y el 15%, con un piso en pesos si el porcentaje da muy poco. Es importante el orden: el mínimo se calcula sobre el saldo ya con el interés adentro, no sobre el saldo del mes anterior. Por eso el mínimo baja mucho más despacio de lo que uno espera.',
    },
    {
      q: '¿Qué pasa si el pago mínimo no cubre los intereses?',
      a: 'La deuda crece aunque pagues todos los meses. Es el escenario de saldo perpetuo: cuando el porcentaje mínimo es menor que la tasa mensual, cada resumen cierra con más saldo que el anterior. La única salida es pagar por encima del mínimo o refinanciar a una tasa más baja.',
    },
    {
      q: '¿Es lo mismo la TNA que el CFT de la tarjeta?',
      a: 'No. La TNA es la tasa nominal de financiación: se divide por 12 para sacar la mensual. El CFT suma además el IVA sobre los intereses, los seguros de la cuenta y los cargos administrativos, y por eso siempre da bastante más alto. La entidad está obligada a informarte el CFT; para comparar tarjetas o planes, ese es el número.',
    },
    {
      q: '¿Conviene refinanciar el saldo de la tarjeta con un préstamo personal?',
      a: 'Casi siempre sí, si la TNA del préstamo es menor que la de la tarjeta y no te cobran gastos de otorgamiento que se coman la diferencia. La comparación honesta es CFT contra CFT, no cuota contra mínimo. Y sólo funciona si dejás de usar la tarjeta: refinanciar y seguir consumiendo duplica la deuda en vez de resolverla.',
    },
    {
      q: '¿Las cuotas sin interés convienen con inflación alta?',
      a: 'En general sí, porque pagás con pesos futuros que valen menos: cada cuota se licúa. La cuenta correcta es traer todas las cuotas a valor presente con una tasa de descuento y compararlas contra el precio de contado neto de descuento. Si el comercio te da un descuento fuerte por pagar al contado, ese descuento puede superar lo que ganás difiriendo.',
    },
    {
      q: '¿Un 10% de recargo en 3 cuotas es una tasa del 10%?',
      a: 'No, y esa confusión es la más cara de todas. Un recargo del 10% pagado en 3 cuotas mensuales equivale a una tasa efectiva anual de tres dígitos, porque devolvés el capital de a poco y la plata está prestada mucho menos que un año. Para comparar planes de distinta cantidad de cuotas hay que mirar la tasa efectiva anual, nunca el porcentaje de recargo.',
    },
    {
      q: '¿Qué tasa de descuento tengo que usar para comparar cuotas contra contado?',
      a: 'La del mejor uso alternativo de tu plata. Si vas a dejarla en una cuenta que rinde, usá ese rendimiento mensual; si la vas a gastar igual, usá la inflación mensual esperada. Es un supuesto sobre el futuro, así que conviene probar un valor optimista y uno pesimista y ver si la respuesta cambia de lado.',
    },
    {
      q: '¿Los días de gracia de la tarjeta son gratis?',
      a: 'Sí, mientras pagues el total del resumen antes del vencimiento. Ese período entre el consumo y el vencimiento no devenga interés, y es lo que hace que usar la tarjeta como medio de pago sea gratis. En el momento en que pagás menos del total, se pierde el beneficio y el saldo empieza a devengar interés.',
    },
    {
      q: '¿Cuánto interés pagué de más por financiarme?',
      a: 'Es la diferencia entre todo lo que desembolsaste y el saldo original. Si pagaste el mínimo durante años, esa diferencia suele superar al propio saldo: pagaste más de intereses que de compras. Ese es el número que conviene mirar antes de decidir si vale la pena estirar la deuda un mes más.',
    },
    {
      q: '¿Sirve pagar apenas un poco más que el mínimo?',
      a: 'Muchísimo. Como el mínimo cubre el interés del mes y casi nada de capital, cada peso extra va entero a bajar capital y baja el interés de todos los meses siguientes. Subir el pago mensual un 50% no acorta la deuda un 50%: suele acortarla mucho más, porque el efecto se acumula.',
    },
    {
      q: '¿Qué pasa si sigo consumiendo mientras pago el mínimo?',
      a: 'La simulación deja de aplicar. Todos estos números suponen que el saldo no recibe consumos nuevos. Si seguís usando la tarjeta, cada compra se apila sobre un saldo que ya devenga interés y la fecha de salida se corre indefinidamente. Para salir hay que congelar el consumo de esa tarjeta.',
    },
  ],

  sources: [
    {
      name: 'Índice de precios al consumidor — variación mensual usada como tasa de descuento',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: INFLACION_MES.fecha,
    },
    {
      name: TASA_PERSONALES.label + ' — serie del BCRA usada como referencia de comparación',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
      date: TASA_PERSONALES.fecha,
    },
    {
      name: 'Régimen de transparencia — cómo se informa el Costo Financiero Total',
      url: 'https://www.bcra.gob.ar/BCRAyVos/Regimen_de_transparencia.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Tarjetas de crédito — normativa sobre intereses, pago mínimo y financiación',
      url: 'https://www.bcra.gob.ar/SistemasFinancierosYdePagos/Tarjetas_de_credito.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Ley 25.065 de Tarjetas de Crédito — texto vigente',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/55000-59999/55556/texact.htm',
      publisher: 'InfoLEG · Ministerio de Justicia',
    },
    {
      name: 'Cuota Simple — condiciones y cantidad de cuotas del programa',
      url: 'https://www.argentina.gob.ar/economia/comercio/cuota-simple',
      publisher: 'Ministerio de Economía de la Nación',
    },
  ],

  replaces: [
    '/calculadora-tarjeta-credito-pago-minimo-intereses',
    '/calculadora-interes-acumulado-tarjeta',
    '/calculadora-tarjeta-credito-pago-minimo-costo-real',
    '/calculadora-costo-real-cuotas-vs-contado',
    '/calculadora-tarjeta-credito-minimo',
    '/calculadora-cuotas-sin-interes-precio',
    '/calculadora-cuotas-sin-interes-costo-real-inflacion',
    '/calculadora-cuota-simple-ahora-12-costo-cuotas',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Topes de la simulación mes a mes de la rama del mínimo. */
export const SIM = {
  /** 50 años: si no cancela en ese plazo, la deuda es perpetua en los hechos. */
  MAX_MESES: 600,
  /** Piso absoluto de pago que aplican los resúmenes aunque el % dé menos. */
  PISO_ABSOLUTO: 100,
};
