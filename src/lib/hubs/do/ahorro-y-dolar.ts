import type { HubData } from '../types';
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  EUR_DOP_2026,
} from '../../data/republica-dominicana-2026';
import live from '../../../data/live/dominicana.json';

/**
 * Hub de decisión DO — "¿Dónde pongo mis pesos: certificado, san o dólares?"
 *
 * El IPC sale del dato vivo (src/data/live/dominicana.json, serie del BCRD) con
 * fallback al último cierre conocido. Las cotizaciones son un snapshot del BCRD:
 * cambian a diario y el usuario las puede sobrescribir.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'investment'). */
const DISCLAIMER_INVESTMENT =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.';

/** Retención de ISR sobre intereses pagados a personas físicas residentes (Norma 07-19). */
export const RETENCION_INTERESES = 0.10;

/** Cotizaciones de referencia del BCRD. Cambian a diario: el campo queda editable. */
export const FX = {
  usdMid: RD.fx.usdMid,
  usdCompra: RD.fx.usdCompra,
  usdVenta: RD.fx.usdVenta,
  eurMid: EUR_DOP_2026.mid,
  fecha: RD.fx.fecha,
};

/** IPC del BCRD — variación interanual del dato vivo, con fallback al cierre conocido. */
const IPC_LIVE: any = (live as any)?.ipc ?? null;
export const IPC = {
  interanual: typeof IPC_LIVE?.variacionInteranual === 'number' ? IPC_LIVE.variacionInteranual : 4.95,
  periodo: typeof IPC_LIVE?.periodo === 'string' ? IPC_LIVE.periodo : '2025-12',
};

const dop = (n: number) => 'RD$ ' + Math.round(n).toLocaleString('de-DE');
const pct = (n: number) => n.toLocaleString('es', { maximumFractionDigits: 2 }) + '%';

export const hub: HubData = {
  slug: 'do/finanzas/ahorro-y-dolar',
  title: 'Certificado financiero, san o dólares: dónde rinde más tu plata en RD',
  description:
    'Compará el rendimiento neto de un certificado financiero (con la retención del 10%), el san de ahorro rotativo y el dólar, contra la inflación del IPC del Banco Central de la República Dominicana.',
  silo: 'Finanzas',
  siloHref: '/do/finanzas',
  locale: 'do',

  eyebrow: 'República Dominicana · BCRD · ahorro',
  h1: '¿Tu plata rinde o sólo aguanta la inflación?',
  lede:
    'Un certificado paga interés pero la DGII retiene el 10%; el san no paga nada pero te obliga a ahorrar; el dólar sube cuando el peso se deprecia. La única comparación que importa es contra la inflación: acá salen las tres, en términos reales.',
  stamps: [
    `Inflación interanual (IPC BCRD): ${pct(IPC.interanual)}`,
    `Retención sobre intereses: ${Math.round(RETENCION_INTERESES * 100)}%`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Lo que retirás al vencimiento',

  cases: {
    title: '¿Qué estás evaluando?',
    intro:
      'Cada instrumento resuelve un problema distinto: uno da rendimiento, otro da disciplina y otro da cobertura frente al peso.',
    items: [
      {
        id: 'certificado',
        label: 'Un certificado financiero a plazo',
        hint: 'Depósito a plazo fijo · retención del 10%',
        answer: 'Lo que importa es la tasa neta después de la retención, comparada con la inflación.',
        yes: [
          'Interés = capital × tasa anual × plazo en años',
          'Las entidades retienen el ' + Math.round(RETENCION_INTERESES * 100) + '% de ISR sobre los intereses, como pago único y definitivo',
          'El capital está garantizado por el Fondo de Contingencia dentro de los límites de la ley',
          'La comparación válida es contra la inflación, no contra cero',
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'Retirar antes del vencimiento suele implicar penalidad o pérdida de intereses: leé la cláusula de cancelación anticipada',
          'Una tasa nominal por debajo de la inflación es pérdida de poder de compra aunque el saldo suba',
        ],
        plazo: 'la retención la hace la entidad al pagar los intereses: no tenés que declararla aparte.',
      },
      {
        id: 'san',
        label: 'Un san o ahorro rotativo',
        hint: 'Ahorro colectivo informal',
        answer: 'El san no genera rendimiento: lo que da es disciplina, y el turno lo cambia todo.',
        yes: [
          'Bolsa = aporte por período × cantidad de participantes',
          'El ciclo dura tantos períodos como personas haya',
          'Turno temprano: funciona como un préstamo sin interés',
          'Turno tardío: funciona como ahorro forzoso sin rendimiento',
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'El san no tiene respaldo legal ni garantía: depende enteramente de la confianza en quien lo organiza y en el resto del grupo',
          'Con turno tardío estás prestando plata gratis mientras la inflación te la erosiona: compará contra un certificado antes de entrar',
        ],
        plazo: 'no hay recurso formal si alguien deja de aportar: el riesgo es reputacional, no contractual.',
      },
      {
        id: 'dolar',
        label: 'Comprar y guardar dólares',
        hint: 'USD/DOP · BCRD',
        answer: 'Cubre la depreciación del peso, pero el efectivo en dólares tampoco genera interés.',
        yes: [
          'El peso dominicano se deprecia de forma ordenada, sin saltos bruscos',
          'La brecha entre compra y venta es tu costo de entrada y salida',
          'Existen certificados en dólares, con tasas más bajas que los de pesos',
          'Es cobertura, no inversión: guardar billetes no genera rendimiento',
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'Las cotizaciones de esta cuenta son un snapshot de referencia del BCRD y cambian todos los días: sobrescribí la tasa con la del día',
          'Comprar al precio de venta y vender al de compra te hace perder el diferencial dos veces si entrás y salís seguido',
        ],
        plazo: 'consultá la tasa del día en el mercado cambiario del BCRD antes de operar.',
      },
      {
        id: 'inflacion',
        label: 'Sólo quiero saber cuánto perdió mi plata',
        hint: 'IPC del Banco Central',
        answer: 'El efectivo quieto pierde exactamente la inflación acumulada del período.',
        yes: [
          'Monto actualizado = monto original × (1 + inflación acumulada)',
          'La pérdida de poder de compra del efectivo es 1 − 1 ÷ (1 + inflación)',
          `Referencia: inflación interanual de ${pct(IPC.interanual)} según el IPC del BCRD`,
          'El Banco Central tiene una meta de 4% ± 1%',
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'La inflación promedio no es tu inflación: si tu gasto está concentrado en alimentos, transporte o electricidad, tu canasta puede subir bastante más que el índice general',
        ],
        plazo: 'el BCRD publica el IPC mensualmente, con unas semanas de rezago.',
      },
    ],
  },

  inputsTitle: 'Tu plata y las condiciones',
  inputsIntro: 'Todo en pesos dominicanos. Las tasas y cotizaciones son editables porque cambian seguido.',
  fields: [
    {
      id: 'capital',
      label: 'Capital a colocar (RD$)',
      prefix: 'RD$',
      value: 500000,
      thousands: true,
      help: 'Lo que vas a depositar en el certificado o a comparar entre alternativas.',
    },
    {
      id: 'tasaAnual',
      label: 'Tasa anual del certificado (%)',
      type: 'number',
      value: 10,
      min: 0,
      max: 40,
      step: 0.25,
      suffix: '%',
      help: 'La tasa nominal que ofrece la entidad, antes de la retención.',
    },
    {
      id: 'plazoMeses',
      label: 'Plazo en meses',
      type: 'number',
      value: 12,
      min: 1,
      max: 120,
      step: 1,
      help: 'Duración del certificado. Los plazos largos suelen pagar más.',
    },
    {
      id: 'inflacion',
      label: 'Inflación anual esperada (%)',
      type: 'number',
      value: IPC.interanual,
      min: 0,
      max: 100,
      step: 0.1,
      suffix: '%',
      help: `Precargada con la interanual del IPC del BCRD (${pct(IPC.interanual)}). Editable.`,
    },
    {
      id: 'tasaDolar',
      label: 'Cotización del dólar (RD$ por USD)',
      type: 'number',
      prefix: 'RD$',
      value: FX.usdMid,
      min: 0.01,
      step: 0.01,
      help: `Referencia del BCRD al ${FX.fecha}. Cambia a diario: poné la del día.`,
    },
    {
      id: 'aporteSan',
      label: 'Aporte por período del san (RD$)',
      prefix: 'RD$',
      value: 10000,
      thousands: true,
      help: 'El "número" del san: lo que aportás cada período.',
    },
    {
      id: 'participantesSan',
      label: 'Participantes del san',
      type: 'number',
      value: 10,
      min: 2,
      max: 100,
      step: 1,
      help: 'Cantidad de personas en el grupo. Define la bolsa y la duración del ciclo.',
    },
    {
      id: 'turnoSan',
      label: 'Tu turno en el san',
      type: 'number',
      value: 3,
      min: 1,
      max: 100,
      step: 1,
      help: 'Turno 1 es el primero en cobrar. Cuanto más temprano, mejor te conviene.',
    },
  ],
  fineprint: DISCLAIMER_INVESTMENT,

  chart: {
    type: 'donut',
    title: 'Qué queda de tu rendimiento',
    caption:
      'Del interés bruto hay que restarle la retención del 10% y después la inflación del período. Lo que sobra —si sobra— es la ganancia real: eso es lo único que aumenta tu poder de compra.',
  },
  breakdownTitle: 'Las tres alternativas, con los mismos pesos',
  breakdownIntro:
    'Certificado, san y dólar sobre el mismo capital, medidos contra la inflación del período. Montos en pesos dominicanos.',

  faq: [
    {
      q: '¿Cuánto se retiene por los intereses de un certificado financiero?',
      a: `El ${Math.round(RETENCION_INTERESES * 100)}% de ISR sobre los intereses pagados a personas físicas residentes, según la Norma 07-19 de la DGII. Es un pago único y definitivo: la entidad lo retiene al acreditar los intereses y vos no tenés que declararlo aparte. Por eso la tasa que importa no es la que anuncia el banco sino esa misma tasa reducida en un 10%.`,
    },
    {
      q: '¿Cómo sé si mi certificado le gana a la inflación?',
      a: `Compará la tasa neta —la nominal menos la retención— con la inflación esperada del mismo período. Con la interanual del IPC del Banco Central en ${pct(IPC.interanual)}, un certificado al 10% nominal deja alrededor de 9% neto, así que la ganancia real es de apenas unos puntos. Si la tasa neta queda por debajo de la inflación, el saldo sube pero tu poder de compra baja.`,
    },
    {
      q: '¿El capital de un certificado está garantizado?',
      a: 'Los depósitos en entidades de intermediación financiera reguladas están cubiertos por el Fondo de Contingencia hasta los límites que fija la Ley Monetaria y Financiera 183-02. Es una cobertura por depositante y por entidad, así que repartir el capital entre varias entidades amplía la protección. Consultá el monto vigente en la Superintendencia de Bancos.',
    },
    {
      q: '¿Cómo funciona un san?',
      a: 'Un grupo aporta un monto fijo cada semana, quincena o mes, y por turnos cada integrante se lleva la bolsa completa. Si son diez personas aportando diez mil pesos al mes, la bolsa es de cien mil y el ciclo dura diez meses. No hay interés, no hay banco y no hay contrato: la garantía es la palabra de quien lo organiza.',
    },
    {
      q: '¿Conviene tener turno temprano o tardío en el san?',
      a: 'Turno temprano, sin dudas. Si cobrás segundo, recibís la bolsa entera habiendo aportado apenas dos cuotas: es un préstamo sin interés que devolvés durante el resto del ciclo. Si cobrás último, ya aportaste casi todo antes de recibir: prestaste plata gratis durante meses y encima la inflación se la comió. Por eso los primeros turnos suelen ser los más disputados.',
    },
    {
      q: '¿El san es legal?',
      a: 'No es ilegal, pero tampoco está regulado. No hay contrato exigible, no hay supervisión de la Superintendencia de Bancos y no hay fondo de garantía. Si alguien deja de aportar después de cobrar, la única vía práctica es la presión del grupo. Por eso conviene hacerlo sólo con gente conocida y con grupos chicos.',
    },
    {
      q: '¿Conviene guardar dólares en República Dominicana?',
      a: 'Como cobertura frente a la depreciación del peso, tiene sentido para quien tiene gastos o deudas en dólares. Como inversión, tenés que mirar dos cosas: el billete guardado no genera interés, y el diferencial entre el precio de compra y el de venta es un costo que pagás cada vez que entrás y salís. Existen certificados en dólares que sí pagan interés, aunque a tasas más bajas que los de pesos.',
    },
    {
      q: '¿Por qué la tasa de cambio de esta cuenta no coincide con la de mi banco?',
      a: `Porque acá se usa una tasa media de referencia del Banco Central, tomada el ${FX.fecha}, y cada entidad publica su propio precio de compra y de venta con su margen. La diferencia entre bancos y agentes de cambio para un mismo día puede ser de varios pesos por dólar. Por eso el campo es editable: poné el precio que efectivamente te ofrecen.`,
    },
    {
      q: '¿Cómo actualizo un monto por inflación?',
      a: 'Multiplicándolo por uno más la inflación acumulada del período. Si algo costaba cien mil pesos y desde entonces la inflación acumuló 15%, hoy necesitás ciento quince mil para comprar lo mismo. La otra cara es la pérdida: quien mantuvo el efectivo perdió alrededor del 13% de poder de compra, que no es lo mismo que el 15% de inflación.',
    },
    {
      q: '¿Cuál es la inflación en República Dominicana?',
      a: `La última variación interanual del IPC que publica el Banco Central es de ${pct(IPC.interanual)}, correspondiente al período ${IPC.periodo}. El BCRD tiene una meta de inflación de 4% con un rango de tolerancia de un punto hacia arriba y hacia abajo, y usa la tasa de política monetaria para mantenerla dentro de ese rango.`,
    },
    {
      q: '¿Qué me conviene si tengo deuda de tarjeta y algo ahorrado?',
      a: 'Casi siempre, pagar la deuda. Con tasas de tarjeta del 50% al 60% anual en el mercado dominicano, ningún certificado se acerca: cancelar la deuda equivale a un rendimiento garantizado igual a esa tasa, y encima libre de retención. La única razón para no hacerlo es mantener un colchón mínimo de emergencia.',
    },
  ],

  sources: [
    {
      name: 'BCRD — mercado cambiario y tasas de referencia',
      url: 'https://www.bancentral.gov.do/a/d/2538-mercado-cambiario',
      publisher: 'Banco Central de la República Dominicana',
    },
    {
      name: 'BCRD — Índice de Precios al Consumidor',
      url: 'https://www.bancentral.gov.do/a/d/2529-sector-real',
      publisher: 'Banco Central de la República Dominicana',
    },
    {
      name: 'DGII — Norma 07-19 sobre retención de intereses',
      url: 'https://dgii.gov.do/legislacion/normasGenerales/Paginas/default.aspx',
      publisher: 'Dirección General de Impuestos Internos',
    },
    {
      name: 'Superintendencia de Bancos — tasas de interés del sistema financiero',
      url: 'https://sb.gob.do/',
      publisher: 'Superintendencia de Bancos',
    },
  ],

  replaces: [
    '/do/calculadora-certificado-financiero-republica-dominicana',
    '/do/calculadora-san-ahorro-rotativo-republica-dominicana',
    '/do/calculadora-actualizacion-inflacion-ipc-republica-dominicana',
    '/do/dolar-hoy-republica-dominicana',
    '/do/calculadora-euro-a-peso-dominicano',
  ],

  lastReviewed: '2026-07-28',
};
