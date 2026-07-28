import type { HubData } from './types';
import { getCalculatorDisclaimer } from '../disclaimers';
import {
  WFA_BOYS_L, WFA_BOYS_M, WFA_BOYS_S,
  WFA_GIRLS_L, WFA_GIRLS_M, WFA_GIRLS_S,
  WFA_MAX_DAYS,
} from '../formulas/_oms-wfa-lms';

/**
 * Hub de decisión — "¿Mi bebé crece bien?"
 * Arquetipo: RAMIFICADO (4 ramas). Absorbe 9 calculadoras sueltas (ver `replaces`).
 *
 * ÁMBITO: 0 a 24 MESES (lactante). NO se superpone con `/salud/crecimiento-infantil`,
 * que arranca en la edad escolar: aquel hub cubre IMC infantil por percentil (2-18
 * años), talla adulta proyectada y mochila escolar. Acá no hay IMC ni talla adulta:
 * hay percentil de peso del lactante con las curvas OMS 2006, edad corregida del
 * prematuro, hitos del desarrollo del primer y segundo año y cronología de dientes.
 * Las dos páginas se enlazan entre sí en el copy y en las FAQ.
 *
 * CONTENIDO YMYL DE SALUD INFANTIL. Reglas aplicadas:
 *  - El disclaimer sale de `getCalculatorDisclaimer({ category: 'salud' })`
 *    (dominio `health`), no de un texto inventado. Va en `fineprint`.
 *  - Además va como PRIMER `warn` de cada una de las cuatro ramas, para que el
 *    aviso viaje con el caso y no sólo al pie del formulario.
 *  - El hub informa percentiles, edades corregidas y cronologías. No diagnostica,
 *    no indica alimentación, suplementos ni tratamiento: siempre remite al pediatra.
 *
 * DATOS: no se inventa un solo valor de referencia.
 *  - Peso-para-edad 0-5 años: tablas LMS oficiales OMS Child Growth Standards 2006
 *    (`src/lib/formulas/_oms-wfa-lms.ts`, weianthro), las mismas que usa la calc
 *    `peso-ideal-bebe-mes-percentil`. El percentil sale por Z-score LMS exacto.
 *  - Hitos motores/lenguaje/social: tablas de `desarrollo-motor-bebe.ts` y
 *    `hitos-desarrollo-bebe-edad-meses.ts`, sin retocar.
 *  - Cronología de dientes: tabla de `dientes-bebe-cronologia.ts`.
 *  - Talla de calzado: tablas de `talla-zapato-bebe.ts` (pie en cm y edad → cm).
 *  - Edad corregida del prematuro: 40 semanas − edad gestacional, criterio de
 *    `edad-corregida-prematuro.ts` / `edad-gestacional-corregida-prematuro.ts`.
 *
 * LÍMITE HONESTO (documentado a propósito): el repo tiene las tablas LMS de
 * PESO-para-edad de la OMS, no las de longitud/talla-para-edad. Por eso la rama
 * de percentiles devuelve el percentil de PESO calculado y muestra la talla como
 * dato medido, sin estimarle un percentil. Es salud infantil: antes que estimar
 * una curva que no tenemos cargada, se remite a la curva de longitud de la
 * libreta sanitaria. Está dicho en el copy de la rama y en la FAQ.
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos):
 *  - El override de `format` por fila pisa la base con `undefined`, así que CADA
 *    fila declara su `format`/`unit` explícito (kg, cm, meses, semanas, dientes…).
 *  - `chart.type: 'scale'` y `chart.bands` todavía no tienen render propio: se
 *    dibuja el donut. Se declaran igual porque son el dato correcto, y se
 *    devuelven `position` / `positionLabel` según el contrato.
 */

/** Franjas de lectura del percentil de peso (cortes OMS: P3 / P15 / P85 / P97). */
export const BANDS = [
  { label: 'Bajo peso (< P3)', from: 0, to: 3, tone: 'bad' as const },
  { label: 'Franja baja (P3–P15)', from: 3, to: 15, tone: 'warn' as const },
  { label: 'Rango esperado (P15–P85)', from: 15, to: 85, tone: 'good' as const },
  { label: 'Franja alta (P85–P97)', from: 85, to: 97, tone: 'warn' as const },
  { label: 'Peso elevado (> P97)', from: 97, to: 100, tone: 'bad' as const },
];

/** Tonos que entiende el runtime del hub, en el orden de BANDS. */
export const BAND_TONES = ['main', 'warn', 'good', 'prop', 'exit'] as const;

/** Peso-para-edad OMS: un punto por mes (la tabla original es diaria). */
const DIAS_POR_MES = 30.4375;
function sampleWfa(L: ReadonlyArray<number>, M: ReadonlyArray<number>, S: ReadonlyArray<number>): number[][] {
  const out: number[][] = [];
  for (let mes = 0; mes <= 36; mes++) {
    const dia = Math.min(WFA_MAX_DAYS, Math.round(mes * DIAS_POR_MES));
    out.push([mes, L[dia], M[dia], S[dia]]);
  }
  return out;
}

/** Tablas LMS OMS 2006 de peso-para-edad, muestreadas por mes (0 a 36). */
export const WFA_LMS = {
  m: sampleWfa(WFA_BOYS_L, WFA_BOYS_M, WFA_BOYS_S),
  f: sampleWfa(WFA_GIRLS_L, WFA_GIRLS_M, WFA_GIRLS_S),
};

/**
 * Hitos del desarrollo por edad (en meses de edad corregida si el bebé es
 * prematuro). Tabla de `src/lib/formulas/desarrollo-motor-bebe.ts`, sin cambios.
 */
export const HITOS: Array<{ mes: number; esperados: string; proximos: string; estimulacion: string; alerta: string }> = [
  { mes: 0, esperados: 'Movimientos reflejos, gira la cabeza, reflejo de prensión', proximos: 'Levantar cabeza boca abajo, seguir objetos con la mirada', estimulacion: 'Contacto piel con piel, hablarle, ponerlo boca abajo brevemente', alerta: 'No succiona, no responde a sonidos fuertes, muy flácido' },
  { mes: 2, esperados: 'Levanta cabeza 45° boca abajo, abre y cierra manos, sigue objetos', proximos: 'Sostener cabeza firme, agarrar objetos, sonrisa social', estimulacion: 'Tummy time 3-5 min varias veces al día, juguetes de colores contrastantes', alerta: 'No levanta cabeza boca abajo, no sigue objetos con la mirada' },
  { mes: 4, esperados: 'Sostiene cabeza firme, se apoya en antebrazos, agarra objetos, ríe', proximos: 'Rodar, sentarse con apoyo, pasar objetos de mano a mano', estimulacion: 'Más tummy time, juguetes para agarrar, juego frente al espejo', alerta: 'No sostiene cabeza, no agarra objetos, no sonríe' },
  { mes: 6, esperados: 'Se sienta con apoyo, rueda, agarra y pasa objetos entre manos', proximos: 'Sentarse solo, gatear, pinza inferior', estimulacion: 'Juegos en el piso, objetos a distancia para motivar movimiento', alerta: 'No rueda, no se sienta con apoyo, no agarra' },
  { mes: 9, esperados: 'Se sienta solo, gatea, pinza inferior, dice ba-ba ma-ma', proximos: 'Pararse con apoyo, crucero, pinza superior', estimulacion: 'Espacio seguro para gatear, muebles para pararse, juguetes de encaje', alerta: 'No se sienta solo, no se desplaza, no balbucea' },
  { mes: 12, esperados: 'Se para solo, primeros pasos (o a punto), pinza fina, dice 1-3 palabras', proximos: 'Caminar solo con seguridad, correr, subir escaleras', estimulacion: 'Dejar caminar descalzo, juguetes de empujar, cubos para apilar', alerta: 'No se para con apoyo, no gatea ni se desplaza, no señala' },
  { mes: 15, esperados: 'Camina solo, apila 2-3 cubos, garabatea, dice 5-10 palabras', proximos: 'Correr, subir escaleras, patear pelota', estimulacion: 'Caminatas al aire libre, crayones gruesos, juegos de meter/sacar', alerta: 'No camina, no dice ninguna palabra, no señala' },
  { mes: 18, esperados: 'Corre (torpe), sube escaleras gateando, apila 3-4 cubos, usa cuchara', proximos: 'Correr bien, subir escaleras parado, saltar', estimulacion: 'Parques, pelotas, juegos de imitación, libros con texturas', alerta: 'No camina solo, no dice al menos 5 palabras, pierde habilidades' },
  { mes: 24, esperados: 'Corre bien, patea pelota, sube/baja escaleras, apila 6+ cubos, frases de 2 palabras', proximos: 'Saltar con 2 pies, pedalear triciclo, dibujar líneas', estimulacion: 'Juegos al aire libre, triciclo, rompecabezas simples, pintar', alerta: 'No corre, no dice frases, no sube escaleras' },
];

/** Hitos por área (motor / lenguaje / social). Tabla de `hitos-desarrollo-bebe-edad-meses.ts`. */
export const HITOS_AREA: Array<{ mes: number; motor: string; lenguaje: string; social: string }> = [
  { mes: 2, motor: 'Sostiene cabeza', lenguaje: 'Sonríe reactivo', social: 'Mira rostros' },
  { mes: 4, motor: 'Se apoya en brazos', lenguaje: 'Balbuceos', social: 'Ríe fuerte' },
  { mes: 6, motor: 'Se sienta con apoyo', lenguaje: 'Consonantes', social: 'Juego espejo' },
  { mes: 9, motor: 'Gatea', lenguaje: 'Primera palabra', social: 'Extraña' },
  { mes: 12, motor: 'Se para solo', lenguaje: '3-5 palabras', social: 'Saluda chau' },
  { mes: 18, motor: 'Camina, sube escalera', lenguaje: '10+ palabras', social: 'Imita' },
  { mes: 24, motor: 'Corre, patea', lenguaje: '2 palabras juntas', social: 'Juego simbólico' },
];

/** Cronología de erupción de los dientes de leche. Tabla de `dientes-bebe-cronologia.ts`. */
export const DIENTES: Array<{ mes: number; diente: string; total: number }> = [
  { mes: 6, diente: 'Incisivos centrales inferiores (2)', total: 2 },
  { mes: 8, diente: 'Incisivos centrales superiores (2)', total: 4 },
  { mes: 10, diente: 'Incisivos laterales superiores (2)', total: 6 },
  { mes: 12, diente: 'Incisivos laterales inferiores (2)', total: 8 },
  { mes: 14, diente: 'Primeros molares superiores (2)', total: 10 },
  { mes: 16, diente: 'Primeros molares inferiores (2)', total: 12 },
  { mes: 18, diente: 'Caninos superiores (2)', total: 14 },
  { mes: 20, diente: 'Caninos inferiores (2)', total: 16 },
  { mes: 24, diente: 'Segundos molares inferiores (2)', total: 18 },
  { mes: 30, diente: 'Segundos molares superiores (2)', total: 20 },
];

/** Equivalencia pie (cm) → talla de calzado. Tabla de `talla-zapato-bebe.ts`. */
export const TALLA_PIE: Array<{ cm: number; ar: number; eu: number; us: number }> = [
  { cm: 8, ar: 15, eu: 15, us: 0.5 }, { cm: 8.5, ar: 15, eu: 15, us: 0.5 },
  { cm: 9, ar: 16, eu: 16, us: 1 }, { cm: 9.5, ar: 16, eu: 16, us: 1.5 },
  { cm: 10, ar: 17, eu: 17, us: 2 }, { cm: 10.5, ar: 17, eu: 17, us: 2.5 },
  { cm: 11, ar: 18, eu: 18, us: 3 }, { cm: 11.5, ar: 18, eu: 18, us: 3.5 },
  { cm: 12, ar: 19, eu: 19, us: 4 }, { cm: 12.5, ar: 20, eu: 20, us: 4.5 },
  { cm: 13, ar: 21, eu: 21, us: 5 }, { cm: 13.5, ar: 21, eu: 21, us: 5.5 },
  { cm: 14, ar: 22, eu: 22, us: 6 }, { cm: 14.5, ar: 23, eu: 23, us: 6.5 },
  { cm: 15, ar: 24, eu: 24, us: 7 }, { cm: 15.5, ar: 24, eu: 24, us: 7.5 },
  { cm: 16, ar: 25, eu: 25, us: 8 }, { cm: 17, ar: 27, eu: 27, us: 9 },
  { cm: 18, ar: 28, eu: 28, us: 10 },
];

/** Largo de pie esperable por edad en meses (cuando no se midió el pie). */
export const PIE_POR_EDAD: Array<{ mes: number; cm: number }> = [
  { mes: 0, cm: 8 }, { mes: 3, cm: 9 }, { mes: 6, cm: 10 }, { mes: 9, cm: 11 },
  { mes: 12, cm: 12 }, { mes: 15, cm: 13 }, { mes: 18, cm: 13.5 }, { mes: 24, cm: 14.5 },
  { mes: 30, cm: 15.5 }, { mes: 36, cm: 16 },
];

const DISCLAIMER = getCalculatorDisclaimer({ slug: 'bebes/crecimiento', category: 'salud' }, 'es');

export const hub: HubData = {
  slug: 'bebes/crecimiento',
  title: '¿Mi bebé crece bien? Percentil de peso OMS, prematuros, hitos y dientes',
  description:
    'Percentil de peso del bebé con las tablas LMS oficiales de la OMS, edad corregida si nació prematuro, hitos del desarrollo mes a mes y cronología de los dientes de leche. De 0 a 24 meses. Orientativo: la lectura final es del pediatra.',
  silo: 'Bebés',
  siloHref: '/bebes',

  eyebrow: 'Guía de crecimiento del bebé',
  h1: '¿Mi bebé crece bien?',
  lede:
    'Partimos de la pregunta más común del primer año: en qué percentil de peso está según las curvas de la OMS. Si tu bebé nació prematuro, si querés chequear los hitos del desarrollo o saber cuándo salen los dientes, cambiás la rama acá abajo. Cubre de 0 a 24 meses: para chicos en edad escolar y adolescentes está la guía de crecimiento infantil.',
  stamps: [
    'Actualizado 27-07-2026',
    'Tablas LMS OMS 2006',
    '0 a 24 meses',
    '9 calculadoras adentro',
    'No reemplaza al pediatra',
  ],

  resultLabel: 'Cómo viene tu bebé',

  cases: {
    title: '¿Qué querés mirar?',
    intro:
      'Las cuatro ramas usan los mismos datos del formulario. Cada una aplica la tabla de referencia que corresponde a esa pregunta.',
    items: [
      {
        id: 'percentil',
        label: 'En qué percentil de peso está',
        hint: 'Curvas OMS · 0 a 24 meses',
        answer: 'El percentil de peso para la edad se lee con las tablas LMS de la OMS 2006, por sexo y por mes cumplido.',
        yes: [
          'Percentil exacto de peso para la edad, por Z-score con las tablas LMS oficiales de la OMS 2006',
          'El peso de la mediana (P50) del mes que cumple y los pesos del P3, P15, P85 y P97',
          'La franja en la que cae: bajo peso (< P3), franja baja (P3–P15), esperado (P15–P85), franja alta (P85–P97) o elevado (> P97)',
          'Cuántos kilos hay entre el peso de hoy y la mediana de su edad',
          'La talla se registra como dato medido para llevar al control',
        ],
        warn: [
          DISCLAIMER,
          'La talla NO recibe percentil acá: las curvas de longitud para la edad se leen en la libreta sanitaria con el pediatra, y preferimos no estimar una curva que no tenemos cargada',
          'Un percentil bajo estable puede ser perfectamente normal: lo que se evalúa en el control es la curva a lo largo del tiempo, no un punto suelto',
          'Un salto o una caída de dos franjas entre dos controles se consulta siempre',
          'Si el bebé nació prematuro, este percentil se lee con la EDAD CORREGIDA: cambiá a la rama de prematuro primero',
        ],
        plazo: 'los controles de peso son mensuales durante el primer semestre y después se espacian; el calendario lo fija el pediatra.',
      },
      {
        id: 'prematuro',
        label: 'Mi bebé nació prematuro',
        hint: 'Edad corregida hasta los 24 meses',
        answer: 'Al prematuro se lo evalúa por edad corregida: la edad del calendario menos las semanas que le faltaron para las 40.',
        yes: [
          'Semanas de prematurez: 40 menos las semanas de gestación al nacer',
          'Edad corregida en meses, que es la que se usa para crecimiento, alimentación y desarrollo',
          'El percentil de peso recalculado con la edad corregida, no con la del calendario',
          'Cuánto falta para los 24 meses corregidos, que es cuando en general se deja de corregir',
        ],
        warn: [
          DISCLAIMER,
          'Las VACUNAS se dan por edad cronológica, nunca por edad corregida: el calendario no se corre',
          'La corrección se usa hasta los 24 meses corregidos; después la mayoría de los pediatras pasa a la edad del calendario',
          'Los prematuros de menos de 32 semanas o de muy bajo peso tienen seguimiento propio en consultorio de alto riesgo: este cálculo no lo reemplaza',
          'Que el bebé venga "atrasado" respecto de su edad de calendario es lo esperable, y en general se empareja solo hacia los 2 años',
        ],
        plazo: 'la edad corregida se usa hasta los 24 meses; llevá siempre las dos edades al control.',
      },
      {
        id: 'hitos',
        label: 'Si va bien con los hitos del desarrollo',
        hint: 'Motor, lenguaje y social · 0 a 24 meses',
        answer: 'Los hitos son rangos, no fechas: lo que se mira es que el bebé avance, no que llegue un día puntual.',
        yes: [
          'Los hitos esperables para su edad (corregida, si es prematuro) en lo motor, el lenguaje y lo social',
          'Los hitos que vienen después, para saber qué mirar en las próximas semanas',
          'Ideas de estimulación apropiadas para esa etapa',
          'Las señales de alerta de esa edad, que son motivo de consulta',
          'La talla de calzado que corresponde al pie medido o a la edad',
        ],
        warn: [
          DISCLAIMER,
          'Cada bebé tiene su ritmo: llegar un mes antes o después a un hito es habitual y por sí solo no significa nada',
          'PERDER una habilidad ya adquirida sí es siempre motivo de consulta, aunque el resto vaya bien',
          'Si el bebé es prematuro, los hitos se miran por edad corregida: usá primero la rama de prematuro',
          'Estos hitos orientan, no son un test de desarrollo: la pesquisa formal la hace el pediatra con instrumentos validados',
        ],
        plazo: 'la pesquisa del desarrollo se hace en los controles de rutina; ante una señal de alerta, no esperes al próximo turno.',
      },
      {
        id: 'dientes',
        label: 'Cuándo le salen los dientes',
        hint: 'Cronología de los 20 dientes de leche',
        answer: 'El primer diente suele asomar entre los 6 y los 10 meses, y los 20 de leche se completan cerca de los 30 meses.',
        yes: [
          'Cuántos dientes son esperables a la edad del bebé y cuáles ya deberían haber salido',
          'Qué dientes vienen a continuación y alrededor de qué mes',
          'La regla práctica: edad en meses menos 6 da aproximadamente la cantidad de dientes',
          'Los cuidados de higiene bucal que corresponden a esa etapa',
        ],
        warn: [
          DISCLAIMER,
          'La cronología es orientativa: dos o tres meses de diferencia para arriba o para abajo entran dentro de lo normal',
          'Si al año no salió ningún diente, conviene consultarlo con el pediatra o el odontopediatra',
          'La primera consulta odontológica se recomienda antes del año, o dentro de los 6 meses del primer diente',
          'Fiebre alta, diarrea o decaimiento importante NO son de la dentición: son motivo de consulta médica',
        ],
        plazo: 'primera visita al odontopediatra antes del año; después, control cada 6 meses.',
      },
    ],
  },

  inputsTitle: 'Cargá los datos del bebé',
  inputsIntro:
    'Con sexo, edad en meses y peso ya sale el percentil. Las semanas de gestación sirven para la rama de prematuro y la medida del pie para la talla de calzado.',
  fields: [
    {
      id: 'sexo',
      label: 'Sexo',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'Varón' },
        { value: 'f', label: 'Mujer' },
      ],
    },
    { id: 'edadMeses', label: 'Edad (meses cumplidos)', type: 'number', suffix: 'meses', min: 0, max: 36, step: 1, value: 6 },
    { id: 'peso', label: 'Peso actual', type: 'number', suffix: 'kg', min: 0.5, max: 25, step: 0.05, value: 7.9 },
    { id: 'talla', label: 'Talla o longitud (opcional)', type: 'number', suffix: 'cm', min: 30, max: 110, step: 0.5, value: 67 },
    {
      id: 'semanasGestacion',
      label: 'Semanas de gestación al nacer',
      type: 'number',
      suffix: 'semanas',
      min: 23,
      max: 42,
      step: 1,
      value: 40,
      help: '40 = nacimiento a término. Menos de 37 es prematuro.',
    },
    { id: 'pieCm', label: 'Largo del pie (opcional)', type: 'number', suffix: 'cm', min: 7, max: 18, step: 0.5, value: 10 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Franjas de percentil de peso',
    caption:
      'La escala va de 0 a 100 e indica el percentil: si 100 bebés del mismo sexo y la misma edad se ordenaran del más liviano al más pesado, el percentil dice cuántos quedan por debajo. Las franjas son las de la OMS: bajo peso por debajo del P3, franja baja hasta el P15, rango esperado entre P15 y P85, franja alta hasta el P97 y peso elevado por encima. Un percentil bajo o alto no es un diagnóstico.',
    bands: BANDS,
  },
  breakdownTitle: 'Los números detrás del resultado',
  breakdownIntro:
    'Las barras comparan cada valor con el más grande del bloque. Cada fila lleva su unidad: kilos, centímetros, meses, semanas o dientes.',

  faq: [
    {
      q: '¿Qué significa que mi bebé esté en el percentil 25 de peso?',
      a: 'Que de cada 100 bebés del mismo sexo y la misma edad, 25 pesan menos que él y 75 pesan más. El percentil 25 está dentro del rango esperado: no es "poco peso". Lo que el pediatra evalúa no es el número suelto sino si el bebé se mantiene en su carril de crecimiento entre un control y otro.',
    },
    {
      q: '¿Qué tablas de percentiles se usan para un bebé?',
      a: 'Las de los Patrones de Crecimiento Infantil de la OMS 2006, que son las que adopta la Sociedad Argentina de Pediatría y el Ministerio de Salud para menores de 5 años. Acá se usan los coeficientes LMS oficiales de peso para la edad, así que el percentil sale por Z-score exacto y no por interpolación entre columnas de una tabla impresa.',
    },
    {
      q: '¿Por qué no me calculan el percentil de talla?',
      a: 'Porque para la talla hacen falta las curvas de longitud para la edad de la OMS, que no tenemos cargadas con los coeficientes oficiales, y en salud infantil preferimos no estimar una curva que no podemos respaldar. La talla se registra como dato medido y se lee en la curva de longitud de la libreta sanitaria durante el control pediátrico.',
    },
    {
      q: '¿Qué es la edad corregida de un bebé prematuro?',
      a: 'Es la edad del calendario menos las semanas que le faltaron para llegar a las 40 de gestación. Un bebé de 6 meses nacido a las 32 semanas tiene 8 semanas de prematurez, así que su edad corregida es de unos 4 meses. Crecimiento, alimentación y desarrollo se evalúan con esa edad corregida, no con la del calendario.',
    },
    {
      q: '¿Hasta cuándo se corrige la edad de un prematuro?',
      a: 'En general hasta los 24 meses de edad corregida. A partir de ahí la mayoría de los pediatras pasa a usar la edad cronológica para casi todas las evaluaciones, porque el desfasaje del nacimiento anticipado suele haberse emparejado. Ojo: las vacunas nunca se corrigen, se dan siempre por edad de calendario.',
    },
    {
      q: '¿Mi bebé tiene que llegar a los hitos en el mes exacto?',
      a: 'No. Los hitos son rangos amplios, no fechas. Que un bebé camine a los 11 meses y otro a los 15 entra dentro de lo esperable. Lo que sí se consulta siempre es que el bebé pierda una habilidad que ya tenía, que no haya progreso durante varios meses o que aparezca alguna de las señales de alerta de su edad.',
    },
    {
      q: '¿Cuándo salen los dientes y en qué orden?',
      a: 'Los primeros suelen ser los incisivos centrales inferiores, entre los 6 y los 10 meses. Después vienen los centrales superiores, los laterales, los primeros molares, los caninos y los segundos molares. Los 20 dientes de leche se completan alrededor de los 30 meses. La regla práctica es edad en meses menos 6 para estimar cuántos dientes esperar.',
    },
    {
      q: '¿La salida de los dientes da fiebre?',
      a: 'La dentición puede dar molestia, babeo, encías inflamadas y sueño alterado, e incluso un décimo de más. Fiebre alta, diarrea o decaimiento importante no se explican por los dientes: si aparecen, corresponde una consulta médica en lugar de atribuirlos a la dentición.',
    },
    {
      q: '¿Qué talla de zapato le corresponde a mi bebé?',
      a: 'La talla se define por el largo del pie medido en centímetros, no por la edad: un pie de 12 cm es talla 19 argentina o europea. Si no lo mediste, la edad da una referencia aproximada. Conviene volver a medir cada 2 o 3 meses y dejar entre 1 y 1,5 cm de holgura entre el dedo más largo y la punta del zapato.',
    },
    {
      q: '¿Y si mi hijo ya no es un bebé?',
      a: 'Este hub cubre de 0 a 24 meses: percentil de peso del lactante, prematurez, hitos y dientes. Para chicos en edad escolar y adolescentes está la guía <a href="/salud/crecimiento-infantil">¿Está bien el peso y la altura de mi hijo?</a>, que trabaja con IMC para la edad por percentil, estimación de talla adulta y peso máximo de la mochila escolar.',
    },
    {
      q: '¿Puedo cambiarle la alimentación con este resultado?',
      a: 'No. El resultado es orientativo y no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Ningún cambio en la lactancia, la fórmula, la alimentación complementaria o los suplementos de un bebé debería arrancar sin la indicación de un pediatra o un nutricionista infantil matriculado.',
    },
  ],

  sources: [
    {
      name: 'Patrones de Crecimiento Infantil de la OMS — peso para la edad, coeficientes LMS (0 a 5 años)',
      url: 'https://www.who.int/tools/child-growth-standards/standards/weight-for-age',
      publisher: 'Organización Mundial de la Salud',
      date: 'estándares 2006',
    },
    {
      name: 'Guías para la evaluación del crecimiento físico (Libro Verde)',
      url: 'https://www.sap.org.ar/docs/publicaciones/libro_verde_sap_3ra_edicion.pdf',
      publisher: 'Sociedad Argentina de Pediatría',
      date: '3.ª edición',
    },
    {
      name: 'Seguimiento del recién nacido prematuro: uso de la edad corregida',
      url: 'https://www.sap.org.ar/docs/publicaciones/primero/2019/Consenso_Seguimiento_prematuros.pdf',
      publisher: 'Sociedad Argentina de Pediatría',
    },
    {
      name: 'Control de crecimiento y desarrollo — percentilos, curvas y libreta sanitaria',
      url: 'https://www.argentina.gob.ar/salud/crecerconsalud',
      publisher: 'Ministerio de Salud de la Nación',
    },
    {
      name: 'Calendario Nacional de Vacunación (las vacunas del prematuro van por edad cronológica)',
      url: 'https://www.argentina.gob.ar/salud/vacunas/calendario',
      publisher: 'Ministerio de Salud de la Nación',
    },
  ],

  replaces: [
    '/calculadora-percentil-bebe-oms',
    '/calculadora-edad-corregida-prematuro',
    '/calculadora-peso-ideal-bebe-mes-percentil',
    '/calculadora-hitos-desarrollo-bebe-edad-meses',
    '/calculadora-talla-zapato-bebe',
    '/calculadora-desarrollo-motor-bebe',
    '/calculadora-dientes-bebe-cronologia',
    '/calculadora-percentil-peso-bebe-oms-edad-meses',
    '/calculadora-edad-gestacional-corregida-prematuro',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-cuna-colecho-edad-transicion-cama',
    '/calculadora-edad-quitar-panal-control-esfinteres',
    '/calculadora-vacunas-faltantes-bebe-edad-meses',
    '/calculadora-vacunas-bebe-calendario-2026-argentina-edad',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
