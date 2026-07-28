import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Puedo rodar hoy y cuánto me cuesta si me pillan?"
 *
 * Junta las tres cuentas de salir a la calle en Colombia: si el pico y placa te
 * deja circular, cuánto vale el permiso solidario si querés saltártelo legalmente,
 * y cuánto cuesta el comparendo si te pillan sin permiso.
 *
 * Constantes de multas: COLOMBIA_2026.multasTransito, ya indexadas por UVB
 * (art. 313 Ley 2294/2023, Circular MinTransporte 20264000000037). Desde 2026 las
 * multas NO se calculan en SMDLV: quien siga usando salarios mínimos diarios da
 * valores viejos.
 *
 * ⚠️ La asignación dígito → día de pico y placa ROTA cada semestre (a veces cada
 * mes) por decisión de cada Secretaría de Movilidad. El esquema de referencia de
 * abajo viene de la fórmula que este hub reemplaza, que ya lo marcaba como
 * referencial. NO es el calendario vigente garantizado y el hub lo dice en pantalla.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const MULTAS = COLOMBIA_2026.multasTransito;

/** Horario típico de la restricción en cada ciudad. ⚠️ Referencial: lo cambia cada Secretaría. */
export const HORARIOS: Record<string, string> = {
  bogota: '6:00 a. m. a 9:00 p. m.',
  medellin: '5:00 a. m. a 8:00 p. m.',
  cali: '6:00 a. m. a 7:00 p. m.',
};

/** ⚠️ Esquema de referencia: pares de dígitos restringidos por día. Rota cada semestre. */
export const RESTRICCION: Record<string, Record<string, number[]>> = {
  bogota: { lunes: [1, 2], martes: [3, 4], miercoles: [5, 6], jueves: [7, 8], viernes: [9, 0] },
  medellin: { lunes: [6, 9], martes: [5, 7], miercoles: [1, 8], jueves: [0, 2], viernes: [3, 4] },
  cali: { lunes: [1, 2], martes: [3, 4], miercoles: [5, 6], jueves: [7, 8], viernes: [9, 0] },
};

export const CIUDADES: Record<string, string> = { bogota: 'Bogotá', medellin: 'Medellín', cali: 'Cali' };

/**
 * Pico y Placa Solidario de Bogotá: tarifas base por período, y multiplicadores por
 * matrícula de fuera de Bogotá, avalúo del vehículo y categoría ambiental.
 * Valores heredados de la fórmula viva; ⚠️ los ajusta la Secretaría de Movilidad cada vigencia.
 */
export const SOLIDARIO = {
  base: { dia: 70_294, mes: 561_808, semestre: 2_809_311 },
  factorMatriculaFuera: 1.5,
};

/** Descripción corta de cada tipo de infracción, para que el usuario se ubique. */
export const TIPOS_INFRACCION = [
  { id: 'A', label: 'Tipo A — peatón o ciclista que incumple normas' },
  { id: 'B', label: 'Tipo B — estacionar mal, no llevar documentos' },
  { id: 'C', label: 'Tipo C — exceso de velocidad, semáforo en rojo, pico y placa, sin tecnomecánica' },
  { id: 'D', label: 'Tipo D — conducir sin licencia, transitar en contravía' },
  { id: 'E', label: 'Tipo E — conducir bajo efectos del alcohol' },
];

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/automotor/multas-y-pico-y-placa',
  title: 'Pico y placa y comparendos en Colombia: ¿puedo rodar hoy y cuánto me cuesta?',
  description:
    'Verificá si tu placa tiene pico y placa hoy en Bogotá, Medellín o Cali, cuánto vale el Pico y Placa Solidario y cuánto cuesta un comparendo tipo A a E con el descuento por pronto pago.',
  silo: 'Automotor',
  siloHref: '/co/automotor',
  locale: 'co',

  eyebrow: 'Colombia · movilidad · comparendos',
  h1: '¿Puedo sacar el carro hoy, y cuánto me cuesta si igual salgo?',
  lede:
    'Son tres decisiones encadenadas y conviene verlas juntas: si te toca pico y placa, si te conviene pagar el permiso solidario, y qué pasa si te arriesgás y te pillan. Salir en día de restricción es infracción tipo C, así que la comparación es directa: permiso contra multa.',
  stamps: [
    `Comparendo tipo C: ${cop(MULTAS.C)}`,
    'Multas indexadas por UVB · art. 313 Ley 2294 de 2023',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Lo que te cuesta la decisión de hoy',

  cases: {
    title: '¿Qué estás resolviendo?',
    intro:
      'Elegí tu situación. El hub compara siempre las dos rutas: lo que cuesta hacerlo bien y lo que cuesta que te pillen.',
    items: [
      {
        id: 'circular',
        label: 'Quiero saber si puedo circular hoy',
        hint: 'Pico y placa · Bogotá, Medellín o Cali',
        answer: 'Con tu último dígito y el día te decimos si podés salir y en qué horario rige la restricción.',
        yes: [
          'Último dígito de la placa contra el esquema del día en tu ciudad',
          'Horario de la restricción (fuera de ese rango podés circular sin problema)',
          'Sábados, domingos y festivos nacionales: sin pico y placa en las tres ciudades',
          `Lo que costaría el comparendo si salís igual: infracción tipo C, ${cop(MULTAS.C)}`,
        ],
        warn: [
          DISCLAIMER_TAX,
          '⚠️ La asignación de dígitos a días ROTA cada semestre, y a veces cada mes, por decisión de la Secretaría de Movilidad. El esquema de acá es de referencia: confirmá siempre en la fuente oficial de tu ciudad antes de salir',
          'Hay excepciones permanentes que no dependen del dígito: vehículos eléctricos, de personas con discapacidad, de emergencia y algunos servicios especiales',
          'En algunas ciudades el pico y placa cambia en temporada de alta contaminación o por medidas ambientales, y se vuelve más restrictivo sin aviso largo',
        ],
        plazo: 'los cambios de esquema suelen anunciarse con pocos días de anticipación: revisá antes de cada semestre.',
      },
      {
        id: 'solidario',
        label: 'Quiero pagar para poder circular en mi día',
        hint: 'Pico y Placa Solidario Bogotá',
        answer: 'El permiso te habilita a circular en tu día, y conviene si vas a usar el carro varias veces.',
        yes: [
          'Tarifa base según el período que compres: por día, por mes o por semestre',
          'Multiplicador si el vehículo está matriculado fuera de Bogotá',
          'Ajustes por avalúo del vehículo y por categoría ambiental',
          'Cuánto te sale cada día que efectivamente lo usás',
        ],
        warn: [
          DISCLAIMER_TAX,
          '⚠️ Las tarifas del solidario las fija la Secretaría de Movilidad y se ajustan cada vigencia: las de acá son referenciales y el campo queda editable',
          'El permiso habilita a circular en pico y placa, pero no te exime de ninguna otra norma: seguís expuesto a comparendos por velocidad, documentos o tecnomecánica',
          'Comprar por semestre casi siempre sale más barato por día que comprar por día, pero sólo si de verdad vas a usar el carro con esa frecuencia',
        ],
        plazo: 'el permiso se compra en línea y suele activarse el día hábil siguiente: no sirve para resolver una salida de último momento.',
      },
      {
        id: 'comparendo',
        label: 'Ya me pusieron un comparendo',
        hint: 'Art. 136 CNT · descuento del 50% o 25%',
        answer: 'Pagando rápido y haciendo el curso, el descuento llega al 50%. El reloj corre en días hábiles.',
        yes: [
          `Valor del comparendo según el tipo de infracción, de ${cop(MULTAS.A)} (tipo A) a ${cop(MULTAS.E)} (tipo E)`,
          `Descuento del ${(MULTAS.descuentoProntoPago50.porcentaje * 100).toFixed(0)}% pagando dentro de ${MULTAS.descuentoProntoPago50.plazoDiasHabiles} días hábiles (${MULTAS.descuentoProntoPago50.plazoDiasHabilesElectronico} si fue fotodetección) y haciendo el curso`,
          `Descuento del ${(MULTAS.descuentoProntoPago25.porcentaje * 100).toFixed(0)}% dentro de ${MULTAS.descuentoProntoPago25.plazoDiasHabiles} días hábiles (${MULTAS.descuentoProntoPago25.plazoDiasHabilesElectronico} en fotodetección), también con curso`,
          'Cuántos días hábiles te quedan antes de que el descuento baje o se caiga',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las multas tipo E, por conducir bajo efectos del alcohol, NO tienen descuento por pronto pago (Ley 1696 de 2013): se pagan completas y traen suspensión de licencia',
          'El descuento SÓLO aplica si hacés el curso sobre normas de tránsito: pagar rápido sin curso no te da rebaja',
          'Los plazos corren en días HÁBILES desde la orden de comparendo, y son más largos en fotodetección porque la notificación demora',
          'Un comparendo impago te bloquea el traspaso del vehículo y la renovación de la licencia',
        ],
        plazo: 'el plazo del 50% es el más corto y el más valioso: es el que hay que mirar el mismo día que te llega.',
      },
      {
        id: 'viaje',
        label: 'Voy a salir de viaje por carretera',
        hint: 'Peajes más combustible',
        answer: 'El pico y placa no aplica en carretera, pero el viaje tiene su propia cuenta.',
        yes: [
          'Combustible según la distancia y el rendimiento real de tu vehículo',
          'Peajes de la ruta, ida y vuelta si corresponde',
          'Costo total del viaje y costo por kilómetro',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Muchas ciudades aplican pico y placa regional de retorno en puentes festivos, restringiendo el ingreso por dígito y por franja horaria: la restricción no desaparece por estar viajando',
          'El rendimiento real en carretera suele ser mejor que en ciudad: usar el de ciudad te sobreestima el gasto',
        ],
        plazo: 'los operadores de peaje ajustan tarifas a comienzo de año: verificá antes de un viaje largo.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Cargá lo que corresponda a tu caso. Los campos que no aplican a la rama que elegiste se ignoran solos.',
  fields: [
    {
      id: 'ciudad',
      label: 'Ciudad',
      type: 'select',
      value: 'bogota',
      options: [
        { value: 'bogota', label: 'Bogotá' },
        { value: 'medellin', label: 'Medellín' },
        { value: 'cali', label: 'Cali' },
      ],
      help: 'Cada ciudad tiene su propio esquema y su propio horario.',
    },
    {
      id: 'digito',
      label: 'Último dígito de tu placa',
      type: 'number',
      value: 3,
      min: 0,
      max: 9,
      step: 1,
      help: 'El último número, no la letra.',
    },
    {
      id: 'dia',
      label: 'Día',
      type: 'select',
      value: 'lunes',
      options: [
        { value: 'lunes', label: 'Lunes' },
        { value: 'martes', label: 'Martes' },
        { value: 'miercoles', label: 'Miércoles' },
        { value: 'jueves', label: 'Jueves' },
        { value: 'viernes', label: 'Viernes' },
        { value: 'sabado', label: 'Sábado' },
        { value: 'domingo', label: 'Domingo' },
      ],
      help: 'Sábados, domingos y festivos nacionales no tienen pico y placa.',
    },
    {
      id: 'periodo',
      label: 'Período del permiso solidario',
      type: 'select',
      value: 'mes',
      options: [
        { value: 'dia', label: 'Un día' },
        { value: 'mes', label: 'Un mes' },
        { value: 'semestre', label: 'Un semestre' },
      ],
      help: 'Cuánto tiempo querés poder circular en tu día restringido.',
    },
    {
      id: 'diasUso',
      label: 'Días que vas a usar el carro en ese período',
      type: 'number',
      value: 20,
      min: 1,
      max: 200,
      step: 1,
      help: 'Sirve para calcular cuánto te sale cada día de uso real del permiso.',
    },
    {
      id: 'tipo',
      label: 'Tipo de infracción del comparendo',
      type: 'select',
      value: 'C',
      options: TIPOS_INFRACCION.map((t) => ({ value: t.id, label: t.label })),
      help: 'Figura en la orden de comparendo, junto al código de la infracción.',
    },
    {
      id: 'diasHabiles',
      label: 'Días hábiles desde el comparendo',
      type: 'number',
      value: 3,
      min: 0,
      max: 200,
      step: 1,
      help: 'Cero si te lo pusieron hoy. Cuentan días hábiles, no calendario.',
    },
    {
      id: 'curso',
      label: '¿Vas a hacer el curso de normas de tránsito?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
      help: 'Sin curso no hay descuento, por rápido que pagues.',
    },
    {
      id: 'notificacion',
      label: 'Cómo te notificaron',
      type: 'select',
      value: 'agente',
      options: [
        { value: 'agente', label: 'Agente en la vía' },
        { value: 'electronico', label: 'Fotodetección (cámara)' },
      ],
      help: 'La fotodetección tiene plazos más largos porque la notificación demora.',
    },
    {
      id: 'km',
      label: 'Distancia del viaje (km, sólo ida)',
      type: 'number',
      value: 0,
      min: 0,
      max: 5000,
      step: 1,
      help: 'Dejalo en cero si no vas a viajar.',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento del vehículo (km por galón)',
      type: 'number',
      value: 40,
      min: 1,
      max: 200,
      step: 1,
      help: 'El real, no el del folleto. En carretera suele ser mejor que en ciudad.',
    },
    {
      id: 'precioGalon',
      label: 'Precio del galón (COP)',
      prefix: '$',
      value: '16.500',
      thousands: true,
      help: 'El precio se mueve mes a mes y cambia por ciudad: poné el de tu estación.',
    },
    {
      id: 'peajes',
      label: 'Peajes de la ruta, sólo ida (COP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Suma de los peajes del trayecto de ida.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'bars',
    title: 'Cuánto cuesta cada camino',
    caption:
      'Compara lo que vale hacerlo bien (el permiso solidario, o pagar el comparendo con descuento) contra lo que vale que te pillen o que se te venza el plazo.',
  },
  breakdownTitle: 'La cuenta, línea por línea',
  breakdownIntro:
    'Primero si podés circular, después lo que cuesta el permiso o la multa, y al final la comparación entre las dos vías.',

  faq: [
    {
      q: '¿Cuánto vale una multa de tránsito en Colombia?',
      a: `Depende del tipo de infracción. Con los valores vigentes: tipo A ${cop(MULTAS.A)}, tipo B ${cop(MULTAS.B)}, tipo C ${cop(MULTAS.C)}, tipo D ${cop(MULTAS.D)} y tipo E ${cop(MULTAS.E)}. La mayoría de las infracciones frecuentes —exceso de velocidad, pasarse un semáforo, circular en pico y placa, no tener tecnomecánica— son tipo C.`,
    },
    {
      q: '¿Las multas todavía se calculan en salarios mínimos diarios?',
      a: 'No, y ese es un cambio reciente que confunde a mucha gente. Hasta 2025 el Código Nacional de Tránsito expresaba las multas en SMDLV. Desde 2026, por el art. 313 de la Ley 2294 de 2023, se indexan por UVB, la Unidad de Valor Básico. Cualquier calculadora o tabla que siga multiplicando salarios mínimos diarios está dando valores de un régimen que ya no rige.',
    },
    {
      q: '¿Cómo consigo el descuento del 50% en un comparendo?',
      a: `Pagando dentro de los ${MULTAS.descuentoProntoPago50.plazoDiasHabiles} días hábiles siguientes a la orden de comparendo —${MULTAS.descuentoProntoPago50.plazoDiasHabilesElectronico} días hábiles si fue por fotodetección— y asistiendo al curso sobre normas de tránsito. Las dos cosas: el curso no es opcional. Si se te pasa ese plazo pero pagás dentro de ${MULTAS.descuentoProntoPago25.plazoDiasHabiles} días hábiles (${MULTAS.descuentoProntoPago25.plazoDiasHabilesElectronico} en fotodetección), el descuento baja al ${(MULTAS.descuentoProntoPago25.porcentaje * 100).toFixed(0)}%. Después de eso, se paga el 100%.`,
    },
    {
      q: '¿Por qué mi comparendo no tiene descuento?',
      a: 'Hay dos razones posibles. Una: es tipo E, por conducir bajo efectos del alcohol, y la Ley 1696 de 2013 le quitó expresamente el beneficio del pronto pago. La otra: no vas a hacer el curso, y sin curso el descuento no existe. También puede ser que ya se te haya vencido el plazo de días hábiles.',
    },
    {
      q: '¿Cuánto cuesta circular en pico y placa si me pillan?',
      a: `Transitar en restricción de pico y placa es infracción tipo C: ${cop(MULTAS.C)}, más inmovilización del vehículo con el costo de grúa y patios, que va aparte y suele ser lo más caro del incidente. Comparado con eso, el permiso solidario casi siempre sale mejor si vas a necesitar el carro más de un par de veces.`,
    },
    {
      q: '¿Qué es el Pico y Placa Solidario?',
      a: 'Es un permiso que vende la Secretaría de Movilidad de Bogotá y que te habilita a circular en tu día de restricción a cambio de una tarifa. Se puede comprar por día, por mes o por semestre, y el precio se ajusta por el avalúo del vehículo, su categoría ambiental y si está matriculado fuera de Bogotá. La plata se destina a proyectos de movilidad. No te exime de ninguna otra norma de tránsito.',
    },
    {
      q: '¿Cada cuánto cambia el esquema de pico y placa?',
      a: 'La asignación de dígitos a días rota cada semestre en Bogotá, y en algunas ciudades con más frecuencia. Los horarios también se modifican, y en episodios de mala calidad del aire pueden endurecerse de un día para el otro. Por eso ninguna tabla estática es confiable por mucho tiempo: la fuente que manda es la Secretaría de Movilidad de tu ciudad.',
    },
    {
      q: '¿Hay pico y placa los sábados, domingos y festivos?',
      a: 'En Bogotá, Medellín y Cali no hay pico y placa para vehículos particulares los fines de semana ni los festivos nacionales. Eso es estable y no rota. Lo que sí aparece en puentes festivos es el pico y placa regional de retorno, que restringe el ingreso a la ciudad por último dígito en determinadas franjas horarias del último día del puente.',
    },
    {
      q: '¿Los carros eléctricos tienen pico y placa?',
      a: 'No: los vehículos eléctricos están exentos de la restricción en las principales ciudades, como incentivo a la renovación del parque automotor. Los híbridos tienen tratamiento variable según la ciudad y la categoría ambiental, así que ahí sí hay que verificar. Además, los eléctricos pagan impuesto de vehículos con tarifa reducida, que es un ahorro aparte y anual.',
    },
    {
      q: '¿Qué pasa si no pago un comparendo?',
      a: 'Se acumulan intereses de mora y el comparendo queda en el RUNT. Con eso no podés traspasar el vehículo, renovar la licencia de conducción ni salir del país en algunos casos de acuerdos de pago incumplidos. Pasado un tiempo la deuda entra en cobro coactivo, con embargo posible. Y si eran varias infracciones, la suspensión de la licencia entra en juego.',
    },
    {
      q: '¿Puedo impugnar un comparendo?',
      a: 'Sí, pero con un costo: impugnar te hace perder el descuento por pronto pago, porque el plazo del 50% sigue corriendo mientras discutís. Tiene sentido cuando hay un error claro —placa mal leída, vehículo que no estaba ahí, fotodetección sin evidencia suficiente— y no tanto cuando la infracción existió. La audiencia se solicita ante la autoridad de tránsito que impuso el comparendo, dentro de los plazos que fija el art. 136 del Código Nacional de Tránsito.',
    },
  ],

  sources: [
    {
      name: 'Ley 769 de 2002 — Código Nacional de Tránsito, art. 136 (reducción de la sanción)',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=5557',
      publisher: 'Función Pública',
    },
    {
      name: 'Ley 2294 de 2023, art. 313 — Unidad de Valor Básico (UVB)',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=213802',
      publisher: 'Función Pública',
    },
    {
      name: 'Ley 1696 de 2013 — conducción bajo el influjo del alcohol',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=56347',
      publisher: 'Función Pública',
    },
    {
      name: 'Secretaría Distrital de Movilidad de Bogotá — pico y placa y Pico y Placa Solidario',
      url: 'https://www.movilidadbogota.gov.co/web/pico_y_placa',
      publisher: 'Alcaldía Mayor de Bogotá',
    },
    {
      name: 'Secretaría de Movilidad de Medellín — pico y placa',
      url: 'https://www.medellin.gov.co/es/secretaria-movilidad/pico-y-placa/',
      publisher: 'Alcaldía de Medellín',
    },
    {
      name: 'Ministerio de Transporte — normativa y circulares de tránsito',
      url: 'https://www.mintransporte.gov.co/',
      publisher: 'Ministerio de Transporte',
    },
  ],

  replaces: [
    '/co/calculadora-comparendos-transito-colombia-2026',
    '/co/calculadora-pico-y-placa-hoy-colombia-bogota-medellin-cali',
    '/co/calculadora-pico-placa-solidario-bogota-2026',
    '/co/calculadora-peajes-combustible-ruta-colombia-2026',
  ],

  lastReviewed: '2026-07-28',
};
