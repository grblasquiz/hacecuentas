import type { HubData } from './types';

/**
 * Hub de decisión — "¿Necesito visa para este viaje y cuánto sale?".
 *
 * Números espejados de:
 *   src/lib/formulas/visa-usa-costo-tiempo-pasaporte.ts   (MRV 185/205 USD + espera por consulado)
 *   src/lib/formulas/esta-usa-requisitos.ts               (VWP · ESTA USD 21 · 2 años)
 *   src/lib/formulas/visa-schengen-europa-requisitos.ts   (sin visa 90/180 · ETIAS EUR 20 · visa EUR 90)
 *   src/lib/formulas/visa-brasil-ciudadano-argentino.ts   (Mercosur con DNI · eVisa USD 80)
 *   src/lib/formulas/visa-japon-argentino.ts              (sin visa 90 días · turista USD 20)
 *   src/lib/formulas/visa-china-turista-costo.ts          (base por nacionalidad × entradas)
 *   src/lib/formulas/eta-canada-requisitos.ts             (ETA USD 5 · visa USD 74)
 *   src/lib/formulas/visa-turismo-paises-costo-tiempo.ts  (tasa + centro + seguro + extras)
 *   src/lib/formulas/pasaporte-renovacion-costo-tiempo.ts (tabla por país)
 *   src/lib/formulas/working-holiday-australia-costo-ano.ts
 *   src/lib/formulas/vacuna-fiebre-amarilla-cuanto-antes.ts (umbral OMS de 10 días)
 */

export const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

export const hub: HubData = {
  slug: 'viajes/visas-y-tramites',
  title: '¿Necesito visa para viajar y cuánto sale? — Costos y plazos por destino',
  description:
    'Si necesitás visa, ESTA, ETIAS o ETA para tu destino, cuánto cuesta la tasa consular, cuánto tarda el turno, qué vigencia tiene que tener tu pasaporte y con cuántos días de anticipación aplicarte la vacuna de fiebre amarilla.',
  silo: 'Viajes',
  siloHref: '/viajes',

  eyebrow: 'Visas, pasaporte y requisitos de ingreso',
  h1: '¿Necesitás visa para ese viaje? Veamos cuánto sale y cuánto tarda',
  lede:
    'Partimos del destino que más consultas genera, Estados Unidos. Si tu viaje es a Europa, Brasil, Japón, China o Canadá —o si lo que te falta es renovar el pasaporte— lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Tasas consulares vigentes', '11 calculadoras adentro'],

  resultLabel: 'Lo que te va a costar',

  cases: {
    title: '¿A dónde viajás o qué trámite tenés que hacer?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'usa',
        label: 'Estados Unidos',
        hint: 'Visa B1/B2 o ESTA',
        answer: 'Si tu país está en el programa de exención, viajás con ESTA; si no, necesitás visa con entrevista.',
        yes: [
          'Tasa MRV de la visa B1/B2 de turismo y negocios',
          'ESTA para nacionalidades del Programa de Exención de Visa: mucho más barato, online y sin entrevista',
          'Espera estimada de turno de entrevista según el consulado',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El pasaporte tiene que tener al menos 6 meses de vigencia: sin eso el trámite y hasta el embarque pueden caerse',
          'La tasa consular no se reembolsa si te rechazan la visa',
          'Haber viajado a Cuba, Irán o Siria desde 2011 descalifica del ESTA aunque tu país esté en el programa',
        ],
        plazo: 'la espera de turno varía mucho por consulado: pedilo apenas tengas fecha de viaje.',
      },
      {
        id: 'schengen',
        label: 'Europa (espacio Schengen)',
        hint: 'ETIAS o visa',
        answer: 'Buena parte de Latinoamérica entra sin visa hasta 90 días cada 180, con ETIAS.',
        yes: [
          'Sin visa para turismo hasta 90 días dentro de cualquier ventana de 180 para varias nacionalidades',
          'ETIAS: autorización online de bajo costo, se aprueba en minutos y es gratis para menores de 18 y mayores de 70',
          'Visa Schengen para nacionalidades que la requieren, y visa nacional de larga duración por encima de 90 días',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'La regla de 90 días cada 180 es móvil: se cuentan los días de todos los viajes previos dentro de esa ventana, no de cada viaje por separado',
          'La visa Schengen exige seguro médico con cobertura de 30.000 euros: sin eso se rechaza',
        ],
        plazo: 'la ETIAS conviene tramitarla al menos 96 horas antes de volar.',
      },
      {
        id: 'brasil',
        label: 'Brasil',
        hint: 'Mercosur',
        answer: 'Los ciudadanos del Mercosur entran con el documento de identidad, sin pasaporte ni visa.',
        yes: [
          'Sin visa para nacionalidades del Mercosur y asociados, con documento de identidad vigente',
          'eVisa online para estadounidenses, canadienses y australianos, reinstaurada desde 2025',
          'Estadías de más de 90 días requieren visa de larga duración cualquiera sea la nacionalidad',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Si viaja un menor sin ambos padres hace falta autorización de viaje de los dos, apostillada',
          'El documento tiene que estar en buen estado: uno deteriorado puede ser rechazado en Migraciones',
        ],
        plazo: 'la eVisa se tramita online antes de viajar; no se emite al llegar.',
      },
      {
        id: 'japon',
        label: 'Japón',
        hint: '90 días sin visa',
        answer: 'Varias nacionalidades de Latinoamérica entran a Japón sin visa por hasta 90 días.',
        yes: [
          'Ingreso sin visa y sin costo por acuerdo bilateral, hasta 90 días de turismo',
          'Visa de turista consular para las nacionalidades que la necesitan',
          'Visa nacional de estadía larga por encima de los 90 días',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'En el ingreso pueden pedirte pasaje de vuelta, reserva de alojamiento y prueba de medios económicos',
          'El ingreso sin visa es para turismo: trabajar aunque sea de forma esporádica requiere otra categoría migratoria',
        ],
        plazo: 'el conteo de los 90 días arranca el día de ingreso, no al comprar el pasaje.',
      },
      {
        id: 'china',
        label: 'China',
        hint: 'Visa L presencial',
        answer: 'La visa de turismo a China es presencial, con huellas digitales y muchos papeles.',
        yes: [
          'Tasa consular según nacionalidad y cantidad de entradas: una, dos o múltiples',
          'Plazo habitual de procesamiento en días hábiles, más el turno',
          'Documentación completa: formulario, foto, itinerario, hoteles, vuelos y extractos',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El trámite es presencial porque se toman huellas digitales: no hay versión totalmente online',
          'Piden itinerario con vuelos y hoteles ya reservados, así que hay que comprometer plata antes de tener la visa',
        ],
        plazo: 'contá el plazo de procesamiento más la espera del turno para entregar la documentación.',
      },
      {
        id: 'canada',
        label: 'Canadá',
        hint: 'ETA o visa',
        answer: 'La ETA sólo se exige si entrás en avión; por tierra o mar no hace falta.',
        yes: [
          'ETA online para nacionalidades habilitadas, y también para quienes tienen visa válida de Estados Unidos',
          'Visa de turista para las nacionalidades que la requieren, con espera de semanas',
          'Ingreso por frontera terrestre o marítima: sin ETA, pero con pasaporte y visa si corresponde',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Tramitá la ETA sólo en el sitio oficial del gobierno de Canadá: los intermediarios cobran de más por el mismo trámite',
          'Tener visa válida de Estados Unidos habilita la ETA, pero no reemplaza a la visa canadiense si viajás por tierra',
        ],
        plazo: 'la ETA suele aprobarse en minutos, aunque puede demorar hasta 72 horas.',
      },
      {
        id: 'generica',
        label: 'Otro destino: quiero el costo total',
        hint: 'Tasa + centro + seguro',
        answer: 'El costo real de una visa es la tasa más el centro de visas, el seguro y los extras.',
        yes: [
          'Tasa consular del país emisor',
          'Cargo del centro de visas tercerizado (VFS, BLS, CVASC y similares)',
          'Seguro de viaje por día de estadía y extras: fotos, copias, courier y traducciones',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Las tasas se cobran en la moneda del país emisor: convertí al tipo de cambio del día en que pagás',
          'La tasa consular no se reembolsa si la visa se rechaza, y el cargo del centro de visas tampoco',
        ],
        plazo: 'sumá al plazo del consulado el tiempo del centro de visas y del courier de devolución.',
      },
      {
        id: 'pasaporte',
        label: 'Renovar el pasaporte',
        hint: 'Costo y demora por país',
        answer: 'Casi todos los destinos exigen pasaporte con al menos 6 meses de vigencia.',
        yes: [
          'Costo del trámite ordinario y del express, donde existe',
          'Plazo de entrega estimado en cada país',
          'Documentación habitual: documento de identidad, partida, foto biométrica y turno previo',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Varios países no tienen trámite express: si viajás pronto, esa es la única variable que no podés acelerar',
          'Renovar el pasaporte con una visa vigente en el anterior no anula la visa, pero hay que llevar los dos libretas al viajar',
        ],
        plazo: 'la regla práctica es tener 6 meses de vigencia contados desde la fecha de regreso.',
      },
      {
        id: 'working-holiday',
        label: 'Working Holiday en Australia',
        hint: 'Visa + fondos exigidos',
        answer: 'Además de la visa hay que demostrar fondos y tener pasaje de regreso.',
        yes: [
          'Costo de la visa Working Holiday',
          'Fondos mínimos que exige Migraciones para acreditar solvencia',
          'Pasaje de regreso y vivienda inicial hasta el primer sueldo',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Los fondos exigidos hay que poder acreditarlos: no alcanza con tenerlos prometidos',
          'Sumá un colchón adicional por imprevistos: conseguir el primer trabajo puede llevar semanas',
        ],
        plazo: 'la visa es de 12 meses y se puede extender cumpliendo requisitos de trabajo regional.',
      },
      {
        id: 'fiebre-amarilla',
        label: 'Vacuna de fiebre amarilla',
        hint: 'Mínimo 10 días antes',
        answer: 'El certificado recién es válido 10 días después de aplicada la dosis.',
        yes: [
          'Cuántos días de margen tenés antes del viaje',
          'Si el certificado internacional va a ser válido a tiempo',
          'Una sola dosis da inmunidad de por vida según el criterio OMS vigente desde 2016',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Con menos de 10 días de margen el certificado no es válido y un destino que la exige puede negarte el ingreso',
          'Es una vacuna a virus vivo atenuado: no se aplica en cualquier condición de salud, consultá antes',
        ],
        plazo: 'la inmunidad válida internacionalmente arranca a los 10 días de la aplicación.',
      },
    ],
  },

  inputsTitle: 'Contanos tu caso',
  inputsIntro: 'Los campos que no aplican a tu destino se ignoran. Podés dejar los valores de ejemplo.',
  fields: [
    {
      id: 'nacionalidad',
      label: 'Tu nacionalidad',
      type: 'select',
      value: 'argentino',
      options: [
        { value: 'argentino', label: 'Argentina' },
        { value: 'chileno', label: 'Chile' },
        { value: 'uruguayo', label: 'Uruguay' },
        { value: 'paraguayo', label: 'Paraguay' },
        { value: 'brasileno', label: 'Brasil' },
        { value: 'mexicano', label: 'México' },
        { value: 'colombiano', label: 'Colombia' },
        { value: 'peruano', label: 'Perú' },
        { value: 'espanol', label: 'España' },
        { value: 'estadounidense', label: 'Estados Unidos' },
        { value: 'canadiense', label: 'Canadá' },
      ],
    },
    { id: 'diasEstadia', label: 'Días de estadía previstos', type: 'number', min: 1, max: 730, value: 15 },
    { id: 'mesesPasaporte', label: 'Meses de vigencia que le quedan a tu pasaporte', type: 'number', min: 0, max: 120, value: 18 },
    {
      id: 'tipoVisa',
      label: 'Tipo de visa de Estados Unidos',
      type: 'select',
      value: 'b1b2',
      options: [
        { value: 'b1b2', label: 'B1/B2 — turismo y negocios' },
        { value: 'f1', label: 'F1 — estudiante' },
        { value: 'h1b', label: 'H1B — trabajo especializado' },
      ],
    },
    {
      id: 'entradas',
      label: 'Entradas de la visa a China',
      type: 'select',
      value: 'una',
      options: [
        { value: 'una', label: 'Una sola entrada' },
        { value: 'dos', label: 'Doble entrada' },
        { value: 'multiple', label: 'Múltiples entradas' },
      ],
    },
    {
      id: 'medio',
      label: 'Cómo entrás a Canadá',
      type: 'select',
      value: 'avion',
      options: [
        { value: 'avion', label: 'En avión' },
        { value: 'auto', label: 'Por tierra o mar' },
      ],
    },
    {
      id: 'tieneVisaUsa',
      label: '¿Tenés visa válida de Estados Unidos?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
    },
    { id: 'tasaConsular', label: 'Tasa consular del destino (USD)', type: 'number', min: 0, value: 90 },
    { id: 'cargoCentro', label: 'Cargo del centro de visas (USD)', type: 'number', min: 0, value: 35 },
    { id: 'seguroDia', label: 'Seguro de viaje por día (USD)', type: 'number', min: 0, step: 0.5, value: 2 },
    { id: 'extras', label: 'Fotos, copias, courier y traducciones (USD)', type: 'number', min: 0, value: 40 },
    {
      id: 'paisPasaporte',
      label: 'País donde renovás el pasaporte',
      type: 'select',
      value: 'argentina',
      options: [
        { value: 'argentina', label: 'Argentina' },
        { value: 'mexico', label: 'México' },
        { value: 'chile', label: 'Chile' },
        { value: 'colombia', label: 'Colombia' },
        { value: 'peru', label: 'Perú' },
        { value: 'brasil', label: 'Brasil' },
        { value: 'uruguay', label: 'Uruguay' },
      ],
    },
    {
      id: 'tipoTramite',
      label: 'Modalidad del trámite de pasaporte',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'normal', label: 'Ordinario' },
        { value: 'express', label: 'Express' },
      ],
    },
    { id: 'diasParaViajar', label: 'Días que faltan para el viaje (fiebre amarilla)', type: 'number', min: 0, max: 400, value: 25 },
  ],
  fineprint: DISCLAIMER_LEGAL,

  chart: {
    type: 'bars',
    title: 'Qué compone el costo del trámite',
    caption:
      'Cada barra es un componente del gasto en dólares: tasa consular, cargo del centro de visas, seguro y extras. Se ve de un vistazo cuál es el rubro que más pesa y dónde conviene comparar antes de pagar.',
  },
  breakdownTitle: 'El detalle del trámite',
  breakdownIntro: 'Costos, plazos y requisitos que aplican a tu caso.',

  faq: [
    {
      q: '¿Los argentinos necesitan visa para Europa?',
      a: 'Para turismo de hasta 90 días dentro de cualquier ventana de 180 no hace falta visa. Lo que sí se suma es la ETIAS, una autorización electrónica de bajo costo que se tramita online y se aprueba en minutos, gratis para menores de 18 y mayores de 70.',
    },
    {
      q: '¿Cómo funciona la regla de 90 días cada 180 en Schengen?',
      a: 'Es una ventana móvil: en cualquier período de 180 días hacia atrás no podés sumar más de 90 días de estadía en todo el espacio Schengen. No se reinicia por salir y volver a entrar, ni se cuenta por país.',
    },
    {
      q: '¿Qué diferencia hay entre ESTA, ETIAS y ETA?',
      a: 'Son autorizaciones electrónicas de tres destinos distintos: ESTA es de Estados Unidos, ETIAS de la Unión Europea y ETA de Canadá. Ninguna es una visa: son un permiso previo al embarque para quienes ya están exentos de visa.',
    },
    {
      q: '¿Cuánta vigencia tiene que tener el pasaporte para viajar?',
      a: 'La regla práctica más extendida son 6 meses contados desde la fecha de regreso. Algunos destinos piden sólo que sea válido durante toda la estadía, pero las aerolíneas suelen aplicar el criterio más estricto en el mostrador.',
    },
    {
      q: '¿Se devuelve la tasa consular si me rechazan la visa?',
      a: 'No. Ni la tasa consular ni el cargo del centro de visas se reembolsan ante un rechazo. Si volvés a aplicar, se pagan de nuevo completas.',
    },
    {
      q: '¿Necesito pasaporte para viajar a Brasil desde Argentina?',
      a: 'No: los ciudadanos del Mercosur pueden ingresar con el documento nacional de identidad vigente. Sí conviene que esté en buen estado, porque un documento deteriorado puede ser rechazado en el control migratorio.',
    },
    {
      q: '¿Qué documentación pide la visa de turismo a China?',
      a: 'Es de las más exigentes: formulario, foto, itinerario con vuelos y hoteles ya reservados, extractos bancarios, carta del trabajo y toma de huellas digitales de forma presencial. No hay una modalidad íntegramente online.',
    },
    {
      q: '¿La ETA de Canadá se pide también si entro por tierra?',
      a: 'No. La ETA sólo se exige para ingresos aéreos. Si cruzás por frontera terrestre o llegás por mar no hace falta, aunque sí el pasaporte y la visa cuando tu nacionalidad la requiera.',
    },
    {
      q: '¿Con cuánta anticipación hay que darse la vacuna de fiebre amarilla?',
      a: 'Al menos 10 días antes del viaje: ese es el plazo que la dosis necesita para generar inmunidad y para que el certificado internacional sea válido. Con menos margen, un destino que la exige puede negar el ingreso.',
    },
    {
      q: '¿Hay que revacunarse contra la fiebre amarilla cada diez años?',
      a: 'No. Desde 2016 el criterio de la OMS es que una sola dosis da protección de por vida y el certificado internacional queda vigente sin refuerzos.',
    },
    {
      q: '¿Qué costos tiene una visa además de la tasa consular?',
      a: 'El cargo del centro de visas tercerizado, el seguro de viaje obligatorio en muchos destinos, las fotos con formato específico, las copias, el courier de devolución del pasaporte y, según el caso, traducciones juradas.',
    },
    {
      q: '¿Cuánta plata hay que demostrar para una Working Holiday en Australia?',
      a: 'Además del costo de la visa hay que acreditar fondos propios y contar con pasaje de regreso o dinero suficiente para comprarlo. Conviene sumar un colchón extra: entre llegar y cobrar el primer sueldo suelen pasar varias semanas.',
    },
  ],

  sources: [
    {
      name: 'U.S. Visas — Fees for Visa Services (tasa MRV)',
      url: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html',
      publisher: 'U.S. Department of State',
    },
    {
      name: 'Official ESTA Application Website',
      url: 'https://esta.cbp.dhs.gov/',
      publisher: 'U.S. Customs and Border Protection',
    },
    {
      name: 'ETIAS — European Travel Information and Authorisation System',
      url: 'https://travel-europe.europa.eu/etias_en',
      publisher: 'Comisión Europea',
    },
    {
      name: 'Electronic Travel Authorization (eTA) — requisitos y costo',
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html',
      publisher: 'Government of Canada',
    },
    {
      name: 'Visto eletrônico (e-Visa) para Brasil',
      url: 'https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos',
      publisher: 'Ministério das Relações Exteriores do Brasil',
    },
    {
      name: 'Working Holiday Maker visa (subclass 417) — costos y requisitos',
      url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417',
      publisher: 'Australian Department of Home Affairs',
    },
    {
      name: 'Yellow fever vaccination — International Health Regulations, validez de por vida',
      url: 'https://www.who.int/news-room/questions-and-answers/item/yellow-fever',
      publisher: 'Organización Mundial de la Salud',
      date: '2016',
    },
    {
      name: 'Pasaporte argentino — costo y plazos del trámite',
      url: 'https://www.argentina.gob.ar/interior/renaper/pasaporte',
      publisher: 'RENAPER — Ministerio del Interior',
    },
  ],

  replaces: [
    '/calculadora-visa-usa-costo-tiempo-pasaporte',
    '/calculadora-esta-usa-requisitos',
    '/calculadora-visa-schengen-europa-requisitos',
    '/calculadora-visa-brasil-ciudadano-argentino',
    '/calculadora-visa-japon-argentino',
    '/calculadora-visa-china-turista-costo',
    '/calculadora-eta-canada-requisitos',
    '/calculadora-visa-turismo-paises-costo-tiempo',
    '/calculadora-pasaporte-renovacion-costo-tiempo',
    '/calculadora-working-holiday-australia-costo-ano',
    '/calculadora-vacuna-fiebre-amarilla-cuanto-antes',
    '/calculadora-costo-ciudadania-italiana-argentina',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-visa-turismo-usa-ee-uu-costo-b1-b2',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Tasa MRV por tipo de visa de EE.UU. (USD) — espejo de visa-usa-costo-tiempo-pasaporte.ts */
export const MRV: Record<string, number> = { b1b2: 185, f1: 185, h1b: 205 };

/** Espera estimada de turno de entrevista, en semanas, por país de trámite. */
export const ESPERA_USA: Record<string, number> = {
  argentino: 10,
  mexicano: 3,
  colombiano: 8,
  peruano: 10,
  chileno: 5,
  brasileno: 12,
  uruguayo: 8,
  paraguayo: 8,
  espanol: 8,
  estadounidense: 0,
  canadiense: 8,
};

/** Nacionalidades del Programa de Exención de Visa de EE.UU. (ESTA) presentes en el selector. */
export const VWP = ['espanol', 'chileno'];
export const ESTA_USD = 21;

/** Schengen — espejo de visa-schengen-europa-requisitos.ts */
export const SCHENGEN_SIN_VISA = ['argentino', 'chileno', 'mexicano', 'brasileno', 'uruguayo', 'paraguayo', 'colombiano', 'peruano', 'espanol', 'estadounidense', 'canadiense'];
export const SCHENGEN = { etiasEur: 20, visaEur: 90, largaEur: 180 };

/** Brasil — espejo de visa-brasil-ciudadano-argentino.ts */
export const BRASIL_MERCOSUR = ['argentino', 'chileno', 'uruguayo', 'paraguayo', 'colombiano', 'peruano', 'brasileno'];
export const BRASIL_EVISA = ['estadounidense', 'canadiense'];
export const BRASIL_EVISA_USD = 80;

/** Japón — espejo de visa-japon-argentino.ts */
export const JAPON_SIN_VISA = ['argentino', 'chileno', 'brasileno', 'mexicano', 'uruguayo', 'espanol', 'estadounidense', 'canadiense'];
export const JAPON = { turistaUsd: 20, largaUsd: 50 };

/** China — espejo de visa-china-turista-costo.ts */
export const CHINA_BASE: Record<string, number> = { estadounidense: 185, canadiense: 100 };
export const CHINA_BASE_DEFAULT = 140;
export const CHINA_MULTIPLICADOR: Record<string, number> = { una: 1, dos: 1.5, multiple: 2 };
export const CHINA_DIAS_HABILES = 4;

/** Canadá — espejo de eta-canada-requisitos.ts */
export const CANADA_ETA = ['chileno', 'mexicano', 'uruguayo', 'brasileno', 'espanol'];
export const CANADA_VISA_NAC = ['argentino', 'peruano', 'colombiano', 'paraguayo'];
export const CANADA = { etaUsd: 5, visaUsd: 74 };

/** Australia Working Holiday (AUD) — espejo de working-holiday-australia-costo-ano.ts */
export const AUSTRALIA = { visa: 500, fondos: 5000, pasaje: 1500, vivienda: 2000, colchonMin: 3000, colchonMax: 5000 };

/** Pasaporte por país — espejo de pasaporte-renovacion-costo-tiempo.ts */
export const PASAPORTE: Record<string, { normal: string; express: string; tNormal: string; tExpress: string }> = {
  argentina: { normal: 'ARS 90.000', express: 'ARS 180.000', tNormal: '15-20 días', tExpress: '48 hs' },
  mexico: { normal: 'MXN 2.000-6.000', express: 'N/A', tNormal: '3-5 días', tExpress: 'N/A' },
  chile: { normal: 'CLP 88.000', express: 'CLP 130.000', tNormal: '15 días', tExpress: '5 días' },
  colombia: { normal: 'COP 258.000', express: 'COP 520.000', tNormal: '8 días', tExpress: '1-3 días' },
  peru: { normal: 'PEN 120', express: 'PEN 220', tNormal: 'mismo día', tExpress: 'mismo día' },
  brasil: { normal: 'BRL 257', express: 'N/A', tNormal: '5 días', tExpress: 'N/A' },
  uruguay: { normal: 'UYU 2.700', express: 'UYU 5.400', tNormal: '10 días', tExpress: '3 días' },
};

/** Días mínimos que la vacuna de fiebre amarilla necesita para dar inmunidad válida. */
export const FIEBRE_AMARILLA_DIAS = 10;
