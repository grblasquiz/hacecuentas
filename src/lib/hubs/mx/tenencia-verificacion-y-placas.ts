import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto pago al año por tener el coche en regla?"
 *
 * Fusiona las seis calculadoras de trámites vehiculares del catálogo mexicano:
 * tenencia y refrendo por entidad, verificación vehicular (costo, calendario y
 * multa por extemporánea) y el costo de placas, alta, canje o cambio de
 * propietario.
 *
 * OJO con las constantes: la UMA sale de la fuente única mexico-2026.ts, pero
 * las tarifas estatales de tenencia, refrendo y placas NO están en ninguna
 * fuente central del repo — se replican EXACTAMENTE de las fórmulas originales
 * (`tenencia-vehicular-mexico-cdmx-edomex-2026`, `placas-auto-mx`) y son
 * estimaciones por entidad, no texto de ley. Todas quedan documentadas abajo y
 * los campos de adeudos y gestoría son editables por el usuario.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/**
 * Parámetros vehiculares por entidad.
 *
 * `tenencia`: tramos de tasa sobre el valor de factura y piso mínimo, tal como
 * los aplica la fórmula original. `refrendo` y `moto` en pesos.
 * `placas`: costo de placas, tarjeta de circulación y derechos anuales.
 *
 * ⚠️ Ninguna de estas cifras es rastreable a una fuente publicada dentro del
 * repo salvo el refrendo de CDMX ($760, art. 219 del Código Fiscal de la CDMX),
 * EdoMex ($990) y Jalisco ($1.000), que la fórmula de placas marca como
 * verificados. El resto es estimación: por eso el hub muestra el resultado como
 * orden de magnitud y remite a la tesorería de cada estado.
 */
export const AUTO_MX = {
  uma: MEXICO_2026.uma.diaria,
  /** Costo de la verificación: 2,51 UMA diarias. */
  verificacionUmas: 2.51,
  /** Multa por verificar fuera de calendario: 20 UMA diarias. */
  multaExtemporaneaUmas: 20,
  /** Multa por bimestre de atraso en CDMX (fórmula original). */
  multaPorBimestre: 2000,
  /** EdoMex aplica ~90 % de la multa de CDMX según la fórmula original. */
  factorMultaEdomex: 0.9,
  /** Vigencia del holograma, en meses. */
  vigenciaHolograma: { '00': 24, '0': 12, '1': 6, '2': 6 } as Record<string, number>,
  estados: {
    cdmx: {
      label: 'Ciudad de México',
      subsidioHasta: 250000,
      tramos: [{ hasta: 1e15, tasa: 0.026 }],
      refrendo: 75,
      refrendoMoto: 40,
      refrendoSinSubsidio: 85,
      refrendoMotoSinSubsidio: 45,
      placas: 950,
      tarjeta: 280,
      derechos: 760,
      duracion: '1 a 3 días',
    },
    edomex: {
      label: 'Estado de México',
      subsidioHasta: 0,
      tramos: [
        { hasta: 200000, tasa: 0.005 },
        { hasta: 400000, tasa: 0.012 },
        { hasta: 1e15, tasa: 0.015 },
      ],
      piso: 100,
      refrendo: 85,
      refrendoMoto: 35,
      placas: 1100,
      tarjeta: 310,
      derechos: 990,
      duracion: '2 a 5 días',
    },
    jalisco: {
      label: 'Jalisco',
      subsidioHasta: 0,
      tramos: [
        { hasta: 200000, tasa: 0.016 },
        { hasta: 500000, tasa: 0.025 },
        { hasta: 1e15, tasa: 0.04 },
      ],
      piso: 200,
      refrendo: 125,
      refrendoMoto: 40,
      placas: 820,
      tarjeta: 230,
      derechos: 1000,
      duracion: '1 a 2 días',
    },
    queretaro: {
      label: 'Querétaro',
      subsidioHasta: 0,
      tramos: [
        { hasta: 200000, tasa: 0.008 },
        { hasta: 400000, tasa: 0.015 },
        { hasta: 1e15, tasa: 0.025 },
      ],
      piso: 80,
      refrendo: 100,
      refrendoMoto: 35,
      placas: 900,
      tarjeta: 260,
      derechos: 600,
      duracion: '1 a 3 días',
    },
    otros: {
      label: 'otro estado',
      subsidioHasta: 0,
      tramos: [
        { hasta: 250000, tasa: 0.005 },
        { hasta: 500000, tasa: 0.012 },
        { hasta: 1e15, tasa: 0.02 },
      ],
      piso: 50,
      refrendo: 90,
      refrendoMoto: 30,
      placas: 950,
      tarjeta: 280,
      derechos: 760,
      duracion: '1 a 5 días',
    },
  } as Record<string, any>,
  /** Factores del trámite sobre placas / tarjeta / derechos (fórmula placas-auto-mx). */
  tramites: {
    'alta-nuevo': { placas: 1, tarjeta: 1, derechos: 1.2, label: 'alta de auto nuevo' },
    'canje-trianual': { placas: 1, tarjeta: 0.6, derechos: 0.8, label: 'canje de placas' },
    refrendo: { placas: 0, tarjeta: 0, derechos: 1, label: 'refrendo anual' },
    'cambio-propietario': { placas: 0.3, tarjeta: 1, derechos: 1, label: 'cambio de propietario' },
  } as Record<string, any>,
  /** Derechos extra que algunos estados cobran por valor de factura (~0,2 %). */
  derechosPorValorPct: 0.002,
};

export const hub: HubData = {
  slug: 'mx/auto/tenencia-verificacion-y-placas',
  title: 'Tenencia, verificación y placas: cuánto cuesta traer el coche en regla',
  description:
    'Calcula lo que pagas al año por tener el auto en orden en México: tenencia y refrendo según tu estado y el valor de factura, verificación vehicular con su calendario y su multa, y el costo de placas, alta o cambio de propietario.',
  silo: 'Auto',
  siloHref: '/mx/auto',

  eyebrow: 'México · Trámites del auto',
  h1: '¿Cuánto pago al año por tener el coche en regla?',
  lede:
    'Traer el auto en orden no es un solo pago: es tenencia o refrendo cada año, verificación cada seis meses y, cuando compras o vendes, placas y cambio de propietario. Cada estado cobra distinto. Elige qué te toca resolver.',
  stamps: [
    'Tenencia y refrendo por entidad',
    'Verificación: 2,51 UMA · multa 20 UMA',
    'Calendario de verificación por terminación de placa',
    '6 calculadoras fusionadas',
  ],

  resultLabel: 'Lo que te cuesta el trámite',

  cases: {
    title: '¿Qué trámite necesitas resolver?',
    intro: 'Empezamos por el pago anual, que es el que más se consulta.',
    items: [
      {
        id: 'tenencia',
        label: 'Tenencia y refrendo del año',
        hint: 'Lo que pagas por tener el auto a tu nombre, según tu estado y el valor de factura.',
        yes: [
          'Tenencia estimada según el valor de factura y la tasa de tu entidad',
          'Descuento por antigüedad del modelo, que baja la base año con año',
          'Refrendo o derecho de control vehicular, que se paga aunque la tenencia esté subsidiada',
          'Tarifa reducida cuando el vehículo es motocicleta',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tenencia es un impuesto estatal: cada congreso local fija su propia tasa, sus subsidios y sus fechas, así que el resultado es un orden de magnitud y no sustituye a la tesorería de tu estado',
          'El subsidio no es automático en todos los casos: suele exigir estar al corriente en tenencias y multas anteriores y pagar dentro del plazo de estímulo',
          'Aunque la tenencia quede en cero, el refrendo se paga igual: es un derecho distinto del impuesto',
        ],
        plazo: 'la mayoría de las entidades cobra tenencia y refrendo en los primeros meses del año, con estímulo por pago anticipado.',
        answer:
          'Se aplica la tasa de tu estado al valor de factura ajustado por antigüedad, y al resultado se le suma el refrendo.',
      },
      {
        id: 'verificacion',
        label: 'Verificación vehicular',
        hint: 'Costo del trámite, qué bimestre te toca y cuánto es la multa si te pasaste.',
        yes: [
          'Costo de la verificación calculado en UMA, no en un precio fijo',
          'Bimestre que te corresponde según la terminación de tu placa',
          'Multa estimada por verificar fuera de calendario y por bimestres de atraso',
          'Holograma probable según el año modelo y qué implica para el Hoy No Circula',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El holograma real lo define el resultado de la prueba en el verificentro, no el año modelo: acá se estima el que suele corresponder',
          'Circular con la verificación vencida en la zona metropolitana implica multa y, además, restricción adicional de circulación',
          'El calendario y el monto de la multa varían entre CDMX y el Estado de México: consulta el programa vigente de tu entidad antes de agendar',
        ],
        plazo: 'la verificación se hace dentro del bimestre que te asigna la terminación de tu placa; el último día del bimestre es la fecha límite.',
        answer:
          'El trámite cuesta 2,51 UMA diarias y verificar fuera de calendario suma una multa de 20 UMA, más las sanciones por cada bimestre de atraso.',
      },
      {
        id: 'placas',
        label: 'Placas, alta o cambio de propietario',
        hint: 'Cuando compras, vendes o te toca canje de placas.',
        yes: [
          'Costo de placas, tarjeta de circulación y derechos vehiculares de tu estado',
          'Diferencia entre dar de alta un auto nuevo, hacer canje, pagar solo refrendo o cambiar de propietario',
          'Adeudos de tenencia y multas que traiga el vehículo, que se pagan antes de emplacar',
          'Costo de gestoría si no haces el trámite tú mismo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Comprar un usado sin verificar adeudos es el error más caro del trámite: la tenencia y las multas viajan con el vehículo, no con el vendedor anterior',
          'El cambio de propietario tiene plazo legal desde la fecha de la factura o del contrato de compraventa; hacerlo tarde genera recargos',
          'Los montos de placas y derechos son estimaciones por entidad: la cifra exacta está en la ley de ingresos de tu estado del ejercicio en curso',
        ],
        plazo: 'el cambio de propietario suele tener que hacerse dentro de los 30 días naturales posteriores a la compra.',
        answer:
          'Se suman placas, tarjeta de circulación y derechos según el trámite, más los adeudos que traiga el auto y la gestoría si la contratas.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto, así que no hace falta llenarlos todos.',
  fields: [
    {
      id: 'estado',
      label: 'Entidad donde está emplacado',
      type: 'select',
      value: 'cdmx',
      options: [
        { value: 'cdmx', label: 'Ciudad de México' },
        { value: 'edomex', label: 'Estado de México' },
        { value: 'jalisco', label: 'Jalisco' },
        { value: 'queretaro', label: 'Querétaro' },
        { value: 'otros', label: 'Otro estado' },
      ],
      help: 'La tenencia es un impuesto estatal: la entidad cambia el resultado más que ninguna otra variable.',
    },
    {
      id: 'valorFactura',
      label: 'Valor de factura del vehículo (MXN)',
      prefix: '$',
      value: 320000,
      thousands: true,
      help: 'El valor con el que se facturó a nuevo, sin descuentos ni accesorios.',
    },
    {
      id: 'anioModelo',
      label: 'Año modelo',
      type: 'number',
      value: 2022,
      min: 1970,
      max: 2027,
      step: 1,
      help: 'Cuanta más antigüedad, menor es la base sobre la que se calcula la tenencia.',
    },
    {
      id: 'esMoto',
      label: '¿Es motocicleta?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, es automóvil' },
        { value: 'si', label: 'Sí, es motocicleta' },
      ],
      help: 'Las motos pagan aproximadamente la mitad de la tarifa.',
    },
    {
      id: 'terminacion',
      label: 'Último dígito de la placa',
      type: 'select',
      value: '5',
      options: [
        { value: '0', label: '0' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
      ],
      help: 'Define el bimestre en el que te toca verificar.',
    },
    {
      id: 'mes',
      label: 'Mes en el que estás consultando',
      type: 'select',
      value: '7',
      options: [
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
      ],
      help: 'Sirve para estimar cuántos bimestres de atraso llevas.',
    },
    {
      id: 'holograma',
      label: 'Holograma que traes',
      type: 'select',
      value: '2',
      options: [
        { value: '00', label: '00 — exento, vigencia de 24 meses' },
        { value: '0', label: '0 — vigencia de 12 meses' },
        { value: '1', label: '1 — vigencia de 6 meses' },
        { value: '2', label: '2 — vigencia de 6 meses' },
      ],
      help: 'Determina cada cuánto tienes que volver a verificar.',
    },
    {
      id: 'fueraCalendario',
      label: '¿Vas a verificar fuera de tu periodo?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, dentro del calendario' },
        { value: 'si', label: 'Sí, extemporánea' },
      ],
      help: 'La verificación extemporánea suma una multa de 20 UMA.',
    },
    {
      id: 'tramite',
      label: 'Trámite de placas',
      type: 'select',
      value: 'cambio-propietario',
      options: [
        { value: 'alta-nuevo', label: 'Alta de auto nuevo' },
        { value: 'canje-trianual', label: 'Canje de placas' },
        { value: 'refrendo', label: 'Solo refrendo' },
        { value: 'cambio-propietario', label: 'Cambio de propietario' },
      ],
      help: 'El refrendo no genera placas nuevas ni tarjeta; el alta y el canje sí.',
    },
    {
      id: 'adeudos',
      label: 'Adeudos del vehículo: tenencias y multas (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Consulta el adeudo antes de comprar: viaja con el vehículo, no con el vendedor.',
    },
    {
      id: 'gestoria',
      label: 'Gestoría (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Déjalo en cero si haces el trámite tú mismo.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué se compone el pago',
    caption: 'Cada porción es un concepto distinto del trámite: impuesto, derecho, multa o adeudo.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el más alto del cálculo.',

  faq: [
    {
      q: '¿Todos los estados cobran tenencia?',
      a: 'No. La tenencia dejó de ser un impuesto federal y cada entidad decidió qué hacer: algunas la conservaron, otras la sustituyeron por un derecho de control vehicular más barato y varias la subsidian al 100 % por debajo de cierto valor de factura. Por eso el mismo auto puede costar miles de pesos al año en un estado y prácticamente nada en el de al lado.',
    },
    {
      q: '¿Qué diferencia hay entre tenencia y refrendo?',
      a: 'La tenencia es un impuesto sobre el valor del vehículo; el refrendo es un derecho que pagas por mantener vigente el registro y la tarjeta de circulación. Son cobros distintos y por eso el refrendo se paga aunque tu tenencia esté subsidiada al 100 %. Es el error más común: la gente cree que si el auto está exento no tiene que pagar nada y termina con recargos.',
    },
    {
      q: '¿Cómo baja la tenencia con la antigüedad del auto?',
      a: 'La base del cálculo se ajusta con un factor de depreciación: mientras más años tiene el modelo, menor es el valor sobre el que se aplica la tasa. En la práctica un auto de más de quince años paga una fracción de lo que pagaba a estrenar, y en varios estados directamente sale del padrón de tenencia.',
    },
    {
      q: '¿Cuánto cuesta la verificación vehicular?',
      a: 'El costo del trámite se fija en UMA, no en un precio nominal, así que se actualiza cada año junto con la unidad. Hoy equivale a 2,51 UMA diarias. Ese es el costo del servicio: no incluye las reparaciones necesarias si el vehículo no pasa la prueba de emisiones.',
    },
    {
      q: '¿Qué bimestre me toca verificar?',
      a: 'Lo determina el último dígito de tu placa. Cada terminación tiene asignado un bimestre del calendario, y tienes hasta el último día de ese bimestre para hacerlo. Si tu holograma es 00 la obligación es cada 24 meses, y con holograma 1 o 2 es cada seis meses, es decir dos veces al año.',
    },
    {
      q: '¿Cuánto es la multa por no verificar a tiempo?',
      a: 'Verificar fuera de tu periodo suma una multa equivalente a 20 UMA diarias sobre el costo del trámite. Además, circular con la verificación vencida se sanciona por separado y el monto crece con cada bimestre de atraso acumulado, así que dejarlo correr sale mucho más caro que reagendar.',
    },
    {
      q: '¿Qué holograma me van a dar?',
      a: 'El holograma lo define el resultado de la prueba de emisiones, no el año del auto. Como referencia, los modelos más recientes suelen alcanzar holograma 2 o mejor, los intermedios quedan sujetos al Hoy No Circula con holograma 1, y los muy antiguos enfrentan restricciones diarias en la zona metropolitana. Un auto nuevo también puede obtener holograma 00 por su certificado de origen.',
    },
    {
      q: '¿Cuánto cuesta emplacar un auto?',
      a: 'Depende del estado y del trámite. Emplacar un auto nuevo implica placas, tarjeta de circulación y derechos vehiculares; un cambio de propietario suele costar menos porque muchas veces conservas las placas; y el refrendo anual no genera placas ni tarjeta nuevas. Los montos exactos están en la ley de ingresos de tu entidad para el ejercicio en curso.',
    },
    {
      q: '¿Quién paga los adeudos cuando compro un auto usado?',
      a: 'Los paga quien quiera emplacarlo, y ese eres tú. Las tenencias atrasadas y las multas están ligadas al vehículo en el padrón vehicular, no a la persona que las generó. Antes de pagar el auto pide el reporte de adeudos y el de no robo: es gratuito o casi, y evita descubrir después que el trámite te costará varias veces lo que pensabas.',
    },
    {
      q: '¿Cuánto tiempo tengo para hacer el cambio de propietario?',
      a: 'La mayoría de las entidades da un plazo corto desde la fecha de la factura o del contrato de compraventa, en el orden de 30 días naturales. Pasado ese plazo hay recargos. Y mientras el auto siga a nombre del vendedor, las multas que se generen le llegan a él, lo cual es un problema para ambas partes.',
    },
    {
      q: '¿Conviene pagar la tenencia por anticipado?',
      a: 'Casi siempre sí. Varias entidades ofrecen un descuento por pago dentro de los primeros meses del año, y el subsidio para autos por debajo del umbral de valor suele estar condicionado a pagar dentro del plazo del estímulo. Pagar tarde no solo pierde el descuento: puede hacerte perder el subsidio completo.',
    },
    {
      q: '¿Las motos pagan tenencia y verificación?',
      a: 'Pagan tenencia y refrendo, en general a aproximadamente la mitad de la tarifa de un automóvil. En materia de verificación las reglas cambian por entidad: hay programas que incluyen motocicletas y otros que todavía no. Consulta el programa de verificación vigente de tu estado antes de asumir que estás exento.',
    },
  ],

  sources: [
    {
      name: 'INEGI — valor de la Unidad de Medida y Actualización (UMA)',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'Código Fiscal de la Ciudad de México — derechos por servicios de control vehicular',
      url: 'https://www.congresocdmx.gob.mx/',
      publisher: 'Congreso de la Ciudad de México',
    },
    {
      name: 'SEDEMA CDMX — Programa de Verificación Vehicular Obligatoria',
      url: 'https://www.sedema.cdmx.gob.mx/programas/programa/verificacion-vehicular',
      publisher: 'Secretaría del Medio Ambiente de la CDMX',
    },
    {
      name: 'Gobierno del Estado de México — verificación vehicular y control vehicular',
      url: 'https://sfinanzas.edomex.gob.mx/',
      publisher: 'Secretaría de Finanzas del Estado de México',
    },
    {
      name: 'Tesorería de la CDMX — pago de tenencia y refrendo',
      url: 'https://data.finanzas.cdmx.gob.mx/',
      publisher: 'Secretaría de Administración y Finanzas de la CDMX',
    },
  ],

  replaces: [
    '/calculadora-tenencia-vehicular-mexico-cdmx-edomex-2026',
    '/calculadora-tenencia-vehicular-mexico',
    '/calculadora-verificacion-vehicular-mexico-multas-cdmx-edomex',
    '/calculadora-verificacion-vehicular-costo',
    '/calculadora-placas-auto-costo-mexico',
    '/calculadora-cambio-propietario-refrendo-vehicular-mexico-2026',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
