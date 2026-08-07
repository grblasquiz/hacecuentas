import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánto me cuesta de verdad tener un empleado?" (lado empleador).
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts. Nada de memoria.
 *
 * Ojo con dos trampas que traían las calcs viejas y que acá NO se repiten:
 *  1. El divisor de horas mensuales NO es 220 fijo: la Ley 2101/2021 baja la jornada
 *     a 42 h/semana desde el 15-jul-2026 y el divisor pasa a 210. El hub lo resuelve
 *     por fecha en tiempo de ejecución (ver el <script> de la página).
 *  2. Los intereses del 12% se liquidan sobre el saldo de cesantías DEL AÑO y
 *     proporcionales al tiempo corrido, no sobre lo acumulado de todos los años.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** SMLMV y auxilio de transporte vigentes (Decretos 1469 y 1470 de 2025). */
export const SMLMV = COLOMBIA_2026.smlmv;
export const AUXILIO_TRANSPORTE = COLOMBIA_2026.auxilioTransporte;
export const TOPE_AUXILIO_SMLMV = COLOMBIA_2026.topeAuxilioSmlmv;

/** Aportes de seguridad social y parafiscales a cargo del empleador. */
export const APORTES = {
  saludEmpleador: COLOMBIA_2026.aportes.saludEmpleador,
  pensionEmpleador: COLOMBIA_2026.aportes.pensionEmpleador,
  arl: { ...COLOMBIA_2026.aportes.arl },
  cajaCompensacion: COLOMBIA_2026.aportes.parafiscales.cajaCompensacion,
  icbf: COLOMBIA_2026.aportes.parafiscales.icbf,
  sena: COLOMBIA_2026.aportes.parafiscales.sena,
  exoneracionSmlmvTope: COLOMBIA_2026.aportes.exoneracionArt114_1SmlmvTope,
  ibcTopeSmlmv: COLOMBIA_2026.aportes.ibcTopeSmlmv,
};

/** Prestaciones sociales: cesantías, intereses, prima y vacaciones. */
export const PRESTACIONES = {
  cesantias: COLOMBIA_2026.prestaciones.cesantiasPorcentaje,
  intereses: COLOMBIA_2026.prestaciones.interesesCesantias,
  prima: COLOMBIA_2026.prestaciones.primaPorcentaje,
  vacaciones: COLOMBIA_2026.prestaciones.vacacionesPorcentaje,
  vacacionesDiasHabiles: COLOMBIA_2026.prestaciones.vacacionesDiasHabiles,
};

/** Jornada Ley 2101/2021: el divisor de horas del mes cambia el 15-jul-2026. */
export const JORNADA = {
  divisorHasta14Jul2026: COLOMBIA_2026.jornada.divisorMensualHasta14Jul2026,
  divisorDesde15Jul2026: COLOMBIA_2026.jornada.divisorMensualDesde15Jul2026,
  horasSemanaHasta14Jul2026: COLOMBIA_2026.jornada.horasSemanaHasta14Jul2026,
  horasSemanaDesde15Jul2026: COLOMBIA_2026.jornada.horasSemanaDesde15Jul2026,
  corte: '2026-07-15',
};

/** Salario integral (art. 132 CST): mínimo 13 SMLMV, IBC sobre el 70%. */
export const INTEGRAL = {
  minimoSmlmv: COLOMBIA_2026.salarioIntegral.minimoSmlmv,
  factorPrestacional: COLOMBIA_2026.salarioIntegral.factorPrestacional,
  ibcFactor: COLOMBIA_2026.salarioIntegral.ibcFactor,
};

/** Indemnización por despido sin justa causa, contrato a término indefinido (art. 64 CST). */
export const INDEMNIZACION = {
  menos10Smlmv: { ...COLOMBIA_2026.indemnizacionDespido.menos10Smlmv },
  desde10Smlmv: { ...COLOMBIA_2026.indemnizacionDespido.desde10Smlmv },
};

/**
 * FIC — Fondo de la Industria de la Construcción: 1% de la nómina mensual de
 * salarios de los trabajadores de obra, a cargo de los empleadores de la
 * industria de la construcción, administrado por el SENA (Ley 21/1982, art. 6).
 * Es adicional al 2% ordinario del SENA y NO lo cubre la exoneración del art. 114-1.
 */
export const FIC_CONSTRUCCION = 0.01;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
const pct = (n: number) => (n * 100).toLocaleString('es-CO', { maximumFractionDigits: 3 }) + '%';

export const hub: HubData = {
  slug: 'co/trabajo/costo-de-contratar',
  title: 'Cuánto cuesta contratar y aportes ARL por riesgo, Colombia',
  description:
    'Calculá lo que de verdad te cuesta un empleado en Colombia: factor prestacional, seguridad social, aportes ARL por nivel de riesgo (tarifas clase I a V, los paga el empleador, no el empleado), caja de compensación, exoneración del art. 114-1 ET, costo por hora y cuánto vale despedirlo.',
  silo: 'Trabajo',
  siloHref: '/co/trabajo',
  locale: 'co',

  eyebrow: 'Colombia · lado empleador · nómina',
  h1: '¿Cuánto me cuesta de verdad tener un empleado? Nómina, prestaciones y aportes ARL por nivel de riesgo',
  lede:
    'El sueldo que acordás no es lo que pagás. Encima van prestaciones, seguridad social, ARL, caja de compensación y parafiscales, y todo eso cambia según seas persona jurídica o natural, cuánto gane el trabajador y de qué clase de riesgo sea la actividad. Acá sale el costo mensual cargado, el costo por hora y lo que vale terminar el contrato.',
  stamps: [
    `SMLMV: ${cop(SMLMV)} · auxilio ${cop(AUXILIO_TRANSPORTE)}`,
    'Art. 114-1 ET · arts. 64, 132 y 186 CST · Ley 2101/2021',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Costo mensual real del empleado',

  cases: {
    title: '¿Qué tipo de contratación estás costeando?',
    intro:
      'La diferencia entre una rama y otra es de plata gruesa: la exoneración del art. 114-1 saca 13,5 puntos del costo, y el salario integral cambia la cuenta entera. Partimos del caso más frecuente.',
    items: [
      {
        id: 'pj-exonerado',
        label: 'Soy empresa (persona jurídica) y el sueldo es menor a 10 SMLMV',
        hint: 'Con exoneración del art. 114-1 ET',
        answer: `Con la exoneración no pagás salud 8,5%, SENA ni ICBF: el sobrecosto ronda el 35-40% del sueldo, no el 50%.`,
        yes: [
          `Pensión a cargo del empleador: ${pct(APORTES.pensionEmpleador)} del IBC`,
          `ARL completa según clase de riesgo (${pct(APORTES.arl.I)} a ${pct(APORTES.arl.V)}), 100% del empleador`,
          `Caja de compensación familiar ${pct(APORTES.cajaCompensacion)}: NUNCA se exonera`,
          `Prestaciones: cesantías ${pct(PRESTACIONES.cesantias)}, intereses ${pct(PRESTACIONES.intereses)} sobre esas cesantías, prima ${pct(PRESTACIONES.prima)} y vacaciones ${pct(PRESTACIONES.vacaciones)}`,
          `Auxilio de transporte si el sueldo no pasa de ${TOPE_AUXILIO_SMLMV} SMLMV (${cop(TOPE_AUXILIO_SMLMV * SMLMV)})`,
        ],
        warn: [
          DISCLAIMER_TAX,
          `La exoneración se mide trabajador por trabajador: al que gane ${APORTES.exoneracionSmlmvTope} SMLMV (${cop(APORTES.exoneracionSmlmvTope * SMLMV)}) o más le pagás salud, SENA e ICBF completos aunque el resto de la nómina esté exonerada`,
          'La exoneración es sólo del 8,5% patronal de salud: el 4% que se le descuenta al trabajador se sigue reteniendo y girando igual',
        ],
        plazo: 'las cesantías se consignan al fondo antes del 14 de febrero; la prima, a más tardar el 30 de junio y el 20 de diciembre.',
      },
      {
        id: 'sin-exoneracion',
        label: 'Soy persona natural, o el sueldo llega a 10 SMLMV',
        hint: 'Sin exoneración: salud 8,5% + SENA + ICBF',
        answer: 'Sin exoneración se suman 13,5 puntos: salud 8,5%, ICBF 3% y SENA 2% sobre el salario.',
        yes: [
          `Salud a cargo del empleador: ${pct(APORTES.saludEmpleador)} del IBC`,
          `Pensión ${pct(APORTES.pensionEmpleador)} y ARL según clase de riesgo`,
          `Parafiscales completos: caja ${pct(APORTES.cajaCompensacion)} + ICBF ${pct(APORTES.icbf)} + SENA ${pct(APORTES.sena)}`,
          'Las mismas prestaciones sociales que en cualquier contrato laboral',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las personas naturales empleadoras no acceden a la exoneración del art. 114-1 ET aunque el sueldo sea bajo: el beneficio es para sociedades y asimiladas contribuyentes de renta',
          `El IBC de seguridad social se topa en ${APORTES.ibcTopeSmlmv} SMLMV (${cop(APORTES.ibcTopeSmlmv * SMLMV)}); los parafiscales y las prestaciones no tienen ese tope`,
        ],
        plazo: 'la PILA se paga en los primeros días hábiles del mes siguiente según el último dígito del NIT o la cédula.',
      },
      {
        id: 'integral',
        label: 'Le pago salario integral',
        hint: `Mínimo ${INTEGRAL.minimoSmlmv} SMLMV · art. 132 CST`,
        answer: `El salario integral ya incluye prestaciones dentro del ${pct(INTEGRAL.factorPrestacional)} de factor, pero las vacaciones se siguen causando aparte.`,
        yes: [
          `Piso legal: ${INTEGRAL.minimoSmlmv} SMLMV (${cop(INTEGRAL.minimoSmlmv * SMLMV)}), o sea 10 SMLMV de salario más ${pct(INTEGRAL.factorPrestacional)} de factor prestacional`,
          `Seguridad social sobre el ${pct(INTEGRAL.ibcFactor)} del salario integral, no sobre el 100%`,
          `Vacaciones: ${PRESTACIONES.vacacionesDiasHabiles} días hábiles al año se siguen causando y se pagan aparte`,
          'Sin cesantías, sin intereses y sin prima: van adentro del factor prestacional',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Nunca hay exoneración del art. 114-1: el mínimo integral (${INTEGRAL.minimoSmlmv} SMLMV) ya supera el tope de ${APORTES.exoneracionSmlmvTope} SMLMV, así que salud 8,5%, SENA e ICBF se pagan siempre`,
          'Los parafiscales y la caja también se liquidan sobre el 70%, pero la base del 70% es una regla de cotización, no una rebaja del salario: para indemnizar se usa el salario integral completo',
          'Pactar integral por debajo del piso legal no lo convierte en integral: el juez lo lee como salario ordinario y te reclama prima, cesantías e intereses hacia atrás',
        ],
        plazo: 'el pacto de salario integral tiene que constar por escrito; sin documento, la ley presume salario ordinario.',
      },
      {
        id: 'despido',
        label: 'Quiero saber cuánto me cuesta despedirlo',
        hint: 'Sin justa causa · término indefinido · art. 64 CST',
        answer: `Con sueldo menor a 10 SMLMV son ${INDEMNIZACION.menos10Smlmv.diasPrimerAnio} días por el primer año y ${INDEMNIZACION.menos10Smlmv.diasPorAnioAdicional} por cada año siguiente, más lo que le debas de prestaciones.`,
        yes: [
          `Indemnización: ${INDEMNIZACION.menos10Smlmv.diasPrimerAnio} + ${INDEMNIZACION.menos10Smlmv.diasPorAnioAdicional} días si gana menos de 10 SMLMV; ${INDEMNIZACION.desde10Smlmv.diasPrimerAnio} + ${INDEMNIZACION.desde10Smlmv.diasPorAnioAdicional} si gana 10 SMLMV o más`,
          'Cesantías, intereses, prima y vacaciones proporcionales al tiempo del año que todavía no liquidaste',
          'El día se calcula sobre el salario mensual dividido 30, incluyendo lo que sea salario (comisiones, horas extras habituales)',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si el contrato es a término fijo la indemnización no es la tabla del art. 64: son los salarios de todo el tiempo que faltaba para el vencimiento, que puede salir bastante más caro',
          'Fuero sindical, licencia de maternidad, estabilidad reforzada por salud o prepensión pueden hacer el despido ineficaz y obligar al reintegro con salarios caídos',
          'No consignar las cesantías al 14 de febrero dispara la sanción moratoria de un día de salario por cada día de retraso (Ley 50/1990, art. 99)',
        ],
        plazo: 'la liquidación se paga al terminar el contrato: cada día de mora después puede costar un día de salario (art. 65 CST).',
      },
    ],
  },

  inputsTitle: 'Los datos de ese puesto',
  inputsIntro:
    'Cargá el sueldo pactado y la clase de riesgo de la actividad. Los campos de antigüedad sólo pesan en la rama de despido, y las horas productivas sólo en el costo por hora.',
  fields: [
    {
      id: 'salario',
      label: 'Salario mensual pactado (COP)',
      prefix: '$',
      value: '3.000.000',
      thousands: true,
      help: 'Lo que figura en el contrato, sin auxilio de transporte. Si hay comisiones fijas o recargos habituales, sumalos: también son salario.',
    },
    {
      id: 'claseArl',
      label: 'Clase de riesgo de la actividad (ARL)',
      type: 'select',
      value: 'I',
      options: [
        { value: 'I', label: `Clase I — riesgo mínimo (${pct(APORTES.arl.I)}): oficina, servicios, educación` },
        { value: 'II', label: `Clase II — riesgo bajo (${pct(APORTES.arl.II)}): comercio, transporte` },
        { value: 'III', label: `Clase III — riesgo medio (${pct(APORTES.arl.III)}): gastronomía, obra liviana` },
        { value: 'IV', label: `Clase IV — riesgo alto (${pct(APORTES.arl.IV)}): manufactura pesada, química` },
        { value: 'V', label: `Clase V — riesgo máximo (${pct(APORTES.arl.V)}): minería, alturas, explosivos` },
      ],
      help: 'La clase la define la actividad económica del centro de trabajo (Decreto 1607/2002), no el cargo de la persona. La ARL la paga íntegra el empleador.',
    },
    {
      id: 'construccion',
      label: '¿Es empresa de la industria de la construcción?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí — se suma el FIC del 1% sobre la nómina de obra' },
      ],
      help: 'El FIC es el Fondo de la Industria de la Construcción: 1% adicional sobre la nómina de los trabajadores de obra, a cargo del empleador y administrado por el SENA.',
    },
    {
      id: 'horasProductivas',
      label: 'Horas productivas reales al mes',
      type: 'number',
      value: 190,
      min: 1,
      max: 300,
      step: 1,
      help: 'Para cotizar servicios: las horas que la persona realmente produce, ya descontando descansos y festivos. Si lo dejás en el divisor legal, subestimás tu costo por hora.',
    },
    {
      id: 'anios',
      label: 'Antigüedad: años completos',
      type: 'number',
      value: 3,
      min: 0,
      max: 50,
      step: 1,
      help: 'Sólo se usa en la rama de despido. Los años cuentan desde el ingreso, no desde el último contrato firmado si hubo continuidad.',
    },
    {
      id: 'meses',
      label: 'Antigüedad: meses sueltos',
      type: 'number',
      value: 6,
      min: 0,
      max: 11,
      step: 1,
      help: 'Los meses que van encima de los años completos.',
    },
    {
      id: 'mesesPendientes',
      label: 'Meses del año sin liquidar prestaciones',
      type: 'number',
      value: 6,
      min: 0,
      max: 12,
      step: 1,
      help: 'Desde el último pago de prima o consignación de cesantías. Con 6 estás asumiendo medio año pendiente, que es lo habitual.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué está hecho cada peso que desembolsás',
    caption:
      'Muestra qué parte del desembolso es sueldo en el bolsillo del trabajador y qué parte son prestaciones, seguridad social y parafiscales que nunca ve en su cuenta pero que vos pagás igual.',
  },
  breakdownTitle: 'El costo, concepto por concepto',
  breakdownIntro:
    'El mismo orden en el que lo arma un contador: salario y auxilio, prestaciones causadas, seguridad social, parafiscales y el total cargado con su factor.',

  faq: [
    {
      q: '¿Cuánto se le suma al sueldo en Colombia? ¿El famoso 1,5×?',
      a: `Depende de la exoneración y de la clase de riesgo, y el "1,5" es un mito cómodo. Una empresa exonerada (art. 114-1 ET) con un empleado de riesgo mínimo paga alrededor de 1,35 a 1,40 veces el sueldo. Sin exoneración, con salud 8,5%, ICBF 3% y SENA 2% encima, se va a 1,50 o más. Y si la actividad es de clase V, la ARL sola (${pct(APORTES.arl.V)}) suma casi 7 puntos. Por eso conviene correr la cuenta con tus datos en vez de multiplicar por un número redondo.`,
    },
    {
      q: '¿Qué es exactamente la exoneración del art. 114-1 del Estatuto Tributario?',
      a: `Es el beneficio que la Ley 1607/2012 dejó vigente en el art. 114-1 ET: las sociedades y personas jurídicas contribuyentes de renta no pagan el aporte patronal de salud del ${pct(APORTES.saludEmpleador)}, ni SENA ${pct(APORTES.sena)}, ni ICBF ${pct(APORTES.icbf)} por los trabajadores que ganen menos de ${APORTES.exoneracionSmlmvTope} SMLMV, hoy ${cop(APORTES.exoneracionSmlmvTope * SMLMV)}. Se mide trabajador por trabajador, así que en la misma nómina podés tener gente exonerada y gente no. La caja de compensación del ${pct(APORTES.cajaCompensacion)} queda por fuera del beneficio: esa se paga siempre.`,
    },
    {
      q: '¿Las personas naturales también se exoneran?',
      a: 'Sólo en un caso muy acotado: las personas naturales empleadoras que ocupen dos o más trabajadores tienen el beneficio de SENA e ICBF según el mismo artículo, pero no el trato general de las sociedades. En la práctica, si sos persona natural con un empleado, la cuenta segura es la de la rama "sin exoneración". Es una de esas diferencias donde vale la pena que un contador mire tu caso puntual antes de dejar de pagar un aporte.',
    },
    {
      q: '¿Por qué la caja de compensación nunca se exonera?',
      a: `Porque el aporte del ${pct(APORTES.cajaCompensacion)} a la caja de compensación familiar (Ley 21/1982) es la puerta de entrada del trabajador al subsidio familiar, a los servicios de recreación, educación y vivienda, y al mecanismo de protección al cesante. El legislador lo dejó afuera de la exoneración a propósito. Es el único parafiscal que pagan absolutamente todos los empleadores, exonerados o no, incluido el de salario integral.`,
    },
    {
      q: '¿Cómo se calcula el factor prestacional real?',
      a: `Sumando las cuatro prestaciones que se causan mes a mes: cesantías ${pct(PRESTACIONES.cesantias)} (un mes de salario por año), intereses a las cesantías del ${pct(PRESTACIONES.intereses)} anual sobre ese saldo —que en provisión mensual da alrededor del 1% del sueldo—, prima de servicios ${pct(PRESTACIONES.prima)} (otros 30 días al año) y vacaciones ${pct(PRESTACIONES.vacaciones)} (${PRESTACIONES.vacacionesDiasHabiles} días hábiles al año). Juntas rondan el 21,8% del salario. Ojo con un error frecuente: los intereses son el 12% de las cesantías, no el 12% del sueldo.`,
    },
    {
      q: '¿El auxilio de transporte entra en las prestaciones?',
      a: `Sí para cesantías, intereses y prima: aunque el auxilio no es salario, la ley lo incorpora expresamente a la base de esas prestaciones. No entra en vacaciones, porque durante las vacaciones no hay desplazamiento al trabajo, ni en la base de los aportes a seguridad social. Aplica a quien gane hasta ${TOPE_AUXILIO_SMLMV} SMLMV (${cop(TOPE_AUXILIO_SMLMV * SMLMV)}) y hoy vale ${cop(AUXILIO_TRANSPORTE)}.`,
    },
    {
      q: '¿Cómo saco el costo por hora para cotizar un servicio?',
      a: `Dividiendo el costo mensual cargado —no el sueldo— entre las horas realmente productivas del mes, que suelen andar por 190 y no por el divisor legal. El divisor legal sirve para liquidar recargos y horas extras, y cambió: con la jornada de ${JORNADA.horasSemanaHasta14Jul2026} horas eran ${JORNADA.divisorHasta14Jul2026} horas al mes, y desde el 15 de julio de 2026, con la jornada de ${JORNADA.horasSemanaDesde15Jul2026} horas de la Ley 2101/2021, son ${JORNADA.divisorDesde15Jul2026}. Como el divisor bajó y el sueldo no, la hora ordinaria subió cerca de un 4,8%: si tu liquidador todavía divide por ${JORNADA.divisorHasta14Jul2026}, te está pagando de menos cada extra.`,
    },
    {
      q: '¿Qué cambia con el salario integral?',
      a: `Tres cosas. La base de cotización a seguridad social baja al ${pct(INTEGRAL.ibcFactor)} del salario. Desaparecen prima, cesantías e intereses, porque van adentro del factor prestacional del ${pct(INTEGRAL.factorPrestacional)}. Y las vacaciones se siguen causando: ${PRESTACIONES.vacacionesDiasHabiles} días hábiles al año que se pagan aparte. Lo que no cambia es que nunca hay exoneración: el mínimo legal del integral es ${INTEGRAL.minimoSmlmv} SMLMV (${cop(INTEGRAL.minimoSmlmv * SMLMV)}), muy por encima del tope de ${APORTES.exoneracionSmlmvTope} SMLMV.`,
    },
    {
      q: '¿Cuánto cuesta despedir a alguien sin justa causa?',
      a: `En contrato a término indefinido, la tabla del art. 64 del CST: si gana menos de 10 SMLMV, ${INDEMNIZACION.menos10Smlmv.diasPrimerAnio} días de salario por el primer año y ${INDEMNIZACION.menos10Smlmv.diasPorAnioAdicional} por cada año siguiente (proporcional por fracción); si gana 10 SMLMV o más, ${INDEMNIZACION.desde10Smlmv.diasPrimerAnio} días el primer año y ${INDEMNIZACION.desde10Smlmv.diasPorAnioAdicional} por cada año adicional. A eso se suman las prestaciones que le debas: la indemnización es la sanción, la liquidación se paga igual. En contrato a término fijo la cuenta es otra: los salarios del tiempo que faltaba.`,
    },
    {
      q: '¿Qué es el FIC y por qué me lo cobran aparte?',
      a: `El Fondo de la Industria de la Construcción es un aporte del ${pct(FIC_CONSTRUCCION)} sobre la nómina mensual de los trabajadores de obra, a cargo de los empleadores de la industria de la construcción y administrado por el SENA (Ley 21/1982, art. 6). Es adicional al 2% ordinario del SENA, financia la formación de personal para el sector y no lo cubre la exoneración del art. 114-1. Si tu empresa no es de construcción, no aplica.`,
    },
    {
      q: '¿Cuáles son las tarifas de aportes ARL por nivel de riesgo, clase I a V?',
      a: `Cinco tarifas fijas sobre el salario, según la clase de riesgo de la actividad (Decreto 1772/1994 y Decreto 1607/2002): clase I, riesgo mínimo, ${pct(APORTES.arl.I)} (oficinas, bancos, educación); clase II, riesgo bajo, ${pct(APORTES.arl.II)} (comercio, hoteles, transporte de pasajeros); clase III, riesgo medio, ${pct(APORTES.arl.III)} (construcción liviana, gastronomía, textiles); clase IV, riesgo alto, ${pct(APORTES.arl.IV)} (manufactura pesada, metalmecánica, química); y clase V, riesgo máximo, ${pct(APORTES.arl.V)} (minería, explosivos, trabajo en alturas). La clase la define el CIIU de la actividad, no el cargo: minería cuesta más de 13 veces lo que una oficina a igual salario.`,
    },
    {
      q: '¿Quién paga los aportes ARL: el empleador o el empleado?',
      a: `El empleador, siempre y al 100% (Decreto-Ley 1295 de 1994, art. 16). A diferencia de salud y pensión, donde el trabajador aporta 4% + 4%, por riesgos laborales al empleado no se le descuenta nada: si en el desprendible aparece un descuento por ARL, es un error reclamable. Ejemplo con las tarifas vigentes: un salario de $2.500.000 en clase III (${pct(APORTES.arl.III)}) le cuesta al empleador ${cop(2500000 * APORTES.arl.III)} por mes, y el mismo salario en clase V (${pct(APORTES.arl.V)}) sube a ${cop(2500000 * APORTES.arl.V)}. El aporte se paga junto con salud y pensión a través de la PILA.`,
    },
    {
      q: '¿Hay tope para los aportes?',
      a: `Sí, pero sólo para la seguridad social: el ingreso base de cotización se topa en ${APORTES.ibcTopeSmlmv} SMLMV, hoy ${cop(APORTES.ibcTopeSmlmv * SMLMV)}. Salud, pensión y ARL se calculan hasta ahí y no más. Los parafiscales y las prestaciones sociales no tienen tope: se liquidan sobre el salario completo por alto que sea. Por eso, en sueldos muy altos, el factor de costo baja un poco: una parte de la carga deja de crecer.`,
    },
    {
      q: '¿Qué pasa si provisiono mal y me agarra el pago de la prima?',
      a: 'Que la prima de junio o de diciembre te pega toda junta contra la caja de ese mes. La provisión mensual —alrededor del 21,8% del sueldo— no es plata que se gasta: es plata que se aparta porque ya la debés. Las cesantías se consignan al fondo antes del 14 de febrero y no consignarlas dispara una sanción de un día de salario por cada día de retraso, que en pocos meses supera el valor de la propia cesantía.',
    },
  ],

  sources: [
    {
      name: 'Estatuto Tributario, art. 114-1 — exoneración de aportes parafiscales y de salud',
      url: 'https://estatuto.co/114-1',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Código Sustantivo del Trabajo, art. 64 — indemnización por terminación sin justa causa',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo_pr002.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Código Sustantivo del Trabajo, art. 132 — salario integral',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo_pr004.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 2101 de 2021 — reducción de la jornada laboral a 42 horas semanales',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/30044443',
      publisher: 'SUIN-Juriscol',
      date: '2021-07-15',
    },
    {
      name: 'Ley 21 de 1982 — aportes al SENA, ICBF y cajas de compensación (incluye el FIC, art. 6)',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/1626225',
      publisher: 'SUIN-Juriscol',
    },
    {
      name: 'Decreto 1772 de 1994 — tarifas de cotización al Sistema de Riesgos Laborales',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Decretos/1355749',
      publisher: 'SUIN-Juriscol',
    },
    {
      name: 'MinTrabajo — salario mínimo y auxilio de transporte vigentes',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
    },
    {
      name: 'Ley 52 de 1975 — intereses anuales del 12% sobre las cesantías',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/1618180',
      publisher: 'SUIN-Juriscol',
    },
  ],

  replaces: [
    '/co/calculadora-costo-total-empleado-empleador-colombia-2026',
    '/co/calculadora-costo-hora-empleado-empresa-colombia-2026',
    '/co/calculadora-provision-prestaciones-sociales-mensual-empleador-colombia-2026',
    '/co/calculadora-pcs-prestaciones-sociales-colombia-percent-salario',
    '/co/calculadora-aportes-arl-colombia-empleador-empleado-riesgo',
    '/co/calculadora-aporte-caja-compensacion-colombia-2026-subsidio-familiar',
    '/co/calculadora-aporte-fic-fomento-investigacion-cientifica-colombia',
    '/co/calculadora-costo-despido-empleador-colombia-2026',
  ],

  lastReviewed: '2026-08-07',
};
