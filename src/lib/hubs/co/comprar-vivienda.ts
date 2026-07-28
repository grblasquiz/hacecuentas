import type { HubData } from '../types';
import { COLOMBIA_2026, CREDITO_VIVIENDA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Me alcanza para comprar y cuánto termino pagando?"
 *
 * Constantes: src/lib/data/colombia-2026.ts (SMLMV, compraventa, UVT) y
 * CREDITO_VIVIENDA_2026 (tasas Superfinanciera, tope legal de la primera cuota).
 *
 * 🔴 UVR: NO se hardcodea. La UVR se certifica a diario por el Banco de la
 * República y ronda los cuatrocientos pesos. Una calc CO viva
 * (conversion-uvt-uvr-colombia-actualizacion-2026.ts) usa una "UVR aproximada"
 * de $34.567,89 que es un valor inventado, dos órdenes de magnitud arriba del
 * real. Acá la UVR es un campo editable con el valor certificado del día.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** SMLMV 2026 — Decreto 1469 de 2025. */
export const SMLMV = COLOMBIA_2026.smlmv;

/** UVT vigente — Resolución DIAN 000238 del 15-12-2025. */
export const UVT = COLOMBIA_2026.uvt;

/** Tasas de crédito de vivienda y tope legal de la primera cuota. */
export const CREDITO = CREDITO_VIVIENDA_2026;

/** Gastos de cierre de la compraventa (notariales, registro, beneficencia, retención). */
export const CIERRE = COLOMBIA_2026.compraventa;

/**
 * Topes de vivienda de interés social, en SMLMV.
 * VIS hasta 150 SMLMV en las ciudades donde aplica el tope ampliado; VIP hasta 90 SMLMV.
 */
export const TOPE_VIS_SMLMV = 150;
export const TOPE_VIP_SMLMV = 90;

/**
 * Cuota inicial mínima habitual: 30% en no VIS (LTV 70%) y 20% en VIS (LTV 80%).
 * El límite legal de financiación es del 70% del valor del inmueble para vivienda
 * distinta de VIS y del 80% para VIS (Ley 546 de 1999, art. 17, par. 1).
 */
export const CUOTA_INICIAL_NO_VIS_PCT = 30;
export const CUOTA_INICIAL_VIS_PCT = 20;

/**
 * Subsidio Mi Casa Ya a la cuota inicial, en SMLMV, por rango de ingresos del hogar.
 * 30 SMLMV para hogares de hasta 2 SMLMV; 20 SMLMV para hogares de 2 a 4 SMLMV.
 * Verificá la vigencia y el cupo del programa antes de contar con el subsidio.
 */
export const MI_CASA_YA = {
  rango1TopeSmlmv: 2,
  rango1SubsidioSmlmv: 30,
  rango2TopeSmlmv: 4,
  rango2SubsidioSmlmv: 20,
};

/** Deducción de intereses de crédito de vivienda: 1.200 UVT al año (art. 119 ET). */
export const DEDUCCION_INTERESES_UVT = 1200;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
const pct = (n: number) => n.toFixed(2).replace('.', ',') + '%';

export const hub: HubData = {
  slug: 'co/finanzas/comprar-vivienda',
  title: 'Comprar vivienda en Colombia: ¿me alcanza y cuánto termino pagando?',
  description:
    'Cuota inicial, tope legal de la primera cuota sobre tu ingreso familiar, crédito en UVR o en pesos, subsidio Mi Casa Ya, gastos notariales y de registro, y la comparación entre arrendar y comprar a diez años.',
  silo: 'Finanzas',
  siloHref: '/co/finanzas',
  locale: 'co',

  eyebrow: 'Colombia · crédito hipotecario · Ley 546 de 1999',
  h1: '¿Me alcanza para comprar y cuánto termino pagando?',
  lede:
    'Comprar vivienda tiene tres números que deciden todo: cuánta cuota inicial juntás, cuánta cuota aguanta tu ingreso familiar y cuánto suman los gastos de cierre que nadie te cuenta hasta la firma. Esta cuenta los pone los tres juntos, respeta el tope legal de la primera cuota y te muestra el costo total del crédito.',
  stamps: [
    `Tasa promedio no VIS ${pct(CREDITO.tasaPromedioNoVisEaPct)} EA`,
    `Primera cuota ≤ ${CREDITO.cuotaMaxPctIngreso}% del ingreso familiar`,
    '8 calculadoras adentro',
  ],

  resultLabel: 'Cuota mensual del crédito',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'La cuota se calcula igual en todos los casos, pero cambia la tasa, el porcentaje de cuota inicial que te van a exigir y si tenés derecho a subsidio. Empezamos por el caso más común.',
    items: [
      {
        id: 'vis',
        label: 'Vivienda de interés social con subsidio',
        hint: `Hasta ${TOPE_VIS_SMLMV} SMLMV · Mi Casa Ya`,
        answer: `Si tu hogar gana hasta ${MI_CASA_YA.rango2TopeSmlmv} SMLMV podés acceder al subsidio a la cuota inicial y a la cobertura de tasa.`,
        yes: [
          `La VIS llega hasta ${TOPE_VIS_SMLMV} SMLMV (${cop(TOPE_VIS_SMLMV * SMLMV)}) y la VIP hasta ${TOPE_VIP_SMLMV} SMLMV (${cop(TOPE_VIP_SMLMV * SMLMV)})`,
          `Subsidio a la cuota inicial de ${MI_CASA_YA.rango1SubsidioSmlmv} SMLMV (${cop(MI_CASA_YA.rango1SubsidioSmlmv * SMLMV)}) para hogares de hasta ${MI_CASA_YA.rango1TopeSmlmv} SMLMV`,
          `Subsidio de ${MI_CASA_YA.rango2SubsidioSmlmv} SMLMV (${cop(MI_CASA_YA.rango2SubsidioSmlmv * SMLMV)}) para hogares entre ${MI_CASA_YA.rango1TopeSmlmv} y ${MI_CASA_YA.rango2TopeSmlmv} SMLMV`,
          `Cobertura de tasa que descuenta puntos porcentuales de la tasa del crédito durante los primeros años`,
          `En VIS la financiación puede llegar al 80% del valor, así que la cuota inicial baja al ${CUOTA_INICIAL_VIS_PCT}%`,
          `Las tasas VIS arrancan alrededor del ${pct(CREDITO.tasaMinVisEaPct)} EA, bastante por debajo de las de vivienda no VIS`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'El subsidio reduce lo que TE toca poner de cuota inicial, no aumenta el monto del crédito: ojo con las simulaciones que te hacen financiar más por estar subsidiado',
          'El programa tiene cupos anuales y condiciones que cambian: confirmá disponibilidad y requisitos vigentes antes de firmar promesa de compraventa',
          'No podés haber sido propietario de vivienda ni haber recibido subsidio de vivienda antes',
          'La cobertura de tasa dura un número limitado de años; cuando se acaba, la cuota sube',
        ],
        plazo: 'la postulación va por la caja de compensación o la entidad financiera; empezá el trámite antes de comprometerte con una promesa.',
      },
      {
        id: 'novis',
        label: 'Vivienda no VIS',
        hint: `Cuota inicial ${CUOTA_INICIAL_NO_VIS_PCT}% · tasa de mercado`,
        answer: `Sin subsidio la regla es dura: ${CUOTA_INICIAL_NO_VIS_PCT}% de cuota inicial y la primera cuota no puede pasar el ${CREDITO.cuotaMaxPctIngreso}% de tu ingreso familiar.`,
        yes: [
          `El banco financia hasta el 70% del valor del inmueble, así que la cuota inicial mínima es del ${CUOTA_INICIAL_NO_VIS_PCT}%`,
          `La primera cuota no puede superar el ${CREDITO.cuotaMaxPctIngreso}% de los ingresos familiares (Ley 546 de 1999, art. 17)`,
          `La tasa promedio del mercado ronda el ${pct(CREDITO.tasaPromedioNoVisEaPct)} EA, pero es negociable según tu perfil y el monto`,
          `Los intereses del crédito de vivienda son deducibles en renta hasta ${DEDUCCION_INTERESES_UVT.toLocaleString('es-CO')} UVT al año (${cop(DEDUCCION_INTERESES_UVT * UVT)}), art. 119 ET`,
          'Podés comprar cartera con otra entidad si conseguís mejor tasa, y la ley no permite cobrarte penalidad por prepagar',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La cuota inicial no es el único desembolso del día de la firma: sumá los gastos de cierre, que no son financiables',
          'El avalúo comercial puede dar por debajo del precio pactado, y el banco presta sobre el avalúo, no sobre lo que vos acordaste con el vendedor',
          'El seguro de vida deudor y el de incendio y terremoto son obligatorios y van por fuera de la tasa',
          'Estirar el plazo baja la cuota pero dispara los intereses totales: a 20 años pagás muchísimo más que a 15',
        ],
        plazo: 'pedí la tasa en EA y por escrito; una diferencia de un punto sobre veinte años son millones.',
      },
      {
        id: 'uvr',
        label: 'Crédito en UVR en vez de pesos',
        hint: 'Cuota baja al principio, indexada a la inflación',
        answer: 'En UVR la deuda se ajusta con la inflación: arrancás pagando menos, pero el saldo crece con el IPC.',
        yes: [
          'La UVR es una unidad que se recalcula a diario según el IPC y la certifica el Banco de la República',
          'En un crédito en UVR el capital está denominado en UVR, no en pesos: la deuda se ajusta con la inflación',
          'La tasa que te cobran es REAL (por encima de la inflación), por eso el número se ve mucho más bajo que en pesos',
          'La cuota inicial en pesos es más baja que la de un crédito equivalente en pesos, lo que ayuda a pasar el tope del 30%',
          'Si la inflación baja de forma sostenida, terminás pagando menos que en un crédito en pesos',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El riesgo real es que la cuota en pesos SUBE cada mes con la inflación: si tu sueldo no sigue el mismo ritmo, la cuota se te va de las manos',
          'En un pico inflacionario el saldo en pesos puede crecer más rápido de lo que amortizás, y llegar a deber más que al principio',
          'Fue exactamente lo que pasó con el UPAC en los noventa y lo que motivó la Ley 546 de 1999 y la sentencia C-955 de 2000',
          'No aceptes ninguna simulación que use una "UVR aproximada" sin fecha: el valor se certifica todos los días y hay calculadoras dando vueltas con valores inventados',
        ],
        plazo: 'consultá la UVR del día en el Banco de la República y cargala abajo; a hoy ronda los cuatrocientos pesos, no las decenas de miles.',
      },
      {
        id: 'arrendar',
        label: 'Todavía dudo entre arrendar y comprar',
        hint: 'Comparación a diez años',
        answer: 'Comprar gana cuando te quedás muchos años; arrendar gana si te vas a mover pronto.',
        yes: [
          'Del lado de comprar sumá: el capital que amortizás cada mes y la valorización del inmueble',
          'Del lado de comprar restá: intereses, predial, administración, seguros y mantenimiento, que no se recuperan',
          'Del lado de arrendar sumá: lo que rinde la cuota inicial invertida en vez de estar en ladrillos',
          `El canon de arrendamiento se puede reajustar hasta el IPC del año anterior (Ley 820 de 2003, art. 20)`,
          'Los gastos de cierre de la compra se amortizan sólo si te quedás varios años: en horizontes cortos son pura pérdida',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La comparación honesta tiene que incluir los gastos de cierre y la comisión de venta futura: casi ninguna simulación los pone',
          'Comparar la cuota del crédito contra el canon de arriendo es engañoso: parte de la cuota es ahorro tuyo, y el canon no',
          'Si vendés antes de cinco o seis años, los costos de entrada y salida suelen comerse la valorización',
        ],
        plazo: 'el punto de equilibrio típico está entre cinco y ocho años; por debajo de eso arrendar suele ganar.',
      },
      {
        id: 'abono',
        label: 'Ya tengo crédito y quiero abonar a capital',
        hint: 'Reducir plazo vs reducir cuota',
        answer: 'Abonar a capital reduce plazo o cuota, y reducir plazo es lo que más intereses te ahorra.',
        yes: [
          'En Colombia no te pueden cobrar penalidad por prepago en crédito de vivienda: es un derecho legal',
          'Reducir PLAZO manteniendo la cuota es lo que más intereses ahorra, y por bastante',
          'Reducir CUOTA manteniendo el plazo alivia el mes a mes pero ahorra mucho menos',
          'Como en el sistema francés los primeros años son casi todo interés, abonar temprano rinde muchísimo más que abonar tarde',
          'Tenés que pedir expresamente cómo querés que se aplique el abono: la entidad aplica una opción por defecto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Antes de abonar, comparalo con cancelar otras deudas: si tenés tarjeta al 25% EA y la hipoteca al 15%, la tarjeta va primero',
          'Confirmá por escrito que el abono se aplicó a capital y pedí la nueva tabla de amortización',
          'Abonar hasta quedarte sin fondo de emergencia es un mal negocio: esa plata sale después a tasa de consumo',
        ],
        plazo: 'pedí siempre "abono a capital con reducción de plazo" si tu presupuesto aguanta la cuota actual.',
      },
    ],
  },

  inputsTitle: 'Tu compra y tu capacidad de pago',
  inputsIntro:
    'Cargá el precio de la vivienda que estás mirando y el ingreso del hogar (sumá los dos sueldos si compran en pareja). El resto podés dejarlo en el ejemplo.',
  fields: [
    {
      id: 'precio',
      label: 'Precio de la vivienda (COP)',
      prefix: '$',
      value: '300.000.000',
      thousands: true,
      help: `Si es VIS tiene que estar por debajo de ${cop(TOPE_VIS_SMLMV * SMLMV)} (${TOPE_VIS_SMLMV} SMLMV).`,
    },
    {
      id: 'inicial',
      label: 'Cuota inicial que vas a poner (%)',
      suffix: '%',
      type: 'number',
      value: CUOTA_INICIAL_NO_VIS_PCT,
      min: 0,
      max: 100,
      step: 1,
      help: `Mínimo habitual: ${CUOTA_INICIAL_NO_VIS_PCT}% en vivienda no VIS y ${CUOTA_INICIAL_VIS_PCT}% en VIS.`,
    },
    {
      id: 'ingreso',
      label: 'Ingreso mensual del hogar (COP)',
      prefix: '$',
      value: '9.000.000',
      thousands: true,
      help: `Sumá los ingresos de todos los que van al crédito. La primera cuota no puede pasar el ${CREDITO.cuotaMaxPctIngreso}% de este número.`,
    },
    {
      id: 'tasa',
      label: 'Tasa efectiva anual del crédito (% EA)',
      suffix: '% EA',
      type: 'number',
      value: CREDITO.tasaPromedioNoVisEaPct,
      min: 0,
      max: 60,
      step: 0.01,
      help: `Promedio no VIS ${pct(CREDITO.tasaPromedioNoVisEaPct)} EA; VIS desde ${pct(CREDITO.tasaMinVisEaPct)} EA. En un crédito en UVR poné acá la tasa REAL, que es mucho más baja.`,
    },
    {
      id: 'plazo',
      label: 'Plazo del crédito (años)',
      type: 'number',
      value: 20,
      min: 1,
      max: 30,
      step: 1,
      help: 'A más plazo, menos cuota y muchísimos más intereses.',
    },
    {
      id: 'uvr',
      label: 'Valor de la UVR de hoy (COP)',
      prefix: '$',
      type: 'number',
      value: 400,
      min: 1,
      max: 10000,
      step: 0.01,
      help: 'Sólo para crédito en UVR. Consultá el valor certificado del día en el Banco de la República: ronda los cuatrocientos pesos. Si una calculadora te muestra decenas de miles, está mal.',
    },
    {
      id: 'ipc',
      label: 'Inflación esperada (% anual)',
      suffix: '% anual',
      type: 'number',
      value: 5.1,
      min: 0,
      max: 50,
      step: 0.1,
      help: 'Sirve para proyectar cuánto sube la cuota en un crédito en UVR y para ajustar el canon de arriendo en la comparación.',
    },
    {
      id: 'abono',
      label: 'Abono extra a capital por mes (COP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Cuánto podrías poner de más cada mes. Dejalo en 0 si no vas a abonar.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'scale',
    title: 'Tu cuota contra el tope legal del ingreso familiar',
    caption:
      `La primera cuota de un crédito de vivienda no puede superar el ${CREDITO.cuotaMaxPctIngreso}% de los ingresos familiares (Ley 546 de 1999, art. 17). El marcador te muestra dónde cae tu cuota: si entra en la franja roja, el banco no te aprueba el crédito por ese monto, por más que vos creas que podés pagarlo.`,
    bands: [
      { label: 'Holgado', from: 0, to: 20, tone: 'good' },
      { label: 'Al límite', from: 20, to: 30, tone: 'warn' },
      { label: 'Supera el tope legal', from: 30, to: 60, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Cuánto necesitás el día de la firma y cuánto vas a pagar en total',
  breakdownIntro:
    'Primero el desembolso inicial completo, incluidos los gastos de cierre que no son financiables. Después la cuota, el tope legal y el costo total del crédito.',

  faq: [
    {
      q: '¿Cuánta cuota inicial necesito para comprar vivienda en Colombia?',
      a: `Como mínimo el ${CUOTA_INICIAL_NO_VIS_PCT}% en vivienda no VIS y el ${CUOTA_INICIAL_VIS_PCT}% en VIS, porque la ley limita la financiación al 70% y al 80% del valor del inmueble respectivamente (Ley 546 de 1999, art. 17). Pero el desembolso real del día de la firma es bastante mayor: hay que sumar los gastos notariales, el impuesto de registro, los derechos de beneficencia y el avalúo, que no son financiables. Sobre una vivienda de trescientos millones, esa diferencia son varios millones que mucha gente no tiene presupuestados.`,
    },
    {
      q: '¿Cuál es el tope legal de la cuota respecto de mi sueldo?',
      a: `La primera cuota del crédito no puede exceder el ${CREDITO.cuotaMaxPctIngreso}% de los ingresos familiares del deudor, según el art. 17 de la Ley 546 de 1999. No es una recomendación de prudencia: es un límite que el banco tiene que respetar al aprobar. Por eso la forma más directa de saber cuánto te pueden prestar es al revés: tomá el ${CREDITO.cuotaMaxPctIngreso}% de tu ingreso familiar, y ese es el techo de tu cuota; de ahí sale el monto máximo del crédito según la tasa y el plazo.`,
    },
    {
      q: '¿Qué es la UVR y por qué es riesgosa?',
      a: 'La UVR es una unidad de cuenta que se recalcula todos los días según la inflación y la certifica el Banco de la República. En un crédito en UVR tu deuda está denominada en esa unidad, no en pesos: si la inflación sube, tu saldo en pesos sube. La tasa que te cobran es real, es decir por encima de la inflación, y por eso el número se ve mucho más bajo que en un crédito en pesos. El riesgo es que la cuota en pesos crece cada mes: si tu ingreso no sigue ese ritmo, la cuota se vuelve impagable. Eso fue exactamente lo que pasó con el UPAC en los noventa, y es lo que motivó la Ley 546 de 1999 y la sentencia C-955 de 2000 de la Corte Constitucional.',
    },
    {
      q: '¿Cuánto vale la UVR hoy?',
      a: 'Ronda los cuatrocientos pesos y se certifica a diario en el Banco de la República. Lo decimos con este nivel de detalle porque circulan calculadoras con una "UVR aproximada" de decenas de miles de pesos, un valor que no existe y que da resultados absurdos por dos órdenes de magnitud. Cualquier simulación en UVR que no te muestre la fecha del valor que está usando no sirve: la UVR cambia todos los días y una cifra sin fecha es una cifra sin respaldo.',
    },
    {
      q: '¿Conviene el crédito en UVR o en pesos?',
      a: 'En pesos la cuota es fija y previsible: sabés hoy cuánto vas a pagar dentro de quince años, y si la inflación se dispara, la inflación juega a tu favor porque tu deuda se licúa. En UVR arrancás pagando menos, lo que ayuda a pasar el tope del 30% del ingreso, pero asumís el riesgo inflacionario completo. La regla práctica: si tu ingreso se ajusta con el salario mínimo o con el IPC, la UVR es más tolerable; si tu ingreso es fijo o nominal, el crédito en pesos te protege mucho mejor.',
    },
    {
      q: '¿Cuánto se paga de gastos notariales y de registro?',
      a: `Los derechos notariales son del ${(CIERRE.derechosNotariales * 100).toFixed(2).replace('.', ',')}% del valor de la escritura y se suelen repartir mitad y mitad entre comprador y vendedor. El impuesto de registro y los derechos de beneficencia los paga el comprador y varían por departamento: en Bogotá y Cundinamarca rondan el ${(CIERRE.impuestoRegistroBogota * 100).toFixed(2).replace('.', ',')}% y el ${(CIERRE.beneficenciaBogota * 100).toFixed(2).replace('.', ',')}% respectivamente. Y hay una retención en la fuente del ${(CIERRE.retencionVendedorPN * 100).toFixed(0)}% a cargo del vendedor persona natural. En conjunto, el cierre suele moverse en el orden del 2,5% al 3% del valor sobre el comprador, y no es financiable.`,
    },
    {
      q: '¿Cómo funciona el subsidio Mi Casa Ya?',
      a: `Tiene dos componentes. El primero es un subsidio a la cuota inicial: ${MI_CASA_YA.rango1SubsidioSmlmv} SMLMV (${cop(MI_CASA_YA.rango1SubsidioSmlmv * SMLMV)}) para hogares que ganan hasta ${MI_CASA_YA.rango1TopeSmlmv} SMLMV, y ${MI_CASA_YA.rango2SubsidioSmlmv} SMLMV (${cop(MI_CASA_YA.rango2SubsidioSmlmv * SMLMV)}) para hogares entre ${MI_CASA_YA.rango1TopeSmlmv} y ${MI_CASA_YA.rango2TopeSmlmv} SMLMV. El segundo es una cobertura que descuenta puntos porcentuales de la tasa durante los primeros años del crédito. Un punto clave que muchas simulaciones se equivocan: el subsidio reduce lo que a vos te toca poner de cuota inicial, NO aumenta el monto que te presta el banco. Si una calculadora te financia más por estar subsidiado, está mal.`,
    },
    {
      q: '¿Me conviene más arrendar o comprar?',
      a: 'Depende casi por completo de cuántos años te vas a quedar. Comprar tiene costos de entrada altos (cuota inicial más gastos de cierre) y costos de salida altos (comisión inmobiliaria, gastos de la nueva escritura), y esos costos se amortizan sólo con el tiempo. El punto de equilibrio típico está entre cinco y ocho años. Un error común es comparar la cuota del crédito contra el canon de arriendo: no son comparables, porque una parte de la cuota es capital que vuelve a tu patrimonio, mientras que el canon se va entero. La comparación correcta incluye también qué rendiría la cuota inicial si en vez de comprar la invirtieras.',
    },
    {
      q: '¿Es mejor abonar a capital para reducir plazo o para reducir cuota?',
      a: 'Para ahorrar intereses, reducir plazo, y por bastante margen. Si mantenés la cuota y acortás el plazo, cada peso abonado deja de generar intereses durante todos los meses que eliminaste. Si en cambio bajás la cuota manteniendo el plazo, el alivio es mensual pero el ahorro total es mucho menor. Como en el sistema francés los primeros años son casi todo interés, abonar temprano rinde muchísimo más que abonar tarde. Pedilo por escrito: la entidad aplica una de las dos opciones por defecto y no siempre es la que te conviene.',
    },
    {
      q: '¿Me pueden cobrar penalidad por pagar el crédito antes?',
      a: 'No en crédito de vivienda. El prepago total o parcial sin penalidad es un derecho del deudor hipotecario en Colombia, y forma parte del régimen protector que instauró la Ley 546 de 1999. Si te dicen lo contrario, o te aparece un cobro por prepago en la liquidación, podés reclamar ante la entidad y, si no responde, ante la Superintendencia Financiera.',
    },
    {
      q: '¿Los intereses de mi crédito de vivienda son deducibles en renta?',
      a: `Sí, hasta ${DEDUCCION_INTERESES_UVT.toLocaleString('es-CO')} UVT al año, que con la UVT vigente son ${cop(DEDUCCION_INTERESES_UVT * UVT)}, según el art. 119 del Estatuto Tributario. Es un tope generoso: cubre los intereses de un crédito bastante grande. Ojo con las calculadoras que usan un límite fijo en pesos de unos pocos millones, porque el tope está definido en UVT y se actualiza cada año. Recordá además que esta deducción entra dentro del límite global del 40% de la renta líquida del art. 336, así que puede que no te la puedas restar completa.`,
    },
    {
      q: '¿Qué pasa si el avalúo da menos que el precio que acordé?',
      a: 'El banco presta sobre el avalúo comercial, no sobre el precio que vos pactaste con el vendedor. Si el avalúo queda por debajo, el monto del crédito baja y la diferencia la tenés que poner vos de tu bolsillo, además de la cuota inicial que ya tenías prevista. Es una de las formas más frecuentes de que se caiga un negocio ya firmado en promesa. Por eso conviene pedir el avalúo antes de firmar la promesa de compraventa, o dejar en la promesa una condición expresa que te permita retirarte si el avalúo no alcanza.',
    },
  ],

  sources: [
    {
      name: 'Ley 546 de 1999 — sistema de financiación de vivienda individual a largo plazo',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0546_1999.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Sentencia C-955 de 2000 — condicionamientos al sistema UVR',
      url: 'https://www.corteconstitucional.gov.co/relatoria/2000/C-955-00.htm',
      publisher: 'Corte Constitucional',
    },
    {
      name: 'Unidad de Valor Real (UVR) — serie diaria certificada',
      url: 'https://www.banrep.gov.co/es/estadisticas/unidad-valor-real-uvr',
      publisher: 'Banco de la República',
    },
    {
      name: 'Tasas de interés de crédito de vivienda por entidad',
      url: 'https://www.superfinanciera.gov.co/',
      publisher: 'Superintendencia Financiera de Colombia',
      date: '2026-06-19',
    },
    {
      name: 'Programa Mi Casa Ya — requisitos y montos del subsidio',
      url: 'https://www.minvivienda.gov.co/viceministerio-de-vivienda/mi-casa-ya',
      publisher: 'Ministerio de Vivienda, Ciudad y Territorio',
    },
    {
      name: 'Tarifas de derechos notariales',
      url: 'https://www.supernotariado.gov.co/',
      publisher: 'Superintendencia de Notariado y Registro',
    },
    {
      name: 'Estatuto Tributario, art. 119 — deducción de intereses de crédito de vivienda',
      url: 'https://estatuto.co/119',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, arts. 398 a 401 — retención en la fuente en enajenación de inmuebles',
      url: 'https://estatuto.co/398',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Ley 820 de 2003, art. 20 — reajuste del canon de arrendamiento',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0820_2003.html',
      publisher: 'Congreso de la República',
    },
  ],

  replaces: [
    '/co/calculadora-credito-hipotecario-colombia-2026-uvr-pesos',
    '/co/calculadora-credito-hipotecario-davivienda-cuota',
    '/co/calculadora-cuanto-me-presta-banco-vivienda-sueldo-colombia',
    '/co/calculadora-cuota-inicial-vivienda-colombia-vis-no-vis',
    '/co/calculadora-pago-anticipado-credito-hipotecario-colombia-ahorro-intereses',
    '/co/calculadora-gastos-notariales-registro-compraventa-2026',
    '/co/calculadora-subsidio-vivienda-mi-casa-ya-colombia-2026',
    '/co/calculadora-coste-arriendo-vs-comprar-colombia-10-anos',
  ],

  lastReviewed: '2026-07-28',
};
