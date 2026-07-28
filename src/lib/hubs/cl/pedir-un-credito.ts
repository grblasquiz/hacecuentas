import type { HubData } from '../types';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto me va a costar de verdad este crédito?"
 *
 * Absorbe crédito de consumo, préstamo personal, tarjeta rotativa / pago mínimo y
 * financiamiento en casa comercial. Todo se calcula con amortización francesa y la
 * CAE tratada como TASA ANUAL EFECTIVA (que es lo que dice la Ley 20.555 y el
 * Reglamento del SERNAC Financiero), no como tasa nominal dividida en 12.
 *
 * OJO — diferencia deliberada contra las fórmulas viejas:
 *   credito-consumo-bci / prestamo-personal / tarjeta-rotativa / crefacile usaban
 *   `i = CAE / 100 / 12`. Eso trata la CAE como nominal anual y SOBREESTIMA la cuota,
 *   porque la CAE ya viene capitalizada. Acá se usa i = (1+CAE)^(1/12) − 1.
 *
 * La UF viva sólo se usa para mostrar el tramo de TMC que aplica (los tramos de la
 * tasa máxima convencional están definidos en UF). Nunca se hardcodea en pesos.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/** Indicadores vivos (mindicador.cl vía src/data/live/chile.json). */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

/**
 * Tasa máxima convencional de referencia (%) para créditos en pesos no reajustables
 * de más de 90 días y hasta 200 UF. NO se pudo verificar contra una publicación de la
 * CMF desde el repo: las fórmulas viejas traían tres valores distintos (37,78 · 32 · 51).
 * Por eso viaja como CAMPO EDITABLE del formulario y no como constante de cálculo.
 */
export const TMC_REFERENCIAL_PCT = 37.78;
export const TMC_FECHA_DATO = '2026-07-28';

/** Pago mínimo típico de una línea rotativa: 2,5% del saldo (uso de mercado, no norma). */
export const PAGO_MINIMO_PCT = 2.5;

/** CAE referencial por tipo de financiamiento en casa comercial (CMF, referencial). */
export const TARJETAS_CASA: Array<{ id: string; nombre: string; cae: number }> = [
  { id: 'retail_alta', nombre: 'Tarjeta de casa comercial (tramo alto)', cae: 45 },
  { id: 'retail_media', nombre: 'Tarjeta de casa comercial (tramo medio)', cae: 40 },
  { id: 'banco_medio', nombre: 'Crédito bancario de consumo (tramo medio)', cae: 22 },
  { id: 'banco_bajo', nombre: 'Crédito bancario de consumo (tramo bajo)', cae: 18 },
];

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/dinero/pedir-un-credito',
  title: 'Cuánto cuesta de verdad un crédito en Chile: cuota, CAE y costo total',
  description:
    'Calcula la cuota y el costo total de un crédito de consumo en Chile con la CAE real, compara dos ofertas peso por peso, mira cuánto tardas en pagar la tarjeta si abonas solo el mínimo y cuánto te cobra de más una casa comercial frente al banco.',
  silo: 'Dinero',
  siloHref: '/cl/dinero',
  locale: 'cl',

  eyebrow: 'Chile · créditos y deudas',
  h1: '¿Cuánto me va a costar de verdad este crédito?',
  lede:
    'La cuota no es el costo: el número que manda es la CAE, porque mete adentro el interés, las comisiones y los seguros. Pon el monto, el plazo y la CAE que te ofrecieron y mira cuánto pagas en total, cuánto de eso es capital y cuánto es costo. Si lo tuyo es la tarjeta o una compra en cuotas de casa comercial, cambia el caso más abajo.',
  stamps: [
    'CAE tratada como tasa anual efectiva (Ley 20.555)',
    `UF de hoy: $${UF.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'Tope legal: tasa máxima convencional CMF',
    '4 situaciones en una sola página',
  ],

  resultLabel: 'Cuota mensual estimada',

  cases: {
    title: '¿Qué estás por firmar?',
    intro:
      'Partimos por el caso más común: un crédito de consumo en cuotas fijas, con la CAE que te ofrece el banco.',
    items: [
      {
        id: 'consumo',
        label: 'Un crédito de consumo en cuotas fijas',
        hint: 'Banco, cooperativa o caja de compensación: monto fijo, plazo fijo, cuota fija.',
        yes: [
          'Cuota con amortización francesa: la misma cuota todos los meses',
          'CAE tratada como tasa anual efectiva: la mensual sale de (1+CAE)^(1/12) − 1',
          'Comisión de originación o gastos de otorgamiento, si te los cobran aparte',
          'Costo total del crédito: todo lo que devuelves menos lo que te prestaron',
          'Chequeo contra la tasa máxima convencional que informa la CMF',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La CAE es el único número comparable entre ofertas: una cuota más baja con más plazo casi siempre sale más cara',
          'Los seguros de desgravamen y cesantía asociados al crédito deben venir dentro de la CAE; si te los cotizan aparte, la CAE que te mostraron está incompleta',
          'Prepagar total o parcialmente es un derecho: la comisión de prepago está limitada por ley y baja el costo total',
        ],
        plazo:
          'tienes 10 días hábiles de retracto en los créditos de consumo contratados a distancia (Ley 19.496), devolviendo el dinero y los gastos.',
        answer:
          'En un crédito de consumo lo que define el costo es la CAE, no la cuota: a igual CAE, más plazo significa cuota más baja y costo total más alto.',
      },
      {
        id: 'tarjeta',
        label: 'Tengo deuda en la tarjeta y pago el mínimo',
        hint: 'Línea rotativa o avance en cuotas: la deuda se recalcula todos los meses sobre el saldo.',
        yes: [
          'Simulación mes a mes: interés sobre el saldo, abono, saldo nuevo',
          'Pago mínimo recalculado cada mes como porcentaje del saldo, que es como funciona la rotativa',
          'Cuántos meses tardas en llegar a cero y cuántos intereses pagas en el camino',
          'Comparación contra pasar esa misma deuda a un crédito de consumo en cuotas',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Pagando solo el mínimo la deuda tarda años en morir y los intereses pueden superar el monto original',
          'El porcentaje del pago mínimo no está fijado por ley: es política de cada emisor, revisa tu estado de cuenta',
          'Si el abono queda por debajo del interés del mes, el saldo sube en vez de bajar y la deuda no termina nunca',
          'Comprar en cuotas sin interés y usar la rotativa son cosas distintas: la rotativa es la más cara del sistema',
        ],
        plazo:
          'el interés se devenga día a día sobre el saldo: pagar antes de la fecha de facturación baja lo que te cobran ese mes.',
        answer:
          'Con el pago mínimo de una rotativa la deuda se estira años y los intereses pueden terminar costando más que la compra original.',
      },
      {
        id: 'casa-comercial',
        label: 'Estoy por comprar algo en cuotas en una casa comercial',
        hint: 'Electrodomésticos, muebles o tecnología financiados con la tarjeta de la tienda.',
        yes: [
          'Cuota y costo total con la CAE de la tarjeta de la tienda',
          'La misma compra financiada con un crédito bancario, para ver la diferencia',
          'Cuánto pagas de más por financiar en la tienda en vez del banco',
          'Qué porcentaje del precio del producto termina siendo puro costo financiero',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El precio "en cuotas" que se ve en la vitrina no es el precio del producto: la ley obliga a mostrar el precio contado y el CAE, exígelos',
          'Las CAE de tarjetas de casa comercial suelen doblar a las bancarias para el mismo plazo',
          'Ojo con los cargos que no son interés: administración de la tarjeta, seguros opcionales y comisiones de despacho',
        ],
        plazo:
          'antes de firmar pide la hoja resumen: por ley debe traer el CAE, el costo total del crédito y el detalle de cargos.',
        answer:
          'Financiar en la tienda casi siempre cuesta más que el banco: la diferencia de CAE se traduce en decenas de miles de pesos por el mismo producto.',
      },
      {
        id: 'comparar',
        label: 'Tengo dos ofertas y no sé cuál conviene',
        hint: 'Dos bancos, o el mismo banco con dos plazos: cuál te deja pagando menos.',
        yes: [
          'Cuota y costo total de cada una de las dos ofertas',
          'Cuánta plata de diferencia hay entre firmar una u otra',
          'Cuál CAE es la que efectivamente te conviene, tomando en cuenta la comisión de la primera',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Compara siempre a igual monto y a igual plazo: si los plazos difieren, el número honesto es el costo total, no la cuota',
          'Una oferta con CAE más baja pero con comisión de originación alta puede terminar siendo la más cara',
          'La CAE de una promoción con meses de gracia esconde los intereses que igual se devengan durante la gracia',
        ],
        plazo:
          'las ofertas de crédito tienen vigencia acotada: pide las dos cotizaciones por escrito el mismo día para que sean comparables.',
        answer:
          'Entre dos créditos gana el de menor costo total, no el de menor cuota: la cuota baja casi siempre se paga con más plazo.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu crédito',
  inputsIntro:
    'Todo en pesos chilenos. En el caso de la tarjeta, el primer campo es la deuda actual de la línea rotativa; en el caso de casa comercial, es el precio contado del producto.',
  fields: [
    {
      id: 'monto',
      label: 'Monto del crédito, deuda o precio contado (CLP)',
      prefix: '$',
      value: '3.000.000',
      thousands: true,
      help: 'Capital que te prestan, saldo de la tarjeta o precio contado del producto según el caso.',
    },
    {
      id: 'plazo',
      label: 'Plazo en meses',
      type: 'number',
      value: 36,
      min: 1,
      max: 120,
      step: 1,
      help: 'Número de cuotas. No se usa en el caso de la tarjeta con pago mínimo, donde el plazo lo determina el cálculo.',
    },
    {
      id: 'cae',
      label: 'CAE anual de la oferta (%)',
      suffix: '%',
      type: 'number',
      value: 26,
      min: 0.1,
      max: 60,
      step: 0.1,
      help: 'Carga Anual Equivalente. Es el número que la ley obliga a informar y el único comparable entre ofertas.',
    },
    {
      id: 'comision',
      label: 'Comisión de originación o gastos de otorgamiento (%)',
      suffix: '%',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 0.1,
      help: 'Se cobra una sola vez sobre el capital. Si ya viene dentro de la CAE, déjala en 0 para no contarla dos veces.',
    },
    {
      id: 'cae2',
      label: 'CAE anual de la segunda oferta (%)',
      suffix: '%',
      type: 'number',
      value: 32,
      min: 0.1,
      max: 60,
      step: 0.1,
      help: 'Sólo se usa en el caso "tengo dos ofertas".',
    },
    {
      id: 'caeBanco',
      label: 'CAE del crédito bancario con el que comparas (%)',
      suffix: '%',
      type: 'number',
      value: 22,
      min: 0.1,
      max: 60,
      step: 0.1,
      help: 'Sólo se usa en el caso de casa comercial: la alternativa de financiar la misma compra con el banco.',
    },
    {
      id: 'pagoMensual',
      label: 'Cuánto abonas al mes a la tarjeta (CLP)',
      prefix: '$',
      value: '80.000',
      thousands: true,
      help: 'Sólo se usa en el caso de la tarjeta cuando eliges pago fijo. Con pago mínimo el abono lo recalcula el cálculo.',
    },
    {
      id: 'tipoPago',
      label: 'Cómo pagas la tarjeta',
      type: 'select',
      value: 'minimo',
      options: [
        { value: 'minimo', label: `Sólo el mínimo (${PAGO_MINIMO_PCT}% del saldo)` },
        { value: 'fijo', label: 'Un monto fijo todos los meses' },
      ],
    },
    {
      id: 'tmc',
      label: 'Tasa máxima convencional de referencia (%)',
      suffix: '%',
      type: 'number',
      value: TMC_REFERENCIAL_PCT,
      min: 5,
      max: 80,
      step: 0.01,
      help: `Valor referencial al ${TMC_FECHA_DATO}. La TMC la publica la CMF por tramo de monto y plazo y cambia todos los meses: revísala antes de usarla como tope.`,
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'Cuánto del total es capital y cuánto es costo',
    caption:
      'Compara la plata que efectivamente recibes (o el precio del producto) contra los intereses, las comisiones y los gastos que pagas encima.',
  },
  breakdownTitle: 'Peso por peso',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Qué es la CAE y por qué es el número que importa?',
      a: 'La Carga Anual Equivalente es el costo total del crédito expresado como una tasa anual: mete adentro el interés, las comisiones, los seguros asociados y los gastos, todos repartidos a lo largo del plazo. La Ley 20.555 obliga a informarla en toda oferta de crédito, justamente para que puedas comparar dos productos distintos con un solo número. Si comparas por tasa de interés en vez de por CAE te estás perdiendo la mitad del costo.',
    },
    {
      q: '¿Cómo se pasa la CAE anual a tasa mensual?',
      a: 'Como la CAE es una tasa anual efectiva, la mensual sale de elevar a un doceavo: i = (1 + CAE)^(1/12) − 1. Dividir la CAE por 12 es un atajo común, pero infla la cuota, porque esa división trata la CAE como si fuera nominal y no capitalizada. Esta página usa la conversión efectiva, así que puede darte una cuota levemente menor que otros simuladores.',
    },
    {
      q: '¿Qué es la tasa máxima convencional y cómo sé si me la están pasando?',
      a: 'Es el techo legal de interés que puede cobrar una operación de crédito en Chile. La calcula y publica la CMF mes a mes, por tramo de monto (en UF) y de plazo, a partir de la tasa promedio del sistema. Cobrar por encima de la TMC es delito de usura y la operación se sanciona. Como el valor cambia todos los meses y depende del tramo, acá viene como campo editable: pon el que corresponde a tu operación desde la publicación de la CMF.',
    },
    {
      q: '¿Por qué el pago mínimo de la tarjeta es tan caro?',
      a: 'Porque el mínimo suele calcularse como un porcentaje pequeño del saldo, del orden del 2% al 3%, mientras el interés de la línea rotativa es de los más altos del sistema. Cuando el abono apenas supera al interés del mes, el capital baja casi nada y la deuda se estira por años. Es perfectamente posible pagar puntualmente durante mucho tiempo y deber prácticamente lo mismo del principio.',
    },
    {
      q: '¿Conviene pasar la deuda de la tarjeta a un crédito de consumo?',
      a: 'En general sí, porque la CAE de un crédito de consumo en cuotas es bastante menor que la de una línea rotativa, y además le pones fecha de término a la deuda. La condición es no volver a usar la tarjeta: si consolidas y sigues girando, terminas con las dos deudas. Este hub te muestra la comparación de intereses entre las dos rutas para el mismo saldo.',
    },
    {
      q: '¿Puedo prepagar un crédito antes de tiempo?',
      a: 'Sí, es un derecho del consumidor y no se puede prohibir. La entidad puede cobrar una comisión de prepago acotada por ley, calculada sobre el capital que estás anticipando y en función de los intereses que quedan por devengar. Prepagar reduce el costo total, porque el interés se deja de devengar sobre el capital que ya devolviste: mientras antes prepagues, más ahorras.',
    },
    {
      q: '¿Por qué financiar en la casa comercial sale más caro que en el banco?',
      a: 'Porque la CAE de las tarjetas de retail suele ser bastante más alta que la de un crédito bancario para el mismo plazo, y porque encima suman cargos de administración y seguros que no siempre se leen. La compra en "tantas cuotas" se vende mostrando la cuota, no el costo, así que el sobreprecio queda escondido. Pide siempre el precio contado y el CAE, que la ley obliga a informar.',
    },
    {
      q: '¿La cuota más baja es la mejor oferta?',
      a: 'Casi nunca. Bajar la cuota se logra estirando el plazo, y estirar el plazo aumenta el costo total del crédito aunque la CAE sea la misma. La comparación honesta entre dos ofertas se hace a igual monto y a igual plazo, mirando el costo total. Si los plazos son distintos, quédate con el costo total en pesos y no con la cuota.',
    },
    {
      q: '¿Los seguros del crédito son obligatorios?',
      a: 'El desgravamen suele ser exigido por la entidad como condición del crédito, pero tienes derecho a contratarlo con la aseguradora que quieras y no necesariamente con la que te ofrece el banco. Los seguros de cesantía y de protección son voluntarios. Cualquier seguro exigido como condición del crédito debe estar incorporado dentro de la CAE informada.',
    },
    {
      q: '¿Qué pasa si no pago una cuota?',
      a: 'Se devengan intereses moratorios sobre la cuota impaga y gastos de cobranza, que también están regulados y son escalonados según el monto y los días de mora. Después de un tiempo el deudor puede terminar publicado en el boletín comercial, lo que encarece o bloquea el acceso a crédito futuro. Si ves que no llegas, renegociar antes de caer en mora sale mucho más barato que después.',
    },
    {
      q: '¿Puedo arrepentirme después de firmar?',
      a: 'En los créditos de consumo contratados a distancia existe un derecho de retracto de 10 días hábiles: devuelves el dinero recibido más los gastos, y el contrato queda sin efecto. En operaciones presenciales el retracto no aplica de la misma forma, pero siempre puedes prepagar de inmediato, que en la práctica deja un costo muy bajo si lo haces en los primeros días.',
    },
    {
      q: '¿Por qué mi cuota real da distinto a esta estimación?',
      a: 'Las diferencias más habituales vienen de la fecha del primer vencimiento, de meses de gracia que capitalizan intereses, de impuestos de timbres y estampillas que se financian dentro del crédito, de seguros cotizados fuera de la CAE y de comisiones que la entidad cobra al desembolso. Esta página estima el caso base de un crédito de cuota fija con la CAE que le pongas.',
    },
  ],

  sources: [
    {
      name: 'CMF — Tasa de Interés Corriente y Tasa Máxima Convencional',
      url: 'https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18959.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'CMF Educa — qué es la CAE y cómo comparar créditos',
      url: 'https://www.cmfeduca.cl/educa/portal/w3-propertyname-548.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'SERNAC — Ley 20.555 (SERNAC Financiero) y derechos del consumidor de crédito',
      url: 'https://www.sernac.cl/portal/604/w3-propertyvalue-53445.html',
      publisher: 'Servicio Nacional del Consumidor',
    },
    {
      name: 'Biblioteca del Congreso Nacional — Ley 18.010 sobre operaciones de crédito de dinero',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=29438',
      publisher: 'BCN Chile',
    },
    {
      name: 'Banco Central de Chile — tasas de interés de colocaciones del sistema financiero',
      url: 'https://si3.bcentral.cl/siete',
      publisher: 'Banco Central de Chile',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://si3.bcentral.cl/indicadoressiete/secure/Serie.aspx?gcode=UF&param=RABmAFYAWQB3AGYAaQBuAEkALQAzADUAbgBNAGgAaAAkA',
      publisher: 'Banco Central de Chile',
    },
  ],

  replaces: [
    '/calculadora-credito-consumo-bci-chile-cuota-cae',
    '/calculadora-prestamo-personal-chile-cae-cmf-cuota',
    '/calculadora-tarjeta-credito-chile-tasa-rotativa-pago-minimo',
    '/calculadora-crefacile-financiar-electrodomesticos-chile-cuota-cae',
  ],

  lastReviewed: '2026-07-28',
};
