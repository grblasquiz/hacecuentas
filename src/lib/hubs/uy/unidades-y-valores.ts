import type { HubData } from '../types';
import { URUGUAY_2026 } from '../../data/uruguay-2026';

/**
 * Hub de decisión UY — "¿Cuánto vale eso hoy en pesos?"
 *
 * Unidad Indexada, Unidad Reajustable, BPC y dólar, más la actualización de un
 * monto por inflación y el reajuste anual del alquiler (menor entre IPC y UR).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const BPC = URUGUAY_2026.bpc;
export const UI = URUGUAY_2026.unidadIndexada;
export const UR = URUGUAY_2026.unidadReajustable;
export const USD = URUGUAY_2026.usd;

const uyu = (n: number) => '$U ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'uy/finanzas/unidades-y-valores',
  title: 'UI, UR, BPC y dólar en Uruguay: cuánto valen hoy en pesos',
  description:
    'Convertí Unidad Indexada, Unidad Reajustable, BPC y dólares a pesos uruguayos con el valor vigente, actualizá un monto por inflación y calculá el reajuste anual del alquiler tomando el menor entre IPC y UR.',
  silo: 'Finanzas',
  siloHref: '/uy/finanzas',
  locale: 'uy',

  eyebrow: 'Uruguay · INE · BCU · DGI',
  h1: '¿Cuánto vale hoy en pesos? UI, UR, BPC, dólar y tu alquiler',
  lede:
    'Uruguay escribe medio contrato en unidades que no son pesos. La UI sigue los precios y se mueve todos los días; la UR sigue los salarios y cambia una vez por mes; la BPC queda fija todo el año y ordena impuestos y prestaciones. Entender cuál te aplica y cuánto vale hoy es la diferencia entre firmar bien y firmar de más.',
  stamps: [
    `1 UI = ${uyu(UI.valor)}`,
    `1 UR = ${uyu(UR.valor)}`,
    `1 BPC = ${uyu(BPC)} · 6 calculadoras adentro`,
  ],

  resultLabel: 'Equivalente en pesos',

  cases: {
    title: '¿Qué necesitás convertir o actualizar?',
    intro:
      'Elegí la operación: el formulario es el mismo y sólo cambian los campos que se usan. La unidad se elige en el desplegable.',
    items: [
      {
        id: 'a-pesos',
        label: 'Tengo un monto en UI, UR, BPC o dólares y quiero pesos',
        hint: 'Conversión directa al valor vigente',
        answer: 'Se multiplica la cantidad por el valor vigente de la unidad que elijas.',
        yes: [
          `Unidad Indexada: se ajusta a diario por el índice de precios al consumo. Valor vigente ${uyu(UI.valor)}`,
          `Unidad Reajustable: se ajusta una vez por mes por el Índice Medio de Salarios. Valor vigente ${uyu(UR.valor)}`,
          `BPC: la fija el Poder Ejecutivo por decreto cada enero y queda quieta todo el año. Valor vigente ${uyu(BPC)}`,
          `Dólar: referencia interbancaria del BCU (${uyu(USD.interbancario)}) y pizarra del banco, que es lo que efectivamente pagás`,
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La UI y el dólar cambian todos los días: para operaciones grandes verificá el valor del día en la fuente oficial',
          'La UR de cada mes rige durante el mes siguiente: no es el valor del mes en curso',
          'La pizarra del banco tiene spread: comprás dólares más caros y los vendés más baratos que la referencia',
        ],
        plazo: 'la UI y la UR las publica el INE; la DGI difunde la tabla diaria de UI.',
      },
      {
        id: 'a-unidad',
        label: 'Tengo pesos y quiero saber cuántas UI, UR o BPC son',
        hint: 'Conversión inversa',
        answer: 'Se divide el monto en pesos por el valor vigente de la unidad.',
        yes: [
          'Sirve para leer un contrato en UI, un tope de prestación en BPC o una multa expresada en UR',
          'También para saber cuántos sueldos mínimos o cuántas BPC representa un monto',
          'La conversión inversa usa exactamente el mismo valor que la directa',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Los topes fiscales y de prestaciones se fijan en BPC justamente para que se actualicen solos: convertirlos a pesos les pone fecha de vencimiento',
          'Un contrato en UI mantiene su valor en unidades: lo que cambia es cuántos pesos hay que poner',
        ],
        plazo: 'la BPC se actualiza por decreto cada enero y arrastra todos los topes expresados en esa unidad.',
      },
      {
        id: 'inflacion',
        label: 'Quiero actualizar un monto viejo por inflación',
        hint: 'Poder de compra equivalente',
        answer: 'Se multiplica el monto original por uno más la inflación acumulada del período.',
        yes: [
          'Sirve para saber cuánto habría que cobrar hoy para igualar un monto de hace años',
          'La inflación acumulada del período la ingresás vos, con el dato del índice de precios del INE',
          'El resultado también muestra cuánto poder de compra perdió quien guardó ese dinero en efectivo',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La inflación acumulada de varios años no es la suma de las anuales: se multiplican los factores',
          'Actualizar por precios no es lo mismo que actualizar por salarios: para deudas laborales suele usarse otro criterio',
        ],
        plazo: 'el índice de precios al consumo lo publica el INE los primeros días de cada mes.',
      },
      {
        id: 'alquiler',
        label: 'Me toca el reajuste anual del alquiler',
        hint: 'Se aplica el menor entre IPC y UR',
        answer: 'En la práctica se aplica el menor entre la variación anual de precios y la de salarios.',
        yes: [
          'Los contratos de arrendamiento de vivienda se reajustan una vez al año',
          'El criterio más extendido toma el menor entre la variación anual del índice de precios y la de la Unidad Reajustable',
          'Cargás las dos variaciones y la cuenta elige la que menos te aumenta',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El índice de reajuste lo fija el contrato: si tu contrato dice sólo UR o sólo IPC, manda el contrato, no la costumbre',
          'Los contratos pactados directamente en UI se reajustan solos día a día: ahí no hay reajuste anual que negociar',
          'Un reajuste aplicado fuera de fecha no se acumula retroactivamente salvo que el contrato lo prevea',
        ],
        plazo: 'el reajuste opera en el aniversario del contrato, no el 1° de enero.',
      },
    ],
  },

  inputsTitle: 'Qué querés convertir',
  inputsIntro:
    'Poné el monto, elegí la unidad y, si vas a actualizar un alquiler o un monto viejo, cargá las variaciones anuales que publica el INE.',
  fields: [
    {
      id: 'monto',
      label: 'Monto',
      value: '10.000',
      thousands: true,
      help: 'La cantidad a convertir o actualizar: en unidades si convertís a pesos, en pesos en los demás casos.',
    },
    {
      id: 'unidad',
      label: 'Unidad',
      type: 'select',
      value: 'ui',
      options: [
        { value: 'ui', label: 'Unidad Indexada (UI)' },
        { value: 'ur', label: 'Unidad Reajustable (UR)' },
        { value: 'bpc', label: 'BPC' },
        { value: 'usd', label: 'Dólares (USD)' },
      ],
      help: 'Sólo se usa en las conversiones. La UI sigue los precios, la UR los salarios y la BPC queda fija todo el año.',
    },
    {
      id: 'varIpc',
      label: 'Variación anual del IPC (%)',
      type: 'number',
      value: 4.5,
      min: -50,
      max: 500,
      step: 0.01,
      help: 'Para el reajuste de alquiler. Para actualizar un monto viejo, poné acá la inflación acumulada del período.',
    },
    {
      id: 'varUr',
      label: 'Variación anual de la UR (%)',
      type: 'number',
      value: 6.2,
      min: -50,
      max: 500,
      step: 0.01,
      help: 'La variación del Índice Medio de Salarios que arrastra la UR. Sólo se usa en el reajuste de alquiler.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'bars',
    title: 'Comparación de la operación',
    caption:
      'En las conversiones compara cuánto vale tu monto en cada unidad de cuenta. En el reajuste de alquiler enfrenta el aumento por precios contra el aumento por salarios, para ver cuál te conviene.',
  },
  breakdownTitle: 'El detalle de la conversión',
  breakdownIntro:
    'Cada línea muestra el valor vigente de la unidad, su fecha y el resultado de la operación.',

  faq: [
    {
      q: '¿Qué es la Unidad Indexada y para qué se usa?',
      a: `Es una unidad de cuenta que se ajusta a diario siguiendo el índice de precios al consumo, de modo que un monto expresado en UI mantiene su poder de compra. Se usa en alquileres, créditos hipotecarios, ahorro indexado y algunos tributos. El valor vigente que aplica esta cuenta es de ${uyu(UI.valor)} por unidad, con fecha ${UI.fecha}, publicado por ${UI.fuente}.`,
    },
    {
      q: '¿Qué diferencia hay entre la UI y la UR?',
      a: `La UI sigue los precios y se actualiza todos los días; la UR sigue los salarios, a través del Índice Medio de Salarios, y se actualiza una vez por mes. Además hay una trampa de calendario en la UR: el valor de cada mes rige durante el mes siguiente. Cuando los salarios crecen más que los precios, un contrato en UR sube más rápido que uno en UI, y al revés. El valor de UR que aplica esta cuenta es ${uyu(UR.valor)}, correspondiente a ${UR.mesValor}.`,
    },
    {
      q: '¿Qué es la BPC y por qué está fija todo el año?',
      a: `La Base de Prestaciones y Contribuciones es la unidad con la que se escriben franjas de impuestos, mínimos no imponibles, topes de prestaciones y multas. La fija el Poder Ejecutivo por decreto cada enero y queda quieta hasta el enero siguiente, justamente para que todos los topes se actualicen de una sola vez y no haya que reformar cada norma. El valor vigente es ${uyu(BPC)}.`,
    },
    {
      q: '¿Por qué mi sueldo se mide en pesos pero mis impuestos en BPC?',
      a: 'Porque escribir la ley en BPC evita que la inflación convierta un impuesto para ingresos altos en un impuesto para todos. Si el mínimo no imponible del IRPF estuviera en pesos, cada año más gente entraría a pagar sin que nadie decida nada. Al estar en BPC, el umbral se mueve con el decreto anual. La contracara es que la actualización depende de una decisión política y no siempre acompaña a la inflación real.',
    },
    {
      q: '¿Qué dólar tengo que usar: el interbancario o el de la pizarra?',
      a: `Depende de para qué. El interbancario del BCU (${uyu(USD.interbancario)}) es la referencia oficial y es el que se usa para contabilidad, contratos y comparaciones. La pizarra del banco es lo que efectivamente vas a pagar o cobrar: la compra (${uyu(USD.brouCompra)}) es a lo que el banco te compra tus dólares y la venta (${uyu(USD.brouVenta)}) a lo que te los vende. La diferencia entre ambas es el spread, y sale de tu bolsillo.`,
    },
    {
      q: '¿Cómo se actualiza un monto por inflación?',
      a: 'Se multiplica el monto original por un factor igual a uno más la inflación acumulada del período dividida cien. Lo importante es que la inflación acumulada de varios años no se suma: se multiplican los factores anuales. Dos años de 5% no dan 10% sino 10,25%. Con períodos largos la diferencia se vuelve enorme.',
    },
    {
      q: '¿Cuánto puede subir mi alquiler en el reajuste anual?',
      a: 'Los arrendamientos de vivienda se reajustan una vez al año, en el aniversario del contrato. El criterio más extendido, y el que fijan muchos contratos, es aplicar el menor entre la variación anual del índice de precios y la de la Unidad Reajustable. Es decir, el inquilino paga el aumento más bajo de los dos. Pero si tu contrato pactó un índice específico, ese índice manda.',
    },
    {
      q: 'Mi contrato está en UI: ¿me van a aumentar igual?',
      a: 'No hay un aumento anual porque el ajuste ya está incorporado: la UI se mueve todos los días con los precios, así que el monto en pesos que pagás sube mes a mes sin que nadie lo negocie. La ventaja es la previsibilidad en términos reales; la desventaja es que no hay instancia de discusión anual y que en un pico inflacionario el ajuste es inmediato.',
    },
    {
      q: '¿Conviene un alquiler en pesos, en UI o en dólares?',
      a: 'En pesos con reajuste anual, el inquilino gana previsibilidad nominal durante doce meses y el propietario asume el riesgo inflacionario del período. En UI, el ajuste es continuo y el riesgo se reparte de otro modo. En dólares, ambos quedan expuestos a la variación del tipo de cambio, que en Uruguay no siempre acompaña a la inflación local. No hay una respuesta universal: depende de en qué moneda cobrás vos.',
    },
    {
      q: '¿Dónde consulto el valor oficial del día?',
      a: 'La UI y la UR las publica el Instituto Nacional de Estadística, y la DGI difunde la tabla diaria de UI. La cotización de referencia del dólar la publica el Banco Central. La BPC surge del decreto anual del Poder Ejecutivo. Los valores que usa esta cuenta están fechados en el detalle: si la operación es grande, verificá el valor del día en la fuente.',
    },
    {
      q: '¿Cuánto vale un sueldo de hace diez años en plata de hoy?',
      a: 'Hay que aplicarle la inflación acumulada de esos diez años, que es el producto de los factores anuales, no la suma de los porcentajes. El resultado te dice cuántos pesos de hoy necesitás para comprar lo mismo. Ojo con una confusión frecuente: eso no dice si aquel sueldo era bueno o malo en términos relativos, porque los salarios de la economía pueden haber crecido más o menos que los precios.',
    },
  ],

  sources: [
    {
      name: 'INE — Unidad Indexada y Unidad Reajustable',
      url: 'https://www.gub.uy/instituto-nacional-estadistica/',
      publisher: 'Instituto Nacional de Estadística',
    },
    {
      name: 'DGI — Tabla diaria de Unidad Indexada',
      url: 'https://www.gub.uy/direccion-general-impositiva/',
      publisher: 'Dirección General Impositiva',
    },
    {
      name: 'BCU — Cotizaciones de monedas',
      url: 'https://www.bcu.gub.uy/Estadisticas-e-Indicadores/Paginas/Cotizaciones.aspx',
      publisher: 'Banco Central del Uruguay',
    },
    {
      name: 'Decreto N° 11/026 — Valor de la BPC',
      url: 'https://www.impo.com.uy/',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'INE — Índice de Precios al Consumo',
      url: 'https://www.gub.uy/instituto-nacional-estadistica/',
      publisher: 'Instituto Nacional de Estadística',
    },
  ],

  replaces: [
    '/uy/unidad-indexada-a-pesos-uruguay',
    '/uy/unidad-reajustable-a-pesos-uruguay',
    '/uy/calculadora-bpc-a-pesos-uruguay',
    '/uy/dolar-hoy-uruguay',
    '/uy/calculadora-actualizacion-inflacion-ipc-uruguay',
    '/uy/calculadora-ajuste-alquiler-uruguay',
  ],

  lastReviewed: '2026-07-28',
};
