import type { HubData } from '../types';
import { MEXICO_2026, PRESTAMOS_ISSSTE_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "Debo en la tarjeta o quiero un préstamo: ¿cuánto me va
 * a costar de verdad?"
 *
 * Fusiona las seis calculadoras de deuda y crédito al consumo del catálogo
 * mexicano: tarjeta de crédito con CAT y amortización real mes a mes, meses sin
 * intereses contra pago de contado, préstamo de tienda departamental con abonos
 * quincenales, crédito Fonacot con su tope de cuota, préstamo personal ISSSTE
 * con el tope legal del 50% del sueldo, y el descuento real de una oferta del
 * Buen Fin.
 *
 * Constantes legales (IVA, tope del descuento ISSSTE) desde la fuente única
 * src/lib/data/mexico-2026.ts. Las tasas y el CAT son campos editables: cambian
 * por institución, por producto y por perfil de riesgo.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/**
 * Parámetros del hub.
 *
 * `fonacot` reproduce los topes de la calculadora original
 * (`fonacot-credito-mexico-monto-cat-tasa`): monto máximo de 4 meses de salario,
 * cuota máxima del 15% del salario y una banda de CAT de 16% a 25%. Esos
 * valores NO están publicados como norma: son referencias comerciales de la
 * calculadora original y por eso el CAT queda como campo editable.
 */
export const DEUDA_MX = {
  ivaGeneral: MEXICO_2026.iva.general,
  quincenasPorAnio: PRESTAMOS_ISSSTE_2026.quincenasPorAnio,
  topeDescuentoIssste: PRESTAMOS_ISSSTE_2026.topeDescuentoSueldo,
  montoMinIssste: PRESTAMOS_ISSSTE_2026.montoMinPrograma,
  montoMaxIssste: PRESTAMOS_ISSSTE_2026.montoMaxPrograma,
  fonacot: {
    mesesSalarioMaximo: 4,
    capacidadPagoMax: 0.15,
    catMinimo: 16,
    catMaximo: 25,
    plazoMinMeses: 12,
    plazoMaxMeses: 36,
  },
};

export const hub: HubData = {
  slug: 'mx/finanzas/deudas-y-credito',
  title: 'Deudas y crédito en México: cuánto cuesta de verdad tu tarjeta o tu préstamo',
  description:
    'Calcula en cuántos meses liquidas tu tarjeta y cuánto pagas de intereses con IVA, si te conviene un pago a meses sin intereses o de contado, y el costo real de un préstamo de tienda, de Fonacot o del ISSSTE.',
  silo: 'Finanzas',
  siloHref: '/mx/finanzas',

  eyebrow: 'México · Deuda',
  h1: 'Debo en la tarjeta o quiero un préstamo: ¿cuánto me va a costar de verdad?',
  lede:
    'El costo de una deuda casi nunca es el que se anuncia. Depende de cuánto abones cada mes, del IVA sobre los intereses, de las comisiones anuales y del plazo. Elige tu caso y mira el número completo antes de firmar.',
  stamps: [
    'IVA sobre intereses · LIVA Art. 1',
    'Tope del 50% del sueldo en préstamos ISSSTE',
    'CAT según metodología de Banxico',
    '6 calculadoras fusionadas',
  ],

  resultLabel: 'Costo del escenario',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro: 'Empezamos por la deuda más cara y más común: la tarjeta de crédito.',
    items: [
      {
        id: 'tarjeta',
        label: 'Mi deuda de tarjeta de crédito',
        hint: 'En cuántos meses la liquidas y cuánto acabas pagando.',
        yes: [
          'Meses que tardas en liquidar con el abono mensual que indiques',
          'Intereses acumulados, con el IVA que se cobra sobre ellos',
          'Anualidad y comisiones sumadas al costo',
          'CAT aproximado de tu escenario',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Si tu abono no cubre los intereses del mes, la deuda crece aunque estés pagando: es el mecanismo por el que un saldo chico se vuelve impagable',
          'El pago mínimo está diseñado para que la deuda dure años: pagarlo puntualmente no significa avanzar sobre el capital',
          'Los intereses de tarjeta causan IVA, así que el costo real es alrededor de un 16% mayor que la tasa que anuncia el banco',
        ],
        plazo: 'los intereses se devengan al cierre de cada periodo; pagar el total antes de la fecha límite los evita por completo.',
        answer:
          'El abono cubre primero intereses e IVA y solo el resto baja el capital: por eso subir el abono acorta el plazo mucho más rápido de lo que parece.',
      },
      {
        id: 'msi',
        label: 'Meses sin intereses o pagar de contado',
        hint: 'Compara el valor de hoy de las cuotas contra el descuento de contado.',
        yes: [
          'Pago mensual de la compra diferida',
          'Valor presente de las cuotas, descontado a la tasa que rinde tu dinero',
          'Precio de contado con el descuento que te ofrezcan',
          'Cuál de las dos opciones te cuesta menos medida en dinero de hoy',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los meses sin intereses solo son gratis si el precio a meses es el mismo que el de contado: si hay descuento por pago de contado, ese descuento es el costo real de diferir',
          'Diferir a meses ocupa tu línea de crédito y muchas promociones se cancelan si te atrasas un solo pago, revirtiendo los intereses de golpe',
          'El beneficio de pagar a meses depende de que el dinero que no desembolsas quede efectivamente invirtiéndose: si se gasta, la ventaja desaparece',
        ],
        plazo: 'la promoción a meses se define al momento de la compra y no se puede cambiar después.',
        answer:
          'Gana la opción con menor costo medido en dinero de hoy: las cuotas descontadas a tu tasa contra el precio de contado con descuento.',
      },
      {
        id: 'tienda',
        label: 'Préstamo de tienda departamental',
        hint: 'Abonos quincenales y cuánto pagas de más sobre lo prestado.',
        yes: [
          'Abono quincenal con amortización de 24 periodos al año',
          'Total que terminas pagando',
          'Intereses acumulados y el porcentaje que representan sobre el monto prestado',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El crédito de tienda departamental es de los más caros del mercado: el CAT publicado suele estar muy por encima del de un banco',
          'La tasa que te asignan depende de tu historial: la del simulador es referencial y hay que confirmarla en la ficha del préstamo antes de aceptar',
          'Pregunta siempre por el descuento por liquidación anticipada: en estos créditos suele haber y cambia mucho el costo final',
        ],
        plazo: 'el primer abono suele caer en la quincena siguiente a la disposición del crédito.',
        answer:
          'Cada quincena pagas una cuota fija que amortiza capital e intereses; a más quincenas, más intereses acumulados.',
      },
      {
        id: 'fonacot',
        label: 'Crédito Fonacot',
        hint: 'Cuánto te prestan según tu salario y cuánto se descuenta de nómina.',
        yes: [
          'Monto máximo estimado según tus meses de salario',
          'Ajuste del monto cuando la cuota supera el tope de capacidad de pago',
          'Mensualidad descontada de tu nómina',
          'Intereses totales y costo del crédito',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Fonacot exige que tu centro de trabajo esté afiliado: sin afiliación no hay crédito, aunque cumplas todo lo demás',
          'El CAT y el monto máximo dependen de tu antigüedad y de tu historial: los topes de esta estimación son referencias comerciales, no una norma publicada',
          'El descuento sale de tu nómina: si dejas el empleo, la deuda no desaparece y hay que continuarla por otra vía',
        ],
        plazo: 'el descuento comienza en el periodo de nómina siguiente a la firma del contrato.',
        answer:
          'Te prestan hasta cierto número de meses de salario, pero el monto se recorta si la mensualidad supera el porcentaje de tu sueldo que Fonacot admite.',
      },
      {
        id: 'issste',
        label: 'Préstamo personal ISSSTE',
        hint: 'Descuento quincenal y el tope legal del 50% del sueldo.',
        yes: [
          'Descuento quincenal con amortización de 24 periodos al año',
          'Verificación contra el tope legal del 50% del sueldo básico',
          'Intereses totales y total a devolver',
          'Aviso si el monto queda fuera del rango del programa vigente',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El descuento vía nómina no puede exceder el 50% del sueldo básico o de la pensión: si lo supera, el sistema no autoriza el préstamo',
          'La tasa varía por modalidad: la de esta estimación es referencial, confirmá la de tu modalidad antes de aceptar',
          'Tener un préstamo vigente sin liquidar bloquea la solicitud de uno nuevo',
        ],
        plazo: 'el registro se hace en el portal del ISSSTE y la asignación se resuelve en el ciclo semanal del programa.',
        answer:
          'El descuento quincenal es una cuota fija que no puede pasar de la mitad de tu sueldo básico quincenal.',
      },
      {
        id: 'buenfin',
        label: '¿Esta oferta es real?',
        hint: 'Descuento anunciado contra el precio de verdad de semanas antes.',
        yes: [
          'Descuento anunciado contra el precio tachado',
          'Descuento real contra el precio al que el producto se vendía antes del evento',
          'Cuánto está inflado el precio tachado, si lo está',
          'Pago mensual si difieres la compra a meses',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Inflar el precio anterior para simular una rebaja es la queja más común de cada temporada de ofertas: si no tienes el precio histórico, el descuento anunciado no se puede validar',
          'Guarda captura del precio y del anuncio: si el cargo llega distinto, es tu evidencia frente a la tienda y frente a Profeco',
          'Una oferta con descuento real sigue siendo un gasto: la pregunta previa es si ibas a comprarlo de todas formas',
        ],
        plazo: 'los precios de referencia previos al evento se pueden consultar en el monitoreo público de precios de Profeco.',
        answer:
          'El descuento real se mide contra lo que costaba semanas antes, no contra el precio tachado en la etiqueta.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto. Las tasas son editables: poné la de tu contrato.',
  fields: [
    {
      id: 'saldo',
      label: 'Saldo de la tarjeta o monto del préstamo (MXN)',
      prefix: '$',
      value: 30000,
      thousands: true,
      help: 'Lo que debes hoy, o lo que quieres que te presten.',
    },
    {
      id: 'pagoMensual',
      label: 'Cuánto abonas cada mes (MXN)',
      prefix: '$',
      value: 3000,
      thousands: true,
      help: 'Solo para la tarjeta. Si abonas menos que los intereses, la deuda crece.',
    },
    {
      id: 'tasaAnual',
      label: 'Tasa de interés anual (%)',
      type: 'number',
      value: 60,
      min: 0,
      max: 200,
      step: 0.5,
      suffix: '%',
      help: 'La de tu contrato. En tarjeta va sin IVA; el hub le suma el IVA aparte.',
    },
    {
      id: 'comisionesAnuales',
      label: 'Anualidad y otras comisiones al año (MXN)',
      prefix: '$',
      value: '700',
      thousands: true,
      help: 'Anualidad de la tarjeta, comisiones por disposición o por seguro asociado.',
    },
    {
      id: 'plazoMeses',
      label: 'Plazo en meses',
      type: 'number',
      value: 12,
      min: 1,
      max: 72,
      step: 1,
      help: 'Meses del crédito, o meses de la promoción sin intereses.',
    },
    {
      id: 'plazoQuincenas',
      label: 'Plazo en quincenas',
      type: 'number',
      value: 24,
      min: 1,
      max: 144,
      step: 1,
      help: 'Los créditos de tienda y del ISSSTE se pagan por quincena: 24 al año.',
    },
    {
      id: 'salarioNeto',
      label: 'Tu salario neto mensual (MXN)',
      prefix: '$',
      value: 12000,
      thousands: true,
      help: 'Base del monto máximo y del tope de cuota en Fonacot.',
    },
    {
      id: 'sueldoQuincenal',
      label: 'Tu sueldo básico quincenal (MXN)',
      prefix: '$',
      value: 6000,
      thousands: true,
      help: 'Para verificar el tope del 50% en el préstamo del ISSSTE.',
    },
    {
      id: 'precio',
      label: 'Precio de la compra u oferta (MXN)',
      prefix: '$',
      value: 15000,
      thousands: true,
      help: 'El precio que pagarías hoy: el de la promoción a meses o el de la oferta.',
    },
    {
      id: 'tasaInversion',
      label: 'Rendimiento anual de tu dinero (%)',
      type: 'number',
      value: 7,
      min: 0,
      max: 50,
      step: 0.1,
      suffix: '%',
      help: 'A cuánto rinde el dinero que no desembolsas si pagas a meses.',
    },
    {
      id: 'descuentoContado',
      label: 'Descuento por pago de contado (%)',
      type: 'number',
      value: 5,
      min: 0,
      max: 100,
      step: 0.5,
      suffix: '%',
      help: 'Lo que te rebajan si pagas todo de una vez en lugar de a meses.',
    },
    {
      id: 'precioTachado',
      label: 'Precio tachado que anuncia la tienda (MXN)',
      prefix: '$',
      value: 20000,
      thousands: true,
      help: 'El precio "antes" de la etiqueta, contra el que se anuncia el descuento.',
    },
    {
      id: 'precioAntes',
      label: 'Precio real de semanas antes (MXN)',
      prefix: '$',
      value: 16500,
      thousands: true,
      help: 'El precio al que se vendía de verdad antes del evento. Es el que revela si la oferta es real.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'De qué está hecho lo que pagas',
    caption:
      'Separa el dinero que efectivamente recibes o compras del que se va en intereses, IVA y comisiones.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Qué es el CAT y para qué sirve?',
      a: 'El CAT, o Costo Anual Total, es un indicador que Banxico obliga a publicar para que puedas comparar créditos de distintas instituciones con una sola cifra. Incorpora la tasa de interés más las comisiones, seguros y gastos asociados. Comparar dos créditos por su tasa nominal es engañoso: se comparan por CAT, y siempre a plazos equivalentes.',
    },
    {
      q: '¿Por qué mi tarjeta cobra IVA sobre los intereses?',
      a: 'Porque el otorgamiento de crédito al consumo es un servicio gravado y los intereses son la contraprestación de ese servicio. En la práctica significa que el costo real de tu deuda es alrededor de un 16% mayor que la tasa anunciada. Es una de las razones por las que el CAT de una tarjeta se ve tan lejos de la tasa que aparece en la publicidad.',
    },
    {
      q: '¿Qué pasa si solo pago el mínimo de mi tarjeta?',
      a: 'El pago mínimo está calculado para cubrir los intereses y una fracción muy pequeña del capital, así que la deuda se estira durante años y terminas pagando varias veces lo que compraste. Si además sigues usando la tarjeta, el saldo puede no bajar nunca. Cualquier abono por encima del mínimo va directo a capital y acorta el plazo de forma desproporcionada.',
    },
    {
      q: '¿Los meses sin intereses son realmente gratis?',
      a: 'Solo si el precio a meses es idéntico al de contado. En cuanto la tienda ofrece un descuento por pagar de una vez, ese descuento es el precio de diferir, y comparar bien exige traer las cuotas a valor de hoy con la tasa a la que rinde tu dinero. Cuando no hay descuento de contado y tu dinero rinde algo, pagar a meses suele salir ligeramente a favor.',
    },
    {
      q: '¿Conviene liquidar la tarjeta antes de invertir?',
      a: 'Casi siempre sí. Una tarjeta cobra tasas de dos dígitos altos más IVA, mientras que un instrumento de deuda gubernamental rinde una fracción de eso. Pagar la tarjeta es un rendimiento garantizado y libre de impuestos equivalente a la tasa que dejas de pagar: es muy difícil que una inversión de riesgo razonable le gane.',
    },
    {
      q: '¿Qué requisitos pide Fonacot?',
      a: 'Lo esencial es que tu centro de trabajo esté afiliado al instituto, tener una antigüedad mínima en el empleo y estar dado de alta ante el IMSS. El monto se determina en meses de salario y el CAT depende de tu perfil e historial crediticio. El pago se descuenta directamente de la nómina, lo que abarata el crédito frente a un préstamo personal bancario.',
    },
    {
      q: '¿Cuánto me pueden descontar de mi nómina por un préstamo?',
      a: 'En el préstamo personal del ISSSTE el descuento no puede exceder el 50% del sueldo básico o de la pensión, y el sistema simplemente no autoriza una solicitud que lo rebase. Si tu descuento queda por encima del tope, la salida es pedir un monto menor o estirar el plazo en quincenas, no insistir con la misma solicitud.',
    },
    {
      q: '¿Por qué los créditos de tienda departamental son tan caros?',
      a: 'Porque atienden a un público sin acceso a banca tradicional, sin garantía y con alta morosidad esperada, y ese riesgo se cobra en la tasa. Los CAT publicados de este segmento están entre los más altos del mercado formal. Aun así son crédito formal y regulado, muy por encima de cualquier préstamo informal, y suelen ofrecer descuento por liquidación anticipada.',
    },
    {
      q: '¿Cómo sé si una oferta de temporada es real?',
      a: 'Comparando el precio de la oferta contra lo que costaba el producto varias semanas antes del evento, no contra el precio tachado de la etiqueta. Profeco publica monitoreo de precios justamente para eso. La práctica de subir el precio poco antes del evento para simular una rebaja es la queja recurrente de cada temporada de descuentos.',
    },
    {
      q: '¿Qué es mejor: consolidar mis deudas o pagarlas una por una?',
      a: 'Consolidar sirve solo si la tasa del nuevo crédito, con todo y comisiones, queda claramente por debajo del promedio ponderado de lo que ya debes, y si dejas de usar las líneas que liberas. Sin ese segundo compromiso, consolidar suele terminar con la deuda vieja pagada, las tarjetas otra vez llenas y el doble de saldo.',
    },
    {
      q: '¿Puedo adelantar pagos sin penalización?',
      a: 'En crédito al consumo la regla general es que los pagos anticipados se permiten y se aplican a capital, y en varios productos hay descuento explícito por liquidar antes. Lo que conviene verificar siempre es que el pago se aplique a capital y no se registre como adelanto de mensualidades futuras: el efecto sobre los intereses es completamente distinto.',
    },
    {
      q: '¿Aparece mi deuda en el Buró de Crédito?',
      a: 'Sí. Tarjetas, créditos de tienda, Fonacot y préstamos personales reportan tu comportamiento de pago. Un historial con pagos puntuales abarata todo lo que pidas después; uno con atrasos encarece o cierra el acceso. Tienes derecho a consultar tu reporte de crédito especial de forma gratuita una vez al año.',
    },
  ],

  sources: [
    {
      name: 'Banxico — Costo Anual Total (CAT): metodología y comparativos',
      url: 'https://www.banxico.org.mx/servicios/costo-anual-total-cat.html',
      publisher: 'Banco de México',
    },
    {
      name: 'Condusef — comparativo de tarjetas de crédito y créditos personales',
      url: 'https://www.condusef.gob.mx/',
      publisher: 'Condusef',
    },
    {
      name: 'Fonacot — crédito para trabajadores: requisitos y condiciones',
      url: 'https://www.fonacot.gob.mx/',
      publisher: 'Instituto Fonacot',
    },
    {
      name: 'ISSSTE — préstamos personales: modalidades y descuento vía nómina',
      url: 'https://www.gob.mx/issste',
      publisher: 'ISSSTE',
    },
    {
      name: 'Profeco — Quién es Quién en los Precios',
      url: 'https://www.profeco.gob.mx/precios/canasta/default.aspx',
      publisher: 'Profeco',
    },
    {
      name: 'Ley del Impuesto al Valor Agregado — IVA sobre intereses de crédito al consumo',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/liva.htm',
      publisher: 'Cámara de Diputados',
    },
  ],

  replaces: [
    '/calculadora-tarjeta-credito-interes-cat-mexico',
    '/calculadora-meses-sin-intereses-msi-mexico',
    '/calculadora-prestamo-coppel-abonos-quincenales-interes',
    '/calculadora-fonacot-credito-mexico-monto-cat-tasa',
    '/calculadora-prestamo-personal-issste-2026-monto-descuento',
    '/calculadora-descuento-real-buen-fin-2026-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
