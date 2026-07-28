import type { HubData } from '../types';
import { ECUADOR_2026, CANASTA_INEC_2026, COSTO_VIDA_EC_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "¿Cuánto me queda del sueldo y cuánto le cuesta a la empresa?"
 *
 * Constantes: src/lib/data/ecuador-2026.ts (SBU, IESS personal/patronal, fondos de reserva)
 * y CANASTA_INEC_2026 para el salario digno.
 * Cálculo espejado de las fórmulas vivas sueldo-neto-ecuador.ts, aporte-iess-ecuador.ts,
 * rol-de-pagos-ecuador.ts, costo-laboral-total-empleador-ecuador.ts, salario-digno-ecuador.ts,
 * horas-extra-suplementarias-ecuador.ts y recargo-nocturno-ecuador.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LAB =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const SBU = ECUADOR_2026.sbu;
export const IESS_PERSONAL = ECUADOR_2026.iessPersonal;
export const IESS_PATRONAL = ECUADOR_2026.iessPatronal;
export const FONDOS_RESERVA = ECUADOR_2026.fondosReserva;
/** Horas mes de referencia del Ministerio del Trabajo para llevar el sueldo a valor hora. */
export const HORAS_MES = 240;
/** Recargos del Código del Trabajo: suplementarias +50% (art. 55), extraordinarias +100% (art. 55), nocturna +25% (art. 49). */
export const RECARGO_SUPLEMENTARIA = 0.5;
export const RECARGO_EXTRAORDINARIA = 1.0;
export const RECARGO_NOCTURNO = 0.25;
/** Salario digno: canasta básica familiar del INEC ÷ perceptores del hogar tipo. */
export const CANASTA_BASICA = CANASTA_INEC_2026.basicaFamiliar;
export const PERCEPTORES = COSTO_VIDA_EC_2026.perceptores;

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/trabajo/sueldo-neto',
  title: 'Sueldo neto en Ecuador: cuánto te queda y cuánto le cuesta a la empresa',
  description:
    'Calcula tu sueldo neto en Ecuador con el aporte personal al IESS del 9,45%, suma horas suplementarias, extraordinarias y recargo nocturno, y mira del otro lado el costo laboral total del empleador con aporte patronal, décimos, vacaciones y fondos de reserva.',
  silo: 'Trabajo',
  siloHref: '/ec/trabajo',
  locale: 'ec',

  eyebrow: 'Ecuador · rol de pagos · Código del Trabajo',
  h1: 'Tu sueldo en Ecuador: lo que te descuentan, lo que te queda y lo que cuesta.',
  lede:
    'El rol de pagos tiene dos columnas y un lado que casi nunca se ve. De un lado, lo que te descuentan: el 9,45% del aporte personal al IESS. Del otro, lo que la empresa paga por encima de tu sueldo y no aparece en tu rol: el 11,15% patronal, los décimos, las vacaciones y los fondos de reserva. Y en el medio, las horas que trabajaste de más y que la ley paga con recargo.',
  stamps: [
    `SBU ${usd(SBU)} · dolarizado (USD)`,
    'IESS 9,45% personal · 11,15% patronal',
    '7 calculadoras adentro',
  ],

  resultLabel: 'Sueldo neto mensual',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'El sueldo pactado es el mismo, pero lo que llega a tu cuenta cambia según las horas que trabajaste de más, el horario en que las trabajaste y desde qué lado de la mesa estés mirando. Partimos del caso más frecuente.',
    items: [
      {
        id: 'base',
        label: 'Sueldo mensual normal',
        hint: 'Solo el aporte personal al IESS · 9,45%',
        answer:
          'En relación de dependencia solo se descuenta el 9,45% del aporte personal al IESS: tu neto es el 90,55% de la remuneración.',
        yes: [
          'Aporte personal al IESS del 9,45% sobre la materia gravada',
          'Comisiones y bonos remunerativos entran en la materia gravada y por eso también aportan',
          'Los décimos tercero y cuarto NO aportan al IESS y no se descuentan',
          'El aporte patronal del 11,15% lo paga la empresa: no sale de tu bolsillo',
        ],
        warn: [
          DISCLAIMER_LAB,
          'El impuesto a la renta solo se retiene si tu ingreso anual proyectado supera la fracción básica desgravada; por eso aparece como un campo aparte y no como un descuento automático',
          'Si el empleador te descuenta el 11,15% patronal está trasladándote un costo que por ley es suyo',
        ],
        plazo:
          'la planilla del IESS se paga hasta el día 15 del mes siguiente; desde el 16 el empleador entra en mora patronal.',
      },
      {
        id: 'extras',
        label: 'Trabajé horas de más',
        hint: 'Suplementarias +50% · extraordinarias +100%',
        answer:
          'Las horas suplementarias se pagan con recargo del 50% y las extraordinarias con recargo del 100% sobre el valor de tu hora ordinaria.',
        yes: [
          'Horas suplementarias: las que van más allá de la jornada y hasta las 24:00, con recargo del 50% (art. 55)',
          'Horas extraordinarias: las trabajadas después de las 24:00, y las de sábados, domingos y feriados, con recargo del 100%',
          'Tope legal: hasta 4 horas suplementarias al día y 12 a la semana',
          'El valor hora sale de dividir el sueldo mensual entre 240 (método del Ministerio del Trabajo)',
        ],
        warn: [
          DISCLAIMER_LAB,
          'Las horas extra son materia gravada: aportan al IESS y entran en la base del décimo tercero',
          'El pago de horas extra no puede reemplazarse por días de descanso compensatorio sin acuerdo, y no corresponde a quien ejerce funciones de dirección o confianza',
        ],
        plazo:
          'las horas suplementarias y extraordinarias se pagan con el rol del mes en que se trabajaron, no en cuotas ni a fin de año.',
      },
      {
        id: 'nocturno',
        label: 'Trabajo de noche',
        hint: 'Jornada nocturna · recargo 25%',
        answer:
          'Cada hora trabajada entre las 19:00 y las 06:00 se paga con un recargo del 25% sobre la hora ordinaria.',
        yes: [
          'Recargo del 25% sobre el valor de la hora ordinaria (art. 49)',
          'La jornada nocturna dura lo mismo que la diurna: no se acorta, se paga más',
          'Si además superás la jornada, el recargo nocturno y el suplementario se calculan por separado',
          'Aplica a la jornada nocturna habitual, no solo a las horas sueltas',
        ],
        warn: [
          DISCLAIMER_LAB,
          'El recargo nocturno del 25% no se confunde con el recargo del 100% de las horas extraordinarias posteriores a las 24:00: son conceptos distintos y pueden coexistir',
          'Si tu contrato ya fija una remuneración “por trabajo nocturno”, revisa que el valor hora resultante no quede por debajo de la hora ordinaria más el 25%',
        ],
        plazo: 'se liquida mes a mes en el rol de pagos, junto con las horas suplementarias.',
      },
      {
        id: 'empleador',
        label: 'Soy el empleador y quiero el costo total',
        hint: 'Sueldo + patronal + provisiones',
        answer:
          'El costo real de un trabajador ronda un 27% por encima del sueldo pactado en el primer año, y más del 35% desde el segundo.',
        yes: [
          'Aporte patronal al IESS del 11,15% sobre la materia gravada',
          'Provisión del décimo tercero: un doceavo de la remuneración por mes',
          `Provisión del décimo cuarto: un SBU al año, ${usd(SBU / 12)} por mes`,
          'Provisión de vacaciones: un veinticuatroavo por mes (15 días al año)',
          'Fondos de reserva del 8,33% a partir del mes 13 con el mismo empleador',
        ],
        warn: [
          DISCLAIMER_LAB,
          'La cuenta no incluye el 15% de utilidades, que se reparte solo si la empresa tuvo utilidades en el ejercicio',
          'Tampoco incluye el costo de un eventual cese (indemnización, desahucio) ni la jubilación patronal, que se provisiona desde los primeros años y golpea a los 25',
        ],
        plazo:
          'la planilla del IESS vence el día 15 del mes siguiente; el décimo tercero se paga hasta el 24 de diciembre y el décimo cuarto hasta el 15 de marzo o el 15 de agosto según la región.',
      },
      {
        id: 'digno',
        label: '¿Alcanzo el salario digno?',
        hint: 'Canasta básica ÷ perceptores del hogar',
        answer: `El salario digno mensual es la canasta básica familiar del INEC dividida entre 1,6 perceptores: ${usd(CANASTA_BASICA / 1.6)} con la canasta vigente.`,
        yes: [
          'Se compara el ingreso anual completo, no solo el sueldo: se suman décimos, fondos de reserva y utilidades recibidas',
          `Referencia: canasta básica familiar del INEC de ${usd(CANASTA_BASICA)} (${CANASTA_INEC_2026.mesReferencia}) para un hogar de cuatro personas`,
          'Perceptores del hogar tipo: 1,6, según la metodología del INEC',
          'Si la empresa tuvo utilidades y el trabajador no llegó al salario digno, puede corresponder la compensación económica',
        ],
        warn: [
          DISCLAIMER_LAB,
          'El salario digno no es un piso exigible como el SBU: es un parámetro de comparación y la compensación solo procede cuando el empleador tuvo utilidades en el ejercicio',
          'La canasta básica la publica el INEC todos los meses: el resultado cambia con el dato más reciente',
        ],
        plazo:
          'la compensación por salario digno, cuando corresponde, se liquida junto con el reparto de utilidades, hasta el 15 de abril del año siguiente.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Todo en dólares y en valores mensuales. Ecuador está dolarizado: no hay conversión de moneda ni indexación por inflación en ninguno de estos cálculos.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo mensual (USD)',
      prefix: '$',
      value: '800',
      thousands: true,
      help: `La remuneración pactada en tu contrato, antes de descuentos. No puede ser menor a 1 SBU (${usd(SBU)}) a jornada completa.`,
    },
    {
      id: 'otros',
      label: 'Comisiones y bonos remunerativos del mes (USD)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Todo lo que sea materia gravada. No incluyas décimos ni viáticos sujetos a liquidación.',
    },
    {
      id: 'horasSupl',
      label: 'Horas suplementarias del mes',
      type: 'number',
      value: 0,
      min: 0,
      max: 60,
      step: 1,
      help: 'Las que van más allá de tu jornada y hasta las 24:00. Recargo del 50%. Tope legal: 4 por día y 12 por semana.',
    },
    {
      id: 'horasExtra',
      label: 'Horas extraordinarias del mes',
      type: 'number',
      value: 0,
      min: 0,
      max: 60,
      step: 1,
      help: 'Las trabajadas después de las 24:00, y las de sábados, domingos y feriados. Recargo del 100%.',
    },
    {
      id: 'horasNoct',
      label: 'Horas nocturnas del mes (19:00 a 06:00)',
      type: 'number',
      value: 0,
      min: 0,
      max: 200,
      step: 1,
      help: 'Solo el recargo del 25% del art. 49. Si esas horas además fueron suplementarias, cárgalas también arriba.',
    },
    {
      id: 'antiguedad',
      label: '¿Cuánto llevas con este empleador?',
      type: 'select',
      value: 'segundo',
      options: [
        { value: 'primero', label: 'Menos de un año' },
        { value: 'segundo', label: 'Un año o más' },
      ],
      help: 'Los fondos de reserva se generan a partir del mes 13 con el mismo empleador. Cambia el costo del lado del empleador.',
    },
    {
      id: 'descuentos',
      label: 'Otros descuentos del mes (USD)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Anticipos, préstamos quirografarios del IESS, retención de impuesto a la renta si tu empleador ya te la calcula.',
    },
  ],
  fineprint: DISCLAIMER_LAB,

  chart: {
    type: 'donut',
    title: 'Qué pasa con cada dólar',
    caption:
      'Compara lo que efectivamente llega a tu cuenta con lo que se va al IESS y a otros descuentos. En la rama del empleador, compara el sueldo con las cargas que la empresa paga por encima.',
  },
  breakdownTitle: 'Tu rol de pagos, línea por línea',
  breakdownIntro:
    'El mismo orden de un rol de pagos: ingresos, egresos, neto, y aparte lo que aporta y provisiona la empresa.',

  faq: [
    {
      q: '¿Cuánto me descuentan del sueldo en Ecuador?',
      a: 'Una sola cosa por ley: el aporte personal al IESS del 9,45% sobre la materia gravada (sueldo, horas extra, comisiones y bonos). Tu neto es el 90,55% de esa base. Todo lo demás que aparezca en la columna de egresos —anticipos, préstamos quirografarios, retención del impuesto a la renta— depende de tu caso particular, no es un descuento automático. El aporte patronal del 11,15% no se te descuenta: lo paga el empleador.',
    },
    {
      q: '¿Los décimos aportan al IESS?',
      a: 'No. El décimo tercero y el décimo cuarto no forman parte de la materia gravada, así que no se les descuenta el 9,45% ni generan aporte patronal. Tampoco pagan impuesto a la renta. Por eso, si cobras los décimos mensualizados, esa parte del rol llega íntegra a tu cuenta.',
    },
    {
      q: '¿Cómo se calcula el valor de mi hora de trabajo?',
      a: `Dividiendo el sueldo mensual entre ${HORAS_MES}, que es el método que usa el Ministerio del Trabajo (jornada de 8 horas proyectada al mes). Con un sueldo de ${usd(SBU)} la hora ordinaria vale ${usd(SBU / HORAS_MES)}. Ese valor hora es la base de todos los recargos: el 50% de las suplementarias, el 100% de las extraordinarias y el 25% del nocturno.`,
    },
    {
      q: '¿Qué diferencia hay entre horas suplementarias y extraordinarias?',
      a: 'El momento en que se trabajan. Las suplementarias son las que exceden la jornada y se hacen hasta las 24:00: se pagan con recargo del 50%. Las extraordinarias son las posteriores a las 24:00 y las de sábados, domingos y feriados: se pagan con recargo del 100%, es decir el doble de la hora ordinaria. El tope legal de las suplementarias es de 4 horas diarias y 12 semanales.',
    },
    {
      q: '¿El recargo nocturno se suma al de horas extra?',
      a: 'Son conceptos distintos y pueden convivir. El recargo nocturno del 25% (art. 49) remunera el horario, entre las 19:00 y las 06:00. El recargo de las horas suplementarias o extraordinarias remunera el exceso de jornada. Una hora trabajada a las 02:00 fuera de tu jornada es extraordinaria (recargo del 100%); una hora de tu jornada habitual trabajada a las 21:00 lleva el 25% nocturno.',
    },
    {
      q: '¿Cuánto le cuesta realmente a la empresa pagarme?',
      a: `Bastante más que el sueldo. Sobre la remuneración la empresa suma el 11,15% de aporte patronal y provisiona un doceavo del décimo tercero, un doceavo del décimo cuarto (${usd(SBU / 12)} al mes), un veinticuatroavo de vacaciones y, desde el mes 13, el 8,33% de fondos de reserva. Eso lleva el costo a alrededor de 1,27 veces el sueldo en el primer año y a más de 1,35 veces desde el segundo, sin contar utilidades ni el costo de un eventual cese.`,
    },
    {
      q: '¿El sueldo puede ser menor al Salario Básico Unificado?',
      a: `A jornada completa no: el SBU es un piso legal y en el año en curso es de ${usd(SBU)}. En jornada parcial la remuneración puede ser proporcional a las horas trabajadas, pero el valor hora nunca puede quedar por debajo del que resulta del SBU. La afiliación al IESS es obligatoria desde el primer día, sea jornada completa o parcial.`,
    },
    {
      q: '¿Qué es el salario digno y en qué se diferencia del SBU?',
      a: `El SBU es el piso salarial obligatorio de cada mes. El salario digno es un parámetro anual de comparación: la canasta básica familiar del INEC (${usd(CANASTA_BASICA)} en ${CANASTA_INEC_2026.mesReferencia}) dividida entre los 1,6 perceptores del hogar tipo, o sea unos ${usd(CANASTA_BASICA / 1.6)} al mes. Se compara contra el ingreso anual total del trabajador —sueldos, décimos, fondos de reserva y utilidades— y si la empresa tuvo utilidades y el trabajador quedó por debajo, puede corresponder una compensación.`,
    },
    {
      q: '¿Los fondos de reserva me suben el sueldo?',
      a: 'Si los cobras mensualizados, sí: aparecen en tu rol como un ingreso adicional del 8,33% de la remuneración, que es aproximadamente un sueldo más al año repartido en doce. Si en cambio pediste acumularlos en el IESS, no los ves en el rol: se depositan en tu cuenta individual y los retiras cuando quieras. En cualquiera de los dos casos el costo lo asume el empleador y solo se generan a partir del mes 13 con la misma empresa.',
    },
    {
      q: '¿La retención del impuesto a la renta se descuenta todos los meses?',
      a: 'Solo si tu ingreso anual proyectado supera la fracción básica desgravada. En ese caso el empleador calcula el impuesto del año entero, lo divide entre los meses que restan y lo retiene mes a mes. Los décimos no entran en esa base porque están exentos. Si tu proyección no llega a la fracción básica, la retención es cero aunque figures en el rol.',
    },
    {
      q: '¿Qué es la materia gravada y por qué importa tanto?',
      a: 'Es la base sobre la que se calculan los aportes al IESS: la remuneración de carácter normal, o sea sueldo, horas suplementarias y extraordinarias, comisiones y bonos remunerativos. No entran los décimos, los viáticos sujetos a liquidación, ni el reparto de utilidades. Importa porque de ella salen tanto tu descuento del 9,45% como el aporte patronal del 11,15% y la base de tu futura pensión.',
    },
    {
      q: '¿Puedo pedir que me paguen en otra moneda o ajustado por inflación?',
      a: 'No, y no hace falta. Ecuador está dolarizado desde el año 2000: el sueldo, los décimos, la pensión y la liquidación se pactan y se pagan en dólares de Estados Unidos. No existe indexación salarial automática por inflación; lo que se ajusta cada año es el SBU, que fija el Ministerio del Trabajo y arrastra al décimo cuarto y a la tabla de pensiones alimenticias.',
    },
  ],

  sources: [
    { name: 'Ministerio del Trabajo — Código del Trabajo (arts. 47, 49 y 55)', url: 'https://www.trabajo.gob.ec/', publisher: 'Ministerio del Trabajo del Ecuador' },
    { name: 'IESS — Aportes del afiliado en relación de dependencia', url: 'https://www.iess.gob.ec/', publisher: 'Instituto Ecuatoriano de Seguridad Social' },
    { name: 'Ministerio del Trabajo — Salario Básico Unificado vigente', url: 'https://www.trabajo.gob.ec/salario-basico-unificado/', publisher: 'Ministerio del Trabajo del Ecuador' },
    { name: 'INEC — Canastas analíticas básica y vital', url: 'https://www.ecuadorencifras.gob.ec/canasta/', publisher: 'Instituto Nacional de Estadística y Censos' },
    { name: 'SRI — Impuesto a la renta de personas naturales', url: 'https://www.sri.gob.ec/impuesto-renta', publisher: 'Servicio de Rentas Internas' },
  ],

  replaces: [
    '/ec/calculadora-sueldo-neto-ecuador',
    '/ec/calculadora-aporte-iess-ecuador',
    '/ec/calculadora-rol-de-pagos-ecuador',
    '/ec/calculadora-costo-laboral-total-empleador-ecuador',
    '/ec/calculadora-salario-digno-ecuador',
    '/ec/calculadora-horas-extra-suplementarias-ecuador',
    '/ec/calculadora-recargo-nocturno-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
