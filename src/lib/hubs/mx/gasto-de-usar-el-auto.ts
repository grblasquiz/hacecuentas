import type { HubData } from '../types';
import { GASOLINA_MAGNA_LITRO_JUL_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto me cuesta usar el auto: gasolina, casetas y
 * seguro?"
 *
 * Fusiona tres calculadoras del catálogo mexicano: costo de un viaje en
 * carretera con casetas y combustible, conversión a gas LP contra seguir con
 * gasolina, y estimación de la prima del seguro por perfil y cobertura.
 *
 * El precio de la gasolina sale de la fuente única src/lib/data/mexico-2026.ts
 * y es editable. Las primas base y los factores de riesgo del seguro NO son
 * constantes de ley ni tienen fuente publicada dentro del repo: se replican
 * exactamente de la fórmula original y son promedios de mercado.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const USO_MX = {
  /** Precio de referencia de la gasolina Magna por litro. Editable por el usuario. */
  gasolinaMagna: GASOLINA_MAGNA_LITRO_JUL_2026,
  /** Kilometraje esperado por año para la escala de factores del seguro. */
  seguro: {
    /**
     * ⚠️ Primas anuales base en pesos. Promedios de mercado replicados de la
     * fórmula `soat-seguro-auto-mexico-cobertura-comparador`. NO son tarifas
     * publicadas por ninguna autoridad ni por una aseguradora concreta: la prima
     * real solo la da una cotización.
     */
    base: {
      responsabilidad: 4500,
      limitada: 8500,
      amplia: 12000,
      todo_riesgo: 18000,
    } as Record<string, number>,
    /** Factor por antigüedad del modelo. */
    modelo: {
      '2024_2026': 0.85,
      '2020_2023': 1.0,
      '2015_2019': 1.15,
      '2010_2014': 1.35,
      antes_2010: 1.6,
    } as Record<string, number>,
    /** Factor por zona de circulación, según siniestralidad regional. */
    zona: {
      cdmx: 1.5,
      edo_mex: 1.5,
      jalisco: 1.2,
      veracruz: 1.2,
      puebla: 1.15,
      gto: 0.95,
      baja_calif: 0.95,
      otros: 1.0,
    } as Record<string, number>,
    /** Factor por tipo de vehículo. */
    vehiculo: {
      sedan: 1.0,
      compacto: 0.95,
      suv: 1.1,
      pickup: 1.15,
      lujo: 1.35,
    } as Record<string, number>,
    /** Factor por uso: el transporte de pasajeros es el más caro. */
    uso: {
      particular: 1.0,
      transporte: 1.45,
      trabajo: 1.3,
      ejecutivo: 1.2,
    } as Record<string, number>,
    /** Factor por deducible: a mayor deducible, menor prima. */
    deducible: {
      2500: 1.1,
      5000: 1.0,
      7500: 0.94,
      10000: 0.88,
    } as Record<string, number>,
    /** Recargo por cada siniestro del historial. */
    recargoPorSiniestro: 0.15,
    /** Recargo por licencia con menos de dos años. */
    recargoLicenciaNueva: 0.15,
    /** Recargo adicional por elegir el deducible más bajo. */
    recargoDeducibleBajo: 0.08,
    /** Variabilidad habitual entre aseguradoras sobre la prima estimada. */
    rangoMin: 0.9,
    rangoMax: 1.15,
  },
};

export const hub: HubData = {
  slug: 'mx/auto/gasto-de-usar-el-auto',
  title: 'Cuánto cuesta usar el auto en México: gasolina, casetas y seguro',
  description:
    'Calcula el costo real de manejar: gasolina y casetas de un viaje en carretera, si conviene convertir a gas LP con su punto de recuperación, y cuánto debería costarte el seguro según tu perfil y la cobertura que elijas.',
  silo: 'Auto',
  siloHref: '/mx/auto',

  eyebrow: 'México · Gasto de manejar',
  h1: '¿Cuánto me cuesta usarlo: gasolina, casetas y seguro?',
  lede:
    'El auto cuesta aunque esté parado, pero lo que de verdad se siente es el gasto de usarlo. Aquí sacas el costo de un viaje concreto, decides si la conversión a gas LP se paga sola y estimas cuánto debería costarte el seguro antes de pedir cotizaciones.',
  stamps: [
    'Gasolina Magna de referencia, editable',
    'Casetas de tu ruta desde Traza tu Ruta y CAPUFE',
    'Punto de recuperación de la conversión a gas LP',
    '3 calculadoras fusionadas',
  ],

  resultLabel: 'Lo que te cuesta',

  cases: {
    title: '¿Qué gasto quieres estimar?',
    intro: 'Empezamos por el viaje concreto, que es la cuenta que la gente hace antes de salir.',
    items: [
      {
        id: 'viaje',
        label: 'Un viaje en carretera',
        hint: 'Gasolina más casetas, de ida o de ida y vuelta.',
        yes: [
          'Litros que consume tu vehículo en la distancia total del viaje',
          'Costo de la gasolina al precio por litro que definas',
          'Casetas del recorrido, contadas por trayecto',
          'Costo total del viaje y costo por kilómetro para comparar contra el autobús',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El rendimiento que declara el fabricante casi nunca es el real: usa el que sacas de tu propio tanque, dividiendo kilómetros recorridos entre litros cargados',
          'El total de casetas hay que consultarlo para tu ruta concreta: cambia por tramo, por tipo de vehículo y con cada actualización de tarifas',
          'La estimación no incluye desgaste, llantas ni mantenimiento, que en un viaje largo son un costo real aunque no se pague ese día',
        ],
        plazo: 'las tarifas de casetas se actualizan periódicamente: consulta la vigente antes de salir.',
        answer:
          'Se divide la distancia total entre el rendimiento para sacar los litros, se multiplican por el precio y se suman las casetas de cada trayecto.',
      },
      {
        id: 'glp',
        label: '¿Me conviene convertir a gas LP?',
        hint: 'Ahorro mensual y en cuánto tiempo recuperas la inversión.',
        yes: [
          'Gasto anual con gasolina frente al gasto anual con gas LP, incluido su mantenimiento propio',
          'Ahorro mensual y anual de la conversión',
          'Meses que tardas en recuperar el costo de la instalación',
          'Ahorro neto acumulado a cinco años, ya descontada la inversión',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La conversión exige equipo homologado, taller autorizado e inspecciones periódicas: instalar con un taller no registrado es un riesgo de seguridad y un problema legal',
          'Un equipo de gas ocupa espacio de cajuela y agrega peso, y no todos los motores toleran bien el cambio: consulta con el fabricante antes',
          'Si recorres pocos kilómetros al año la conversión casi nunca se paga sola, por mucho que el precio del gas sea más bajo',
        ],
        plazo: 'el equipo de gas LP requiere revisión periódica: agenda la inspección para mantener la garantía y el seguro vigentes.',
        answer:
          'Conviene cuando el ahorro anual recupera el costo de la instalación en un plazo menor al tiempo que vas a conservar el auto.',
      },
      {
        id: 'seguro',
        label: 'Cuánto debería costarme el seguro',
        hint: 'Estimación de prima por perfil, zona y cobertura antes de cotizar.',
        yes: [
          'Prima anual estimada para responsabilidad civil, cobertura limitada, amplia y todo riesgo',
          'Multiplicador de riesgo de tu perfil: edad, zona, uso, kilometraje e historial',
          'Recargos que se te aplican y cuánto pesan',
          'Rango de mercado esperable entre aseguradoras para la cobertura que elijas',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Las primas base y los factores son promedios de mercado, no la tarifa de ninguna aseguradora: la prima real solo la da una cotización con tus datos',
          'La responsabilidad civil es obligatoria para circular en carreteras federales, pero no cubre daños a tu propio vehículo ni robo',
          'Si el auto está financiado, la institución exige cobertura amplia durante toda la vigencia del crédito: no es opcional',
        ],
        plazo: 'cotiza con al menos tres aseguradoras: la diferencia por el mismo perfil y la misma cobertura suele ser de dos dígitos.',
        answer:
          'La prima sale de una prima base por cobertura multiplicada por los factores de tu perfil, más los recargos que apliquen.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto.',
  fields: [
    {
      id: 'distanciaKm',
      label: 'Distancia de ida (km)',
      type: 'number',
      suffix: 'km',
      value: 400,
      min: 1,
      max: 5000,
      step: 10,
      help: 'Solo la ida: abajo eliges si el viaje es redondo.',
    },
    {
      id: 'tipoViaje',
      label: 'Tipo de viaje',
      type: 'select',
      value: 'ida-vuelta',
      options: [
        { value: 'ida-vuelta', label: 'Ida y vuelta' },
        { value: 'ida', label: 'Solo ida' },
      ],
      help: 'El viaje redondo duplica kilómetros y casetas.',
    },
    {
      id: 'rendimientoKmL',
      label: 'Rendimiento de tu vehículo',
      type: 'number',
      suffix: 'km/L',
      value: 12,
      min: 1,
      max: 40,
      step: 0.5,
      help: 'El real, no el del folleto: kilómetros recorridos entre litros cargados.',
    },
    {
      id: 'precioLitro',
      label: 'Precio de la gasolina por litro (MXN)',
      prefix: '$',
      type: 'number',
      value: 23.8,
      min: 1,
      max: 100,
      step: 0.1,
      help: 'Precio de referencia de la Magna. Ajústalo al de tu zona.',
    },
    {
      id: 'totalCasetas',
      label: 'Casetas de la ruta, por trayecto (MXN)',
      prefix: '$',
      value: 1200,
      thousands: true,
      help: 'Súmalas con Traza tu Ruta de la SICT o con las tarifas de CAPUFE. Déjalo en cero si vas por libre.',
    },
    {
      id: 'kmAnuales',
      label: 'Kilómetros que recorres al año',
      type: 'number',
      suffix: 'km',
      value: 20000,
      thousands: true,
      help: 'Se usa tanto para la conversión a gas como para el factor de kilometraje del seguro.',
    },
    {
      id: 'consumoGlp',
      label: 'Consumo de gas LP',
      type: 'number',
      suffix: 'kg/100 km',
      value: 11,
      min: 1,
      max: 40,
      step: 0.5,
      help: 'Kilos de gas por cada 100 km. Pídele el dato al instalador para tu motor.',
    },
    {
      id: 'precioGlpKg',
      label: 'Precio del gas LP por kilo (MXN)',
      prefix: '$',
      type: 'number',
      value: 14,
      min: 1,
      max: 100,
      step: 0.1,
      help: 'El precio máximo del gas LP se publica semanalmente por región.',
    },
    {
      id: 'costoConversion',
      label: 'Costo de la instalación del equipo (MXN)',
      prefix: '$',
      value: 35000,
      thousands: true,
      help: 'Equipo homologado instalado en taller autorizado.',
    },
    {
      id: 'mantenimientoGlp',
      label: 'Mantenimiento anual extra del equipo de gas (MXN)',
      prefix: '$',
      value: 3000,
      thousands: true,
      help: 'Revisiones e inspecciones que no harías si siguieras solo con gasolina.',
    },
    {
      id: 'cobertura',
      label: 'Cobertura que quieres',
      type: 'select',
      value: 'amplia',
      options: [
        { value: 'responsabilidad', label: 'Responsabilidad civil' },
        { value: 'limitada', label: 'Cobertura limitada' },
        { value: 'amplia', label: 'Cobertura amplia' },
        { value: 'todo_riesgo', label: 'Todo riesgo' },
      ],
      help: 'La amplia incluye robo total y daños a tu propio auto.',
    },
    {
      id: 'edad',
      label: 'Edad del conductor',
      type: 'number',
      suffix: 'años',
      value: 38,
      min: 18,
      max: 95,
      step: 1,
      help: 'Antes de los 25 y después de los 65 la prima sube.',
    },
    {
      id: 'aniosLicencia',
      label: 'Años con licencia',
      type: 'number',
      suffix: 'años',
      value: 10,
      min: 0,
      max: 70,
      step: 1,
      help: 'Con menos de dos años de licencia se aplica un recargo.',
    },
    {
      id: 'modeloAuto',
      label: 'Año modelo del vehículo',
      type: 'select',
      value: '2020_2023',
      options: [
        { value: '2024_2026', label: 'Últimos dos años' },
        { value: '2020_2023', label: 'Entre tres y seis años' },
        { value: '2015_2019', label: 'Entre siete y once años' },
        { value: '2010_2014', label: 'Entre doce y dieciséis años' },
        { value: 'antes_2010', label: 'Más de dieciséis años' },
      ],
      help: 'Los autos más viejos pagan más por escasez de refacciones y mayor siniestralidad.',
    },
    {
      id: 'tipoVehiculo',
      label: 'Tipo de vehículo',
      type: 'select',
      value: 'sedan',
      options: [
        { value: 'compacto', label: 'Compacto' },
        { value: 'sedan', label: 'Sedán' },
        { value: 'suv', label: 'SUV' },
        { value: 'pickup', label: 'Pick-up' },
        { value: 'lujo', label: 'Lujo' },
      ],
      help: 'Cambia el costo de reparación y el atractivo para el robo.',
    },
    {
      id: 'ciudad',
      label: 'Dónde circulas habitualmente',
      type: 'select',
      value: 'cdmx',
      options: [
        { value: 'cdmx', label: 'Ciudad de México' },
        { value: 'edo_mex', label: 'Estado de México' },
        { value: 'jalisco', label: 'Jalisco' },
        { value: 'veracruz', label: 'Veracruz' },
        { value: 'puebla', label: 'Puebla' },
        { value: 'gto', label: 'Guanajuato' },
        { value: 'baja_calif', label: 'Baja California' },
        { value: 'otros', label: 'Otra entidad' },
      ],
      help: 'La zona de circulación es uno de los factores que más mueve la prima.',
    },
    {
      id: 'usoVehiculo',
      label: 'Uso del vehículo',
      type: 'select',
      value: 'particular',
      options: [
        { value: 'particular', label: 'Particular' },
        { value: 'trabajo', label: 'Traslados de trabajo' },
        { value: 'ejecutivo', label: 'Ejecutivo' },
        { value: 'transporte', label: 'Transporte de pasajeros o app' },
      ],
      help: 'Declarar uso particular cuando manejas en plataforma puede dejarte sin cobertura ante un siniestro.',
    },
    {
      id: 'deducible',
      label: 'Deducible de daños materiales (MXN)',
      type: 'select',
      value: '5000',
      options: [
        { value: '2500', label: '$2.500' },
        { value: '5000', label: '$5.000' },
        { value: '7500', label: '$7.500' },
        { value: '10000', label: '$10.000' },
      ],
      help: 'Subir el deducible baja la prima, pero te expone a un desembolso mayor si chocas.',
    },
    {
      id: 'siniestros',
      label: 'Siniestros en los últimos años',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: 'Cada siniestro reportado suma un recargo sobre la prima.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'De qué se compone el gasto',
    caption: 'Cada porción muestra qué parte del costo se lleva cada concepto.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el más alto del cálculo.',

  faq: [
    {
      q: '¿Cómo saco el rendimiento real de mi auto?',
      a: 'Llena el tanque, pon el odómetro parcial en cero, maneja normal y vuelve a llenarlo. Divide los kilómetros recorridos entre los litros que te cargaron: ese es tu rendimiento real. Suele estar bastante por debajo del que declara el fabricante, sobre todo en ciudad, y es el número que debes usar para presupuestar un viaje.',
    },
    {
      q: '¿Dónde consulto las casetas de mi ruta?',
      a: 'La herramienta oficial es Traza tu Ruta, de la Secretaría de Infraestructura, Comunicaciones y Transportes, que te da el desglose de casetas por tramo y por tipo de vehículo. CAPUFE publica además las tarifas vigentes de la red que opera. Ojo con el tipo de vehículo: un auto con remolque paga tarifa distinta.',
    },
    {
      q: '¿Conviene irse por libre para ahorrar casetas?',
      a: 'A veces, pero el ahorro es menor de lo que parece. La carretera libre suele ser más lenta, con más pueblos y topes, y eso empeora el rendimiento del combustible, así que parte de lo que ahorras en caseta se te va en gasolina. Además hay que ponerle precio a las horas extra y al mayor riesgo del camino. En trayectos largos la cuota suele ganar.',
    },
    {
      q: '¿Realmente ahorra la conversión a gas LP?',
      a: 'Ahorra en combustible, pero la cuenta completa incluye el costo de la instalación y el mantenimiento extra del equipo. La conversión se paga sola cuando recorres muchos kilómetros al año: con uso bajo, el ahorro mensual es tan pequeño que la inversión no se recupera antes de que vendas el auto. La pregunta correcta no es cuánto ahorras al mes sino en cuántos meses recuperas lo que gastaste.',
    },
    {
      q: '¿Qué requisitos tiene instalar gas LP en un auto?',
      a: 'Equipo homologado, instalación en un taller registrado y verificaciones periódicas del sistema. Un equipo mal instalado o sin certificación es un riesgo de seguridad serio y puede dejarte sin cobertura del seguro ante un siniestro. También conviene confirmar que hay estaciones de carga en las rutas que usas habitualmente, porque la red es mucho menos densa que la de gasolina.',
    },
    {
      q: '¿Qué diferencia hay entre responsabilidad civil y cobertura amplia?',
      a: 'La responsabilidad civil cubre solo el daño que le causas a terceros: sus vehículos, sus bienes y sus personas. No paga nada de tu auto. La cobertura amplia agrega daños materiales a tu propio vehículo y robo total, que en México es lo que de verdad importa en varias zonas. La limitada está en medio: cubre robo pero no daños propios por colisión.',
    },
    {
      q: '¿Es obligatorio el seguro de auto en México?',
      a: 'Sí, al menos la responsabilidad civil por daños a terceros para circular en carreteras y puentes federales, y varias entidades lo exigen también en su red local. Circular sin ella implica multa y retención del vehículo. Es además la cobertura más barata que existe, así que no tenerla es una mala decisión económica antes que una infracción.',
    },
    {
      q: '¿Cuánto sube la prima si tengo siniestros?',
      a: 'Cada siniestro reportado y pagado por la aseguradora aplica un recargo sobre la prima de renovación, y varios seguidos pueden significar que te renueven en condiciones mucho peores o directamente que no te renueven. Por eso, cuando el daño es apenas mayor que tu deducible, muchas veces conviene pagarlo por fuera y no reportarlo.',
    },
    {
      q: '¿Conviene subir el deducible para pagar menos?',
      a: 'Depende de tu colchón. Un deducible más alto baja la prima anual, pero te obliga a poner más dinero de golpe si chocas. La regla práctica es elegir el deducible más alto que puedas pagar sin descalabrar tus finanzas ese mes: por debajo de eso estás pagando de más por un riesgo que sí puedes absorber.',
    },
    {
      q: '¿Por qué el seguro es más caro en la Ciudad de México?',
      a: 'Porque la prima refleja la siniestralidad de la zona donde circula el vehículo: frecuencia de choques, congestión y sobre todo incidencia de robo. La zona metropolitana concentra los tres, así que el mismo auto y el mismo conductor pagan bastante más ahí que en una entidad con baja siniestralidad. El domicilio que declaras importa, y declararlo mal para pagar menos puede invalidar tu cobertura.',
    },
    {
      q: '¿Qué pasa si manejo en una app y tengo seguro particular?',
      a: 'Que ante un siniestro la aseguradora puede rechazar el pago, porque el uso declarado no corresponde al uso real del vehículo. El transporte de pasajeros tiene una siniestralidad mucho mayor y por eso su factor de prima es más alto. Sale más caro contratar la cobertura correcta, pero es la diferencia entre estar asegurado y creer que lo estás.',
    },
    {
      q: '¿Cuánto cuesta al año tener un auto además del combustible?',
      a: 'Fuera del combustible, el gasto recurrente son el seguro, la tenencia o refrendo, la verificación, el mantenimiento programado y las llantas, más la depreciación, que no se paga cada mes pero es real y suele ser el costo más grande de todos. Sumar todo eso y dividirlo entre los kilómetros del año es la única forma honesta de comparar el auto contra otras opciones de transporte.',
    },
  ],

  sources: [
    {
      name: 'SICT — Traza tu Ruta: distancias, casetas y tarifas',
      url: 'http://app.sct.gob.mx/sibuac_internet/ControllerUI?action=cmdEscogeRuta',
      publisher: 'Secretaría de Infraestructura, Comunicaciones y Transportes',
    },
    {
      name: 'CAPUFE — tarifas vigentes de la red de autopistas de cuota',
      url: 'https://www.gob.mx/capufe',
      publisher: 'CAPUFE',
    },
    {
      name: 'CRE / Secretaría de Energía — precios de gasolinas y gas LP',
      url: 'https://www.gob.mx/cre',
      publisher: 'Comisión Reguladora de Energía',
    },
    {
      name: 'CONDUSEF — seguro de automóvil: coberturas y comparativos',
      url: 'https://www.condusef.gob.mx/',
      publisher: 'CONDUSEF',
    },
    {
      name: 'AMIS — información del sector asegurador de automóviles',
      url: 'https://www.amis.com.mx/',
      publisher: 'Asociación Mexicana de Instituciones de Seguros',
    },
  ],

  replaces: [
    '/calculadora-casetas-gasolina-viaje-carretera-mexico-2026',
    '/calculadora-gasolina-rendimiento-km-litro-vs-gas-lp-mexico',
    '/calculadora-soat-seguro-auto-mexico-cobertura-comparador',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
