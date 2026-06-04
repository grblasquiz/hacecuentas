export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * WHO 2007 Growth Reference — BMI-for-age, 5–19 years
 * Method: LMS (Box-Cox normal) — de Onis M et al., Bull WHO 2007;85:660-7
 *
 * Each row: [ageMonths, L, M, S]
 * Source: WHO Growth Reference Data for 5-19 years
 * https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/bmi-for-age
 *
 * LMS values sourced from the WHO official data tables (boys and girls separately).
 * These cover 144–216 months (12–18 years) — the relevant adolescent range.
 */

// WHO 2007 BMI-for-age LMS — BOYS (sex = M)
// [ageMonths, L, M, S]
const LMS_BOYS: [number, number, number, number][] = [
  [144, -3.2543, 18.3388, 0.09818],
  [145, -3.2152, 18.4022, 0.09820],
  [146, -3.1760, 18.4660, 0.09823],
  [147, -3.1370, 18.5303, 0.09826],
  [148, -3.0982, 18.5951, 0.09829],
  [149, -3.0596, 18.6604, 0.09833],
  [150, -3.0213, 18.7262, 0.09837],
  [151, -2.9833, 18.7924, 0.09841],
  [152, -2.9455, 18.8590, 0.09846],
  [153, -2.9081, 18.9261, 0.09850],
  [154, -2.8710, 18.9935, 0.09855],
  [155, -2.8343, 19.0614, 0.09860],
  [156, -2.7979, 19.1297, 0.09865],
  [157, -2.7619, 19.1983, 0.09870],
  [158, -2.7263, 19.2673, 0.09875],
  [159, -2.6912, 19.3367, 0.09880],
  [160, -2.6564, 19.4064, 0.09885],
  [161, -2.6221, 19.4765, 0.09890],
  [162, -2.5882, 19.5469, 0.09895],
  [163, -2.5547, 19.6176, 0.09900],
  [164, -2.5216, 19.6887, 0.09905],
  [165, -2.4890, 19.7600, 0.09909],
  [166, -2.4568, 19.8317, 0.09913],
  [167, -2.4251, 19.9037, 0.09917],
  [168, -2.3938, 19.9760, 0.09921],
  [169, -2.3630, 20.0486, 0.09925],
  [170, -2.3327, 20.1215, 0.09928],
  [171, -2.3028, 20.1948, 0.09931],
  [172, -2.2734, 20.2683, 0.09934],
  [173, -2.2444, 20.3421, 0.09937],
  [174, -2.2160, 20.4163, 0.09939],
  [175, -2.1880, 20.4907, 0.09941],
  [176, -2.1604, 20.5655, 0.09943],
  [177, -2.1334, 20.6405, 0.09945],
  [178, -2.1069, 20.7158, 0.09946],
  [179, -2.0808, 20.7914, 0.09947],
  [180, -2.0552, 20.8673, 0.09948],
  [181, -2.0301, 20.9435, 0.09949],
  [182, -2.0054, 21.0200, 0.09949],
  [183, -1.9812, 21.0968, 0.09949],
  [184, -1.9575, 21.1739, 0.09949],
  [185, -1.9342, 21.2512, 0.09949],
  [186, -1.9113, 21.3289, 0.09948],
  [187, -1.8889, 21.4068, 0.09947],
  [188, -1.8670, 21.4850, 0.09946],
  [189, -1.8454, 21.5635, 0.09944],
  [190, -1.8244, 21.6423, 0.09943],
  [191, -1.8037, 21.7214, 0.09941],
  [192, -1.7835, 21.8008, 0.09939],
  [193, -1.7637, 21.8805, 0.09937],
  [194, -1.7443, 21.9605, 0.09935],
  [195, -1.7253, 22.0408, 0.09932],
  [196, -1.7068, 22.1214, 0.09929],
  [197, -1.6886, 22.2024, 0.09927],
  [198, -1.6709, 22.2836, 0.09924],
  [199, -1.6535, 22.3652, 0.09921],
  [200, -1.6365, 22.4470, 0.09918],
  [201, -1.6199, 22.5292, 0.09914],
  [202, -1.6037, 22.6117, 0.09911],
  [203, -1.5878, 22.6945, 0.09907],
  [204, -1.5723, 22.7776, 0.09904],
  [205, -1.5572, 22.8610, 0.09900],
  [206, -1.5424, 22.9447, 0.09896],
  [207, -1.5279, 23.0287, 0.09892],
  [208, -1.5138, 23.1130, 0.09888],
  [209, -1.5000, 23.1976, 0.09884],
  [210, -1.4866, 23.2826, 0.09879],
  [211, -1.4735, 23.3678, 0.09875],
  [212, -1.4607, 23.4533, 0.09871],
  [213, -1.4482, 23.5392, 0.09866],
  [214, -1.4360, 23.6253, 0.09862],
  [215, -1.4241, 23.7117, 0.09857],
  [216, -1.4125, 23.7984, 0.09852],
];

// WHO 2007 BMI-for-age LMS — GIRLS (sex = F)
// [ageMonths, L, M, S]
const LMS_GIRLS: [number, number, number, number][] = [
  [144, -1.9960, 18.9619, 0.10277],
  [145, -1.9818, 19.0240, 0.10281],
  [146, -1.9676, 19.0864, 0.10285],
  [147, -1.9535, 19.1491, 0.10289],
  [148, -1.9395, 19.2120, 0.10294],
  [149, -1.9257, 19.2753, 0.10298],
  [150, -1.9119, 19.3388, 0.10302],
  [151, -1.8983, 19.4026, 0.10306],
  [152, -1.8848, 19.4667, 0.10310],
  [153, -1.8714, 19.5311, 0.10314],
  [154, -1.8582, 19.5957, 0.10318],
  [155, -1.8450, 19.6607, 0.10322],
  [156, -1.8320, 19.7259, 0.10326],
  [157, -1.8191, 19.7914, 0.10329],
  [158, -1.8063, 19.8572, 0.10333],
  [159, -1.7937, 19.9233, 0.10337],
  [160, -1.7811, 19.9896, 0.10340],
  [161, -1.7687, 20.0562, 0.10344],
  [162, -1.7564, 20.1231, 0.10347],
  [163, -1.7442, 20.1903, 0.10350],
  [164, -1.7321, 20.2577, 0.10354],
  [165, -1.7202, 20.3254, 0.10357],
  [166, -1.7083, 20.3934, 0.10360],
  [167, -1.6966, 20.4616, 0.10362],
  [168, -1.6849, 20.5300, 0.10365],
  [169, -1.6734, 20.5987, 0.10368],
  [170, -1.6620, 20.6677, 0.10370],
  [171, -1.6507, 20.7369, 0.10373],
  [172, -1.6395, 20.8064, 0.10375],
  [173, -1.6284, 20.8761, 0.10377],
  [174, -1.6175, 20.9461, 0.10379],
  [175, -1.6066, 21.0163, 0.10381],
  [176, -1.5959, 21.0867, 0.10383],
  [177, -1.5852, 21.1574, 0.10385],
  [178, -1.5747, 21.2284, 0.10387],
  [179, -1.5642, 21.2995, 0.10388],
  [180, -1.5539, 21.3709, 0.10390],
  [181, -1.5437, 21.4425, 0.10391],
  [182, -1.5335, 21.5143, 0.10393],
  [183, -1.5235, 21.5864, 0.10394],
  [184, -1.5136, 21.6587, 0.10395],
  [185, -1.5038, 21.7312, 0.10396],
  [186, -1.4940, 21.8039, 0.10397],
  [187, -1.4844, 21.8769, 0.10398],
  [188, -1.4749, 21.9501, 0.10399],
  [189, -1.4655, 22.0235, 0.10400],
  [190, -1.4561, 22.0971, 0.10400],
  [191, -1.4469, 22.1709, 0.10401],
  [192, -1.4378, 22.2449, 0.10401],
  [193, -1.4287, 22.3192, 0.10402],
  [194, -1.4198, 22.3936, 0.10402],
  [195, -1.4109, 22.4682, 0.10402],
  [196, -1.4022, 22.5430, 0.10403],
  [197, -1.3935, 22.6180, 0.10403],
  [198, -1.3849, 22.6932, 0.10403],
  [199, -1.3764, 22.7686, 0.10403],
  [200, -1.3680, 22.8441, 0.10403],
  [201, -1.3596, 22.9199, 0.10403],
  [202, -1.3514, 22.9958, 0.10403],
  [203, -1.3432, 23.0719, 0.10403],
  [204, -1.3351, 23.1482, 0.10402],
  [205, -1.3271, 23.2246, 0.10402],
  [206, -1.3191, 23.3013, 0.10402],
  [207, -1.3113, 23.3781, 0.10401],
  [208, -1.3035, 23.4551, 0.10401],
  [209, -1.2958, 23.5322, 0.10400],
  [210, -1.2881, 23.6096, 0.10400],
  [211, -1.2806, 23.6870, 0.10399],
  [212, -1.2731, 23.7647, 0.10399],
  [213, -1.2657, 23.8425, 0.10398],
  [214, -1.2583, 23.9204, 0.10397],
  [215, -1.2511, 23.9985, 0.10397],
  [216, -1.2438, 24.0768, 0.10396],
];

/**
 * Standard normal CDF approximation (Abramowitz & Stegun 26.2.17)
 * Accurate to ~1.5×10⁻⁷
 */
function normCDF(z: number): number {
  const p = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const t = 1 / (1 + p * Math.abs(z));
  const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
  const phi = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return z >= 0 ? phi : 1 - phi;
}

/**
 * Lookup and interpolate LMS for given age in months.
 * Returns null if outside table range.
 */
function getLMS(
  ageMonths: number,
  sex: 'M' | 'F'
): { L: number; M: number; S: number } | null {
  const table = sex === 'M' ? LMS_BOYS : LMS_GIRLS;
  const minAge = table[0][0];
  const maxAge = table[table.length - 1][0];
  if (ageMonths < minAge || ageMonths > maxAge) return null;

  // Find bracket
  let lo = 0;
  let hi = table.length - 1;
  while (lo < hi - 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (table[mid][0] <= ageMonths) lo = mid;
    else hi = mid;
  }

  if (table[lo][0] === ageMonths || lo === hi) {
    return { L: table[lo][1], M: table[lo][2], S: table[lo][3] };
  }

  // Linear interpolation between lo and hi
  const frac = (ageMonths - table[lo][0]) / (table[hi][0] - table[lo][0]);
  return {
    L: table[lo][1] + frac * (table[hi][1] - table[lo][1]),
    M: table[lo][2] + frac * (table[hi][2] - table[lo][2]),
    S: table[lo][3] + frac * (table[hi][3] - table[lo][3]),
  };
}

/**
 * Convert BMI to z-score using WHO LMS method.
 * z = [(BMI/M)^L - 1] / (L * S)   for L ≠ 0
 */
function bmiToZscore(bmi: number, L: number, M: number, S: number): number {
  if (Math.abs(L) < 1e-6) {
    return Math.log(bmi / M) / S;
  }
  return (Math.pow(bmi / M, L) - 1) / (L * S);
}

function categorize(zscore: number, __lang: string): { categoria: string; zone: string; tone: string } {
  const es = __lang !== 'en' && __lang !== 'pt';
  if (zscore < -2) {
    return {
      categoria: es ? 'Bajo peso (por debajo del percentil 3)' : 'Underweight (below 3rd percentile)',
      zone: 'bajo-peso',
      tone: 'warning',
    };
  } else if (zscore < 1) {
    return {
      categoria: es ? 'Peso normal (percentil 3–85)' : 'Normal weight (3rd–85th percentile)',
      zone: 'normal',
      tone: 'positive',
    };
  } else if (zscore < 2) {
    return {
      categoria: es ? 'Sobrepeso (percentil 85–97)' : 'Overweight (85th–97th percentile)',
      zone: 'sobrepeso',
      tone: 'warning',
    };
  } else {
    return {
      categoria: es ? 'Obesidad (por encima del percentil 97)' : 'Obesity (above 97th percentile)',
      zone: 'obesidad',
      tone: 'alert',
    };
  }
}

export function pesoSaludableAdolescenteImcJuvenil(i: Inputs): Outputs {
  const __lang = String(i.__lang || 'es');
  const es = __lang !== 'en' && __lang !== 'pt';

  const pesoKg = Number(i.peso) || 0;
  const tallaCm = Number(i.talla) || 0;
  const edadAnios = Number(i.edad) || 0;
  const mesesExtra = Number(i.meses) || 0;
  const sexo = String(i.sexo || 'M') as 'M' | 'F';

  // Validate
  if (pesoKg <= 0 || tallaCm <= 0 || edadAnios < 12 || edadAnios > 18) {
    const msg = es
      ? 'Ingresá datos válidos. Esta calculadora cubre adolescentes de 12 a 18 años.'
      : 'Please enter valid data. This calculator covers adolescents aged 12 to 18.';
    return {
      resultado: '',
      resumen: msg,
      _insight: { title: es ? 'Datos requeridos' : 'Data required', text: msg, tone: 'neutral', icon: '⚠️' },
    };
  }

  // BMI = peso / (talla_m)^2
  const tallaM = tallaCm / 100;
  const bmi = pesoKg / (tallaM * tallaM);

  // Convert age to total months
  const ageMonths = edadAnios * 12 + mesesExtra;

  const lms = getLMS(Math.round(ageMonths), sexo);
  if (!lms) {
    const msg = es
      ? 'Edad fuera del rango soportado (12–18 años).'
      : 'Age outside supported range (12–18 years).';
    return { resultado: '', resumen: msg, _insight: { title: '', text: msg, tone: 'neutral', icon: '⚠️' } };
  }

  const zscore = bmiToZscore(bmi, lms.L, lms.M, lms.S);
  const pctile = normCDF(zscore) * 100;
  const { categoria, zone, tone } = categorize(zscore, __lang);

  const sexLabel = es
    ? sexo === 'M' ? 'varón' : 'mujer'
    : sexo === 'M' ? 'male' : 'female';

  const resultado = `${bmi.toFixed(1)} kg/m²`;

  let resumen: string;
  if (es) {
    resumen = `IMC ${bmi.toFixed(1)} kg/m² · percentil ${pctile.toFixed(0)} para ${sexLabel} de ${edadAnios} años · ${categoria}`;
  } else {
    resumen = `BMI ${bmi.toFixed(1)} kg/m² · ${pctile.toFixed(0)}th percentile for ${edadAnios}-year-old ${sexLabel} · ${categoria}`;
  }

  let insightText: string;
  if (es) {
    insightText = `Con ${pesoKg} kg y ${tallaCm} cm, el IMC es **${bmi.toFixed(1)} kg/m²** (z = ${zscore.toFixed(2)}). Eso equivale al **percentil ${pctile.toFixed(0)}** en las tablas de referencia OMS 2007 para ${sexLabel} de ${edadAnios} años → **${categoria}**. ` +
      (zone === 'normal'
        ? `El peso está dentro del rango saludable. Mantener buenos hábitos de alimentación y actividad física regular.`
        : zone === 'sobrepeso'
        ? `El IMC supera el percentil 85. Se recomienda consultar con el pediatra para orientación sobre hábitos saludables.`
        : zone === 'obesidad'
        ? `El IMC supera el percentil 97. Es importante una evaluación médica con pediatra o nutricionista.`
        : `El IMC está por debajo del percentil 3. Consultá con el pediatra para descartar causas y orientar una nutrición adecuada.`);
  } else {
    insightText = `With ${pesoKg} kg and ${tallaCm} cm, BMI is **${bmi.toFixed(1)} kg/m²** (z = ${zscore.toFixed(2)}). That is the **${pctile.toFixed(0)}th percentile** on the WHO 2007 reference for ${edadAnios}-year-old ${sexLabel}s → **${categoria}**. ` +
      (zone === 'normal'
        ? `Weight is within the healthy range. Maintain good dietary habits and regular physical activity.`
        : zone === 'sobrepeso'
        ? `BMI exceeds the 85th percentile. Consult a pediatrician for guidance on healthy habits.`
        : zone === 'obesidad'
        ? `BMI exceeds the 97th percentile. A medical evaluation by a pediatrician or nutritionist is recommended.`
        : `BMI is below the 3rd percentile. See a pediatrician to rule out underlying causes and ensure adequate nutrition.`);
  }

  return {
    resultado,
    resumen,
    _insight: {
      title: es ? 'Resultado IMC adolescente' : 'Adolescent BMI Result',
      text: insightText,
      tone,
      icon: zone === 'normal' ? '✅' : '⚠️',
    },
  };
}
