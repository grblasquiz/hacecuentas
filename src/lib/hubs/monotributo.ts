import type { HubData } from './types';
import { CATEGORIAS, TOPES, CUOTA_SERVICIOS, CUOTA_BIENES, PARAMS_FISICOS, componentes, META } from '../data/monotributo-2026';

/**
 * Escala serializable para el <script> de la página.
 *
 * ⚠️ Los números NO se escriben acá: salen de src/lib/data/monotributo-2026.ts,
 * que es lo que patchea el fetcher en cada recategorización semestral. Si esto
 * se hardcodea, el hub se desincroniza del resto del sitio en agosto y enero.
 */
export const ESCALA = CATEGORIAS.map((c) => ({
  letra: c,
  tope: TOPES[c],
  cuotaServicios: Math.round(CUOTA_SERVICIOS[c]),
  cuotaBienes: Math.round(CUOTA_BIENES[c]),
  superficie: PARAMS_FISICOS[c].superficie,
  energia: PARAMS_FISICOS[c].energia,
  prop: (() => { const x = componentes(c, 'servicios'); return [x.integrado, x.sipa, x.obraSocial]; })(),
}));

export const VIGENCIA = META;

/** Bases imponibles mensuales de autónomos (SIPA) — calcado de la fórmula original. */
export const BASE_AUTONOMO: Record<string, number> = { I: 108000, II: 162000, III: 216000, IV: 270000, V: 324000 };
export const TASAS = {
  sipaAutonomo: 0.27,
  osAutonomo: 0.1,
  iva: 0.21,
  /** Empleado: 11% SIPA + 3% obra social + 3% INSSJP + 2% sindical. */
  aportesEmpleado: 0.11 + 0.03 + 0.03 + 0.02,
  /** Responsable inscripto: aproximaciones de la calc monotributo-vs-inscripto. */
  gananciasRI: 0.25,
  iibbRI: 0.035,
  mniAnualRI: 2_280_000 * 12,
} as const;

export const hub: HubData = {
  slug: 'impuestos/monotributo',
  title: '¿Qué categoría de monotributo me toca? — Escala y cuota 2026',
  description:
    'Calculá tu categoría con la escala de ARCA desde agosto 2026: cuota, tope de facturación y comparación con responsable inscripto, autónomo y empleado.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Guía y estimación impositiva',
  h1: '¿Qué categoría de monotributo me toca?',
  lede:
    'La categoría sale de tus ingresos brutos de los últimos 12 meses, y si tenés local también de la superficie y la energía que consumís: manda el parámetro que te empuja más arriba. Arrancamos por el caso más común y lo ajustás con tus datos.',
  stamps: [
    `Escala vigente desde ${VIGENCIA.vigencia}`,
    'ARCA · Ley 24.977 · recategorización semestral',
    '14 calculadoras adentro',
  ],

  resultLabel: 'Cuota mensual estimada',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro: 'Partimos de la consulta más frecuente. Si la tuya es otra, cambiala.',
    items: [
      {
        id: 'categoria',
        label: 'En qué categoría caigo',
        hint: 'El caso más común',
        answer: 'Te toca la categoría más baja cuyo tope anual cubra tus ingresos brutos de los últimos 12 meses.',
        yes: [
          'Ingresos brutos facturados en los últimos 12 meses, sin descontar gastos',
          'Superficie afectada a la actividad y energía eléctrica consumida, si tenés local',
          'Alquileres devengados por el local, cuando corresponde',
          'La cuota incluye impuesto integrado, aporte jubilatorio al SIPA y obra social',
        ],
        warn: [
          'Manda el parámetro MÁS ALTO: si por ingresos caés en C pero la superficie te lleva a E, pagás E',
          'Los ingresos son BRUTOS facturados, no lo que te queda después de gastos',
          'Desde la reforma de 2024 servicios también llega hasta la categoría K, con otra cuota en las categorías altas',
          'Si sos empleado en relación de dependencia además del monotributo, no pagás el componente jubilatorio ni el de obra social',
        ],
        plazo: 'el alta se hace online en ARCA con clave fiscal nivel 2 y la cuota vence el día 20 de cada mes.',
      },
      {
        id: 'recategorizar',
        label: 'Me toca recategorizar',
        hint: 'Semestral: febrero y agosto',
        answer: 'Comparás tus ingresos de los últimos 12 meses contra la escala nueva y ajustás la categoría.',
        yes: [
          'Ingresos brutos de los últimos 12 meses corridos, no del año calendario',
          'Superficie y energía de los últimos 12 meses',
          'La diferencia contra la cuota que venías pagando',
          'Podés bajar de categoría si tus ingresos cayeron: la recategorización va en los dos sentidos',
        ],
        warn: [
          'Si no recategorizás, ARCA puede recategorizarte de oficio y aplicar una multa del 50% del impuesto integrado',
          'La recategorización del segundo semestre 2026 cierra el 5 de agosto y el primer pago con valores nuevos es el 20 de agosto',
          'Si estás en la misma categoría que ya tenías, igual conviene confirmarla en el portal',
          'Superar el tope de la categoría K te excluye del régimen: pasás a responsable inscripto',
        ],
        plazo: 'la recategorización semestral vence el 5 de febrero y el 5 de agosto de cada año.',
      },
      {
        id: 'vs-ri',
        label: 'Monotributo vs responsable inscripto',
        hint: 'Cuál me conviene',
        answer: 'El monotributo conviene mientras la cuota anual sea menor que IVA más Ganancias más Ingresos Brutos.',
        yes: [
          'Como monotributista pagás una cuota fija mensual y no liquidás IVA ni Ganancias',
          'Como responsable inscripto pagás IVA (21% del débito menos el crédito de tus gastos), Ganancias e Ingresos Brutos',
          'Cuantos más gastos con factura A tengas, mejor le va al responsable inscripto',
          'El responsable inscripto puede facturar a empresas que exigen crédito fiscal, y eso a veces vale más que el ahorro impositivo',
        ],
        warn: [
          'La estimación de responsable inscripto es gruesa: usa una alícuota media de Ganancias del 25% y un 3,5% de Ingresos Brutos',
          'IVA no es un costo si tus clientes son responsables inscriptos: se traslada al precio',
          'Ingresos Brutos se paga en los dos regímenes; muchas provincias tienen régimen simplificado para monotributistas',
          'El pase a responsable inscripto obliga a contador, libros de IVA y declaraciones mensuales',
        ],
        plazo: 'el pase voluntario a responsable inscripto se hace el último día del mes y rige desde el 1° del siguiente.',
      },
      {
        id: 'vs-autonomo',
        label: 'Monotributo vs autónomo vs empleado',
        hint: 'Mismo ingreso, tres regímenes',
        answer: 'Con el mismo ingreso bruto, el monotributo casi siempre deja el neto más alto de los tres.',
        yes: [
          'Monotributo: descontás sólo la cuota fija de tu categoría',
          'Autónomo: aportes SIPA y obra social sobre la base de tu categoría, más IVA débito y Ganancias',
          'Empleado: 19% de aportes personales sobre el bruto más la retención de Ganancias de 4ª categoría',
          'El empleado tiene además aguinaldo, vacaciones pagas, ART e indemnización, que no aparecen en el número mensual',
        ],
        warn: [
          'La comparación es mensual y sobre el mismo bruto: no cuenta el aguinaldo ni las cargas que paga el empleador',
          'El autónomo carga el IVA débito completo sin computar crédito fiscal: es el escenario conservador',
          'El aporte jubilatorio del monotributo es bajo, así que la jubilación futura también',
          'Los tres regímenes usan la escala de Ganancias del primer semestre 2026',
        ],
        plazo: 'la cuota de monotributo y la de autónomos vencen el día 20 de cada mes.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada caso usa los campos que le corresponden; el resto podés dejarlos en cero.',
  fields: [
    {
      id: 'facturacion',
      label: 'Ingresos brutos de los últimos 12 meses',
      prefix: '$',
      value: '30.000.000',
      thousands: true,
      help: 'Todo lo facturado, sin descontar gastos.',
    },
    {
      id: 'actividad',
      label: 'Tipo de actividad',
      type: 'select',
      value: 'servicios',
      options: [
        { value: 'servicios', label: 'Locaciones y prestaciones de servicios' },
        { value: 'bienes', label: 'Venta de cosas muebles (comercio)' },
      ],
      help: 'Los topes son iguales; cambia la cuota en las categorías altas.',
    },
    {
      id: 'superficie',
      label: 'Superficie afectada a la actividad',
      type: 'number',
      min: 0,
      value: 0,
      suffix: 'm²',
      help: 'Dejá 0 si trabajás sin local (no aplica el parámetro).',
    },
    {
      id: 'energia',
      label: 'Energía eléctrica consumida por año',
      type: 'number',
      min: 0,
      value: 0,
      suffix: 'kWh',
      help: 'Dejá 0 si no tenés local propio.',
    },
    {
      id: 'categoriaActual',
      label: 'Categoría en la que estás hoy',
      type: 'select',
      value: 'ninguna',
      options: [
        { value: 'ninguna', label: 'Todavía no estoy inscripto' },
        ...CATEGORIAS.map((c) => ({ value: c, label: `Categoría ${c}` })),
      ],
      help: 'Sirve para ver la diferencia de cuota al recategorizar.',
    },
    {
      id: 'gastos',
      label: 'Gastos anuales con factura',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Solo para comparar contra responsable inscripto: generan crédito fiscal de IVA.',
    },
    {
      id: 'catAutonomo',
      label: 'Categoría de autónomo a comparar',
      type: 'select',
      value: 'IV',
      options: [
        { value: 'I', label: 'Categoría I' },
        { value: 'II', label: 'Categoría II' },
        { value: 'III', label: 'Categoría III' },
        { value: 'IV', label: 'Categoría IV' },
        { value: 'V', label: 'Categoría V' },
      ],
    },
    {
      id: 'hijos',
      label: '¿Deducís hijos en Ganancias?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí, al menos un hijo' },
      ],
    },
  ],
  fineprint:
    'Es una orientación. La escala y los parámetros se actualizan semestralmente: confirmá tu situación y las excepciones aplicables en el portal de ARCA antes de pagar.',

  chart: {
    type: 'steps',
    title: 'La escalera de categorías, de la A a la K',
    caption:
      'Cada escalón es una categoría y su ancho es el tramo de facturación anual que cubre, en millones de pesos. El marcador señala dónde caés vos con los ingresos que declaraste.',
  },
  breakdownTitle: 'Cómo se arma tu cuota',
  breakdownIntro: 'Las barras comparan cada componente con el rubro más grande.',

  faq: [
    {
      q: '¿Cómo sé qué categoría de monotributo me corresponde?',
      a: 'Sumá todo lo que facturaste en los últimos 12 meses corridos y buscá la categoría más baja cuyo tope anual cubra ese número. Si tenés local, calculá también la categoría que te dan la superficie afectada y la energía eléctrica consumida: te corresponde la más alta de las tres. Los ingresos son brutos, sin descontar gastos.',
    },
    {
      q: '¿Cuándo hay que recategorizarse?',
      a: 'Dos veces al año: hasta el 5 de febrero y hasta el 5 de agosto, mirando los 12 meses anteriores. El segundo período 2026 cierra el 5 de agosto y el primer pago con la escala nueva es el 20 de agosto. Si tus parámetros bajaron también puede corresponder una categoría inferior.',
    },
    {
      q: '¿Qué pasa si no me recategorizo a tiempo?',
      a: 'ARCA puede recategorizarte de oficio a la categoría que surja de sus datos y aplicar una multa equivalente al 50% del impuesto integrado y del aporte previsional. Además quedás fuera del régimen de reintegro por buen cumplimiento. Si detectás el error tarde, conviene recategorizar igual: la recategorización espontánea reduce la sanción.',
    },
    {
      q: '¿Qué incluye la cuota mensual del monotributo?',
      a: 'Tres componentes: el impuesto integrado (que reemplaza IVA y Ganancias), el aporte jubilatorio al SIPA y el aporte a obra social. En las categorías bajas el grueso es el aporte jubilatorio y la obra social; a partir de la categoría E el impuesto integrado pasa a ser el componente más pesado.',
    },
    {
      q: '¿Cuándo me conviene pasar a responsable inscripto?',
      a: 'Cuando la carga de IVA, Ganancias e Ingresos Brutos como inscripto queda por debajo de la cuota anual del monotributo, algo que pasa sobre todo si tenés muchos gastos con factura A que generan crédito fiscal. También conviene si tus clientes son empresas que necesitan crédito fiscal y por eso te pagan menos siendo monotributista.',
    },
    {
      q: '¿Los servicios pueden llegar a la categoría K?',
      a: 'Sí. La reforma de 2024 habilitó las categorías I, J y K para servicios. Las dos actividades comparten topes de ingresos, pero pagan distinto impuesto integrado y por eso difiere la cuota total.',
    },
    {
      q: '¿Qué pasa si supero el tope de la categoría K?',
      a: 'Quedás excluido del monotributo de pleno derecho desde el momento en que superás el tope, y tenés que inscribirte como responsable inscripto en IVA y Ganancias. La exclusión no es opcional ni retroactivamente subsanable: si ARCA la detecta después, te reclama IVA y Ganancias por todo el período con intereses.',
    },
    {
      q: '¿Conviene más el monotributo o ser empleado con el mismo ingreso?',
      a: 'En el número mensual el monotributo suele dejar más neto, porque descontás una cuota fija en vez del 19% de aportes más la retención de Ganancias. Pero el empleado suma aguinaldo, vacaciones pagas, ART, licencias e indemnización por despido, y aporta bastante más a su jubilación futura. Comparar sólo el neto del mes subestima el paquete del empleado.',
    },
    {
      q: '¿Puedo tener obra social del monotributo y trabajo en relación de dependencia a la vez?',
      a: 'Sí. Si además sos empleado en relación de dependencia, en el monotributo pagás únicamente el componente impositivo: los aportes jubilatorios y de obra social ya los cubre tu empleador. Eso baja bastante la cuota, sobre todo en las categorías más chicas.',
    },
    {
      q: '¿Qué es el monotributo social y quién puede acceder?',
      a: 'Es un régimen para personas en situación de vulnerabilidad social que desarrollan una actividad productiva, con una cuota muy reducida o bonificada e igual acceso a obra social y aportes jubilatorios. Se tramita ante el Ministerio de Desarrollo Social y tiene topes de facturación y de patrimonio más bajos que el monotributo general.',
    },
    {
      q: '¿Me pueden retener impuestos siendo monotributista?',
      a: 'Sí. Si a un mismo cliente le facturás en 12 meses un monto que supera el tope de tu categoría, corresponde la retención de la RG 2616 sobre los pagos siguientes. También hay retenciones de Ingresos Brutos en varias provincias y retenciones sobre acreditaciones bancarias. Las retenciones sufridas se computan como pago a cuenta.',
    },
  ],

  sources: [
    {
      name: 'Categorías, topes y cuotas vigentes del Monotributo',
      url: VIGENCIA.fuenteUrl,
      publisher: 'ARCA',
      date: `vigencia ${VIGENCIA.vigencia}`,
    },
    {
      name: 'Ley 24.977 — Régimen Simplificado para Pequeños Contribuyentes (texto ordenado)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/50000-54999/51609/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Recategorización semestral — cómo y cuándo se hace',
      url: 'https://www.afip.gob.ar/monotributo/categorias.asp',
      publisher: 'ARCA',
    },
    {
      name: 'Monotributo Social — requisitos y alcance',
      url: 'https://www.argentina.gob.ar/desarrollosocial/monotributosocial',
      publisher: 'Ministerio de Capital Humano',
    },
    {
      name: 'Deducciones personales y escala del art. 94 LIG — primer semestre 2026',
      url: 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/',
      publisher: 'ARCA',
    },
    {
      name: 'RG 2616 — régimen de retención a proveedores monotributistas',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/155000-159999/158900/norma.htm',
      publisher: 'InfoLeg',
    },
  ],

  relatedPosts: [
    {
      href: '/blog/recategorizacion-monotributo-julio-2026-guia-completa',
      title: 'Recategorización de julio 2026, paso a paso',
      note: 'Cuándo toca, qué mirar y cómo hacerla sin errores.',
    },
    {
      href: '/blog/guia-completa-monotributo-2026',
      title: 'Guía completa del monotributo 2026',
      note: 'Categorías, topes y obligaciones del año, en un solo lugar.',
    },
  ],

  replaces: [
    '/calculadora-monotributo-2026',
    '/calculadora-monotributo-categoria-2026-recategorizacion-julio',
    '/calculadora-monotributo-vs-responsable-inscripto',
    '/calculadora-monotributo-cuota-2026-todas-categorias',
    '/calculadora-monotributo-categoria-ingresos-tope',
    '/calculadora-autonomos-categoria-monto-2026',
    '/simulador-monotributo-neto',
    '/calculadora-monotributo-mejor-categoria-2026',
    '/calculadora-facturacion-maxima-monotributo-vs-ri',
    '/calculadora-monotributo-social-beneficio-exencion',
    '/calculadora-monotributo-vs-autonomo-vs-empleado-mismo-ingreso',
    '/calculadora-retencion-rg2616-proveedor-monotributo',
    '/calculadora-impuestos-monotributo-freelance',
    '/calculadora-obra-social-monotributo-2026',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-cuanto-tengo-que-facturar-para-ganar-x-neto',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
