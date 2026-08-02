import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Cuánto cuesta reformar, construir o cambiar la instalación?"
 *
 * Absorbe 5 calculadoras: reforma de piso por m², coste de construcción por m²,
 * cédula de habitabilidad, aerotermia y autoconsumo solar con excedentes.
 *
 * Constantes: espejo de src/lib/formulas/coste-reforma-piso-cocina-bano-espana-m2.ts,
 * costo-construccion-m2-espana.ts, bomba-calor-aerotermia-espana-coste-instalacion.ts
 * y cedula-habitabilidad-espana-precio-tramite.ts.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'construction-materials'). */
const DISCLAIMER_OBRA =
  'Estimación de materiales y cantidades. Verifica rendimiento, desperdicio y aplicación en la ficha del fabricante o con el profesional a cargo.';

export const hub: HubData = {
  slug: 'es/vivienda/reforma-y-eficiencia',
  title: 'Reformar o construir en España: precio por m², aerotermia y placas solares',
  description:
    'Calcula lo que cuesta reformar un piso o construir una casa por metro cuadrado en España, y si compensa instalar aerotermia o autoconsumo solar con compensación de excedentes.',
  silo: 'Vivienda',
  siloHref: '/es/vivienda',

  eyebrow: 'Guía de obra y eficiencia',
  h1: '¿Cuánto cuesta reformar, construir o cambiar la instalación?',
  lede:
    'Las obras se presupuestan por metro cuadrado, pero el metro cuadrado no vale lo mismo en una reforma básica que en una integral, ni construir de cero que rehabilitar. Y cuando la obra toca la instalación —aerotermia, placas solares— la pregunta ya no es sólo cuánto cuesta, sino en cuántos años se paga sola.',
  stamps: ['Precios de referencia por m²', 'Cálculo de amortización', '5 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué obra vas a hacer?',
    intro: 'Los precios por metro cuadrado son de referencia: pide siempre tres presupuestos.',
    items: [
      {
        id: 'reforma',
        label: 'Reformar un piso',
        hint: 'Integral, cocina o baño',
        answer:
          'Una reforma integral se mueve en una horquilla amplia por metro cuadrado según el nivel de acabados.',
        yes: [
          'Precio por metro cuadrado según nivel: básico, medio o alto',
          'Cocina y baño se presupuestan aparte porque concentran instalación',
          'Licencia de obra menor o mayor según el alcance',
          'IVA del 10% en reformas de vivienda que cumplan los requisitos',
        ],
        warn: [
          DISCLAIMER_OBRA,
          'Tocar tabiquería, instalaciones o fachada cambia la licencia y puede exigir proyecto de técnico',
          'El IVA reducido del 10% en reforma exige que el material aportado por el contratista no supere el 40% de la base',
          'Reserva entre un 10% y un 15% de imprevistos: en obra siempre aparece algo detrás de un tabique',
        ],
        plazo: 'la licencia de obra menor suele resolverse en semanas; la mayor, en meses.',
      },
      {
        id: 'construir',
        label: 'Construir una casa',
        hint: 'Obra nueva por m²',
        answer:
          'Construir de cero se presupuesta por metro cuadrado construido y aparte van el solar, los honorarios y las licencias.',
        yes: [
          'Coste de ejecución material por metro cuadrado según calidad',
          'Reparto aproximado entre materiales y mano de obra',
          'Honorarios de arquitecto y aparejador, y licencia municipal',
          'IVA del 10% en vivienda de obra nueva',
        ],
        warn: [
          DISCLAIMER_OBRA,
          'El precio por metro cuadrado no incluye el solar, que en muchas zonas es la mitad del coste total',
          'Tampoco incluye urbanización, acometidas ni mobiliario',
          'Los honorarios técnicos y el seguro decenal suman un porcentaje relevante sobre la ejecución material',
        ],
        plazo: 'la licencia de obra mayor puede tardar varios meses según el ayuntamiento.',
      },
      {
        id: 'aerotermia',
        label: 'Poner aerotermia',
        hint: 'Sustituir caldera',
        answer:
          'La aerotermia cuesta más de instalar que una caldera pero consume mucho menos: la clave es en cuántos años se recupera.',
        yes: [
          'Coste de equipo e instalación según potencia necesaria',
          'Ahorro anual frente a gas, gasoil o electricidad directa',
          'Años de amortización de la inversión',
          'Posibles ayudas de rehabilitación energética',
        ],
        warn: [
          DISCLAIMER_OBRA,
          'El rendimiento cae en climas muy fríos: la amortización que sale en el norte no es la del sur',
          'Si la vivienda está mal aislada, cambiar el equipo sin aislar antes desperdicia buena parte del ahorro',
          'Requiere radiadores de baja temperatura o suelo radiante para rendir de verdad',
        ],
        plazo: 'las ayudas de rehabilitación energética tienen convocatorias con plazos limitados.',
      },
      {
        id: 'solar',
        label: 'Instalar placas solares',
        hint: 'Autoconsumo con excedentes',
        answer:
          'El autoconsumo se amortiza con lo que dejas de comprar a la red, más lo poco que te pagan por los excedentes.',
        yes: [
          'Coste de la instalación según potencia pico instalada',
          'Producción anual estimada según horas equivalentes de sol de tu zona',
          'Ahorro por autoconsumo instantáneo, que es donde está el dinero',
          'Compensación de excedentes en la factura, a precio menor que el de compra',
        ],
        warn: [
          DISCLAIMER_OBRA,
          'La compensación de excedentes se descuenta sólo del término de energía y nunca puede dejar la factura en negativo',
          'Las horas de sol cambian mucho entre el norte y el sur: la misma instalación tarda años más en amortizarse en la cornisa cantábrica',
          'Sin batería, la energía que no consumes en el momento se vierte y se paga mucho peor',
        ],
        plazo: 'la legalización de la instalación ante la comunidad autónoma es obligatoria.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro: 'Los precios por metro cuadrado son de referencia nacional: ajústalos a tu zona.',
  fields: [
    { id: 'metros', label: 'Metros cuadrados', type: 'number', value: '90', min: 10, max: 600, step: 1 },
    {
      id: 'nivel',
      label: 'Nivel de acabados',
      type: 'select',
      value: 'media',
      options: [
        { value: 'basica', label: 'Básico' },
        { value: 'media', label: 'Medio' },
        { value: 'alta', label: 'Alto' },
      ],
    },
    {
      id: 'incluirCocina',
      label: '¿Incluye reforma de cocina?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'banos',
      label: 'Baños que reformar',
      type: 'number',
      value: '1',
      min: 0,
      max: 5,
      step: 1,
    },
    { id: 'gastoEnergiaAnual', label: 'Gasto anual actual en calefacción o luz', prefix: '€', value: '1.200', thousands: true },
    {
      id: 'potenciaSolar',
      label: 'Potencia solar que instalarías',
      type: 'number',
      value: '3',
      min: 0,
      max: 20,
      step: 0.5,
      suffix: ' kWp',
    },
    {
      id: 'horasSol',
      label: 'Horas solares equivalentes al día en tu zona',
      type: 'number',
      value: '4',
      min: 2,
      max: 6,
      step: 0.1,
      help: 'En torno a 3 en la cornisa cantábrica y 5 en el sur peninsular.',
    },
    {
      id: 'autoconsumoPct',
      label: 'Porcentaje de la producción que consumes en el momento',
      type: 'number',
      value: '60',
      min: 0,
      max: 100,
      step: 5,
      suffix: '%',
    },
  ],
  fineprint: DISCLAIMER_OBRA,

  chart: {
    type: 'bars',
    title: 'Coste de la obra y lo que ahorra',
    caption:
      'Compara la inversión con el ahorro anual que genera: la relación entre ambas es el plazo de amortización.',
  },
  breakdownTitle: 'El presupuesto, partida por partida',
  breakdownIntro:
    'Los importes son del total de la obra. Las filas de superficie, años y energía llevan su unidad.',

  faq: [
    {
      q: '¿Cuánto cuesta reformar un piso por metro cuadrado?',
      a: 'Depende del nivel de acabados: una reforma básica se mueve en la parte baja de la horquilla, la media en torno al doble de la básica y la alta puede superar los mil euros por metro cuadrado. Cocina y baño se presupuestan aparte porque concentran fontanería, electricidad y alicatado.',
    },
    {
      q: '¿Qué IVA se paga en una reforma?',
      a: 'El 10% si es una reforma de vivienda destinada a uso particular, la vivienda tiene más de dos años y el material aportado por el contratista no supera el 40% de la base imponible. Si se pasa de ese 40%, la obra completa va al 21%.',
    },
    {
      q: '¿Necesito licencia para reformar?',
      a: 'Casi siempre alguna. Una obra menor —pintar, cambiar suelos o sanitarios sin tocar instalaciones— se resuelve con comunicación previa o licencia rápida. Tocar tabiquería, estructura, fachada o instalaciones generales exige licencia de obra mayor y proyecto técnico.',
    },
    {
      q: '¿Qué es la cédula de habitabilidad y cuándo hace falta?',
      a: 'Un documento que acredita que la vivienda cumple los requisitos mínimos de habitabilidad. Se exige en varias comunidades autónomas para alquilar, vender o dar de alta suministros. La emite un técnico tras visita y lleva tasa administrativa aparte.',
    },
    {
      q: '¿Cuánto cuesta construir una casa?',
      a: 'El coste de ejecución material por metro cuadrado construido va de una calidad económica a una premium con una diferencia de varios cientos de euros por metro. A eso hay que sumarle honorarios técnicos, licencia, seguro decenal y, sobre todo, el solar, que no entra en ningún precio por metro cuadrado.',
    },
    {
      q: '¿Compensa la aerotermia?',
      a: 'Depende de qué sustituya y del clima. Frente a gasóleo o electricidad directa el ahorro es grande y la amortización razonable; frente a una caldera de gas moderna en clima suave, el plazo se alarga. Y si la vivienda está mal aislada, primero conviene aislar.',
    },
    {
      q: '¿Cuánto se ahorra con placas solares?',
      a: 'El grueso del ahorro está en el autoconsumo instantáneo, es decir, en la energía que produces y gastas a la vez. Cuanto mayor sea ese porcentaje, antes se amortiza la instalación. Los excedentes se compensan, pero a un precio bastante menor que el de compra.',
    },
    {
      q: '¿Cómo funciona la compensación de excedentes?',
      a: 'La energía que viertes a la red se descuenta en la factura del mes, pero sólo del término de energía y nunca puede dejar la factura por debajo de cero: los peajes y los impuestos se pagan igual. Por eso sobredimensionar la instalación rinde cada vez menos.',
    },
    {
      q: '¿Merece la pena poner batería?',
      a: 'Encarece bastante la instalación y alarga la amortización, aunque sube mucho el porcentaje de autoconsumo. Tiene sentido en consumos altos por la noche, en zonas con cortes frecuentes o cuando existe una ayuda que cubra parte del coste.',
    },
    {
      q: '¿Hay ayudas para la eficiencia energética?',
      a: 'Sí, tanto de los programas de rehabilitación energética como deducciones en el IRPF por obras que reduzcan la demanda o el consumo de energía primaria no renovable, acreditadas con certificados energéticos antes y después. Los plazos son limitados y la documentación, exigente.',
    },
    {
      q: '¿Cuánto imprevisto debo presupuestar?',
      a: 'Entre un 10% y un 15% del presupuesto de la obra. En reformas de edificios antiguos, más: instalaciones fuera de norma, humedades o forjados en mal estado sólo aparecen cuando se abre el tabique, y ya no hay marcha atrás.',
    },
  ],

  sources: [
    {
      name: 'Código Técnico de la Edificación',
      url: 'https://www.codigotecnico.org/',
      publisher: 'Ministerio de Vivienda y Agenda Urbana',
    },
    {
      name: 'Ley 37/1992 del IVA — tipo reducido en obras de renovación de vivienda',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Real Decreto 244/2019 — autoconsumo y compensación de excedentes',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-5089',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'IDAE — ayudas y eficiencia energética en edificios',
      url: 'https://www.idae.es/',
      publisher: 'Instituto para la Diversificación y Ahorro de la Energía',
    },
  ],

  replaces: [
    '/calculadora-coste-reforma-piso-cocina-bano-espana-m2',
    '/calculadora-costo-construccion-m2-espana',
    '/calculadora-cedula-habitabilidad-espana-precio-tramite',
    '/calculadora-bomba-calor-aerotermia-espana-coste-instalacion',
    '/calculadora-autoconsumo-solar-compensacion-excedentes-espana',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Precio de reforma por m². Espejo de coste-reforma-piso-cocina-bano-espana-m2.ts. */
export const REFORMA_M2: Record<string, number> = { basica: 450, media: 700, alta: 1000 };
export const REFORMA_EXTRAS = { cocina: 9000, bano: 5500, imprevistosPct: 0.12 };

/** Coste de construcción por m². Espejo de costo-construccion-m2-espana.ts. */
export const CONSTRUCCION_M2: Record<string, number> = { basica: 1450, media: 1750, alta: 2250 };
export const CONSTRUCCION = { pctMateriales: 0.6, pctHonorarios: 0.12, pctLicencia: 0.04 };

/** Cédula de habitabilidad. Espejo de cedula-habitabilidad-espana-precio-tramite.ts. */
export const CEDULA = { honorariosTecnico: 110, tasaMedia: 42 };

/** Aerotermia: coste por kW instalado y rendimiento de referencia. */
export const AEROTERMIA = { costePorKw: 1200, kwPor100m2: 8, ahorroFrenteGas: 0.45, ahorroFrenteElectrico: 0.7 };

/** Autoconsumo solar. */
export const SOLAR = {
  costePorKwp: 1300,
  precioCompraKwh: 0.15,
  precioExcedenteKwh: 0.06,
  diasAnio: 365,
};
