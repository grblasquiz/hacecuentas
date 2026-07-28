import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué dicen estos valores de mi análisis?"
 * Arquetipo RAMIFICADO: la rama es EL ÍNDICE que querés calcular a partir de
 * los valores del laboratorio.
 *
 * Absorbe 4 URLs (ver hub.replaces).
 *
 * ESTE HUB NO DIAGNOSTICA. Todas las ramas son cuentas que el laboratorio a
 * veces no informa (filtrado glomerular estimado, HOMA-IR, calcio corregido,
 * conversión de unidades), y la lectura clínica corresponde al profesional que
 * pidió el estudio. El texto lo dice en cada rama, no sólo en la letra chica:
 * es lo más YMYL del sitio.
 *
 * DIFERENCIA con los otros hubs del silo /salud — no se pisan:
 *   · /salud/peso-ideal-imc, /salud/grasa-corporal → antropometría
 *   · /salud/nutrientes-diarios                    → cuánto comer
 *   Ninguno toma un valor de laboratorio como entrada.
 *
 * NÚMEROS: Cockcroft-Gault (1976), CKD-EPI 2021 SIN coeficiente de raza (la
 * revisión de 2021 lo eliminó: no es un olvido), estadios KDIGO 2012, HOMA-IR y
 * HOMA-Beta (Matthews 1985), QUICKI (Katz 2000), Payne 1973 para el calcio
 * corregido y los factores 38,67 / 88,57 para colesterol y triglicéridos.
 * Todo espejo de las fórmulas originales en src/lib/formulas/.
 *
 * YMYL DE SALUD: aviso textual del dominio `health` de src/lib/disclaimers.ts
 * en `fineprint` y como PRIMER `warn` de cada rama.
 *
 * NOTAS DE CONTRATO: acá no hay plata. TODA fila lleva `format` explícito.
 */

export const DISCLAIMER =
  'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.';

export const hub: HubData = {
  slug: 'salud/analisis-de-sangre',
  title: 'Calculadoras de análisis de sangre: filtrado glomerular, HOMA-IR, calcio corregido y colesterol',
  description:
    'Convertí los valores de tu análisis en los índices que el laboratorio no siempre informa: clearance de creatinina y filtrado glomerular con estadio KDIGO, HOMA-IR y QUICKI, calcio corregido por albúmina y colesterol de mg/dL a mmol/L. Con la interpretación en manos del profesional.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Herramienta de laboratorio',
  h1: 'Los índices que tu análisis no trae calculados',
  lede:
    'Un análisis informa valores; algunos índices hay que calcularlos aparte. Acá están los cuatro más pedidos, con las ecuaciones vigentes y sus límites explicitados. Lo que este hub NO hace es diagnosticar: eso se resuelve en la consulta con quien pidió el estudio.',
  stamps: [
    'CKD-EPI 2021 · KDIGO 2012',
    'HOMA-IR, QUICKI, Payne 1973',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Índice calculado',

  cases: {
    title: '¿Qué querés calcular?',
    intro: 'Elegí el índice. Cargá abajo sólo los valores que ese índice necesita.',
    items: [
      {
        id: 'renal',
        label: 'Función renal',
        hint: 'Clearance y filtrado glomerular',
        answer: 'Se calculan dos cosas distintas: el clearance de Cockcroft-Gault y la TFG de CKD-EPI.',
        yes: [
          'Clearance de creatinina (Cockcroft-Gault 1976), en mL/min: es la referencia de los prospectos para ajustar dosis de fármacos',
          'Filtrado glomerular estimado (CKD-EPI 2021), en mL/min/1,73 m²: es la que usa KDIGO para clasificar enfermedad renal',
          'Estadio KDIGO orientativo de la TFG (G1 a G5)',
        ],
        warn: [
          DISCLAIMER,
          'Las dos ecuaciones NO son intercambiables y por eso se muestran las dos: Cockcroft-Gault depende del peso y no se normaliza por superficie corporal',
          'Ambas asumen creatinina en estado estable: si está subiendo o bajando (falla renal aguda), ninguna de las dos es válida',
          'El estadio KDIGO no se define con un solo resultado: requiere confirmación a los 3 meses y evaluación de la albuminuria',
          'En pediatría no se usa ninguna de estas dos ecuaciones',
        ],
        plazo: 'la revisión de CKD-EPI de 2021 eliminó el coeficiente por raza; acá no está y es correcto que no esté.',
      },
      {
        id: 'insulina',
        label: 'Resistencia a la insulina',
        hint: 'HOMA-IR y QUICKI',
        answer: 'HOMA-IR = glucosa (mmol/L) × insulina (µU/mL) / 22,5, ambas en ayunas.',
        yes: [
          'HOMA-IR, índice de resistencia a la insulina',
          'HOMA-Beta, estimación de la función de la célula beta',
          'QUICKI, el índice recíproco basado en logaritmos',
        ],
        warn: [
          DISCLAIMER,
          'No existe un punto de corte universal de HOMA-IR: edad, población, método del laboratorio y contexto clínico cambian la interpretación. Un número no diagnostica resistencia a la insulina',
          'Las dos muestras tienen que ser del mismo extracción y en ayunas de 8 a 12 horas',
          'Los ensayos de insulina no están estandarizados entre laboratorios: comparar HOMA-IR de dos laboratorios distintos no es válido',
        ],
        plazo: 'el HOMA se usa sobre todo en investigación poblacional; en la consulta pesa más el cuadro completo.',
      },
      {
        id: 'calcio',
        label: 'Calcio corregido por albúmina',
        hint: 'Fórmula de Payne',
        answer: 'Calcio corregido = calcio medido + 0,8 × (4,0 − albúmina en g/dL).',
        yes: [
          'Cerca de la mitad del calcio circula unido a proteínas y no es la fracción activa',
          'Con albúmina baja, el calcio total cae aunque el calcio iónico esté normal',
          'La corrección evita leer una hipocalcemia que no existe',
        ],
        warn: [
          DISCLAIMER,
          'La fórmula de Payne rinde mal en enfermedad renal crónica avanzada y en pacientes críticos: cuando la decisión depende del valor, la referencia es el CALCIO IÓNICO medido, no esta estimación',
          'El rango de referencia habitual del calcio total en adultos es 8,5-10,5 mg/dL, pero cada laboratorio informa el suyo: usá el de tu planilla',
        ],
        plazo: 'si el resultado corregido queda fuera de rango, el paso siguiente es el calcio iónico.',
      },
      {
        id: 'colesterol',
        label: 'Colesterol en otras unidades',
        hint: 'mg/dL ↔ mmol/L',
        answer: 'Para colesterol se divide por 38,67; para triglicéridos, por 88,57.',
        yes: [
          'Conversión entre mg/dL (habitual en América Latina) y mmol/L (Europa)',
          'Los factores son distintos porque el peso molecular de cada lípido es distinto',
          'Referencias de colesterol total: deseable menos de 200, límite 200-239, alto 240 o más (mg/dL)',
        ],
        warn: [
          DISCLAIMER,
          'El colesterol total solo no define riesgo cardiovascular: lo que se evalúa es el perfil completo (LDL, HDL, triglicéridos) junto con edad, presión, tabaquismo y diabetes',
          'Un resultado fuera de rango no se trata por su cuenta ni se corrige con suplementos: se lleva a la consulta',
        ],
        plazo: 'para triglicéridos, el ayuno previo cambia bastante el valor: seguí la indicación del laboratorio.',
      },
    ],
  },

  inputsTitle: 'Cargá los valores de tu planilla',
  inputsIntro: 'Sólo hacen falta los del índice que elegiste; el resto podés dejarlos como están.',
  fields: [
    { id: 'edad', label: 'Edad', type: 'number', min: 18, max: 110, value: 45 },
    {
      id: 'sexo',
      label: 'Sexo',
      type: 'select',
      value: 'mujer',
      options: [
        { value: 'mujer', label: 'Mujer' },
        { value: 'hombre', label: 'Varón' },
      ],
    },
    { id: 'peso', label: 'Peso', type: 'number', min: 20, max: 250, value: 70, suffix: 'kg' },
    { id: 'altura', label: 'Altura', type: 'number', min: 120, max: 220, value: 168, suffix: 'cm' },
    { id: 'creatinina', label: 'Creatinina sérica', type: 'number', min: 0.1, max: 20, step: 0.01, value: 0.9, suffix: 'mg/dL' },
    { id: 'glucosa', label: 'Glucosa en ayunas', type: 'number', min: 20, max: 600, value: 92, suffix: 'mg/dL' },
    { id: 'insulina', label: 'Insulina en ayunas', type: 'number', min: 0.1, max: 500, step: 0.1, value: 8, suffix: 'µU/mL' },
    { id: 'calcio', label: 'Calcio total', type: 'number', min: 3, max: 20, step: 0.1, value: 8.6, suffix: 'mg/dL' },
    { id: 'albumina', label: 'Albúmina', type: 'number', min: 0.5, max: 7, step: 0.1, value: 3.2, suffix: 'g/dL' },
    { id: 'colesterol', label: 'Colesterol total', type: 'number', min: 20, max: 700, value: 195, suffix: 'mg/dL' },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde cae el resultado',
    caption:
      'El eje y las franjas cambian según el índice elegido: estadios KDIGO en función renal, rango de referencia en calcio, y clasificación de colesterol total. La franja no es un diagnóstico: es la referencia poblacional sobre la que después el profesional interpreta tu caso.',
  },
  breakdownTitle: 'El detalle del cálculo',
  breakdownIntro: 'Las barras comparan cada número con el más grande del desglose.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre clearance de creatinina y filtrado glomerular?',
      a: 'El clearance de Cockcroft-Gault estima el aclaramiento en mL/min sin normalizar por superficie corporal, y depende del peso; es la referencia histórica de los prospectos para ajustar dosis de fármacos. El filtrado glomerular de CKD-EPI se informa en mL/min/1,73 m² y es la ecuación que recomienda KDIGO para clasificar enfermedad renal crónica. Dan números distintos y eso no es un error.',
    },
    {
      q: '¿Por qué CKD-EPI ya no usa el coeficiente por raza?',
      a: 'La revisión de 2021 lo eliminó porque la raza es una categoría social, no biológica, y su uso introducía sesgos que retrasaban el diagnóstico y el acceso al trasplante en pacientes afrodescendientes. Si una calculadora todavía lo aplica, está usando la versión de 2009.',
    },
    {
      q: '¿Qué significa el estadio KDIGO de mi filtrado?',
      a: 'G1 es TFG normal o alta (90 o más), G2 descenso leve (60–89), G3a leve a moderado (45–59), G3b moderado a grave (30–44), G4 grave (15-29) y G5 fallo renal (menos de 15). El estadio no se define con un único resultado: hace falta confirmarlo a los 3 meses y sumar la albuminuria.',
    },
    {
      q: '¿Cómo se calcula el HOMA-IR?',
      a: 'HOMA-IR = glucosa en ayunas (mmol/L) × insulina en ayunas (µU/mL) / 22,5. Si tu glucosa está en mg/dL, se divide por 18 para pasarla a mmol/L. Ambas muestras tienen que salir de la misma extracción, con 8 a 12 horas de ayuno.',
    },
    {
      q: '¿Qué HOMA-IR es "normal"?',
      a: 'No hay un punto de corte universal. Los umbrales que circulan (1,8, 2,5, 2,7, 3,0) provienen de poblaciones distintas y de ensayos de insulina que no están estandarizados entre laboratorios. Por eso el índice sirve más para seguimiento y estudios poblacionales que para poner una etiqueta a una persona.',
    },
    {
      q: '¿Qué es el QUICKI?',
      a: 'Es un índice recíproco basado en logaritmos: 1 / (log insulina + log glucosa en mg/dL). Correlaciona mejor que el HOMA-IR con el clamp euglucémico en algunos grupos y tiene menos dispersión, pero comparte la misma limitación: no hay corte universal.',
    },
    {
      q: '¿Cuándo hay que corregir el calcio por albúmina?',
      a: 'Cuando la albúmina está fuera de rango, algo frecuente en internación, hepatopatía, desnutrición o síndrome nefrótico. Casi la mitad del calcio circulante viaja unido a albúmina y no es la fracción activa; con albúmina baja el calcio total cae aunque el iónico esté normal.',
    },
    {
      q: '¿La fórmula de Payne siempre sirve?',
      a: 'No. Se derivó de una población concreta y su desempeño es pobre en enfermedad renal crónica avanzada y en pacientes críticos. Cuando la conducta clínica depende del valor, la referencia es el calcio iónico medido directamente.',
    },
    {
      q: '¿Cómo paso el colesterol de mg/dL a mmol/L?',
      a: 'Se divide por 38,67. Para triglicéridos el factor es 88,57. Son distintos porque dependen del peso molecular: el colesterol es una molécula única y los triglicéridos, un promedio de especies más pesadas.',
    },
    {
      q: '¿Qué valores de colesterol total se consideran altos?',
      a: 'Como referencia poblacional: deseable por debajo de 200 mg/dL, límite alto entre 200 y 239, y alto a partir de 240. Pero el colesterol total aislado dice poco: lo que se evalúa es el perfil completo dentro del riesgo cardiovascular global.',
    },
    {
      q: '¿Esta página me dice si tengo una enfermedad?',
      a: 'No, y no puede. Son conversiones y ecuaciones que devuelven un número a partir de los valores que cargaste. La interpretación depende de tu historia clínica, de la medicación que tomes, del método del laboratorio y del contexto. Llevá el resultado a quien pidió el estudio.',
    },
  ],

  sources: [
    {
      name: 'New Creatinine- and Cystatin C–Based Equations to Estimate GFR without Race (CKD-EPI 2021)',
      url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2102953',
      publisher: 'New England Journal of Medicine',
      date: '2021',
    },
    {
      name: 'KDIGO 2012 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease',
      url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/',
      publisher: 'Kidney Disease: Improving Global Outcomes',
      date: '2012',
    },
    {
      name: 'Homeostasis model assessment: insulin resistance and beta-cell function (Matthews et al.)',
      url: 'https://link.springer.com/article/10.1007/BF00280883',
      publisher: 'Diabetologia',
      date: '1985',
    },
    {
      name: 'Interpretation of serum calcium in patients with abnormal serum proteins (Payne et al.)',
      url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1587185/',
      publisher: 'British Medical Journal',
      date: '1973',
    },
  ],

  replaces: [
    '/calculadora-clearance-creatinina-filtrado-glomerular',
    '/calculadora-homa-ir-quicki',
    '/calculadora-calcio-corregido-albumina',
    '/calculadora-conversion-colesterol-mg-mmol',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Estadios KDIGO 2012 de TFG, en mL/min/1,73 m². */
export const KDIGO: Array<{ desde: number; codigo: string; texto: string }> = [
  { desde: 90, codigo: 'G1', texto: 'G1 — TFG normal o alta (≥90)' },
  { desde: 60, codigo: 'G2', texto: 'G2 — descenso leve (60–89)' },
  { desde: 45, codigo: 'G3a', texto: 'G3a — descenso leve a moderado (45–59)' },
  { desde: 30, codigo: 'G3b', texto: 'G3b — descenso moderado a grave (30–44)' },
  { desde: 15, codigo: 'G4', texto: 'G4 — descenso grave (15–29)' },
  { desde: 0, codigo: 'G5', texto: 'G5 — fallo renal (<15)' },
];

/** Factores de conversión de lípidos: mg/dL por cada mmol/L. */
export const LIPIDOS = { colesterol: 38.67, trigliceridos: 88.57 };

/** Constantes de la corrección de Payne (1973). */
export const PAYNE = { albuminaRef: 4.0, factor: 0.8, refMin: 8.5, refMax: 10.5 };
