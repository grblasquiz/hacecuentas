import type { HubData } from '../types';
import { PERU_2026 } from '../../data/peru-2026';

/**
 * Hub de decisión PE — "¿AFP u ONP, y cuánto voy a cobrar cuando me jubile?"
 *
 * Absorbe: comparador AFP vs ONP, comparador de comisiones entre las cuatro AFP,
 * proyección del fondo y del retiro del 95,5% al jubilarse, y elegibilidad de Pensión 65.
 *
 * Constantes: src/lib/data/peru-2026.ts (fondo 10%, prima de seguro, comisión por flujo
 * por administradora, ONP 13%). La subvención de Pensión 65 y la expectativa de vida
 * salen de las fórmulas vivas pension-65-peru.ts y retiro-afp-jubilacion-peru.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa basada en los parámetros indicados. No constituye asesoramiento financiero ni de inversión; verificá las condiciones vigentes con tu entidad antes de decidir.';

export const RMV = PERU_2026.rmv;
export const ONP = PERU_2026.onp;
export const AFP = {
  fondo: PERU_2026.afp.fondo,
  primaSeguro: PERU_2026.afp.primaSeguro,
  comisionFlujo: PERU_2026.afp.comisionFlujo as unknown as Record<string, number>,
};

/** Años de aportes que exige el Sistema Nacional de Pensiones para tener derecho a pensión. */
export const ONP_ANIOS_MINIMOS = 20;

/** Edad de jubilación ordinaria en ambos sistemas. */
export const EDAD_JUBILACION = 65;

/** Entrega de hasta el 95,5% del fondo al jubilarse; el 4,5% restante va a EsSalud. */
export const RETIRO_PCT = 0.955;
export const ESSALUD_PCT = 0.045;

/** Expectativa de vida a los 65 años, tablas de mortalidad de la SBS. */
export const EXPECTATIVA = { hombre: 22, mujer: 26 };

/** Pensión 65 (MIDIS): subvención bimestral y número de transferencias al año. */
export const PENSION_65 = { bimestral: 350, pagosAnio: 6, edadMinima: 65 };

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/finanzas-personales/afp-onp-y-jubilacion',
  title: 'AFP u ONP en Perú: cuál te descuenta menos y cuánto vas a cobrar al jubilarte',
  description:
    'Compara el descuento de la ONP contra el de cada AFP, proyecta el fondo que tendrías a los 65 años, mira cuánto sería el retiro del 95,5% frente a una pensión mensual, y revisa si calificas a Pensión 65.',
  silo: 'Finanzas personales',
  siloHref: '/pe/finanzas-personales',
  locale: 'pe',

  eyebrow: 'Perú · sistema previsional · SBS y ONP',
  h1: '¿AFP u ONP, y cuánto voy a cobrar cuando me jubile?',
  lede:
    'La diferencia entre los dos sistemas no está en el descuento mensual, que es casi el mismo, sino en qué pasa después. La ONP paga una pensión solo si llegas a veinte años de aportes; si te quedas en diecinueve, no cobras nada. La AFP te devuelve lo acumulado siempre, pero el resultado depende de la rentabilidad y de la comisión que te cobren durante toda la vida laboral.',
  stamps: [
    `ONP ${(ONP * 100).toFixed(0)}% · AFP fondo ${(AFP.fondo * 100).toFixed(0)}% + prima + comisión`,
    `ONP: ${ONP_ANIOS_MINIMOS} años de aportes para tener pensión`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Descuento previsional mensual',

  cases: {
    title: '¿Dónde estás parado hoy?',
    intro:
      'El mismo sueldo se descuenta parecido en los dos sistemas, pero la decisión no se toma mirando el mes: se toma mirando los años que vas a aportar.',
    items: [
      {
        id: 'afp',
        label: 'Estoy en una AFP',
        hint: 'Fondo 10% + prima + comisión por flujo',
        answer: 'Tu descuento tiene tres partes y solo una se acumula en tu cuenta: el 10% del fondo.',
        yes: [
          `Aporte obligatorio del ${(AFP.fondo * 100).toFixed(0)}% que va a tu Cuenta Individual de Capitalización`,
          'Prima del seguro de invalidez, sobrevivencia y gastos de sepelio',
          'Comisión de la administradora, distinta en cada AFP',
          'Proyección de tu fondo a los 65 años y de la pensión mensual que compraría',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La rentabilidad pasada no garantiza la futura: la proyección usa la rentabilidad anual que tú indiques, no una promesa',
          'La prima del seguro se cobra sobre la remuneración asegurable máxima que publica la SBS, así que en sueldos altos el porcentaje efectivo baja',
          'El retiro de hasta el 95,5% del fondo al jubilarte no está disponible para todos los afiliados: depende de la edad que tenías cuando se dictó la reforma previsional',
        ],
        plazo: 'puedes cambiar de AFP cuando quieras; la comisión de la nueva se aplica desde el mes siguiente al traslado.',
      },
      {
        id: 'onp',
        label: 'Estoy en la ONP',
        hint: `13% fijo · ${ONP_ANIOS_MINIMOS} años mínimos`,
        answer: `En la ONP el descuento es del ${(ONP * 100).toFixed(0)}% fijo, pero la pensión recién existe con ${ONP_ANIOS_MINIMOS} años de aportes.`,
        yes: [
          `Descuento único del ${(ONP * 100).toFixed(0)}% de la remuneración asegurable`,
          'Sin comisión de administradora ni prima de seguro por separado',
          'Pensión de por vida, con monto mínimo y monto máximo fijados por norma',
          'Cobertura de pensión de invalidez y de sobrevivencia para tus derechohabientes',
        ],
        warn: [
          DISCLAIMER_FIN,
          `Con menos de ${ONP_ANIOS_MINIMOS} años de aportes no hay pensión de jubilación: es el riesgo más grande del sistema para carreras laborales interrumpidas o informales`,
          'La pensión de la ONP tiene tope máximo: un sueldo alto no se traduce en una pensión proporcionalmente alta',
          'El fondo de la ONP es solidario y no es heredable: lo aportado no vuelve a tus herederos como sí ocurre con el saldo de una AFP',
        ],
        plazo: 'el traslado de ONP a AFP se gestiona en la administradora; el camino inverso solo procede en los supuestos que fija la ley.',
      },
      {
        id: 'elegir',
        label: 'Voy a elegir sistema y quiero compararlos',
        hint: 'Las dos cuentas, lado a lado',
        answer: 'En el bolsillo del mes la diferencia es de décimas; en la jubilación, la diferencia es entre cobrar y no cobrar.',
        yes: [
          'Descuento y sueldo neto con ONP frente a cada AFP',
          'Cuál de las cuatro administradoras te cobra la comisión por flujo más baja',
          'Cuánto pesa esa diferencia de comisión a lo largo de la vida laboral',
          'Proyección del fondo acumulado si te quedas en el sistema privado',
        ],
        warn: [
          DISCLAIMER_FIN,
          'A igualdad de rentabilidad conviene la comisión más baja, pero la rentabilidad histórica de cada AFP y el tipo de fondo elegido también pesan y no están en esta cuenta',
          'Existen dos modalidades de comisión en la AFP: por flujo (sobre tu sueldo, todos los meses) y mixta (una parte sobre el saldo acumulado). Esta comparación usa la comisión por flujo',
        ],
        plazo: 'un trabajador que ingresa por primera vez a planilla tiene un plazo para elegir sistema; si no elige, queda afiliado a una AFP por asignación.',
      },
      {
        id: 'pension65',
        label: 'No aporté nunca y ya soy adulto mayor',
        hint: 'Pensión 65 · MIDIS',
        answer: `Pensión 65 es una subvención bimestral de ${sol(PENSION_65.bimestral)} para adultos mayores en pobreza extrema, no una pensión contributiva.`,
        yes: [
          `Tener ${PENSION_65.edadMinima} años cumplidos o más`,
          'Estar clasificado en situación de pobreza extrema en el padrón del SISFOH',
          'No recibir pensión pública ni privada ni prestación económica de EsSalud',
          'Contar con DNI vigente',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los cuatro requisitos son acumulativos: basta que falte uno para quedar fuera del programa',
          'Estar afiliado al Seguro Integral de Salud no te excluye del programa; recibir cualquier pensión sí',
          'La clasificación socioeconómica la determina el SISFOH: si no la tienes, hay que pedir la evaluación en la municipalidad antes de poder postular',
        ],
        plazo: 'la postulación se hace en la municipalidad del distrito o en la sede del programa; el cobro empieza cuando el MIDIS te incorpora al padrón.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'El sueldo define el descuento del mes; la edad, el saldo y la rentabilidad definen lo que vas a tener a los 65. Si no sabes tu saldo, déjalo en cero y mira solo el descuento.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo bruto mensual (S/)',
      type: 'number',
      prefix: 'S/',
      value: 3500,
      min: 0,
      step: 50,
      help: 'La remuneración asegurable pactada, antes de cualquier descuento.',
    },
    {
      id: 'afp',
      label: '¿En qué AFP estás (o estarías)?',
      type: 'select',
      value: 'Integra',
      options: [
        { value: 'Habitat', label: 'Hábitat' },
        { value: 'Integra', label: 'Integra' },
        { value: 'Prima', label: 'Prima' },
        { value: 'Profuturo', label: 'Profuturo' },
      ],
      help: 'Define la comisión por flujo que se te descuenta cada mes. Las cuatro cobran el mismo 10% de fondo y la misma prima.',
    },
    {
      id: 'edad',
      label: 'Tu edad hoy',
      type: 'number',
      value: 35,
      min: 1,
      max: 100,
      step: 1,
      help: 'Se usa para proyectar cuántos años te faltan para los 65, y en la rama de Pensión 65 para verificar la edad mínima.',
    },
    {
      id: 'saldo',
      label: 'Saldo actual de tu fondo AFP (S/)',
      type: 'number',
      prefix: 'S/',
      value: 30000,
      min: 0,
      step: 500,
      help: 'Lo que figura hoy en tu Cuenta Individual de Capitalización. Está en tu estado de cuenta o en la app de tu AFP. Si estás en la ONP, déjalo en cero.',
    },
    {
      id: 'rentabilidad',
      label: 'Rentabilidad anual esperada del fondo (%)',
      type: 'number',
      value: 6,
      min: 0,
      max: 20,
      step: 0.5,
      suffix: '%',
      help: 'Rentabilidad nominal anual. Un 6% es un supuesto conservador para un fondo mixto: la rentabilidad real depende del tipo de fondo y del mercado.',
    },
    {
      id: 'sexo',
      label: 'Para la expectativa de vida a los 65',
      type: 'select',
      value: 'hombre',
      options: [
        { value: 'hombre', label: 'Hombre' },
        { value: 'mujer', label: 'Mujer' },
      ],
      help: 'Las tablas de mortalidad de la SBS dan una expectativa mayor para las mujeres, así que el mismo fondo se reparte en más meses y la pensión mensual sale menor.',
    },
    {
      id: 'aniosAportados',
      label: 'Años de aportes que llevas',
      type: 'number',
      value: 10,
      min: 0,
      max: 55,
      step: 1,
      help: `Clave en la ONP: por debajo de ${ONP_ANIOS_MINIMOS} años no hay derecho a pensión de jubilación. En la AFP no hay mínimo.`,
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'Qué pasa con tu sueldo cada mes',
    caption:
      'Del descuento previsional, solo el aporte al fondo se acumula a tu nombre. La prima del seguro y la comisión de la administradora son costo, no ahorro. En la ONP todo el descuento va a un fondo común solidario.',
  },
  breakdownTitle: 'Tu jubilación, línea por línea',
  breakdownIntro:
    'Primero el descuento del mes; después la proyección del fondo a los 65 y las dos formas de cobrarlo.',

  faq: [
    {
      q: '¿Cuánto me descuentan en la AFP y cuánto en la ONP?',
      a: `En la ONP es un ${(ONP * 100).toFixed(0)}% fijo de la remuneración asegurable, sin nada más. En la AFP el descuento se arma con tres piezas: el ${(AFP.fondo * 100).toFixed(0)}% que va a tu cuenta individual, la prima del seguro de invalidez y sobrevivencia, y la comisión de la administradora, que es lo único que cambia entre las cuatro AFP. El total ronda el 12,5%, así que en el mes la ONP descuenta algo más.`,
    },
    {
      q: '¿Es verdad que si no llego a 20 años de aportes en la ONP no cobro nada?',
      a: `Sí, y es la diferencia más importante entre los dos sistemas. El Sistema Nacional de Pensiones exige ${ONP_ANIOS_MINIMOS} años de aportes acreditados para tener derecho a pensión de jubilación. Con diecinueve años y once meses no hay pensión de jubilación: existen prestaciones alternativas de menor cuantía, pero no la pensión. En la AFP, en cambio, el saldo acumulado es tuyo sin exigencia de años mínimos, y es heredable.`,
    },
    {
      q: '¿Cuál AFP me descuenta menos?',
      a: 'Las cuatro cobran exactamente el mismo aporte al fondo y la misma prima de seguro, que fija la SBS. Lo único que las diferencia en el descuento mensual es la comisión por flujo, y la diferencia entre la más barata y la más cara es de unas décimas de punto porcentual del sueldo. Parece poco, pero sostenido durante treinta o cuarenta años de aportes se vuelve una cifra grande. A igualdad de rentabilidad y servicio, conviene la comisión más baja.',
    },
    {
      q: '¿Qué diferencia hay entre comisión por flujo y comisión mixta?',
      a: 'La comisión por flujo se cobra todos los meses sobre tu sueldo: si dejas de aportar, dejas de pagarla, pero tampoco crece tu fondo. La comisión mixta cobra una parte menor sobre el sueldo y otra parte sobre el saldo acumulado, es decir, sobre el fondo que ya tienes. Para alguien que recién empieza y va a aportar muchos años, la mixta suele salir más cara al final; para alguien cerca de jubilarse con un fondo grande, también. Este hub compara por comisión por flujo, que es la modalidad estándar.',
    },
    {
      q: '¿Puedo retirar el 95,5% de mi fondo al jubilarme?',
      a: `La entrega de hasta el ${(RETIRO_PCT * 100).toFixed(1).replace('.', ',')}% del fondo al momento de jubilarse existe en el sistema privado, y el ${(ESSALUD_PCT * 100).toFixed(1).replace('.', ',')}% restante se transfiere a EsSalud para financiar tu atención de salud como pensionista. No es para todos los afiliados: la reforma previsional restringió el acceso según la edad que tenías al momento de su entrada en vigencia. Antes de contar con esa plata, confirma tu situación con tu AFP.`,
    },
    {
      q: '¿Me conviene retirar todo o cobrar pensión?',
      a: 'Depende de si tienes un uso productivo para ese dinero y de tu tolerancia al riesgo de quedarte sin nada. La pensión mensual reparte el fondo a lo largo de tu expectativa de vida y lo que queda sigue rentando, así que dura más; el retiro en una sola entrega te da control total pero también todo el riesgo. La comparación de este hub muestra cuántos años te alcanzaría el retiro si lo gastaras al mismo ritmo que la pensión: ese número suele ser el que hace pensar.',
    },
    {
      q: '¿Cómo se calcula la pensión que voy a cobrar de la AFP?',
      a: 'Con el saldo acumulado a los 65 años repartido a lo largo de tu expectativa de vida, y con el saldo remanente rentando durante ese período. Por eso la pensión depende de tres cosas: cuánto aportaste, cuánto rindió tu fondo y cuántos años se espera que vivas después de jubilarte. Las tablas de mortalidad de la SBS dan una expectativa mayor para las mujeres, así que con el mismo fondo la pensión mensual de una mujer sale menor y dura más años.',
    },
    {
      q: '¿Qué es Pensión 65 y cuánto paga?',
      a: `Es un programa de asistencia solidaria del MIDIS, no una pensión contributiva: no depende de haber aportado. Paga una subvención de ${sol(PENSION_65.bimestral)} cada dos meses, en ${PENSION_65.pagosAnio} transferencias al año, lo que suma ${sol(PENSION_65.bimestral * PENSION_65.pagosAnio)} anuales, equivalentes a unos ${sol((PENSION_65.bimestral * PENSION_65.pagosAnio) / 12)} mensuales. Está dirigido a adultos mayores de ${PENSION_65.edadMinima} años en situación de pobreza extrema que no reciben ninguna otra pensión.`,
    },
    {
      q: '¿Puedo cobrar Pensión 65 si tengo una pensión chica de la ONP?',
      a: 'No. Uno de los cuatro requisitos es no percibir pensión alguna, pública ni privada, ni prestación económica de EsSalud. Una pensión pequeña de la ONP te deja fuera del programa. Estar afiliado al Seguro Integral de Salud, en cambio, no es motivo de exclusión: el SIS es cobertura de salud, no una pensión.',
    },
    {
      q: '¿El aporte a la AFP se descuenta de las gratificaciones?',
      a: 'No. Las gratificaciones de julio y diciembre están inafectas a los aportes previsionales y a EsSalud, y en lugar del aporte de salud el trabajador recibe una bonificación extraordinaria. Eso significa que el fondo de tu AFP crece con doce aportes al año, no con catorce, aunque el año en planilla sean catorce remuneraciones.',
    },
    {
      q: '¿Qué pasa con mi fondo AFP si fallezco antes de jubilarme?',
      a: 'El saldo de la Cuenta Individual de Capitalización forma parte de la herencia si no hay beneficiarios de pensión de sobrevivencia, y si los hay, financia esa pensión. Es una diferencia estructural con la ONP, donde el aporte va a un fondo común solidario y no se hereda: los derechohabientes acceden a pensión de sobrevivencia según las reglas del sistema, pero no a lo aportado.',
    },
    {
      q: '¿Cambiar de AFP me cuesta algo?',
      a: 'El traslado entre administradoras es gratuito y se puede pedir cuando quieras cumpliendo los requisitos que fija la SBS. La comisión de la nueva AFP empieza a aplicarse desde el mes siguiente al traslado, y el fondo acumulado se transfiere completo. Lo que no se puede hacer libremente es pasar de la AFP a la ONP: ese camino solo procede en los supuestos que la ley contempla.',
    },
  ],

  sources: [
    { name: 'SBS — Tasas de aportes del Sistema Privado de Pensiones', url: 'https://www.sbs.gob.pe/app/spp/empleadores/tasas_aportes/paginas/tasas_aportes.aspx', publisher: 'Superintendencia de Banca, Seguros y AFP' },
    { name: 'SBS — Entrega de hasta el 95,5% del fondo de pensiones', url: 'https://www.sbs.gob.pe/usuarios/informacion-de-pensiones/otros-beneficios-del-spp/entrega-de-hasta-el-955-del-fondo-de-pensiones', publisher: 'Superintendencia de Banca, Seguros y AFP' },
    { name: 'ONP — Sistema Nacional de Pensiones (DL 19990)', url: 'https://www.onp.gob.pe/', publisher: 'Oficina de Normalización Previsional' },
    { name: 'Programa Nacional de Asistencia Solidaria Pensión 65', url: 'https://www.gob.pe/pension65', publisher: 'MIDIS' },
    { name: 'MTPE — Régimen laboral de la actividad privada y remuneración mínima vital', url: 'https://www.gob.pe/mtpe', publisher: 'Ministerio de Trabajo y Promoción del Empleo' },
  ],

  replaces: [
    '/pe/calculadora-afp-vs-onp-peru',
    '/pe/calculadora-comparador-comisiones-afp-peru',
    '/pe/calculadora-retiro-afp-jubilacion-peru',
    '/pe/calculadora-pension-65-peru',
  ],

  lastReviewed: '2026-07-28',
};
