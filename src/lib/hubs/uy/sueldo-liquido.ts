import type { HubData } from '../types';
import { URUGUAY_2026 } from '../../data/uruguay-2026';

/**
 * Hub de decisión UY — "De mi sueldo nominal, ¿cuánto me queda en mano?"
 *
 * Fuente única de constantes: src/lib/data/uruguay-2026.ts (la misma tabla maestra
 * que usan las fórmulas vivas). Nada hardcodeado de memoria acá.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const BPC = URUGUAY_2026.bpc;
export const SMN = URUGUAY_2026.smn.mensualJulio;
export const SMN_ENERO = URUGUAY_2026.smn.mensualEnero;
export const DIV_JORNAL = URUGUAY_2026.smn.divisorJornal;
export const DIV_HORA = URUGUAY_2026.smn.divisorHora;

/** Escala mensual del IRPF Cat. II en BPC. `Infinity` no sobrevive a define:vars → null. */
export const IRPF_FRANJAS = URUGUAY_2026.irpf.franjas.map((f) => ({
  hastaBpc: Number.isFinite(f.hastaBpc) ? f.hastaBpc : null,
  tasa: f.tasa,
}));

export const IRPF_DEDUCCION = URUGUAY_2026.irpf.deduccion;
export const IRPF_MNI_BPC = URUGUAY_2026.irpf.minimoNoImponibleBpc;

/** Tasas FONASA personales oficiales (BPS): 3 / 5 % hasta 2,5 BPC y 4,5 / 6 / 6,5 / 8 % arriba. */
export const FONASA = URUGUAY_2026.bps.fonasa;
export const MONTEPIO = URUGUAY_2026.bps.montepio;
export const FRL = URUGUAY_2026.bps.frl;
export const PATRONAL = URUGUAY_2026.bps.patronal;
export const HORA_EXTRA = URUGUAY_2026.laboral.horaExtra;
export const JORNADA_SEMANAL = URUGUAY_2026.laboral.jornadaSemanalHoras;

const uyu = (n: number) => '$U ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'uy/trabajo/sueldo-liquido',
  title: 'Sueldo líquido en Uruguay: del nominal a lo que cobrás en mano',
  description:
    'Calculá tu sueldo líquido en Uruguay con los aportes BPS reales (montepío 15%, FONASA 3–8%, FRL 0,1%) y el IRPF por franjas en BPC. Incluye jornal, valor hora, horas extra y el costo total para el empleador.',
  silo: 'Trabajo',
  siloHref: '/uy/trabajo',
  locale: 'uy',

  eyebrow: 'Uruguay · BPS · DGI',
  h1: 'De tu sueldo nominal, ¿cuánto te queda realmente en mano?',
  lede:
    'El nominal del contrato no es lo que cobrás. Entre el montepío jubilatorio, el FONASA que cambia según tu familia a cargo, el FRL y el IRPF por franjas en BPC, el descuento va del 18% a más del 35%. Esta cuenta arma tu recibo entero, línea por línea, y también te dice cuánto vale tu hora y cuánto le cuesta tu puesto al empleador.',
  stamps: [
    `BPC vigente: ${uyu(BPC)}`,
    `Salario mínimo nacional: ${uyu(SMN)}`,
    'Escala IRPF Cat. II · aportes BPS · 11 calculadoras adentro',
  ],

  resultLabel: 'Sueldo líquido mensual',

  cases: {
    title: '¿Cómo cobrás?',
    intro:
      'Los aportes son los mismos para casi todos, pero cambia la base sobre la que se calculan y quién paga qué. Partimos del caso más frecuente: mensual en relación de dependencia.',
    items: [
      {
        id: 'mensual',
        label: 'Cobro un sueldo mensual en relación de dependencia',
        hint: 'Industria y Comercio · aportes personales BPS + IRPF',
        answer: 'Te descuentan montepío 15%, FONASA según tu familia a cargo, FRL 0,1% y el IRPF que salga de la escala.',
        yes: [
          'Montepío jubilatorio: 15% del nominal, sin excepciones',
          `FONASA: 3% o 5% si tu nominal no pasa las ${FONASA.umbralBpc} BPC (${uyu(FONASA.umbralBpc * BPC)}); 4,5%, 6%, 6,5% u 8% si las pasa, según cónyuge e hijos a cargo`,
          'Fondo de Reconversión Laboral (FRL): 0,1%',
          `IRPF Cat. II por franjas en BPC, con mínimo no imponible de ${IRPF_MNI_BPC} BPC (${uyu(IRPF_MNI_BPC * BPC)}/mes)`,
          'Los aportes BPS se computan como deducción del IRPF: generan un crédito, no bajan la base',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El IRPF de Uruguay no resta las deducciones de la base: las convierte en un crédito al 14% (nominal por debajo de 15 BPC) o al 8% (de ahí para arriba). Por eso una deducción grande mueve menos de lo que uno espera',
          'El cónyuge sólo suma a la tasa FONASA si no tiene cobertura SNIS propia',
        ],
        plazo: 'la retención se ajusta en la declaración anual de junio: si te retuvieron de más, te lo devuelven.',
      },
      {
        id: 'jornalero',
        label: 'Cobro por jornal o por hora',
        hint: 'Jornal = mensual ÷ 25 · hora = mensual ÷ 200',
        answer: 'El jornal se convierte a mensual multiplicando por 25, y sobre ese equivalente corren los mismos aportes.',
        yes: [
          `Convención del decreto de salario mínimo: jornal = mensual ÷ ${DIV_JORNAL}, hora = mensual ÷ ${DIV_HORA}`,
          'Los aportes personales y el IRPF se calculan sobre lo efectivamente percibido en el mes',
          `Hora extra en día hábil: +${Math.round(HORA_EXTRA.diaHabil * 100)}% (vale el doble). En feriado o día de descanso: +${Math.round(HORA_EXTRA.feriadoODescanso * 100)}%`,
          `Tope legal de ${HORA_EXTRA.topeSemanal} horas extra por semana`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Si trabajás menos jornadas, el IRPF del mes baja pero la escala no se prorratea: se mira lo percibido en ese mes',
          'Para el valor hora efectivo conviene usar tu jornada real (44 h en Comercio, 48 h en Industria), no el divisor 200 del decreto, que es una convención de mínimos',
        ],
        plazo: 'los recibos tienen que discriminar jornadas, horas extra y el recargo aplicado.',
      },
      {
        id: 'domestico',
        label: 'Es un empleo doméstico (Grupo 21)',
        hint: 'Mismos aportes que Industria y Comercio',
        answer: 'El servicio doméstico aporta igual que cualquier dependiente: no hay régimen reducido.',
        yes: [
          'Aportes personales idénticos: montepío 15% + FONASA + FRL 0,1%',
          `Aportes patronales a cargo de quien contrata: jubilatorio ${(PATRONAL.jubilatorio * 100).toLocaleString('de-DE')}% + FONASA ${(PATRONAL.fonasa * 100).toLocaleString('de-DE')}% + FRL ${(PATRONAL.frl * 100).toLocaleString('de-DE')}%`,
          'Derecho pleno a aguinaldo, licencia, salario vacacional e indemnización por despido',
          'El mínimo del sector lo fija el laudo del Grupo 21 y suele estar por encima del salario mínimo nacional',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La relación tiene que estar registrada en BPS desde el primer día: sin registro no hay cobertura de salud ni aportes jubilatorios',
          'El laudo del Grupo 21 se actualiza por consejo de salarios: verificá el mínimo vigente antes de fijar el sueldo',
        ],
        plazo: 'el alta en BPS se hace antes del inicio de la relación laboral.',
      },
      {
        id: 'empleador',
        label: 'Soy el empleador: quiero saber cuánto me cuesta el puesto',
        hint: 'Nominal + patronales + provisiones',
        answer: 'Sobre el nominal sumás los aportes patronales y las provisiones de aguinaldo y licencia: el costo real ronda un 25% más.',
        yes: [
          `Aportes patronales: jubilatorio ${(PATRONAL.jubilatorio * 100).toLocaleString('de-DE')}%, FONASA ${(PATRONAL.fonasa * 100).toLocaleString('de-DE')}% y FRL ${(PATRONAL.frl * 100).toLocaleString('de-DE')}% sobre el nominal`,
          'Provisión de aguinaldo: 1/12 del nominal por mes',
          'Provisión de licencia y salario vacacional: aproximadamente otro 1/12',
          'Lo que se le descuenta al trabajador NO es costo extra tuyo: sale del mismo nominal',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Las tasas patronales son las de Industria y Comercio: varían por sector, convenio y régimen (rural, construcción)',
          'No incluye la prima del seguro de accidentes de trabajo del BSE, que depende de la tarifa de riesgo del rubro',
          'Tampoco incluye la indemnización por despido, que es un pasivo que se acumula con la antigüedad',
        ],
        plazo: 'los aportes se declaran y pagan a BPS en la nómina del mes siguiente.',
      },
    ],
  },

  inputsTitle: 'Tus datos del recibo',
  inputsIntro:
    'Todo en pesos uruguayos y en valores mensuales. Si cobrás por jornal, poné el jornal y elegí el caso correspondiente.',
  fields: [
    {
      id: 'nominal',
      label: 'Sueldo nominal mensual ($U)',
      prefix: '$U',
      value: '60.000',
      thousands: true,
      help: 'El bruto del contrato, antes de cualquier descuento. Si cobrás por jornal, poné el jornal diario.',
    },
    {
      id: 'conyuge',
      label: '¿Cónyuge o concubino a cargo?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí, sin cobertura SNIS propia' },
      ],
      help: 'Sólo computa si no tiene cobertura de salud propia. Sube la tasa FONASA.',
    },
    {
      id: 'hijos',
      label: 'Hijos menores a cargo',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: `Suben la tasa FONASA y suman deducción de IRPF: ${IRPF_DEDUCCION.hijoMenorBpcAnual} BPC al año por hijo.`,
    },
    {
      id: 'jornada',
      label: 'Jornada semanal (horas)',
      type: 'number',
      value: JORNADA_SEMANAL,
      min: 1,
      max: 48,
      step: 1,
      help: 'Comercio 44 h, Industria 48 h. Define el valor de tu hora y de la hora extra.',
    },
    {
      id: 'horasExtra',
      label: 'Horas extra en el mes (día hábil)',
      type: 'number',
      value: 0,
      min: 0,
      max: 60,
      step: 1,
      help: `Se pagan con recargo del ${Math.round(HORA_EXTRA.diaHabil * 100)}%. Tope legal: ${HORA_EXTRA.topeSemanal} por semana.`,
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'Qué pasa con cada peso del nominal',
    caption:
      'Compara lo que efectivamente te queda en mano contra lo que se va en aportes a BPS y en IRPF. En el caso del empleador muestra además lo que él pone por encima del nominal.',
  },
  breakdownTitle: 'Tu recibo, línea por línea',
  breakdownIntro:
    'El mismo orden del recibo de sueldo: nominal, cada aporte con su tasa, el IRPF con su crédito por deducciones y el líquido.',

  faq: [
    {
      q: '¿Cuánto me descuentan del sueldo en Uruguay?',
      a: `El piso es 18,1%: montepío jubilatorio 15% + FONASA 3% + FRL 0,1%. A partir de ahí sube por dos vías. La primera es el FONASA: si tu nominal pasa las ${FONASA.umbralBpc} BPC (${uyu(FONASA.umbralBpc * BPC)}) la tasa base salta a 4,5%, y con cónyuge e hijos a cargo puede llegar al 8%. La segunda es el IRPF, que arranca recién por encima de las ${IRPF_MNI_BPC} BPC (${uyu(IRPF_MNI_BPC * BPC)}) y es progresivo. Entre las dos cosas, un sueldo alto puede ver descuentos de más del 35%.`,
    },
    {
      q: '¿Desde qué sueldo se empieza a pagar IRPF?',
      a: `El mínimo no imponible es de ${IRPF_MNI_BPC} BPC mensuales, o sea ${uyu(IRPF_MNI_BPC * BPC)} de nominal. Debajo de eso la escala da cero. Pero ojo: por encima del mínimo el impuesto no se come el sueldo de golpe, porque el crédito por deducciones —que incluye tus propios aportes BPS— se descuenta del impuesto. En la práctica, el IRPF efectivo recién se hace visible bastante por encima del mínimo.`,
    },
    {
      q: '¿Cuáles son las franjas del IRPF y sus tasas?',
      a: `Ocho tramos, todos medidos en BPC mensuales: 0% hasta 7 BPC; 10% de 7 a 10; 15% de 10 a 15; 24% de 15 a 30; 25% de 30 a 50; 27% de 50 a 75; 31% de 75 a 115; y 36% de 115 BPC en adelante. Cada tasa se aplica sólo a la porción del sueldo que cae en ese tramo, nunca a todo el sueldo. Con la BPC vigente en ${uyu(BPC)}, el primer tramo gravado empieza en ${uyu(7 * BPC)}.`,
    },
    {
      q: '¿Por qué mis deducciones no bajan la base del impuesto?',
      a: `Porque en Uruguay el IRPF no funciona restando deducciones de la renta, como en otros países. Funciona al revés: se calcula el impuesto primario sobre el nominal completo y después se resta un crédito equivalente a un porcentaje de tus deducciones. Ese porcentaje es del ${(IRPF_DEDUCCION.tasaBaja * 100).toLocaleString('de-DE')}% si tu nominal está por debajo de ${IRPF_DEDUCCION.umbralBpc} BPC (${uyu(IRPF_DEDUCCION.umbralBpc * BPC)}) y del ${(IRPF_DEDUCCION.tasaAlta * 100).toLocaleString('de-DE')}% si lo supera. Es decir: los sueldos altos aprovechan la mitad de la deducción que los sueldos medios.`,
    },
    {
      q: '¿Qué es el FONASA y por qué a algunos les descuentan más?',
      a: `Es el aporte al Fondo Nacional de Salud, que te paga la cuota mutual. La tasa depende de dos cosas. Primero, del nivel salarial: la base de cálculo son ${FONASA.umbralBpc} BPC (${uyu(FONASA.umbralBpc * BPC)}); por debajo la tasa base es del 3% y por encima del 4,5%. Segundo, de tu familia a cargo: sumás por hijos menores y sumás por cónyuge o concubino sin cobertura propia. Las combinaciones oficiales dan 3%, 4,5%, 5%, 6%, 6,5% u 8%. Pagás más porque también estás cubriendo a más gente.`,
    },
    {
      q: 'Si me descuentan mucho FONASA, ¿me devuelven algo?',
      a: 'Sí, existe la devolución FONASA. Cuando lo que aportaste en el año supera el tope de aportes de salud —que se calcula sobre el Costo Promedio Equivalente por cada beneficiario del hogar— el excedente se te reintegra. Es plata que sale de tus propios aportes, no un beneficio adicional, y la cobran sobre todo los sueldos altos con pocos beneficiarios a cargo.',
    },
    {
      q: '¿Cuánto vale mi hora de trabajo?',
      a: `Hay dos formas y conviene no mezclarlas. La convención legal del salario mínimo divide el mensual por ${DIV_HORA} para la hora y por ${DIV_JORNAL} para el jornal. La forma que refleja tu jornada real es dividir el mensual por las horas efectivas del mes, que son la jornada semanal por 52 y dividido 12: con 44 horas semanales eso da 190,67 horas al mes. Para calcular horas extra se usa esta segunda, porque es la que corresponde a tu régimen.`,
    },
    {
      q: '¿Cómo se pagan las horas extra?',
      a: `En día hábil, con un recargo del ${Math.round(HORA_EXTRA.diaHabil * 100)}%: la hora extra vale el doble de la hora simple. En feriado no laborable o en día de descanso semanal el recargo es del ${Math.round(HORA_EXTRA.feriadoODescanso * 100)}%, o sea dos veces y media. El tope legal es de ${HORA_EXTRA.topeSemanal} horas extra por semana. Las horas extra son remuneración común: aportan a BPS y pagan IRPF como el resto del sueldo, y también engordan el aguinaldo.`,
    },
    {
      q: '¿Cuál es el salario mínimo nacional y cómo se prorratea?',
      a: `El salario mínimo nacional se fija por decreto y en el año en curso tiene dos tramos: ${uyu(SMN_ENERO)} desde enero y ${uyu(SMN)} desde julio. El mismo decreto define el jornal mínimo como el mensual dividido ${DIV_JORNAL} y la hora como el mensual dividido ${DIV_HORA}. Si trabajás jornada reducida, el mínimo se prorratea en proporción a tus horas. Ojo: muchos sectores tienen laudos de consejo de salarios por encima del mínimo nacional, y ese laudo manda.`,
    },
    {
      q: '¿Cuánto le cuesta realmente a la empresa mi sueldo?',
      a: `Bastante más que el nominal. Sobre el nominal el empleador paga aportes patronales del ${((PATRONAL.jubilatorio + PATRONAL.fonasa + PATRONAL.frl) * 100).toLocaleString('de-DE')}% (jubilatorio, FONASA y FRL), y además tiene que provisionar el aguinaldo, que es un doceavo del salario, y la licencia con su salario vacacional, que es aproximadamente otro doceavo. Sumado da alrededor de un 25% por encima del nominal, sin contar el seguro de accidentes del BSE ni la indemnización por despido que se va acumulando.`,
    },
    {
      q: 'El servicio doméstico, ¿aporta distinto?',
      a: 'No. El Grupo 21 aporta exactamente igual que Industria y Comercio: el trabajador con montepío 15%, FONASA y FRL, y quien contrata con las tasas patronales. Tampoco cambian los derechos: aguinaldo, licencia, salario vacacional e indemnización por despido corresponden igual. Lo único propio del sector es el salario mínimo, que lo fija el laudo del grupo y suele estar por encima del mínimo nacional.',
    },
    {
      q: '¿Puedo llegar del líquido al nominal, al revés?',
      a: 'Sí, pero no se puede hacer con una regla de tres. La relación entre nominal y líquido no es lineal, porque el IRPF es progresivo y la tasa FONASA salta al cruzar el umbral de las 2,5 BPC. La forma correcta es probar nominales hasta que el líquido dé el objetivo, que es exactamente lo que hace esta cuenta cuando cambiás el nominal y mirás el resultado.',
    },
  ],

  sources: [
    {
      name: 'BPS — Aportes personales y patronales de Industria y Comercio',
      url: 'https://www.bps.gub.uy/',
      publisher: 'Banco de Previsión Social',
    },
    {
      name: 'DGI — IRPF Categoría II: escala, mínimo no imponible y deducciones',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
    {
      name: 'Decreto N° 319/025 — Salario mínimo nacional',
      url: 'https://www.impo.com.uy/',
      publisher: 'IMPO — Centro de Información Oficial',
      date: '2025-12-26',
    },
    {
      name: 'Decreto N° 11/026 — Valor de la Base de Prestaciones y Contribuciones (BPC)',
      url: 'https://www.impo.com.uy/',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'Ley N° 15.996 y Decreto 550/989 — Horas extra',
      url: 'https://www.impo.com.uy/bases/leyes/15996-1988',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'MTSS — Ministerio de Trabajo y Seguridad Social',
      url: 'https://www.gub.uy/ministerio-trabajo-seguridad-social/',
      publisher: 'MTSS',
    },
  ],

  replaces: [
    '/uy/salario-liquido-uruguay',
    '/uy/sueldo-nominal-a-liquido-uruguay',
    '/uy/calculadora-irpf-uruguay',
    '/uy/calculadora-fonasa-aporte-uruguay',
    '/uy/calculadora-bps-aportes',
    '/uy/calculadora-salario-por-hora-uruguay',
    '/uy/calculadora-salario-minimo-uruguay',
    '/uy/calculadora-jornal-uruguay',
    '/uy/calculadora-horas-extra-uruguay',
    '/uy/costo-empleador-uruguay',
    '/uy/calculadora-aportes-empleada-domestica-uruguay',
    '/uy/calculadora-irpf-anual-devolucion-uruguay',
  ],

  lastReviewed: '2026-07-28',
};
