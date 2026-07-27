import type { HubData } from './types';

/**
 * Hub de decisión — "Impuesto a la renta en Perú: ¿cuánto pago?"
 *
 * Números tomados de src/lib/formulas/impuesto-renta-peru.ts: tabla del Art. 53
 * de la LIR en UIT, deducción de 7 UIT y deducción del 20% de la 4ta categoría
 * con tope de 24 UIT.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** UIT vigente: S/ 5.500 (Decreto Supremo 301-2025-EF, vigente desde el 01-01-2026). */
export const UIT = 5_500;
export const UIT_ANIO = 2026;

/** Tabla progresiva del Art. 53 LIR, en UIT acumuladas. Espejo exacto de la fórmula. */
export const TABLA_RENTA_PE: Array<{ hastaUit: number | null; tasa: number }> = [
  { hastaUit: 5, tasa: 8 },
  { hastaUit: 20, tasa: 14 },
  { hastaUit: 35, tasa: 17 },
  { hastaUit: 45, tasa: 20 },
  { hastaUit: null, tasa: 30 },
];

/** Deducción fija de rentas de trabajo: 7 UIT. */
export const DEDUCCION_UIT = 7;
/** 4ta categoría: 20% de deducción con tope de 24 UIT. */
export const DEDUCCION_4TA = 0.2;
export const TOPE_4TA_UIT = 24;

export const hub: HubData = {
  slug: 'impuestos/renta-peru',
  title: 'Impuesto a la renta en Perú: ¿cuánto pago? — 4ta y 5ta categoría',
  description:
    'Calculá tu impuesto a la renta de trabajo en Perú: deducción del 20% para la 4ta categoría, deducción de 7 UIT y la escala progresiva del Art. 53 de la LIR, con la UIT vigente.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Perú · rentas de trabajo',
  h1: 'Impuesto a la renta en Perú: cuánto te toca pagar.',
  lede:
    'Partimos del caso más habitual: 5ta categoría, en planilla. Vas a ver cuánto se descuenta por las 7 UIT, cuánto queda como renta neta y cómo la escala progresiva la parte en tramos.',
  stamps: [`UIT ${UIT_ANIO}: S/ ${UIT.toLocaleString('es-PE')}`, 'Art. 53 de la Ley del Impuesto a la Renta', 'Rentas de trabajo 4ta y 5ta'],

  resultLabel: 'Impuesto anual estimado',

  cases: {
    title: '¿De qué categoría son tus ingresos?',
    intro: 'La categoría cambia las deducciones antes de aplicar la escala. Elegí la tuya.',
    items: [
      {
        id: '5ta',
        label: '5ta categoría (en planilla)',
        hint: 'Trabajo dependiente',
        answer: 'En 5ta categoría solo se descuentan las 7 UIT antes de la escala.',
        yes: [
          'Se resta la deducción fija de 7 UIT sobre el ingreso anual',
          'El resto se grava con la escala progresiva del Art. 53 LIR',
          'El empleador retiene el impuesto mes a mes y lo declara por vos',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La deducción adicional de hasta 3 UIT por gastos (alquiler, servicios profesionales, restaurantes, aportes EsSalud del trabajador del hogar) se carga en el campo de deducciones adicionales: no es automática',
        ],
        plazo: 'si tuviste un solo empleador todo el año, en general no te toca presentar declaración anual.',
      },
      {
        id: '4ta',
        label: '4ta categoría (recibo por honorarios)',
        hint: 'Trabajo independiente',
        answer: 'En 4ta categoría se descuenta primero un 20%, con tope de 24 UIT.',
        yes: [
          'Deducción del 20% del ingreso bruto, con tope de 24 UIT',
          'Después se resta la deducción fija de 7 UIT',
          'Sobre lo que queda corre la misma escala progresiva del Art. 53 LIR',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El 20% no aplica a los ingresos por funciones de director, síndico, mandatario, gestor de negocios, albacea ni actividades similares',
        ],
        plazo: 'podés pedir la suspensión de retenciones y pagos a cuenta si proyectás no superar el mínimo del año.',
      },
    ],
  },

  inputsTitle: 'Tus cifras del ejercicio',
  inputsIntro: 'Todo en soles y en valores anuales. Podés dejar el ejemplo y volver después.',
  fields: [
    {
      id: 'ingreso',
      label: 'Ingreso anual bruto (S/)',
      prefix: 'S/',
      value: '80.000',
      thousands: true,
      help: 'Sumá los 12 sueldos más gratificaciones, o el total facturado por honorarios en el año.',
    },
    {
      id: 'deduccionesAd',
      label: 'Deducciones adicionales (S/)',
      prefix: 'S/',
      value: '0',
      thousands: true,
      help: 'Hasta 3 UIT por gastos sustentados con comprobante electrónico: alquiler, servicios profesionales, restaurantes y hoteles, aportes EsSalud del trabajador del hogar.',
    },
    {
      id: 'retenciones',
      label: 'Retenciones ya practicadas en el año (S/)',
      prefix: 'S/',
      value: '0',
      thousands: true,
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De dónde sale el impuesto',
    caption:
      'Compara lo que las deducciones dejan fuera del impuesto, la renta neta que sí queda gravada y el impuesto que sale de la escala.',
  },
  breakdownTitle: 'Cómo se arma tu impuesto',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande.',

  faq: [
    {
      q: '¿Cuál es la UIT vigente y para qué sirve?',
      a: `La UIT es la unidad de referencia con la que la ley tributaria peruana expresa deducciones, tramos y multas para que se actualicen cada año. La vigente es de S/ ${UIT.toLocaleString('es-PE')}, fijada por el Decreto Supremo 301-2025-EF con efecto desde el 1 de enero de ${UIT_ANIO}. La deducción fija de rentas de trabajo y toda la escala del Art. 53 se miden en UIT.`,
    },
    {
      q: '¿Desde qué ingreso empiezo a pagar impuesto a la renta?',
      a: `Recién cuando la renta neta supera cero, es decir cuando el ingreso pasa la deducción de 7 UIT (S/ ${(7 * UIT).toLocaleString('es-PE')}). En 4ta categoría el umbral es más alto porque antes se descuenta el 20%: con esa deducción el punto de arranque ronda los S/ ${Math.round((7 * UIT) / 0.8).toLocaleString('es-PE')} de ingreso bruto anual.`,
    },
    {
      q: '¿Cuáles son los tramos de la escala?',
      a: 'Cinco tramos sobre la renta neta de trabajo: 8% hasta 5 UIT; 14% de 5 a 20 UIT; 17% de 20 a 35 UIT; 20% de 35 a 45 UIT; y 30% de 45 UIT en adelante. Cada tramo grava solo su porción, no todo el ingreso.',
    },
    {
      q: '¿Qué diferencia hay entre 4ta y 5ta categoría?',
      a: 'La 5ta es trabajo dependiente, en planilla, con el empleador reteniendo mes a mes. La 4ta es trabajo independiente por recibo por honorarios. La diferencia de cálculo es la deducción del 20% con tope de 24 UIT que solo tiene la 4ta; después ambas restan las 7 UIT y aplican la misma escala.',
    },
    {
      q: '¿Cómo funciona la deducción adicional de 3 UIT?',
      a: 'Es un beneficio sobre gastos sustentados con comprobante electrónico y pagados por medios bancarizados: alquiler de vivienda, servicios de profesionales de la salud y otros oficios, consumos en restaurantes y hoteles, y aportes a EsSalud del trabajador del hogar. Cada rubro deduce un porcentaje del gasto y el total no puede superar 3 UIT.',
    },
    {
      q: '¿Puedo suspender las retenciones de 4ta categoría?',
      a: 'Sí. Si proyectás que tus ingresos anuales no van a superar el monto que SUNAT publica cada año, podés pedir la suspensión de retenciones y pagos a cuenta desde el propio portal. Aprobada, tus clientes dejan de retenerte el 8%.',
    },
    {
      q: '¿Tengo que presentar declaración anual?',
      a: 'Si solo tuviste 5ta categoría con un empleador, normalmente no. Sí corresponde si tuviste 4ta categoría, más de un empleador, saldo por regularizar, o querés usar la deducción adicional de 3 UIT y pedir la devolución de lo retenido de más.',
    },
    {
      q: '¿Qué pasa si me retuvieron de más?',
      a: 'Queda saldo a favor. Con la declaración anual pedís la devolución o lo compensás. SUNAT también corre una devolución de oficio para muchos contribuyentes de rentas de trabajo, pero conviene revisar el resultado y no darlo por hecho.',
    },
    {
      q: '¿Las gratificaciones y la CTS pagan impuesto a la renta?',
      a: 'Las gratificaciones de julio y diciembre son renta de 5ta categoría y sí entran en la base. La CTS, en cambio, no está afecta al impuesto a la renta de trabajo: es un beneficio social con tratamiento propio.',
    },
    {
      q: '¿La tasa del 30% se aplica a todo mi ingreso?',
      a: 'No. Es la tasa marginal del último tramo: solo grava la parte de la renta neta que pasa las 45 UIT. Tu tasa efectiva —impuesto dividido ingreso bruto— siempre queda bastante por debajo.',
    },
    {
      q: '¿La AFP o la ONP se descuentan de la base?',
      a: 'No se restan como deducción del impuesto a la renta de trabajo: el sistema peruano reemplazó las deducciones por gastos por la deducción fija de 7 UIT. Los aportes previsionales se descuentan del sueldo, pero la base del impuesto se calcula sobre la remuneración bruta.',
    },
  ],

  sources: [
    {
      name: 'SUNAT — Unidad Impositiva Tributaria (UIT) por año',
      url: 'https://www.sunat.gob.pe/indicestasas/uit.html',
      publisher: 'SUNAT',
    },
    {
      name: 'SUNAT — Rentas de trabajo: 4ta y 5ta categoría',
      url: 'https://www.sunat.gob.pe/orientacion/rentasTrabajo/index.html',
      publisher: 'SUNAT',
    },
    {
      name: 'MEF — Decretos Supremos (valor de la UIT, DS 301-2025-EF)',
      url: 'https://www.mef.gob.pe/es/normatividad-sp-9322/por-instrumento/decretos-supremos',
      publisher: 'Ministerio de Economía y Finanzas del Perú',
    },
  ],

  replaces: ['/calculadora-impuesto-renta-peru-4ta-5ta-2026'],

  lastReviewed: '2026-07-27',
};
