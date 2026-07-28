import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánto me queda en mano del sueldo?"
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts. Nada de memoria.
 *
 * Absorbe 10 calculadoras sueltas de /co/ más el hub raíz viejo
 * `/trabajo/sueldo-neto-colombia`, que cubría el mismo mercado desde el árbol AR.
 *
 * Diferencias deliberadas con las fórmulas viejas (ver reporte):
 *  - El FSP se liquida con la escala completa de la Ley 100 (1% a 2%), no con un
 *    1% plano: `salario-neto-colombia-2026-bruto-a-neto.ts` cobraba 1% incluso a
 *    17 SMLMV, donde la ley manda 1,4%.
 *  - El límite del art. 336 ET se mide sobre la renta líquida (ingreso menos
 *    aportes obligatorios), no sobre el salario bruto, y se le aplica también el
 *    tope de 1.340 UVT/año que la fórmula vieja ignoraba.
 *  - El valor hora usa el divisor vigente a la fecha (210 desde el 15-jul-2026),
 *    no el 220 hardcodeado de `salario-minimo-colombia-2026-auxilio-transporte.ts`.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const SMLMV = COLOMBIA_2026.smlmv;
export const SMDLV = COLOMBIA_2026.smdlv;
export const AUXILIO = COLOMBIA_2026.auxilioTransporte;
export const TOPE_AUXILIO_SMLMV = COLOMBIA_2026.topeAuxilioSmlmv;
export const UVT = COLOMBIA_2026.uvt;

/** Aportes del trabajador (Ley 100/1993): 4% salud + 4% pensión. */
export const APORTES = {
  salud: COLOMBIA_2026.aportes.saludEmpleado,
  pension: COLOMBIA_2026.aportes.pensionEmpleado,
  saludEmpleador: COLOMBIA_2026.aportes.saludEmpleador,
  pensionEmpleador: COLOMBIA_2026.aportes.pensionEmpleador,
  ibcTopeSmlmv: COLOMBIA_2026.aportes.ibcTopeSmlmv,
  ibcMinimoSmlmv: COLOMBIA_2026.aportes.ibcMinimoSmlmv,
};

/**
 * Fondo de Solidaridad Pensional — escala real sobre el IBC en SMLMV
 * (Ley 100 art. 27 · Decreto 1833/2016). `Infinity` no sobrevive a la
 * serialización de `define:vars` → viaja como null.
 */
export const FSP = COLOMBIA_2026.fsp.map((t) => ({
  desde: t.desdeSmlmv,
  hasta: Number.isFinite(t.hastaSmlmv) ? t.hastaSmlmv : null,
  tasa: t.tasa,
}));

/** Retención salarial mensual del art. 383 ET, en UVT. */
export const ART383 = COLOMBIA_2026.retefuenteArt383.map((t) => ({
  desde: t.desdeUvt,
  hasta: Number.isFinite(t.hastaUvt) ? t.hastaUvt : null,
  tasa: t.tasa,
  adicion: t.adicionUvt,
}));

/** Renta exenta laboral del art. 206-10 ET: 25% con tope de 790 UVT al año. */
export const EXENTA_LABORAL = COLOMBIA_2026.rentaExentaLaboral;

/** Límite global del art. 336 ET: 40% de la renta líquida y tope de 1.340 UVT/año. */
export const LIMITE_336 = { pct: 0.4, topeUvt: 1340 };

/** Salario integral (art. 132 CST): mínimo 13 SMLMV, IBC sobre el 70%. */
export const INTEGRAL = COLOMBIA_2026.salarioIntegral;

/** Aprendiz SENA (Ley 2466/2025 art. 21 + Decreto 0223/2026). */
export const APRENDIZ = COLOMBIA_2026.aprendizSena;

/** Embargabilidad del salario (CST arts. 154-156). */
export const EMBARGO = COLOMBIA_2026.embargo;

/** Jornada: el divisor del valor hora cambia el 15-jul-2026 (Ley 2101/2021). */
export const JORNADA = COLOMBIA_2026.jornada;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/trabajo/sueldo-neto',
  title: 'Sueldo neto en Colombia: cuánto te queda en mano después de descuentos',
  description:
    'Calculá cuánto te queda del sueldo en Colombia: salud 4%, pensión 4%, Fondo de Solidaridad Pensional con su escala real y retención en la fuente del art. 383 ET. Incluye auxilio de transporte, salario integral, aprendiz SENA y cuánto te pueden embargar.',
  silo: 'Trabajo',
  siloHref: '/co/trabajo',
  locale: 'co',

  eyebrow: 'Colombia · nómina y descuentos de ley',
  h1: '¿Cuánto me queda en mano del sueldo?',
  lede:
    'De tu salario salen siempre 4% de salud y 4% de pensión. Arriba de 4 salarios mínimos se suma el Fondo de Solidaridad, y si tu base depurada es alta aparece la retención en la fuente. Poné tu sueldo y mirá el desprendible completo, con el auxilio de transporte y el tope de lo que te pueden embargar.',
  stamps: [
    `SMLMV: ${cop(SMLMV)}`,
    `Auxilio de transporte: ${cop(AUXILIO)}`,
    `UVT: ${cop(UVT)}`,
    '10 calculadoras adentro',
  ],

  resultLabel: 'Lo que te queda en mano este mes',

  cases: {
    title: '¿Cómo te pagan?',
    intro:
      'Los aportes del 4% y 4% son iguales para casi todos, pero la base sobre la que se calculan y lo que se suma o se resta encima cambia mucho según tu modalidad de contrato. Arrancamos por el caso más frecuente.',
    items: [
      {
        id: 'ordinario',
        label: 'Salario ordinario con contrato laboral',
        hint: 'El caso típico · aportes sobre el salario completo',
        answer:
          'Sobre el salario se descuentan siempre 4% de salud y 4% de pensión; todo lo demás depende de cuánto ganes.',
        yes: [
          'Salud: 4% del salario, a cargo tuyo (el empleador pone otro 8,5%)',
          'Pensión: 4% del salario, a cargo tuyo (el empleador pone otro 12%)',
          `Fondo de Solidaridad Pensional si tu IBC pasa de ${FSP[0].desde} SMLMV (${cop(FSP[0].desde * SMLMV)}): arranca en 1% y sube por escalones hasta 2%`,
          'Retención en la fuente del art. 383 ET sobre la base depurada, no sobre el bruto',
          `Auxilio de transporte de ${cop(AUXILIO)} si ganás hasta ${TOPE_AUXILIO_SMLMV} SMLMV: suma al neto y no paga aportes`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'El auxilio de transporte no es salario para aportes, pero sí entra en la base de cesantías y de prima: si tu liquidación lo ignora, te están pagando de menos',
          'Prima, cesantías e intereses de cesantías son pagos aparte y no aparecen en este cálculo mensual',
          `Si tu salario supera ${APORTES.ibcTopeSmlmv} SMLMV (${cop(APORTES.ibcTopeSmlmv * SMLMV)}), los aportes se calculan sobre ese tope y no sobre el total (Ley 797/2003)`,
        ],
        plazo:
          'los aportes se pagan en la planilla PILA según el calendario por los dos últimos dígitos del NIT o la cédula del empleador.',
      },
      {
        id: 'minimo',
        label: 'Gano el mínimo y me pagan auxilio de transporte',
        hint: 'SMLMV + auxilio · el escalón de los 2 SMLMV',
        answer: `Con el mínimo cobrás ${cop(SMLMV)} de salario más ${cop(AUXILIO)} de auxilio: ${cop(SMLMV + AUXILIO)} brutos, y los aportes sólo caen sobre el salario.`,
        yes: [
          `Salario mínimo legal mensual vigente: ${cop(SMLMV)} (Decreto 1469 de 2025)`,
          `Auxilio de transporte: ${cop(AUXILIO)} (Decreto 1470 de 2025)`,
          'Los aportes del 8% se calculan sólo sobre el salario, nunca sobre el auxilio',
          'Sin Fondo de Solidaridad ni retención en la fuente en este nivel de ingreso',
          'El auxilio se prorratea por días: si no trabajaste el mes completo, te corresponde la parte proporcional',
        ],
        warn: [
          DISCLAIMER_TAX,
          `El auxilio es todo o nada: se pierde por completo al pasar los ${TOPE_AUXILIO_SMLMV} SMLMV (${cop(TOPE_AUXILIO_SMLMV * SMLMV)}), no se reduce de a poco. Un aumento chico justo en ese escalón puede dejarte con menos plata en mano`,
          'Ganar el mínimo no te exime de aportar: el 4% y el 4% se descuentan igual',
          'Nadie puede pactar un salario por debajo del mínimo, ni siquiera con tu firma: es una garantía irrenunciable',
        ],
        plazo:
          'el salario mínimo y el auxilio se fijan por decreto cada diciembre y rigen desde el 1 de enero del año siguiente.',
      },
      {
        id: 'integral',
        label: 'Tengo salario integral',
        hint: 'Desde 13 SMLMV · art. 132 CST',
        answer: `El salario integral ya trae las prestaciones adentro y sus aportes se calculan sobre el 70%, no sobre el total.`,
        yes: [
          `Sólo se puede pactar desde ${INTEGRAL.minimoSmlmv} SMLMV (${cop(INTEGRAL.minimoSmlmv * SMLMV)}): 10 de salario más un factor prestacional del ${INTEGRAL.factorPrestacional * 100}%`,
          `Los aportes a seguridad social se liquidan sobre el ${INTEGRAL.ibcFactor * 100}% del paquete (art. 132 CST)`,
          'Ya incluye prima, cesantías, intereses de cesantías y recargos: no se pagan aparte',
          'Las vacaciones sí se siguen debiendo y disfrutando: el integral no las absorbe',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Si el paquete pactado no llega a ${cop(INTEGRAL.minimoSmlmv * SMLMV)}, el pacto de integralidad no vale y el trabajador puede reclamar todas las prestaciones aparte`,
          'No hay auxilio de transporte: el integral está muy por encima del tope de 2 SMLMV',
          'La retención en la fuente pega más fuerte, porque el ingreso mensual gravable es mucho mayor',
        ],
        plazo:
          'el pacto de salario integral tiene que constar por escrito en el contrato; de palabra no produce efectos.',
      },
      {
        id: 'aprendiz',
        label: 'Soy aprendiz del SENA',
        hint: 'Etapa lectiva 75% · etapa productiva 100%',
        answer: `En etapa lectiva cobrás ${cop(SMLMV * APRENDIZ.lectivaPorcentajeSmlmv)} y en productiva ${cop(SMLMV * APRENDIZ.productivaPorcentajeSmlmv)} brutos.`,
        yes: [
          `Etapa lectiva: ${APRENDIZ.lectivaPorcentajeSmlmv * 100}% del SMLMV = ${cop(SMLMV * APRENDIZ.lectivaPorcentajeSmlmv)}`,
          `Etapa productiva: ${APRENDIZ.productivaPorcentajeSmlmv * 100}% del SMLMV = ${cop(SMLMV * APRENDIZ.productivaPorcentajeSmlmv)}`,
          'EPS y ARL a cargo del empleador desde el primer día del contrato',
          'En la etapa productiva se agregan pensión, prima de servicios y vacaciones',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Desde el Decreto 0223 de 2026 el contrato de aprendizaje es un contrato laboral especial a término fijo: dejó de ser una simple "cuota de apoyo de sostenimiento"',
          'El contrato de aprendizaje no puede superar 3 años (36 meses)',
          'No hay auxilio de transporte separado: el apoyo de sostenimiento ya lo comprende',
        ],
        plazo:
          'la empresa tiene que reportar la cuota de aprendices al SENA; monetizarla en vez de contratar tiene su propio costo.',
      },
    ],
  },

  inputsTitle: 'Tus números del mes',
  inputsIntro:
    'Todo mensual y en pesos colombianos. Podés dejar el ejemplo cargado y volver después con los datos de tu desprendible.',
  fields: [
    {
      id: 'salario',
      label: 'Salario mensual pactado (COP)',
      prefix: '$',
      value: '3.000.000',
      thousands: true,
      help: 'El bruto antes de descuentos. En salario integral, poné el paquete completo; como aprendiz, el campo no se usa.',
    },
    {
      id: 'auxilio',
      label: '¿Te pagan auxilio de transporte?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, si me corresponde por ley' },
        { value: 'no', label: 'No' },
      ],
      help: `Sólo corresponde a quien gana hasta ${TOPE_AUXILIO_SMLMV} SMLMV (${cop(TOPE_AUXILIO_SMLMV * SMLMV)}).`,
    },
    {
      id: 'etapa',
      label: 'Etapa del contrato de aprendizaje',
      type: 'select',
      value: 'productiva',
      options: [
        { value: 'lectiva', label: 'Lectiva (estoy estudiando)' },
        { value: 'productiva', label: 'Productiva (estoy en la práctica)' },
      ],
      help: 'Sólo se usa en la rama de aprendiz SENA. En los demás casos se ignora.',
    },
    {
      id: 'deducciones',
      label: 'Deducciones que le informaste al empleador (COP)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Dependientes, intereses de crédito de vivienda, medicina prepagada, AFC y aportes voluntarios a pensión. Bajan la base de la retención, no el aporte a salud ni a pensión.',
    },
    {
      id: 'otros',
      label: 'Otros descuentos del desprendible (COP)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Libranzas, préstamos, cuota de cooperativa o embargos ya ordenados por un juez.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde va cada peso del sueldo',
    caption:
      'Compara lo que efectivamente llega a tu cuenta contra cada descuento: salud, pensión, Fondo de Solidaridad, retención en la fuente y los descuentos que vos autorizaste.',
  },
  breakdownTitle: 'Tu desprendible, línea por línea',
  breakdownIntro:
    'El mismo orden en que lo arma una nómina: base de aportes, descuentos de ley, depuración para la retención y lo que queda en mano.',

  faq: [
    {
      q: '¿Cuánto me descuentan del salario en Colombia?',
      a: `Un 8% fijo: 4% de salud y 4% de pensión, ambos a cargo del trabajador. Si tu base de cotización pasa de ${FSP[0].desde} salarios mínimos (${cop(FSP[0].desde * SMLMV)}) se suma el Fondo de Solidaridad Pensional, que arranca en 1% y sube por escalones hasta 2%. Y si tu base gravable depurada supera ${ART383[1].desde} UVT mensuales, aparece la retención en la fuente. La mayoría de los salarios en Colombia se quedan sólo en ese 8%.`,
    },
    {
      q: '¿Quién tiene derecho al auxilio de transporte y cuánto es?',
      a: `Lo recibe quien gana hasta ${TOPE_AUXILIO_SMLMV} salarios mínimos (${cop(TOPE_AUXILIO_SMLMV * SMLMV)}). El valor es ${cop(AUXILIO)} al mes, fijado por el Decreto 1470 de 2025. No es salario para efectos de aportes, así que suma a tu neto sin que le descuenten salud ni pensión, pero sí entra en la base de cesantías y de prima de servicios. Ojo con el escalón: al pasar los ${TOPE_AUXILIO_SMLMV} SMLMV el auxilio se pierde entero, no se reduce de a poco, así que un aumento pequeño justo ahí puede dejarte con menos plata en mano que antes.`,
    },
    {
      q: '¿Qué es el Fondo de Solidaridad Pensional y desde cuánto se paga?',
      a: `Es un aporte adicional que financia las pensiones de quienes no alcanzan a cotizar. Lo paga quien tiene un ingreso base de cotización superior a ${FSP[0].desde} salarios mínimos. La escala de la Ley 100 no es plana: 1% entre ${FSP[0].desde} y ${FSP[0].hasta} SMLMV, 1,2% entre ${FSP[1].desde} y ${FSP[1].hasta}, 1,4% entre ${FSP[2].desde} y ${FSP[2].hasta}, 1,6% entre ${FSP[3].desde} y ${FSP[3].hasta}, 1,8% entre ${FSP[4].desde} y ${FSP[4].hasta}, y 2% de ${FSP[5].desde} SMLMV en adelante. Muchas planillas simplificadas cobran 1% a todo el mundo: si ganás más de 16 mínimos, ese atajo te da un número equivocado.`,
    },
    {
      q: '¿Desde qué salario me empiezan a retener en la fuente?',
      a: `La retención del art. 383 ET arranca cuando la base gravable depurada supera ${ART383[1].desde} UVT mensuales (${cop(ART383[1].desde * UVT)}). Esa base no es tu salario: primero se restan los aportes obligatorios de salud, pensión y Fondo de Solidaridad, después la renta exenta del ${EXENTA_LABORAL.porcentaje * 100}% y las deducciones que le hayas informado al empleador. Por eso el salario bruto donde realmente empieza a aparecer retención está bastante más arriba de ${ART383[1].desde} UVT.`,
    },
    {
      q: '¿Qué es la renta exenta del 25% y por qué a veces no me la restan completa?',
      a: `El art. 206 numeral 10 del Estatuto Tributario deja exento el ${EXENTA_LABORAL.porcentaje * 100}% del pago laboral una vez descontados los aportes obligatorios, con un tope de ${EXENTA_LABORAL.topeAnualUvt.toLocaleString('es-CO')} UVT al año (unos ${cop((EXENTA_LABORAL.topeAnualUvt * UVT) / 12)} al mes). Encima corre el límite global del art. 336: la suma de deducciones y rentas exentas no puede pasar el ${LIMITE_336.pct * 100}% de la renta líquida ni las ${LIMITE_336.topeUvt.toLocaleString('es-CO')} UVT anuales. Se aplica el menor de los dos y el excedente se pierde. En salarios altos el tope en UVT muerde antes que el porcentaje.`,
    },
    {
      q: '¿La retención en la fuente es un impuesto aparte de la declaración de renta?',
      a: 'No: es un anticipo del mismo impuesto. Todo lo que te retuvieron durante el año se acredita contra el impuesto que liquidés en tu declaración de renta. Si te retuvieron de más queda saldo a favor, que podés imputar al año siguiente o pedir en devolución. Por eso mucha gente que declara termina sin nada que pagar: ya lo pagó mes a mes sin darse cuenta.',
    },
    {
      q: '¿Cómo funciona el salario integral y desde cuánto se puede pactar?',
      a: `Se puede pactar desde ${INTEGRAL.minimoSmlmv} salarios mínimos (${cop(INTEGRAL.minimoSmlmv * SMLMV)}): 10 de salario más un factor prestacional mínimo del ${INTEGRAL.factorPrestacional * 100}%, según el art. 132 del Código Sustantivo del Trabajo. Ese factor ya remunera prima, cesantías, intereses de cesantías y recargos, que no se pagan aparte. Los aportes a seguridad social se calculan sobre el ${INTEGRAL.ibcFactor * 100}% del paquete, no sobre el total, así que el descuento porcentual se siente menor. Las vacaciones no quedan absorbidas: se siguen causando y disfrutando.`,
    },
    {
      q: '¿Cuánto gana un aprendiz del SENA y le descuentan aportes?',
      a: `En la etapa lectiva cobra el ${APRENDIZ.lectivaPorcentajeSmlmv * 100}% del salario mínimo (${cop(SMLMV * APRENDIZ.lectivaPorcentajeSmlmv)}) y en la etapa productiva el ${APRENDIZ.productivaPorcentajeSmlmv * 100}% (${cop(SMLMV * APRENDIZ.productivaPorcentajeSmlmv)}). La EPS y la ARL van a cargo del empleador desde el primer día. En la etapa productiva se suman los aportes a pensión —el 4% del aprendiz— y nacen el derecho a prima de servicios y a vacaciones. Desde el Decreto 0223 de 2026 el aprendizaje es un contrato laboral especial a término fijo, no una simple beca de sostenimiento.`,
    },
    {
      q: '¿Cuánto de mi sueldo me pueden embargar?',
      a: `Por deudas comunes, el salario mínimo es inembargable y del excedente sólo se puede embargar la quinta parte (arts. 154 y 155 del CST). Si ganás ${cop(SMLMV)} o menos, no te pueden tocar un peso del sueldo por una deuda con un banco o un particular. La excepción es fuerte: por pensión alimenticia o por deudas con cooperativas, el juez puede ordenar el embargo de hasta el ${EMBARGO.topeAlimentosCooperativas * 100}% de todo el salario, incluso del mínimo (art. 156 CST).`,
    },
    {
      q: '¿Cuánto le cuesta a la empresa mi sueldo, además de lo que me paga?',
      a: `Bastante más de lo que ves. Sobre tu salario el empleador aporta ${APORTES.pensionEmpleador * 100}% de pensión, hasta ${APORTES.saludEmpleador * 100}% de salud, la ARL según la clase de riesgo de la actividad y los parafiscales de caja de compensación, ICBF y SENA. Las personas jurídicas están exoneradas de salud, SENA e ICBF por los trabajadores que ganan menos de ${COLOMBIA_2026.aportes.exoneracionArt114_1SmlmvTope} salarios mínimos (art. 114-1 ET), pero la caja de compensación no se exonera nunca. Sumando prestaciones, un salario suele costarle a la empresa entre un 45% y un 55% más de lo que aparece en el contrato.`,
    },
    {
      q: '¿Cuánto vale mi hora de trabajo?',
      a: `Se calcula dividiendo el salario mensual por el divisor de la jornada. Hasta el 14 de julio de 2026 fue ${JORNADA.divisorMensualHasta14Jul2026} horas al mes (jornada de ${JORNADA.horasSemanaHasta14Jul2026} horas semanales) y desde el 15 de julio de 2026 es ${JORNADA.divisorMensualDesde15Jul2026} (jornada de ${JORNADA.horasSemanaDesde15Jul2026} horas, último escalón de la Ley 2101 de 2021). Como el salario mensual no baja, tu hora ordinaria subió alrededor de un 4,76% con ese cambio, y con ella todas las horas extras y recargos que se calculan a partir de ella.`,
    },
    {
      q: '¿Por qué mi desprendible real me da distinto a esta cuenta?',
      a: 'Las causas más frecuentes son tres. Primero, que la empresa aplique el procedimiento 2 de retención, que promedia los ingresos de los doce meses anteriores en vez de mirar mes a mes. Segundo, que tengas deducciones cargadas que acá no pusiste, o que la empresa todavía no las haya procesado. Tercero, que tu sueldo tenga componentes variables —comisiones, bonos, horas extras— que mueven la base de un mes a otro. También cambia el resultado si venís de una incapacidad o una licencia, porque ahí la base de aportes se calcula distinto.',
    },
    {
      q: '¿Los aportes se calculan sobre todo mi salario, sin tope?',
      a: `No. El ingreso base de cotización tiene un piso de ${APORTES.ibcMinimoSmlmv} salario mínimo y un techo de ${APORTES.ibcTopeSmlmv} salarios mínimos (${cop(APORTES.ibcTopeSmlmv * SMLMV)}), fijado por la Ley 797 de 2003. Si ganás por encima de ese techo, tus aportes a salud y pensión se congelan ahí y no siguen subiendo. Tampoco entran en la base los pagos que las partes hayan acordado expresamente como no constitutivos de salario, dentro del límite del 40% del total que fija el art. 30 de la Ley 1393 de 2010.`,
    },
  ],

  sources: [
    {
      name: 'Decreto 1469 de 2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '29-12-2025',
    },
    {
      name: 'Decreto 1470 de 2025 — auxilio de transporte',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '29-12-2025',
    },
    {
      name: 'Resolución DIAN 000238 del 15-12-2025 — valor de la UVT',
      url: 'https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000238%20de%2015-12-2025.pdf',
      publisher: 'DIAN',
      date: '15-12-2025',
    },
    {
      name: 'Estatuto Tributario, art. 383 — retención en la fuente sobre rentas de trabajo',
      url: 'https://estatuto.co/383',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 206 num. 10 — renta exenta del 25%',
      url: 'https://estatuto.co/206',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 336 — límite global del 40% y de 1.340 UVT',
      url: 'https://estatuto.co/336',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Ley 100 de 1993 — aportes a salud, pensión y Fondo de Solidaridad Pensional',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=5248',
      publisher: 'Función Pública',
    },
    {
      name: 'Código Sustantivo del Trabajo, arts. 132, 154, 155 y 156 — salario integral y embargabilidad',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 2101 de 2021 — reducción de la jornada laboral a 42 horas',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=167953',
      publisher: 'Función Pública',
    },
    {
      name: 'Ley 2466 de 2025 — reforma laboral (contrato de aprendizaje y recargos)',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '2025',
    },
  ],

  replaces: [
    '/co/calculadora-salario-neto-colombia-2026-bruto-a-neto',
    '/co/calculadora-salario-minimo-colombia-2026-auxilio-transporte',
    '/co/calculadora-auxilio-transporte-colombia-2026',
    '/co/calculadora-salarios-minimos-a-pesos-colombia-2026',
    '/co/calculadora-salario-integral-colombia-2026',
    '/co/calculadora-salario-por-hora-colombia',
    '/co/calculadora-aporte-eps-pension-empleado-colombia-2026',
    '/co/calculadora-aporte-fondo-solidaridad-pension-fsp-colombia',
    '/co/calculadora-embargo-salario-colombia',
    '/co/calculadora-salario-aprendiz-sena-2026',
    '/trabajo/sueldo-neto-colombia',
  ],

  lastReviewed: '2026-07-28',
};
