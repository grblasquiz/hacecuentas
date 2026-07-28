import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "Nos separamos: ¿cómo se reparte y cuánto es la cuota?"
 *
 * Absorbe cuatro calculadoras sueltas de divorcio y alimentos.
 *
 * OJO con el dato: la calculadora vieja de alimentos vivía en una URL con la
 * palabra "tabla" y su explicación presentaba una escala 30%/35-40%/40-50%
 * según cantidad de hijos como si fuera regla. **Esa tabla no existe en la ley
 * colombiana.** Los arts. 24 y 129 de la Ley 1098 de 2006 y los arts. 411 y
 * siguientes del Código Civil mandan ponderar capacidad económica del
 * alimentante y necesidad del alimentado, caso por caso. Acá el porcentaje es
 * un parámetro que el usuario mueve, rotulado como práctica judicial
 * orientativa, nunca como norma.
 *
 * Lo único duro es el tope de embargo por alimentos: 50% de TODO el salario
 * (COLOMBIA_2026.embargo.topeAlimentosCooperativas, CST arts. 154-156).
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'/plata). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Advertencia extra: esto es derecho de familia, no una liquidación. */
const DISCLAIMER_LEGAL =
  'Esto no reemplaza la asesoría de un abogado de familia ni la decisión del juez o del defensor de familia: en Colombia la cuota de alimentos se fija caso por caso.';

/** SMLMV vigente — Decreto 1469/2025 (MinTrabajo). Referencia de mínimo vital del alimentante. */
export const SMLMV = COLOMBIA_2026.smlmv;

/**
 * Tope de embargo por alimentos: 50% de todo el salario (CST arts. 154-156).
 * Es el único límite numérico duro de este hub.
 */
export const TOPE_EMBARGO_ALIMENTOS = COLOMBIA_2026.embargo.topeAlimentosCooperativas;

/**
 * Rango ORIENTATIVO de práctica judicial, NO tabla legal. Se usa sólo para
 * encuadrar el porcentaje que elige el usuario y para el gráfico.
 */
export const RANGO_PRACTICA = { min: 20, tipico: 30, max: 50 };

/** Aportes del trabajador dependiente: 4% salud + 4% pensión (Ley 100/1993). */
export const APORTES_TRABAJADOR = { salud: 0.04, pension: 0.04 };

/** Sociedad conyugal: gananciales por mitades (Código Civil arts. 1774 y 1830). */
export const GANANCIALES = 0.5;

/**
 * Cuota litis: el pacto de honorarios sobre lo que se recupere está limitado por
 * el estatuto del abogado (Ley 1123 de 2007). El rango de mercado que se ve en
 * la práctica va del 10% al 30%; el techo legal del pacto es 50%.
 */
export const CUOTA_LITIS = { min: 0.1, tipico: 0.2, topeLegal: 0.5 };

/** REDAM (Ley 2097 de 2021): 3 cuotas consecutivas o 4 no consecutivas en mora. */
export const REDAM = { cuotasConsecutivas: 3, cuotasNoConsecutivas: 4 };

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
slug: 'co/vida/divorcio-y-cuota-alimentaria',
  title: 'Divorcio y cuota de alimentos en Colombia: cuánto es y cómo se reparte',
  description:
    'Cuánto puede quedar la cuota de alimentos, cómo se liquida la sociedad conyugal, qué cuesta el proceso y qué pasa si te reportan al REDAM. Sin tablas inventadas: en Colombia el juez pondera capacidad y necesidad.',
  silo: 'Vida',
siloHref: '/co/vida',
  locale: 'co',

  eyebrow: 'Colombia · familia · Ley 1098 de 2006',
  h1: 'Nos separamos: cómo se reparte todo y cuánto queda la cuota.',
  lede:
    'Cuatro cuentas que en realidad son una sola conversación: cuánto le corresponde a los hijos cada mes, cómo se parten los bienes de la sociedad conyugal, qué cuesta el proceso y qué pasa si te atrasás. Ojo con lo primero: en Colombia no existe una tabla legal de porcentajes de alimentos.',
  stamps: [
    'Arts. 24 y 129 · Ley 1098 de 2006',
    `Tope de embargo por alimentos: ${Math.round(TOPE_EMBARGO_ALIMENTOS * 100)}% del salario`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Estimación de tu caso',

  cases: {
    title: '¿Qué parte de la separación estás resolviendo?',
    intro:
      'Cada rama usa las mismas cifras tuyas, pero responde una pregunta distinta. Arrancamos por la que más se busca: la cuota de los hijos.',
    items: [
      {
        id: 'alimentos',
        label: 'Cuánto es la cuota de alimentos de mis hijos',
        hint: 'Ley 1098 de 2006 · capacidad y necesidad',
        answer:
          'No hay porcentaje legal: el juez cruza lo que podés pagar con lo que el hijo necesita, y la práctica judicial suele moverse entre el 20% y el 50% del ingreso neto.',
        yes: [
          'Tu ingreso mensual descontados los aportes obligatorios a salud y pensión',
          'La necesidad real del hijo: colegio, salud, vivienda, alimentación, transporte y recreación',
          'Los gastos extraordinarios (matrícula, uniformes, tratamientos) que se reparten aparte de la mensualidad',
          'Cuántos hijos tenés en total, incluidos los de otra relación: la capacidad se reparte entre todos',
          'Que la obligación alcanza a ambos padres, aunque uno tenga la custodia',
        ],
        warn: [
          DISCLAIMER_TAX,
          DISCLAIMER_LEGAL,
          'No existe tabla legal de porcentajes: los arts. 24 y 129 de la Ley 1098 de 2006 mandan ponderar capacidad del alimentante y necesidad del alimentado. Cualquier página que te muestre "30% por un hijo, 50% por tres" te está mostrando una costumbre, no una norma',
          `El descuento por nómina para alimentos no puede pasar del ${Math.round(TOPE_EMBARGO_ALIMENTOS * 100)}% del salario (CST arts. 154-156): es el único tope duro de esta cuenta`,
          'La cuota se reajusta cada año, y si el acuerdo no dice con qué índice, se toma el IPC o el reajuste del salario mínimo según lo que fije el título',
        ],
        plazo:
          'la obligación va hasta los 18 años, y se extiende hasta los 25 si el hijo estudia y no puede sostenerse; sin límite si hay discapacidad que lo impida.',
      },
      {
        id: 'bienes',
        label: 'Cómo se reparten los bienes',
        hint: 'Sociedad conyugal · gananciales por mitades',
        answer:
          'Lo que se parte es la sociedad conyugal, no todo tu patrimonio: los bienes propios quedan afuera y los gananciales van 50% y 50%.',
        yes: [
          'Los bienes adquiridos a título oneroso durante el matrimonio o la unión marital',
          'Los frutos y rentas de esos bienes y también de los propios, durante la sociedad',
          'Las deudas sociales, que se restan del activo antes de repartir',
          'Las recompensas: si la sociedad pagó una deuda tuya personal, se te descuenta de tu mitad',
        ],
        warn: [
          DISCLAIMER_TAX,
          DISCLAIMER_LEGAL,
          'Los bienes que ya tenías antes, o los que recibiste por herencia o donación durante el matrimonio, son propios y no entran al reparto',
          'Divorcio y liquidación de la sociedad conyugal son dos cosas distintas: podés estar divorciado y seguir con la sociedad ilíquida durante años, con el lío que eso trae para vender',
          'La calculadora vieja capitalizaba la cuota de alimentos a 20 años y se la restaba a los DOS cónyuges: eso no existe en la ley y estaba mal por partida doble. Alimentos y gananciales son masas separadas',
        ],
        plazo:
          'si el acuerdo es total y no hay hijos menores en disputa, se puede liquidar por escritura ante notario en semanas; con desacuerdo va a juzgado de familia.',
      },
      {
        id: 'costo',
        label: 'Cuánto me cuesta el proceso',
        hint: 'Honorarios y cuota litis · Ley 1123 de 2007',
        answer:
          'Por mutuo acuerdo ante notario el divorcio cuesta una fracción de lo que cuesta litigarlo: la diferencia la hace la cuota litis.',
        yes: [
          'Los derechos notariales, que se liquidan sobre la cuantía del acuerdo',
          'Los honorarios del abogado, que en Colombia se pactan libremente',
          'La cuota litis: el porcentaje de lo que recuperes que se lleva el abogado si ganás',
          'Los gastos del proceso: notificaciones, copias, peritajes y avalúos si hay inmuebles',
        ],
        warn: [
          DISCLAIMER_TAX,
          DISCLAIMER_LEGAL,
          `La cuota litis no es libre: el estatuto del abogado (Ley 1123 de 2007) la limita, y el pacto no puede llevarse más de la mitad de lo que se obtenga. Un pacto por encima de ese techo es falta disciplinaria del abogado`,
          'En Colombia no hay una tarifa oficial obligatoria de honorarios: las tablas de los colegios de abogados son referencias, no precios de ley. Pedí siempre el pacto por escrito',
          'Si el divorcio es de mutuo acuerdo y no hay hijos menores, se hace ante notario y no necesitás juzgado',
        ],
        plazo:
          'de mutuo acuerdo, semanas; contencioso, entre uno y dos años según el juzgado y si hay apelación.',
      },
      {
        id: 'redam',
        label: 'Estoy en mora y me pueden reportar al REDAM',
        hint: 'Ley 2097 de 2021 · Registro de Deudores Alimentarios Morosos',
        answer: `Se entra al REDAM con ${REDAM.cuotasConsecutivas} cuotas consecutivas en mora o ${REDAM.cuotasNoConsecutivas} no consecutivas.`,
        yes: [
          `El conteo de cuotas incumplidas: ${REDAM.cuotasConsecutivas} seguidas o ${REDAM.cuotasNoConsecutivas} salteadas alcanzan para el reporte`,
          'El saldo acumulado, que es lo que hay que ponerse al día para salir del registro',
          'Que el reporte lo ordena el juez, comisario de familia o defensor de familia que conoce el caso: no es automático ni lo pide el otro padre por internet',
          'Que estar en el REDAM bloquea trámites: crédito, contratación con el Estado, algunos cargos públicos y la renovación de licencia y pasaporte',
        ],
        warn: [
          DISCLAIMER_TAX,
          DISCLAIMER_LEGAL,
          'El REDAM es una consecuencia civil; el incumplimiento también puede derivar en el delito de inasistencia alimentaria del art. 233 del Código Penal, que es un frente aparte',
          'Salir del registro exige pagar la totalidad de la deuda o suscribir y cumplir un acuerdo de pago aprobado por la autoridad que ordenó el reporte',
          'Si perdiste el trabajo, la salida no es dejar de pagar: es pedirle al juez la revisión de la cuota por cambio de capacidad económica, con pruebas',
        ],
        plazo:
          'la deuda de alimentos no prescribe con el simple paso del tiempo mientras haya título ejecutivo vigente: se cobra ejecutivamente con intereses.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Todo en pesos colombianos. Según la rama que elijas se usan unos campos u otros; podés dejar el ejemplo cargado y volver después con tus números.',
  fields: [
    {
      id: 'ingresos',
      label: 'Ingreso mensual bruto del alimentante (COP)',
      prefix: '$',
      value: '4.500.000',
      thousands: true,
      help: 'Todo lo que entra al mes: salario, honorarios, arriendos. Si es variable, promediá los últimos doce meses.',
    },
    {
      id: 'descuentos',
      label: 'Aportes obligatorios y descuentos de ley (COP)',
      prefix: '$',
      value: '360.000',
      thousands: true,
      help: `Salud ${Math.round(APORTES_TRABAJADOR.salud * 100)}% y pensión ${Math.round(APORTES_TRABAJADOR.pension * 100)}% del trabajador dependiente, o lo que pagás por PILA si sos independiente.`,
    },
    {
      id: 'hijos',
      label: 'Hijos que dependen de esta cuota',
      type: 'number',
      value: 2,
      min: 1,
      max: 10,
      step: 1,
      help: 'La cuota que calculamos es el total, y abajo te mostramos cuánto toca por hijo.',
    },
    {
      id: 'porcentaje',
      label: 'Porcentaje del ingreso neto que estás evaluando (%)',
      type: 'number',
      value: RANGO_PRACTICA.tipico,
      min: 5,
      max: 50,
      step: 1,
      suffix: '%',
      help: `Parámetro orientativo, no legal. La práctica judicial suele moverse entre ${RANGO_PRACTICA.min}% y ${RANGO_PRACTICA.max}%, pero el juez decide según capacidad y necesidad.`,
    },
    {
      id: 'gastos',
      label: 'Gastos extraordinarios del mes (COP)',
      prefix: '$',
      value: '400.000',
      thousands: true,
      help: 'Matrículas, uniformes, tratamientos médicos. Se suelen repartir por mitades entre los dos padres, aparte de la mensualidad.',
    },
    {
      id: 'patrimonio',
      label: 'Bienes de la sociedad conyugal (COP)',
      prefix: '$',
      value: '250.000.000',
      thousands: true,
      help: 'Sólo lo adquirido durante el matrimonio o la unión marital. No incluyas lo que ya tenías, ni herencias ni donaciones.',
    },
    {
      id: 'deudas',
      label: 'Deudas sociales pendientes (COP)',
      prefix: '$',
      value: '60.000.000',
      thousands: true,
      help: 'Créditos hipotecarios, de consumo o tarjetas contraídos para la familia. Se restan antes de repartir.',
    },
    {
      id: 'litis',
      label: 'Cuota litis pactada con el abogado (%)',
      type: 'number',
      value: Math.round(CUOTA_LITIS.tipico * 100),
      min: 0,
      max: 50,
      step: 1,
      suffix: '%',
      help: `Porcentaje de lo que recuperes. El techo del pacto es ${Math.round(CUOTA_LITIS.topeLegal * 100)}% (Ley 1123 de 2007).`,
    },
    {
      id: 'mora',
      label: 'Cuotas de alimentos en mora',
      type: 'number',
      value: 3,
      min: 0,
      max: 60,
      step: 1,
      help: `Cuántas mensualidades debés. Con ${REDAM.cuotasConsecutivas} consecutivas o ${REDAM.cuotasNoConsecutivas} salteadas se configura el reporte al REDAM.`,
    },
  ],
  fineprint: DISCLAIMER_TAX + ' ' + DISCLAIMER_LEGAL,

  chart: {
    type: 'bars',
    title: 'Cómo se reparte la plata en tu caso',
    caption:
      'Cada barra es un destino del dinero en la rama que elegiste: lo que va a los hijos y lo que te queda, las dos mitades de gananciales, los componentes del costo del proceso o la deuda acumulada frente a lo que ya pagaste.',
  },
  breakdownTitle: 'La cuenta, línea por línea',
  breakdownIntro:
    'Cada fila dice de dónde sale el número y con qué norma se mide, para que puedas discutirlo con tu abogado sin adivinar.',

  faq: [
    {
      q: '¿Existe una tabla oficial de porcentajes para la cuota de alimentos en Colombia?',
      a: 'No. Es el error más repetido en internet y conviene decirlo sin vueltas: ninguna norma colombiana fija que un hijo son 30% del sueldo y tres son 50%. Los arts. 24 y 129 de la Ley 1098 de 2006, junto con los arts. 411 y siguientes del Código Civil, mandan al juez ponderar dos cosas: la capacidad económica de quien debe los alimentos y la necesidad real de quien los recibe. Los porcentajes que circulan son una lectura de sentencias, útil como referencia para negociar, pero no son ley y ningún juez está obligado a seguirlos.',
    },
    {
      q: '¿Hay algún tope que sí sea obligatorio?',
      a: `Sí, uno: el descuento por nómina. El Código Sustantivo del Trabajo, en sus arts. 154 a 156, hace inembargable el salario mínimo y permite embargar sólo la quinta parte del excedente, salvo cuando la deuda es por alimentos o con cooperativas: ahí el tope sube al ${Math.round(TOPE_EMBARGO_ALIMENTOS * 100)}% de todo el salario. Ese ${Math.round(TOPE_EMBARGO_ALIMENTOS * 100)}% es el techo duro. Si la cuota que estás evaluando lo supera, el descuento por nómina no la va a poder ejecutar completa.`,
    },
    {
      q: '¿Hasta qué edad se paga la cuota de alimentos?',
      a: 'Hasta los 18 años como regla, y se extiende hasta los 25 si el hijo está estudiando y no puede sostenerse por sí mismo, siempre que acredite que efectivamente cursa estudios. Si hay una discapacidad que le impide proveerse, la obligación no tiene ese tope de edad. La mayoría de edad no extingue la cuota sola: hay que pedir la exoneración ante el juez, y mientras no se declare, la deuda sigue corriendo.',
    },
    {
      q: '¿Qué son los gastos extraordinarios y por qué van aparte?',
      a: 'Son los que no se repiten todos los meses: matrícula, uniformes, útiles, una cirugía, un tratamiento de ortodoncia, un viaje escolar. Como no son previsibles en la mensualidad, lo habitual es que el acuerdo o la sentencia los reparta por mitades entre los dos padres, contra factura. Por eso en esta cuenta los sumamos aparte de la cuota base y no dentro del porcentaje.',
    },
    {
      q: 'Si tengo hijos de otra relación, ¿me baja la cuota?',
      a: 'Puede bajarla, pero no automáticamente ni por un porcentaje fijo. Lo que hace el juez es mirar tu capacidad económica total y cómo se reparte entre todos los alimentarios que tenés a cargo, sin darle prioridad a unos sobre otros. Para que pese, hay que probar la existencia de la otra obligación y que efectivamente la cumplís: una cuota de papel que nunca pagaste no te sirve de argumento.',
    },
    {
      q: '¿Qué es exactamente la sociedad conyugal y qué queda afuera del reparto?',
      a: 'Es la masa de bienes que se forma con el matrimonio o con la unión marital de hecho declarada, y se reparte por mitades al disolverse (Código Civil arts. 1774 y 1830). Entra lo adquirido a título oneroso durante la sociedad y los frutos y rentas de todos los bienes, incluso de los propios. Queda afuera lo que cada uno tenía antes, lo recibido por herencia o donación durante el matrimonio, y sus subrogaciones. Por eso el número que importa no es tu patrimonio total, sino el activo social.',
    },
    {
      q: '¿Puedo estar divorciado y no haber liquidado la sociedad conyugal?',
      a: 'Sí, y es más frecuente de lo que parece. El divorcio disuelve el vínculo y la sociedad, pero la liquidación es un acto aparte: mientras no la hagas, los bienes siguen en comunidad y necesitás la firma del otro para vender o hipotecar. Dejarla pendiente años suele salir caro cuando aparece un comprador y hay que liquidar a las apuradas o cuando fallece uno de los dos y se mezcla con la sucesión.',
    },
    {
      q: '¿Cuánto puede cobrarme un abogado de cuota litis?',
      a: `La cuota litis se pacta libremente, pero no sin límite: el estatuto del abogado (Ley 1123 de 2007) somete el pacto a reglas de lealtad y honradez y le pone techo, de modo que el abogado no puede quedarse con más de la mitad de lo que se obtenga para el cliente. En la práctica del país los pactos rondan el ${Math.round(CUOTA_LITIS.min * 100)}% al 30% de lo recuperado. Exigí siempre el pacto por escrito, con la base de cálculo definida: no es lo mismo "sobre lo recuperado" que "sobre el valor de los bienes en disputa".`,
    },
    {
      q: '¿Conviene el divorcio de mutuo acuerdo ante notario?',
      a: 'Cuando hay acuerdo real, casi siempre. Se resuelve por escritura pública en semanas y los derechos notariales se liquidan sobre la cuantía del acuerdo, muy por debajo de lo que cuesta un contencioso con peritajes y avalúos. Si hay hijos menores, el acuerdo sobre custodia, visitas y alimentos tiene que pasar por el defensor de familia antes de firmarse. Sin acuerdo, no hay atajo: va a juzgado de familia.',
    },
    {
      q: '¿Cuándo me pueden reportar al REDAM y qué me bloquea?',
      a: `El Registro de Deudores Alimentarios Morosos lo creó la Ley 2097 de 2021 y se activa con ${REDAM.cuotasConsecutivas} cuotas consecutivas en mora o ${REDAM.cuotasNoConsecutivas} no consecutivas. El reporte lo ordena la autoridad que conoce el caso, no lo tramita el otro padre por su cuenta. Estar en el registro traba el acceso a crédito, la contratación con entidades públicas, el ejercicio de ciertos cargos y trámites como la renovación de licencia de conducción o de pasaporte, hasta que te pongas al día o cumplas un acuerdo de pago aprobado.`,
    },
    {
      q: 'Perdí el trabajo y no puedo pagar la cuota. ¿Qué hago?',
      a: 'Pedir la revisión de la cuota ante el mismo juez o autoridad que la fijó, con pruebas del cambio de capacidad económica: carta de terminación, liquidación, historial de aportes. Lo que no funciona es dejar de pagar y esperar: la cuota fijada sigue siendo exigible hasta que se modifique, la deuda se acumula con intereses y el reporte al REDAM corre igual. Una modificación pedida a tiempo casi siempre sale más barata que un ejecutivo por alimentos.',
    },
    {
      q: '¿La cuota se actualiza sola cada año?',
      a: 'Sólo si el título lo dice. Si la sentencia o el acuerdo fijan el reajuste, se aplica ese índice, normalmente el IPC del año anterior certificado por el DANE o el incremento del salario mínimo. Si no dicen nada, la cuota queda nominalmente congelada y hay que pedir el aumento ante el juez, probando que cambiaron las necesidades del hijo o la capacidad del alimentante. Fijar la cuota en salarios mínimos es la forma más simple de evitar ese trámite todos los años.',
    },
  ],

  sources: [
    {
      name: 'Ley 1098 de 2006 — Código de la Infancia y la Adolescencia (arts. 24 y 129, derecho de alimentos)',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_1098_2006.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Código Civil colombiano — alimentos (arts. 411 y ss.) y sociedad conyugal (arts. 1774 y 1830)',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_civil.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Ley 2097 de 2021 — Registro de Deudores Alimentarios Morosos (REDAM)',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_2097_2021.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Ley 1123 de 2007 — Código Disciplinario del Abogado (pacto de cuota litis)',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_1123_2007.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Código Sustantivo del Trabajo, arts. 154 a 156 — inembargabilidad del salario y excepción por alimentos',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Decreto 1469/2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
    },
    {
      name: 'ICBF — derechos de alimentos y conciliación en asuntos de familia',
      url: 'https://www.icbf.gov.co/',
      publisher: 'Instituto Colombiano de Bienestar Familiar',
    },
  ],

  replaces: [
    '/co/calculadora-pension-alimentos-colombia-padre-divorcio-tabla',
    '/co/calculadora-divorcio-particion-bienes-colombia-sociedad-conyugal',
    '/co/calculadora-divorcio-cuota-litis-honorarios-abogado-colombia',
    '/co/calculadora-redam-cuotas-alimentarias-mora',
  ],

lastReviewed: '2026-07-28',
};
