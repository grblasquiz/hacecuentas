import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "Declaración de renta de persona natural: ¿me toca, cuándo y cuánto pago?"
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts (la misma tabla maestra
 * que usan las fórmulas vivas). Nada hardcodeado de memoria acá.
 *
 * Piloto de la arquitectura "hub bajo prefijo de país": slug con prefijo `co/`,
 * siloHref `/co/impuestos`, campo `locale: 'co'`.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** UVT del año gravable en curso — Resolución DIAN 000238 del 15-12-2025. */
export const UVT = COLOMBIA_2026.uvt;
export const UVT_ANIO = 2026;
/** UVT del año gravable que se declara (2025). Los topes del art. 592 ET se miden con ésta. */
export const UVT_DECLARA = COLOMBIA_2026.uvt2025;

/**
 * Tabla del art. 241 ET, en UVT. Espejo de COLOMBIA_2026.rentaArt241.
 * `Infinity` no sobrevive a la serialización de `define:vars` → viaja como null.
 */
export const TABLA_241 = COLOMBIA_2026.rentaArt241.map((t) => ({
  desde: t.desdeUvt,
  hasta: Number.isFinite(t.hastaUvt) ? t.hastaUvt : null,
  tasa: t.tasa,
  adicion: t.adicionUvt,
}));

/** Renta exenta laboral del art. 206-10 ET: 25% con tope anual en UVT. */
export const EXENTA_LABORAL = COLOMBIA_2026.rentaExentaLaboral;

/** Límite global del art. 336 ET: 40% de la renta líquida y tope de 1.340 UVT/año. */
export const LIMITE_336 = { pct: 0.4, topeUvt: 1340 };

/** Deducción por dependientes del art. 336 par. 5 ET (Ley 2277/2022): 72 UVT c/u, máximo 4. */
export const DEPENDIENTES = { uvtCadaUno: 72, maximo: 4 };

/** Renta exenta de pensiones del art. 206-5 ET: 1.000 UVT mensuales. */
export const PENSION_EXENTA_UVT_MES = 1000;

/** Topes del art. 592 ET para quedar obligado a declarar (medidos en UVT del año gravable). */
export const TOPES_DECLARAR = COLOMBIA_2026.declaracionRenta2026;

/** Sanción mínima del art. 639 ET, en UVT. */
export const SANCION_MINIMA_UVT = COLOMBIA_2026.sanciones.minimaUvt;

/**
 * Vencimientos DIAN para personas naturales, en orden de terminación de cédula
 * (índice 0 = 01-02 … índice 49 = 99-00). Mismo arreglo que
 * src/lib/formulas/fecha-declaracion-renta-2026-colombia-cedula.ts, que no lo exporta.
 */
export const VENCIMIENTOS: string[] = [
  '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-18', '2026-08-19',
  '2026-08-20', '2026-08-21', '2026-08-24', '2026-08-25', '2026-08-26',
  '2026-08-27', '2026-08-28', '2026-08-31', '2026-09-01', '2026-09-02',
  '2026-09-03', '2026-09-04', '2026-09-07', '2026-09-08', '2026-09-09',
  '2026-09-10', '2026-09-11', '2026-09-14', '2026-09-15', '2026-09-16',
  '2026-09-17', '2026-09-18', '2026-09-21', '2026-09-22', '2026-09-23',
  '2026-09-24', '2026-09-25', '2026-09-28', '2026-10-01', '2026-10-02',
  '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09',
  '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-19',
  '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-26',
];

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/impuestos/renta-personas',
  title: 'Renta personas naturales Colombia 2026: tabla UVT y topes',
  description:
    'Tabla del impuesto de renta para personas naturales en Colombia 2026, en UVT: verificá si estás obligado a declarar, cuándo vence según tu cédula y cuánto te toca pagar con los topes del art. 592, el límite del 40% del art. 336 y la tabla del art. 241 del Estatuto Tributario.',
  silo: 'Impuestos',
  siloHref: '/co/impuestos',
  locale: 'co',

  eyebrow: 'Colombia · DIAN · persona natural',
  h1: 'Declaración de renta de personas naturales Colombia 2026: la tabla, si te toca, cuándo vence y cuánto pagás.',
  lede:
    'Una sola cuenta responde las tres preguntas. Con tus ingresos del año, tus aportes y beneficios, la calculadora depura la base, la pasa por la tabla del art. 241 y la cruza con los topes del art. 592 y el calendario de la DIAN.',
  stamps: [
    `UVT ${UVT_ANIO}: ${cop(UVT)}`,
    'Arts. 241, 336 y 592 del Estatuto Tributario',
    '13 calculadoras adentro',
  ],

  resultLabel: 'Saldo de renta a pagar',

  cases: {
    title: '¿De dónde vienen tus ingresos?',
    intro:
      'La tabla del impuesto es la misma para todos, pero lo que podés restar antes cambia mucho según de dónde venga la plata. Partimos del caso más frecuente.',
    items: [
      {
        id: 'asalariado',
        label: 'Soy empleado con contrato laboral',
        hint: 'Cédula general · rentas de trabajo',
        answer: 'Como asalariado restás el 25% exento de rentas de trabajo antes de liquidar.',
        yes: [
          `Aportes obligatorios a salud y pensión: salen del ingreso antes de todo`,
          `Renta exenta del 25% de las rentas de trabajo, con tope de ${EXENTA_LABORAL.topeAnualUvt.toLocaleString('es-CO')} UVT al año (art. 206-10 ET)`,
          `${DEPENDIENTES.uvtCadaUno} UVT por dependiente, hasta ${DEPENDIENTES.maximo} dependientes (art. 336 par. 5 ET)`,
          'Intereses de vivienda, medicina prepagada, AFC y aportes voluntarios a pensión',
          'La retención que te descontaron mes a mes se acredita contra el impuesto del año',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Deducciones y rentas exentas juntas no pueden pasar el 40% de la renta líquida ni las 1.340 UVT anuales (art. 336 ET): el excedente se pierde',
        ],
        plazo: 'el vencimiento sale de los dos últimos dígitos de tu cédula y se escalona entre agosto y octubre.',
      },
      {
        id: 'independiente',
        label: 'Trabajo por honorarios o prestación de servicios',
        hint: 'Cédula general · sin costos imputados',
        answer: 'Como independiente elegís: o el 25% exento, o imputar costos reales. No las dos.',
        yes: [
          'Tus honorarios brutos del año, sin descontar todavía nada',
          `Renta exenta del 25% con tope de ${EXENTA_LABORAL.topeAnualUvt.toLocaleString('es-CO')} UVT, si no imputás costos y gastos de la actividad`,
          `${DEPENDIENTES.uvtCadaUno} UVT por dependiente, hasta ${DEPENDIENTES.maximo}`,
          'Los aportes a seguridad social que pagás por PILA sobre el 40% del contrato',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si imputás costos y gastos reales de la actividad perdés el 25% exento: conviene correr las dos cuentas antes de decidir',
          'La UGPP fiscaliza aparte que hayas cotizado sobre el IBC correcto: no declarar renta bien no te salva de ese frente',
        ],
        plazo: 'los honorarios llevan retención en la fuente propia; pedile a cada cliente el certificado antes de declarar.',
      },
      {
        id: 'pensionado',
        label: 'Vivo de mi pensión',
        hint: 'Cédula de pensiones · art. 206-5 ET',
        answer: `La pensión está exenta hasta ${PENSION_EXENTA_UVT_MES.toLocaleString('es-CO')} UVT por mes: sólo tributa el excedente.`,
        yes: [
          `Exención de ${PENSION_EXENTA_UVT_MES.toLocaleString('es-CO')} UVT mensuales (${cop(PENSION_EXENTA_UVT_MES * UVT)} con la UVT vigente)`,
          'Sólo el excedente anual pasa por la tabla del art. 241',
          'La cédula de pensiones no está sujeta al límite del 40% del art. 336',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Estar exento no es lo mismo que no declarar: si superás los topes de patrimonio o de ingresos igual tenés que presentar la declaración, aunque dé cero',
          'La exención cubre pensiones de jubilación, invalidez, vejez, sobrevivientes y riesgos laborales; no cubre pensiones del exterior',
          `La exención corre por cada mesada: la cuenta de acá aplica 12 mesadas sobre el total anual que cargues, así que si cobrás mesada adicional de junio tu tope exento real es un poco más alto`,
        ],
        plazo: `si estabas obligado y no declarás, la sanción mínima es de ${SANCION_MINIMA_UVT} UVT (${cop(SANCION_MINIMA_UVT * UVT)}).`,
      },
      {
        id: 'capital',
        label: 'Vivo de arriendos, dividendos o inversiones',
        hint: 'Rentas de capital y no laborales',
        answer: 'Sin rentas de trabajo no hay 25% exento: restás costos reales y nada más.',
        yes: [
          'Arriendos, intereses, rendimientos financieros, dividendos y utilidades de cripto',
          'Costos y gastos con soporte: administración, predial, seguros, reparaciones, comisiones',
          'Las retenciones que te practicaron bancos, plataformas o el arrendatario',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Acá NO aplica el 25% exento del art. 206-10: es exclusivo de rentas de trabajo',
          'La utilidad de cripto es renta del año en que la realizás, aunque nunca la conviertas a pesos en un banco colombiano',
          'La venta de la casa de habitación tiene su propio régimen de ganancia ocasional, aparte de esta cuenta',
        ],
        plazo: 'guardá los soportes de costos: sin factura o documento equivalente la DIAN los rechaza.',
      },
    ],
  },

  inputsTitle: 'Tus cifras del año gravable',
  inputsIntro:
    'Todo en pesos colombianos y en valores anuales del año que estás declarando. Podés dejar el ejemplo cargado y volver después con tus números.',
  fields: [
    {
      id: 'ingresos',
      label: 'Ingresos brutos del año (COP)',
      prefix: '$',
      value: '90.000.000',
      thousands: true,
      help: 'Todo lo que recibiste: salario, honorarios, pensión, arriendos, rendimientos y dividendos.',
    },
    {
      id: 'aportes',
      label: 'Aportes obligatorios a salud y pensión (COP)',
      prefix: '$',
      value: '7.200.000',
      thousands: true,
      help: 'Lo que te descontaron o pagaste por PILA durante el año. No son deducción: son ingreso no constitutivo de renta.',
    },
    {
      id: 'dependientes',
      label: 'Dependientes a cargo',
      type: 'number',
      value: 1,
      min: 0,
      max: 4,
      step: 1,
      help: `${DEPENDIENTES.uvtCadaUno} UVT por cada uno, máximo ${DEPENDIENTES.maximo}. Sólo cuenta si tenés rentas de trabajo.`,
    },
    {
      id: 'beneficios',
      label: 'Otras deducciones y rentas exentas (COP)',
      prefix: '$',
      value: '6.000.000',
      thousands: true,
      help: 'Intereses de crédito de vivienda, medicina prepagada, aportes a AFC y a pensión voluntaria. En rentas de capital, poné acá tus costos con soporte.',
    },
    {
      id: 'retenciones',
      label: 'Retención en la fuente que te practicaron (COP)',
      prefix: '$',
      value: '2.500.000',
      thousands: true,
      help: 'Suma de todos los certificados de retención del año.',
    },
    {
      id: 'patrimonio',
      label: 'Patrimonio bruto al 31 de diciembre (COP)',
      prefix: '$',
      value: '150.000.000',
      thousands: true,
      help: 'Todo lo que tenías, sin restar deudas: inmuebles, vehículos, saldos bancarios, inversiones.',
    },
    {
      id: 'digitos',
      label: 'Dos últimos dígitos de tu cédula',
      type: 'number',
      value: 34,
      min: 0,
      max: 99,
      step: 1,
      help: 'Sin dígito de verificación. Definen tu fecha de vencimiento en el calendario de la DIAN.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué pasa con cada peso que ganaste',
    caption:
      'Compara la parte del ingreso que la ley saca del impuesto (aportes obligatorios, deducciones y rentas exentas), la renta que sí queda gravada y el impuesto que sale de la tabla del art. 241.',
  },
  breakdownTitle: 'Cómo se arma tu declaración, línea por línea',
  breakdownIntro:
    'El mismo orden del formulario 210: ingresos, lo que se resta, la base gravable en UVT, el tramo y el saldo.',

  faq: [
    {
      q: '¿Cómo sé si estoy obligado a declarar renta?',
      a: `El art. 592 del Estatuto Tributario fija cinco topes, medidos con la UVT del año gravable que declarás (${cop(UVT_DECLARA)}): ingresos brutos desde ${TOPES_DECLARAR.topeIngresosUvt.toLocaleString('es-CO')} UVT, patrimonio bruto al 31 de diciembre por encima de ${TOPES_DECLARAR.topePatrimonioUvt.toLocaleString('es-CO')} UVT, y consumos con tarjeta de crédito, compras totales o consignaciones bancarias por encima de ${TOPES_DECLARAR.topeConsumosTarjetaUvt.toLocaleString('es-CO')} UVT. Basta con superar uno solo para quedar obligado. Además, si sos responsable de IVA declarás siempre, sin importar los montos.`,
    },
    {
      q: 'Si el impuesto me da cero, ¿igual tengo que declarar?',
      a: `Sí, si superaste alguno de los topes. Declarar y pagar son cosas distintas: podés presentar la declaración en ceros o con saldo a favor. Lo que no podés es no presentarla, porque ahí corre la sanción por extemporaneidad, que nunca baja de la sanción mínima de ${SANCION_MINIMA_UVT} UVT (${cop(SANCION_MINIMA_UVT * UVT)}).`,
    },
    {
      q: '¿Qué es la UVT y por qué todo está expresado en esa unidad?',
      a: `La Unidad de Valor Tributario es la unidad con la que el Estatuto Tributario escribe topes, tramos y sanciones para que se actualicen solos cada año sin tener que reformar la ley. La vigente es de ${cop(UVT)}, fijada por la Resolución DIAN 000238 del 15 de diciembre de 2025. Ojo con un detalle que confunde a mucha gente: los topes para saber si estás obligado a declarar se miden con la UVT del año gravable que declarás (${cop(UVT_DECLARA)}), no con la del año en que presentás.`,
    },
    {
      q: '¿Desde qué monto se empieza a pagar impuesto?',
      a: `El primer tramo del art. 241 va de 0 a ${TABLA_241[1].desde.toLocaleString('es-CO')} UVT con tarifa del 0%. Con la UVT vigente eso son unos ${cop(TABLA_241[1].desde * UVT)} de renta líquida gravable al año. Ojo: es renta gravable, no ingreso. Alguien puede facturar bastante más y no pagar nada porque los aportes, el 25% exento y las deducciones bajan la base por debajo del piso.`,
    },
    {
      q: '¿Cuál es la tabla del impuesto de renta para personas naturales en Colombia 2026 (art. 241, en UVT)?',
      a: `Siete tramos progresivos: 0% hasta ${TABLA_241[1].desde.toLocaleString('es-CO')} UVT; 19% de ${TABLA_241[1].desde.toLocaleString('es-CO')} a ${TABLA_241[2].desde.toLocaleString('es-CO')}; 28% de ${TABLA_241[2].desde.toLocaleString('es-CO')} a ${TABLA_241[3].desde.toLocaleString('es-CO')}; 33% de ${TABLA_241[3].desde.toLocaleString('es-CO')} a ${TABLA_241[4].desde.toLocaleString('es-CO')}; 35% de ${TABLA_241[4].desde.toLocaleString('es-CO')} a ${TABLA_241[5].desde.toLocaleString('es-CO')}; 37% de ${TABLA_241[5].desde.toLocaleString('es-CO')} a ${TABLA_241[6].desde.toLocaleString('es-CO')}; y 39% de ${TABLA_241[6].desde.toLocaleString('es-CO')} UVT en adelante. Cada tramo suma una adición fija en UVT más el porcentaje sobre el excedente, así que la tarifa alta sólo pega sobre la parte que entra en ese tramo.`,
    },
    {
      q: '¿Por qué mis deducciones no se restan completas?',
      a: `Por el límite global del art. 336 del Estatuto Tributario: la suma de deducciones y rentas exentas de la cédula general no puede superar el 40% de la renta líquida ni las ${LIMITE_336.topeUvt.toLocaleString('es-CO')} UVT anuales (${cop(LIMITE_336.topeUvt * UVT)}). Se aplica el menor de los dos. Todo lo que pase de ahí se recorta, exactamente como lo hace el formulario 210. Por eso a los ingresos altos la medicina prepagada o el AFC muchas veces ya no les mueve la aguja: el tope de 1.340 UVT muerde antes que el 40%.`,
    },
    {
      q: '¿Cuánto puedo deducir por dependientes?',
      a: `${DEPENDIENTES.uvtCadaUno} UVT al año por cada dependiente (${cop(DEPENDIENTES.uvtCadaUno * UVT)}), hasta un máximo de ${DEPENDIENTES.maximo} dependientes, según el parágrafo 5 del art. 336 que introdujo la Ley 2277 de 2022. Es distinto de la deducción que te aplican en la retención mensual, que va por el art. 387 y se calcula como el 10% del ingreso laboral con tope de 32 UVT al mes. Son dos reglas diferentes: una es para la retención, la otra para la declaración anual.`,
    },
    {
      q: '¿La retención en la fuente es un impuesto aparte?',
      a: 'No: es un anticipo del mismo impuesto. Todo lo que te retuvieron durante el año se acredita contra el impuesto liquidado en la declaración. Por eso mucha gente que declara termina sin saldo a pagar, o con saldo a favor: ya lo pagó mes a mes sin darse cuenta.',
    },
    {
      q: '¿Qué pasa si me retuvieron más de lo que debía pagar?',
      a: 'Queda un saldo a favor. Tenés dos caminos: imputarlo a la declaración del año siguiente, que es el trámite simple, o pedir devolución o compensación ante la DIAN, que exige radicar la solicitud con los soportes dentro de los plazos que fija la entidad. Si el saldo es chico, imputarlo suele salir más barato en tiempo.',
    },
    {
      q: '¿Cuándo vence mi declaración?',
      a: 'El calendario se escalona por los dos últimos dígitos de la cédula, sin dígito de verificación, y se reparte en 50 fechas de día hábil entre mediados de agosto y finales de octubre. Las terminaciones bajas declaran primero y las altas al final. La calculadora te devuelve tu fecha exacta cuando cargás los dígitos.',
    },
    {
      q: '¿Qué diferencia hay entre tarifa marginal y tasa efectiva?',
      a: 'La marginal es la del tramo donde caés y aplica sólo al excedente de ese tramo: es lo que paga tu último peso. La efectiva es el impuesto total dividido por tu ingreso bruto, y siempre da bastante menos. Alguien con tarifa marginal del 33% puede tener una efectiva del 9%. La tabla es progresiva justamente para eso.',
    },
    {
      q: '¿Y si me atraso o me equivoco al declarar?',
      a: `La sanción por extemporaneidad es del 5% del impuesto a cargo por cada mes o fracción de retraso, con tope del 100%, y sube al 10% mensual con tope del 200% si la DIAN te emplaza antes de que presentes. Encima corren intereses de mora. Si ya declaraste y detectás un error, la corrección voluntaria tiene sanción propia, más barata que esperar a que la DIAN te la haga. En cualquier caso el piso es la sanción mínima de ${SANCION_MINIMA_UVT} UVT.`,
    },
  ],

  sources: [
    {
      name: 'Resolución DIAN 000238 del 15-12-2025 — valor de la UVT',
      url: 'https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000238%20de%2015-12-2025.pdf',
      publisher: 'DIAN',
      date: '15-12-2025',
    },
    {
      name: 'Estatuto Tributario, art. 241 — tarifa para personas naturales residentes',
      url: 'https://estatuto.co/241',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 336 — renta líquida gravable de la cédula general y límite del 40%',
      url: 'https://estatuto.co/336',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 592 — quiénes no están obligados a declarar',
      url: 'https://estatuto.co/592',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 206 — rentas de trabajo exentas y exención de pensiones',
      url: 'https://estatuto.co/206',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'DIAN — Declaración de renta de personas naturales',
      url: 'https://www.dian.gov.co/impuestos/personas/Paginas/default.aspx',
      publisher: 'DIAN',
    },
  ],

  replaces: [
    // Vivía en el árbol AR (`/impuestos/renta-colombia`) pese a ser de mercado CO.
    // Este hub lo reemplaza desde el prefijo que le corresponde.
    '/impuestos/renta-colombia',
    '/co/calculadora-renta-personas-naturales-colombia-2026-anual',
    '/co/calculadora-tabla-impuesto-renta-personas-naturales-colombia-2026',
    '/calculadora-impuesto-renta-colombia-persona-natural-2026',
    '/co/calculadora-isr-anual-colombia-personas-naturales-cedulas',
    '/co/calculadora-obligado-declarar-renta-2026',
    '/co/calculadora-fecha-declaracion-renta-2026-colombia-cedula',
    '/co/calculadora-deduccion-dependientes-colombia-renta-2026',
    '/co/calculadora-renta-pensionados-colombia-2026',
    '/co/calculadora-ingresos-no-constitutivos-renta-colombia-vivienda',
    '/co/calculadora-fondo-pensiones-voluntarias-colombia-deduccion-renta',
    '/co/calculadora-cuenta-afc-ahorro-fomento-construccion-colombia',
    '/co/calculadora-isr-arrendamiento-arrendador-colombia-deducciones',
    '/co/calculadora-isr-rentas-de-capital-dividendos-intereses-colombia',
    '/co/calculadora-cripto-colombia-impuestos-renta-trader-2026',
  ],

  lastReviewed: '2026-08-07',
};
