import type { HubData } from '../types';
import { URUGUAY_2026 } from '../../data/uruguay-2026';

/**
 * Hub de decisión UY — "Trabajo por mi cuenta: ¿qué régimen me conviene y cuánto pago?"
 *
 * Reúne IRPF de servicios personales, monotributo BPS, IRAE e IVA.
 *
 * ⚠️ Los montos de la cuota de monotributo y el tope de facturación NO están en
 * src/lib/data/uruguay-2026.ts: vienen de la fórmula vieja, que los marca como
 * dudosos. Quedan editables y hay que contrastarlos con la tabla del BPS.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const BPC = URUGUAY_2026.bpc;
export const IVA = URUGUAY_2026.iva;
export const IRAE = URUGUAY_2026.irae;
export const IRPF_FRANJAS = URUGUAY_2026.irpf.franjas.map((f) => ({
  hastaBpc: Number.isFinite(f.hastaBpc) ? f.hastaBpc : null,
  tasa: f.tasa,
}));
export const IRPF_DEDUCCION = URUGUAY_2026.irpf.deduccion;

/** Deducción ficta de gastos para servicios personales (Cat. II, DGI). */
export const FICTO_GASTOS = 0.3;

/**
 * Monotributo BPS. ⚠️ Cuotas y tope de facturación REFERENCIALES: no están en el
 * data file del país y la fórmula original los marca como dudosos. Verificar
 * contra la tabla oficial del BPS del año en curso antes de usarlos para decidir.
 * La gradualidad del aporte jubilatorio (25% el primer año, 50% el segundo, 100%
 * desde el mes 25) sí está verificada.
 */
export const MONOTRIBUTO = {
  cuotas: { 'sin-fonasa': 3900, individual: 6500, conyuge: 8600, hijos: 9300 } as Record<string, number>,
  aporteJubilatorioBase: 3900,
  topeAnual: 1175537,
  gradualidad: [
    { hastaMeses: 12, factor: 0.25 },
    { hastaMeses: 24, factor: 0.5 },
    { hastaMeses: null, factor: 1 },
  ] as Array<{ hastaMeses: number | null; factor: number }>,
};

const uyu = (n: number) => '$U ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'uy/impuestos/trabajo-independiente',
  title: 'Trabajar por tu cuenta en Uruguay: monotributo, IRPF, IRAE e IVA',
  description:
    'Cuánto pagás si facturás por tu cuenta en Uruguay: IRPF de servicios personales con deducción ficta o gastos reales, cuota de monotributo BPS con su gradualidad, IRAE al 25% sobre la renta neta e IVA al 22% o 10%.',
  silo: 'Impuestos',
  siloHref: '/uy/impuestos',
  locale: 'uy',

  eyebrow: 'Uruguay · DGI · BPS',
  h1: 'Facturás por tu cuenta: ¿qué régimen te conviene y cuánto te queda?',
  lede:
    'Trabajar independiente en Uruguay implica elegir: monotributo con cuota fija, IRPF de servicios personales con escala progresiva, o IRAE al 25% sobre la renta neta. Cada camino tiene su tope de facturación, su forma de descontar gastos y su tratamiento del IVA. La cuenta corre las opciones sobre tus números.',
  stamps: [
    `IVA básica ${(IVA.basica * 100).toLocaleString('de-DE')}% · mínima ${(IVA.minima * 100).toLocaleString('de-DE')}%`,
    `IRAE ${(IRAE * 100).toLocaleString('de-DE')}% sobre la renta neta`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Lo que pagás en el año',

  cases: {
    title: '¿Bajo qué régimen facturás?',
    intro:
      'La cuenta te muestra siempre el impuesto del régimen que elijas, y las filas te dejan comparar contra los otros. Partimos de servicios personales, que es el caso más común entre profesionales.',
    items: [
      {
        id: 'servicios',
        label: 'Servicios personales: facturo honorarios',
        hint: 'IRPF Cat. II anual · deducción ficta o gastos reales',
        answer: `Podés descontar un ficto del ${(FICTO_GASTOS * 100).toLocaleString('de-DE')}% de gastos o los gastos reales, pero no las dos cosas.`,
        yes: [
          `Deducción ficta del ${(FICTO_GASTOS * 100).toLocaleString('de-DE')}% de los ingresos, sin justificar nada`,
          'O gastos reales documentados, si te conviene más que el ficto',
          'Sobre la renta neta corre la escala progresiva del IRPF, anualizada',
          `Crédito por deducciones (aportes a la caja e hijos) al ${(IRPF_DEDUCCION.tasaBaja * 100).toLocaleString('de-DE')}% o al ${(IRPF_DEDUCCION.tasaAlta * 100).toLocaleString('de-DE')}% según el nivel de ingresos`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los aportes a BPS o a la Caja de Profesionales son obligatorios y van por afuera de este impuesto: no los olvides al calcular tu rentabilidad',
          'Si facturás con IVA, ese IVA no es tuyo: lo cobrás por cuenta de la DGI y lo tenés que volcar',
          'La opción entre ficto y gastos reales se hace por ejercicio y conviene correr las dos cuentas antes de decidir',
        ],
        plazo: 'la declaración jurada anual del IRPF se presenta en el plazo que fija la DGI, con anticipos durante el año.',
      },
      {
        id: 'monotributo',
        label: 'Monotributo BPS: cuota única',
        hint: 'Cuota fija · tope de facturación anual',
        answer: 'Pagás una cuota mensual fija que cubre aportes y tributos, mientras no pases el tope de facturación.',
        yes: [
          'Una sola cuota mensual en lugar de IRPF, IVA y aportes por separado',
          'Cobertura de salud opcional para el titular, el cónyuge y los hijos, con distinto valor de cuota',
          'Gradualidad: el aporte jubilatorio se paga al 25% durante el primer año, al 50% durante el segundo y completo desde el mes 25',
          'Genera derechos jubilatorios y de salud como cualquier aportante',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los montos de cuota y el tope de facturación que usa esta cuenta son referenciales: verificá la tabla vigente del BPS antes de decidir, porque se actualizan',
          'El monotributo tiene límites de actividad, de local y de cantidad de personas ocupadas, además del tope de facturación',
          'Si superás el tope tenés que pasarte al régimen general, con IVA e IRPF o IRAE',
        ],
        plazo: 'la cuota se paga mensualmente; el control del tope se hace sobre la facturación de los últimos doce meses.',
      },
      {
        id: 'irae',
        label: 'Empresa: tributo IRAE',
        hint: `${(IRAE * 100).toLocaleString('de-DE')}% sobre la renta neta fiscal`,
        answer: `El IRAE es proporcional: ${(IRAE * 100).toLocaleString('de-DE')}% de la renta neta, no de la facturación.`,
        yes: [
          'Base: ingresos gravados menos gastos deducibles del ejercicio',
          'Tasa fija, sin progresividad: no importa el tamaño de la renta',
          'Las pérdidas fiscales se pueden arrastrar a ejercicios siguientes',
        ],
        warn: [
          DISCLAIMER_TAX,
          'No todo gasto contable es deducible: tiene que estar vinculado a la renta gravada, documentado y cumplir la regla de deducción proporcional',
          'Además del IRAE, la empresa puede tributar IVA e Impuesto al Patrimonio según su situación',
          'Las empresas chicas pueden optar por regímenes fictos o por monotributo según su facturación: conviene comparar antes de constituir',
        ],
        plazo: 'el IRAE se liquida por ejercicio, con anticipos mensuales durante el año.',
      },
      {
        id: 'iva',
        label: 'Sólo quiero calcular el IVA',
        hint: `${(IVA.basica * 100).toLocaleString('de-DE')}% básica o ${(IVA.minima * 100).toLocaleString('de-DE')}% mínima`,
        answer: 'El IVA no tiene tramos: es tasa básica o tasa mínima, según el bien o servicio.',
        yes: [
          `Tasa básica del ${(IVA.basica * 100).toLocaleString('de-DE')}% para la mayoría de los bienes y servicios`,
          `Tasa mínima del ${(IVA.minima * 100).toLocaleString('de-DE')}% para alimentos de la canasta, medicamentos, servicios de salud y hotelería`,
          'Para quitar el IVA de un precio final se divide por uno más la tasa, no se resta el porcentaje',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Restar el 22% a un precio con IVA incluido da mal: hay que dividir por 1,22',
          'Las exportaciones y algunos rubros están exentos o a tasa cero, con derecho a recuperar el IVA de compras',
          'El IVA que cobrás no es ingreso: es plata de la DGI que pasa por tu cuenta',
        ],
        plazo: 'el IVA se declara y paga mensualmente según el calendario de la DGI.',
      },
    ],
  },

  inputsTitle: 'Tus números del año',
  inputsIntro:
    'En pesos uruguayos y en valores anuales, salvo la antigüedad del monotributo, que va en meses.',
  fields: [
    {
      id: 'ingresos',
      label: 'Ingresos o facturación anual ($U)',
      prefix: '$U',
      value: '1.200.000',
      thousands: true,
      help: 'Todo lo facturado en el ejercicio, sin IVA. En el caso del IVA, poné acá el monto sobre el que querés calcularlo.',
    },
    {
      id: 'gastos',
      label: 'Gastos reales documentados en el año ($U)',
      prefix: '$U',
      value: '250.000',
      thousands: true,
      help: 'Sólo los deducibles y con comprobante. Se comparan contra la deducción ficta.',
    },
    {
      id: 'aportes',
      label: 'Aportes a BPS o Caja de Profesionales en el año ($U)',
      prefix: '$U',
      value: '180.000',
      thousands: true,
      help: 'Generan crédito contra el IRPF, no se restan de la base.',
    },
    {
      id: 'hijos',
      label: 'Hijos menores a cargo',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: `Suman deducción de ${IRPF_DEDUCCION.hijoMenorBpcAnual} BPC anuales por hijo, que también entra al crédito.`,
    },
    {
      id: 'meses',
      label: 'Meses de antigüedad en el monotributo',
      type: 'number',
      value: 6,
      min: 0,
      max: 360,
      step: 1,
      help: 'Define la gradualidad del aporte jubilatorio: 25% hasta el mes 12, 50% hasta el 24 y completo después.',
    },
    {
      id: 'cobertura',
      label: 'Cobertura de salud del monotributo',
      type: 'select',
      value: 'individual',
      options: [
        { value: 'sin-fonasa', label: 'Sin cobertura de salud' },
        { value: 'individual', label: 'Sólo el titular' },
        { value: 'conyuge', label: 'Titular y cónyuge' },
        { value: 'hijos', label: 'Titular, cónyuge e hijos' },
      ],
      help: 'Cambia el valor de la cuota mensual.',
    },
    {
      id: 'tasaIva',
      label: 'Tasa de IVA',
      type: 'select',
      value: 'basica',
      options: [
        { value: 'basica', label: `Básica ${(IVA.basica * 100).toLocaleString('de-DE')}%` },
        { value: 'minima', label: `Mínima ${(IVA.minima * 100).toLocaleString('de-DE')}%` },
      ],
      help: 'La mínima cubre alimentos de la canasta, medicamentos, salud y hotelería.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué pasa con lo que facturaste',
    caption:
      'Separa la parte que se va en gastos, la que se lleva el impuesto del régimen elegido y la que efectivamente te queda a vos.',
  },
  breakdownTitle: 'La cuenta de cada régimen',
  breakdownIntro:
    'Además del régimen que elegiste, el detalle muestra qué pagarías con los otros, para que la comparación sea directa.',

  faq: [
    {
      q: '¿Qué es la deducción ficta del 30% y cuándo conviene?',
      a: `En servicios personales, la DGI te deja descontar un ${(FICTO_GASTOS * 100).toLocaleString('de-DE')}% de tus ingresos como gastos presuntos, sin presentar ningún comprobante. La alternativa es descontar los gastos reales documentados. Conviene el ficto cuando tus gastos efectivos son menores a ese porcentaje, que es el caso típico de quien vende horas de trabajo y tiene poca estructura. Si tenés local, empleados o insumos caros, hacé la cuenta con gastos reales antes de optar.`,
    },
    {
      q: '¿Cómo se calcula el IRPF de servicios personales?',
      a: 'Primero se llega a la renta neta restando de los ingresos el ficto o los gastos reales. Sobre esa renta neta corre la escala progresiva del IRPF, con las franjas mensuales en BPC multiplicadas por doce. Y al impuesto que sale se le resta un crédito equivalente a un porcentaje de tus deducciones —aportes a la caja e hijos a cargo—, que es del 14% si tus ingresos son bajos y del 8% si son altos.',
    },
    {
      q: '¿Qué es el monotributo y quién puede usarlo?',
      a: 'Es un régimen simplificado del BPS que reemplaza con una cuota única los aportes jubilatorios y los impuestos nacionales, excepto algunos. Está pensado para actividades de pequeña escala y tiene límites: un tope de facturación anual, restricciones de actividad, de local y de cantidad de personas ocupadas. Ojo con los montos: los que usa esta cuenta son referenciales y hay que contrastarlos con la tabla vigente del BPS.',
    },
    {
      q: '¿Qué es la gradualidad del monotributo?',
      a: 'Es un descuento sobre la parte jubilatoria de la cuota para quien recién empieza: durante los primeros doce meses se paga el 25% de ese componente, entre el mes 13 y el 24 se paga el 50%, y desde el mes 25 se paga completo. La parte de cobertura de salud no tiene gradualidad. Es la razón por la que la cuota sube en escalones durante los dos primeros años sin que cambie ninguna tabla.',
    },
    {
      q: '¿Qué pasa si supero el tope de facturación del monotributo?',
      a: 'Hay que salir del régimen y pasar al general, lo que implica empezar a facturar con IVA y tributar IRPF de servicios personales o IRAE según la forma jurídica. No es automático ni indoloro: cambia la contabilidad, la forma de facturar y el precio que le cobrás al cliente, porque el IVA se le suma. Conviene anticiparlo antes de cruzar el umbral, no después.',
    },
    {
      q: '¿Cuál es la diferencia entre IRPF e IRAE?',
      a: `El IRPF de servicios personales es progresivo, se aplica sobre la renta de una persona física y admite la deducción ficta. El IRAE es proporcional, del ${(IRAE * 100).toLocaleString('de-DE')}% fijo, se aplica sobre la renta neta fiscal de una actividad empresarial y exige llevar contabilidad con gastos deducibles documentados. Para rentas bajas suele convenir el IRPF por la progresividad; para rentas altas, el IRAE puede resultar más barato porque su tasa fija está por debajo de las franjas superiores del IRPF.`,
    },
    {
      q: '¿El IRAE se calcula sobre lo que facturo?',
      a: `No, y es el error más caro que se comete. El IRAE se calcula sobre la renta NETA fiscal: ingresos gravados menos gastos deducibles. Facturar mucho con márgenes chicos puede dar un IRAE bajo, y facturar poco con casi nada de gasto puede dar uno alto. Si el ejercicio cierra en pérdida no se paga IRAE, y esa pérdida fiscal se puede compensar contra utilidades de ejercicios futuros.`,
    },
    {
      q: '¿Cómo saco el IVA de un precio que ya lo incluye?',
      a: `Dividiendo, no restando. Si el precio final incluye la tasa básica, el neto es el precio dividido 1,${(IVA.basica * 100).toLocaleString('de-DE')} y el IVA contenido es la diferencia. Restarle el ${(IVA.basica * 100).toLocaleString('de-DE')}% al precio final da un número más bajo que el correcto y es un error clásico de facturación.`,
    },
    {
      q: '¿Qué lleva IVA mínimo en lugar de básico?',
      a: `La tasa mínima del ${(IVA.minima * 100).toLocaleString('de-DE')}% alcanza a alimentos de la canasta básica, medicamentos, servicios de salud y hotelería, entre otros. El resto va a la tasa básica del ${(IVA.basica * 100).toLocaleString('de-DE')}%. Y hay una tercera categoría: bienes y servicios exentos o a tasa cero, como las exportaciones, que además permiten recuperar el IVA pagado en las compras.`,
    },
    {
      q: 'Si trabajo en relación de dependencia y además facturo, ¿qué pasa?',
      a: 'Las dos rentas son de la misma categoría del IRPF y se suman en la liquidación anual, aunque durante el año se hayan tratado por separado: tu empleador te retiene sobre el sueldo y vos anticipás sobre los honorarios. Al sumarse, la parte independiente suele caer en franjas más altas de la escala, así que es habitual que la declaración anual arroje saldo a pagar aunque cada retención parecía correcta.',
    },
    {
      q: '¿El IVA que cobro es mío?',
      a: 'No. El IVA que le cobrás al cliente es plata que recaudás por cuenta de la DGI y que tenés que volcar en la declaración mensual, descontando el IVA que pagaste en tus compras. Tratarlo como ingreso propio es el camino más rápido a un problema de caja: cuando llega el vencimiento la plata ya se gastó.',
    },
  ],

  sources: [
    {
      name: 'DGI — IRPF de servicios personales',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
    {
      name: 'BPS — Monotributo',
      url: 'https://www.bps.gub.uy/',
      publisher: 'Banco de Previsión Social',
    },
    {
      name: 'DGI — IRAE: Impuesto a las Rentas de las Actividades Económicas',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
    {
      name: 'DGI — IVA: tasas básica y mínima',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
  ],

  replaces: [
    '/uy/irpf-servicios-personales-uruguay',
    '/uy/calculadora-monotributo-uruguay',
    '/uy/calculadora-irae-uruguay',
    '/uy/calculadora-iva-uruguay',
  ],

  lastReviewed: '2026-07-28',
};
