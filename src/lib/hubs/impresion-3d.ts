import type { HubData } from './types';

/**
 * Hub de decisión — "Impresión 3D: ¿cuánto sale la pieza?"
 * Arquetipo CÁLCULO DOMINANTE (calculadora-costo-impresion-3d-pieza se lleva el
 * tráfico), así que NO usa `cases`: la respuesta va en `answer` y el material
 * se elige en un `select`.
 *
 * Absorbe 9 calculadoras (ver hub.replaces): costo de la pieza, filamento
 * necesario, resina en mL, precio hora de servicio, tiempo por altura de capa,
 * energía eléctrica, peso por material, cooling fan y grosor de estaño.
 *
 * NOTAS DE CONTRATO:
 *  - Gramos, metros, horas, capas, kWh, mL y porcentajes NO son plata: todas
 *    esas filas declaran `format: 'unit'`. El runtime hace Object.assign y una
 *    fila sin `format` propio cae a pesos.
 *  - El default del resultado sí es 'ars': el número grande es el precio.
 */
export const hub: HubData = {
  slug: 'tecnologia/impresion-3d',
  title: 'Costo de impresión 3D por hora y por pieza — Calculadora 2026',
  description:
    'Calculá el costo de una impresora 3D por hora y por pieza: filamento o resina, luz consumida, desgaste, amortización, mano de obra y precio final con margen. PLA, ABS, PETG, TPU, ASA y resina.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Guía y estimación de costos',
  h1: '¿Cuánto cuesta una impresión 3D por hora y por pieza?',
  lede:
    'El filamento es la parte visible del costo, pero no la más grande. Con el volumen del modelo, el relleno y los datos de tu impresora sale el costo real —material, luz, desgaste y tu hora— y el precio que tenés que cobrar.',
  stamps: ['Actualizado 27-07-2026', 'PLA, PETG, ABS, TPU, ASA y resina', '9 calculadoras adentro'],

  resultLabel: 'Precio de venta de la pieza',

  inputsTitle: 'Completá los datos de tu pieza y tu impresora',
  inputsIntro: 'Con el material, el volumen y el precio del rollo ya tenés un número. El resto afina el costo real.',
  fields: [
    {
      id: 'material',
      label: 'Material',
      type: 'select',
      value: 'pla',
      options: [
        { value: 'pla', label: 'PLA (densidad 1,24 g/cm³)' },
        { value: 'petg', label: 'PETG (1,27 g/cm³)' },
        { value: 'abs', label: 'ABS (1,04 g/cm³)' },
        { value: 'tpu', label: 'TPU flexible (1,20 g/cm³)' },
        { value: 'asa', label: 'ASA (1,07 g/cm³)' },
        { value: 'resina', label: 'Resina (impresión SLA/MSLA)' },
      ],
      help: 'Con resina, el cálculo pasa a mililitros y el precio se toma por litro.',
    },
    {
      id: 'volumen',
      label: 'Volumen del modelo',
      type: 'number',
      suffix: 'cm³',
      min: 0.1,
      max: 100000,
      step: 0.1,
      value: 60,
      help: 'El slicer te lo muestra al cargar el STL. Una taza ronda los 60 cm³.',
    },
    {
      id: 'infill',
      label: 'Relleno (infill)',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 5,
      value: 20,
      help: 'Solo filamento. Además del relleno siempre hay perímetros: por eso el 0% no significa cero material.',
    },
    {
      id: 'precioKg',
      label: 'Precio del kilo de filamento (o del litro de resina)',
      prefix: '$',
      value: '28.000',
      thousands: true,
    },
    {
      id: 'paredHollow',
      label: 'Espesor de pared si la vaciás (solo resina)',
      type: 'number',
      suffix: 'mm',
      min: 0,
      max: 10,
      step: 0.1,
      value: 2,
      help: 'Con hueco de 2 mm la pieza usa cerca del 20% de la resina que usaría maciza.',
    },
    {
      id: 'soportes',
      label: 'Material extra en soportes',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 200,
      step: 5,
      value: 15,
    },
    {
      id: 'altura',
      label: 'Altura de la pieza',
      type: 'number',
      suffix: 'mm',
      min: 1,
      max: 1000,
      step: 1,
      value: 40,
    },
    {
      id: 'layer',
      label: 'Altura de capa',
      type: 'number',
      suffix: 'mm',
      min: 0.02,
      max: 1,
      step: 0.01,
      value: 0.2,
      help: 'Bajar de 0,2 a 0,1 mm duplica las capas y casi duplica el tiempo.',
    },
    {
      id: 'velocidad',
      label: 'Velocidad de impresión',
      type: 'number',
      suffix: 'mm/s',
      min: 5,
      max: 1000,
      step: 5,
      value: 80,
    },
    {
      id: 'watts',
      label: 'Consumo de la impresora',
      type: 'number',
      suffix: 'W',
      min: 10,
      max: 2000,
      step: 10,
      value: 120,
      help: 'Una FDM con cama caliente ronda los 120 W promedio; una resina, unos 60 W.',
    },
    {
      id: 'kwh',
      label: 'Precio del kWh',
      prefix: '$',
      type: 'number',
      min: 0,
      max: 100000,
      step: 1,
      value: 90,
      help: 'Mirá la factura de luz: kWh consumidos dividido el importe del período.',
    },
    {
      id: 'precioImpresora',
      label: 'Lo que te salió la impresora',
      prefix: '$',
      value: '900.000',
      thousands: true,
    },
    {
      id: 'amortizacionMeses',
      label: 'Meses en los que querés amortizarla',
      type: 'number',
      min: 1,
      max: 240,
      step: 1,
      value: 36,
    },
    {
      id: 'horasMesImpresora',
      label: 'Horas que imprimís por mes',
      type: 'number',
      suffix: 'h',
      min: 1,
      max: 720,
      step: 1,
      value: 120,
    },
    {
      id: 'tiempoHumano',
      label: 'Tu tiempo por pieza (setup, retirar, postprocesado)',
      type: 'number',
      suffix: 'min',
      min: 0,
      max: 1440,
      step: 5,
      value: 30,
    },
    {
      id: 'tarifaHumana',
      label: 'Cuánto vale tu hora',
      prefix: '$',
      value: '8.000',
      thousands: true,
    },
    {
      id: 'margen',
      label: 'Margen de ganancia',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 500,
      step: 5,
      value: 40,
      help: 'Debajo del 30% no cubrís fallas ni reimpresiones.',
    },
  ],
  fineprint:
    'Es una estimación. El tiempo real depende del slicer, la geometría y las aceleraciones de tu máquina; el consumo eléctrico varía con la temperatura de la cama y del ambiente.',

  chart: {
    type: 'donut',
    title: 'De qué está hecho el costo',
    caption:
      'El anillo reparte el costo real de la pieza entre el material, la electricidad que consume la impresora mientras trabaja, el desgaste y la amortización de la máquina, y tu hora de trabajo. Casi siempre el material pesa menos de lo que la gente supone.',
  },
  breakdownTitle: 'Cuánto material, cuánto tiempo y cuánta plata',
  breakdownIntro:
    'Las filas en pesos son plata; las de gramos, metros, horas, capas, kWh y mililitros llevan su unidad. Las barras comparan cada valor con el mayor.',

  answer: {
    title: 'Cómo se arma el precio de una impresión',
    copy:
      'El costo de una pieza no es "los gramos por el precio del rollo". Son cuatro cosas: material, electricidad, desgaste y amortización de la máquina, y tu tiempo. El precio de venta es ese costo más un margen que cubra las fallas.',
    yes: [
      'Material: volumen efectivo × densidad del filamento, o mililitros de resina si es SLA',
      'El relleno no es lineal: siempre hay perímetros, tapas y purga que consumen material',
      'Electricidad: horas de impresión × consumo en kW × precio del kWh',
      'Desgaste: un 10% sobre material más luz, para boquillas, correas, PTFE y placas',
      'Amortización: lo que salió la impresora repartido entre los meses y horas que la usás',
      'Tu hora de trabajo: preparar, retirar la pieza, quitar soportes y lijar',
    ],
    warn: [
      'Sumá entre un 5% y un 10% extra de material por purga, brim y soportes',
      'Un margen del 0% es vender al costo: la primera falla te la comés entera',
      'La resina tiene costos ocultos: alcohol isopropílico, guantes, FEP y curado',
      'La estimación de tiempo del slicer es más precisa que cualquier fórmula: usala si la tenés',
      'TPU y nylon imprimen mucho más lento: el costo por hora sube aunque los gramos sean los mismos',
    ],
    plazo:
      'para cotizar a un cliente, sumá el tiempo de postprocesado real: suele ser el rubro que más se subestima.',
  },

  faq: [
    {
      q: '¿Cuánto sale imprimir una pieza en 3D?',
      a: 'Se calcula sumando cuatro cosas: el material (gramos × precio del kilo ÷ 1000), la electricidad (horas × watts ÷ 1000 × precio del kWh), el desgaste de la máquina —una regla práctica es el 10% sobre material más luz— y tu tiempo de trabajo. Sobre ese costo total se aplica el margen. En una pieza chica de PLA el material suele ser menos de la mitad del costo real.',
    },
    {
      q: '¿Cuántos gramos de filamento necesita mi modelo?',
      a: 'El volumen efectivo es aproximadamente el 30% del volumen del modelo (perímetros y tapas, que van siempre) más el 70% restante multiplicado por el porcentaje de relleno. Ese volumen efectivo por la densidad del material da los gramos. Para PLA la densidad es 1,24 g/cm³, así que 20 cm³ efectivos son unos 24,8 gramos.',
    },
    {
      q: '¿Cuántos metros de filamento hay en un rollo de 1 kg?',
      a: 'En filamento de 1,75 mm, un kilo de PLA rinde unos 330 metros; en 2,85 mm son cerca de 125 metros. La cuenta sale de dividir el volumen total por la sección del filamento: π × (diámetro ÷ 2)². El hub te muestra los metros que consume tu pieza en concreto.',
    },
    {
      q: '¿Cuánta resina consume una pieza vaciada?',
      a: 'Una pieza maciza consume su volumen completo. Vaciada con pared de 2 mm baja a cerca del 20% de ese volumen; con 1,5 mm, al 12%; con 3 mm, al 30%. A eso hay que sumarle los soportes, que en piezas inclinadas se llevan fácil un 15% a 25% del material. Acordate de dejar agujeros de drenaje o la resina atrapada arruina la pieza.',
    },
    {
      q: '¿Cuánta luz consume una impresora 3D?',
      a: 'Una FDM con cama caliente promedia unos 100 a 150 W durante la impresión: 10 horas son cerca de 1,2 kWh. Una impresora de resina consume menos, entre 40 y 80 W. Con tarifas residenciales, la electricidad casi nunca supera el 10% del costo de la pieza, salvo impresiones muy largas con la cama a alta temperatura.',
    },
    {
      q: '¿Cómo calculo cuánto tarda una impresión según la altura de capa?',
      a: 'La cantidad de capas es la altura de la pieza dividida por la altura de capa, redondeada para arriba. Cada capa tarda en función del área a extruir, del ancho de línea de la boquilla y de la velocidad. En la práctica, pasar de 0,2 a 0,1 mm duplica las capas y prácticamente duplica el tiempo, mientras que subir a 0,3 mm lo recorta un tercio a costa del acabado.',
    },
    {
      q: '¿Cuánto tengo que cobrar la hora de mi servicio de impresión 3D?',
      a: 'Sumá la amortización de la impresora por hora (lo que salió, dividido por los meses de amortización y por las horas que imprimís al mes), la electricidad por hora, un 10% de desgaste sobre eso y tu mano de obra prorrateada. Cobrar por debajo de ese número es trabajar a pérdida: no cubre el recambio de la máquina.',
    },
    {
      q: '¿Qué material pesa más para el mismo volumen?',
      a: 'De mayor a menor densidad: PETG 1,27 g/cm³, PLA 1,24, TPU 1,20, ASA 1,07 y ABS 1,04. Para una misma pieza, el PETG pesa cerca de un 22% más que el ABS. Si estás calculando cuánto rinde un rollo, usá la densidad del material que vas a imprimir y no un promedio.',
    },
    {
      q: '¿A cuánto pongo el ventilador según el material?',
      a: 'PLA agradece el ventilador al 100% desde la tercera capa. PETG anda mejor con un 50% y no conviene pasar de 60%. ABS y ASA piden cooling bajo —del 15% al 20%— y cámara cerrada, porque el aire les provoca grietas entre capas. TPU va con un 30% y velocidad baja. Demasiado aire arruina la adherencia entre capas en todos los materiales técnicos.',
    },
    {
      q: '¿Qué grosor de estaño uso para soldar la electrónica de la impresora?',
      a: 'Para cables medios de 14 a 20 AWG, estaño de 1,2 mm; para cables finos y conectores de la placa, de 0,8 a 1,0 mm; para SMD chico, 0,5 mm con flux extra. En terminales gruesas de fuente o cama caliente hace falta estaño de 1,5 a 2 mm y un soldador de 80 W o más, o la soldadura queda fría.',
    },
    {
      q: '¿Qué margen conviene aplicar sobre el costo?',
      a: 'Entre el 30% y el 50% para trabajos por encargo. Menos de 30% no alcanza a cubrir las impresiones fallidas, que en producción real rondan el 5% al 10% de los trabajos, ni el recambio de boquillas y placas. Para piezas de diseño propio o prototipos con revisiones, el margen sube al 80% o 100%.',
    },
    {
      q: '¿Por qué el slicer me da un tiempo distinto al de la calculadora?',
      a: 'Porque el slicer conoce la geometría exacta: aceleraciones, retracciones, capas con puentes, cambios de velocidad en perímetros externos y tiempos de calentamiento. Cualquier fórmula general trabaja con un área de capa promedio y un factor de eficiencia. Si tenés el número del slicer, usá ese para el tiempo y esta calculadora para la plata.',
    },
  ],

  sources: [
    {
      name: 'Materials — densidades y propiedades de filamentos (Prusa Knowledge Base)',
      url: 'https://help.prusa3d.com/materials',
      publisher: 'Prusa Research',
    },
    {
      name: 'PrusaSlicer — Infill, perímetros y estimación de material',
      url: 'https://help.prusa3d.com/article/infill_42/',
      publisher: 'Prusa Research',
    },
    {
      name: 'Hollowing and drainage holes — vaciado de piezas de resina',
      url: 'https://support.formlabs.com/s/article/Hollowing-Parts',
      publisher: 'Formlabs',
    },
    {
      name: 'Cooling — configuración del ventilador por material',
      url: 'https://help.prusa3d.com/article/cooling_133043',
      publisher: 'Prusa Research',
    },
    {
      name: 'Cuadro tarifario de energía eléctrica (precio del kWh)',
      url: 'https://www.argentina.gob.ar/enre/cuadros-tarifarios',
      publisher: 'ENRE',
    },
    {
      name: 'ASTM F2792 / ISO-ASTM 52900 — terminología de manufactura aditiva',
      url: 'https://www.iso.org/standard/74514.html',
      publisher: 'ISO',
      date: '2021',
    },
  ],

  replaces: [
    '/calculadora-costo-impresion-3d-pieza',
    '/calculadora-filamento-3d-necesario-modelo',
    '/calculadora-resin-3d-mililitros-pieza',
    '/calculadora-precio-hora-servicio-3d',
    '/calculadora-tiempo-impresion-3d-layer',
    '/calculadora-energia-electrica-impresion-3d',
    '/calculadora-peso-pla-abs-petg-volumen',
    '/calculadora-cooling-fan-3d-material',
    '/calculadora-filamento-soldador-mm2',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Parámetros por material.
 *  - dens: densidad en g/cm³ (la del calc peso-pla-abs-petg-volumen).
 *  - fan / capaMin: cooling recomendado y tiempo mínimo por capa.
 *  - resina: cambia el cálculo a mililitros y precio por litro.
 */
export const MATERIALES: Record<
  string,
  { nombre: string; dens: number; fan: number; capaMin: number; bridge: number; resina?: boolean; tip: string }
> = {
  pla: { nombre: 'PLA', dens: 1.24, fan: 100, capaMin: 5, bridge: 100, tip: 'PLA ama el cooling: ventilador al 100% desde la capa 3.' },
  petg: { nombre: 'PETG', dens: 1.27, fan: 50, capaMin: 8, bridge: 100, tip: 'PETG: cooling moderado, no pasar del 60%.' },
  abs: { nombre: 'ABS', dens: 1.04, fan: 15, capaMin: 12, bridge: 60, tip: 'ABS: cámara cerrada obligatoria y ventilador bajo.' },
  tpu: { nombre: 'TPU', dens: 1.2, fan: 30, capaMin: 8, bridge: 70, tip: 'TPU: ventilador moderado y velocidad baja, 25 mm/s.' },
  asa: { nombre: 'ASA', dens: 1.07, fan: 20, capaMin: 12, bridge: 60, tip: 'ASA: parecido al ABS, cámara cerrada recomendada.' },
  resina: { nombre: 'Resina', dens: 1.1, fan: 0, capaMin: 0, bridge: 0, resina: true, tip: 'Resina: sin ventilador. Dejá agujeros de drenaje si vaciás la pieza.' },
};

/** Constantes del cálculo. */
export const PARAMS = {
  /** Diámetro del filamento, en mm. */
  DIAMETRO: 1.75,
  /** Diámetro de boquilla estándar, en mm. */
  NOZZLE: 0.4,
  /** Factor de eficiencia del tiempo estimado por capa. */
  FACTOR_TIEMPO: 0.38,
  /** Desgaste de la máquina: 10% sobre material + luz. */
  DESGASTE: 0.1,
  /** Piso de volumen efectivo: perímetros y tapas van siempre. */
  PISO_PERIMETROS: 0.3,
};
