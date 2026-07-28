import type { HubData } from './types';

/**
 * Hub de decisión — "CPC, CPM y ROAS: ¿cuánto me cuesta un cliente?"
 * Arquetipo RAMIFICADO: cuatro caminos encadenados por la MISMA matemática
 * (presupuesto → impresiones → clicks → leads → clientes) más la capa fiscal
 * argentina de pagarle a una plataforma del exterior.
 *
 * La idea del hub es que un solo motor reemplace la bolsa de calculadoras
 * sueltas de CPM, CPC, CPL, CPA, CAC, LTV, churn, conversión y ROAS: todas
 * eran la misma cuenta cortada en pedazos.
 *
 * NOTAS DE CONTRATO:
 *  - El hub MEZCLA unidades: pesos, cantidades y porcentajes. TODAS las filas
 *    que no son plata declaran su propio `format`. Una fila sin formato propio
 *    cae a pesos y la página miente.
 *  - Las fórmulas son las de los módulos reales del repo: `marketing-cpm.ts`,
 *    `marketing-cpc.ts`, `marketing-cac.ts`, `marketing-roas.ts`,
 *    `marketing-conversion.ts`, `costo-por-lead.ts`, `churn.ts`,
 *    `cpm-cpc-conversion-ads.ts` y
 *    `calculadora-costo-real-pauta-exterior-impuestos-argentina.ts`.
 *  - No hay constantes de mercado inventadas: los benchmarks se citan en la FAQ
 *    y todo lo que entra al cálculo lo pone el usuario.
 */
export const hub: HubData = {
  slug: 'negocios/metricas-de-marketing',
  title: 'CPC, CPM y ROAS: ¿cuánto me cuesta un cliente? Calculadora del embudo',
  description:
    'Cargá presupuesto, CPM y tus tasas y mirá la cascada completa: impresiones, clicks, CPC, leads, CPL, clientes, CAC, LTV y ROAS. Incluye el costo real de pagarle a Meta o Google Ads desde Argentina con IVA y percepciones.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Marketing y performance',
  h1: 'CPC, CPM y ROAS: ¿cuánto me cuesta un cliente?',
  lede:
    'CPM, CPC, CPL, CPA, CAC y ROAS no son seis métricas distintas: son la misma cuenta mirada en seis puntos del embudo. Poné el presupuesto, el CPM que te cobran y tus tasas de paso, y vas a ver la cascada entera, desde la impresión hasta el cliente que se queda.',
  stamps: ['Actualizado 27-07-2026', 'Un solo motor para todo el embudo', '15 calculadoras adentro'],

  resultLabel: 'Costo de adquirir un cliente (CAC)',

  cases: {
    title: '¿Qué querés averiguar?',
    intro: 'Las cuatro ramas comparten el mismo embudo. Si buscás otra cosa, cambiala.',
    items: [
      {
        id: 'embudo',
        label: 'Cuánto me cuesta un lead y un cliente',
        hint: 'El caso más común',
        answer:
          'El CAC es el presupuesto dividido por los clientes nuevos, y sale de multiplicar cuatro tasas en cadena.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Impresiones = presupuesto dividido el CPM, por mil',
          'Clicks = impresiones por el CTR, y de ahí sale el CPC (presupuesto sobre clicks)',
          'Leads = clicks por la tasa de conversión de la landing, y de ahí el CPL (presupuesto sobre leads)',
          'Clientes = leads por la tasa de cierre comercial, y de ahí el CPA o CAC (presupuesto sobre clientes)',
          'Cada tasa multiplica: mejorar un 20% el CTR y un 20% la conversión baja el CAC más que duplicar el presupuesto',
        ],
        warn: [
          'El CAC de esta cuenta es el CAC pagado: no incluye sueldos del equipo, herramientas ni producción de contenido. El CAC contable completo suele ser bastante mayor',
          'Si tu ciclo de venta es largo, los clientes de este mes se cierran con la pauta de meses anteriores: no dividas la inversión de julio por las ventas de julio',
          'Los CPM suben con la competencia estacional: noviembre y diciembre encarecen todo el embudo sin que vos hayas cambiado nada',
          'Un CPL bajo con leads malos es peor que un CPL alto con leads buenos: mirá siempre la tasa de cierre junto al costo',
        ],
        plazo: 'antes de escalar presupuesto conviene tener por lo menos 30 conversiones en la ventana de atribución.',
      },
      {
        id: 'roas',
        label: 'Si la campaña me deja plata',
        hint: 'ROAS y punto de equilibrio',
        answer:
          'El ROAS es ingresos sobre inversión. El que importa es el ROAS de equilibrio: uno dividido tu margen.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Ingresos generados por la campaña: clientes nuevos por ticket promedio',
          'ROAS = ingresos dividido inversión, expresado en veces',
          'ROAS de equilibrio = 100 dividido tu margen bruto en porcentaje: con 40% de margen necesitás 2,5 veces sólo para no perder',
          'Ganancia neta = ingresos por margen, menos la inversión en pauta',
        ],
        warn: [
          'Un ROAS de 3 con margen del 25% pierde plata: el punto de equilibrio ahí es 4',
          'El ROAS que informa la plataforma incluye ventas que habrían ocurrido igual: siempre está inflado respecto del incremental real',
          'Si el negocio es de recompra, mirar sólo la primera venta subestima la campaña: para eso está la rama de LTV',
          'El ROAS no descuenta impuestos ni el costo real de pagar la pauta desde Argentina: eso lo ves en la cuarta rama',
        ],
        plazo: 'medí el ROAS sobre la ventana de atribución completa, no sobre el día de la campaña.',
      },
      {
        id: 'cliente',
        label: 'Cuánto vale un cliente en toda su vida',
        hint: 'CAC, LTV y churn',
        answer:
          'Un negocio sano recupera el CAC rápido y tiene un LTV de al menos tres veces ese costo.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'La vida media del cliente sale del churn mensual: cien dividido el porcentaje que se te va cada mes',
          'LTV = ticket promedio por la cantidad de compras que hace mientras se queda',
          'LTV a margen = ese LTV multiplicado por tu margen bruto, que es la plata que de verdad te queda',
          'Relación LTV sobre CAC: por debajo de 1 perdés en cada cliente, cerca de 3 es el estándar sano',
          'Repago del CAC: cuántos meses tarda un cliente en devolverte lo que costó traerlo',
        ],
        warn: [
          'Bajar el churn de 5% a 4% mensual alarga la vida media de 20 a 25 meses: retener rinde más que adquirir',
          'La relación LTV/CAC sobre ingresos brutos infla el número; la que decide es la que usa margen',
          'Un LTV largo con repago lento te funde igual: si tardás 14 meses en recuperar el CAC, necesitás capital para bancar el crecimiento',
          'El churn de los primeros 30 días suele ser mucho más alto que el promedio y arruina la proyección si lo promediás',
        ],
        plazo: 'la regla práctica es recuperar el CAC dentro de los 12 meses.',
      },
      {
        id: 'pauta',
        label: 'Cuánto me sale de verdad pagarle a Meta o Google',
        hint: 'IVA, percepciones e IIBB',
        answer:
          'Sobre la pauta se cargan IVA, una percepción a cuenta de Ganancias y una percepción de IIBB: el bruto debitado es bastante más que el neto facturado.',
        yes: [
          'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.',
          'IVA del 21% sobre servicios digitales del exterior: el responsable inscripto lo computa como crédito fiscal, el monotributista no',
          'Percepción del 30% a cuenta de Ganancias y Bienes Personales cuando se paga en pesos con tarjeta',
          'Percepción de IIBB provincial, que varía por jurisdicción y ronda entre el 3% y el 5,5%',
          'Costo bruto: lo que efectivamente te debitan. Costo real: lo que queda después de descontar lo recuperable',
        ],
        warn: [
          'El monotributista puro no recupera el IVA: son 21 puntos de sobrecosto que sí o sí van al costo de la campaña',
          'Pagando con dólares propios se evitan la percepción de Ganancias y la de IIBB, pero no el IVA',
          'Las percepciones son a cuenta, no impuestos definitivos: se computan en la declaración correspondiente, y si no tenés contra qué computarlas quedan como saldo a favor',
          'Las alícuotas de percepción cambian con frecuencia por resolución: verificá las vigentes antes de presupuestar',
        ],
        plazo: 'las percepciones se computan en la declaración jurada del período en que fueron practicadas.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada rama usa los campos que le sirven. Los demás podés dejarlos como están.',
  fields: [
    {
      id: 'presupuesto',
      label: 'Presupuesto de pauta del período',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 1000,
      value: 300000,
      thousands: true,
      help: 'Lo que le pagás a la plataforma, neto de impuestos. En la rama fiscal es el monto que factura Meta o Google.',
    },
    {
      id: 'cpm',
      label: 'CPM: lo que te cuestan mil impresiones',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 10000000,
      step: 100,
      value: 3500,
      thousands: true,
      help: 'Está en el reporte de la plataforma. Si conocés las impresiones en vez del CPM, dividí presupuesto sobre impresiones y multiplicá por mil.',
    },
    {
      id: 'ctr',
      label: 'CTR: qué porcentaje de impresiones se convierte en click',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.1,
      value: 1.2,
      help: 'En display suele estar por debajo del 1%; en búsqueda con intención alta puede superar el 5%.',
    },
    {
      id: 'conv_lead',
      label: 'Conversión de la landing: de click a lead',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.1,
      value: 4,
      help: 'Entre 2% y 5% es el rango normal de e-commerce y captación B2C.',
    },
    {
      id: 'cierre',
      label: 'Tasa de cierre: de lead a cliente',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 20,
      help: 'Si vendés directo online, poné 100: el lead ya es el cliente.',
    },
    {
      id: 'ticket',
      label: 'Ticket promedio por compra',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 1000,
      value: 45000,
      thousands: true,
    },
    {
      id: 'margen',
      label: 'Margen bruto sobre la venta',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 40,
      help: 'Precio menos costo del producto o servicio, sobre el precio. Es el que define el ROAS de equilibrio.',
    },
    {
      id: 'compras_ano',
      label: 'Compras que hace un cliente por año',
      type: 'number',
      min: 0,
      max: 365,
      step: 1,
      value: 3,
      help: 'En suscripciones mensuales son 12.',
    },
    {
      id: 'churn',
      label: 'Churn mensual: clientes que se van cada mes',
      type: 'number',
      suffix: '%',
      min: 0.1,
      max: 100,
      step: 0.1,
      value: 5,
      help: 'Por debajo de 2% mensual es retención de primer nivel; arriba de 10% es crítico.',
    },
    {
      id: 'condicion',
      label: 'Tu condición frente al IVA',
      type: 'select',
      value: 'responsable-inscripto',
      options: [
        { value: 'responsable-inscripto', label: 'Responsable inscripto' },
        { value: 'monotributista', label: 'Monotributista o consumidor final' },
      ],
    },
    {
      id: 'forma_pago',
      label: 'Cómo pagás la pauta',
      type: 'select',
      value: 'tarjeta-en-pesos',
      options: [
        { value: 'tarjeta-en-pesos', label: 'Tarjeta en pesos' },
        { value: 'dolares-propios', label: 'Dólares propios (MEP)' },
      ],
      help: 'Pagando con dólares propios no se disparan la percepción de Ganancias ni la de IIBB.',
    },
    {
      id: 'iibb_pct',
      label: 'Percepción de IIBB de tu provincia',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 20,
      step: 0.1,
      value: 3,
      help: 'Varía por jurisdicción, en general entre 3% y 5,5%. Está en el resumen de la tarjeta.',
    },
  ],
  fineprint:
    'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad. Los CPM, CTR y tasas de cierre dependen de tu industria, tu creatividad y la estacionalidad, y las alícuotas de IVA y percepciones cambian por resolución: confirmá las vigentes con tu contador antes de presupuestar.',

  chart: {
    type: 'donut',
    title: 'Adónde va la plata',
    caption:
      'En las ramas de embudo y de retorno el gráfico parte los ingresos que genera la campaña en tres: lo que se fue en pauta, lo que cuesta el producto y lo que queda de ganancia. En la rama de valor del cliente hace lo mismo sobre el LTV, y en la fiscal separa la pauta neta de cada impuesto.',
  },
  breakdownTitle: 'La cascada completa',
  breakdownIntro:
    'Cada fila trae su unidad: hay pesos, cantidades, porcentajes, veces y meses. Las barras comparan cada concepto con el mayor.',

  faq: [
    {
      q: '¿Qué diferencia hay entre CPM, CPC, CPL, CPA y CAC?',
      a: 'Son el mismo presupuesto dividido por cosas distintas, cada vez más abajo en el embudo. El CPM es el costo de mil impresiones. El CPC es el presupuesto dividido por los clicks. El CPL es el presupuesto dividido por los leads. El CPA o CAC es el presupuesto dividido por los clientes que efectivamente compraron. Por eso el CPM es siempre el número más chico y el CAC el más grande: cada paso pierde gente.',
    },
    {
      q: '¿Cómo se calcula el CAC?',
      a: 'En su versión simple, inversión de marketing dividida por clientes nuevos del período. Si sólo contás la pauta, obtenés el CAC pagado, que es el que sale de esta calculadora. El CAC contable completo suma además sueldos del equipo de marketing y ventas, herramientas, agencias y producción de contenido, y suele dar bastante más alto. Conviene mirar los dos: el pagado para decidir si escalás una campaña, el completo para saber si el negocio cierra.',
    },
    {
      q: '¿Qué ROAS necesito para no perder plata?',
      a: 'Cien dividido tu margen bruto en porcentaje. Con 50% de margen, el punto de equilibrio es un ROAS de 2. Con 40%, es 2,5. Con 25%, es 4. Por eso un ROAS de 3 puede ser excelente en un negocio de servicios y desastroso en uno de reventa: lo que decide no es el ROAS sino la relación entre el ROAS y el margen.',
    },
    {
      q: '¿Cuál es una buena relación LTV/CAC?',
      a: 'La referencia que se usa en SaaS y e-commerce es 3 a 1: por cada peso que gastás en traer un cliente, el cliente te devuelve tres a lo largo de su vida. Por debajo de 1 estás perdiendo en cada adquisición. Entre 1 y 2 sobrevivís pero no crecés. Arriba de 5, casi siempre significa que estás invirtiendo poco en adquisición y dejando mercado sobre la mesa. Cuidado con calcularla sobre ingresos brutos: la que decide es la que usa el margen.',
    },
    {
      q: '¿Cómo se calcula el LTV a partir del churn?',
      a: 'La vida media de un cliente en meses es cien dividido el churn mensual expresado en porcentaje: con 5% de churn, la vida media es de 20 meses. Multiplicando esos meses por cuántas compras hace por mes y por el ticket promedio, obtenés el LTV en ingresos; multiplicando por el margen bruto, el LTV en plata que te queda. Bajar el churn del 5% al 4% estira la vida media a 25 meses, un 25% más de LTV sin gastar un peso en pauta.',
    },
    {
      q: '¿Qué es el payback del CAC y por qué importa más que el LTV?',
      a: 'Es cuántos meses tarda un cliente en devolverte lo que costó traerlo. Importa porque el LTV es una promesa a futuro y el payback es caja hoy: si tardás 14 meses en recuperar el CAC, cada cliente nuevo que sumás te consume capital antes de devolvértelo, y crecer rápido te puede dejar sin plata aunque el negocio sea rentable en el papel. La referencia habitual es recuperar el CAC dentro de los 12 meses.',
    },
    {
      q: '¿Qué CTR y qué tasa de conversión son normales?',
      a: 'Depende del canal y de la intención. En display y redes, un CTR por encima del 1% ya es bueno; en búsqueda, donde el usuario está buscando exactamente eso, puede pasar el 5%. En conversión de landing, entre 2% y 5% es el rango habitual de e-commerce B2C; arriba de 10% suele indicar tráfico muy calificado o una oferta muy fuerte. Lo importante no es el número absoluto sino la evolución contra vos mismo.',
    },
    {
      q: '¿Cuánto sale de verdad pagarle a Meta o Google Ads desde Argentina?',
      a: 'Sobre el monto neto que factura la plataforma se cargan el IVA del 21% de servicios digitales del exterior, una percepción del 30% a cuenta de Ganancias y Bienes Personales cuando se paga en pesos con tarjeta, y una percepción de IIBB provincial de entre 3% y 5,5%. El responsable inscripto recupera el IVA como crédito fiscal y computa las percepciones, así que su costo real tiende al neto. El monotributista no recupera el IVA: para él son 21 puntos de sobrecosto irrecuperable.',
    },
    {
      q: '¿Conviene pagar la pauta con dólares propios?',
      a: 'Pagando con dólares propios no se disparan la percepción de Ganancias ni la de IIBB, que sí se aplican cuando pagás en pesos con tarjeta. El IVA se paga igual. Para un responsable inscripto la diferencia es de financiamiento, porque las percepciones son a cuenta y las recupera; para quien no tiene contra qué computarlas, evitarlas es ahorro directo. La cuenta final depende también del tipo de cambio al que conseguís esos dólares.',
    },
    {
      q: '¿Qué es la frecuencia y cómo se relaciona con las impresiones?',
      a: 'Las impresiones son iguales al alcance multiplicado por la frecuencia: si llegaste a 50.000 personas con frecuencia 3, compraste 150.000 impresiones. En planificación de medios se usa el GRP, que son puntos de rating y equivale al alcance porcentual por la frecuencia. Subir la frecuencia sin subir el alcance suele saturar: a partir de cierto punto el CTR cae y el CPA sube, aunque el CPM se mantenga.',
    },
    {
      q: '¿Qué modelo de atribución conviene usar?',
      a: 'El de último click subestima todo lo que trabaja arriba del embudo, porque le da el crédito completo al último contacto; el de primer click hace lo contrario. Los modelos basados en datos reparten el crédito entre todos los puntos de contacto y son los más razonables cuando hay volumen suficiente. La consecuencia práctica es que el CAC de una misma campaña cambia según el modelo, así que compará campañas siempre con el mismo criterio.',
    },
    {
      q: '¿Cómo bajo el CAC sin bajar el volumen?',
      a: 'Por orden de impacto: mejorá la tasa de cierre comercial, que es la que menos se mira y la que más multiplica; después la conversión de la landing, con velocidad de carga, claridad de la oferta y menos campos en el formulario; después el CTR, con creatividades y segmentación; y recién al final negociá el CPM. Como las cuatro tasas se multiplican, mejoras chicas en cada una comprimen el CAC mucho más que una mejora grande en una sola.',
    },
  ],

  sources: [
    {
      name: 'Meta Business Help Center — Cómo se calculan CPM, CPC y costo por resultado',
      url: 'https://www.facebook.com/business/help',
      publisher: 'Meta Platforms',
    },
    {
      name: 'Google Ads Ayuda — Métricas de rendimiento: CTR, CPC, conversiones y ROAS',
      url: 'https://support.google.com/google-ads/answer/2472674',
      publisher: 'Google',
    },
    {
      name: 'RG 4240/2018 — IVA sobre servicios digitales prestados desde el exterior',
      url: 'https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-4240-2018-309375',
      publisher: 'ARCA (ex AFIP) — Boletín Oficial',
    },
    {
      name: 'RG 5617/2024 — Percepción a cuenta de Impuesto a las Ganancias y Bienes Personales',
      url: 'https://www.boletinoficial.gob.ar/',
      publisher: 'Boletín Oficial de la República Argentina',
    },
    {
      name: 'ARCA — Servicios digitales del exterior: sujetos alcanzados y cómputo del crédito fiscal',
      url: 'https://www.arca.gob.ar/',
      publisher: 'Agencia de Recaudación y Control Aduanero',
    },
    {
      name: 'Comisión Arbitral — Regímenes de percepción de Ingresos Brutos por jurisdicción',
      url: 'https://www.comarb.gob.ar/',
      publisher: 'Comisión Arbitral del Convenio Multilateral',
    },
  ],

  replaces: [
    '/calculadora-costo-por-lead-cpl-marketing',
    '/calculadora-cpm-costo-por-mil-impresiones',
    '/calculadora-cpc-costo-por-click',
    '/calculadora-cac-ltv-costo-adquisicion-cliente',
    '/calculadora-reach-frequency-grp-medios',
    '/calculadora-roas-retorno-inversion-publicitaria',
    '/calculadora-cpm-cpc-conversion-ads',
    '/calculadora-tasa-de-conversion',
    '/calculadora-cpa-cac-ltv',
    '/calculadora-costo-real-pauta-exterior-impuestos-argentina',
    '/calculadora-costo-por-view-cpv-video',
    '/calculadora-roi-ad-spend-facebook-meta',
    '/calculadora-churn-retencion-clientes',
    '/calculadora-cac-costo-adquisicion-sales-funnel',
    '/calculadora-attribution-modelo-primer-ultimo-click',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-tiktok-ads-cpm-presupuesto-conversion-2026',
    '/calculadora-tiktok-spark-ads-costo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Alícuotas de la capa fiscal de pauta del exterior — COPIA FIEL de los valores
 * por defecto de `src/lib/formulas/calculadora-costo-real-pauta-exterior-impuestos-argentina.ts`.
 * La de IIBB queda como campo editable porque cambia por jurisdicción.
 */
export const PAUTA_EXTERIOR = {
  /** IVA de servicios digitales del exterior (RG 4240/2018). */
  ivaPct: 21,
  /** Percepción a cuenta de Ganancias y Bienes Personales (RG 5617/2024). */
  percepcionGananciasPct: 30,
};

/** Referencias de mercado que se usan sólo para el texto de contexto. */
export const BENCH = {
  /** Relación LTV/CAC considerada sana. */
  ltvCac: 3,
  /** Meses de referencia para recuperar el CAC. */
  paybackMeses: 12,
};

export const MESES_ANIO = 12;
