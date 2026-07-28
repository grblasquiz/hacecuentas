import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto tengo que regar?"
 *
 * Une las cuatro calculadoras de riego que estaban sueltas. Dos de ellas daban
 * litros por planta distintos para la misma especie (un frutal figuraba con 15
 * L/día en una y con 8 en la otra; una aromática, con 0,2 y con 0,5). Acá hay
 * UNA sola tabla de demanda base y todas las ramas leen de ella.
 */
export const hub: HubData = {
  slug: 'jardin/riego',
  title: 'Cuánto regar: litros por planta, goteo y programación | Hacé Cuentas',
  description:
    'Cuántos litros por día necesita cada planta, cuántos minutos programar el riego por goteo, cómo configurar el programador por zona y cuánta agua gasta tu jardín al mes.',
  silo: 'Jardín',
  siloHref: '/jardin',

  eyebrow: 'Guía de riego',
  h1: '¿Cuánto tengo que regar?',
  lede:
    'Partimos de lo primero que uno quiere saber: cuántos litros por día necesita cada planta. Con ese número salen los minutos de goteo, la programación del temporizador y el consumo mensual del jardín entero.',
  stamps: ['Demanda base por especie', 'Ajuste por estación, clima y suelo', '4 calculadoras adentro'],

  resultLabel: 'Riego estimado',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'planta',
        label: 'Cuántos litros por planta',
        hint: 'Litros por día y por semana',
        answer: 'La demanda base de la especie se ajusta por etapa, estación y clima.',
        yes: [
          'Litros por planta y por día, y el acumulado semanal',
          'Total para todas las plantas que tengas',
          'Ajuste por etapa de desarrollo, estación y clima',
        ],
        warn: [
          'El número es un punto de partida: la tierra manda. Regá cuando los primeros 2 o 3 cm estén secos al tacto',
          'El exceso de agua mata más plantas que la falta: pudre las raíces y no da aviso hasta que es tarde',
        ],
        plazo: 'regá temprano a la mañana: al mediodía se evapora buena parte antes de llegar a la raíz.',
      },
      {
        id: 'goteo',
        label: 'Cuántos minutos de goteo',
        hint: 'Según el caudal del gotero',
        answer: 'Minutos = litros que necesita la planta ÷ caudal del gotero.',
        yes: [
          'Minutos de riego por día según el caudal de tus goteros',
          'Litros totales por día y por mes del sistema',
          'Cuántos goteros conviene por planta según su demanda',
        ],
        warn: [
          'El caudal nominal del gotero es a presión nominal: con presión baja o con la línea muy larga, entrega menos',
          'Los goteros tapados son la causa número uno de plantas secas con el sistema "andando": revisalos al inicio de cada temporada',
        ],
        plazo: 'un solo riego largo es mejor que varios cortos: obliga a la raíz a bajar.',
      },
      {
        id: 'programador',
        label: 'Cómo programo el temporizador',
        hint: 'Minutos y días por semana',
        answer: 'Cada zona tiene su tiempo de ciclo y su frecuencia, y las dos cambian con la estación.',
        yes: [
          'Minutos por ciclo y ciclos por semana para la zona que elijas',
          'Ajuste por estación y por tipo de suelo',
          'Horario recomendado de riego',
        ],
        warn: [
          'El suelo arcilloso no absorbe rápido: si ves charcos, dividí el ciclo en dos con media hora de pausa',
          'Una semana lluviosa reemplaza uno o dos ciclos: los programadores sin sensor de lluvia riegan igual',
        ],
        plazo: 'revisá la programación en cada cambio de estación, no una vez al año.',
      },
      {
        id: 'jardin',
        label: 'Cuánta agua gasta el jardín',
        hint: 'Litros, m³ y costo mensual',
        answer: 'El consumo sale de los m² y del tipo de vegetación, no de la cantidad de plantas.',
        yes: [
          'Litros por día y por mes del jardín completo',
          'Metros cúbicos mensuales, que es como factura la empresa de agua',
          'Costo mensual estimado si cargás el precio del m³',
        ],
        warn: [
          'El césped es lo que más agua consume por metro cuadrado: más del triple que un cantero de especies xerófilas',
          'La factura de agua no siempre discrimina el riego: si tenés medidor, comparalo contra un mes de invierno',
        ],
        plazo: 'una capa de mulch de 5 cm baja la evaporación y puede recortar el riego hasta un 30%.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu jardín',
  inputsIntro: 'Cada rama usa los campos que le corresponden; los demás podés dejarlos como están.',
  fields: [
    {
      id: 'planta',
      label: 'Qué regás',
      type: 'select',
      value: 'tomate',
      options: [
        { value: 'tomate', label: 'Hortaliza de fruto (tomate, pimiento, berenjena)' },
        { value: 'hoja', label: 'Hortaliza de hoja (lechuga, acelga, espinaca)' },
        { value: 'aromatica', label: 'Aromática (albahaca, romero, tomillo)' },
        { value: 'ornamental', label: 'Ornamental de maceta o cantero' },
        { value: 'arbusto', label: 'Arbusto o seto' },
        { value: 'frutal', label: 'Árbol frutal' },
        { value: 'cactus', label: 'Cactus o suculenta' },
      ],
    },
    { id: 'cantidad', label: 'Cuántas plantas', type: 'number', min: 1, max: 10000, value: 10 },
    {
      id: 'etapa',
      label: 'Etapa de desarrollo',
      type: 'select',
      value: 'plena',
      options: [
        { value: 'germinacion', label: 'Germinación o recién trasplantada' },
        { value: 'crecimiento', label: 'Crecimiento' },
        { value: 'plena', label: 'Plena producción o floración' },
      ],
    },
    {
      id: 'estacion',
      label: 'Estación',
      type: 'select',
      value: 'verano',
      options: [
        { value: 'verano', label: 'Verano' },
        { value: 'media', label: 'Primavera u otoño' },
        { value: 'invierno', label: 'Invierno' },
      ],
    },
    {
      id: 'clima',
      label: 'Clima de tu zona',
      type: 'select',
      value: 'templado',
      options: [
        { value: 'seco', label: 'Seco o ventoso' },
        { value: 'templado', label: 'Templado' },
        { value: 'humedo', label: 'Húmedo' },
      ],
    },
    {
      id: 'suelo',
      label: 'Tipo de suelo',
      type: 'select',
      value: 'franco',
      options: [
        { value: 'arenoso', label: 'Arenoso (drena rápido)' },
        { value: 'franco', label: 'Franco (equilibrado)' },
        { value: 'arcilloso', label: 'Arcilloso (retiene agua)' },
      ],
    },
    { id: 'caudalGotero', label: 'Caudal de tus goteros (L/h)', type: 'number', min: 0.5, max: 20, step: 0.5, value: 2 },
    { id: 'superficie', label: 'Superficie del jardín (m²)', type: 'number', min: 1, max: 100000, value: 50 },
    {
      id: 'vegetacion',
      label: 'Vegetación dominante del jardín',
      type: 'select',
      value: 'cesped',
      options: [
        { value: 'cesped', label: 'Césped' },
        { value: 'cantero', label: 'Canteros con arbustos y flores' },
        { value: 'huerta', label: 'Huerta' },
        { value: 'xerofilas', label: 'Especies xerófilas y secas' },
        { value: 'mixto', label: 'Mixto' },
      ],
    },
    {
      id: 'precioM3',
      label: 'Precio del m³ de agua (dejalo en 0 si no lo sabés)',
      prefix: '$',
      value: '0',
      thousands: true,
    },
  ],
  fineprint:
    'Estimación de cantidades y consumo. La tierra manda: regá cuando los primeros centímetros del sustrato estén secos, no por reloj.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu riego',
    caption:
      'La barra cambia con la rama: litros por planta y por día, minutos de goteo, minutos de ciclo del programador o metros cúbicos mensuales del jardín entero.',
  },
  breakdownTitle: 'Los números de tu riego',
  breakdownIntro: 'Las barras comparan cada valor con el mayor de la lista.',

  faq: [
    {
      q: '¿Cuántos litros de agua necesita una planta de tomate por día?',
      a: 'En plena producción, en verano y clima templado, alrededor de 2 litros por planta por día. En etapa de crecimiento baja a poco más de 1 litro, y recién trasplantada, a medio litro. En clima seco o ventoso sumá un 30%; en clima húmedo, restá un 30%.',
    },
    {
      q: '¿Cuánta agua necesita un árbol frutal?',
      a: 'Un frutal adulto en plena producción pide alrededor de 12 litros por día en verano, aunque se reparte mejor en dos o tres riegos profundos por semana que en un poco todos los días. Los frutales prefieren riego espaciado y abundante: obliga a la raíz a bajar y hace al árbol mucho más resistente a la seca.',
    },
    {
      q: '¿Cada cuánto hay que regar?',
      a: 'La frecuencia depende del suelo, no del calendario. En suelo arenoso, riegos más seguidos y más cortos, porque el agua drena rápido. En arcilloso, más espaciados y con ciclos partidos, porque absorbe despacio y se encharca. La prueba práctica: meté el dedo 3 cm en la tierra; si sale seco, regá.',
    },
    {
      q: '¿Cuántos minutos hay que dejar el riego por goteo?',
      a: 'Se calcula dividiendo los litros que necesita la planta por el caudal del gotero. Una planta que pide 2 litros por día con un gotero de 2 L/h necesita 60 minutos. Si el gotero es de 4 L/h, 30 minutos. Por eso conviene conocer el caudal real de los goteros y no suponerlo.',
    },
    {
      q: '¿Cuál es el mejor horario para regar?',
      a: 'Temprano a la mañana, entre las 6 y las 9. La evaporación es mínima, la planta arranca el día hidratada y las hojas se secan antes de la noche, lo que reduce el riesgo de hongos. Regar al mediodía desperdicia agua por evaporación y regar de noche deja el follaje húmedo muchas horas.',
    },
    {
      q: '¿Cómo afecta el tipo de suelo al riego?',
      a: 'El suelo arenoso drena rápido y retiene poco: necesita alrededor de un 20% más de agua, repartida en más riegos. El arcilloso retiene mucho y absorbe despacio: necesita cerca de un 20% menos y conviene partir el ciclo en dos con una pausa de media hora para que infiltre sin encharcar. El franco está en el medio y es el más fácil de manejar.',
    },
    {
      q: '¿Cuánta agua consume un césped por metro cuadrado?',
      a: 'Alrededor de 5 litros por metro cuadrado por día en pleno verano. Un jardín de 100 m² de césped se lleva unos 500 litros diarios, es decir 15 m³ al mes. Un cantero mixto consume cerca de 4 L/m² y uno de especies xerófilas, apenas 1,5.',
    },
    {
      q: '¿Cuánto se ahorra regando por goteo en vez de por aspersión?',
      a: 'Entre un 30 y un 50%. El goteo entrega el agua directamente en la zona de raíces, casi sin evaporación ni deriva por viento, y no moja el follaje. La aspersión es prácticamente obligatoria en césped, pero en canteros, huerta y frutales el goteo gana por amplio margen.',
    },
    {
      q: '¿Cómo sé si estoy regando de más?',
      a: 'Señales de exceso: hojas amarillas y blandas empezando por las de abajo, tierra que nunca llega a secarse en superficie, olor a humedad rancia, mosquitas del sustrato y raíces marrones y blandas al desmoldar. Se parece bastante a la falta de agua, con la diferencia de que la hoja marchita por exceso está blanda y la marchita por falta está seca y quebradiza.',
    },
    {
      q: '¿Cuánto riego necesita menos una planta en invierno?',
      a: 'Alrededor de un 70% menos que en verano. Muchas especies entran en reposo y prácticamente no consumen agua; regar con la frecuencia del verano en invierno es la forma más rápida de pudrir una raíz. Los programadores automáticos hay que reprogramarlos en cada cambio de estación.',
    },
    {
      q: '¿Sirve el mulch para regar menos?',
      a: 'Bastante. Una capa de 5 a 8 cm de paja, corteza o chips sobre la tierra reduce la evaporación de la superficie y puede recortar el riego entre un 20 y un 30%. Además mantiene la temperatura del suelo más pareja y frena las malezas, que también compiten por el agua.',
    },
    {
      q: '¿Se puede regar con agua de lluvia?',
      a: 'Sí, y es mejor que la de red: no tiene cloro ni sales disueltas y suele tener un pH más cercano al que prefieren la mayoría de las plantas. Un techo de 50 m² recolecta alrededor de 500 litros con una lluvia de 10 mm. Hay que tapar el tanque para que no crie mosquitos.',
    },
  ],

  sources: [
    {
      name: 'Crop evapotranspiration — guidelines for computing crop water requirements (FAO 56)',
      url: 'https://www.fao.org/4/x0490e/x0490e00.htm',
      publisher: 'FAO',
    },
    {
      name: 'INTA Pro Huerta — manual de la huerta orgánica familiar',
      url: 'https://inta.gob.ar/documentos/la-huerta-organica-familiar',
      publisher: 'INTA',
    },
    {
      name: 'WaterSense — eficiencia en riego residencial',
      url: 'https://www.epa.gov/watersense/watering-tips',
      publisher: 'US Environmental Protection Agency',
    },
  ],

  replaces: [
    '/calculadora-agua-riego-plantas-dia',
    '/calculadora-riego-goteo-litros-hora-planta',
    '/calculadora-riego-automatico-programacion-minutos',
    '/calculadora-agua-jardin-consumo-mensual-m2',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-captacion-agua-lluvia-m2-techo-litros',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Demanda base por planta, en litros por día, en verano, clima templado y
 * plena producción. Fuente única del hub: acá se unificaron las dos tablas que
 * se contradecían.
 */
export const PLANTAS: Record<string, { nombre: string; litrosDia: number; goteros: number }> = {
  tomate: { nombre: 'Hortaliza de fruto', litrosDia: 2, goteros: 1 },
  hoja: { nombre: 'Hortaliza de hoja', litrosDia: 0.6, goteros: 1 },
  aromatica: { nombre: 'Aromática', litrosDia: 0.4, goteros: 1 },
  ornamental: { nombre: 'Ornamental', litrosDia: 1.5, goteros: 1 },
  arbusto: { nombre: 'Arbusto o seto', litrosDia: 3, goteros: 2 },
  frutal: { nombre: 'Árbol frutal', litrosDia: 12, goteros: 4 },
  cactus: { nombre: 'Cactus o suculenta', litrosDia: 0.05, goteros: 1 },
};

export const FACTOR_ETAPA: Record<string, number> = { germinacion: 0.25, crecimiento: 0.6, plena: 1 };
export const FACTOR_ESTACION: Record<string, number> = { verano: 1, media: 0.7, invierno: 0.3 };
export const FACTOR_CLIMA: Record<string, number> = { seco: 1.3, templado: 1, humedo: 0.7 };
export const FACTOR_SUELO: Record<string, number> = { arenoso: 1.2, franco: 1, arcilloso: 0.8 };

/** Consumo del jardín por m² y por día, en litros, en verano. */
export const VEGETACION: Record<string, { nombre: string; litrosM2Dia: number; ciclosSemana: number; minutosCiclo: number }> = {
  cesped: { nombre: 'Césped', litrosM2Dia: 5, ciclosSemana: 3, minutosCiclo: 25 },
  cantero: { nombre: 'Canteros', litrosM2Dia: 3, ciclosSemana: 3, minutosCiclo: 40 },
  huerta: { nombre: 'Huerta', litrosM2Dia: 4, ciclosSemana: 4, minutosCiclo: 35 },
  xerofilas: { nombre: 'Especies xerófilas', litrosM2Dia: 1.5, ciclosSemana: 1, minutosCiclo: 30 },
  mixto: { nombre: 'Jardín mixto', litrosM2Dia: 4, ciclosSemana: 3, minutosCiclo: 35 },
};

/** Días del mes que se usan para llevar el consumo diario a mensual. */
export const DIAS_MES = 30;
