import type { HubData } from './types';
import { getCalculatorDisclaimer } from '../disclaimers';
import { LMS_MALE, LMS_FEMALE } from '../formulas/_cdc-bmi-lms';
import {
  WFA_BOYS_L, WFA_BOYS_M, WFA_BOYS_S,
  WFA_GIRLS_L, WFA_GIRLS_M, WFA_GIRLS_S,
  WFA_MAX_DAYS,
} from '../formulas/_oms-wfa-lms';

/**
 * Hub de decisión — "¿Está bien el peso y la altura de mi hijo?"
 * Arquetipo: RAMIFICADO (4 ramas). Absorbe 7 calculadoras sueltas (ver `replaces`).
 *
 * CONTENIDO YMYL DE SALUD INFANTIL. Reglas aplicadas:
 *  - El disclaimer sale de `getCalculatorDisclaimer({ category: 'salud' })`
 *    (dominio `health`), no de un texto inventado acá. Va en `fineprint`, que es
 *    el único slot de aviso que expone el contrato de HubData.
 *  - El hub NO da consejo clínico: informa el percentil, la franja en la que cae
 *    y remite al pediatra. Ninguna rama sugiere dieta, suplemento ni tratamiento.
 *
 * DATOS: no se inventa un solo valor de referencia.
 *  - IMC-para-edad: tablas LMS oficiales CDC 2000 (`src/lib/formulas/_cdc-bmi-lms.ts`,
 *    bmiagerev.csv), las mismas que usa `indice-masa-corporal-pediatrico`.
 *  - Peso-para-edad 0–5 años: tablas LMS oficiales OMS 2006
 *    (`src/lib/formulas/_oms-wfa-lms.ts`, weianthro), las que usa
 *    `peso-ideal-bebe-mes-percentil`.
 *  - % de talla adulta alcanzada por edad: tabla WHO Growth Reference 5-19 +
 *    Bayley-Pinneau que ya vivía en `aumento-altura-adolescente-prediccion.ts`.
 *  - Talla diana familiar: Tanner 1970, igual que `estatura-adulta-hijo.ts`.
 *  - Mochila: 10% del peso corporal (límite ideal) y máximo absoluto por edad,
 *    igual que `mochila-escolar-peso-maximo-edad-espalda.ts`.
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado — mismo
 * problema que ya documentó el hub `salud/peso-ideal-imc`):
 *  - RESUELTO: `HubRow`/`HubResult` ya aceptan `format: 'ars'|'plain'|'unit'`,
 *    `unit` y `decimals`. Acá se usa `unit` kg / cm / kg/m² y `plain` para los
 *    percentiles; `ref` quedó sólo para la fuente (OMS 2006, CDC 2000, Tanner).
 *    OJO: el override por fila pisa la base con `undefined`, así que CADA fila
 *    declara su formato explícitamente.
 *  - `chart.type: 'scale'` y `chart.bands` todavía no tienen render propio:
 *    siempre se dibuja el donut. Igual se declaran porque son el dato correcto,
 *    y `position` / `positionLabel` se devuelven según el contrato.
 *  - Los tonos disponibles son main/exit/prop/good/warn; se mapean a las franjas
 *    (normal → good, bajo peso → warn, sobrepeso → prop, obesidad → main) y la
 *    etiqueta de la leyenda es la que lleva el significado.
 */

/** Franjas de lectura del percentil (corte OMS 5-19: P3 / P85 / P97). */
export const BANDS = [
  { label: 'Bajo peso (< P3)', from: 0, to: 3, tone: 'bad' as const },
  { label: 'Rango esperado (P3–P85)', from: 3, to: 85, tone: 'good' as const },
  { label: 'Sobrepeso (P85–P97)', from: 85, to: 97, tone: 'warn' as const },
  { label: 'Obesidad (> P97)', from: 97, to: 100, tone: 'bad' as const },
];

/** Tono de la franja traducido a los tonos que entiende el runtime del hub. */
export const BAND_TONES = ['warn', 'good', 'prop', 'main'] as const;

type LmsRow = readonly [number, number, number, number];

/**
 * Muestreo cada 3 meses de la tabla CDC (que viene cada 1 mes) para no inflar el
 * HTML: la curva LMS es suave y la interpolación lineal en 3 meses mueve el
 * percentil por debajo de la décima. Los valores son los oficiales, sin retocar.
 */
function sampleCdc(table: ReadonlyArray<LmsRow>): number[][] {
  const out: number[][] = [];
  let last = -99;
  for (const [age, L, M, S] of table) {
    if (age - last >= 3 || age === table[table.length - 1][0]) {
      out.push([age, L, M, S]);
      last = age;
    }
  }
  return out;
}

export const BMI_LMS = {
  m: sampleCdc(LMS_MALE),
  f: sampleCdc(LMS_FEMALE),
};

/** Peso-para-edad OMS: se toma un punto por mes (la tabla original es diaria). */
const DIAS_POR_MES = 30.4375;
function sampleWfa(L: ReadonlyArray<number>, M: ReadonlyArray<number>, S: ReadonlyArray<number>): number[][] {
  const out: number[][] = [];
  for (let mes = 0; mes <= 60; mes++) {
    const dia = Math.min(WFA_MAX_DAYS, Math.round(mes * DIAS_POR_MES));
    out.push([mes, L[dia], M[dia], S[dia]]);
  }
  return out;
}

export const WFA_LMS = {
  m: sampleWfa(WFA_BOYS_L, WFA_BOYS_M, WFA_BOYS_S),
  f: sampleWfa(WFA_GIRLS_L, WFA_GIRLS_M, WFA_GIRLS_S),
};

/**
 * Porcentaje de talla adulta ya alcanzado por edad y sexo.
 * Fuente: WHO Growth Reference 5-19 + Bayley-Pinneau (valores medios), la misma
 * tabla que usa `aumento-altura-adolescente-prediccion.ts`.
 */
export const PCT_ADULTO: Record<string, Record<number, number>> = {
  m: { 8: 72, 9: 75, 10: 78, 11: 81, 12: 84, 13: 87, 14: 91, 15: 95, 16: 98, 17: 99, 18: 99.5 },
  f: { 8: 80, 9: 84, 10: 88, 11: 92, 12: 95, 13: 97, 14: 99, 15: 99.5, 16: 99.8, 17: 99.9, 18: 100 },
};

/** Límite absoluto de mochila por edad (el ideal es siempre el 10%). */
export const MOCHILA_MAX: Array<{ hasta: number; ideal: number; absoluto: number }> = [
  { hasta: 5, ideal: 0.1, absoluto: 0.1 },
  { hasta: 9, ideal: 0.1, absoluto: 0.12 },
  { hasta: 12, ideal: 0.1, absoluto: 0.13 },
  { hasta: 18, ideal: 0.1, absoluto: 0.15 },
];

const DISCLAIMER = getCalculatorDisclaimer({ slug: 'salud/crecimiento-infantil', category: 'salud' }, 'es');

export const hub: HubData = {
  slug: 'salud/crecimiento-infantil',
  title: '¿Está bien el peso y la altura de mi hijo? Percentiles de crecimiento 2026',
  description:
    'Percentil de IMC para la edad con las tablas CDC, percentil de peso con las curvas OMS, estimación de la talla adulta y peso máximo de la mochila escolar. Orientativo: la lectura final es del pediatra.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía de crecimiento infantil',
  h1: '¿Está bien el peso y la altura de mi hijo?',
  lede:
    'Partimos de la pregunta más común: si el peso es el esperado para la edad. Se calcula el IMC y en qué percentil cae según las tablas oficiales. Si lo que querés es la curva de peso de un bebé, cuánto va a medir de grande o cuánto puede pesar la mochila, cambiás la rama abajo.',
  stamps: [
    'Actualizado 27-07-2026',
    'Tablas CDC 2000 y OMS 2006',
    '7 calculadoras adentro',
    'No reemplaza al pediatra',
  ],

  resultLabel: 'Dónde cae tu hijo/a',

  cases: {
    title: '¿Qué querés mirar?',
    intro:
      'Cada rama usa la tabla de referencia que corresponde a esa edad y a ese indicador. Los mismos datos sirven para las cuatro.',
    items: [
      {
        id: 'imc',
        label: 'Si su peso es el esperado para la edad',
        hint: 'IMC por percentil · 2 a 18 años',
        answer: 'En chicos el IMC no se lee por el número: se lee por el percentil para la edad y el sexo.',
        yes: [
          'IMC calculado con peso y talla (peso ÷ talla²)',
          'Percentil exacto por Z-score con las tablas LMS del CDC 2000',
          'La franja en la que cae: bajo peso (< P3), esperado (P3–P85), sobrepeso (P85–P97) u obesidad (> P97)',
          'El IMC de la mediana (P50) para esa edad y sexo, para comparar',
        ],
        warn: [
          'Un IMC de 17 puede ser normal a los 4 años y bajo a los 14: sin la edad y el sexo el número no dice nada',
          'El IMC no distingue músculo de grasa ni contempla contextura, prematurez ni patología de base',
          'Un valor fuera de P3–P97 no es un diagnóstico: es un motivo para consultar',
        ],
        plazo: 'llevá el resultado al control pediátrico; en menores de 2 años este indicador no se usa.',
      },
      {
        id: 'percentiles',
        label: 'En qué percentil de peso y talla está',
        hint: 'Curvas OMS · 0 a 5 años',
        answer: 'Hasta los 5 años el indicador es el peso para la edad con las curvas OMS 2006.',
        yes: [
          'Percentil de peso para la edad con las tablas LMS oficiales de la OMS (0 a 5 años)',
          'El peso de la mediana (P50) del mes que cumple y el rango P3–P97',
          'De 5 a 18 años se pasa automáticamente al percentil de IMC, que es el indicador válido en esa edad',
          'Lectura de la talla contra la talla adulta proyectada',
        ],
        warn: [
          'La OMS no publica peso-para-edad como indicador de referencia después de los 10 años: a partir de ahí se lee IMC-para-edad',
          'Un percentil bajo estable puede ser normal; lo que se mira en el control es el cambio de curva, no un punto suelto',
          'Un salto o una caída de dos franjas entre controles se consulta siempre',
        ],
        plazo: 'los controles de crecimiento son mensuales el primer semestre y luego se espacian; los fija el pediatra.',
      },
      {
        id: 'talla-adulta',
        label: 'Cuánto va a medir de grande',
        hint: 'Talla diana + proyección por edad',
        answer: 'La talla diana familiar da un rango de ±8,5 cm, no un número exacto.',
        yes: [
          'Talla diana genética por el método de Tanner: (papá + mamá ± 13) ÷ 2',
          'Rango probable de ±8,5 cm, que cubre al 95% de los casos',
          'Proyección desde la talla actual según el porcentaje de talla adulta ya alcanzado a esa edad',
          'Estimación central promediando ambos métodos',
        ],
        warn: [
          'Es una estimación estadística, no una predicción individual: nutrición, sueño, salud y el momento de la pubertad la mueven',
          'La proyección por edad supone una pubertad de tiempos promedio; un desarrollo adelantado o retrasado la corre varios centímetros',
          'La predicción fina se hace con radiografía de edad ósea, y eso lo indica el pediatra o el endocrinólogo infantil',
        ],
        plazo: 'si la talla se aleja del rango familiar o el crecimiento se frena, se consulta sin esperar al próximo control.',
      },
      {
        id: 'mochila',
        label: 'Cuánto puede pesar la mochila del colegio',
        hint: '10% del peso corporal',
        answer: 'La mochila cargada no debería superar el 10% del peso del chico.',
        yes: [
          'Límite ideal: 10% del peso corporal, mochila vacía incluida',
          'Máximo absoluto según la edad: 10% hasta 5 años, 12% hasta 9, 13% hasta 12 y 15% de 13 a 18',
          'Cuánto margen queda para los útiles descontando el peso de la mochila vacía',
          'Comparación con lo que pesa hoy la mochila cargada',
        ],
        warn: [
          'Entre los 10 y los 14 años la columna está en pico de crecimiento y es más vulnerable a la sobrecarga',
          'Una mochila de un solo hombro o colgando debajo de la cintura concentra la carga aunque el peso esté dentro del límite',
          'Si aparece dolor de espalda persistente, la consulta es con el pediatra, no con la calculadora',
        ],
        plazo: 'pesá la mochila cargada al arrancar el año y de nuevo a mitad de año, que es cuando más se acumula.',
      },
    ],
  },

  inputsTitle: 'Cargá los datos del chico o la chica',
  inputsIntro:
    'Con sexo, edad, peso y talla ya sale el percentil. Las alturas de los padres y el peso de la mochila sirven para las otras dos ramas.',
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
    { id: 'edad', label: 'Edad', type: 'number', suffix: 'años', min: 0, max: 18, step: 0.5, value: 8 },
    { id: 'peso', label: 'Peso', type: 'number', suffix: 'kg', min: 2, max: 150, step: 0.1, value: 26 },
    { id: 'talla', label: 'Talla (altura)', type: 'number', suffix: 'cm', min: 40, max: 210, step: 0.5, value: 128 },
    { id: 'alturaPadre', label: 'Altura del padre', type: 'number', suffix: 'cm', min: 130, max: 230, step: 1, value: 176 },
    { id: 'alturaMadre', label: 'Altura de la madre', type: 'number', suffix: 'cm', min: 130, max: 220, step: 1, value: 163 },
    { id: 'mochila', label: 'Peso de la mochila cargada', type: 'number', suffix: 'kg', min: 0, max: 20, step: 0.1, value: 4.5 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Franjas de percentil',
    caption:
      'La escala va de 0 a 100 e indica el percentil: si 100 chicos de la misma edad y sexo se ordenaran de menor a mayor, el percentil dice cuántos quedan por debajo. Las franjas son las de la OMS: bajo peso por debajo del P3, rango esperado entre P3 y P85, sobrepeso entre P85 y P97, obesidad por encima del P97. Estar en un percentil bajo o alto no es un diagnóstico.',
    bands: BANDS,
  },
  breakdownTitle: 'Los números detrás del percentil',
  breakdownIntro:
    'Las barras comparan cada valor con el más grande del bloque. Cada fila lleva su unidad: kilos, centímetros, kg/m² de IMC y percentiles.',

  faq: [
    {
      q: '¿Qué significa que mi hijo esté en el percentil 25?',
      a: 'Que de cada 100 chicos de la misma edad y sexo, 25 pesan (o miden) menos que él y 75 pesan más. El percentil 25 está dentro del rango esperado: no es "poco". Lo que el pediatra mira no es el número suelto sino si el chico se mantiene en su carril de crecimiento entre un control y otro.',
    },
    {
      q: '¿Por qué el IMC de un chico no se lee como el de un adulto?',
      a: 'Porque la composición corporal cambia todo el tiempo durante el crecimiento. Un IMC de 17 es normal a los 4 años y bajo a los 14. Por eso en menores de 18 años el IMC se convierte a percentil según edad y sexo, con las tablas del CDC o de la OMS, y se lee esa franja.',
    },
    {
      q: '¿A partir de qué percentil hay que consultar al pediatra?',
      a: 'Las guías toman como señal de alerta un percentil por debajo del P3 o por encima del P97, y también un cambio de dos franjas entre controles aunque el valor siga adentro del rango. En cualquiera de esos casos corresponde una evaluación pediátrica: este cálculo orienta, no diagnostica.',
    },
    {
      q: '¿Qué tablas se usan, las de la OMS o las del CDC?',
      a: 'Las dos, según el indicador. Para el peso para la edad de 0 a 5 años se usan las tablas LMS de los Patrones de Crecimiento Infantil de la OMS (2006), que son las que adopta la Sociedad Argentina de Pediatría para esa franja. Para el IMC para la edad de 2 a 18 años se usan las tablas LMS del CDC 2000, que llegan hasta los 20 años. Las franjas de lectura que mostramos (P3, P85, P97) son las de la OMS.',
    },
    {
      q: '¿Cómo se estima cuánto va a medir mi hijo de grande?',
      a: 'Con la talla diana familiar de Tanner: se suman las alturas de los padres, se le suman 13 cm si es varón o se le restan 13 cm si es mujer, y se divide por dos. El resultado trae un rango de ±8,5 cm que cubre al 95% de los casos. Se cruza con la proyección desde la talla actual según el porcentaje de talla adulta ya alcanzado a esa edad.',
    },
    {
      q: '¿Cuánto puede pesar la mochila del colegio?',
      a: 'El criterio más difundido es el 10% del peso corporal como límite ideal, con la mochila vacía incluida. El máximo absoluto se estira con la edad: hasta 12% entre los 6 y 9 años, 13% entre los 10 y 12, y 15% en la secundaria. Entre los 10 y los 14 años conviene ser más estricto porque es el pico de crecimiento.',
    },
    {
      q: '¿Un chico en el percentil 90 de peso tiene sobrepeso?',
      a: 'En el percentil 90 de IMC para la edad cae dentro de la franja P85–P97, que las guías de la OMS clasifican como sobrepeso. No es un diagnóstico ni implica una dieta: es el motivo para que un pediatra evalúe crecimiento, hábitos y antecedentes antes de decidir cualquier cosa.',
    },
    {
      q: '¿Sirve para bebés menores de 2 años?',
      a: 'El percentil de peso para la edad sí, desde el nacimiento, con las curvas de la OMS. El IMC para la edad no: en menores de 2 años el indicador que se usa es peso para la talla, no IMC. Esos primeros dos años se siguen con la libreta de control del pediatra.',
    },
    {
      q: '¿Puedo tomar decisiones de alimentación con este resultado?',
      a: 'No. El resultado es orientativo y no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Ninguna restricción alimentaria, suplemento ni plan de actividad en un chico debería arrancar sin la indicación de un pediatra o un nutricionista infantil matriculado.',
    },
  ],

  sources: [
    {
      name: 'Patrones de Crecimiento Infantil de la OMS — tablas y estándares (peso para la edad, IMC para la edad)',
      url: 'https://www.who.int/tools/child-growth-standards/standards',
      publisher: 'Organización Mundial de la Salud',
      date: 'estándares 2006 y referencia 5-19 años',
    },
    {
      name: 'CDC Growth Charts — datos LMS de IMC para la edad (bmiagerev)',
      url: 'https://www.cdc.gov/growthcharts/percentile_data_files.htm',
      publisher: 'Centers for Disease Control and Prevention',
      date: 'tablas 2000',
    },
    {
      name: 'Guías para la evaluación del crecimiento físico',
      url: 'https://www.sap.org.ar/docs/publicaciones/libro_verde_sap_3ra_edicion.pdf',
      publisher: 'Sociedad Argentina de Pediatría',
      date: '3.ª edición',
    },
    {
      name: 'Control de crecimiento y desarrollo: percentilos y curvas',
      url: 'https://www.argentina.gob.ar/salud/crecerconsalud',
      publisher: 'Ministerio de Salud de la Nación',
    },
  ],

  replaces: [
    '/calculadora-indice-masa-corporal-pediatrico',
    '/calculadora-imc-infantil-percentil',
    '/calculadora-percentiles-crecimiento-pediatrico',
    '/calculadora-estatura-adulta-hijo',
    '/calculadora-aumento-altura-adolescente-prediccion',
    '/calculadora-adolescente-estatura-final-prediccion-edad-huesos',
    '/calculadora-mochila-escolar-peso-maximo-edad-espalda',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
