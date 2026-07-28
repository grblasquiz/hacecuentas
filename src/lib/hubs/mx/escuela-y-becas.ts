import type { HubData } from '../types';

/**
 * Hub de decisión MX — "¿Cuánto cuesta la escuela y qué beca me toca?"
 *
 * Fusiona el costo de una carrera en universidad privada (con beca y crédito
 * educativo), el gasto de regreso a clases por alumno, el monto de las becas
 * Rita Cetina y Benito Juárez, el apoyo de posgrado Elisa Acuña y el promedio de
 * calificaciones en la escala SEP.
 *
 * Los montos de beca son DATOS EDITABLES con valor de referencia, no constantes
 * de ley: cada convocatoria los actualiza. Los costos de regreso a clases y las
 * colegiaturas son precios de mercado copiados de las fórmulas originales.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/**
 * Universidad privada —
 * src/lib/formulas/mensualidad-universidad-privada-mexico-tec-uvm-anahuac.ts
 */
export const UNIVERSIDAD_MX = {
  mesesPorCuatrimestre: 3,
  /** Rango de costo POR CUATRIMESTRE por institución (referencias de mercado 2026). */
  rangos: {
    tec: { min: 45000, max: 65000 },
    uvm: { min: 15000, max: 25000 },
    anahuac: { min: 40000, max: 60000 },
    itam: { min: 30000, max: 40000 },
    otras: { min: 18000, max: 45000 },
  } as Record<string, { min: number; max: number }>,
};

/**
 * Gasto de regreso a clases por alumno, MXN —
 * src/lib/formulas/gasto-regreso-clases-2026-mexico.ts
 * Orden: [útiles, uniformes, mochila y calzado, cuotas o inscripción].
 * Promedios de sondeos Profeco / ANPEC: son precios de mercado, cambian.
 */
export const REGRESO_CLASES_MX = {
  costos: {
    publica: {
      preescolar: [450, 1100, 900, 300],
      primaria: [600, 1300, 1000, 400],
      secundaria: [900, 1500, 1100, 500],
      prepa: [1100, 1600, 1200, 600],
    },
    privada: {
      preescolar: [2000, 2500, 1400, 5000],
      primaria: [3000, 2800, 1600, 6500],
      secundaria: [4000, 3200, 1800, 8000],
      prepa: [4800, 3500, 2000, 10000],
    },
  } as Record<string, Record<string, number[]>>,
  nivelLabel: {
    preescolar: 'preescolar',
    primaria: 'primaria',
    secundaria: 'secundaria',
    prepa: 'prepa o bachillerato',
  } as Record<string, string>,
};

/**
 * Becas para el Bienestar —
 * src/lib/formulas/beca-rita-cetina-benito-juarez-monto-mexico.ts
 * La dispersión es bimestral y el ciclo escolar tiene alrededor de 5 bimestres.
 */
export const BECAS_BIENESTAR_MX = {
  bimestresCiclo: 5,
};

/**
 * Beca de posgrado Elisa Acuña —
 * src/lib/formulas/becas-elisa-acuna-conahcyt-mexico-monto.ts
 * Montos base mensuales por nivel, ajuste por país de destino y factor por
 * categoría del programa en el padrón.
 */
export const POSGRADO_MX = {
  montoBase: {
    maestria_nacional: 15000,
    maestria_extranjero: 15000,
    doctorado_nacional: 22000,
    doctorado_extranjero: 22000,
    especialidad_medica: 18000,
  } as Record<string, number>,
  ajustePais: {
    mexico: 1.0,
    usa_canada: 1.25,
    europa_oecd: 1.2,
    latinoamerica: 1.1,
    otros: 1.15,
  } as Record<string, number>,
  factorPadron: {
    consolidado: 1.0,
    competencia: 0.93,
    desarrollo: 0.85,
    no_evaluado: 0.7,
  } as Record<string, number>,
};

/** Escala SEP: la boleta va de 5 a 10 y se acredita con 6 (Acuerdo SEP 10/09/23). */
export const SEP_ESCALA = { min: 5, max: 10, aprobatoria: 6 };

export const hub: HubData = {
  slug: 'mx/vida/escuela-y-becas',
  title: 'Cuánto cuesta la escuela en México y qué beca te toca: colegiaturas, útiles y apoyos',
  description:
    'Calcula el costo total de una carrera en universidad privada con beca y crédito educativo, el gasto de regreso a clases por alumno, el monto de las becas Rita Cetina y Benito Juárez, el apoyo de posgrado Elisa Acuña y tu promedio en la escala SEP.',
  silo: 'Vida',
  siloHref: '/mx/vida',

  eyebrow: 'México · educación y becas',
  h1: '¿Cuánto cuesta la escuela y qué beca me toca?',
  lede:
    'La colegiatura es solo una parte: útiles, uniformes, inscripción y transporte se suman cada ciclo, y del otro lado hay becas que casi nadie calcula bien. Pon tu caso y te decimos cuánto vas a pagar, cuánto te devuelve la beca y qué promedio necesitas para conservarla.',
  stamps: [
    'Costo total de carrera con beca y crédito',
    'Gasto de regreso a clases por alumno',
    'Becas Rita Cetina, Benito Juárez y Elisa Acuña',
    '5 calculadoras fusionadas',
  ],

  resultLabel: 'Tu resultado',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro:
      'Empezamos por la universidad privada, que es la decisión de dinero más grande de toda la trayectoria escolar.',
    items: [
      {
        id: 'universidad',
        label: 'Universidad privada',
        hint: 'Costo total de la carrera, cuánto cubre la beca y qué pasa si la financias con crédito.',
        yes: [
          'Costo total de la carrera sin beca y con beca',
          'Costo por cuatrimestre',
          'Monto financiado, cuota mensual e intereses totales del crédito educativo',
          'Costo final de la carrera una vez pagado el crédito',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El cálculo cubre colegiaturas: quedan fuera inscripción, materiales, seguro escolar, titulación y transporte, que suman bastante en cuatro años',
          'Las becas de mérito suelen exigir un promedio mínimo cada periodo: si lo pierdes, la beca baja o se cae y el costo se dispara a mitad de carrera',
          'Los intereses del crédito educativo pueden sumar una parte importante del total: mira siempre el costo final, no solo la cuota mensual',
          'Las colegiaturas privadas se actualizan cada año, así que el costo real de una carrera larga es mayor que el de multiplicar la mensualidad de hoy',
        ],
        plazo: 'las convocatorias de beca de mérito suelen cerrar meses antes del inicio del ciclo.',
        answer:
          'El costo de la carrera es la mensualidad por los meses totales; la beca lo reduce en proporción y el crédito lo aumenta por los intereses.',
      },
      {
        id: 'regreso',
        label: 'Regreso a clases',
        hint: 'Útiles, uniformes, mochila, calzado y cuotas por alumno y por nivel.',
        yes: [
          'Presupuesto total del regreso a clases y costo por alumno',
          'Desglose entre útiles, uniformes, mochila y calzado, y cuotas',
          'Diferencia entre escuela pública y privada',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La lista de útiles es la parte barata: uniformes, calzado y cuotas son lo que multiplica el gasto',
          'Las cuotas escolares en escuela pública son voluntarias por ley: no pueden condicionar la inscripción ni la entrega de documentos',
          'Son promedios de sondeos de precios: en escuelas privadas la inscripción varía enormemente entre instituciones',
        ],
        plazo: 'comprar antes del pico de agosto y comparar precios suele ahorrar una porción apreciable del gasto.',
        answer:
          'El gasto por alumno suma útiles, uniformes, mochila y calzado, y cuotas, y cambia sobre todo por el nivel y por si la escuela es pública o privada.',
      },
      {
        id: 'becas',
        label: 'Becas Rita Cetina y Benito Juárez',
        hint: 'Monto bimestral y del ciclo escolar según el número de estudiantes.',
        yes: [
          'Monto bimestral del programa según el número de estudiantes',
          'Equivalente mensual promedio',
          'Estimación de lo que se cobra en todo el ciclo escolar',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los montos son datos editables con valor de referencia, no constantes de ley: cada convocatoria los actualiza y hay que confirmarlos en el portal oficial',
          'Rita Cetina paga un monto base por familia más un adicional por cada estudiante extra; Benito Juárez paga por estudiante',
          'El pago se dispersa por bimestre durante el ciclo escolar, no los doce meses del año',
          'El registro se abre por convocatoria y es gratuito: no hay gestores ni intermediarios',
        ],
        plazo: 'la dispersión es bimestral y solo durante el ciclo escolar.',
        answer:
          'El monto bimestral depende del programa y del número de estudiantes; multiplicado por los bimestres del ciclo da el total del año escolar.',
      },
      {
        id: 'posgrado',
        label: 'Beca de posgrado Elisa Acuña',
        hint: 'Apoyo mensual de maestría, doctorado o especialidad, en México o en el extranjero.',
        yes: [
          'Apoyo mensual estimado según nivel, destino y categoría del programa',
          'Total anual y total de toda la beca según la duración',
          'Efecto de la categoría del programa en el padrón sobre el monto',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los montos y los factores de ajuste son referencias de convocatoria: cada convocatoria anual los actualiza y hay que verificarlos en el portal oficial',
          'La beca exige tener el CVU activo e inscripción en un programa reconocido; si el programa no está evaluado, hay que solicitar su inclusión',
          'Una duración superior a cuatro años requiere evaluación especial y no se aprueba de forma automática',
          'El ajuste por país de destino es un promedio: el apoyo real para el extranjero depende del costo de vida del país y de la convocatoria específica',
        ],
        plazo: 'las convocatorias de posgrado abren y cierran en fechas fijas del año: perder la ventana significa esperar al siguiente ciclo.',
        answer:
          'El apoyo mensual sale del monto base del nivel, ajustado por el país de destino y por la categoría del programa en el padrón.',
      },
      {
        id: 'promedio',
        label: 'Mi promedio de calificaciones',
        hint: 'Promedio ponderado en la escala SEP y qué necesitas en la siguiente evaluación.',
        yes: [
          'Promedio ponderado en la escala de 5 a 10',
          'Si vas aprobando la mínima de 6',
          'Qué calificación necesitas en la próxima evaluación para cerrar aprobado',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La boleta de primaria y secundaria se califica de 5 a 10 y se acredita con un promedio final mínimo de 6 por asignatura',
          'Si la calificación necesaria en la próxima evaluación sale por encima de 10, ya no alcanza con una sola evaluación: toca regularización o examen extraordinario',
          'Muchas becas de mérito exigen un promedio superior al mínimo aprobatorio: revisa el requisito de la tuya, no el de la SEP',
        ],
        plazo: 'revisa el promedio antes del cierre de cada periodo, cuando todavía hay margen de recuperación.',
        answer:
          'El promedio ponderado se calcula con el peso de cada evaluación; a partir de él se deduce cuánto necesitas en la siguiente para llegar al 6.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Cada rama usa solo los campos que le corresponden: llena los tuyos y deja el resto en su valor de ejemplo.',
  fields: [
    {
      id: 'universidad',
      label: 'Universidad',
      type: 'select',
      value: 'tec',
      options: [
        { value: 'tec', label: 'Tec de Monterrey' },
        { value: 'uvm', label: 'UVM' },
        { value: 'anahuac', label: 'Anáhuac' },
        { value: 'itam', label: 'ITAM' },
        { value: 'otras', label: 'Otra institución privada' },
      ],
      help: 'Solo se usa para mostrar el rango de referencia del mercado.',
    },
    {
      id: 'cuatrimestres',
      label: 'Duración de la carrera (cuatrimestres)',
      type: 'number',
      value: 12,
      min: 1,
      max: 40,
      step: 1,
      help: 'Cada cuatrimestre se cuenta como tres mensualidades.',
    },
    {
      id: 'mensualidad',
      label: 'Mensualidad estimada ($)',
      type: 'number',
      value: 15000,
      min: 0,
      step: 500,
      prefix: '$',
      thousands: true,
      help: 'La que te cotizaron, sin inscripción ni materiales.',
    },
    {
      id: 'pctBeca',
      label: 'Porcentaje de beca (%)',
      type: 'number',
      value: 0,
      min: 0,
      max: 100,
      step: 5,
      suffix: '%',
      help: 'El descuento sobre la colegiatura que te otorgaron.',
    },
    {
      id: 'usoCredito',
      label: '¿Vas a usar crédito educativo?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Si eliges que sí, se calculan cuota, intereses y costo final.',
    },
    {
      id: 'tasaCredito',
      label: 'Tasa anual del crédito (%)',
      type: 'number',
      value: 10,
      min: 0,
      max: 100,
      step: 0.5,
      suffix: '%',
      help: 'Pídele al banco la tasa fija anual, no la mensual.',
    },
    {
      id: 'coberturaCredito',
      label: 'Cobertura del crédito (%)',
      type: 'number',
      value: 50,
      min: 0,
      max: 100,
      step: 5,
      suffix: '%',
      help: 'Qué parte del costo con beca vas a financiar.',
    },
    {
      id: 'plazoMeses',
      label: 'Plazo de pago del crédito (meses)',
      type: 'number',
      value: 60,
      min: 1,
      max: 360,
      step: 6,
      help: 'A mayor plazo, cuota menor pero más intereses totales.',
    },
    {
      id: 'hijos',
      label: 'Alumnos que entran a clases',
      type: 'number',
      value: 1,
      min: 1,
      max: 10,
      step: 1,
      help: 'Se multiplica el costo por alumno.',
    },
    {
      id: 'nivel',
      label: 'Nivel escolar',
      type: 'select',
      value: 'primaria',
      options: [
        { value: 'preescolar', label: 'Preescolar' },
        { value: 'primaria', label: 'Primaria' },
        { value: 'secundaria', label: 'Secundaria' },
        { value: 'prepa', label: 'Prepa o bachillerato' },
      ],
      help: 'El gasto sube con el nivel.',
    },
    {
      id: 'tipoEscuela',
      label: 'Tipo de escuela',
      type: 'select',
      value: 'publica',
      options: [
        { value: 'publica', label: 'Pública' },
        { value: 'privada', label: 'Privada' },
      ],
      help: 'La diferencia más grande está en las cuotas de inscripción.',
    },
    {
      id: 'incluyeUniformes',
      label: '¿Hay que comprar uniformes?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No, ya los tiene' },
      ],
      help: 'Si se heredan del ciclo anterior, el gasto baja bastante.',
    },
    {
      id: 'programaBeca',
      label: 'Programa de beca',
      type: 'select',
      value: 'rita-cetina',
      options: [
        { value: 'rita-cetina', label: 'Rita Cetina (secundaria)' },
        { value: 'benito-juarez', label: 'Benito Juárez (media superior)' },
      ],
      help: 'Rita Cetina paga por familia; Benito Juárez, por estudiante.',
    },
    {
      id: 'numEstudiantes',
      label: 'Estudiantes inscritos en ese nivel',
      type: 'number',
      value: 2,
      min: 1,
      max: 15,
      step: 1,
      help: 'Los que están en el nivel que cubre el programa elegido.',
    },
    {
      id: 'montoBaseBimestral',
      label: 'Monto base bimestral del programa ($)',
      type: 'number',
      value: 1900,
      min: 0,
      step: 50,
      prefix: '$',
      thousands: true,
      help: 'Dato editable: confirma el monto vigente en el portal oficial.',
    },
    {
      id: 'montoAdicional',
      label: 'Adicional por estudiante extra ($)',
      type: 'number',
      value: 700,
      min: 0,
      step: 50,
      prefix: '$',
      help: 'Solo aplica en Rita Cetina.',
    },
    {
      id: 'nivelPosgrado',
      label: 'Nivel de posgrado',
      type: 'select',
      value: 'maestria_nacional',
      options: [
        { value: 'maestria_nacional', label: 'Maestría en México' },
        { value: 'maestria_extranjero', label: 'Maestría en el extranjero' },
        { value: 'doctorado_nacional', label: 'Doctorado en México' },
        { value: 'doctorado_extranjero', label: 'Doctorado en el extranjero' },
        { value: 'especialidad_medica', label: 'Especialidad médica' },
      ],
      help: 'Define el monto base mensual.',
    },
    {
      id: 'duracionMeses',
      label: 'Duración del posgrado (meses)',
      type: 'number',
      value: 24,
      min: 1,
      max: 96,
      step: 1,
      help: 'Más de 48 meses requiere evaluación especial.',
    },
    {
      id: 'paisDestino',
      label: 'País de destino',
      type: 'select',
      value: 'mexico',
      options: [
        { value: 'mexico', label: 'México' },
        { value: 'usa_canada', label: 'Estados Unidos o Canadá' },
        { value: 'europa_oecd', label: 'Europa' },
        { value: 'latinoamerica', label: 'Latinoamérica' },
        { value: 'otros', label: 'Otro destino' },
      ],
      help: 'El apoyo en el extranjero se ajusta por costo de vida.',
    },
    {
      id: 'categoriaPadron',
      label: 'Categoría del programa en el padrón',
      type: 'select',
      value: 'consolidado',
      options: [
        { value: 'consolidado', label: 'Consolidado o de competencia internacional' },
        { value: 'competencia', label: 'En consolidación' },
        { value: 'desarrollo', label: 'En desarrollo' },
        { value: 'no_evaluado', label: 'No evaluado' },
      ],
      help: 'Si no está evaluado hay que pedir su inclusión y el monto baja.',
    },
    {
      id: 'calificaciones',
      label: 'Tus calificaciones',
      type: 'text',
      value: '7.5; 8; 6.4',
      help: 'Sepáralas con punto y coma. Escala SEP de 5 a 10.',
    },
    {
      id: 'pesos',
      label: 'Peso de cada calificación',
      type: 'text',
      value: '',
      help: 'Opcional. Déjalo vacío para que todas pesen igual.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'Composición del resultado',
    caption:
      'Según la rama, el gráfico reparte el costo de la carrera entre lo que pagas y lo que cubre la beca, el gasto escolar entre sus cuatro rubros, o el apoyo entre sus componentes.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto cuesta una carrera en universidad privada en México?',
      a: 'La diferencia entre instituciones es enorme: las más caras cobran por cuatrimestre varias veces lo que cobran las más accesibles, y a lo largo de una carrera de cuatro años esa brecha se convierte en millones de pesos. La cifra que conviene mirar no es la mensualidad sino el costo total del programa completo.',
    },
    {
      q: '¿Qué gastos de la universidad no aparecen en la colegiatura?',
      a: 'La inscripción o reinscripción de cada periodo, los materiales y libros, el seguro escolar, las prácticas y el proceso de titulación, además del transporte o la vivienda si estudias fuera de tu ciudad. En conjunto pueden sumar una porción significativa del costo de la carrera.',
    },
    {
      q: '¿Conviene un crédito educativo?',
      a: 'Depende de dos cosas: la tasa y el plazo. Un plazo largo baja la cuota mensual pero infla los intereses totales, así que el número que hay que comparar entre ofertas es el costo final de la carrera ya pagada, no la mensualidad. Antes de firmar conviene agotar las becas de mérito y de necesidad de la propia institución.',
    },
    {
      q: '¿Qué pasa si pierdo la beca de mérito a mitad de la carrera?',
      a: 'El costo se dispara justo cuando cambiar de universidad es más caro en tiempo y en créditos revalidados. Casi todas las becas de mérito exigen sostener un promedio mínimo cada periodo, así que conviene conocer ese umbral desde el primer día y no descubrirlo cuando ya se perdió.',
    },
    {
      q: '¿Cuánto se gasta en el regreso a clases?',
      a: 'La lista de útiles es la parte barata del asunto. Lo que multiplica el gasto son los uniformes, el calzado y las cuotas de inscripción, y ahí es donde se abre la brecha entre escuela pública y privada. El costo también sube de forma clara conforme se avanza de preescolar a bachillerato.',
    },
    {
      q: '¿Las cuotas escolares en escuela pública son obligatorias?',
      a: 'No. En la educación pública las cuotas son voluntarias y no pueden condicionar la inscripción, la entrega de documentos ni el acceso a clases. Si en tu escuela lo hacen, es una práctica denunciable ante la autoridad educativa.',
    },
    {
      q: '¿Cuál es la diferencia entre la beca Rita Cetina y la Benito Juárez?',
      a: 'Rita Cetina está dirigida a la educación básica y paga un monto base por familia más un adicional por cada estudiante extra inscrito, mientras que Benito Juárez cubre la media superior y paga un monto por cada estudiante. Ambas se dispersan por bimestre durante el ciclo escolar.',
    },
    {
      q: '¿Por qué el monto de la beca aparece como campo editable?',
      a: 'Porque no es una constante de ley: cada convocatoria lo actualiza y publicarlo fijo llevaría a que la herramienta muestre una cifra vieja sin avisar. El valor por defecto es una referencia; el monto vigente hay que confirmarlo en el portal oficial del programa.',
    },
    {
      q: '¿Cuánto paga la beca de posgrado Elisa Acuña?',
      a: 'El monto mensual parte del nivel de estudios (maestría, doctorado o especialidad médica), se ajusta hacia arriba si el posgrado es en el extranjero por el costo de vida del destino, y se multiplica por un factor según la categoría del programa en el padrón. Un programa no evaluado recibe un porcentaje menor del máximo.',
    },
    {
      q: '¿Qué pasa si mi programa de posgrado no está en el padrón?',
      a: 'El apoyo se calcula en un porcentaje reducido del máximo y hay que solicitar la inclusión del programa al padrón. Si esa inclusión prospera, el monto sube. Conviene confirmarlo antes de aceptar la plaza, porque cambia bastante el ingreso mensual de varios años.',
    },
    {
      q: '¿Cómo funciona la escala de calificaciones de la SEP?',
      a: 'En primaria y secundaria la boleta va de 5 a 10 y se acredita con un promedio final mínimo de 6 por asignatura. En media superior la mínima aprobatoria también es 6. Por eso una calificación por debajo de 5 no existe en la boleta: el piso de la escala es el propio 5.',
    },
    {
      q: '¿Cómo sé qué calificación necesito para pasar?',
      a: 'Se despeja a partir del promedio ponderado que ya llevas y del peso de la evaluación que falta. Si el resultado sale por encima de 10, ya no alcanza con una sola evaluación y corresponde regularización o examen extraordinario; si sale en cero o negativo, el promedio ya está asegurado.',
    },
  ],

  sources: [
    {
      name: 'Becas para el Bienestar Benito Juárez',
      url: 'https://www.gob.mx/becasbenitojuarez',
      publisher: 'Coordinación Nacional de Becas para el Bienestar Benito Juárez',
    },
    {
      name: 'Beca Rita Cetina Gutiérrez',
      url: 'https://becaritacetina.becasbenitojuarez.gob.mx/',
      publisher: 'Gobierno de México',
    },
    {
      name: 'Secretaría de Ciencia, Humanidades, Tecnología e Innovación — becas de posgrado',
      url: 'https://secihti.mx/',
      publisher: 'SECIHTI',
    },
    {
      name: 'SEP — normas de control escolar y evaluación',
      url: 'https://www.gob.mx/sep',
      publisher: 'Secretaría de Educación Pública',
    },
    {
      name: 'PROFECO — Feria de Regreso a Clases y monitoreo de precios de útiles',
      url: 'https://www.gob.mx/profeco',
      publisher: 'Procuraduría Federal del Consumidor',
    },
  ],

  replaces: [
    '/calculadora-mensualidad-universidad-privada-mexico-tec-uvm-anahuac',
    '/calculadora-promedio-calificaciones-sep-mexico',
    '/calculadora-gasto-regreso-clases-2026-mexico',
    '/calculadora-beca-rita-cetina-benito-juarez-monto-mexico',
    '/calculadora-becas-elisa-acuna-conahcyt-mexico-monto',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
