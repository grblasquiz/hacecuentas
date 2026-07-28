import type { HubData } from '../types';
import { COLOMBIA_2026, AHORRO_DIGITAL_2026, REAJUSTE_PENSIONAL_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Dónde pongo mis ahorros: CDT, FIC, TES, dólares o cajita digital?"
 *
 * El valor del hub es que compara DESPUÉS de impuestos y DESPUÉS de inflación.
 * Las calculadoras que absorbe comparaban rendimientos brutos (o con retenciones
 * inventadas: 4%, 8%, 10% y hasta 19% "de ganancias ocasionales" para el mismo
 * concepto). Acá se aplica una sola retención, la real de rendimientos
 * financieros, y se descuenta el IPC para mostrar la tasa real.
 *
 * Constantes: src/lib/data/colombia-2026.ts + src/data/live/colombia.json (TRM).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/**
 * Retención en la fuente sobre rendimientos financieros: 7%.
 * Art. 3 Decreto 700 de 1997, hoy art. 1.2.4.2.5 del DUR 1625 de 2016.
 * Aplica a intereses de CDT, cuentas de ahorro, FIC de renta fija y cupones de TES.
 * NO es ganancia ocasional (esa es del 15%, art. 313 ET) ni el 4/8/10/19% que
 * usaban las calculadoras viejas.
 */
export const RETENCION_RENDIMIENTOS = 0.07;

/** GMF 4×1000 y su exención mensual en UVT (art. 879 ET). */
export const GMF = COLOMBIA_2026.gmf;

/** UVT vigente — Resolución DIAN 000238 del 15-12-2025. */
export const UVT = COLOMBIA_2026.uvt;

/** Cajitas digitales: Nu 11,25% EA vs Nequi 0,1% EA (verificado 2026-07-18). */
export const AHORRO_DIGITAL = AHORRO_DIGITAL_2026;

/** IPC 2025 = 5,1%, el mismo que usó el reajuste pensional 2026. Default de inflación esperada. */
export const IPC_REFERENCIA = REAJUSTE_PENSIONAL_2026.ipc2025Pct;

/**
 * TRM del día — src/data/live/colombia.json, fetch automático desde
 * Superintendencia Financiera / datos.gov.co. Se refresca con el cron de datos.
 */
export const TRM = 3205.8;
export const TRM_FECHA = '2026-07-28';

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/finanzas/donde-pongo-mis-ahorros',
  title: '¿Dónde pongo mis ahorros en Colombia? CDT, FIC, TES, dólares o cajita',
  description:
    'Compará CDT, FIC, TES, cajitas digitales, dólares y finca raíz después de la retención del 7%, el 4×1000 y la inflación. La tasa real es la única que importa: muchas opciones rinden menos que el IPC.',
  silo: 'Finanzas',
  siloHref: '/co/finanzas',
  locale: 'co',

  eyebrow: 'Colombia · rentabilidad real · después de impuestos',
  h1: '¿Dónde pongo mis ahorros para que no se los coma la inflación?',
  lede:
    'La tasa que te muestra el banco es bruta y nominal. Lo que te queda es otra cosa: primero se va la retención en la fuente sobre los rendimientos, después la comisión del producto, después el 4×1000 si retirás por una cuenta gravada, y al final la inflación se lleva lo que quede del poder de compra. Esta cuenta te da la tasa real.',
  stamps: [
    `Retención rendimientos financieros ${(RETENCION_RENDIMIENTOS * 100).toFixed(0)}%`,
    `TRM ${cop(TRM)} · ${TRM_FECHA}`,
    '9 calculadoras adentro',
  ],

  resultLabel: 'Lo que ganás de verdad (neto y en plata de hoy)',

  cases: {
    title: '¿Dónde estás pensando poner la plata?',
    intro:
      'Todas las opciones se miden con la misma vara: rendimiento bruto, menos retención, menos comisión, menos 4×1000, menos inflación. Cambia el riesgo, la liquidez y quién te retiene, pero la cuenta final es la misma.',
    items: [
      {
        id: 'cdt',
        label: 'Un CDT a 90, 180 o 360 días',
        hint: 'Renta fija · tasa pactada de entrada',
        answer: 'El CDT te fija la tasa el día que lo abrís: sabés exactamente cuánto vas a tener al vencimiento.',
        yes: [
          'La tasa EA queda pactada desde el día uno y no se mueve, pase lo que pase con el Banco de la República',
          'A más plazo, más tasa: la curva típica sube del CDT a 90 días al de 360 y al de 720',
          `El rendimiento se capitaliza de verdad: capital × [(1+EA)^(días/365) − 1], no la tasa dividida por meses`,
          'Está cubierto por el seguro de depósitos de Fogafín hasta el tope vigente por persona y entidad',
          'Los CDT desmaterializados no cobran comisión de apertura: si te la cobran, preguntá por qué',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Sobre los intereses te retienen el ${(RETENCION_RENDIMIENTOS * 100).toFixed(0)}% en la fuente (DUR 1625/2016 art. 1.2.4.2.5). Esa retención es un anticipo de tu renta, no un impuesto perdido: se acredita en la declaración`,
          'Si lo cancelás antes del vencimiento perdés la tasa pactada, cuando el banco lo permite',
          'A 90 días la tasa suele quedar por debajo del IPC: mirá la tasa real, no la nominal',
        ],
        plazo: 'la tasa se pacta el día de apertura; comparar dos o tres entidades el mismo día puede valer un punto entero.',
      },
      {
        id: 'fic',
        label: 'Un fondo de inversión colectiva (FIC)',
        hint: 'Liquidez diaria · la comisión muerde',
        answer: 'El FIC te da liquidez casi diaria, pero la comisión de administración se cobra siempre, gane o pierda.',
        yes: [
          'Rescate en 0 a 3 días hábiles según el reglamento del fondo: es lo más líquido después de la cuenta de ahorro',
          'Montos de entrada bajos, desde unos cientos de miles de pesos',
          'Está vigilado por la Superintendencia Financiera y el prospecto y el portafolio son públicos (Decreto 2555 de 2010)',
          'En FIC de renta fija la retención sobre rendimientos es la misma del resto: no hay régimen especial',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La comisión de administración se descuenta del valor de la unidad todos los días, rinda o no rinda el fondo: es el costo que más pesa en el largo plazo',
          'La rentabilidad histórica que publica el fondo NO está garantizada y suele mostrarse bruta de comisión',
          'Ojo con la letra chica: administración, custodia y a veces comisión de éxito son tres cobros distintos',
          'Un FIC de renta variable puede darte rendimiento negativo: el capital no está garantizado',
        ],
        plazo: 'pedí la ficha técnica del fondo y mirá la comisión efectiva anual, no la nominal del prospecto.',
      },
      {
        id: 'tes',
        label: 'Títulos TES del Gobierno',
        hint: 'Riesgo soberano · cupones semestrales',
        answer: 'Los TES son deuda del Estado colombiano: el menor riesgo de crédito del mercado local, pero el precio se mueve.',
        yes: [
          'Cupón periódico más devolución del principal al vencimiento',
          'Si los mantenés hasta el vencimiento cobrás la tasa de compra, sin importar cómo se movió el precio en el medio',
          'Se compran por comisionista de bolsa o en algunas plataformas del propio Ministerio de Hacienda',
          'Existen TES en pesos y TES UVR, que indexan el capital a la inflación',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los cupones son rendimientos financieros y llevan la retención general; no son ganancia ocasional ni tienen una tarifa del 10% propia',
          'Si vendés antes del vencimiento podés perder plata: cuando suben las tasas de mercado, el precio del título baja',
          'La comisión del comisionista se come buena parte del rendimiento en montos chicos',
        ],
        plazo: 'el rendimiento que importa es la TIR de compra, no el cupón nominal impreso en el título.',
      },
      {
        id: 'digital',
        label: 'Una cajita o bolsillo digital',
        hint: `Nu ${AHORRO_DIGITAL.nuCajitasEaPct}% EA vs Nequi ${AHORRO_DIGITAL.nequiEaPct}% EA`,
        answer: `La diferencia entre cajitas digitales es brutal: ${AHORRO_DIGITAL.nuCajitasEaPct}% EA contra ${AHORRO_DIGITAL.nequiEaPct}% EA por el mismo dinero.`,
        yes: [
          `Cajitas de Nu: ${AHORRO_DIGITAL.nuCajitasEaPct}% EA con liquidez inmediata, sin plazo mínimo`,
          `Bolsillos de Nequi: ${AHORRO_DIGITAL.nequiEaPct}% EA — prácticamente cero, son para ordenar la plata, no para que rinda`,
          'Liquidez total: sacás la plata cuando querés, sin penalidad',
          'Los rendimientos se liquidan y capitalizan a diario en la mayoría de estos productos',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Un bolsillo al ${AHORRO_DIGITAL.nequiEaPct}% EA con inflación cerca del ${IPC_REFERENCIA}% te hace perder poder de compra todos los meses: no es ahorro, es guardar`,
          'Las tasas promocionales de las fintech cambian sin aviso: la que ves hoy puede no ser la del mes que viene',
          'Verificá que la entidad esté vigilada por la Superintendencia Financiera y cubierta por seguro de depósitos',
        ],
        plazo: 'son cuentas de vista: podés mover la plata hoy mismo si aparece una tasa mejor.',
      },
      {
        id: 'dolares',
        label: 'Dólares en un banco internacional',
        hint: 'Cobertura cambiaria · comisiones en USD',
        answer: 'En dólares tu rendimiento real depende más de la TRM que de la tasa que te paguen.',
        yes: [
          `Con la TRM en ${cop(TRM)} (${TRM_FECHA}) cada dólar que comprás vale eso hoy; tu retorno en pesos es la tasa en USD más la variación de la TRM`,
          'Diversificás el riesgo de tener todo tu ahorro en una sola moneda',
          'Las cuentas remuneradas en USD del exterior suelen pagar bastante más que las cuentas en dólares locales',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las comisiones de mantenimiento se cobran en dólares y son fijas: en saldos chicos se comen todo el interés',
          'Si tenés activos en el exterior por encima de los topes de la DIAN tenés que declararlos, y hay sanción específica por omitirlos',
          'La TRM puede bajar: un buen rendimiento en dólares puede terminar en pérdida medido en pesos',
          'Sumá el spread de cambio de ida y de vuelta: es un costo que ninguna tabla de tasas muestra',
        ],
        plazo: 'el costo real de entrar y salir es el spread contra la TRM, no la comisión declarada.',
      },
      {
        id: 'finca',
        label: 'Finca raíz para poner en arriendo',
        hint: 'Renta más valorización · cero liquidez',
        answer: 'La finca raíz combina un canon mensual con valorización, pero es lo menos líquido de la lista.',
        yes: [
          'Canon mensual que se reajusta cada año, más la valorización del inmueble',
          'El canon de arrendamiento de vivienda urbana se puede reajustar hasta el IPC del año anterior (Ley 820 de 2003, art. 20)',
          'El inmueble sirve de garantía y respalda otros créditos',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Restá siempre predial, administración, seguros, reparaciones y los meses vacíos: el yield bruto del aviso nunca es el que te queda',
          'Los intereses de crédito de vivienda se deducen hasta 1.200 UVT al año (art. 119 ET), no hasta un monto fijo en pesos',
          'La ganancia por vender el inmueble tributa como ganancia ocasional al 15% (art. 313 ET); la exención de las primeras 5.000 UVT del art. 311-1 ET es sólo para la casa de habitación',
          'Vender tarda meses y la comisión inmobiliaria se lleva varios puntos del precio',
        ],
        plazo: 'calculá el yield sobre el precio total pagado (incluidos gastos de cierre), no sobre el precio de lista.',
      },
    ],
  },

  inputsTitle: 'Tu plata y las condiciones que te ofrecen',
  inputsIntro:
    'Cargá la tasa que efectivamente te están ofreciendo para la opción que elegiste arriba. Si no la tenés a mano, dejá el ejemplo y volvé después con el número real.',
  fields: [
    {
      id: 'monto',
      label: 'Cuánto vas a poner (COP)',
      prefix: '$',
      value: '20.000.000',
      thousands: true,
      help: 'El capital que vas a inmovilizar, sin contar tu fondo de emergencia.',
    },
    {
      id: 'plazo',
      label: 'Por cuántos meses',
      type: 'number',
      value: 12,
      min: 1,
      max: 360,
      step: 1,
      help: 'Cuánto tiempo podés dejarla quieta sin necesitarla.',
    },
    {
      id: 'tasa',
      label: 'Tasa efectiva anual que te ofrecen (% EA)',
      suffix: '% EA',
      type: 'number',
      value: 10.2,
      min: 0,
      max: 60,
      step: 0.01,
      help: `Pedila siempre en EA para poder comparar. Referencias: cajita Nu ${AHORRO_DIGITAL.nuCajitasEaPct}% EA, bolsillo Nequi ${AHORRO_DIGITAL.nequiEaPct}% EA. En finca raíz, poné acá el yield anual del canon más la valorización esperada.`,
    },
    {
      id: 'comision',
      label: 'Comisión anual del producto (%)',
      suffix: '% anual',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 0.01,
      help: 'Administración más custodia en un FIC; comisión del comisionista en TES; administración y predial en finca raíz. En un CDT normalmente es 0.',
    },
    {
      id: 'inflacion',
      label: 'Inflación esperada del período (% anual)',
      suffix: '% anual',
      type: 'number',
      value: IPC_REFERENCIA,
      min: 0,
      max: 50,
      step: 0.1,
      help: `El IPC del último año cerrado fue ${IPC_REFERENCIA}%, el mismo que se usó para reajustar las pensiones. Cambialo si tenés una expectativa propia.`,
    },
    {
      id: 'gmf',
      label: '¿Retirás por una cuenta con 4×1000?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No: uso mi cuenta exenta marcada' },
        { value: 'si', label: 'Sí: sale por una cuenta gravada' },
      ],
      help: `Cada persona puede marcar una cuenta exenta hasta ${GMF.exencionMensualUvt} UVT al mes (${cop(GMF.exencionMensualUvt * UVT)}). El 4×1000 se cobra por retiro, no todos los años.`,
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde se va tu rendimiento bruto',
    caption:
      'De cada peso que rinde tu inversión, esto es lo que se lleva la retención en la fuente, lo que se lleva la comisión del producto, lo que se lleva el 4×1000 y cuánto te come la inflación. Lo que queda en verde es tu ganancia real: lo único que aumenta tu poder de compra.',
  },
  breakdownTitle: 'De la tasa que te prometen a la plata que te queda',
  breakdownIntro:
    'En orden: rendimiento bruto capitalizado, retención, comisión, 4×1000, resultado nominal y por último el mismo resultado medido en plata de hoy.',

  faq: [
    {
      q: '¿Cuánto me retienen por los rendimientos de un CDT o una cuenta de ahorro?',
      a: `El ${(RETENCION_RENDIMIENTOS * 100).toFixed(0)}% sobre los intereses, que es la tarifa general de retención en la fuente por rendimientos financieros (art. 3 del Decreto 700 de 1997, hoy art. 1.2.4.2.5 del DUR 1625 de 2016). Aplica igual a CDT, cuentas de ahorro, FIC de renta fija y cupones de TES. No es un impuesto adicional: es un anticipo de tu impuesto de renta y se acredita cuando declarás. Si al final del año no quedás obligado a declarar o tu impuesto da menos que lo retenido, esa plata vuelve como saldo a favor.`,
    },
    {
      q: '¿Los rendimientos financieros son ganancia ocasional?',
      a: 'No, y es una confusión cara. Los rendimientos financieros son renta ordinaria y llevan la retención general por rendimientos. La ganancia ocasional es otra cosa: venta de activos que tuviste dos años o más, herencias, donaciones y loterías, y su tarifa general es del 15% (art. 313 del Estatuto Tributario), 20% en loterías y similares. Un FIC de liquidez no genera ganancia ocasional por sus rendimientos.',
    },
    {
      q: '¿Qué es la rentabilidad real y por qué importa más que la nominal?',
      a: `La nominal es la tasa que te promete la entidad. La real es lo que te queda después de la inflación, y es la única que dice si tu plata compra más o menos que antes. Se calcula con la fórmula de Fisher: (1 + nominal) ÷ (1 + inflación) − 1, no simplemente restando. Con inflación del ${IPC_REFERENCIA}%, una cuenta que paga ${AHORRO_DIGITAL.nequiEaPct}% EA no te está haciendo ganar casi nada: te está haciendo perder poder de compra cada mes que pasa.`,
    },
    {
      q: '¿Cuánto rinde una cajita digital comparada con un bolsillo?',
      a: `La diferencia es enorme para el mismo dinero y la misma liquidez: las cajitas de Nu pagan ${AHORRO_DIGITAL.nuCajitasEaPct}% EA y los bolsillos de Nequi ${AHORRO_DIGITAL.nequiEaPct}% EA. Sobre diez millones de pesos en un año eso es una diferencia de más de un millón de pesos, sin ningún costo de cambiarse ni plazo mínimo. Es probablemente la decisión de mayor retorno por minuto invertido de toda esta lista. Eso sí: las tasas promocionales de las fintech se mueven, así que revisá la vigente antes de mover la plata.`,
    },
    {
      q: '¿Cómo funciona el 4×1000 y cuándo lo puedo evitar?',
      a: `El gravamen a los movimientos financieros cobra ${(GMF.tasa * 1000).toFixed(0)} pesos por cada mil que salen de tu cuenta. Se cobra por retiro, no como un porcentaje anual de lo que tenés guardado: por eso está mal cualquier cuenta que lo aplique como un costo que corre todos los años sobre el capital. Toda persona natural puede marcar UNA cuenta de ahorro como exenta hasta ${GMF.exencionMensualUvt} UVT al mes (${cop(GMF.exencionMensualUvt * UVT)} con la UVT vigente), según el art. 879 del Estatuto Tributario. Si no la marcaste, andá al banco: es gratis y es el trámite que más plata devuelve por minuto.`,
    },
    {
      q: '¿Conviene un CDT a 90, 180 o 360 días?',
      a: 'Depende de dos cosas: la curva de tasas que te ofrezca la entidad y cuándo vas a necesitar la plata. La tasa casi siempre sube con el plazo, así que a 360 días vas a conseguir más que a 90. El punto en contra es que quedás inmovilizado: si necesitás la plata antes, o no podés sacarla o perdés la tasa pactada. Una salida intermedia es escalonar: partir el monto en tres CDT que vencen en momentos distintos, para tener liquidez cada tanto sin resignar toda la tasa.',
    },
    {
      q: '¿Qué diferencia hay entre un CDT y un FIC?',
      a: 'El CDT te fija la tasa de entrada y te devuelve exactamente lo pactado al vencimiento, pero te inmoviliza la plata. El FIC no te promete ninguna tasa: su valor sube o baja según cómo le vaya al portafolio, y a cambio te da liquidez casi diaria. El otro contraste clave es el costo: el CDT normalmente no cobra comisión, mientras que el FIC descuenta la administración todos los días, rinda o no rinda. En plazos largos esa comisión es lo que más define el resultado final.',
    },
    {
      q: '¿Ahorrar en dólares me protege de verdad?',
      a: `Te protege del riesgo de que el peso se devalúe, pero te expone al riesgo contrario. Tu rendimiento en pesos es la tasa que te pagan en dólares más lo que se mueva la TRM, que hoy está en ${cop(TRM)} (${TRM_FECHA}, Superintendencia Financiera). Si la TRM baja, podés tener un buen rendimiento en dólares y una pérdida medida en pesos. Sumale que las comisiones de mantenimiento se cobran en dólares y son fijas: en saldos chicos se llevan todo el interés. Y no olvides el spread de compra y de venta, que es un costo de ida y vuelta que ninguna tabla de tasas muestra.`,
    },
    {
      q: '¿Y el dólar paralelo o "blue"?',
      a: 'En Colombia no existe un mercado paralelo relevante como en otros países de la región, porque el peso es de libre convertibilidad y no hay cepo cambiario. La referencia oficial es la TRM que certifica la Superintendencia Financiera todos los días hábiles. Lo que sí vas a encontrar es una diferencia entre la TRM y el precio que te cobra efectivamente una casa de cambio o tu banco: eso no es un mercado paralelo, es el spread comercial de la entidad, y conviene compararlo entre dos o tres antes de cambiar montos grandes.',
    },
    {
      q: '¿La finca raíz rinde más que la renta fija?',
      a: 'A veces sí, pero la comparación honesta tiene que incluir lo que casi nadie suma. Del lado de la finca raíz hay que restar predial, administración, seguros, reparaciones, la comisión de administración inmobiliaria y los meses en que el inmueble está vacío. Hay que sumar los gastos de cierre de la compra, que no son menores. Y hay que recordar que al vender pagás ganancia ocasional al 15% y comisión inmobiliaria. Con todo eso adentro, un yield bruto del 8% suele quedar bastante más abajo. La otra diferencia grande es la liquidez: un CDT vence, un inmueble hay que venderlo, y eso puede tardar meses.',
    },
    {
      q: '¿Qué pasa si la rentabilidad real me da negativa?',
      a: 'Significa que al final del período vas a tener más pesos pero vas a poder comprar menos cosas. No siempre es un error: para tu fondo de emergencia la liquidez vale más que la tasa, y ahí una rentabilidad real levemente negativa es el precio de tener la plata disponible. El problema es cuando eso pasa con el ahorro de largo plazo, que es plata que no vas a tocar: ahí una tasa real negativa sostenida durante años es una pérdida grande y silenciosa.',
    },
    {
      q: '¿Tengo que declarar estos rendimientos ante la DIAN?',
      a: 'Los rendimientos financieros son ingreso del año en que se causan y van en tu declaración de renta si quedás obligado a declarar. La retención que te practicaron se acredita contra el impuesto liquidado. Tené presente además que las consignaciones y el patrimonio bruto al 31 de diciembre son dos de los topes que te obligan a declarar, así que una inversión grande puede meterte en la obligación aunque tu sueldo no lo hiciera. Si tenés cuentas o inversiones en el exterior, hay obligaciones informativas propias y sanciones específicas por omitir activos.',
    },
  ],

  sources: [
    {
      name: 'DUR 1625 de 2016, art. 1.2.4.2.5 — retención en la fuente sobre rendimientos financieros',
      url: 'https://estatuto.co/decreto-1625-de-2016',
      publisher: 'DIAN',
    },
    {
      name: 'Estatuto Tributario, art. 879 — exenciones del gravamen a los movimientos financieros',
      url: 'https://estatuto.co/879',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 313 — tarifa del impuesto de ganancias ocasionales',
      url: 'https://estatuto.co/313',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 119 — deducción de intereses de crédito de vivienda',
      url: 'https://estatuto.co/119',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Tasa de cambio representativa del mercado (TRM) — serie oficial',
      url: 'https://www.datos.gov.co/d/32sa-8pi3',
      publisher: 'Superintendencia Financiera de Colombia',
      date: TRM_FECHA,
    },
    {
      name: 'Tasas de captación y rentabilidad de fondos de inversión colectiva',
      url: 'https://www.superfinanciera.gov.co/',
      publisher: 'Superintendencia Financiera de Colombia',
    },
    {
      name: 'Índice de precios al consumidor (IPC)',
      url: 'https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-precios-al-consumidor-ipc',
      publisher: 'DANE',
    },
    {
      name: 'Decreto 2555 de 2010 — régimen de los fondos de inversión colectiva',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?id=1502182',
      publisher: 'Presidencia de la República',
    },
    {
      name: 'Ley 820 de 2003, art. 20 — reajuste del canon de arrendamiento de vivienda urbana',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0820_2003.html',
      publisher: 'Congreso de la República',
    },
  ],

  replaces: [
    '/co/calculadora-ahorro-en-pesos-vs-cdt-vs-fic-vs-tes-colombia',
    '/co/calculadora-cdt-colombia-rentabilidad-90-180-360-dias',
    '/co/calculadora-rentabilidad-fondo-inversion-colectiva-fic-colombia',
    '/co/calculadora-titulos-tes-colombia-rendimiento-vencimiento',
    '/co/calculadora-rendimiento-cajitas-nu-nequi-bolsillos-colombia',
    '/co/calculadora-ahorros-en-dolares-colombia-bancos-internacionales-2026',
    '/co/calculadora-rentabilidad-finca-raiz-colombia-renta-fija-comparada',
    '/co/calculadora-trm-dolar-hoy-pesos-colombianos',
    '/co/calculadora-tasa-de-cambio-paralelo-colombia-dolar-blue',
  ],

  lastReviewed: '2026-07-28',
};
