import type { HubData } from './types';
import dolarLive from '../../data/live/dolar.json';
import {
  INFLACION_SERIE_MENSUAL,
  INFLACION_INTERANUAL_PCT,
  INFLACION_AS_OF,
} from '../data/inflacion-serie-ar';
import { SMVM_MENSUAL, SMVM_HORA, SMVM_FECHA, SMVM_RESOLUCION } from '../data/smvm-ar-2026';
import { RIPTE_NOMINAL, RIPTE_BASE_MONTH } from '../formulas/sueldo-vs-promedio-argentino';

/**
 * Hub de decisión — "¿Mi sueldo le gana a la inflación?"
 * Arquetipo RAMIFICADO. Absorbe 12 calculadoras (ver hub.replaces).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LÍMITE CON EL HUB /finanzas-personales/dolar  (LEER ANTES DE AGREGAR NADA)
 *
 *   Este hub responde: MI INGRESO EN EL TIEMPO — ¿me alcanza?
 *   El hub de dólar responde: DÓNDE PONGO LOS PESOS — ¿en qué me conviene ahorrar?
 *
 *   Regla operativa: si el input principal es UN SUELDO, es acá. Si el input
 *   principal es UN STOCK DE PLATA que hay que colocar (o un precio en dólares),
 *   es el hub de dólar.
 *
 *   Por eso `poder-adquisitivo-sueldo-real` vive acá (parte de un sueldo), y
 *   `inflacion-poder-compra` y `plata-quieta` viven allá (parten de un monto
 *   ahorrado). La rama "en dólares" de este hub mide el SUELDO en divisa; no
 *   opina sobre comprar dólares — para eso está el otro hub, linkeado en la FAQ.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * DATOS VIVOS — nada hardcodeado:
 *  - Serie IPC mensual e interanual: src/data/live/inflacion.json (INDEC) vía
 *    src/lib/data/inflacion-serie-ar.ts.
 *  - SMVM: src/lib/data/smvm-ar-2026.ts (fuente única, la patchea el fetcher
 *    scripts/update-data/fetchers/smvm.ts). Se actualiza por resolución del
 *    CNEPySMVyM, así que el valor y su fecha viajan juntos al copy.
 *  - Cotizaciones: src/data/live/dolar.json (DolarAPI, cron de datos).
 *  - RIPTE: constante del módulo real src/lib/formulas/sueldo-vs-promedio-argentino.ts.
 *
 * NOTA DE CONTRATO: toda fila que no sea plata declara `format`/`unit`/`decimals`
 * explícitos — el runtime hace Object.assign y una fila sin format cae a pesos.
 */

const q = (dolarLive as any).quotes;
const DOLAR_FECHA = String((dolarLive as any)._meta?.fetchedAt || '').slice(0, 10);

/** Todo lo que compute() necesita del lado del cliente. Serializado, no duplicado. */
export const SUELDO_DATA = {
  /** IPC mensual %, orden ascendente (ventana móvil de ~12 meses del INDEC). */
  serie: INFLACION_SERIE_MENSUAL.map((m) => m.valor),
  inflacion12m: INFLACION_INTERANUAL_PCT,
  inflacionAsOf: INFLACION_AS_OF,
  smvmMensual: SMVM_MENSUAL,
  smvmHora: SMVM_HORA,
  smvmFecha: SMVM_FECHA,
  ripteNominal: RIPTE_NOMINAL,
  ripteMes: RIPTE_BASE_MONTH,
  dolar: {
    oficial: Number(q?.oficial?.venta) || 0,
    blue: Number(q?.blue?.venta) || 0,
    mep: Number(q?.bolsa?.venta) || 0,
    cripto: Number(q?.cripto?.venta) || 0,
  },
  dolarFecha: DOLAR_FECHA,
};

const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const hub: HubData = {
  slug: 'trabajo/sueldo-vs-inflacion',
  title: '¿Mi sueldo le gana a la inflación? Calculadora de sueldo real',
  description:
    'Compará tu aumento contra el IPC del INDEC y mirá si tu sueldo real subió o bajó. Incluye salario mínimo vigente, sueldo en dólares, comparación con el promedio argentino y cuánto vale tu hora.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Ingreso y poder adquisitivo',
  h1: '¿Tu sueldo le gana a la inflación?',
  lede:
    'Un aumento en pesos no dice nada solo: lo que importa es qué te queda después del IPC. Partimos del caso más común —te dieron un aumento y querés saber si alcanza— y desde ahí mirás tu sueldo contra el mínimo, contra el promedio, en dólares y por hora.',
  stamps: [
    `IPC del INDEC al ${INFLACION_AS_OF}`,
    `SMVM vigente ${SMVM_FECHA}`,
    '12 calculadoras adentro',
  ],

  resultLabel: 'Tu sueldo, en términos reales',

  cases: {
    title: '¿Qué querés mirar?',
    intro:
      'Todas las ramas usan los mismos datos de arriba. Cambiá la que responda tu pregunta de hoy.',
    items: [
      {
        id: 'aumento',
        label: 'Me dieron un aumento: ¿alcanza?',
        hint: 'Sueldo real vs IPC',
        answer:
          'Tu aumento le gana a la inflación sólo si supera el IPC acumulado del mismo período.',
        yes: [
          'Compara tu sueldo de antes con el de ahora usando el IPC real del INDEC del período',
          'Muestra el sueldo que necesitabas para empatar y cuánto te falta o te sobra por mes',
          'Devuelve la variación real en porcentaje, que es el número que importa',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Compará siempre bruto contra bruto o neto contra neto: mezclar los dos infla o desinfla el resultado',
          'La serie viva del INDEC cubre los últimos doce meses; para períodos más largos el tramo faltante se estima con el promedio mensual',
        ],
        plazo:
          'el IPC se publica alrededor del día 12 de cada mes: recién ahí se puede cerrar el mes anterior.',
      },
      {
        id: 'minimo',
        label: '¿Cobro más que el mínimo legal?',
        hint: 'SMVM vigente',
        answer:
          'El piso legal por jornada completa es el SMVM; por jornada reducida se paga el proporcional por hora.',
        yes: [
          'Trae el SMVM vigente fijado por resolución del CNEPySMVyM, con su valor hora oficial',
          'Calcula el mínimo proporcional a tu jornada si trabajás menos de 48 horas semanales',
          'Te dice cuántos salarios mínimos equivale tu sueldo',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El SMVM es el piso absoluto: casi todos los convenios colectivos fijan básicos más altos, así que cobrar el mínimo no significa cobrar lo que corresponde',
          'Se actualiza por resolución, no automáticamente: si la fecha del sello quedó vieja, verificá el Boletín Oficial',
        ],
        plazo:
          'los aumentos del SMVM rigen desde el mes que fija la resolución, aunque se publiquen después.',
      },
      {
        id: 'promedio',
        label: '¿Cómo estoy contra el promedio argentino?',
        hint: 'RIPTE',
        answer:
          'El RIPTE es el promedio de la remuneración de los trabajadores registrados: te ubica en la pirámide.',
        yes: [
          'Compara tu bruto contra el RIPTE, el promedio oficial de los trabajadores registrados',
          'Muestra la diferencia en pesos y en porcentaje',
          'Traduce tu sueldo a dólares para dimensionarlo fuera del peso',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El RIPTE mide sólo empleo registrado: el promedio real de toda la población ocupada es más bajo',
          'Es un promedio, no una mediana: unos pocos sueldos muy altos lo empujan para arriba',
        ],
        plazo: 'el RIPTE se publica con unos meses de rezago respecto del mes que mide.',
      },
      {
        id: 'dolares',
        label: '¿Cuánto vale mi sueldo en dólares?',
        hint: 'Oficial, blue, MEP y cripto',
        answer:
          'Tu sueldo en dólares cambia según el tipo de cambio con el que lo midas: la brecha es la diferencia.',
        yes: [
          'Convierte tu sueldo a las cuatro cotizaciones vivas: oficial, blue, MEP y cripto',
          'Muestra la brecha entre el paralelo y el oficial, que es lo que explica la diferencia',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Medir el sueldo en dólares sirve para comparar en el tiempo, no para decidir en qué ahorrar: eso se resuelve en el hub de dólar',
          'Las cotizaciones se mueven todos los días: el número vale para la fecha del sello',
        ],
        plazo: 'las cotizaciones del sello se refrescan con el cron de datos, varias veces por día.',
      },
      {
        id: 'hora',
        label: '¿Cuánto vale mi hora y mi tiempo?',
        hint: 'Hora, día, minuto y segundo',
        answer:
          'Tu valor hora es el sueldo dividido por las horas que realmente trabajás en el mes.',
        yes: [
          'Calcula tu valor hora, día, minuto y segundo a partir de tu jornada declarada',
          'Traduce el precio de lo que querés comprar a horas y días de trabajo',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Las horas mensuales salen de tu jornada semanal por 52 semanas dividido 12: si hacés horas extra el valor hora real baja',
          'El valor hora sirve para decidir, no para liquidar: las horas extra se pagan con recargo del 50% o del 100%',
        ],
        plazo:
          'la jornada legal máxima es de 48 horas semanales y 8 diarias; por encima corresponde recargo.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Dejá los valores de ejemplo para ver cómo funciona y después reemplazalos por los tuyos.',
  fields: [
    {
      id: 'sueldoActual',
      label: 'Tu sueldo de hoy',
      prefix: '$',
      value: '1.500.000',
      thousands: true,
      help: 'Usá siempre el mismo criterio que en el sueldo anterior: bruto contra bruto, o neto contra neto.',
    },
    {
      id: 'sueldoAnterior',
      label: 'Tu sueldo antes del aumento',
      prefix: '$',
      value: '1.100.000',
      thousands: true,
    },
    {
      id: 'meses',
      label: 'Hace cuántos meses cobrabas ese sueldo',
      type: 'number',
      min: 1,
      max: 120,
      value: 12,
      help: 'Con eso tomamos la inflación acumulada real del INDEC para ese período.',
    },
    {
      id: 'horasSemana',
      label: 'Horas que trabajás por semana',
      type: 'number',
      min: 1,
      max: 84,
      value: 48,
    },
    {
      id: 'precio',
      label: 'Precio de algo que querés comprar',
      prefix: '$',
      value: '900.000',
      thousands: true,
      help: 'Sólo se usa en la rama de valor del tiempo: lo traducimos a horas de trabajo.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'scale',
    title: 'Dónde caés vos',
    caption:
      'La barra es una escala con franjas y el marcador indica tu posición. Qué mide la escala cambia con la rama elegida: variación real, salarios mínimos, porcentaje del promedio, dólares o horas de trabajo.',
  },
  breakdownTitle: 'El detalle del cálculo',
  breakdownIntro:
    'Cada fila muestra de dónde sale el número principal. Las barras comparan los importes entre sí.',

  faq: [
    {
      q: '¿Cómo sé si mi aumento le ganó a la inflación?',
      a: 'No mires el porcentaje del aumento: mirá el sueldo que necesitabas para empatar. Se calcula tomando tu sueldo anterior y aplicándole el IPC acumulado del período. Si tu sueldo de hoy quedó por encima de ese número, ganaste poder adquisitivo; si quedó por debajo, perdiste, aunque el aumento en pesos haya sido grande.',
    },
    {
      q: '¿Qué es el salario real y en qué se diferencia del nominal?',
      a: 'El salario nominal es la cifra que dice el recibo. El salario real es esa cifra medida en poder de compra, es decir descontando la inflación del período. Dos sueldos nominales distintos pueden ser el mismo salario real si la diferencia se la comió el IPC.',
    },
    {
      q: '¿De dónde sale la inflación que usa la calculadora?',
      a: 'Del índice de precios al consumidor del INDEC, con la serie mensual de los últimos doce meses. Para períodos más largos que la serie disponible, el tramo faltante se estima con el promedio geométrico mensual de la serie conocida y el resultado lo aclara.',
    },
    {
      q: '¿Cuánto es el salario mínimo vital y móvil hoy?',
      a: `Lo fija por resolución el Consejo Nacional del Empleo, la Productividad y el SMVM. El valor que usa esta página es el vigente a ${SMVM_FECHA} según la ${SMVM_RESOLUCION}, con su valor hora oficial, y se actualiza cada vez que sale una resolución nueva. Es un piso legal para la jornada completa; por jornada reducida corresponde el proporcional por hora.`,
    },
    {
      q: '¿El salario mínimo es lo que me tienen que pagar?',
      a: 'Es el piso absoluto, no el sueldo que corresponde. Prácticamente todos los convenios colectivos fijan básicos por categoría muy por encima del mínimo. Si tu actividad tiene convenio, el número a mirar es el básico de tu categoría, no el SMVM.',
    },
    {
      q: '¿Contra qué promedio me estoy comparando?',
      a: 'Contra el RIPTE, la remuneración imponible promedio de los trabajadores estables registrados. Es un promedio de empleo formal: deja afuera el trabajo no registrado y los monotributistas, así que el ingreso típico de toda la población ocupada es más bajo que ese número.',
    },
    {
      q: '¿A qué dólar conviene medir el sueldo?',
      a: 'Depende de para qué. Si querés comparar tu sueldo con el de hace un año, usá siempre la misma cotización en los dos momentos. Si lo que te interesa es cuántos dólares podés comprar efectivamente con él, el número relevante es el tipo de cambio al que realmente accedés.',
    },
    {
      q: '¿Este hub me dice si me conviene comprar dólares?',
      a: 'No, y es a propósito. Acá medimos tu ingreso en el tiempo: si te alcanza y cómo evolucionó. La decisión de dónde poner los pesos —dólar, plazo fijo, UVA o dejarlos quietos— se resuelve en el hub ¿conviene comprar dólares?, en /finanzas-personales/dolar.',
    },
    {
      q: '¿Cómo se calcula el valor de mi hora de trabajo?',
      a: 'Se toma tu jornada semanal, se la lleva a horas mensuales multiplicando por 52 semanas y dividiendo por 12 meses, y se divide el sueldo por ese total. Para 48 horas semanales dan unas 208 horas mensuales. De ahí salen también el valor por día, por minuto y por segundo.',
    },
    {
      q: '¿Para qué sirve saber cuántas horas de trabajo cuesta algo?',
      a: 'Es la forma más directa de dimensionar una compra: un precio en pesos se desactualiza, pero “tres días de laburo” se entiende siempre. Sirve especialmente para comparar el mismo producto en dos momentos distintos, porque neutraliza la inflación de los dos lados.',
    },
    {
      q: '¿Comparo el sueldo bruto o el de bolsillo?',
      a: 'Cualquiera de los dos, mientras uses el mismo criterio en los dos momentos. Para compararte con el RIPTE usá el bruto, porque el RIPTE es remuneración imponible. Para medir cuánto te alcanza en el mes, usá el de bolsillo.',
    },
    {
      q: '¿Qué pasa si mi aumento vino en cuotas o con sumas no remunerativas?',
      a: 'Cargá el sueldo total que efectivamente cobrás hoy, con las sumas incluidas, y tené presente que las no remunerativas no computan para aguinaldo, vacaciones ni indemnización. Un aumento dado en sumas no remunerativas vale menos que el mismo porcentaje al básico.',
    },
  ],

  sources: [
    {
      name: 'INDEC — Índice de precios al consumidor (IPC)',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: INFLACION_AS_OF,
    },
    {
      name: `Salario Mínimo Vital y Móvil — ${SMVM_RESOLUCION}`,
      url: 'https://www.argentina.gob.ar/trabajo/consejodelsalario',
      publisher: 'Consejo Nacional del Empleo, la Productividad y el SMVM',
      date: SMVM_FECHA,
    },
    {
      name: 'RIPTE — Remuneración imponible promedio de los trabajadores estables',
      url: 'https://www.argentina.gob.ar/trabajo/seguridadsocial/ripte',
      publisher: 'Secretaría de Seguridad Social — Ministerio de Trabajo',
      date: RIPTE_BASE_MONTH,
    },
    {
      name: 'Cotizaciones del dólar (oficial, blue, MEP y cripto)',
      url: 'https://dolarapi.com/v1/dolares',
      publisher: 'DolarAPI',
      date: DOLAR_FECHA,
    },
    {
      name: 'Ley de Contrato de Trabajo 20.744 — jornada y remuneración',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg',
    },
  ],

  replaces: [
    '/salario-minimo-vital-movil-argentina',
    '/calculadora-ajuste-sueldo-inflacion',
    '/calculadora-salario-minimo-2026-comparativa',
    '/calculadora-sueldo-en-dolares',
    '/calculadora-sueldo-actualizado-ipc-inflacion',
    '/calculadora-salario-real-inflacion',
    '/calculadora-cuanto-vale-mi-tiempo-hora-anual-salario',
    '/sueldo-vs-promedio-argentino',
    '/calculadora-poder-adquisitivo-sueldo-real',
    '/calculadora-horas-trabajo-necesarias-para-comprar',
    '/calculadora-cuanto-gano-por-segundo',
    '/calculadora-sueldo-en-dolares-poder-compra',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
