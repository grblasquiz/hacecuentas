import type { HubData } from './types';

/**
 * Hub de decisión — "Instalación eléctrica: cable, térmica y caída de tensión"
 * Arquetipo RAMIFICADO (5 casos): sección de cable y protección según la carga
 * (default), caída de tensión de un tramo largo, ley de Ohm y potencia,
 * corrección del factor de potencia y relación de espiras de un transformador.
 *
 * Absorbe 6 calculadoras sueltas (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - NADA acá es plata: TODAS las filas declaran `format` propio.
 *  - `chart.type: 'scale'`: la regla es de CORRIENTE, de 0,1 A a 200 A, en
 *    escala logarítmica, con las cargas domésticas reconocibles. La rama del
 *    transformador no tiene una corriente propia hasta que se carga la
 *    potencia: lo aclara en el `positionLabel`.
 *
 * NO DUPLICA a los hubs de tecnología ya existentes: `resistencias.ts` cubre el
 * código de colores, la serie-paralelo, el divisor resistivo, el LED y el RC;
 * `baterias.ts` cubre autonomía, carga y UPS. Este hub arranca donde terminan
 * esos dos: el cableado fijo de una instalación y su protección.
 *
 * EXACTITUD (regla dura):
 *  - Resistividad a 20 °C: cobre 0,017241 Ω·mm²/m (IEC 60228, del que sale la
 *    definición de IACS), aluminio 0,028264. Las calcs viejas usaban 0,0172 y
 *    0,0282, redondeados. Además se ofrece la corrección a 70 °C, que es la
 *    temperatura de servicio real de un conductor con aislación PVC y la que
 *    manda la norma: ρ₇₀ = ρ₂₀ × (1 + 0,00393 × 50) = ρ₂₀ × 1,1965.
 *  - La caída de tensión monofásica lleva factor 2 (ida y vuelta); la trifásica
 *    lleva √3. La calculadora vieja aplicaba SIEMPRE el 2, así que sobreestimaba
 *    la caída trifásica un 15,5%. Acá el sistema se elige.
 *  - Escalones de térmica según IEC 60898: 6, 10, 16, 20, 25, 32, 40, 50, 63 A.
 */
export const hub: HubData = {
  slug: 'tecnologia/instalacion-electrica',
  title: 'Sección de cable, térmica y caída de tensión: calculadora de instalación',
  description:
    'Calculá qué sección de cable y qué térmica necesita un circuito según su consumo, cuánta tensión se pierde en un tramo largo, la relación entre voltaje, corriente, resistencia y potencia, el capacitor para corregir el factor de potencia y la relación de espiras de un transformador.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Electricidad',
  h1: '¿Qué cable y qué térmica necesita este circuito?',
  lede:
    'Las cinco cuentas que hay que hacer antes de meter un cable en una cañería: cuánta corriente va a circular, qué sección la soporta, qué térmica la protege, cuánta tensión se pierde si el tramo es largo y qué pasa con la potencia reactiva si hay motores. Los números salen de las tablas de norma, no de la intuición.',
  stamps: [
    'Actualizado 27-07-2026',
    'Secciones IRAM / IEC 60228',
    'Térmicas IEC 60898',
    '6 calculadoras adentro',
  ],

  resultLabel: 'Resultado del cálculo',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Las cinco ramas comparten el mismo panel de datos: completá sólo los campos de la que elegiste. Todas trabajan con la tensión y la frecuencia que cargues arriba, así que sirven igual para 220 V argentinos que para 110 V o para 380 V trifásicos.',
    items: [
      {
        id: 'seccion',
        label: 'Sección de cable y térmica según la carga',
        hint: 'Cuántos mm² y de cuántos amperes la llave',
        answer:
          'La corriente es P/V (o P/(√3·V·cos φ) en trifásico). Con esa corriente más un margen se elige la térmica, y la sección se elige para soportar la térmica, no la carga.',
        yes: [
          'La corriente real del circuito y la corriente de diseño con el margen de seguridad aplicado',
          'La térmica del escalón normalizado que corresponde según IEC 60898',
          'La sección de cable en mm² y su equivalente en AWG, con la capacidad de la sección elegida',
          'El margen que queda: qué porcentaje de su límite va a trabajar el cable',
        ],
        warn: [
          'El orden correcto es carga → térmica → cable, y no al revés: la sección se elige para que el cable aguante lo que la térmica deja pasar, si no la llave nunca lo protege',
          'Las capacidades de tabla son para un conductor por caño en condiciones normales: si hay varios circuitos en la misma cañería o la temperatura ambiente supera los 30 °C, hay que aplicar factores de reducción',
          'En Argentina la AEA 90364 fija secciones mínimas por tipo de circuito: 1,5 mm² para iluminación y 2,5 mm² para tomacorrientes, aunque la cuenta dé menos',
          'La térmica protege al CABLE, no al artefacto: para proteger a las personas hace falta además un disyuntor diferencial de 30 mA',
        ],
        plazo:
          'la instalación de una vivienda debería revisarse cada diez años, y el disyuntor diferencial probarse con su botón de test una vez por mes.',
      },
      {
        id: 'caida',
        label: 'Caída de tensión en un tramo largo',
        hint: 'Cuánta tensión se pierde en el camino',
        answer:
          'ΔV = 2·ρ·L·I/S en monofásico y √3·ρ·L·I/S en trifásico. El límite práctico es 3% en iluminación y 5% en fuerza motriz.',
        yes: [
          'La caída en volts y en porcentaje, con el veredicto contra los límites de norma',
          'La tensión que efectivamente le llega al equipo al final del tramo',
          'La sección mínima que haría falta para quedar dentro del 3%',
          'La potencia que se está perdiendo como calor en el cable, que es plata que se va',
        ],
        warn: [
          'El sistema importa: en monofásico la corriente hace el camino de ida y vuelta, así que el factor es 2; en trifásico equilibrado es √3. Confundirlos sobreestima la caída trifásica un 15%',
          'La resistividad de tabla es a 20 °C, pero un conductor cargado trabaja cerca de los 70 °C y ahí su resistencia es un 20% mayor: la caída real es peor que la nominal',
          'La caída es proporcional a la LONGITUD y a la CORRIENTE, e inversamente proporcional a la sección: duplicar el tramo obliga a duplicar la sección para mantener el porcentaje',
          'Un motor que arranca con tensión baja toma más corriente y se recalienta: la caída no es sólo una pérdida de rendimiento, es una causa de falla',
        ],
        plazo:
          'la reglamentación AEA admite hasta 3% de caída desde el tablero principal hasta el punto más desfavorable en circuitos de iluminación.',
      },
      {
        id: 'ohm',
        label: 'Ley de Ohm y potencia',
        hint: 'V = I·R y P = V·I',
        answer:
          'V = I·R: cargá dos de los tres y sale el tercero, con la potencia disipada P = V·I = I²·R como yapa.',
        yes: [
          'La tensión, la corriente o la resistencia despejada, según cuál dejes en cero',
          'La potencia disipada calculada por los tres caminos equivalentes: V·I, I²·R y V²/R',
          'La energía y el costo si el circuito trabaja una cantidad de horas al día',
          'La corriente máxima que tolera esa resistencia sin superar su potencia nominal',
        ],
        warn: [
          'En corriente alterna con cargas inductivas —motores, transformadores, balastos— la ley de Ohm simple no alcanza: hay que trabajar con impedancia y factor de potencia',
          'La resistencia de un conductor sube con la temperatura: en el cobre, alrededor de 0,4% por cada grado',
          'La potencia disipada es la que hay que evacuar como calor: una resistencia de 1/4 W que disipa 0,5 W se quema, aunque el valor óhmico sea el correcto',
          'Los 220 V de la red son el valor EFICAZ: el pico real de la onda llega a 311 V, y es el que tienen que aguantar los aislantes',
        ],
        plazo:
          'la tensión nominal en Argentina es 220 V ±5% según la norma de calidad de las distribuidoras: entre 209 y 231 V es servicio dentro de tolerancia.',
      },
      {
        id: 'cosfi',
        label: 'Corregir el factor de potencia',
        hint: 'Qué capacitor hace falta y cuánto se ahorra',
        answer:
          'Qc = P·(tan φ₁ − tan φ₂). El capacitor aporta la potencia reactiva que los motores consumen, y así libera capacidad de la instalación.',
        yes: [
          'La potencia reactiva a compensar en kVAR y el capacitor equivalente en microfaradios',
          'La potencia aparente antes y después, para ver cuánta capacidad de transformador y de cable se libera',
          'La corriente de línea antes y después, que es lo que baja de verdad en los conductores',
          'El porcentaje de reducción de la carga aparente, que es lo que mira la distribuidora',
        ],
        warn: [
          'La corrección no baja el consumo de energía activa (kWh): baja la potencia aparente y la corriente. Lo que se ahorra son las multas y el sobredimensionamiento, no el kilovatio-hora',
          'Sobrecompensar es un problema real: pasarse del objetivo lleva el factor a capacitivo y algunas distribuidoras también lo penalizan',
          'Los capacitores quedan cargados después de desconectar: sin resistencias de descarga son un riesgo eléctrico serio',
          'Con cargas no lineales —variadores, fuentes conmutadas, LED— hay armónicos, y un banco de capacitores puede entrar en resonancia y amplificarlos',
        ],
        plazo:
          'en Argentina las distribuidoras penalizan a los usuarios con demanda registrada cuyo factor de potencia baje de 0,85 en el período facturado.',
      },
      {
        id: 'trafo',
        label: 'Transformador: relación de espiras',
        hint: 'Vs = Vp × Ns / Np',
        answer:
          'La tensión escala igual que la cantidad de vueltas: Vs = Vp × Ns/Np. La corriente hace lo contrario, así que la potencia se conserva.',
        yes: [
          'La tensión del secundario y la relación de transformación',
          'Si es reductor, elevador o aislador 1:1',
          'La corriente del secundario si cargás la potencia, y la del primario correspondiente',
          'La potencia aparente que maneja, para dimensionar el núcleo y la protección',
        ],
        warn: [
          'La corriente va al revés que la tensión: un transformador que baja la tensión a la décima parte multiplica la corriente por diez del lado de baja',
          'La potencia no se crea: un transformador ideal conserva V·I, y uno real pierde entre el 2% y el 5% en el núcleo y en el cobre',
          'Un transformador de aislación 1:1 no cambia la tensión pero separa galvánicamente los circuitos, y esa es toda su función de seguridad',
          'Los transformadores clásicos sólo funcionan con corriente alterna: en continua el flujo no varía, no hay inducción y el bobinado se quema',
        ],
        plazo:
          'un transformador dimensionado al límite tiene una vida útil mucho menor: la regla práctica es cargarlo hasta el 80% de su potencia nominal.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu caso',
  inputsIntro:
    'Sólo hacen falta los campos de la rama que elegiste arriba. La tensión, el sistema (monofásico o trifásico) y el material del conductor los usan varias ramas a la vez, así que conviene cargarlos primero.',
  fields: [
    {
      id: 'potencia',
      label: 'Potencia de la carga',
      type: 'number',
      suffix: 'W',
      value: 3500,
      min: 0,
      step: 1,
      thousands: true,
      help: 'Termotanque eléctrico 1.500 · aire acondicionado 3.000 frigorías ≈ 1.100 · horno eléctrico 2.500 · anafe 3.500.',
    },
    {
      id: 'tension',
      label: 'Tensión del circuito',
      type: 'number',
      suffix: 'V',
      value: 220,
      min: 1,
      step: 1,
      help: 'Argentina: 220 V monofásico, 380 V trifásico. Estados Unidos y México: 110-127 V.',
    },
    {
      id: 'sistema',
      label: 'Sistema',
      type: 'select',
      value: 'mono',
      options: [
        { value: 'mono', label: 'Monofásico (dos conductores activos: ida y vuelta)' },
        { value: 'tri', label: 'Trifásico equilibrado' },
      ],
      help: 'Cambia el factor de la caída de tensión: 2 en monofásico, √3 en trifásico.',
    },
    {
      id: 'cosfi',
      label: 'Factor de potencia de la carga',
      type: 'number',
      value: 1,
      min: 0.1,
      max: 1,
      step: 0.01,
      help: 'Cargas resistivas (estufas, lámparas) 1 · motores 0,75 a 0,85 · fuentes conmutadas 0,6 a 0,9.',
    },
    {
      id: 'margen',
      label: 'Margen de seguridad sobre la corriente',
      type: 'number',
      value: 1.25,
      min: 1,
      max: 2,
      step: 0.05,
      help: 'La práctica habitual es 1,25 (un 25% de margen) para cargas continuas.',
    },
    {
      id: 'corriente',
      label: 'Corriente, si la conocés directamente',
      type: 'number',
      suffix: 'A',
      value: 0,
      min: 0,
      step: 0.01,
      help: 'Dejala en 0 y se calcula con la potencia, la tensión y el factor de potencia.',
    },
    {
      id: 'longitud',
      label: 'Longitud del tramo de cable',
      type: 'number',
      suffix: 'm',
      value: 35,
      min: 0,
      step: 0.1,
      help: 'Es la distancia de UN tramo, del tablero al punto de consumo: el ida y vuelta lo agrega la fórmula.',
    },
    {
      id: 'seccion',
      label: 'Sección del conductor',
      type: 'number',
      suffix: 'mm²',
      value: 4,
      min: 0.1,
      step: 0.1,
      help: 'Secciones normalizadas: 1 · 1,5 · 2,5 · 4 · 6 · 10 · 16 · 25 · 35 · 50 mm².',
    },
    {
      id: 'material',
      label: 'Material del conductor',
      type: 'select',
      value: 'cobre',
      options: [
        { value: 'cobre', label: 'Cobre' },
        { value: 'aluminio', label: 'Aluminio' },
      ],
    },
    {
      id: 'tempConductor',
      label: 'Temperatura de servicio del conductor',
      type: 'number',
      suffix: '°C',
      value: 70,
      min: 20,
      max: 90,
      step: 1,
      help: 'Las tablas dan la resistividad a 20 °C, pero un cable cargado con aislación PVC trabaja a 70 °C y ahí resiste un 20% más.',
    },
    { id: 'voltaje', label: 'Ohm — tensión', type: 'number', suffix: 'V', value: 12, min: 0, step: 0.001 },
    {
      id: 'corrienteOhm',
      label: 'Ohm — corriente',
      type: 'number',
      suffix: 'A',
      value: 0,
      min: 0,
      step: 0.0001,
      help: 'Dejá en 0 el valor que querés calcular: se despeja con los otros dos.',
    },
    { id: 'resistencia', label: 'Ohm — resistencia', type: 'number', suffix: 'Ω', value: 220, min: 0, step: 0.01 },
    {
      id: 'horasDia',
      label: 'Ohm — horas de uso por día (opcional)',
      type: 'number',
      suffix: 'h',
      value: 0,
      min: 0,
      max: 24,
      step: 0.5,
      help: 'Para estimar el consumo mensual en kWh.',
    },
    { id: 'cosfi1', label: 'Factor de potencia — actual', type: 'number', value: 0.75, min: 0.1, max: 0.99, step: 0.01 },
    {
      id: 'cosfi2',
      label: 'Factor de potencia — objetivo',
      type: 'number',
      value: 0.95,
      min: 0.1,
      max: 1,
      step: 0.01,
      help: 'El umbral de penalización en Argentina es 0,85; se suele apuntar a 0,95 para tener margen.',
    },
    {
      id: 'frecuencia',
      label: 'Frecuencia de la red',
      type: 'number',
      suffix: 'Hz',
      value: 50,
      min: 1,
      step: 1,
      help: 'Argentina y Europa 50 Hz · Estados Unidos, México y Brasil (parcial) 60 Hz.',
    },
    { id: 'vPrimario', label: 'Transformador — tensión del primario', type: 'number', suffix: 'V', value: 220, min: 0, step: 0.1 },
    { id: 'espirasPrim', label: 'Transformador — espiras del primario', type: 'number', value: 1000, min: 1, step: 1 },
    { id: 'espirasSec', label: 'Transformador — espiras del secundario', type: 'number', value: 55, min: 1, step: 1 },
  ],
  fineprint:
    'Los valores de capacidad de corriente son los de tabla para un conductor de cobre con aislación PVC en cañería, a 30 °C de temperatura ambiente y sin agrupamiento. Cualquier condición distinta —varios circuitos en la misma cañería, temperatura ambiente mayor, tendido enterrado— exige aplicar los factores de corrección de la norma y puede reducir la capacidad hasta un 50%. Este cálculo es orientativo y no reemplaza al proyecto de un instalador matriculado ni a la Reglamentación AEA 90364. Toda intervención sobre una instalación eléctrica se hace con la energía cortada y verificada.',

  chart: {
    type: 'scale',
    title: 'Dónde cae esa corriente en la escala de una instalación',
    caption:
      'La regla va de 0,1 a 200 amperes en escala logarítmica, con las cargas que uno reconoce: un cargador de celular, una lámpara LED, una heladera, un microondas, un anafe eléctrico y la acometida entera de una casa. Tu corriente queda marcada sobre esa regla junto a los escalones de térmica normalizados.',
    bands: [
      { label: '0,1 a 1 A — cargadores, LED, electrónica', from: 0.1, to: 1, tone: 'good' },
      { label: '1 a 6 A — heladera, TV, PC: circuito de 1,5 mm² con térmica de 6 A', from: 1, to: 6, tone: 'good' },
      { label: '6 a 16 A — microondas, aire chico: 2,5 mm² con térmica de 16 A', from: 6, to: 16, tone: 'good' },
      { label: '16 a 32 A — anafe, horno, termotanque: 4 a 6 mm²', from: 16, to: 32, tone: 'warn' },
      { label: '32 a 63 A — tablero de una vivienda entera: 10 a 16 mm²', from: 32, to: 63, tone: 'warn' },
      { label: '63 a 200 A — acometida grande, taller o industria: 25 mm² o más', from: 63, to: 200, tone: 'bad' },
    ],
  },
  breakdownTitle: 'El desglose completo del cálculo',
  breakdownIntro:
    'Cada fila trae su propia unidad: hay amperes, volts, watts, milímetros cuadrados, metros y porcentajes. Las barras comparan el número de cada fila entre sí, así que los watts siempre van a aplastar a los amperes: mirá el valor, no la barra.',

  faq: [
    {
      q: '¿Qué sección de cable necesito para un consumo determinado?',
      a: 'El camino correcto tiene tres pasos y en este orden: primero la corriente (I = P/V en monofásico), después la térmica del escalón normalizado inmediatamente superior a la corriente con margen, y recién ahí la sección que soporte esa térmica. Para un anafe de 3.500 W a 220 V la corriente es 15,9 A; con un 25% de margen, 19,9 A; la térmica es de 20 A y la sección, 2,5 mm² —que soporta 21 A—. La inversión de ese orden es el error más común: si el cable no aguanta lo que la térmica deja pasar, la llave no lo protege.',
    },
    {
      q: '¿Cuántos amperes soporta cada sección de cable?',
      a: 'Para cobre con aislación PVC en cañería, a 30 °C y sin agrupamiento: 1 mm² soporta 10 A, 1,5 mm² 15 A, 2,5 mm² 21 A, 4 mm² 27 A, 6 mm² 36 A, 10 mm² 50 A, 16 mm² 66 A y 25 mm² 88 A. Son valores de tabla y hay que corregirlos hacia abajo si hay varios circuitos en la misma cañería o si la temperatura ambiente supera los 30 °C: en un tablero cargado la reducción llega al 30%.',
    },
    {
      q: '¿Cuál es la sección mínima obligatoria en Argentina?',
      a: 'La Reglamentación AEA 90364 fija mínimos por tipo de circuito, independientemente de lo que dé la cuenta: 1,5 mm² para circuitos de iluminación, 2,5 mm² para tomacorrientes de uso general y 4 mm² o más para circuitos de uso especial como el termotanque o el aire acondicionado. Si el cálculo da menos, se usa el mínimo reglamentario igual; si da más, se usa lo que dio el cálculo.',
    },
    {
      q: '¿Cómo se calcula la caída de tensión en un cable?',
      a: 'En monofásico, ΔV = 2·ρ·L·I/S, donde el 2 está porque la corriente hace el camino de ida y de vuelta. En trifásico equilibrado el factor es √3 en vez de 2. Para 20 A por 35 metros de cable de 4 mm² de cobre, la caída es de unos 6 V, un 2,7% de los 220 V: apenas dentro del límite. El punto clave que se ignora seguido es que la resistividad de tabla vale a 20 °C, y un conductor cargado trabaja a 70 °C, donde resiste un 20% más.',
    },
    {
      q: '¿Cuánta caída de tensión es aceptable?',
      a: 'La regla práctica y reglamentaria es 3% para circuitos de iluminación y hasta 5% para fuerza motriz, medidos desde el tablero principal hasta el punto más desfavorable. Por encima del 5% los motores arrancan con dificultad, toman más corriente de la debida y se recalientan; las lámparas incandescentes pierden mucho rendimiento y los equipos electrónicos pueden reiniciarse. Si la caída se pasa, la solución es subir la sección: acortar el tramo casi nunca es una opción.',
    },
    {
      q: '¿La térmica y el disyuntor son lo mismo?',
      a: 'No, y confundirlos es peligroso. La llave termomagnética —la térmica— protege al CABLE: corta cuando la corriente supera lo que el conductor aguanta, evitando el incendio. El disyuntor diferencial protege a las PERSONAS: detecta cuando parte de la corriente se va a tierra a través de un cuerpo y corta en milisegundos con una fuga de apenas 30 mA. Los dos son obligatorios en una instalación moderna y no se reemplazan entre sí.',
    },
    {
      q: '¿Cómo se despeja la ley de Ohm?',
      a: 'V = I·R, y de ahí I = V/R y R = V/I. La potencia se calcula por tres caminos equivalentes: P = V·I = I²·R = V²/R. Una resistencia de 220 Ω conectada a 12 V deja pasar 54,5 mA y disipa 0,65 W, así que una resistencia de 1/4 W se quemaría y hay que usar una de 1 W. Ese chequeo de potencia es el paso que más se saltea al armar un circuito.',
    },
    {
      q: '¿Qué es el factor de potencia y por qué la distribuidora lo penaliza?',
      a: 'Es la relación entre la potencia que hace trabajo útil (kW) y la que efectivamente circula por los cables (kVA). Los motores y transformadores necesitan una parte reactiva que va y viene sin hacer trabajo, pero que ocupa capacidad de los conductores y del transformador de la distribuidora. Por eso se penaliza: un usuario con cos φ 0,7 obliga a la red a transportar un 43% más de corriente que uno con cos φ 1 para entregar la misma energía útil. En Argentina el umbral de multa está en 0,85.',
    },
    {
      q: '¿Qué capacitor hace falta para corregir el factor de potencia?',
      a: 'Se calcula con Qc = P·(tan φ₁ − tan φ₂), y de ahí el capacitor sale de C = Qc/(2πf·V²). Para llevar una carga de 10 kW de cos φ 0,75 a 0,95, hacen falta 5,53 kVAR, que a 220 V y 50 Hz son unos 364 µF. Ojo con la expectativa: la corrección no baja el consumo en kWh, baja la corriente y la potencia aparente. Lo que se ahorra son las penalizaciones y el sobredimensionamiento de cables y transformador.',
    },
    {
      q: '¿Cómo se calcula la tensión de salida de un transformador?',
      a: 'La tensión escala igual que las vueltas: Vs = Vp × Ns/Np. Con 220 V en un primario de 1.000 espiras y un secundario de 55, la salida es 12,1 V, una relación de 18,2:1. La corriente hace exactamente lo contrario —se multiplica por la misma relación del lado de baja tensión— y por eso la potencia se conserva. Un transformador que da 12 V a 5 A del secundario toma unos 0,27 A del primario a 220 V.',
    },
    {
      q: '¿Por qué el cable se calienta si es muy fino?',
      a: 'Porque la potencia disipada es I²·R y la resistencia crece cuando baja la sección: un cable de la mitad de sección tiene el doble de resistencia y disipa el doble de calor con la misma corriente. Ese calor tiene que salir a través de la aislación, y si no puede, la aislación se degrada, se vuelve quebradiza y termina en cortocircuito. Es exactamente por eso que la térmica se elige en función de lo que el cable aguanta y no de lo que consume el artefacto.',
    },
    {
      q: '¿Sirve el mismo cálculo para 110 V y para 220 V?',
      a: 'La fórmula es la misma, pero los números cambian mucho. Para la misma potencia, a 110 V circula el DOBLE de corriente que a 220 V, así que hacen falta secciones más gruesas y térmicas de mayor amperaje: un anafe de 3.500 W pide 15,9 A a 220 V pero 31,8 A a 110 V. Y la caída de tensión porcentual se cuadruplica, porque la caída en volts se duplica sobre una tensión que es la mitad. Por eso los países de 110 V usan cables notablemente más gruesos para las mismas cargas.',
    },
  ],

  sources: [
    {
      name: 'Reglamentación AEA 90364 para la Ejecución de Instalaciones Eléctricas en Inmuebles',
      url: 'https://www.aea.org.ar/',
      publisher: 'Asociación Electrotécnica Argentina',
    },
    {
      name: 'IEC 60228 — Conductors of insulated cables (secciones normalizadas y resistividad)',
      url: 'https://webstore.iec.ch/publication/810',
      publisher: 'International Electrotechnical Commission',
    },
    {
      name: 'IEC 60898-1 — Circuit-breakers for overcurrent protection for household installations',
      url: 'https://webstore.iec.ch/publication/62190',
      publisher: 'International Electrotechnical Commission',
    },
    {
      name: 'ENRE — Normas de calidad del servicio técnico y del producto técnico',
      url: 'https://www.argentina.gob.ar/enre',
      publisher: 'Ente Nacional Regulador de la Electricidad',
    },
    {
      name: 'NIST Reference on Constants, Units and Uncertainty — resistividad del cobre y coeficiente de temperatura',
      url: 'https://physics.nist.gov/cuu/Constants/',
      publisher: 'National Institute of Standards and Technology',
    },
  ],

  replaces: [
    '/calculadora-cable-awg-amperaje-seccion',
    '/calculadora-fusible-amperaje-cable-seccion',
    '/calculadora-caida-tension-cable-distancia',
    '/calculadora-ley-ohm-voltaje-resistencia',
    '/calculadora-factor-potencia-corregir',
    '/calculadora-transformador-relacion-espiras',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Resistividad a 20 °C en Ω·mm²/m y coeficiente de temperatura por °C.
 * Los valores de cobre salen de la definición IACS (IEC 60228); las
 * calculadoras que absorbe este hub usaban 0,0172 y 0,0282, redondeados.
 */
export const MATERIALES = {
  cobre: { nombre: 'cobre', rho20: 0.017241, alfa: 0.00393 },
  aluminio: { nombre: 'aluminio', rho20: 0.028264, alfa: 0.00403 },
};

/**
 * Secciones normalizadas en mm², su capacidad de corriente (cobre, PVC, en
 * cañería, 30 °C, sin agrupamiento) y su equivalente AWG aproximado.
 */
export const SECCIONES = [
  { mm2: 1, amp: 10, awg: '18' },
  { mm2: 1.5, amp: 15, awg: '16' },
  { mm2: 2.5, amp: 21, awg: '14' },
  { mm2: 4, amp: 27, awg: '12' },
  { mm2: 6, amp: 36, awg: '10' },
  { mm2: 10, amp: 50, awg: '8' },
  { mm2: 16, amp: 66, awg: '6' },
  { mm2: 25, amp: 88, awg: '4' },
  { mm2: 35, amp: 110, awg: '2' },
  { mm2: 50, amp: 133, awg: '1/0' },
  { mm2: 70, amp: 171, awg: '2/0' },
  { mm2: 95, amp: 207, awg: '3/0' },
];

/** Escalones normalizados de llave termomagnética, IEC 60898. */
export const TERMICAS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];

/** Regla logarítmica de corriente, de 0,1 a 200 A, con cargas reconocibles. */
export const SCALE = {
  minA: 0.1,
  maxA: 200,
  refs: [
    { a: 0.05, label: 'un cargador de celular' },
    { a: 0.045, label: 'una lámpara LED de 10 W' },
    { a: 0.7, label: 'una heladera en régimen' },
    { a: 5.5, label: 'un microondas de 1.200 W' },
    { a: 15.9, label: 'un anafe eléctrico de 3.500 W' },
    { a: 40, label: 'el tablero de una vivienda mediana' },
    { a: 100, label: 'la acometida de un taller' },
  ],
};
