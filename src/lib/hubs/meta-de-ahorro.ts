import type { HubData } from './types';
import tasas from '../../data/live/tasas.json';

/** TNA de plazo fijo a 30 días publicada por el BCRA (dato vivo). */
export const TNA_PLAZO_FIJO: number = Number(tasas?.plazo_fijo_30d?.valor) || 0;

/** Disclaimer YMYL dominio `finance` — copiado textual de src/lib/disclaimers.ts. */
const FINANCE_DISCLAIMER =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'finanzas-personales/meta-de-ahorro',
  title: '¿Cuánto tengo que ahorrar por mes? — Calculadora de meta de ahorro',
  description:
    'Calculá cuánto apartar por mes para llegar a tu meta, cuánto vas a tardar con la cuota que podés poner, cuánto colchón de emergencia necesitás, cómo repartir el sueldo con la regla 50/30/20 y cuánto capital te haría falta para vivir de la renta.',
  silo: 'Finanzas personales',
  siloHref: '/finanzas-personales',

  eyebrow: 'Guía y estimación de ahorro',
  h1: '¿Cuánto tengo que ahorrar por mes?',
  lede:
    'Arrancamos por el caso más común: tenés una meta y una fecha. Ajustá los números con los tuyos y, si tu situación es otra —fondo de emergencia, repartir el sueldo, cortar un gasto chico o vivir de la renta—, cambiala abajo.',
  stamps: ['Actualizado 27-07-2026', 'Tasa de plazo fijo y IPC en vivo', '14 calculadoras adentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'meta-fecha',
        label: 'Tengo una meta y una fecha',
        hint: 'El caso más común',
        answer:
          'Con meta y plazo definidos, la cuota mensual sale de despejar el valor futuro de una serie de aportes: cuanto más rinda el ahorro, menos ponés de tu bolsillo.',
        yes: [
          'Cuota mensual necesaria para llegar a la meta en el plazo que pusiste',
          'Cuánto de la meta lo ponés vos y cuánto lo aporta el rendimiento',
          'Lo que ya tenés ahorrado crece aparte y baja la cuota',
          'La meta reexpresada en pesos de la fecha de llegada, según la inflación de los últimos doce meses',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'La cuenta usa una tasa constante. Si la meta es en dólares o en materiales (un auto, un viaje, una obra), el precio se mueve y la cuota real va a ser mayor.',
        ],
        plazo: 'revisá la cuota cada tres meses: si la tasa o el precio de la meta se movieron, recalculá.',
      },
      {
        id: 'meta-cuota',
        label: 'Puedo poner $X por mes: ¿cuánto tardo?',
        hint: 'La cuota manda',
        answer:
          'Con una cuota fija, el plazo sale de simular mes a mes el saldo hasta que toca la meta.',
        yes: [
          'Cuántos meses tardás en llegar con la cuota que podés sostener',
          'Cuánto de ese total lo ponés vos y cuánto lo suma el rendimiento',
          'El punto de partida cuenta: lo que ya tenés acorta el plazo',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'Si la cuota es muy baja frente a la meta, el plazo se dispara a décadas. Cuando pasa eso conviene subir la cuota antes que estirar el plazo.',
        ],
        plazo: 'si el plazo te da más de cinco años, replanteá la meta o la cuota.',
      },
      {
        id: 'fondo-emergencia',
        label: 'Quiero armar el fondo de emergencia',
        hint: 'Colchón de meses de gastos',
        answer:
          'El fondo de emergencia se mide en meses de gastos, no en un monto redondo: gastos mensuales por la cantidad de meses que querés cubrir.',
        yes: [
          'Cuánto es tu fondo objetivo según tus gastos y los meses que querés cubrir',
          'Cuántos meses cubre hoy lo que ya tenés',
          'Cuánto te falta y en cuántos meses lo completás con la cuota que podés poner',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'El fondo va en un instrumento líquido y de bajo riesgo. Si está en algo que no podés rescatar en 24 o 48 horas, no es fondo de emergencia.',
          'Con ingresos variables o gente a cargo, la referencia sube: de tres a seis meses pasa a seis a doce.',
        ],
        plazo: 'reconstituilo apenas lo uses: el fondo se gasta y se vuelve a llenar, no se cierra.',
      },
      {
        id: 'reparto-sueldo',
        label: 'No tengo meta: quiero ordenar el sueldo',
        hint: 'Regla 50/30/20',
        answer:
          'La regla 50/30/20 reparte el ingreso neto: mitad necesidades, treinta por ciento gustos y veinte por ciento ahorro.',
        yes: [
          'Cuánto te toca de necesidades, de gustos y de ahorro con tu ingreso',
          'Cuánto juntarías en un año sosteniendo ese veinte por ciento',
          'Qué porcentaje estás ahorrando hoy realmente, comparado con el objetivo',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'Si los gastos fijos ya se comen más de la mitad del ingreso, el 50/30/20 no cierra: se arranca con un 60/20/20 o un 70/20/10 y se ajusta de a poco.',
        ],
        plazo: 'automatizá la transferencia del ahorro el mismo día que cobrás, antes de gastar.',
      },
      {
        id: 'gasto-hormiga',
        label: 'Quiero ver cuánto pesa un gasto chico',
        hint: 'Ahorro hormiga',
        answer:
          'Un gasto diario chico, invertido en lugar de gastado, se convierte en un monto grande por el interés compuesto.',
        yes: [
          'Cuánto es al mes y al año ese gasto de todos los días',
          'Cuánto tendrías en cinco y en diez años si en vez de gastarlo lo invertís',
          'Cuánto de ese total son intereses que ganaste sin poner un peso extra',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'La proyección a diez años supone que la tasa se sostiene y que el aporte no se licúa. En pesos, mirá el resultado como orden de magnitud, no como promesa.',
        ],
        plazo: 'cortá un solo gasto por vez y automatizá el desvío del dinero el mismo día.',
      },
      {
        id: 'fire',
        label: 'Quiero vivir de la renta',
        hint: 'FIRE · regla del 4%',
        answer:
          'La regla del 4% dice que necesitás veinticinco veces tus gastos anuales para vivir de la renta a perpetuidad.',
        yes: [
          'Tu número objetivo: veinticinco veces lo que gastás en un año',
          'Cuánto llevás recorrido y cuánto te falta juntar',
          'En cuántos años llegarías con la cuota mensual que podés sostener',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'Esta rama razona en términos reales: usa un rendimiento del 7% anual por encima de la inflación, no la tasa nominal en pesos. Con tasas nominales el resultado sería irreal.',
          'La regla del 4% se calibró sobre carteras diversificadas de largo plazo en mercados desarrollados. En pesos, y sin cobertura de tipo de cambio, es una referencia teórica.',
        ],
        plazo: 'revisá el número FIRE cada vez que cambie tu nivel de gastos: el objetivo se mueve con vos.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada situación usa los campos que le sirven. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'ingreso', label: 'Ingreso mensual neto', prefix: '$', value: '1.800.000', thousands: true },
    { id: 'gastos', label: 'Gastos del mes que tenés que cubrir sí o sí', prefix: '$', value: '1.200.000', thousands: true },
    { id: 'meta', label: 'Meta de ahorro', prefix: '$', value: '6.000.000', thousands: true },
    { id: 'plazo', label: 'Plazo en meses para llegar a la meta', type: 'number', min: 1, max: 600, value: 18 },
    { id: 'cuota', label: 'Cuánto podés apartar por mes', prefix: '$', value: '250.000', thousands: true },
    { id: 'ahorroActual', label: 'Lo que ya tenés ahorrado', prefix: '$', value: '800.000', thousands: true },
    { id: 'mesesColchon', label: 'Meses de gastos que querés tener de colchón', type: 'number', min: 1, max: 24, value: 6 },
    { id: 'gastoDiario', label: 'Gasto diario chico que querrías cortar', prefix: '$', value: '4.000', thousands: true },
    {
      id: 'tna',
      label: 'Rendimiento anual estimado del ahorro (TNA)',
      type: 'number',
      min: 0,
      max: 300,
      step: 0.01,
      value: TNA_PLAZO_FIJO,
      suffix: '%',
      help: 'Viene cargado con la última tasa de plazo fijo a 30 días publicada por el BCRA. Cambiala si tu ahorro rinde distinto.',
    },
  ],
  fineprint: FINANCE_DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Cómo se arma el número',
    caption:
      'El gráfico separa lo que ponés de tu bolsillo de lo que aporta el rendimiento o de lo que todavía te falta, según la situación elegida.',
  },
  breakdownTitle: 'Qué compone tu plan de ahorro',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cuánto debería ahorrar por mes?',
      a: 'La referencia clásica es el 20% del ingreso neto: es el tercer tramo de la regla 50/30/20. Por debajo del 10% se considera una tasa de ahorro baja, entre 10% y 20% saludable y por encima del 20% muy buena. Ahora bien, si tenés una meta con fecha, el porcentaje deja de importar: la cuota la define la meta dividida por el plazo, ajustada por el rendimiento.',
    },
    {
      q: '¿Cómo se calcula la cuota mensual para llegar a una meta?',
      a: 'Se despeja de la fórmula del valor futuro de una serie de aportes: cuota = (meta − valor futuro de lo que ya tenés) ÷ [((1 + i)^n − 1) ÷ i], donde i es la tasa mensual y n la cantidad de meses. Si la tasa es cero, es simplemente lo que falta dividido los meses.',
    },
    {
      q: '¿Cuántos meses de gastos tiene que cubrir el fondo de emergencia?',
      a: 'Con ingreso estable en relación de dependencia, de tres a seis meses de gastos esenciales. Con ingreso variable, monotributo o gente a cargo, la referencia sube a entre seis y doce meses. Lo importante es medirlo en meses de gastos, no en un monto redondo: si tus gastos suben, el fondo objetivo sube con ellos.',
    },
    {
      q: '¿Dónde conviene tener el fondo de emergencia?',
      a: 'En algo líquido y de bajo riesgo: cuenta remunerada, fondo money market o plazo fijo corto y renovable. La regla práctica es que tengas el dinero disponible en 24 o 48 horas sin perder capital. Si está en un plazo fijo largo, en un inmueble o en acciones, no cumple la función de fondo de emergencia.',
    },
    {
      q: '¿Qué es la regla 50/30/20 y sirve en Argentina?',
      a: 'Reparte el ingreso neto en 50% necesidades, 30% gustos y 20% ahorro. Sirve como marco de orden, pero en contextos donde alquiler, servicios y comida se llevan bastante más de la mitad del ingreso hay que arrancar con un reparto tipo 60/20/20 o 70/20/10 e ir corriendo el porcentaje de ahorro a medida que mejora el ingreso.',
    },
    {
      q: '¿Cuánto rinde hoy el ahorro en pesos?',
      a: 'El campo de rendimiento viene cargado con la última tasa nominal anual de plazo fijo a 30 días publicada por el BCRA. Es la referencia más conservadora y verificable. Si tu ahorro está en un fondo money market, en una cuenta remunerada o en instrumentos ajustados por UVA, cambiá el valor por el que te den a vos.',
    },
    {
      q: '¿La meta se me licúa con la inflación?',
      a: 'Si la meta está fijada en un monto en pesos, sí: dentro de un año ese monto compra menos. Por eso la primera situación te muestra también la meta reexpresada al final del plazo usando la inflación acumulada de los últimos doce meses. Si tu meta es un bien concreto, tomá ese valor reexpresado como objetivo real.',
    },
    {
      q: '¿Cuánto capital necesito para vivir de la renta?',
      a: 'Con la regla del 4%, veinticinco veces tus gastos anuales. Si gastás un millón por mes, son doce millones al año y por lo tanto trescientos millones de capital. Bajar la tasa de retiro al 3% sube el multiplicador a 33 veces y la vuelve más conservadora.',
    },
    {
      q: '¿Por qué la simulación de vivir de la renta usa una tasa distinta?',
      a: 'Porque proyectar treinta años con una tasa nominal en pesos daría un resultado sin sentido: el capital crecería en números pero no en poder de compra. Esa rama usa un 7% anual real, es decir por encima de la inflación, que es la referencia histórica de una cartera diversificada de largo plazo.',
    },
    {
      q: '¿Sirve de algo cortar un gasto chico de todos los días?',
      a: 'Sirve por el compuesto, no por el monto. Un gasto diario chico multiplicado por 30 ya es una cuota mensual, y esa cuota sostenida diez años con rendimiento se convierte en varias veces lo aportado. La clave es desviar el dinero automáticamente el mismo día: si queda en la cuenta, se gasta igual.',
    },
    {
      q: '¿Conviene ahorrar o cancelar deuda primero?',
      a: 'Primero un colchón mínimo de un mes de gastos, después la deuda cara —tarjeta, adelantos, préstamos personales, cuyas tasas superan largamente lo que rinde cualquier ahorro conservador— y recién después el fondo completo y las metas de más largo plazo.',
    },
    {
      q: '¿Cada cuánto conviene recalcular el plan?',
      a: 'Cada tres meses, o antes si cambió tu ingreso, tus gastos fijos o la tasa de referencia. La cuota que cerraba hace un semestre puede quedar corta si el precio de la meta se movió.',
    },
  ],

  sources: [
    {
      name: 'Principales variables monetarias — tasa de plazo fijo a 30 días y BADLAR',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Índice de precios al consumidor (IPC) — variación mensual e interanual',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
    },
    {
      name: 'Valor de la unidad UVA y series de tasas de interés',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables_datos.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Educación financiera — fondo de emergencia y presupuesto del hogar',
      url: 'https://www.bcra.gob.ar/BCRAyVos/Educacion-financiera.asp',
      publisher: 'BCRA · BCRA y Vos',
    },
  ],

  replaces: [
    '/calculadora-ahorro-meta-mensual',
    '/calculadora-ahorro-objetivo-mensual',
    '/calculadora-cuanto-ahorrar-por-mes-meta',
    '/calculadora-tiempo-para-ahorrar-meta',
    '/calculadora-porcentaje-de-ahorro',
    '/calculadora-ahorro-hormiga-gasto-diario',
    '/calculadora-fondo-emergencia-meses',
    '/calculadora-fondo-emergencia-meses-gastos-cuanto',
    '/calculadora-ahorro-descuentos-cuenta-dni-mes-tope',
    '/calculadora-fire-retiro-temprano',
    '/calculadora-rol-ira-401k-argentino-equivalente',
    '/calculadora-presupuesto-50-30-20',
    '/calculadora-presupuesto-50-30-20-familiar-sueldo',
    '/calculadora-presupuesto-regla-50-30-20',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Constantes por rama. `real` marca las ramas que razonan en términos reales
 * (por encima de la inflación) en vez de nominales.
 *
 * `fireReal` = 7% anual real: es el default de rendimiento de la fórmula
 * original `src/lib/formulas/fire-retiro-temprano.ts`.
 * `tasaRetiro` = 4% → multiplicador 25× (100 ÷ 4), misma fórmula.
 */
export const CASE_MATH: Record<string, { usaTasaNominal: boolean }> = {
  'meta-fecha': { usaTasaNominal: true },
  'meta-cuota': { usaTasaNominal: true },
  'fondo-emergencia': { usaTasaNominal: false },
  'reparto-sueldo': { usaTasaNominal: false },
  'gasto-hormiga': { usaTasaNominal: true },
  fire: { usaTasaNominal: false },
};

/** Regla del 4%: tasa de retiro sostenible y rendimiento real de largo plazo. */
export const FIRE = { tasaRetiroPct: 4, rendimientoRealPct: 7 };

/** Reparto de la regla 50/30/20. */
export const REGLA_503020 = { necesidades: 0.5, deseos: 0.3, ahorro: 0.2 };
