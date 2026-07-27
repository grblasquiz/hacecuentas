import type { HubData } from './types';

/**
 * Hub de decisión — "Presión, densidad y gases: convertir y calcular"
 * Arquetipo RAMIFICADO (4 casos): convertir unidades (default), presión según
 * la altitud, presión hidrostática y ley de los gases ideales.
 *
 * Absorbe 11 calculadoras sueltas (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - NADA acá es plata. El resultado y TODAS las filas del desglose declaran
 *    `format: 'unit'` con su unidad y sus decimales. El runtime hace
 *    Object.assign y una fila sin `format` propio caería a pesos con "$".
 *  - Los conversores de ENERGÍA (cal→J, kWh→J, BTU→J) y de POTENCIA (kW→HP)
 *    que absorbe este hub no son presión. En vez de mandarlos a una URL sin
 *    función, la rama "convertir unidades" tiene un selector de FAMILIA
 *    (presión / energía / potencia) y los resuelve de verdad, con los mismos
 *    dos `select` de origen y destino. Son conversiones de factor fijo: el
 *    mecanismo es idéntico y el usuario que llega buscando "cuántos joules es
 *    una caloría" encuentra la respuesta, no un redirect a otra cosa.
 *  - `chart.type: 'scale'`: el runtime dibuja la barra de franjas y usa
 *    `position` + `positionLabel`. Las franjas van en DÉCADAS logarítmicas
 *    (igual que el hub de longitud): con anchos en pascales crudos la última
 *    franja se comería el gráfico entero.
 *
 * EXACTITUD (regla dura de este hub): todos los factores son exactos por
 * definición internacional, no redondeos.
 *   1 atm   = 101 325 Pa                (exacto, BIPM)
 *   1 bar   = 100 000 Pa                (exacto)
 *   1 psi   = 6 894,757 293 168 Pa      (exacto: 4,448 221 615 260 5 N / 6,4516 cm²)
 *   1 kgf/cm² = 98 066,5 Pa             (exacto: g0 = 9,806 65 m/s²)
 *   1 mmHg  = 133,322 387 415 Pa        (exacto, mmHg convencional)
 *   1 Torr  = 101 325 / 760 Pa          (exacto, ≠ mmHg convencional por 2·10⁻⁷)
 *   1 inHg  = 3 386,388 640 341 Pa      (exacto: 25,4 × mmHg)
 *   1 cal   = 4,184 J                   (exacto, caloría termoquímica)
 *   1 BTU   = 1 055,055 852 62 J        (exacto, BTU_IT)
 *   1 kWh   = 3 600 000 J               (exacto)
 *   1 HP    = 745,699 871 582 270 22 W  (exacto, horsepower mecánico)
 *   1 CV/PS = 735,498 75 W              (exacto, caballo métrico)
 *   R       = 8,314 462 618 153 24 J/(mol·K) (exacto desde la redefinición SI 2019)
 */
export const hub: HubData = {
  slug: 'ciencia/presion-y-gases',
  title: 'Presión, densidad y gases: convertir y calcular — psi, bar, atm y Pa 2026',
  description:
    'Convertí presión entre psi, bar, atmósferas, pascales y mmHg con factores exactos, calculá la presión atmosférica según la altitud, la presión hidrostática a una profundidad y despejá la ley de los gases ideales PV = nRT. Incluye conversión de energía (cal, J, kWh, BTU) y de potencia (kW, HP).',
  silo: 'Ciencia',
  siloHref: '/ciencia',

  eyebrow: 'Física y unidades',
  h1: 'Presión, densidad y gases: convertir y calcular',
  lede:
    'Cuatro preguntas con la misma raíz: cuánto es eso en otra unidad, cuánta presión hay a tu altura, cuánta hay bajo el agua y qué pasa con un gas cuando cambiás la temperatura o el volumen. Los factores son exactos por definición internacional, no redondeados.',
  stamps: [
    'Actualizado 27-07-2026',
    'Factores exactos BIPM / NIST',
    'Atmósfera estándar ICAO (ISO 2533)',
    '11 calculadoras adentro',
  ],

  resultLabel: 'Resultado del cálculo',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Las cuatro ramas comparten el mismo panel de datos: completá sólo los campos de la que elegiste. Todas devuelven el número en varias unidades a la vez, así no tenés que volver a convertir.',
    items: [
      {
        id: 'convertir',
        label: 'Convertir unidades de presión',
        hint: 'psi, bar, atm, Pa, mmHg, kgf/cm²',
        answer: '1 atm = 101.325 Pa = 1,01325 bar = 14,6959 psi = 760 mmHg. Todos son valores exactos por definición.',
        yes: [
          'La conversión que pediste, más la misma presión expresada en las 12 unidades de la familia',
          'El factor exacto entre las dos unidades elegidas, para que puedas rehacer la cuenta a mano',
          'Con el selector de familia también convertís energía (joule, caloría, kWh, BTU, eV) y potencia (watt, HP, CV, BTU/h)',
          'Referencias reconocibles: 1 atm al nivel del mar, 32 psi de un neumático, 2 bar de una olla a presión',
        ],
        warn: [
          'Presión absoluta vs manométrica: el manómetro del neumático marca 0 con el auto parado, pero ahí ya hay 1 atm de aire alrededor. 32 psi en el manómetro son 46,7 psi absolutos',
          'El mmHg convencional (133,322387415 Pa) y el Torr (101.325/760 Pa) no son idénticos: difieren en 2 partes en 10 millones. En medicina y en vacío común da lo mismo; en metrología no',
          'La caloría de las etiquetas de comida es en realidad una kilocaloría: 1 Cal de un alimento = 1.000 cal de física = 4.184 J',
          'HP mecánico (745,69987 W) y CV o PS métrico (735,49875 W) no son la misma unidad: un motor de 100 CV tiene 98,6 HP',
        ],
        plazo: 'los factores del SI son permanentes; no hay actualización anual que esperar.',
      },
      {
        id: 'altitud',
        label: 'Presión según la altitud',
        hint: 'Cuánta presión y oxígeno hay a tu altura',
        answer:
          'A 3.000 m la presión atmosférica cae a unos 701 hPa: el 69% de la del nivel del mar, y con ella el oxígeno disponible por respiración.',
        yes: [
          'La presión barométrica a esa altitud según la atmósfera estándar ICAO (ISO 2533)',
          'El porcentaje respecto del nivel del mar, que es el que gobierna el oxígeno que te entra por respiración',
          'La temperatura estándar a esa altura, con el gradiente de 6,5 °C por kilómetro',
          'El punto de ebullición del agua a esa presión: por eso en altura la pasta tarda más',
        ],
        warn: [
          'Es la atmósfera ESTÁNDAR: un día de alta o baja presión corre el resultado ±30 hPa fácilmente',
          'El modelo vale hasta la tropopausa (11.000 m); más arriba la temperatura deja de caer y la fórmula cambia',
          'Menos presión no significa menos porcentaje de oxígeno: el aire sigue teniendo 20,9% de O₂, lo que baja es la presión parcial',
          'Arriba de 2.500 m puede aparecer mal de altura; arriba de 5.000 m la aclimatación deja de compensar',
        ],
        plazo: 'la aclimatación a una altura nueva lleva entre 3 y 5 días por cada 1.000 m de ganancia.',
      },
      {
        id: 'hidrostatica',
        label: 'Presión hidrostática',
        hint: 'Cuánta presión hay a X metros bajo el agua',
        answer:
          'P = ρ·g·h. En agua dulce, cada 10,2 metros de profundidad suman una atmósfera entera de presión.',
        yes: [
          'La presión de la columna de fluido (manométrica) y la presión total absoluta sumando la atmósfera',
          'Cuántas atmósferas equivale, que es lo que importa en buceo y en el cálculo de tanques',
          'La misma presión en bar, psi y metros de columna de agua',
          'Sirve igual para agua dulce, agua de mar (1.025 kg/m³), aceite o cualquier líquido con su densidad',
        ],
        warn: [
          'La presión hidrostática no depende de la forma ni del volumen del recipiente: sólo de la altura de la columna. Un caño finito de 10 m tiene la misma presión en el fondo que una pileta de 10 m',
          'Para el cálculo estructural de un tanque lo que manda es la presión manométrica; para el buceo y los gases, la absoluta',
          'La densidad cambia con la temperatura y la salinidad: usar 1.000 kg/m³ en agua de mar subestima la presión un 2,5%',
          'A partir de 1.000 m de profundidad la compresibilidad del agua ya no es despreciable y ρ deja de ser constante',
        ],
        plazo: 'en buceo recreativo el límite es 40 m, que son 4,9 bar absolutos.',
      },
      {
        id: 'gases',
        label: 'Ley de los gases ideales',
        hint: 'PV = nRT: despejá la que te falta',
        answer:
          'PV = nRT con R = 0,082057366 L·atm/(mol·K). Elegí qué variable despejar y completá las otras tres.',
        yes: [
          'La incógnita despejada, y de yapa las otras tres variables ya convertidas a sus unidades canónicas',
          'La temperatura siempre en kelvin: K = °C + 273,15, y ese 273,15 no se redondea a 273',
          'El volumen molar en esas condiciones, que en CNPT (0 °C y 1 atm) da 22,414 L/mol',
          'La densidad del gas si además indicás su masa molar',
        ],
        warn: [
          'Es un modelo IDEAL: a alta presión o cerca de la licuefacción el gas real se desvía y hace falta la ecuación de van der Waals',
          'Meter la temperatura en °C es el error clásico y da resultados sin sentido (o negativos)',
          'R cambia de valor según las unidades: 0,082057366 L·atm/(mol·K) o 8,314462618 J/(mol·K). No se mezclan',
          'La presión de la ley es ABSOLUTA, no la del manómetro',
        ],
        plazo: 'las condiciones normales (CNPT) son 0 °C y 1 atm; las estándar de la IUPAC desde 1982 son 0 °C y 100 kPa.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu caso',
  inputsIntro:
    'Sólo hacen falta los campos de la rama que elegiste arriba: los demás se ignoran. Para la ley de los gases, elegí en el selector qué variable querés despejar.',
  fields: [
    {
      id: 'familia',
      label: 'Familia de unidades (rama de conversión)',
      type: 'select',
      value: 'presion',
      options: [
        { value: 'presion', label: 'Presión (Pa, bar, psi, atm, mmHg)' },
        { value: 'energia', label: 'Energía (J, cal, kWh, BTU, eV)' },
        { value: 'potencia', label: 'Potencia (W, kW, HP, CV, BTU/h)' },
      ],
      help: 'Cambia las unidades de los dos selectores de abajo.',
    },
    { id: 'valor', label: 'Cantidad a convertir', type: 'number', value: 1, step: 0.000001 },
    {
      id: 'desde',
      label: 'Unidad de origen',
      type: 'select',
      value: 'atm',
      options: [
        { value: 'pa', label: 'Pascal (Pa)' },
        { value: 'hpa', label: 'Hectopascal / milibar (hPa)' },
        { value: 'kpa', label: 'Kilopascal (kPa)' },
        { value: 'mpa', label: 'Megapascal (MPa)' },
        { value: 'bar', label: 'Bar' },
        { value: 'mbar', label: 'Milibar (mbar)' },
        { value: 'atm', label: 'Atmósfera (atm)' },
        { value: 'psi', label: 'Libra por pulgada² (psi)' },
        { value: 'mmhg', label: 'Milímetro de mercurio (mmHg)' },
        { value: 'torr', label: 'Torr' },
        { value: 'inhg', label: 'Pulgada de mercurio (inHg)' },
        { value: 'kgfcm2', label: 'Kilogramo-fuerza por cm² (at)' },
        { value: 'mh2o', label: 'Metro de columna de agua (mH₂O)' },
        { value: 'j', label: 'Joule (J)' },
        { value: 'kj', label: 'Kilojoule (kJ)' },
        { value: 'cal', label: 'Caloría (cal)' },
        { value: 'kcal', label: 'Kilocaloría (kcal o "Caloría" de comida)' },
        { value: 'wh', label: 'Watt-hora (Wh)' },
        { value: 'kwh', label: 'Kilowatt-hora (kWh)' },
        { value: 'btu', label: 'BTU' },
        { value: 'ftlbf', label: 'Pie-libra fuerza (ft·lbf)' },
        { value: 'ev', label: 'Electronvoltio (eV)' },
        { value: 'w', label: 'Watt (W)' },
        { value: 'kw', label: 'Kilowatt (kW)' },
        { value: 'hp', label: 'HP mecánico (horsepower)' },
        { value: 'cv', label: 'CV / PS (caballo métrico)' },
        { value: 'btuh', label: 'BTU por hora (BTU/h)' },
        { value: 'kcalh', label: 'Kilocaloría por hora (kcal/h)' },
        { value: 'ftlbfs', label: 'Pie-libra por segundo (ft·lbf/s)' },
      ],
    },
    {
      id: 'hasta',
      label: 'Unidad de destino',
      type: 'select',
      value: 'psi',
      options: [
        { value: 'pa', label: 'Pascal (Pa)' },
        { value: 'hpa', label: 'Hectopascal / milibar (hPa)' },
        { value: 'kpa', label: 'Kilopascal (kPa)' },
        { value: 'mpa', label: 'Megapascal (MPa)' },
        { value: 'bar', label: 'Bar' },
        { value: 'mbar', label: 'Milibar (mbar)' },
        { value: 'atm', label: 'Atmósfera (atm)' },
        { value: 'psi', label: 'Libra por pulgada² (psi)' },
        { value: 'mmhg', label: 'Milímetro de mercurio (mmHg)' },
        { value: 'torr', label: 'Torr' },
        { value: 'inhg', label: 'Pulgada de mercurio (inHg)' },
        { value: 'kgfcm2', label: 'Kilogramo-fuerza por cm² (at)' },
        { value: 'mh2o', label: 'Metro de columna de agua (mH₂O)' },
        { value: 'j', label: 'Joule (J)' },
        { value: 'kj', label: 'Kilojoule (kJ)' },
        { value: 'cal', label: 'Caloría (cal)' },
        { value: 'kcal', label: 'Kilocaloría (kcal o "Caloría" de comida)' },
        { value: 'wh', label: 'Watt-hora (Wh)' },
        { value: 'kwh', label: 'Kilowatt-hora (kWh)' },
        { value: 'btu', label: 'BTU' },
        { value: 'ftlbf', label: 'Pie-libra fuerza (ft·lbf)' },
        { value: 'ev', label: 'Electronvoltio (eV)' },
        { value: 'w', label: 'Watt (W)' },
        { value: 'kw', label: 'Kilowatt (kW)' },
        { value: 'hp', label: 'HP mecánico (horsepower)' },
        { value: 'cv', label: 'CV / PS (caballo métrico)' },
        { value: 'btuh', label: 'BTU por hora (BTU/h)' },
        { value: 'kcalh', label: 'Kilocaloría por hora (kcal/h)' },
        { value: 'ftlbfs', label: 'Pie-libra por segundo (ft·lbf/s)' },
      ],
    },
    {
      id: 'altitud',
      label: 'Altitud sobre el nivel del mar',
      type: 'number',
      suffix: 'm',
      value: 2810,
      min: -500,
      max: 20000,
      step: 10,
      help: 'Bariloche 770 m · Mendoza 750 m · La Paz 3.640 m · Everest 8.849 m.',
    },
    {
      id: 'presionMar',
      label: 'Presión al nivel del mar de ese día',
      type: 'number',
      suffix: 'hPa',
      value: 1013.25,
      min: 850,
      max: 1100,
      step: 0.25,
      help: 'La estándar es 1013,25 hPa. Si tenés el dato del servicio meteorológico, usá ese.',
    },
    {
      id: 'densidad',
      label: 'Densidad del fluido',
      type: 'number',
      suffix: 'kg/m³',
      value: 1000,
      min: 1,
      max: 20000,
      step: 1,
      help: 'Agua dulce 1.000 · agua de mar 1.025 · nafta 740 · aceite 920 · mercurio 13.546.',
    },
    {
      id: 'profundidad',
      label: 'Profundidad o altura de la columna',
      type: 'number',
      suffix: 'm',
      value: 10,
      min: 0,
      max: 12000,
      step: 0.1,
    },
    {
      id: 'gravedad',
      label: 'Gravedad',
      type: 'number',
      suffix: 'm/s²',
      value: 9.80665,
      min: 1,
      max: 30,
      step: 0.00001,
      help: 'La gravedad estándar es 9,80665 m/s² exactos. En Buenos Aires ronda 9,7967.',
    },
    {
      id: 'gasIncognita',
      label: 'Gases — qué querés despejar',
      type: 'select',
      value: 'volumen',
      options: [
        { value: 'presion', label: 'La presión (P)' },
        { value: 'volumen', label: 'El volumen (V)' },
        { value: 'moles', label: 'Los moles (n)' },
        { value: 'temperatura', label: 'La temperatura (T)' },
      ],
      help: 'El campo de la variable elegida se ignora: la calculamos con los otros tres.',
    },
    {
      id: 'gasP',
      label: 'Gases — presión',
      type: 'number',
      suffix: 'atm',
      value: 1,
      min: 0,
      step: 0.0001,
    },
    { id: 'gasV', label: 'Gases — volumen', type: 'number', suffix: 'L', value: 22.414, min: 0, step: 0.0001 },
    { id: 'gasN', label: 'Gases — moles', type: 'number', suffix: 'mol', value: 1, min: 0, step: 0.0001 },
    {
      id: 'gasT',
      label: 'Gases — temperatura',
      type: 'number',
      suffix: '°C',
      value: 0,
      min: -273.15,
      max: 5000,
      step: 0.01,
      help: 'En grados Celsius: la pasamos a kelvin sumando 273,15.',
    },
    {
      id: 'masaMolar',
      label: 'Gases — masa molar (opcional, para la densidad)',
      type: 'number',
      suffix: 'g/mol',
      value: 28.9644,
      min: 0,
      max: 500,
      step: 0.0001,
      help: 'Aire 28,9644 · O₂ 31,998 · CO₂ 44,009 · N₂ 28,014 · He 4,0026.',
    },
  ],
  fineprint:
    'Los factores de conversión son exactos por definición internacional (BIPM/NIST): no están redondeados. La presión atmosférica usa la atmósfera estándar ICAO, que es un modelo: el día real puede desviarse ±30 hPa. La ley de los gases ideales es una idealización y falla a alta presión.',

  chart: {
    type: 'scale',
    title: 'Dónde cae esa presión en la escala real',
    caption:
      'La regla va de 1 pascal a 100 megapascales en escala logarítmica, con referencias que se reconocen: el vacío de laboratorio, la cabina de un avión, el nivel del mar (101.325 Pa exactos), una olla a presión, el neumático de un auto a 32 psi y el fondo de la fosa de las Marianas. Tu resultado queda marcado sobre esa regla.',
    bands: [
      { label: '1 Pa a 1 kPa — vacío de laboratorio', from: 1, to: 1000, tone: 'neutral' },
      { label: '1 a 50 kPa — cabina de avión, cumbre del Everest (33,7 kPa)', from: 1000, to: 50000, tone: 'warn' },
      { label: '50 a 110 kPa — atmósfera habitable, nivel del mar 101,325 kPa', from: 50000, to: 110000, tone: 'good' },
      { label: '110 a 300 kPa — olla a presión (≈200 kPa absolutos)', from: 110000, to: 300000, tone: 'good' },
      { label: '300 kPa a 1 MPa — neumático de auto a 32 psi (322 kPa abs)', from: 300000, to: 1000000, tone: 'warn' },
      { label: '1 a 100 MPa — hidrolavadora, fondo del mar (Marianas ≈110 MPa)', from: 1000000, to: 100000000, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tu presión en todas las unidades, y el detalle del cálculo',
  breakdownIntro:
    'Cada fila trae su propia unidad: hay pascales, bar, psi, atmósferas, metros, grados y moles. Las barras comparan el número de cada fila entre sí, así que las unidades chicas siempre dan barras largas: mirá el valor, no la barra.',

  faq: [
    {
      q: '¿Cuántos pascales tiene una atmósfera y por qué ese número tan raro?',
      a: '1 atmósfera estándar son exactamente 101.325 pascales, y no es una medición sino una definición: la CGPM la fijó así en 1954 para que coincidiera con 760 mm de mercurio a 0 °C bajo la gravedad estándar de 9,80665 m/s². De ahí salen el resto de las equivalencias: 1 atm = 1,01325 bar = 1.013,25 hPa = 14,695948... psi = 760 mmHg. El bar, en cambio, se definió redondo (100.000 Pa exactos), por eso 1 atm y 1 bar se parecen pero no son iguales: difieren un 1,3%.',
    },
    {
      q: '¿Cuánto es 1 psi en bar y cuánto son 32 psi de un neumático?',
      a: '1 psi = 0,0689475729317 bar y, al revés, 1 bar = 14,5037738 psi. Los 32 psi típicos de un neumático de auto son 2,206 bar en el manómetro. Ojo con eso último: el manómetro mide presión manométrica, o sea por encima de la atmósfera. En términos absolutos, esos 32 psi son 46,7 psi (3,22 bar), porque hay que sumarle la atmósfera que empuja desde afuera.',
    },
    {
      q: '¿Cómo se calcula la presión atmosférica a una altura determinada?',
      a: 'Con la fórmula barométrica de la atmósfera estándar: P(h) = P₀ × (1 − L·h/T₀)^5,2559, donde P₀ es la presión al nivel del mar (1.013,25 hPa estándar), L el gradiente térmico de 0,0065 K/m y T₀ = 288,15 K (15 °C). A 1.000 m da 898,7 hPa, a 3.000 m unos 701 hPa y en la cumbre del Everest (8.849 m) apenas 314 hPa, menos de un tercio del nivel del mar. La fórmula vale hasta los 11.000 m; más arriba la temperatura deja de bajar y el modelo cambia.',
    },
    {
      q: '¿Cuánta presión hay a 10 metros bajo el agua?',
      a: 'En agua dulce, P = ρ·g·h = 1.000 × 9,80665 × 10 = 98.066,5 pascales, es decir 0,98 bar de presión manométrica. Sumando la atmósfera de la superficie, la presión absoluta es de 1,97 atmósferas: casi el doble que en la superficie. La regla práctica del buceo —"cada 10 metros, una atmósfera más"— es exacta a 10,33 m en agua dulce y a 10,08 m en agua de mar, que es más densa (1.025 kg/m³).',
    },
    {
      q: '¿La presión hidrostática depende de la forma del recipiente?',
      a: 'No. Es la paradoja hidrostática: sólo importan la densidad del fluido y la ALTURA de la columna, no el volumen ni la forma. Un caño de 1 cm de diámetro y 10 m de alto ejerce en su base exactamente la misma presión que una pileta de 10 m de profundidad. Por eso un tanque en la terraza a 10 m de altura da la misma presión en la canilla sin importar si tiene 500 o 5.000 litros: lo que cambia es cuánto dura, no con cuánta fuerza sale.',
    },
    {
      q: '¿Cómo se despeja la ley de los gases ideales PV = nRT?',
      a: 'Según lo que te falte: P = nRT/V, V = nRT/P, n = PV/RT y T = PV/nR. La constante R vale 0,082057366 L·atm/(mol·K) si trabajás en litros y atmósferas, u 8,314462618 J/(mol·K) en unidades del SI. Dos reglas que no se negocian: la temperatura va siempre en kelvin (K = °C + 273,15) y la presión es absoluta, no la del manómetro. Un mol de cualquier gas ideal a 0 °C y 1 atm ocupa 22,414 litros.',
    },
    {
      q: '¿Cuánto es una caloría en joules, y por qué las etiquetas de comida confunden?',
      a: '1 caloría termoquímica = 4,184 joules exactos por definición. El lío está en la mayúscula: la "Caloría" que figura en las etiquetas de alimentos es en realidad una KILOcaloría, o sea 1.000 calorías de física, equivalentes a 4.184 J. Un alfajor de 200 Cal aporta entonces 836.800 J, unos 0,23 kWh. Existe además la caloría IT (4,1868 J), casi idéntica, que se usa en tablas de ingeniería térmica.',
    },
    {
      q: '¿Cuántos joules tiene un kWh y cuántos un BTU?',
      a: '1 kilowatt-hora = 3.600.000 joules exactos (3,6 MJ), porque es 1.000 watts durante 3.600 segundos. 1 BTU (la unidad térmica británica que ves en los aires acondicionados) = 1.055,05585262 J exactos, así que un split de 3.000 frigorías, que son unos 11.900 BTU/h, disipa 3,49 kW térmicos. Y al revés: 1 kWh son 3.412,14 BTU.',
    },
    {
      q: '¿Cuántos HP tiene un kilowatt? ¿HP y CV son lo mismo?',
      a: 'No son lo mismo y esa es la trampa. El HP mecánico (horsepower anglosajón) vale 745,69987158 W, así que 1 kW = 1,3410221 HP. El CV o PS (caballo de vapor métrico, el que usan las fichas técnicas europeas y argentinas) vale 735,49875 W, con lo que 1 kW = 1,3596216 CV. La diferencia es del 1,4%: un motor de 100 CV tiene 98,6 HP. Cuando una ficha dice "HP" y el auto es europeo, lo más probable es que sean CV.',
    },
    {
      q: '¿Qué diferencia hay entre presión absoluta y presión manométrica?',
      a: 'La manométrica se mide tomando como cero la presión atmosférica del lugar: es lo que marcan el manómetro del compresor, el del neumático y el de la olla a presión. La absoluta parte del vacío perfecto y equivale a la manométrica más la atmosférica local. Una olla a presión que marca 1 bar tiene en realidad 2,01 bar absolutos adentro, y por eso el agua le hierve a 120 °C en vez de a 100 °C. Para la ley de los gases y para la física en general hay que usar la absoluta; para calcular esfuerzos en un recipiente, la manométrica.',
    },
    {
      q: '¿Por qué el agua hierve a menos temperatura en altura?',
      a: 'Porque el agua hierve cuando su presión de vapor iguala a la presión del aire de alrededor, y en altura esa presión es menor. Al nivel del mar hierve a 100 °C; en Bariloche (770 m) a unos 97,4 °C; en La Paz, a 3.640 m, apenas a 88 °C. Por eso en altura la comida tarda más en cocinarse aunque el agua ya esté hirviendo, y la olla a presión deja de ser un lujo para pasar a ser necesaria.',
    },
    {
      q: '¿Cómo se calcula la densidad con la masa y el volumen?',
      a: 'ρ = m ÷ V. Si medís 250 gramos en 100 cm³, la densidad es 2,5 g/cm³, que son 2.500 kg/m³. La conversión entre las dos unidades es directa: 1 g/cm³ = 1.000 kg/m³. Y sirve como test de flotación inmediato: todo lo que tenga menos de 1 g/cm³ flota en agua y todo lo que tenga más se hunde. Para gases, la densidad sale de la ley de los gases ideales: ρ = P·M/(R·T), donde M es la masa molar.',
    },
  ],

  sources: [
    {
      name: 'El Sistema Internacional de Unidades (SI), 9.ª edición — unidades derivadas y valor exacto de la constante de los gases',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
      date: '9.ª edición vigente',
    },
    {
      name: 'NIST Special Publication 811 — Guide for the Use of the International System of Units (factores de conversión exactos: psi, atm, BTU, cal, HP)',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology (NIST)',
    },
    {
      name: 'CODATA Internationally Recommended Values of the Fundamental Physical Constants — constante molar de los gases R',
      url: 'https://physics.nist.gov/cuu/Constants/',
      publisher: 'NIST / CODATA',
    },
    {
      name: 'ISO 2533:1975 — Standard Atmosphere (atmósfera estándar internacional, base del modelo barométrico)',
      url: 'https://www.iso.org/standard/7472.html',
      publisher: 'International Organization for Standardization',
    },
    {
      name: 'ICAO Doc 7488 — Manual of the ICAO Standard Atmosphere',
      url: 'https://store.icao.int/en/manual-of-the-icao-standard-atmosphere-extended-to-80-kilometres-262-500-feet-doc-7488',
      publisher: 'Organización de Aviación Civil Internacional (OACI/ICAO)',
    },
  ],

  replaces: [
    '/calculadora-presion-atmosferica-altitud-barometrica',
    '/calculadora-conversor-psi-a-bar',
    '/calculadora-conversor-kw-a-hp',
    '/calculadora-densidad-aire-temperatura-humedad-altitud-aviacion',
    '/calculadora-conversion-atmosferas-pascales-bar',
    '/calculadora-presion-hidrostatica',
    '/calculadora-conversor-calorias-a-joules',
    '/calculadora-ley-gases-ideales',
    '/calculadora-conversor-kwh-a-joules',
    '/calculadora-conversor-btu-a-joules',
    '/densidad-masa-volumen-formula',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Factores a la unidad base de cada familia. TODOS exactos por definición
 * internacional (BIPM / NIST SP 811). Un factor redondeado acá sería un bug.
 *   presion  → pascal (Pa)
 *   energia  → joule (J)
 *   potencia → watt (W)
 */
export const UNITS: Record<
  string,
  { fam: 'presion' | 'energia' | 'potencia'; f: number; sym: string; name: string }
> = {
  // ── Presión (base: pascal) ─────────────────────────────────────────────
  pa: { fam: 'presion', f: 1, sym: 'Pa', name: 'Pascales' },
  hpa: { fam: 'presion', f: 100, sym: 'hPa', name: 'Hectopascales' },
  kpa: { fam: 'presion', f: 1000, sym: 'kPa', name: 'Kilopascales' },
  mpa: { fam: 'presion', f: 1e6, sym: 'MPa', name: 'Megapascales' },
  bar: { fam: 'presion', f: 100000, sym: 'bar', name: 'Bar' },
  mbar: { fam: 'presion', f: 100, sym: 'mbar', name: 'Milibares' },
  atm: { fam: 'presion', f: 101325, sym: 'atm', name: 'Atmósferas' },
  // 1 lbf = 4,4482216152605 N (exacto) sobre 1 in² = 6,4516 cm² (exacto).
  psi: { fam: 'presion', f: 6894.757293168, sym: 'psi', name: 'Libras por pulgada cuadrada' },
  // mmHg convencional: 13 595,1 kg/m³ × 9,806 65 m/s² × 0,001 m (exacto).
  mmhg: { fam: 'presion', f: 133.322387415, sym: 'mmHg', name: 'Milímetros de mercurio' },
  // Torr: 1/760 de atmósfera exacta. NO es idéntico al mmHg convencional.
  torr: { fam: 'presion', f: 101325 / 760, sym: 'Torr', name: 'Torr' },
  inhg: { fam: 'presion', f: 3386.388640341, sym: 'inHg', name: 'Pulgadas de mercurio' },
  // kgf/cm² = atmósfera técnica: 9,806 65 N sobre 1 cm² (exacto).
  kgfcm2: { fam: 'presion', f: 98066.5, sym: 'kgf/cm²', name: 'Kilogramos-fuerza por cm²' },
  // Metro de columna de agua convencional: 1 000 kg/m³ × 9,806 65 (exacto).
  mh2o: { fam: 'presion', f: 9806.65, sym: 'mH₂O', name: 'Metros de columna de agua' },

  // ── Energía (base: joule) ──────────────────────────────────────────────
  j: { fam: 'energia', f: 1, sym: 'J', name: 'Joules' },
  kj: { fam: 'energia', f: 1000, sym: 'kJ', name: 'Kilojoules' },
  cal: { fam: 'energia', f: 4.184, sym: 'cal', name: 'Calorías (termoquímicas)' },
  kcal: { fam: 'energia', f: 4184, sym: 'kcal', name: 'Kilocalorías' },
  wh: { fam: 'energia', f: 3600, sym: 'Wh', name: 'Watt-hora' },
  kwh: { fam: 'energia', f: 3600000, sym: 'kWh', name: 'Kilowatt-hora' },
  btu: { fam: 'energia', f: 1055.05585262, sym: 'BTU', name: 'BTU (International Table)' },
  // 1 ft·lbf = 0,3048 × 0,453 592 37 × 9,806 65 (todos exactos).
  ftlbf: { fam: 'energia', f: 1.3558179483314004, sym: 'ft·lbf', name: 'Pie-libra fuerza' },
  // Carga elemental exacta desde la redefinición SI 2019.
  ev: { fam: 'energia', f: 1.602176634e-19, sym: 'eV', name: 'Electronvoltios' },

  // ── Potencia (base: watt) ──────────────────────────────────────────────
  w: { fam: 'potencia', f: 1, sym: 'W', name: 'Watts' },
  kw: { fam: 'potencia', f: 1000, sym: 'kW', name: 'Kilowatts' },
  // 550 ft·lbf/s exactos.
  hp: { fam: 'potencia', f: 745.6998715822702, sym: 'HP', name: 'HP mecánicos' },
  // 75 kgf·m/s exactos: 75 × 9,806 65.
  cv: { fam: 'potencia', f: 735.49875, sym: 'CV', name: 'CV / PS (caballos métricos)' },
  btuh: { fam: 'potencia', f: 1055.05585262 / 3600, sym: 'BTU/h', name: 'BTU por hora' },
  kcalh: { fam: 'potencia', f: 4184 / 3600, sym: 'kcal/h', name: 'Kilocalorías por hora' },
  ftlbfs: { fam: 'potencia', f: 1.3558179483314004, sym: 'ft·lbf/s', name: 'Pie-libra por segundo' },
};

/** Constantes físicas exactas y parámetros de la atmósfera estándar ICAO. */
export const CONST = {
  /** Constante molar de los gases, exacta desde la redefinición SI 2019. */
  R_SI: 8.31446261815324,
  /** R en L·atm/(mol·K): R_SI / 101,325 (exacto por construcción). */
  R_LATM: 8.31446261815324 / 101.325,
  /** Gravedad estándar, exacta por definición (3.ª CGPM, 1901). */
  G0: 9.80665,
  /** Presión de la atmósfera estándar al nivel del mar, exacta. */
  P0_PA: 101325,
  /** Temperatura estándar al nivel del mar, en kelvin. */
  T0_K: 288.15,
  /** Gradiente térmico de la troposfera estándar, K/m. */
  LAPSE: 0.0065,
  /** Exponente barométrico de la ISA, derivado: g₀·M/(R·L) = 5,255786. */
  BARO_EXP: (9.80665 * 0.0289644) / (8.31446261815324 * 0.0065),
  /** Cero absoluto en grados Celsius. */
  CERO_K: 273.15,
  /** Masa molar del aire seco estándar, g/mol. */
  M_AIRE: 28.9644,
  /** Constante específica del aire seco, J/(kg·K). */
  R_AIRE: 287.0528,
  /** Densidad del aire estándar al nivel del mar, kg/m³. */
  RHO0: 1.225,
};

/** Regla comparativa logarítmica: de 1 Pa a 100 MPa, con referencias reales. */
export const SCALE = {
  minPa: 1,
  maxPa: 1e8,
  refs: [
    { pa: 1, label: 'el vacío de una bomba de laboratorio' },
    { pa: 33700, label: 'la cumbre del Everest' },
    { pa: 75000, label: 'la cabina presurizada de un avión' },
    { pa: 101325, label: 'el nivel del mar (1 atm)' },
    { pa: 201325, label: 'una olla a presión' },
    { pa: 322000, label: 'un neumático de auto a 32 psi' },
    { pa: 1.1e8, label: 'el fondo de la fosa de las Marianas' },
  ],
};
