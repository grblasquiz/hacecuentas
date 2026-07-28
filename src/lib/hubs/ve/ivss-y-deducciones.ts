import type { HubData } from '../types';
import { IVSS_REPOSO, PARO_FORZOSO_IVSS, FAOV_BANAVIH } from '../../data/venezuela-2026';

/**
 * Hub de decisión VE — "Qué me descuentan del sueldo y qué me devuelve la seguridad social".
 *
 * Une las dos caras de la misma moneda: las retenciones obligatorias (SSO, RPE,
 * FAOV) y las prestaciones que financian (reposo médico, paro forzoso, pensión de
 * vejez del IVSS).
 *
 * ⚠️ Todas las constantes son PORCENTAJES y REQUISITOS legales, no montos en
 * bolívares: no caducan con la inflación. Lo único en Bs. es el salario, que va
 * como campo editable. El tope del SSO se expresa en salarios mínimos y el salario
 * mínimo entra editable, porque el del módulo está marcado "⚠️ ACTUALIZAR".
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Retenciones obligatorias del trabajador (porcentajes de ley). */
export const DEDUCCIONES = {
  /** Ley del Seguro Social: 4% del salario, con tope de 5 salarios mínimos. */
  sso: 0.04,
  ssoTopeSalariosMinimos: 5,
  /** Ley del Régimen Prestacional de Empleo: 0,5% del salario. */
  rpe: 0.005,
  /** FAOV/BANAVIH: 1% del trabajador sobre el salario integral. */
  faovTrabajador: FAOV_BANAVIH.trabajador,
  faovPatrono: FAOV_BANAVIH.patrono,
  faovTotal: FAOV_BANAVIH.total,
};

/** Reposo médico (Ley del Seguro Social, Art. 9 y Reglamento). */
export const REPOSO = {
  porcentajeIvss: IVSS_REPOSO.porcentajeIvss,
  porcentajePatronoComplemento: IVSS_REPOSO.porcentajePatronoComplemento,
  diasEmpleador100: IVSS_REPOSO.diasEmpleador100,
  desdeDia: IVSS_REPOSO.desdeDia,
  maxSemanas: IVSS_REPOSO.maxSemanas,
};

/** Paro forzoso (Ley del Régimen Prestacional de Empleo, Art. 31 y ss.). */
export const PARO = {
  porcentaje: PARO_FORZOSO_IVSS.porcentaje,
  maxMeses: PARO_FORZOSO_IVSS.maxMeses,
  meses: PARO_FORZOSO_IVSS.meses,
  cotizacionesMinSemanas: PARO_FORZOSO_IVSS.cotizacionesMinSemanas,
  ventanaMeses: PARO_FORZOSO_IVSS.ventanaMeses,
  plazoSolicitudDias: PARO_FORZOSO_IVSS.plazoSolicitudDias,
};

/** Pensión de vejez (Ley del Seguro Social). Requisitos, no montos. */
export const PENSION = {
  semanasRequeridas: 750,
  edadHombre: 60,
  edadMujer: 55,
};

export const hub: HubData = {
  slug: 've/trabajo/ivss-y-deducciones',
  title: 'IVSS en Venezuela: qué te descuentan del sueldo y qué te paga el seguro social',
  description:
    'Calculá el SSO, el RPE y el FAOV que te retienen, el sueldo neto que queda, y qué te devuelve el sistema: pago del reposo médico (66,66%), paro forzoso (60% por 5 meses) y cuánto te falta para la pensión de vejez.',
  silo: 'Trabajo',
  siloHref: '/ve/trabajo',
  locale: 've',

  eyebrow: 'Venezuela · IVSS · BANAVIH · seguridad social',
  h1: 'Qué me descuentan del sueldo y qué me devuelve el IVSS.',
  lede:
    'Todos los meses se te van tres porcentajes del salario: el seguro social, el régimen de empleo y el fondo de vivienda. Acá ves cuánto es cada uno, qué neto queda, y sobre todo qué comprás con eso: reposo pago, paro forzoso y una pensión que exige 750 semanas.',
  stamps: [
    'Ley del Seguro Social · LRPE · Ley del Régimen Prestacional de Vivienda',
    'Todo en porcentajes y semanas: no caduca con la inflación',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Tu sueldo neto del mes',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Las tres retenciones se calculan igual siempre. Lo que cambia es qué prestación estás por usar y qué requisitos te van a pedir. Partimos del mes normal.',
    items: [
      {
        id: 'neto',
        label: 'Quiero saber mi neto del mes',
        hint: 'SSO 4% + RPE 0,5% + FAOV 1%',
        answer: `Entre SSO, RPE y FAOV se te retiene alrededor del ${((DEDUCCIONES.sso + DEDUCCIONES.rpe + DEDUCCIONES.faovTrabajador) * 100).toLocaleString('es-VE')}% del salario.`,
        yes: [
          `Seguro Social Obligatorio: ${DEDUCCIONES.sso * 100}% del salario, con tope de ${DEDUCCIONES.ssoTopeSalariosMinimos} salarios mínimos`,
          `Régimen Prestacional de Empleo: ${(DEDUCCIONES.rpe * 100).toLocaleString('es-VE')}% del salario, sin tope`,
          `FAOV/BANAVIH: ${DEDUCCIONES.faovTrabajador * 100}% que se te retiene, más ${DEDUCCIONES.faovPatrono * 100}% que pone el patrono`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La base legal del FAOV es el salario INTEGRAL, no el básico: muchas nóminas lo calculan mal y retienen de menos',
          'El ISLR se retiene aparte y solo si tu proyección anual supera el desgravamen: no está en esta cuenta',
        ],
        plazo: 'el patrono entera el FAOV ante BANAVIH dentro de los primeros 5 días de cada mes; si no lo hace, la cuenta de ahorro habitacional no acumula.',
      },
      {
        id: 'reposo',
        label: 'Estoy de reposo médico',
        hint: `Patrono los primeros ${REPOSO.diasEmpleador100} días, IVSS el ${(REPOSO.porcentajeIvss * 100).toFixed(2).replace('.', ',')}%`,
        answer: `Los primeros ${REPOSO.diasEmpleador100} días los paga el patrono al 100%; desde el día ${REPOSO.desdeDia} el IVSS cubre dos tercios.`,
        yes: [
          `Días 1 a ${REPOSO.diasEmpleador100}: el patrono paga el 100% del salario`,
          `Desde el día ${REPOSO.desdeDia}: el IVSS paga la indemnización diaria equivalente a 2/3 del salario normal`,
          `Tope de ${REPOSO.maxSemanas} semanas por un mismo caso`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El complemento del tercio restante a cargo del patrono NO es obligatorio por ley: depende del contrato o de la convención colectiva',
          'El reposo hay que validarlo ante el IVSS dentro de las 72 horas o el subsidio no se paga',
        ],
        plazo: 'validá el certificado de incapacidad en el centro del IVSS dentro de las 72 horas de emitido.',
      },
      {
        id: 'paro',
        label: 'Perdí el empleo',
        hint: `${PARO.porcentaje * 100}% del salario cotizado, hasta ${PARO.maxMeses} meses`,
        answer: `El paro forzoso paga el ${PARO.porcentaje * 100}% de tu salario promedio cotizado, por hasta ${PARO.maxMeses} cuotas mensuales.`,
        yes: [
          `Prestación mensual del ${PARO.porcentaje * 100}% del salario promedio cotizado de los últimos ${PARO.meses} meses`,
          `Hasta ${PARO.maxMeses} cuotas`,
          'Capacitación e intermediación laboral, que la ley incluye junto con el dinero',
        ],
        warn: [
          DISCLAIMER_LABOR,
          `Requiere al menos ${PARO.cotizacionesMinSemanas} semanas cotizadas dentro de los últimos ${PARO.ventanaMeses} meses`,
          'Solo cubre la pérdida INVOLUNTARIA del empleo: si renunciaste, no aplica',
          'Es independiente de las prestaciones sociales y de la indemnización del Art. 92: no se descuentan entre sí',
        ],
        plazo: `tenés ${PARO.plazoSolicitudDias} días desde el despido para solicitarlo; fuera de plazo se pierde.`,
      },
      {
        id: 'pension',
        label: 'Quiero saber cuándo me puedo pensionar',
        hint: `${PENSION.semanasRequeridas} semanas + ${PENSION.edadHombre}/${PENSION.edadMujer} años`,
        answer: `La pensión de vejez pide dos cosas a la vez: ${PENSION.semanasRequeridas} semanas cotizadas y ${PENSION.edadHombre} años (hombres) o ${PENSION.edadMujer} (mujeres).`,
        yes: [
          `${PENSION.semanasRequeridas} semanas cotizadas, que son algo más de ${Math.round(PENSION.semanasRequeridas / 52)} años de aportes`,
          `Edad mínima de ${PENSION.edadHombre} años para hombres y ${PENSION.edadMujer} para mujeres`,
          'Los dos requisitos son simultáneos: el que te falte más lejos marca la fecha',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Existen pensiones parciales, especiales y convenios de continuación facultativa que cambian el resultado',
          'Si trabajaste informal o el patrono no te inscribió, esas semanas no figuran: pedí tu cuenta individual al IVSS antes de hacer planes',
        ],
        plazo: 'consultá tu cuenta individual de cotizaciones en el IVSS: es el único dato que vale, y suele tener huecos que llevan tiempo corregir.',
      },
    ],
  },

  inputsTitle: 'Tus números',
  inputsIntro:
    'El salario y el salario mínimo van editables porque en bolívares nada se sostiene. Los porcentajes y las semanas los pone la ley y no cambian con la inflación.',
  fields: [
    {
      id: 'salarioMensual',
      label: 'Salario mensual bruto (Bs.)',
      prefix: 'Bs.',
      value: '3.000',
      thousands: true,
      help: 'El salario normal. Base del SSO y del RPE.',
    },
    {
      id: 'salarioIntegral',
      label: 'Salario integral mensual (Bs.)',
      prefix: 'Bs.',
      value: '3.375',
      thousands: true,
      help: 'Salario normal más alícuotas de utilidades y bono vacacional. Es la base legal del FAOV. Si no lo sabés, poné el mismo bruto.',
    },
    {
      id: 'salarioMinimo',
      label: 'Salario mínimo legal vigente (Bs.)',
      prefix: 'Bs.',
      value: '130',
      thousands: true,
      help: `Define el tope del SSO (${DEDUCCIONES.ssoTopeSalariosMinimos} salarios mínimos). Verificá el monto en Gaceta Oficial: el que traemos cargado está pendiente de actualización.`,
    },
    {
      id: 'diasReposo',
      label: 'Días de reposo médico',
      type: 'number',
      value: 0,
      min: 0,
      max: 364,
      step: 1,
      help: 'Dejalo en 0 si no estás de reposo.',
    },
    {
      id: 'mesesParo',
      label: 'Meses de paro forzoso a cobrar',
      type: 'number',
      value: 0,
      min: 0,
      max: 5,
      step: 1,
      help: `Máximo ${PARO.maxMeses}. Dejalo en 0 si no perdiste el empleo.`,
    },
    {
      id: 'edad',
      label: 'Tu edad',
      type: 'number',
      value: 42,
      min: 16,
      max: 90,
      step: 1,
      help: 'Para calcular cuánto te falta para la pensión de vejez.',
    },
    {
      id: 'sexo',
      label: 'Edad de jubilación que te aplica',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: `Hombre — ${PENSION.edadHombre} años` },
        { value: 'f', label: `Mujer — ${PENSION.edadMujer} años` },
      ],
    },
    {
      id: 'semanasCotizadas',
      label: 'Semanas cotizadas al IVSS',
      type: 'number',
      value: 520,
      min: 0,
      max: 2500,
      step: 1,
      help: 'El dato real sale de tu cuenta individual en el IVSS. Suele tener menos semanas de las que uno cree.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'Qué pasa con tu salario bruto',
    caption:
      'Compara lo que te queda en mano con lo que se va en cada retención. El FAOV, a diferencia de las otras dos, no es un impuesto perdido: se acumula en tu cuenta de ahorro habitacional en BANAVIH.',
  },
  breakdownTitle: 'Retención por retención, y qué te devuelve cada una',
  breakdownIntro:
    'Primero lo que se descuenta y el neto que queda. Después las prestaciones que ese aporte financia: reposo, paro forzoso y pensión.',

  faq: [
    {
      q: '¿Qué me descuentan exactamente del sueldo?',
      a: `Tres retenciones obligatorias. El Seguro Social Obligatorio, ${DEDUCCIONES.sso * 100}% del salario con tope de ${DEDUCCIONES.ssoTopeSalariosMinimos} salarios mínimos, que financia salud, incapacidad y pensión. El Régimen Prestacional de Empleo, ${(DEDUCCIONES.rpe * 100).toLocaleString('es-VE')}% sin tope, que financia el paro forzoso. Y el FAOV, ${DEDUCCIONES.faovTrabajador * 100}% que se te retiene sobre el salario integral. En total ronda el ${((DEDUCCIONES.sso + DEDUCCIONES.rpe + DEDUCCIONES.faovTrabajador) * 100).toLocaleString('es-VE')}% para salarios por debajo del tope del SSO. Aparte va el ISLR, que sólo se retiene si tu proyección anual supera el desgravamen.`,
    },
    {
      q: '¿El FAOV es plata que pierdo?',
      a: `No: es la única de las tres que se te acredita a nombre tuyo. El aporte total al Fondo de Ahorro Obligatorio para la Vivienda es del ${DEDUCCIONES.faovTotal * 100}% del salario integral, del cual ${DEDUCCIONES.faovTrabajador * 100} punto lo ponés vos y ${DEDUCCIONES.faovPatrono * 100} el patrono, y se acumula en tu cuenta de ahorro habitacional en BANAVIH. Es el requisito para acceder a los créditos de vivienda del sistema. Ojo con un detalle que muchas nóminas hacen mal: la base legal es el salario INTEGRAL, no el básico, así que si te lo calculan sobre el sueldo pelado están acreditándote de menos.`,
    },
    {
      q: '¿Por qué el SSO tiene tope y las otras no?',
      a: `Porque la Ley del Seguro Social limita el salario cotizable a ${DEDUCCIONES.ssoTopeSalariosMinimos} salarios mínimos: por encima de ese monto el ${DEDUCCIONES.sso * 100}% deja de crecer. La lógica es que también topea la prestación que después recibís. El RPE y el FAOV, en cambio, corren sobre el salario completo. En la práctica venezolana, con el salario mínimo legal donde está, casi cualquier sueldo formal supera el tope y el SSO termina siendo un monto fijo bastante chico.`,
    },
    {
      q: '¿Cómo se paga un reposo médico?',
      a: `Por tramos. Los primeros ${REPOSO.diasEmpleador100} días los paga el patrono al 100% del salario. Desde el día ${REPOSO.desdeDia} entra el IVSS con una indemnización diaria equivalente a dos tercios del salario normal, es decir el ${(REPOSO.porcentajeIvss * 100).toFixed(2).replace('.', ',')}%, con un tope de ${REPOSO.maxSemanas} semanas por un mismo caso. El tercio restante lo completa el patrono en muchas empresas, pero eso no lo obliga la ley: sale del contrato o de la convención colectiva. Si tu empleador no lo completa, un reposo largo te cuesta un tercio del sueldo.`,
    },
    {
      q: '¿Qué tengo que hacer para que me paguen el reposo?',
      a: 'Validar el certificado de incapacidad ante el IVSS dentro de las 72 horas de emitido. Es el paso que más subsidios hace perder: el reposo lo firma el médico, pero si no queda validado en el sistema del IVSS en plazo, la indemnización diaria no se genera y el patrono no tiene por qué adelantarla. Guardá copia sellada de la validación.',
    },
    {
      q: '¿Cuánto paga el paro forzoso y por cuánto tiempo?',
      a: `El ${PARO.porcentaje * 100}% de tu salario mensual promedio cotizado en los últimos ${PARO.meses} meses, por un máximo de ${PARO.maxMeses} cuotas mensuales. La prestación por Pérdida Involuntaria del Empleo se financia con el ${(DEDUCCIONES.rpe * 100).toLocaleString('es-VE')}% del RPE que te retienen todos los meses. Importante: es independiente de las prestaciones sociales del Art. 142 y de la indemnización del Art. 92. No se descuentan entre sí, se cobran las tres.`,
    },
    {
      q: '¿Qué requisitos me piden para el paro forzoso?',
      a: `Dos, y los dos se chequean. Haber cotizado al menos ${PARO.cotizacionesMinSemanas} semanas dentro de los últimos ${PARO.ventanaMeses} meses, y que la pérdida del empleo haya sido involuntaria: renuncia no califica. Además hay un plazo de ${PARO.plazoSolicitudDias} días desde el despido para presentar la solicitud, y vencido se pierde el derecho. Si el patrono no te tenía inscrito o dejó de cotizar, las semanas faltantes son el problema real.`,
    },
    {
      q: '¿Cuántas semanas necesito para pensionarme?',
      a: `${PENSION.semanasRequeridas} semanas cotizadas, que equivalen a algo más de ${Math.round(PENSION.semanasRequeridas / 52)} años de aportes continuos, MÁS la edad mínima: ${PENSION.edadHombre} años para hombres y ${PENSION.edadMujer} para mujeres. Los dos requisitos son simultáneos, no alternativos, así que la fecha en la que te podés pensionar la marca el que te falte más lejos. Alguien con las semanas completas a los 50 igual tiene que esperar la edad.`,
    },
    {
      q: 'Me faltan semanas y ya no trabajo formal, ¿qué opciones tengo?',
      a: 'El IVSS prevé la continuación facultativa: seguir cotizando por cuenta propia para completar las semanas que faltan. También existen pensiones especiales y regímenes de transición. Antes de decidir nada, pedí tu cuenta individual de cotizaciones: es habitual que aparezcan menos semanas de las que uno da por hechas, porque hay períodos en que el patrono retuvo pero no enteró. Corregir esos huecos lleva tiempo y hay que arrancarlo con anticipación.',
    },
    {
      q: '¿El monto de la pensión también depende de mi salario?',
      a: 'La pensión de vejez del IVSS está referenciada al salario mínimo nacional, no a una proporción de lo que ganabas, que es una diferencia grande con otros sistemas de la región. Por eso este hub calcula requisitos y plazos, y no proyecta un monto: cualquier cifra en bolívares que pusiéramos quedaría desactualizada en semanas. Para saber cuánto vas a cobrar, la referencia vigente es el salario mínimo del momento en que te pensiones.',
    },
  ],

  sources: [
    {
      name: 'Ley del Seguro Social — indemnizaciones diarias y pensión de vejez',
      url: 'https://vlexvenezuela.com/vid/ley-seguro-social-42849572',
      publisher: 'Gaceta Oficial / Justia Venezuela',
    },
    {
      name: 'IVSS — Instituto Venezolano de los Seguros Sociales',
      url: 'http://www.ivss.gov.ve/',
      publisher: 'IVSS',
    },
    {
      name: 'Ley del Régimen Prestacional de Empleo — prestación por pérdida involuntaria del empleo',
      url: 'https://www.asambleanacional.gob.ve/',
      publisher: 'Asamblea Nacional',
    },
    {
      name: 'Decreto Nº 9.048 — Ley del Régimen Prestacional de Vivienda y Hábitat, Art. 30 (FAOV)',
      url: 'http://www.banavih.gob.ve/',
      publisher: 'BANAVIH',
    },
    {
      name: 'Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT)',
      url: 'https://www.inces.gob.ve/wp-content/uploads/2020/03/LOTTT.pdf',
      publisher: 'INCES / Gaceta Oficial 6.076 Extraordinario',
    },
  ],

  replaces: [
    '/ve/calculadora-sueldo-neto-deducciones-venezuela',
    '/ve/calculadora-aporte-faov-banavih-venezuela',
    '/ve/calculadora-pago-reposo-ivss-venezuela',
    '/ve/calculadora-paro-forzoso-ivss-venezuela',
    '/ve/calculadora-semanas-cotizadas-pension-ivss-venezuela',
  ],

  lastReviewed: '2026-07-28',
};
