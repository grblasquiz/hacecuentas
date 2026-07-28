import type { HubData } from '../types';
import { PARAGUAY_2026 } from '../../data/paraguay-2026';

/**
 * Hub de decisión PY — "IPS: cuánto aporto y qué me devuelve".
 *
 * Constantes de aportes: src/lib/data/paraguay-2026.ts.
 * Los parámetros de jubilación y del subsidio de maternidad NO están en la tabla
 * maestra: se replican acá desde las fórmulas vivas y se citan al IPS. Ver el
 * bloque REQUISITOS_JUBILACION / MATERNIDAD, que quedan editables.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const IPS = {
  obrero: PARAGUAY_2026.ips.obrero,
  patronal: PARAGUAY_2026.ips.patronal,
  patronalIps: PARAGUAY_2026.ips.patronalIps,
  patronalSalud: PARAGUAY_2026.ips.patronalSalud,
};

export const SMVM = PARAGUAY_2026.salarioMinimo;
export const DIAS_MES = PARAGUAY_2026.diasMes;

/**
 * Requisitos y haber de la jubilación del IPS. Replicados de
 * src/lib/formulas/jubilacion-ips-paraguay.ts. El porcentaje de la jubilación
 * proporcional es orientativo: el IPS lo determina caso por caso.
 */
export const JUBILACION = {
  ordinaria: { edad: 60, anios: 25, pct: 1.0 },
  anticipada: { edad: 55, anios: 30, pctBase: 0.8, pctPorAnio: 0.04, edadTope: 60 },
  proporcional: { edad: 65, anios: 15, referenciaAnios: 25, pctReferencia: 0.6 },
  /** El haber se calcula sobre el promedio de los últimos 120 salarios (10 años). */
  mesesPromedio: 120,
};

/** Subsidio de maternidad del IPS: 18 semanas al 100%, pagadas en 5 cuotas. */
export const MATERNIDAD = { diasReposo: 126, semanas: 18, cuotas: 5, pct: 1.0 };

const gs = (n: number) => 'Gs. ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'py/trabajo/ips',
  title: 'IPS Paraguay: cuánto aportás y qué te cubre (jubilación, salud, maternidad)',
  description:
    'El aporte obrero del 9% y el patronal del 16,5% al IPS, el costo real de un empleado, los requisitos de la jubilación ordinaria, anticipada y proporcional, y el subsidio de maternidad de 18 semanas.',
  silo: 'Trabajo',
  siloHref: '/py/trabajo',
  locale: 'py',

  eyebrow: 'Paraguay · Instituto de Previsión Social',
  h1: '¿Cuánto aportás al IPS y qué te devuelve?',
  lede:
    'El 9% que ves en el recibo es sólo una parte. Esta cuenta te muestra el aporte completo que entra a tu nombre, lo que le cuesta tu puesto a la empresa, cuándo vas a poder jubilarte y con qué haber, y cuánto cobrás de subsidio si sos madre.',
  stamps: [
    `Aporte obrero: ${(IPS.obrero * 100).toFixed(0)}% · patronal: ${(IPS.patronal * 100).toLocaleString('de-DE')}%`,
    `Jubilación ordinaria: ${JUBILACION.ordinaria.edad} años y ${JUBILACION.ordinaria.anios} de aportes`,
    `Maternidad: ${MATERNIDAD.semanas} semanas al 100%`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Aporte total mensual a tu nombre',

  cases: {
    title: '¿Qué querés saber del IPS?',
    intro:
      'El mismo aporte financia varias prestaciones. Elegí desde qué lado estás mirando la cuenta.',
    items: [
      {
        id: 'aportes',
        label: 'Cuánto se aporta por mí cada mes',
        hint: 'Aporte obrero + patronal',
        answer: `Entre vos y tu empleador entra al IPS el ${((IPS.obrero + IPS.patronal) * 100).toLocaleString('de-DE')}% de tu salario: vos ponés el ${(IPS.obrero * 100).toFixed(0)}%.`,
        yes: [
          `Aporte obrero del ${(IPS.obrero * 100).toFixed(0)}%, descontado de tu recibo`,
          `Aporte patronal del ${(IPS.patronal * 100).toLocaleString('de-DE')}%, que paga la empresa aparte del sueldo`,
          `Del patronal, ${(IPS.patronalIps * 100).toFixed(0)} puntos van al IPS y ${(IPS.patronalSalud * 100).toLocaleString('de-DE')} al Ministerio de Salud Pública`,
          'El aporte financia salud, jubilación, maternidad, reposo por enfermedad y accidentes de trabajo',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El aporte se calcula sobre el salario declarado: si tu empleador te declara por menos de lo que cobrás, tu futura jubilación se calcula sobre ese número menor',
          'Verificá tu historial de aportes en el portal del IPS: los meses sin aportar no cuentan para la antigüedad previsional',
        ],
        plazo: 'el empleador tiene que ingresar el aporte del mes dentro del plazo del IPS; el atraso genera multas y recargos.',
      },
      {
        id: 'empleador',
        label: 'Cuánto me cuesta tener un empleado',
        hint: 'Costo laboral total',
        answer: `Un empleado cuesta como mínimo el ${((1 + IPS.patronal) * 100).toLocaleString('de-DE')}% de su bruto, antes de aguinaldo y vacaciones.`,
        yes: [
          `Salario bruto más el ${(IPS.patronal * 100).toLocaleString('de-DE')}% de aporte patronal`,
          'El aguinaldo, que equivale a un sueldo más por año',
          'Las vacaciones pagas según la antigüedad del trabajador',
          'La provisión por indemnización, que crece 15 jornales por año trabajado',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El aporte obrero NO es un costo del empleador: lo retiene del sueldo del trabajador y lo ingresa, pero sale del bolsillo del empleado',
          'No inscribir al trabajador en el IPS expone a multas y a responder por las prestaciones no cubiertas',
        ],
        plazo: 'la inscripción del trabajador en el IPS corresponde desde el primer día de trabajo, no después del período de prueba.',
      },
      {
        id: 'jubilacion',
        label: 'Cuándo me puedo jubilar y con cuánto',
        hint: 'Ordinaria, anticipada y proporcional',
        answer: `Con ${JUBILACION.ordinaria.edad} años de edad y ${JUBILACION.ordinaria.anios} de aportes cobrás el 100% del promedio de tus últimos ${JUBILACION.mesesPromedio} salarios.`,
        yes: [
          `Ordinaria: ${JUBILACION.ordinaria.edad} años de edad y ${JUBILACION.ordinaria.anios} de aportes, con el 100% del promedio`,
          `Anticipada: ${JUBILACION.anticipada.edad} años y ${JUBILACION.anticipada.anios} de aportes, arrancando en el ${(JUBILACION.anticipada.pctBase * 100).toFixed(0)}% y subiendo ${(JUBILACION.anticipada.pctPorAnio * 100).toFixed(0)} puntos por año hasta el 100% a los ${JUBILACION.anticipada.edadTope}`,
          `Proporcional: ${JUBILACION.proporcional.edad} años y ${JUBILACION.proporcional.anios} de aportes, con un haber proporcional a lo aportado`,
          `El haber se calcula sobre el promedio de los últimos ${JUBILACION.mesesPromedio} salarios, o sea los últimos 10 años`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El porcentaje de la jubilación proporcional que muestra esta cuenta es orientativo: el IPS lo determina en cada expediente y no está publicado como una fórmula cerrada',
          `Como el haber sale del promedio de los últimos ${JUBILACION.mesesPromedio} salarios, cobrar en negro los últimos años baja la jubilación de por vida`,
          'El IPS no es el único régimen: Caja Fiscal, Caja Bancaria, Caja Municipal y otras tienen requisitos propios y esta cuenta no aplica a ellas',
        ],
        plazo: 'el trámite se inicia en el IPS con el certificado de aportes; conviene pedirlo con varios meses de anticipación.',
      },
      {
        id: 'maternidad',
        label: 'Estoy embarazada: cuánto cobro',
        hint: `${MATERNIDAD.semanas} semanas de permiso`,
        answer: `El IPS paga ${MATERNIDAD.diasReposo} días de reposo al 100% de tu salario, en ${MATERNIDAD.cuotas} cuotas.`,
        yes: [
          `${MATERNIDAD.semanas} semanas de permiso, equivalentes a ${MATERNIDAD.diasReposo} días`,
          'El subsidio equivale al 100% del salario, no a un porcentaje reducido',
          `El IPS lo abona fraccionado en ${MATERNIDAD.cuotas} cuotas`,
          'La base es el salario del último mes antes del parto',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El subsidio exige tener aportes vigentes y la cantidad mínima de cotizaciones que exige el IPS: si tu empleador te declaró tarde, puede rechazarse',
          'El permiso de maternidad protege contra el despido durante el embarazo y el período posterior que fija la ley',
        ],
        plazo: 'presentá el certificado médico y la solicitud en el IPS antes del inicio del reposo para no atrasar el pago.',
      },
    ],
  },

  inputsTitle: 'Tus datos previsionales',
  inputsIntro:
    'Con el salario alcanza para ver los aportes. Cargá edad y años aportados si querés la proyección jubilatoria.',
  fields: [
    {
      id: 'salario',
      label: 'Salario bruto mensual (Gs.)',
      prefix: 'Gs.',
      value: '4.000.000',
      thousands: true,
      help: `Base del aporte. El salario mínimo vigente es ${gs(SMVM)}.`,
    },
    {
      id: 'empleados',
      label: 'Cantidad de empleados con ese salario',
      type: 'number',
      value: 1,
      min: 1,
      max: 500,
      step: 1,
      help: 'Sirve para ver el costo de la planilla completa, no sólo de un puesto.',
    },
    {
      id: 'edad',
      label: 'Tu edad',
      type: 'number',
      value: 52,
      min: 16,
      max: 90,
      step: 1,
      help: 'Determina a qué modalidad de jubilación podés acceder.',
    },
    {
      id: 'aniosAporte',
      label: 'Años de aportes al IPS',
      type: 'number',
      value: 22,
      min: 0,
      max: 60,
      step: 1,
      help: 'Los que figuran en tu certificado de aportes, no los años trabajados.',
    },
    {
      id: 'promedio',
      label: `Promedio de tus últimos ${JUBILACION.mesesPromedio} salarios (Gs.)`,
      prefix: 'Gs.',
      value: '4.200.000',
      thousands: true,
      help: 'Es la base del haber jubilatorio: el promedio de los últimos 10 años de salarios declarados.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'Quién pone cada guaraní que entra al IPS',
    caption:
      'Muestra cómo se reparte el aporte total entre lo que descuentan de tu recibo y lo que agrega el empleador, dividido entre el fondo del IPS y la porción que va a Salud Pública.',
  },
  breakdownTitle: 'Tus aportes y tus prestaciones',
  breakdownIntro:
    'Primero lo que se aporta cada mes, después lo que ese aporte te habilita a cobrar.',

  faq: [
    {
      q: '¿Cuánto se aporta al IPS en total?',
      a: `El ${((IPS.obrero + IPS.patronal) * 100).toLocaleString('de-DE')}% del salario. El trabajador pone el ${(IPS.obrero * 100).toFixed(0)}%, que se descuenta del recibo, y el empleador el ${(IPS.patronal * 100).toLocaleString('de-DE')}%, que paga aparte del sueldo. De ese aporte patronal, ${(IPS.patronalIps * 100).toFixed(0)} puntos van al IPS propiamente dicho y ${(IPS.patronalSalud * 100).toLocaleString('de-DE')} al Ministerio de Salud Pública.`,
    },
    {
      q: '¿El aporte patronal lo pago yo?',
      a: 'No. Es un costo del empleador, adicional a tu sueldo. Un error muy común es leer "25,5% de aportes" y suponer que ése es el descuento del recibo: lo que te descuentan a vos es sólo el 9%. Del lado de la empresa, en cambio, cada empleado cuesta el bruto más el 16,5%, y eso sin contar aguinaldo, vacaciones ni la provisión por indemnización.',
    },
    {
      q: '¿Qué cubre el IPS con mi aporte?',
      a: 'Atención médica para vos y tu grupo familiar declarado, subsidio por enfermedad y reposo, subsidio de maternidad, prestaciones por accidente de trabajo y la jubilación. Es un régimen contributivo: los meses sin aportes no cuentan ni para la cobertura ni para la antigüedad previsional.',
    },
    {
      q: '¿Cuáles son los requisitos para jubilarse en el IPS?',
      a: `Hay tres modalidades. La ordinaria pide ${JUBILACION.ordinaria.edad} años de edad y ${JUBILACION.ordinaria.anios} de aportes, y paga el 100% del promedio de los últimos ${JUBILACION.mesesPromedio} salarios. La anticipada pide ${JUBILACION.anticipada.edad} años y ${JUBILACION.anticipada.anios} de aportes, y arranca en el ${(JUBILACION.anticipada.pctBase * 100).toFixed(0)}% del promedio, subiendo ${(JUBILACION.anticipada.pctPorAnio * 100).toFixed(0)} puntos por cada año que esperes hasta llegar al 100% a los ${JUBILACION.anticipada.edadTope}. La proporcional pide ${JUBILACION.proporcional.edad} años y al menos ${JUBILACION.proporcional.anios} de aportes, con un haber reducido en proporción a lo aportado.`,
    },
    {
      q: '¿Sobre qué salario se calcula mi jubilación?',
      a: `Sobre el promedio de los últimos ${JUBILACION.mesesPromedio} salarios declarados, es decir los últimos 10 años. Es el dato que más gente subestima: los años finales de carrera pesan todo. Si en esa década te declararon por el mínimo o pasaste tiempo sin aportar, el haber va a reflejar eso aunque antes hayas ganado bien.`,
    },
    {
      q: '¿Conviene jubilarse anticipadamente?',
      a: `Depende de cuánto puedas esperar. A los ${JUBILACION.anticipada.edad} años cobrás el ${(JUBILACION.anticipada.pctBase * 100).toFixed(0)}% del promedio, y cada año que esperás suma ${(JUBILACION.anticipada.pctPorAnio * 100).toFixed(0)} puntos hasta el 100%. Esos 20 puntos de diferencia son de por vida, así que la pregunta real es cuántos años vas a cobrar el haber: cuanto más larga la expectativa, más caro sale adelantar.`,
    },
    {
      q: '¿Puedo aportar al IPS si trabajo por mi cuenta?',
      a: 'Sí, existe el régimen del trabajador independiente, con afiliación voluntaria y un aporte del 13% de la renta declarada, con piso en un salario mínimo. Pero cubre sólo jubilación y pensiones, no el seguro de salud, que es la diferencia grande con el aporte del 9% del trabajador dependiente. Los aportes se pueden pagar mensual, trimestral o anualmente.',
    },
    {
      q: '¿Cuánto paga el IPS por maternidad?',
      a: `El 100% del salario durante ${MATERNIDAD.diasReposo} días, que son ${MATERNIDAD.semanas} semanas de permiso. El IPS lo abona fraccionado en ${MATERNIDAD.cuotas} cuotas, calculadas sobre el salario del último mes antes del parto. No es un porcentaje reducido: es el salario completo.`,
    },
    {
      q: '¿Qué pasa si mi empleador no me declara o me declara por menos?',
      a: 'Es una infracción y te afecta dos veces: hoy, porque podés quedar sin cobertura médica o sin derecho al subsidio; y en el futuro, porque tu jubilación se calcula sobre lo declarado. Podés consultar tu historial de aportes en el portal del IPS y denunciar la irregularidad ante el IPS y el MTESS. Cuanto antes, mejor: reconstruir años viejos es mucho más difícil.',
    },
    {
      q: '¿Los años aportados en otra caja me sirven?',
      a: 'El IPS no es el único régimen previsional del país: existen la Caja Fiscal para funcionarios públicos, la Caja Bancaria, las cajas municipales y otras. Cada una tiene requisitos propios y esta cuenta aplica sólo al IPS. Si aportaste en más de un régimen, consultá el reconocimiento recíproco de servicios antes de asumir que los años se suman automáticamente.',
    },
    {
      q: '¿Se puede seguir trabajando después de jubilarse?',
      a: 'La compatibilidad entre el haber y una nueva actividad depende del régimen y del tipo de jubilación. Antes de firmar un nuevo contrato, consultá tu caso puntual en el IPS: hay situaciones en las que reingresar como asalariado suspende o modifica el haber, y otras en las que no.',
    },
  ],

  sources: [
    {
      name: 'IPS — Aportes obrero y patronal',
      url: 'https://portal.ips.gov.py/sistemas/ipsportal/contenido.php?c=315',
      publisher: 'Instituto de Previsión Social',
    },
    {
      name: 'IPS — Jubilaciones y pensiones',
      url: 'https://portal.ips.gov.py/',
      publisher: 'Instituto de Previsión Social',
    },
    {
      name: 'Código del Trabajo (Ley N° 213/93) — maternidad y seguridad social',
      url: 'https://www.bacn.gov.py/leyes-paraguayas/2608/ley-n-213-establece-el-codigo-del-trabajo',
      publisher: 'Biblioteca y Archivo Central del Congreso Nacional',
    },
    {
      name: 'MTESS — Obligaciones del empleador',
      url: 'https://www.mtess.gov.py/',
      publisher: 'Ministerio de Trabajo, Empleo y Seguridad Social',
    },
  ],

  replaces: [
    '/py/descuento-ips-9-salario',
    '/py/calculadora-aporte-patronal-ips-paraguay',
    '/py/calculadora-jubilacion-ips-paraguay',
    '/py/calculadora-subsidio-maternidad-ips-paraguay',
  ],

  lastReviewed: '2026-07-28',
};
