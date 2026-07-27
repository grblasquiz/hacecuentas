import type { HubData } from './types';
import { AUH_JUL_2026 } from '../data/argentina-2026';

/**
 * Hub de decisión — "AUH y asignaciones familiares: ¿cuánto cobro?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cinco ramas, que son las cinco puertas
 * reales por las que ANSES paga por un hijo: AUH (sin trabajo registrado),
 * SUAF (trabajo en blanco o monotributo), el 20% retenido de la Libreta, la
 * ayuda escolar anual y el paquete de embarazo/lactancia.
 *
 * SILO: /familia, que ya existe con index propio y dos hubs hermanos (cuota
 * alimentaria y herencia). No se crea un silo /anses nuevo: tendría un solo
 * hub y sería un índice fino, mientras que /familia gana un tercer hub y las
 * asignaciones son, en el catálogo, categoría "familia".
 *
 * DE DÓNDE SALEN LOS NÚMEROS:
 *  · AUH general y el 20% retenido: `AUH_JUL_2026` de src/lib/data/argentina-2026.ts
 *    — es el único dato de este grupo con fuente y fecha de verificación
 *    escritas (ANSES, movilidad +1,89% = IPC junio; valor vigente ago-2026).
 *    NO se hardcodea acá: si se actualiza ese archivo, el hub cambia solo.
 *  · AUH por hijo con discapacidad, tope de ingreso por integrante y bono:
 *    espejo de src/lib/formulas/asignacion-universal-hijo-auh-2026-monto.ts
 *  · Tramos SUAF (IGF y monto por hijo): espejo de
 *    src/lib/formulas/asignacion-familiar-anses-2026-tramos-ingreso.ts y
 *    src/lib/formulas/asignacion-familiar-empleado-registrado-anses.ts
 *    (las dos fórmulas coinciden en los cuatro tramos, jun-2026).
 *  · Complemento Leche: espejo de src/lib/formulas/anses-complemento-leche-maternidad.ts
 *  · AYUDA ESCOLAR: ver el comentario sobre la discrepancia, más abajo.
 */

export const ASIGNACIONES = {
  /** AUH bruta por hijo sin discapacidad. Fuente única del repo. */
  auhGeneral: AUH_JUL_2026.montoGeneral,
  /** Se acredita el 80% y se retiene el 20% hasta presentar la Libreta AUH. */
  pctRetenido: AUH_JUL_2026.pctRetenido,
  /** AUH por hijo con CUD (sin tope de cantidad). */
  auhDiscapacidad: 491173,
  /** Tope de ingreso por integrante del grupo familiar para acceder a la AUH. */
  topePorIntegrante: 952110,
  /** Tope de hijos que paga la AUH general (los hijos con CUD no tienen tope). */
  maxHijosGeneral: 5,
  /** Bono de refuerzo por hijo, cuando ANSES lo activa. Sin retención del 20%. */
  bonoRefuerzo: 70000,
  /**
   * Ayuda escolar anual por hijo, pago único al inicio del ciclo lectivo.
   * OJO — DISCREPANCIA EN EL REPO: la fórmula de tramos la tiene en $85.000
   * (jun-2026) y la calculadora suelta de ayuda escolar en $65.000, sin fecha.
   * Se toma el valor más alto y más reciente de los dos, que es el que trae
   * fecha de verificación. Se actualiza en marzo de cada ciclo lectivo.
   */
  ayudaEscolar: 85000,
  /** Complemento Leche: embarazo, lactancia o hijo menor de 5 años. */
  complementoLeche: 55841,
  /** Tramos SUAF por ingreso del grupo familiar (IGF). */
  tramos: [
    { limite: 1122074, tramo: 1, asignacion: 72474 },
    { limite: 1645630, tramo: 2, asignacion: 48888 },
    { limite: 1899934, tramo: 3, asignacion: 29570 },
    { limite: 5941936, tramo: 4, asignacion: 15257 },
  ],
  /** Tope de IGF por encima del cual no corresponde la asignación general. */
  topeIgf: 5941936,
};

export const CASE_MATH = ASIGNACIONES;

const fmtArs = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

/** Texto del disclaimer YMYL (getCalculatorDisclaimer, dominio 'general'). */
const DISCLAIMER =
  'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.';

export const hub: HubData = {
  slug: 'familia/asignaciones-anses',
  title: 'AUH y asignaciones familiares: ¿cuánto cobro? — Montos, tramos y el 20% de la Libreta',
  description:
    'Cuánto paga ANSES por hijo según tu situación: AUH si no tenés trabajo registrado, asignación familiar por tramo de ingreso si estás en blanco, el 20% retenido que se libera con la Libreta, la ayuda escolar y el Complemento Leche.',
  silo: 'Familia',
  siloHref: '/familia',

  eyebrow: 'Guía ANSES · asignaciones',
  h1: 'AUH y asignaciones familiares: ¿cuánto cobro?',
  lede:
    'ANSES paga por un hijo de formas distintas y por ventanillas distintas, y de ahí viene casi toda la confusión: si no tenés trabajo registrado cobrás AUH y te retienen el 20% hasta que presentás la Libreta; si estás en blanco cobrás asignación familiar y el monto baja a medida que sube el ingreso del grupo. Elegí tu caso y mirá el número que te toca.',
  stamps: [
    `AUH ${fmtArs(ASIGNACIONES.auhGeneral)} por hijo`,
    `Cobro mensual ${fmtArs(ASIGNACIONES.auhGeneral * 0.8)} (80%)`,
    `Retenido ${fmtArs(ASIGNACIONES.auhGeneral * ASIGNACIONES.pctRetenido)} hasta la Libreta`,
    `AUH con CUD ${fmtArs(ASIGNACIONES.auhDiscapacidad)}`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Lo que cobrás por mes',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos del caso más consultado: no hay trabajo registrado en la casa, así que corresponde AUH. Si trabajás en blanco, si estás por presentar la Libreta o si estás embarazada, cambialo: el monto se calcula distinto.',
    items: [
      {
        id: 'auh',
        label: 'No tengo trabajo registrado',
        hint: 'AUH — el caso más frecuente',
        answer:
          'Sin trabajo registrado corresponde la AUH: ANSES deposita el 80% todos los meses y retiene el 20% hasta que presentás la Libreta.',
        yes: [
          'El monto bruto por cada hijo, con y sin Certificado Único de Discapacidad',
          'Cuánto te depositan realmente por mes (el 80%)',
          'Cuánto se te acumula retenido y cuándo se libera',
          'Si el ingreso declarado del grupo familiar entra dentro del tope',
        ],
        warn: [
          DISCLAIMER,
          'La AUH general paga hasta 5 hijos; los hijos con CUD no tienen tope de cantidad y cobran un monto mucho mayor',
          'Un solo ingreso registrado en la casa por encima del tope por integrante hace caer la AUH del grupo entero',
          'La AUH es incompatible con cobrar asignación familiar (SUAF) por el mismo hijo: es una o la otra, no las dos',
        ],
        plazo:
          'se cobra por el calendario de ANSES según la terminación del DNI; el alta se puede pedir en cualquier momento del año.',
      },
      {
        id: 'suaf',
        label: 'Trabajo en blanco o soy monotributista',
        hint: 'SUAF — el monto depende del ingreso',
        answer:
          'Con trabajo registrado cobrás asignación familiar por hijo, y el monto baja por tramos a medida que sube el ingreso del grupo familiar.',
        yes: [
          'En qué tramo de ingreso cae tu grupo familiar',
          'Cuánto se cobra por hijo en ese tramo',
          'El total mensual por todos tus hijos',
          'Si el ingreso del grupo pasó el tope y dejaste de cobrar',
        ],
        warn: [
          DISCLAIMER,
          'El ingreso que mira ANSES es el del GRUPO familiar (IGF), no sólo el tuyo: sumá los dos sueldos de la pareja',
          'El tramo 1 paga casi cinco veces más que el tramo 4: un aumento de sueldo puede hacerte perder más asignación de lo que ganás',
          'La asignación por hijo con discapacidad no tiene tope de ingresos: se cobra en cualquier tramo',
        ],
        plazo:
          'el tramo se recalcula cuando ANSES actualiza el IGF del grupo; si cambiaste de trabajo o de ingreso, actualizá los datos en Mi ANSES para no cobrar de menos.',
      },
      {
        id: 'libreta',
        label: 'Cobro AUH y quiero el 20% retenido',
        hint: 'Libreta AUH: vacunas, salud y escuela',
        answer:
          'El 20% retenido se libera cuando presentás la Libreta AUH con las vacunas, los controles de salud y la escolaridad del año anterior al día.',
        yes: [
          'Cuánto te retienen por mes y cuánto llevás acumulado',
          'El total aproximado que cobrás al presentar la Libreta',
          'Qué te van a pedir: vacunas del Calendario Nacional, controles de salud y certificado de alumno regular',
        ],
        warn: [
          DISCLAIMER,
          'La estimación valúa todos los meses retenidos al monto vigente hoy. El pago real se liquida con el valor que tenía la AUH en cada mes retenido, así que si hubo aumentos va a salir algo menos',
          'La Libreta exige el esquema de vacunación del Calendario Nacional completo para la edad del chico: si faltan dosis, no se acredita el pago',
          'Desde los 4 años también se pide el certificado de escolaridad; sin él se libera la parte de salud pero no el resto',
        ],
        plazo:
          'la Libreta se presenta desde la app o la web Mi ANSES (Hijos → Libreta AUH), o con el formulario 1.47 en una oficina. El pago del acumulado suele acreditarse en marzo.',
      },
      {
        id: 'escolar',
        label: 'Empieza el ciclo lectivo',
        hint: 'Ayuda escolar anual',
        answer:
          'La ayuda escolar anual es un pago único por hijo escolarizado al inicio del ciclo lectivo, aparte de la asignación mensual.',
        yes: [
          'El monto por hijo escolarizado',
          'El total por todos tus hijos en edad escolar',
          'Cómo se suma a lo que ya cobrás por mes',
        ],
        warn: [
          DISCLAIMER,
          'Es un pago ÚNICO anual, no un monto mensual: no lo sumes doce veces',
          'Requiere presentar el certificado de alumno regular; sin eso ANSES no lo liquida',
          'El importe se actualiza en marzo de cada ciclo lectivo: verificá el vigente en anses.gob.ar antes de contar con el número',
        ],
        plazo:
          'se paga al inicio del ciclo lectivo y el certificado escolar se puede cargar durante el año en Mi ANSES; se liquida cuando queda acreditado.',
      },
      {
        id: 'embarazo',
        label: 'Estoy embarazada o tengo un hijo menor de 5',
        hint: 'Prenatal + Complemento Leche',
        answer:
          'En el embarazo se cobra la asignación prenatal, y el Complemento Leche se paga durante el embarazo, la lactancia y hasta los 5 años del chico.',
        yes: [
          'El monto de la asignación prenatal, que equivale a la asignación por hijo de tu situación',
          'El Complemento Leche mensual',
          'El total mensual mientras dura el beneficio',
        ],
        warn: [
          DISCLAIMER,
          'El prenatal se cobra desde el tercer mes de embarazo y hay que inscribirse: no se otorga solo',
          'El Complemento Leche exige los controles médicos al día, igual que la Libreta',
          'Si estás en AUH, el prenatal se paga como AUE (Asignación por Embarazo) y también tiene retención del 20% hasta presentar la libreta',
        ],
        plazo:
          'la inscripción del embarazo se hace apenas se tiene el certificado médico: los meses anteriores a la inscripción no se pagan retroactivos.',
      },
    ],
  },

  inputsTitle: 'Tus datos familiares',
  inputsIntro:
    'Cada rama usa sólo los campos que le sirven. El ingreso del grupo familiar es la suma de todos los ingresos registrados de la casa, no sólo el tuyo.',
  fields: [
    { id: 'hijos', label: 'Cantidad de hijos a cargo', type: 'number', min: 0, max: 15, suffix: 'hijos', value: 2 },
    {
      id: 'hijosCud',
      label: 'De esos, con Certificado Único de Discapacidad',
      type: 'number',
      min: 0,
      max: 15,
      suffix: 'hijos',
      value: 0,
      help: 'Los hijos con CUD cobran un monto mucho mayor y no tienen tope de cantidad.',
    },
    {
      id: 'ingreso',
      label: 'Ingreso mensual del grupo familiar',
      prefix: '$',
      value: '900000',
      thousands: true,
      help: 'IGF: la suma de los ingresos registrados de todo el grupo. Define el tramo de la asignación familiar y el acceso a la AUH.',
    },
    {
      id: 'integrantes',
      label: 'Integrantes del grupo familiar',
      type: 'number',
      min: 1,
      max: 15,
      suffix: 'personas',
      value: 4,
      help: 'Se usa para el tope de ingreso de la AUH: el tope sube por cada integrante.',
    },
    {
      id: 'mesesRetenidos',
      label: 'Meses con el 20% retenido',
      type: 'number',
      min: 1,
      max: 12,
      suffix: 'meses',
      value: 12,
      help: 'Cuántos meses llevás cobrando sin haber presentado la Libreta.',
    },
    {
      id: 'bono',
      label: '¿ANSES está pagando bono de refuerzo?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No / no sé' },
        { value: 'si', label: 'Sí, hay bono vigente' },
      ],
      help: 'El bono se paga por hijo y no sufre la retención del 20%. ANSES lo activa por decreto, mes a mes.',
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Los montos de ANSES se actualizan todos los meses por movilidad: confirmá el valor vigente en anses.gob.ar antes de tomar una decisión con esta plata.',

  chart: {
    type: 'donut',
    title: 'Cómo se reparte lo que te corresponde',
    caption:
      'Muestra qué parte del total te llega efectivamente cada mes y qué parte queda retenida o se paga aparte. En la AUH la porción retenida es real: son tus pesos, pero recién los ves cuando presentás la Libreta.',
  },
  breakdownTitle: 'El monto, número por número',
  breakdownIntro:
    'Las barras comparan cada valor con el mayor del listado. Fijate la unidad de cada fila: hay pesos, cantidades de hijos y meses.',

  faq: [
    {
      q: '¿Cuánto es la AUH por hijo?',
      a: `Con el valor vigente, la AUH general es de ${fmtArs(ASIGNACIONES.auhGeneral)} brutos por hijo sin discapacidad, y ${fmtArs(ASIGNACIONES.auhDiscapacidad)} por hijo con Certificado Único de Discapacidad. De ese bruto ANSES deposita el 80% todos los meses —${fmtArs(ASIGNACIONES.auhGeneral * 0.8)} por hijo— y retiene el 20% restante hasta que se presenta la Libreta. Los montos se actualizan mensualmente por movilidad, así que conviene confirmar el vigente.`,
    },
    {
      q: '¿Por qué me depositan menos AUH de lo que dice la noticia?',
      a: `Porque el número que se publica es el monto bruto y a vos te acreditan el 80%. El 20% restante —${fmtArs(ASIGNACIONES.auhGeneral * ASIGNACIONES.pctRetenido)} por hijo con el valor de hoy— se retiene mes a mes y se libera de una sola vez cuando presentás la Libreta AUH con los controles de salud, las vacunas y la escolaridad al día. No es un descuento: es plata tuya en espera.`,
    },
    {
      q: '¿Qué pide la Libreta AUH?',
      a: 'Tres cosas del año anterior: el esquema de vacunación del Calendario Nacional completo para la edad del chico, los controles de salud, y —desde los 4 años— el certificado de escolaridad. Las firma el centro de salud y la escuela. Si falta alguna dosis de vacuna, el pago del acumulado no se acredita: por eso conviene chequear el calendario de vacunación antes de ir a que te firmen la libreta.',
    },
    {
      q: '¿Cuándo se cobra el 20% retenido?',
      a: 'Cuando ANSES valida la Libreta presentada. El pago del acumulado suele acreditarse en marzo, junto con el inicio del ciclo lectivo. La liquidación toma el valor que tenía la AUH en cada mes retenido, no el valor de hoy: si hubo aumentos en el medio, el pago real va a ser algo menor que la estimación a valores actuales.',
    },
    {
      q: '¿Cuál es la diferencia entre AUH y asignación familiar?',
      a: 'La AUH es para quien no tiene trabajo registrado: monotributistas sociales, trabajadores de casas particulares, informales y desocupados. La asignación familiar (SUAF) es para el trabajador en relación de dependencia y el monotributista, y su monto depende del tramo de ingreso del grupo familiar. Son incompatibles por el mismo hijo: se cobra una o la otra. Cuando alguien de la casa entra en blanco, ANSES suele migrar el beneficio automáticamente.',
    },
    {
      q: '¿Cuánto se cobra de asignación familiar según el sueldo?',
      a: `Por tramos de ingreso del grupo familiar (IGF): hasta ${fmtArs(ASIGNACIONES.tramos[0].limite)} se cobran ${fmtArs(ASIGNACIONES.tramos[0].asignacion)} por hijo; hasta ${fmtArs(ASIGNACIONES.tramos[1].limite)}, ${fmtArs(ASIGNACIONES.tramos[1].asignacion)}; hasta ${fmtArs(ASIGNACIONES.tramos[2].limite)}, ${fmtArs(ASIGNACIONES.tramos[2].asignacion)}; y hasta ${fmtArs(ASIGNACIONES.tramos[3].limite)}, ${fmtArs(ASIGNACIONES.tramos[3].asignacion)}. Por encima de ese último tope no corresponde la asignación general. El tramo 1 paga casi cinco veces más que el tramo 4.`,
    },
    {
      q: '¿Qué ingreso mira ANSES para el tramo?',
      a: 'El ingreso del grupo familiar completo (IGF), no el tuyo solo. Suma los ingresos registrados de ambos integrantes de la pareja. Además hay un tope individual: si uno solo de los dos supera el límite, el grupo pierde la asignación aunque el promedio dé bajo. Es la razón por la que un aumento de sueldo a veces termina costando plata.',
    },
    {
      q: '¿Hasta cuántos hijos paga la AUH?',
      a: `La AUH general se paga hasta 5 hijos por titular. Los hijos con Certificado Único de Discapacidad no entran en ese tope: se cobran todos, y a un monto mucho mayor (${fmtArs(ASIGNACIONES.auhDiscapacidad)} contra ${fmtArs(ASIGNACIONES.auhGeneral)}). La asignación por hijo con discapacidad, además, no tiene tope de ingresos ni en AUH ni en SUAF.`,
    },
    {
      q: '¿Cuánto es la ayuda escolar anual?',
      a: `Es un pago único por hijo escolarizado al inicio del ciclo lectivo, del orden de ${fmtArs(ASIGNACIONES.ayudaEscolar)} por hijo. Se cobra tanto con AUH como con asignación familiar, y requiere presentar el certificado de alumno regular. Se actualiza en marzo de cada año, así que conviene verificar el importe vigente en anses.gob.ar: es el dato de este grupo que más rápido queda viejo.`,
    },
    {
      q: '¿Qué es el Complemento Leche de ANSES?',
      a: `Un pago mensual adicional —${fmtArs(ASIGNACIONES.complementoLeche)} con el valor vigente— destinado a la compra de leche durante el embarazo, la lactancia y hasta los 5 años del chico. Reemplazó al viejo Plan Más Vida y se acredita junto con la AUH o la asignación familiar, según el caso. Exige tener los controles médicos al día.`,
    },
    {
      q: '¿La AUH se puede cobrar estando embarazada?',
      a: 'Sí: se llama Asignación por Embarazo para Protección Social (AUE) y se cobra desde la semana 12 de gestación, previa inscripción con certificado médico. Funciona igual que la AUH, con retención del 20% que se libera al presentar la libreta con los controles del embarazo. Lo importante es inscribirse apenas se tiene el certificado: los meses anteriores a la inscripción no se pagan retroactivos.',
    },
    {
      q: '¿Cuánto tiene que ganar la familia para no perder la AUH?',
      a: `El tope se mide por integrante del grupo familiar: alrededor de ${fmtArs(ASIGNACIONES.topePorIntegrante)} por persona con los valores vigentes. Un grupo de cuatro integrantes tiene entonces un tope cercano a ${fmtArs(ASIGNACIONES.topePorIntegrante * 4)}. Por encima de eso ANSES considera que no corresponde la AUH. Como todos estos valores se actualizan mensualmente, verificá el vigente antes de darte de baja o de alta.`,
    },
    {
      q: '¿El bono de refuerzo también tiene retención del 20%?',
      a: `No. Cuando ANSES activa un bono de refuerzo por hijo —del orden de ${fmtArs(ASIGNACIONES.bonoRefuerzo)}— se paga completo junto con la acreditación del mes, sin la retención del 20%. Los bonos se disponen por decreto mes a mes, así que no son un ingreso garantizado: no cuentes con ellos para un gasto fijo.`,
    },
  ],

  sources: [
    {
      name: 'Asignación Universal por Hijo — montos y requisitos',
      url: 'https://www.anses.gob.ar/asignacion-universal-por-hijo',
      publisher: 'ANSES',
    },
    {
      name: 'Libreta AUH — cómo presentarla',
      url: 'https://www.anses.gob.ar/tramite/libreta-auh',
      publisher: 'ANSES',
    },
    {
      name: 'Asignaciones familiares para trabajadores en relación de dependencia (SUAF)',
      url: 'https://www.anses.gob.ar/asignaciones-familiares-para-trabajadores-en-relacion-de-dependencia',
      publisher: 'ANSES',
    },
    {
      name: 'Ayuda escolar anual',
      url: 'https://www.anses.gob.ar/prestacion/ayuda-escolar-anual',
      publisher: 'ANSES',
    },
    {
      name: 'Ley 24.714 — Régimen de Asignaciones Familiares',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/40416/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'DNU 274/2024 — movilidad mensual por IPC',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/305691',
      publisher: 'Boletín Oficial',
      date: '26-03-2024',
    },
    {
      name: 'Calendario Nacional de Vacunación',
      url: 'https://www.argentina.gob.ar/salud/vacunas/calendario',
      publisher: 'Ministerio de Salud de la Nación',
    },
  ],

  replaces: [
    '/calculadora-asignacion-universal-hijo-auh-2026-monto',
    '/calculadora-auh-libreta-20-por-ciento-retenido-cobro',
    '/calculadora-asignacion-familiar-empleado-registrado-anses',
    '/calculadora-asignacion-familiar-anses-2026-tramos-ingreso',
    '/calculadora-ayuda-escolar-anual-asignacion',
    '/calculadora-anses-complemento-leche-maternidad',
    // Absorbida SÓLO por URL: es el Calendario Nacional de Vacunación, no una
    // asignación. Comparte "ANSES" en el slug porque la Libreta AUH exige las
    // vacunas al día, y el hub lo cubre en la rama "libreta" y en la FAQ, pero
    // no calcula ningún monto de vacunas.
    '/calculadora-vacuna-calendario-nacional-anses',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
