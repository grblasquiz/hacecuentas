import type { HubData } from '../types';
import { URUGUAY_2026, JUBILACION_UY } from '../../data/uruguay-2026';

/**
 * Hub de decisión UY — "¿Cuándo me puedo jubilar y con cuánto me quedo?"
 *
 * Reúne edad jubilatoria (transición de la Ley 20.130), monto del tramo BPS por
 * tasa de reemplazo, el aporte jubilatorio personal (montepío) y el IASS que se
 * descuenta de la pasividad.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const BPC = URUGUAY_2026.bpc;
export const JUB = JUBILACION_UY;
export const MONTEPIO = URUGUAY_2026.bps.montepio;
export const IASS_FRANJAS = URUGUAY_2026.iass.franjas.map((f) => ({
  hastaBpc: Number.isFinite(f.hastaBpc) ? f.hastaBpc : null,
  tasa: f.tasa,
}));
export const IASS_MNI_BPC = URUGUAY_2026.iass.minimoNoImponibleBpc;
/** Serializable: edadMinimaPorNacimiento trae Infinity en el último tramo. */
export const EDAD_MINIMA = JUBILACION_UY.edadMinimaPorNacimiento.map((t) => ({
  nacidoHasta: Number.isFinite(t.nacidoHasta) ? t.nacidoHasta : null,
  edad: t.edad,
}));
export const EDAD_AVANZADA = JUBILACION_UY.edadAvanzada.map((t) => ({ edad: t.edad, aniosServicio: t.aniosServicio }));
export const TASA_REEMPLAZO = JUBILACION_UY.tasaReemplazo;

const uyu = (n: number) => '$U ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'uy/finanzas/jubilacion',
  title: 'Jubilación en Uruguay: a qué edad podés jubilarte y con cuánto',
  description:
    'Calculá tu edad jubilatoria según la transición de la Ley 20.130, la tasa de reemplazo que te corresponde por años de servicio y edad, el monto estimado del tramo BPS y el IASS que se descuenta de la pasividad.',
  silo: 'Finanzas',
  siloHref: '/uy/finanzas',
  locale: 'uy',

  eyebrow: 'Uruguay · BPS · Ley 20.130',
  h1: '¿A qué edad te podés jubilar en Uruguay y con cuánto te quedás?',
  lede:
    'La reforma cambió el tablero: la edad mínima ya no es 60 para todos, sino que sube de a un año según tu año de nacimiento hasta llegar a 65. Y el monto no depende sólo del sueldo: la tasa de reemplazo premia los años de servicio y los años trabajados después de los 60. Acá se ven las dos cosas juntas, y lo que el IASS se lleva después.',
  stamps: [
    `Causal común: ${JUB.aniosServicioComun} años de servicio`,
    `Tope de la tasa de reemplazo: ${(TASA_REEMPLAZO.maxTasa * 100).toLocaleString('de-DE')}%`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Jubilación líquida estimada',

  cases: {
    title: '¿En qué momento estás?',
    intro:
      'La cuenta es la misma, pero lo que te importa cambia según si estás proyectando, si ya tenés la causal configurada o si ya cobrás pasividad.',
    items: [
      {
        id: 'comun',
        label: 'Quiero jubilarme por causal común',
        hint: `${JUB.aniosServicioComun} años de servicio · edad según año de nacimiento`,
        answer: `Con ${JUB.aniosServicioComun} años de servicio te jubilás a la edad mínima que te toca por tu año de nacimiento.`,
        yes: [
          `${JUB.aniosServicioComun} años de servicios reconocidos, siempre`,
          'Edad mínima según año de nacimiento: 60 para los nacidos hasta 1972, y sube un año por cada año de nacimiento hasta 65 para los nacidos desde 1977',
          `Tasa de reemplazo base del ${(TASA_REEMPLAZO.base * 100).toLocaleString('de-DE')}% del Sueldo Básico Jubilatorio`,
          `Adicionales: +${(TASA_REEMPLAZO.adicServicio30a35 * 100).toLocaleString('de-DE')}% por año de servicio entre 30 y 35, +${(TASA_REEMPLAZO.adicServicio35a40 * 100).toLocaleString('de-DE')}% entre 35 y 40, y +${(TASA_REEMPLAZO.adicEdadPorAnio * 100).toLocaleString('de-DE')}% por cada año trabajado después de los 60`,
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La cuenta estima sólo el tramo BPS. En el sistema mixto, quien supera el tope de aportación divide aportes con una AFAP y suma un tramo de ahorro individual que no se calcula acá',
          'El Sueldo Básico Jubilatorio real lo determina el BPS con el promedio de tus mejores años: no es tu último sueldo',
          'La tasa de reemplazo aplicada es la del régimen anterior y de transición; la causal común del nuevo sistema recién empieza a otorgarse en 2033',
        ],
        plazo: 'conviene pedir el cómputo de servicios al BPS con varios años de anticipación: recuperar aportes viejos lleva tiempo.',
      },
      {
        id: 'avanzada',
        label: 'No llego a los 30 años de servicio',
        hint: 'Causal de edad avanzada: 65/25 hasta 70/15',
        answer: `Con menos de ${JUB.aniosServicioComun} años podés jubilarte por edad avanzada, pero más tarde y con menos plata.`,
        yes: [
          'Combinaciones de edad y años de servicio: 65 años con 25, 66 con 23, 67 con 21, 68 con 19, 69 con 17 y 70 con 15',
          `Piso absoluto: con menos de ${JUB.minAniosContributivo} años de servicio no se configura causal contributiva`,
          'Cada año de servicio que sumes puede adelantarte años enteros de jubilación',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La causal de edad avanzada no accede a la tasa de reemplazo base de la causal común: el monto se determina con reglas propias y suele ser bastante menor',
          'Existen prestaciones asistenciales no contributivas para quien no configura ninguna causal, con requisitos de edad e ingresos',
          'Revisá si tenés períodos de trabajo no registrados: reconocerlos puede acercarte a los 30 años',
        ],
        plazo: 'el reconocimiento de servicios anteriores exige prueba documental o testimonial: empezá el trámite temprano.',
      },
      {
        id: 'proyecto',
        label: 'Quiero ver cuánto gano si trabajo más años',
        hint: 'Cada año extra suma tasa de reemplazo',
        answer: 'Trabajar después de los 60 suma tasa de reemplazo hasta un tope: postergar puede valer mucho.',
        yes: [
          `+${(TASA_REEMPLAZO.adicEdadPorAnio * 100).toLocaleString('de-DE')}% de tasa por cada año trabajado después de los 60, con tope combinado del ${(TASA_REEMPLAZO.topeAdicEdad * 100).toLocaleString('de-DE')}%`,
          `+${(TASA_REEMPLAZO.adicServicio30a35 * 100).toLocaleString('de-DE')}% por año de servicio entre 30 y 35 y +${(TASA_REEMPLAZO.adicServicio35a40 * 100).toLocaleString('de-DE')}% entre 35 y 40`,
          `Tope global de la tasa: ${(TASA_REEMPLAZO.maxTasa * 100).toLocaleString('de-DE')}% del Sueldo Básico Jubilatorio`,
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Una vez que llegás al tope global, seguir trabajando ya no sube la tasa: sólo puede mejorar el Sueldo Básico Jubilatorio',
          'La proyección no ajusta por inflación ni por la evolución de tu salario: son pesos de hoy',
          'Postergar la jubilación también posterga el cobro: la conveniencia depende de tu expectativa y tu situación personal',
        ],
        plazo: 'antes de decidir, pedí al BPS la simulación oficial con tu historia laboral real.',
      },
      {
        id: 'iass',
        label: 'Ya estoy jubilado: cuánto me descuentan',
        hint: `IASS · mínimo no imponible ${IASS_MNI_BPC} BPC`,
        answer: `Las pasividades por encima de ${IASS_MNI_BPC} BPC (${uyu(IASS_MNI_BPC * BPC)}) pagan IASS por franjas.`,
        yes: [
          `Mínimo no imponible de ${IASS_MNI_BPC} BPC mensuales (${uyu(IASS_MNI_BPC * BPC)}): debajo de eso no se paga nada`,
          'Escala progresiva en BPC: 6% de 9 a 15 BPC, 24% de 15 a 50 y 30% de ahí en adelante',
          'Lo retiene directamente el BPS o la caja que te paga la pasividad',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El IASS no admite el crédito por deducciones del IRPF: la escala se aplica directa sobre la pasividad',
          'Si cobrás más de una pasividad, se suman todas para determinar la franja',
          'IASS e IRPF no se pagan los dos sobre la misma renta: la pasividad tributa IASS, el trabajo tributa IRPF',
        ],
        plazo: 'el ajuste se hace en la liquidación anual; si cobrás de varios organismos, conviene revisarla.',
      },
    ],
  },

  inputsTitle: 'Tus datos previsionales',
  inputsIntro:
    'En pesos uruguayos. Si ya estás jubilado, en el último campo poné tu pasividad nominal mensual.',
  fields: [
    {
      id: 'anioNacimiento',
      label: 'Año de nacimiento',
      type: 'number',
      value: 1975,
      min: 1930,
      max: 2010,
      step: 1,
      help: 'Define tu edad mínima de causal común dentro de la transición de la reforma.',
    },
    {
      id: 'aniosServicio',
      label: 'Años de servicio reconocidos',
      type: 'number',
      value: 32,
      min: 0,
      max: 55,
      step: 1,
      help: `La causal común exige ${JUB.aniosServicioComun}. Pedí el cómputo oficial al BPS: suele haber períodos olvidados.`,
    },
    {
      id: 'edadRetiro',
      label: 'Edad a la que pensás retirarte',
      type: 'number',
      value: 65,
      min: 55,
      max: 80,
      step: 1,
      help: 'Cada año trabajado después de los 60 suma tasa de reemplazo, hasta el tope.',
    },
    {
      id: 'sueldo',
      label: 'Sueldo Básico Jubilatorio o pasividad ($U)',
      prefix: '$U',
      value: '80.000',
      thousands: true,
      help: 'El promedio de tus mejores años según el BPS. Si ya cobrás jubilación, poné el nominal de la pasividad.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu jubilación',
    caption:
      'Muestra qué parte del Sueldo Básico Jubilatorio recuperás con la tasa de reemplazo, qué parte se pierde en la brecha y cuánto se lleva el IASS de lo que efectivamente cobrás.',
  },
  breakdownTitle: 'La cuenta previsional, paso a paso',
  breakdownIntro:
    'Edad mínima de tu cohorte, causal que configurás, tasa de reemplazo desagregada, monto estimado e IASS.',

  faq: [
    {
      q: '¿A qué edad me puedo jubilar en Uruguay?',
      a: 'Depende de tu año de nacimiento, porque la reforma aplicó una transición gradual. Los nacidos hasta 1972 mantienen los 60 años; los de 1973 se jubilan a los 61, los de 1974 a los 62, los de 1975 a los 63, los de 1976 a los 64 y los nacidos desde 1977 a los 65. En todos los casos, la causal común exige además 30 años de servicios reconocidos.',
    },
    {
      q: '¿Qué pasa si no llego a los 30 años de servicio?',
      a: `Podés acceder por la causal de edad avanzada, que combina más edad con menos años: 65 años con 25 de servicio, 66 con 23, 67 con 21, 68 con 19, 69 con 17 y 70 con 15. Por debajo de ${JUB.minAniosContributivo} años de servicio no se configura ninguna causal contributiva, y hay que mirar las prestaciones asistenciales no contributivas.`,
    },
    {
      q: '¿Qué es la tasa de reemplazo?',
      a: `Es el porcentaje de tu Sueldo Básico Jubilatorio que vas a cobrar como jubilación. Arranca en ${(TASA_REEMPLAZO.base * 100).toLocaleString('de-DE')}% con 30 años de servicio y sube por dos caminos: los años de servicio adicionales, que suman ${(TASA_REEMPLAZO.adicServicio30a35 * 100).toLocaleString('de-DE')}% por año entre 30 y 35 y ${(TASA_REEMPLAZO.adicServicio35a40 * 100).toLocaleString('de-DE')}% entre 35 y 40, y los años trabajados después de los 60, que suman ${(TASA_REEMPLAZO.adicEdadPorAnio * 100).toLocaleString('de-DE')}% cada uno con un tope combinado del ${(TASA_REEMPLAZO.topeAdicEdad * 100).toLocaleString('de-DE')}%. El techo global es ${(TASA_REEMPLAZO.maxTasa * 100).toLocaleString('de-DE')}%.`,
    },
    {
      q: '¿Qué es el Sueldo Básico Jubilatorio y cómo se calcula?',
      a: 'Es la base sobre la que se aplica la tasa de reemplazo. No es tu último sueldo ni el promedio de toda tu vida laboral: el BPS lo determina tomando el promedio de tus mejores años de aportación, actualizado. Por eso alguien que ganó bien durante mucho tiempo y terminó su carrera con sueldos más bajos puede jubilarse con más de lo que cobraba al final.',
    },
    {
      q: '¿Cuánto se aporta para la jubilación en Uruguay?',
      a: `El montepío jubilatorio personal es el ${(MONTEPIO * 100).toLocaleString('de-DE')}% del sueldo nominal, sin excepciones ni tramos. Lo que sí cambia según el nivel salarial y la opción que hayas hecho es a dónde va: una parte al régimen de solidaridad intergeneracional que administra el BPS, y otra al ahorro individual en una AFAP. Ese reparto lo determina el BPS según tu historia laboral. Además, el empleador aporta su parte jubilatoria por separado.`,
    },
    {
      q: '¿Qué es el sistema mixto y por qué esta cuenta no lo calcula entero?',
      a: 'Porque son dos tramos con lógicas distintas. El tramo BPS es de reparto y se calcula con la tasa de reemplazo sobre el Sueldo Básico Jubilatorio, que es lo que estimamos acá. El tramo AFAP es de ahorro individual: depende de cuánto acumulaste, de la rentabilidad del fondo y de la renta vitalicia que contrates al retirarte. Ese segundo tramo sólo lo puede proyectar tu AFAP con tu saldo real.',
    },
    {
      q: '¿Qué es el IASS y a partir de qué monto se paga?',
      a: `Es el Impuesto de Asistencia a la Seguridad Social, que grava jubilaciones y pensiones. El mínimo no imponible es de ${IASS_MNI_BPC} BPC mensuales, o sea ${uyu(IASS_MNI_BPC * BPC)}: debajo de ese monto no se paga nada. Por encima corre una escala progresiva del 6% entre 9 y 15 BPC, 24% entre 15 y 50, y 30% de ahí en adelante, aplicada por tramos.`,
    },
    {
      q: '¿Un jubilado paga IRPF además de IASS?',
      a: 'Sobre la pasividad, no: la jubilación tributa IASS y no IRPF. Pero si un jubilado sigue trabajando o tiene otras rentas —alquileres, honorarios—, esas rentas sí tributan IRPF por su categoría correspondiente. Son dos impuestos que conviven sin superponerse sobre la misma renta.',
    },
    {
      q: '¿Me conviene trabajar unos años más antes de jubilarme?',
      a: `En términos de tasa de reemplazo, sí, hasta cierto punto: cada año trabajado después de los 60 suma ${(TASA_REEMPLAZO.adicEdadPorAnio * 100).toLocaleString('de-DE')}% y cada año de servicio entre 30 y 35 suma otro tanto. Pero los adicionales por edad tienen tope combinado y la tasa global no puede pasar del ${(TASA_REEMPLAZO.maxTasa * 100).toLocaleString('de-DE')}%. Una vez ahí, seguir sólo mejora el Sueldo Básico Jubilatorio si tus últimos años son de los mejores. Y hay que contar los años de jubilación que resignás.`,
    },
    {
      q: '¿La jubilación se ajusta por inflación?',
      a: 'Las pasividades se ajustan por el Índice Medio de Salarios, no por el índice de precios. Es decir, siguen la evolución de los salarios de la economía, no la de la inflación. En períodos de salario real creciente eso favorece al jubilado; en períodos de caída del salario real, lo perjudica frente a un ajuste por precios.',
    },
    {
      q: '¿Cómo pido el cómputo de mis años de servicio?',
      a: 'Se solicita al BPS la historia laboral y el cómputo de servicios. Ahí aparecen los períodos registrados con aportes. Si detectás huecos —trabajos no declarados, empleos en otras cajas, servicios en el exterior con convenio— hay que iniciar el reconocimiento, que exige prueba documental o testimonial y puede llevar meses. Conviene hacerlo bastante antes de la fecha en que pensás jubilarte.',
    },
  ],

  sources: [
    {
      name: 'Ley N° 20.130 — Sistema Previsional Común',
      url: 'https://www.impo.com.uy/bases/leyes/20130-2023',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'BPS — Jubilación común y causales jubilatorias',
      url: 'https://www.bps.gub.uy/',
      publisher: 'Banco de Previsión Social',
    },
    {
      name: 'DGI — IASS: escala y mínimo no imponible',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
    {
      name: 'Ley N° 16.713 — Sistema previsional y AFAP',
      url: 'https://www.impo.com.uy/bases/leyes/16713-1995',
      publisher: 'IMPO — Centro de Información Oficial',
    },
  ],

  replaces: [
    '/uy/calculadora-edad-jubilacion-uruguay',
    '/uy/calculadora-monto-jubilacion-bps-uruguay',
    '/uy/calculadora-iass-uruguay',
    '/uy/aporte-jubilatorio-uruguay',
  ],

  lastReviewed: '2026-07-28',
};
