import type { HubData } from '../types';
import { URUGUAY_2026 } from '../../data/uruguay-2026';

/**
 * Hub de decisión UY — "Dejé de cobrar sueldo (o me falta plata): ¿qué me paga el BPS?"
 *
 * Reúne seguro de paro, subsidio por enfermedad, asignación familiar contributiva
 * y devolución FONASA.
 *
 * ⚠️ Constantes que NO están en src/lib/data/uruguay-2026.ts y viven sólo en las
 * fórmulas viejas: los porcentajes decrecientes del seguro de paro, sus topes en
 * BPC, el tope del subsidio por enfermedad y los montos/límites de la asignación
 * familiar. Se replican acá con su fuente declarada y quedan editables: hay que
 * contrastarlas contra la tabla vigente del BPS antes de cada año nuevo.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const BPC = URUGUAY_2026.bpc;
export const FONASA = URUGUAY_2026.bps.fonasa;
export const FONASA_DEVOLUCION = URUGUAY_2026.fonasa;

/** Seguro de paro, causal despido, trabajador mensual (Ley 15.180). Porcentaje por mes. */
export const PARO = {
  porcentajes: [0.66, 0.57, 0.5, 0.45, 0.42, 0.4],
  topeBpc: 8,
  minimoBpc: 0.5,
  complementoFamilia: 0.2,
  mesesMaximo: 6,
};

/** Subsidio por enfermedad (DISSE / BPS), Decreto-Ley 14.407 y modificativas. */
export const ENFERMEDAD = {
  porcentaje: 0.7,
  /** ⚠️ Tope mensual fijado por BPS — verificar contra la tabla del año en curso. */
  topeMensual: 67754,
  carenciaDias: 3,
};

/** Asignación familiar contributiva (Ley 15.084). ⚠️ Montos y límites BPS — verificar cada año. */
export const AFAM = {
  montoTramo1: 1347,
  montoTramo2: 674,
  limite1: 50502,
  limite2: 84688,
  extraPorHijoBpc: 1.2338,
};

const uyu = (n: number) => '$U ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'uy/trabajo/prestaciones-bps',
  title: 'Prestaciones del BPS: seguro de paro, enfermedad, asignación y devolución FONASA',
  description:
    'Cuánto cobrás del BPS cuando dejás de trabajar o te enfermás: seguro de paro mes a mes con sus topes en BPC, subsidio por enfermedad al 70%, asignación familiar por tramo de ingreso y devolución FONASA por exceso de aportes.',
  silo: 'Trabajo',
  siloHref: '/uy/trabajo',
  locale: 'uy',

  eyebrow: 'Uruguay · BPS · seguridad social',
  h1: 'Cuando se corta el sueldo, ¿cuánto te paga el BPS?',
  lede:
    'Las prestaciones del BPS no son un porcentaje único: el seguro de paro baja mes a mes y tiene tope en BPC, el subsidio por enfermedad paga el 70% pero recién desde el cuarto día, la asignación familiar depende del ingreso del hogar y la devolución FONASA sólo aparece si aportaste por encima del tope de salud. Acá se calculan las cuatro con la misma cuenta.',
  stamps: [
    `BPC vigente: ${uyu(BPC)}`,
    `Tope del seguro de paro: ${PARO.topeBpc} BPC (${uyu(PARO.topeBpc * BPC)})`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Lo que cobrás del BPS',

  cases: {
    title: '¿Qué prestación estás mirando?',
    intro:
      'Cada una tiene su propia base de cálculo y su propio tope. Elegí la tuya: el formulario es el mismo, cambia qué campos usa.',
    items: [
      {
        id: 'paro',
        label: 'Me despidieron: seguro de paro',
        hint: 'Porcentaje decreciente sobre el promedio de 6 meses',
        answer: 'Arranca en el 66% del promedio de tus últimos seis meses y baja hasta el 40% en el sexto mes.',
        yes: [
          'Base de cálculo: el promedio nominal de las remuneraciones de los últimos seis meses',
          `Escala decreciente por mes: ${PARO.porcentajes.map((p) => Math.round(p * 100) + '%').join(', ')}`,
          `Tope mensual de ${PARO.topeBpc} BPC (${uyu(PARO.topeBpc * BPC)}) y piso de ${PARO.minimoBpc} BPC (${uyu(PARO.minimoBpc * BPC)})`,
          `Complemento del ${Math.round(PARO.complementoFamilia * 100)}% si tenés cónyuge, hijos u otros familiares a cargo con ingresos bajos`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Es el régimen general de causal despido para trabajadores mensuales: el jornalero y la suspensión parcial tienen cómputos distintos',
          'Renunciar no da derecho al seguro de paro: hace falta una causal (despido, suspensión o reducción de trabajo)',
          'Cobrar seguro de paro no descuenta ni reemplaza la indemnización por despido: son cosas independientes',
        ],
        plazo: 'el trámite ante el BPS se inicia dentro de los 30 días del cese; después se pierde el derecho a los meses ya corridos.',
      },
      {
        id: 'enfermedad',
        label: 'Estoy con certificado médico: subsidio por enfermedad',
        hint: `${Math.round(ENFERMEDAD.porcentaje * 100)}% del promedio · desde el 4º día`,
        answer: `Cobrás el ${Math.round(ENFERMEDAD.porcentaje * 100)}% del promedio de los últimos 180 días, y los primeros ${ENFERMEDAD.carenciaDias} días no se pagan.`,
        yes: [
          `${Math.round(ENFERMEDAD.porcentaje * 100)}% del promedio de las remuneraciones nominales de los últimos 180 días`,
          `Tope mensual fijado por el BPS (${uyu(ENFERMEDAD.topeMensual)} según la última tabla publicada)`,
          'Genera cuota parte de aguinaldo, que el BPS paga por separado',
        ],
        warn: [
          DISCLAIMER_LABOR,
          `Carencia: los primeros ${ENFERMEDAD.carenciaDias} días de certificación no se cobran, salvo internación hospitalaria o domiciliaria, donde se paga desde el día 1`,
          'El certificado tiene que estar tramitado ante el prestador de salud y llegar al BPS en plazo',
          'El tope mensual lo actualiza el BPS: verificá el valor vigente antes de tomar decisiones con este número',
        ],
        plazo: 'la certificación se presenta dentro de las 72 horas de iniciada la licencia médica.',
      },
      {
        id: 'afam',
        label: 'Tengo hijos a cargo: asignación familiar',
        hint: 'Por hijo, según el ingreso del hogar',
        answer: 'Es un monto fijo por hijo que se reduce a la mitad —o se pierde— según el ingreso del hogar.',
        yes: [
          `Monto completo por hijo si el ingreso del hogar no supera el primer límite (${uyu(AFAM.limite1)} para hogares de hasta 2 hijos)`,
          `Medio monto si el ingreso queda entre el primer y el segundo límite (${uyu(AFAM.limite2)})`,
          `Cada hijo a partir del tercero sube ambos límites en ${AFAM.extraPorHijoBpc.toLocaleString('de-DE')} BPC`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Este es el régimen contributivo, para hijos de trabajadores en actividad. La AFAM del Plan de Equidad es otra prestación, no contributiva, con montos más altos y otros requisitos',
          'Los montos y los límites los actualiza el BPS: contrastá siempre con la tabla vigente',
          'Se exige acreditar asistencia a la enseñanza y controles de salud del menor',
        ],
        plazo: 'la prestación se solicita ante el BPS y se paga mensualmente junto con el sueldo o por separado.',
      },
      {
        id: 'fonasa',
        label: 'Aporté mucho a FONASA: devolución',
        hint: 'Excedente sobre el tope anual de salud',
        answer: 'Si tus aportes de salud del año superan el tope por beneficiario, el excedente se te devuelve.',
        yes: [
          `El tope anual se calcula como el Costo Promedio Equivalente mensual (${uyu(FONASA_DEVOLUCION.cpeMensual)}) × 12 × ${FONASA_DEVOLUCION.factorTope.toLocaleString('de-DE')}`,
          'Se suma un tope por cada beneficiario del hogar: titular, cónyuge o concubino a cargo e hijos menores',
          'La devolución es el excedente de tus aportes por encima de ese tope',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'No es un beneficio extra: es plata tuya que aportaste de más y se reintegra',
          'La devolución que se cobra en un año se calcula sobre los aportes del año anterior, con el Costo Promedio Equivalente de ese año, no con el actual',
          'Cuantos más beneficiarios tenés a cargo, más alto es el tope y menos probable la devolución',
        ],
        plazo: 'el BPS y la DGI publican el cronograma de cobro cada año; suele resolverse en el primer semestre.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'El primer campo cambia de significado según la prestación: es tu promedio nominal de los últimos seis meses para el paro y la enfermedad, el ingreso del hogar para la asignación familiar, y tu sueldo nominal para la devolución FONASA.',
  fields: [
    {
      id: 'base',
      label: 'Promedio nominal mensual o ingreso del hogar ($U)',
      prefix: '$U',
      value: '60.000',
      thousands: true,
      help: 'Paro y enfermedad: promedio de tus últimos 6 meses. Asignación familiar: ingreso total del hogar. Devolución FONASA: tu sueldo nominal.',
    },
    {
      id: 'hijos',
      label: 'Hijos menores a cargo',
      type: 'number',
      value: 1,
      min: 0,
      max: 10,
      step: 1,
      help: 'Definen el monto de la asignación familiar, la tasa FONASA y los topes de la devolución.',
    },
    {
      id: 'conyuge',
      label: '¿Cónyuge o concubino a cargo?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí, sin cobertura propia' },
      ],
      help: 'Activa el complemento del seguro de paro y suma un beneficiario al tope de la devolución FONASA.',
    },
    {
      id: 'dias',
      label: 'Días de certificado médico',
      type: 'number',
      value: 15,
      min: 0,
      max: 365,
      step: 1,
      help: `Sólo para el subsidio por enfermedad. Los primeros ${ENFERMEDAD.carenciaDias} días son de carencia.`,
    },
    {
      id: 'internacion',
      label: '¿Hubo internación?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí (hospitalaria o domiciliaria)' },
      ],
      help: 'Con internación se cobra desde el primer día, sin carencia.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'bars',
    title: 'Cómo se reparte la prestación',
    caption:
      'En el seguro de paro muestra cuánto cobrás cada uno de los seis meses y cómo cae la curva. En las demás prestaciones compara lo que cobrás contra lo que dejás de cobrar por el tope o la carencia.',
  },
  breakdownTitle: 'El cálculo, paso a paso',
  breakdownIntro:
    'Cada línea indica la base, el porcentaje o el tope que se aplicó, y qué norma lo fija.',

  faq: [
    {
      q: '¿Cuánto se cobra de seguro de paro en Uruguay?',
      a: `En el régimen general por causal despido, el subsidio se calcula sobre el promedio nominal de tus últimos seis meses y va bajando: ${PARO.porcentajes.map((p, i) => 'mes ' + (i + 1) + ' el ' + Math.round(p * 100) + '%').join(', ')}. Sobre ese resultado se aplica un tope de ${PARO.topeBpc} BPC (${uyu(PARO.topeBpc * BPC)}) y un piso de ${PARO.minimoBpc} BPC (${uyu(PARO.minimoBpc * BPC)}). Con familiares a cargo se suma un complemento del ${Math.round(PARO.complementoFamilia * 100)}%.`,
    },
    {
      q: '¿Cuánto dura el seguro de paro?',
      a: `El régimen general por despido cubre hasta ${PARO.mesesMaximo} meses. Hay situaciones especiales —trabajadores mayores, sectores en crisis, prórrogas dispuestas por el Poder Ejecutivo— que pueden extenderlo, y en la suspensión parcial el cómputo se hace por jornadas y no por meses corridos. El BPS resuelve caso por caso según la causal invocada.`,
    },
    {
      q: 'Si renuncio, ¿puedo cobrar seguro de paro?',
      a: 'No. El seguro de paro exige una causal ajena a la voluntad del trabajador: despido, suspensión total de actividades o reducción del trabajo. La renuncia deja afuera de la prestación. Es una de las razones económicas por las que conviene no renunciar cuando la relación ya está rota: entre la indemnización y el seguro, la diferencia con el despido es grande.',
    },
    {
      q: '¿El seguro de paro se descuenta de la indemnización por despido?',
      a: 'No, son prestaciones independientes y compatibles. La indemnización la paga el empleador como reparación por el cese; el seguro de paro lo paga el BPS como prestación de seguridad social mientras estás desocupado. Cobrar una no reduce la otra.',
    },
    {
      q: '¿Cuánto paga el BPS por enfermedad?',
      a: `El ${Math.round(ENFERMEDAD.porcentaje * 100)}% del promedio de las remuneraciones nominales de los últimos 180 días, con un tope mensual que fija el BPS. Además genera cuota parte de aguinaldo, que se paga por separado. Los primeros ${ENFERMEDAD.carenciaDias} días de certificación no se pagan, salvo que haya internación hospitalaria o domiciliaria, donde se cobra desde el primer día.`,
    },
    {
      q: '¿Por qué me pagan menos días de los que dice mi certificado?',
      a: `Por la carencia. El subsidio por enfermedad se paga a partir del cuarto día de certificación: los primeros ${ENFERMEDAD.carenciaDias} corren por cuenta tuya, salvo internación. Por eso una licencia de cinco días termina cobrándose como dos. En certificaciones largas la carencia pesa poco; en las cortas, muchísimo.`,
    },
    {
      q: '¿Quién cobra asignación familiar y cuánto?',
      a: `El régimen contributivo cubre a hijos menores a cargo de trabajadores en actividad y paga un monto fijo por hijo, que se reduce a la mitad si el ingreso del hogar pasa el primer límite y se pierde si pasa el segundo. Para hogares de hasta dos hijos, los límites son de ${uyu(AFAM.limite1)} y ${uyu(AFAM.limite2)}; cada hijo adicional los sube en ${AFAM.extraPorHijoBpc.toLocaleString('de-DE')} BPC. Los montos exactos los actualiza el BPS.`,
    },
    {
      q: '¿Qué diferencia hay entre la asignación familiar contributiva y la del Plan de Equidad?',
      a: 'La contributiva se apoya en el trabajo formal: la cobra quien tiene actividad registrada y depende del ingreso del hogar. La AFAM del Plan de Equidad es no contributiva, está pensada para hogares en situación de vulnerabilidad, tiene montos más altos y otros requisitos de acceso, incluida la evaluación socioeconómica. Son prestaciones distintas y no se cobran las dos a la vez por el mismo menor.',
    },
    {
      q: '¿Qué es la devolución FONASA y a quién le corresponde?',
      a: `El aporte FONASA financia tu cuota mutual, pero la ley pone un tope a cuánto puede costarte esa cobertura: el Costo Promedio Equivalente por 12 meses, incrementado un ${Math.round((FONASA_DEVOLUCION.factorTope - 1) * 100)}%, y multiplicado por la cantidad de beneficiarios de tu hogar. Todo lo que aportaste por encima de ese tope se devuelve. Le corresponde sobre todo a quien tiene sueldo alto y pocos beneficiarios a cargo, porque ahí el aporte porcentual se dispara mientras el tope se mantiene bajo.`,
    },
    {
      q: 'Tengo cónyuge e hijos: ¿me conviene para la devolución FONASA?',
      a: 'Tira para los dos lados. Por un lado, cada beneficiario a cargo suma un tope entero, así que el umbral a superar sube mucho y la devolución se vuelve menos probable. Por otro, tu tasa de aporte también sube, con lo cual aportás más. En la práctica, sumar beneficiarios casi siempre reduce o elimina la devolución, porque el tope crece más rápido que el aporte.',
    },
    {
      q: '¿Estas prestaciones pagan IRPF?',
      a: 'El seguro de paro y el subsidio por enfermedad son rentas del trabajo y están alcanzadas por el IRPF, con los mismos criterios de la escala. La asignación familiar, en cambio, es una prestación no gravada. La devolución FONASA no es renta: es la restitución de un aporte que hiciste de más.',
    },
  ],

  sources: [
    {
      name: 'BPS — Subsidio por desempleo (seguro de paro)',
      url: 'https://www.bps.gub.uy/',
      publisher: 'Banco de Previsión Social',
    },
    {
      name: 'Ley N° 15.180 — Régimen de prestaciones por desempleo',
      url: 'https://www.impo.com.uy/bases/leyes/15180-1981',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'Decreto-Ley N° 14.407 — Seguro de enfermedad (DISSE)',
      url: 'https://www.impo.com.uy/bases/decretos-ley/14407-1975',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'Ley N° 15.084 — Asignaciones familiares',
      url: 'https://www.impo.com.uy/bases/leyes/15084-1980',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'BPS — Devolución de aportes FONASA',
      url: 'https://www.bps.gub.uy/',
      publisher: 'Banco de Previsión Social',
    },
  ],

  replaces: [
    '/uy/calculadora-seguro-de-paro-uruguay',
    '/uy/calculadora-subsidio-enfermedad-uruguay',
    '/uy/calculadora-asignacion-familiar-bps-uruguay',
    '/uy/devolucion-fonasa-uruguay',
  ],

  lastReviewed: '2026-07-28',
};
