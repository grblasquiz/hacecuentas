import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánta plata necesito, cuánto rinde y cuánto vale mi negocio?"
 *
 * Arquetipo RAMIFICADO: cinco ramas encadenadas por la MISMA cuenta. El capital
 * que hace falta para abrir es el denominador de la rentabilidad; la rentabilidad
 * mensual, anualizada y sumada la depreciación, es el EBITDA que se multiplica
 * para valuar; y el WACC es la vara contra la que se compara todo eso.
 *
 * Espejo de las fórmulas originales del repo:
 *  - src/lib/formulas/calculadora-capital-inicial-abrir-negocio.ts (inversión fija + colchón)
 *  - src/lib/formulas/payback-inversion.ts                          (inversión / flujo mensual)
 *  - src/lib/formulas/rentabilidad-mensual.ts                       (ganancia, margen, retorno sobre capital)
 *  - src/lib/formulas/proyeccion-ventas.ts                          (ventas × (1+g)^meses)
 *  - src/lib/formulas/depreciacion-activos-linea-recta.ts           (base depreciable / vida útil)
 *  - src/lib/formulas/valor-empresa-multiplo-ebitda.ts              (EV = EBITDA × múltiplo)
 *  - src/lib/formulas/valuacion-startup-metodo-berkus.ts            (5 factores × USD 500k)
 *  - src/lib/formulas/wacc-costo-capital.ts                         (E/V×Ke + D/V×Kd×(1−t))
 *
 * NOTAS DE CONTRATO:
 *  - El hub MEZCLA unidades: pesos, dólares, meses, años, veces y porcentajes.
 *    TODA fila que no sea plata en pesos declara su propio `format`. El runtime
 *    hace Object.assign y una fila sin formato propio caería a "$".
 *  - La rama Berkus trabaja en USD, como la fórmula original: sus filas van con
 *    format 'unit' + unit 'USD'. Nunca 'ars'.
 *  - Ninguna constante inventada: bandas de múltiplo, techo de Berkus, rango
 *    ±15% y umbrales de payback y de WACC son copia fiel de las fórmulas.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/**
 * Bandas de múltiplo EV/EBITDA — COPIA FIEL de los segmentos y del benchmark
 * cualitativo de `valor-empresa-multiplo-ebitda.ts`. No son "múltiplos por
 * sector" inventados: son los cortes que ya usaba la fórmula.
 */
export const MULTIPLO_BANDAS = [
  { hasta: 3, nombre: 'Bajo', texto: 'típico de negocios con alto riesgo o sin recurrencia' },
  { hasta: 5, nombre: 'Conservador', texto: 'construcción, agricultura y servicios profesionales dependientes del fundador' },
  { hasta: 8, nombre: 'Estándar PyME', texto: 'servicios B2B, manufactura y retail tradicional' },
  { hasta: 12, nombre: 'Premium', texto: 'salud, e-commerce sólido, SaaS mid-market y negocios con moat' },
  { hasta: 18, nombre: 'Alto', texto: 'SaaS top quartile y tecnología de consumo con crecimiento sostenido' },
  { hasta: 60, nombre: 'Muy alto', texto: 'sólo justificable con Rule of 40, crecimiento mayor al 40% y recurrencia arriba del 90%' },
];

/** Rango razonable alrededor del equity value: ±15%, igual que la fórmula. */
export const RANGO_VALUACION_PCT = 15;

/** Tope de múltiplo que la fórmula original rechaza por absurdo. */
export const MULTIPLO_MAX = 50;

/**
 * Método Berkus — COPIA FIEL de `valuacion-startup-metodo-berkus.ts`:
 * cinco factores, cada uno vale hasta USD 500.000, techo total USD 2.500.000.
 * Las bandas de diagnóstico son las del 40 / 60 / 80% del techo.
 */
export const BERKUS = {
  maxPorFactor: 500000,
  techo: 2500000,
  factores: 5,
  bandas: [
    { hasta: 40, nombre: 'Etapa muy temprana' },
    { hasta: 60, nombre: 'Perfil moderado' },
    { hasta: 80, nombre: 'Buen perfil de inversión' },
    { hasta: 101, nombre: 'Muy atractiva para ángeles' },
  ],
};

/** Umbrales de evaluación del payback, en meses — copia fiel de `payback-inversion.ts`. */
export const PAYBACK_BANDAS = [
  { hasta: 6, nombre: 'Excelente' },
  { hasta: 12, nombre: 'Muy bueno' },
  { hasta: 24, nombre: 'Bueno' },
  { hasta: 36, nombre: 'Aceptable' },
  // Sin Infinity a propósito: estas constantes viajan al cliente por define:vars,
  // que las serializa a JSON y convertiría Infinity en null.
  { hasta: 1e9, nombre: 'Largo' },
];

/** Cortes cualitativos del WACC — copia fiel del insight de `wacc-costo-capital.ts`. */
export const WACC_BANDAS = { barato: 8, caro: 15 };

/** Tope de proyección que valida la fórmula original de ventas. */
export const PROYECCION_MAX_MESES = 60;

export const MESES_ANIO = 12;

export const hub: HubData = {
  slug: 'negocios/cuanto-vale-mi-negocio',
  title: '¿Cuánto vale mi negocio? Capital para abrir, rentabilidad y valuación',
  description:
    'Del capital inicial al múltiplo de venta: cuánta plata necesitás para abrir con colchón, en cuántos meses la recuperás, cuánto rinde el negocio por mes y cuánto vale por EBITDA o por método Berkus. Incluye WACC y depreciación.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Negocios y valuación',
  h1: '¿Cuánta plata necesito, cuánto rinde y cuánto vale mi negocio?',
  lede:
    'Son tres preguntas encadenadas por la misma cuenta. El capital que ponés para abrir es el denominador de la rentabilidad; esa rentabilidad, anualizada y con la depreciación sumada de vuelta, es el EBITDA que un comprador multiplica; y el costo de tu capital es la vara mínima que ese negocio tiene que superar para que valga la pena.',
  stamps: ['Actualizado 27-07-2026', 'Del capital inicial al múltiplo de venta', '8 calculadoras adentro'],

  resultLabel: 'El número de la rama que elegiste',

  cases: {
    title: '¿Qué querés averiguar?',
    intro:
      'Las cinco ramas comparten los mismos números: cambiá de rama y el resultado se recalcula solo, con los mismos datos.',
    items: [
      {
        id: 'abrir',
        label: 'Cuánta plata necesito para abrir',
        hint: 'Capital inicial, colchón y payback',
        answer:
          'El capital para abrir no es sólo la inversión fija: es la inversión más un colchón de varios meses de gastos.',
        yes: [
          DISCLAIMER_FINANCE,
          'Inversión inicial fija: alquiler y depósito, equipamiento, mercadería de arranque, habilitaciones y marketing de apertura',
          'Colchón de supervivencia: meses que querés bancar multiplicados por los gastos mensuales de operación',
          'Capital total = inversión fija + colchón. Tres meses de colchón es el default conservador habitual',
          'Payback: el capital total dividido por el flujo de caja mensual neto te dice en cuántos meses lo recuperás',
          'Retorno anualizado simple: el flujo mensual por doce, sobre el capital total',
        ],
        warn: [
          'Saltear el colchón es la causa número uno de cierre temprano: el negocio no factura a nivel de crucero desde el primer mes',
          'El payback no descuenta inflación ni costo de oportunidad: en pesos, recuperar el capital nominal no es recuperar el poder de compra',
          'La mercadería inicial no es gasto sino capital de trabajo inmovilizado; si rota lento, el colchón real que necesitás es mayor',
          'Si el flujo mensual es negativo el payback no existe: el negocio consume capital en vez de devolverlo',
        ],
        plazo: 'planificá el colchón por lo menos hasta el mes en que el flujo mensual se vuelve positivo de forma estable.',
      },
      {
        id: 'rendir',
        label: 'Cuánto rinde por mes y cómo proyecta',
        hint: 'Rentabilidad, margen y crecimiento',
        answer:
          'Margen sobre ventas y retorno sobre capital son dos cosas distintas: un margen chico sobre un capital chico puede rendir muchísimo.',
        yes: [
          DISCLAIMER_FINANCE,
          'Ganancia neta del mes = ingresos menos costos variables menos costos fijos',
          'Margen neto = ganancia sobre ingresos, en porcentaje',
          'Rentabilidad mensual = ganancia sobre el capital invertido (el capital total de la rama anterior)',
          'Rentabilidad anual simple = la mensual por doce, sin capitalizar',
          'Proyección de ventas: las ventas actuales multiplicadas por (1 + tasa) elevado a los meses que proyectes',
          'La depreciación mensual del equipamiento es lo que separa la ganancia contable del EBITDA',
        ],
        warn: [
          'No confundas margen sobre ventas con retorno sobre capital: son numeradores iguales con denominadores distintos',
          'Separá los retiros personales del resultado del negocio o vas a creer que perdés plata cuando en realidad estás cobrando sueldo',
          'La proyección compuesta es una recta sólo en el papel: nadie sostiene un 10% mensual doce meses seguidos',
          'Una tasa de crecimiento medida en pesos corrientes puede ser caída real si la inflación del período fue mayor',
          'Comparar un solo mes no dice nada: mirá al menos un trimestre para descontar estacionalidad',
        ],
        plazo: 'revisá margen y rentabilidad con cierre mensual, y la proyección cada trimestre contra lo que pasó de verdad.',
      },
      {
        id: 'valer-marcha',
        label: 'Cuánto vale un negocio en marcha',
        hint: 'Múltiplo de EBITDA',
        answer:
          'Un negocio en marcha se valúa multiplicando su EBITDA anual por un múltiplo de industria, y después restando la deuda neta.',
        yes: [
          DISCLAIMER_FINANCE,
          'EBITDA anual = (ingresos − costos variables − costos fijos) por doce, más la depreciación del período',
          'Enterprise Value = EBITDA anual × múltiplo de la industria',
          'Deuda neta = deuda total menos caja y equivalentes',
          'Equity Value = Enterprise Value − deuda neta: es lo que te queda a vos en la venta',
          'Rango razonable de negociación: el equity value más y menos 15%',
        ],
        warn: [
          'El múltiplo no es un dato tuyo: lo pone el mercado por sector, tamaño y recurrencia. Verificá comparables antes de usar uno',
          'Un negocio que depende del fundador vale menos: si sin vos no factura, el comprador está comprando tu agenda, no una empresa',
          'Si la deuda neta supera el Enterprise Value, el equity da negativo: el comprador asume el pasivo y vos no cobrás nada',
          'El EBITDA no es caja: no descuenta inversiones de reposición, capital de trabajo ni impuestos',
          'Ajustá el EBITDA por gastos personales metidos en la empresa antes de multiplicar, o estás valuando un número que no existe',
        ],
        plazo: 'una valuación sirve mientras los estados contables tengan menos de un año; después hay que rehacerla.',
      },
      {
        id: 'valer-startup',
        label: 'Cuánto vale una startup sin facturación',
        hint: 'Método Berkus, en dólares',
        answer:
          'Sin facturación no hay EBITDA que multiplicar: el método Berkus le pone precio a cinco factores cualitativos, hasta USD 500.000 cada uno.',
        yes: [
          DISCLAIMER_FINANCE,
          'Idea atractiva y valor base: hasta USD 500.000',
          'Prototipo o tecnología que reduce el riesgo tecnológico: hasta USD 500.000',
          'Equipo de gestión que reduce el riesgo de ejecución: hasta USD 500.000',
          'Relaciones estratégicas que reducen el riesgo de mercado: hasta USD 500.000',
          'Ventas o tracción que reducen el riesgo de producción: hasta USD 500.000',
          'Techo total del método: USD 2.500.000 de valuación pre-money',
        ],
        warn: [
          'Es un método pre-revenue: en cuanto hay facturación estable, el múltiplo de EBITDA manda y Berkus deja de aplicar',
          'El método fue pensado en dólares y para rondas ángel: convertirlo a pesos al tipo de cambio del día no lo hace más preciso',
          'La valuación es pre-money: lo que entra en la ronda se suma después para calcular el porcentaje que cede el fundador',
          'Ponerse los cinco factores en el máximo no sube la valuación real: el inversor pone los números, no vos',
          'Una valuación inicial inflada complica la ronda siguiente: un down round es peor que arrancar más abajo',
        ],
        plazo: 'la valuación Berkus se rehace en cada ronda, y muere cuando aparece facturación recurrente.',
      },
      {
        id: 'wacc',
        label: 'Cuánto me cuesta el capital que uso',
        hint: 'WACC y creación de valor',
        answer:
          'El WACC es el retorno mínimo que tenés que generar: un proyecto que rinde menos destruye valor aunque dé ganancia contable.',
        yes: [
          DISCLAIMER_FINANCE,
          'WACC = peso del capital propio × su costo, más peso de la deuda × su costo después de impuestos',
          'Peso de cada fuente sobre el valor total del capital (propio + deuda)',
          'La deuda cuesta menos porque los intereses son deducibles: su costo real es la tasa por (1 − alícuota de Ganancias)',
          'Spread de valor: la rentabilidad anual de tu negocio menos el WACC, en puntos porcentuales',
          'Un spread positivo crea valor; uno negativo lo destruye aunque el resultado contable sea ganancia',
        ],
        warn: [
          'Ganancia contable no es creación de valor: si el capital te cuesta 30% y el negocio rinde 20%, perdés 10 puntos por año',
          'El costo del capital propio no es cero: es lo que ese dinero rendiría en la mejor alternativa de riesgo comparable',
          'En contextos de inflación alta, comparar un WACC nominal contra una rentabilidad nominal esconde el resultado real: pasá los dos a términos reales',
          'Más deuda baja el WACC hasta un punto y después lo sube, porque el riesgo de default encarece todo',
          'El escudo fiscal sólo existe si tenés ganancia imponible contra la cual deducir los intereses',
        ],
        plazo: 'recalculá el WACC cada vez que cambie tu estructura de capital o el costo de la deuda.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada rama usa los campos que le sirven y deja los demás quietos. Los montos van en pesos, salvo los cinco factores del método Berkus, que van en dólares.',
  fields: [
    {
      id: 'alquiler_deposito',
      label: 'Alquiler y depósito de garantía',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 3000000,
      thousands: true,
      help: 'Lo que pagás antes de abrir: adelanto, depósito y comisión.',
    },
    {
      id: 'equipamiento',
      label: 'Equipamiento e instalaciones',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 6000000,
      thousands: true,
      help: 'Muebles, máquinas, obra y tecnología. Es también el activo que después se deprecia.',
    },
    {
      id: 'mercaderia',
      label: 'Mercadería o insumos iniciales',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 2500000,
      thousands: true,
    },
    {
      id: 'habilitaciones_marketing',
      label: 'Habilitaciones, papeles y marketing de apertura',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 1500000,
      thousands: true,
    },
    {
      id: 'meses_colchon',
      label: 'Meses de colchón que querés bancar',
      type: 'number',
      min: 0,
      max: 36,
      step: 1,
      value: 3,
      help: 'Tres meses es el default conservador. Si el rubro tarda en madurar, seis.',
    },
    {
      id: 'gastos_mensuales',
      label: 'Gastos mensuales de operación',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 2200000,
      thousands: true,
      help: 'Todo lo que sale por mes esté abierto o no: alquiler, sueldos, servicios, seguros.',
    },
    {
      id: 'ingresos',
      label: 'Ingresos del mes',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 6000000,
      thousands: true,
    },
    {
      id: 'costos_variables',
      label: 'Costos variables del mes',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 2400000,
      thousands: true,
      help: 'Los que se mueven con las ventas: mercadería vendida, comisiones, packaging.',
    },
    {
      id: 'costos_fijos',
      label: 'Costos fijos del mes',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 2200000,
      thousands: true,
      help: 'Incluí acá la depreciación contable si tu resultado ya la tiene adentro.',
    },
    {
      id: 'crecimiento',
      label: 'Crecimiento mensual de las ventas',
      type: 'number',
      suffix: '%',
      min: -50,
      max: 100,
      step: 0.5,
      value: 4,
      help: 'Puede ser negativo. Se aplica compuesto, mes sobre mes.',
    },
    {
      id: 'meses_proyectar',
      label: 'Meses a proyectar',
      type: 'number',
      min: 1,
      max: 60,
      step: 1,
      value: 12,
    },
    {
      id: 'activo_valor',
      label: 'Valor de compra del activo a depreciar',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 6000000,
      thousands: true,
      help: 'Normalmente coincide con el equipamiento de la primera rama.',
    },
    {
      id: 'activo_residual',
      label: 'Valor residual al final de la vida útil',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 600000,
      thousands: true,
    },
    {
      id: 'activo_vida',
      label: 'Vida útil del activo',
      type: 'number',
      suffix: 'años',
      min: 1,
      max: 50,
      step: 1,
      value: 5,
    },
    {
      id: 'multiplo',
      label: 'Múltiplo EV/EBITDA de tu industria',
      type: 'number',
      suffix: '×',
      min: 0.5,
      max: 50,
      step: 0.5,
      value: 5,
      help: 'Menos de 3 es bajo; 5 a 8 es el estándar PyME; arriba de 12 hay que justificarlo con crecimiento y recurrencia.',
    },
    {
      id: 'deuda_total',
      label: 'Deuda total del negocio',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 5000000,
      thousands: true,
      help: 'Préstamos, saldos financiados y descubiertos. También pesa en el WACC.',
    },
    {
      id: 'caja',
      label: 'Caja y equivalentes',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 1500000,
      thousands: true,
      help: 'Se resta de la deuda para llegar a la deuda neta.',
    },
    {
      id: 'berkus_idea',
      label: 'Berkus — idea atractiva y valor base',
      type: 'select',
      value: '250000',
      options: [
        { value: '0', label: 'No aplica — USD 0' },
        { value: '125000', label: 'Incipiente — USD 125.000' },
        { value: '250000', label: 'Sólida — USD 250.000' },
        { value: '375000', label: 'Muy sólida — USD 375.000' },
        { value: '500000', label: 'Máximo del factor — USD 500.000' },
      ],
    },
    {
      id: 'berkus_prototipo',
      label: 'Berkus — prototipo o tecnología (riesgo tecnológico)',
      type: 'select',
      value: '250000',
      options: [
        { value: '0', label: 'No aplica — USD 0' },
        { value: '125000', label: 'Incipiente — USD 125.000' },
        { value: '250000', label: 'Sólido — USD 250.000' },
        { value: '375000', label: 'Muy sólido — USD 375.000' },
        { value: '500000', label: 'Máximo del factor — USD 500.000' },
      ],
    },
    {
      id: 'berkus_equipo',
      label: 'Berkus — equipo de gestión (riesgo de ejecución)',
      type: 'select',
      value: '375000',
      options: [
        { value: '0', label: 'No aplica — USD 0' },
        { value: '125000', label: 'Incipiente — USD 125.000' },
        { value: '250000', label: 'Sólido — USD 250.000' },
        { value: '375000', label: 'Muy sólido — USD 375.000' },
        { value: '500000', label: 'Máximo del factor — USD 500.000' },
      ],
    },
    {
      id: 'berkus_relaciones',
      label: 'Berkus — relaciones estratégicas (riesgo de mercado)',
      type: 'select',
      value: '125000',
      options: [
        { value: '0', label: 'No aplica — USD 0' },
        { value: '125000', label: 'Incipiente — USD 125.000' },
        { value: '250000', label: 'Sólidas — USD 250.000' },
        { value: '375000', label: 'Muy sólidas — USD 375.000' },
        { value: '500000', label: 'Máximo del factor — USD 500.000' },
      ],
    },
    {
      id: 'berkus_traccion',
      label: 'Berkus — ventas o tracción (riesgo de producción)',
      type: 'select',
      value: '0',
      options: [
        { value: '0', label: 'Todavía no hay — USD 0' },
        { value: '125000', label: 'Primeros usuarios — USD 125.000' },
        { value: '250000', label: 'Tracción real — USD 250.000' },
        { value: '375000', label: 'Tracción fuerte — USD 375.000' },
        { value: '500000', label: 'Máximo del factor — USD 500.000' },
      ],
    },
    {
      id: 'capital_propio',
      label: 'Capital propio (equity) puesto en el negocio',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000,
      step: 10000,
      value: 13000000,
      thousands: true,
    },
    {
      id: 'costo_equity',
      label: 'Costo del capital propio, anual',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 200,
      step: 0.5,
      value: 35,
      help: 'Lo que ese dinero rendiría en la mejor alternativa de riesgo parecido.',
    },
    {
      id: 'costo_deuda',
      label: 'Costo de la deuda, anual',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 300,
      step: 0.5,
      value: 60,
      help: 'La tasa efectiva que te cobra el banco, antes del efecto impositivo.',
    },
    {
      id: 'tasa_impositiva',
      label: 'Alícuota de Impuesto a las Ganancias',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 60,
      step: 1,
      value: 35,
      help: 'Es la que genera el escudo fiscal sobre los intereses de la deuda.',
    },
  ],
  fineprint:
    'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir. Nada de esto es asesoramiento de inversión ni una tasación: los múltiplos de mercado, el costo del capital y los valores del método Berkus dependen del sector, del tamaño y del momento, y una operación real se cierra con estados contables auditados y due diligence.',

  chart: {
    type: 'donut',
    title: 'Cómo se reparte el número',
    caption:
      'En la rama de apertura el gráfico parte el capital total por rubro y muestra cuánto pesa el colchón. En la de rentabilidad parte los ingresos del mes en costos variables, costos fijos y ganancia. En la valuación por EBITDA separa el Enterprise Value en deuda neta y equity. En Berkus muestra qué factor aporta cuánto. En la de WACC, cuántos puntos aporta cada fuente de financiamiento.',
  },
  breakdownTitle: 'El desglose completo',
  breakdownIntro:
    'Cada fila trae su unidad: hay pesos, dólares, meses, años, veces y porcentajes. Las barras comparan cada concepto con el mayor de la rama.',

  faq: [
    {
      q: '¿Cuánta plata necesito para abrir un negocio?',
      a: 'La inversión fija más un colchón de supervivencia. La inversión fija es lo que pagás antes de vender el primer peso: alquiler y depósito, equipamiento, mercadería inicial, habilitaciones y marketing de apertura. El colchón son los meses que querés bancar multiplicados por los gastos mensuales de operación, porque el negocio no factura a nivel de crucero desde el primer día. Tres meses es el default conservador; en rubros de maduración lenta conviene seis. Abrir sin colchón es la causa número uno de cierre temprano.',
    },
    {
      q: '¿Qué diferencia hay entre margen neto y rentabilidad sobre el capital?',
      a: 'El numerador es el mismo —la ganancia del mes— pero el denominador cambia todo. El margen neto divide la ganancia por los ingresos y te dice cuánto te queda de cada peso vendido. La rentabilidad divide la ganancia por el capital invertido y te dice cuánto rinde tu plata. Un kiosco puede tener 8% de margen y rendir 6% mensual sobre el capital porque rota rapidísimo; una inmobiliaria puede tener 40% de margen y rendir 1% porque el capital inmovilizado es enorme. Para decidir si invertir, manda la rentabilidad sobre capital.',
    },
    {
      q: '¿Cómo se calcula el payback de una inversión?',
      a: 'Inversión inicial dividida por el flujo de caja mensual neto. Si pusiste 13 millones y el negocio deja 1,4 millones limpios por mes, el payback es de 9,3 meses. La lectura habitual es: hasta 6 meses excelente, hasta 12 muy bueno, hasta 24 bueno, hasta 36 aceptable y más allá largo. El payback no descuenta inflación ni costo de oportunidad, así que en un contexto de precios en movimiento es un piso optimista: recuperar el capital nominal no es recuperar el poder de compra.',
    },
    {
      q: '¿Cómo se valúa un negocio en marcha?',
      a: 'El método más usado en compraventa de PyMEs es el múltiplo de EBITDA. Se toma el EBITDA anual —resultado operativo antes de intereses, impuestos, depreciaciones y amortizaciones—, se lo multiplica por el múltiplo que paga el mercado en ese sector y se obtiene el Enterprise Value. A eso se le resta la deuda neta, que es la deuda total menos la caja, y queda el Equity Value: lo que cobra el vendedor. Un rango de negociación razonable es ese equity más y menos 15%.',
    },
    {
      q: '¿Qué múltiplo de EBITDA corresponde a mi sector?',
      a: 'El múltiplo lo pone el mercado, no el dueño. Por debajo de 3× se ubican los negocios de alto riesgo o sin ingresos recurrentes. Entre 3× y 5× es conservador: construcción, agricultura y servicios profesionales muy dependientes del fundador. Entre 5× y 8× está el estándar PyME de servicios B2B, manufactura y retail tradicional. De 8× a 12× es premium: salud, e-commerce consolidado, SaaS mid-market. De 12× a 18× ya es alto y sólo lo sostienen empresas de tecnología con crecimiento firme. Arriba de 18× hace falta justificarlo con crecimiento mayor al 40% y recurrencia arriba del 90%.',
    },
    {
      q: '¿Qué es el método Berkus y cuándo se usa?',
      a: 'Es un método de valuación para startups que todavía no facturan, donde no hay EBITDA que multiplicar. Le asigna hasta 500.000 dólares a cada uno de cinco factores que reducen riesgo: la idea y su valor base, el prototipo o tecnología funcionando, el equipo de gestión, las relaciones estratégicas y las primeras ventas o tracción. El techo del método es 2.500.000 dólares de valuación pre-money. Se usa en rondas ángel y deja de aplicar en cuanto hay facturación recurrente: ahí manda el múltiplo.',
    },
    {
      q: '¿Por qué EBITDA y método Berkus dan números tan distintos?',
      a: 'Porque miden cosas distintas. El múltiplo de EBITDA valúa lo que el negocio ya genera: es una foto del pasado proyectada hacia adelante, y por eso un negocio rentable pero chico vale poco. Berkus valúa riesgo eliminado: cuánto menos incierto es el proyecto gracias al equipo, al prototipo y a los acuerdos, sin exigir un solo peso de facturación. Una startup sin ventas puede valer un millón de dólares por Berkus y cero por EBITDA; un kiosco muy rentable puede valer bien por EBITDA y no encajar en Berkus ni un poco. Si tenés facturación estable, usá el múltiplo; si no la tenés, Berkus.',
    },
    {
      q: '¿Qué es la deuda neta y por qué se resta de la valuación?',
      a: 'Es la deuda total del negocio menos la caja y los equivalentes. Se resta porque el comprador, además de pagarte, se hace cargo de esos pasivos: el Enterprise Value es lo que vale la operación completa, y el Equity Value es lo que queda para los dueños después de la deuda. Si la caja supera la deuda, la deuda neta es negativa y suma valor. Si la deuda supera el Enterprise Value, el equity da negativo: en la práctica el negocio no se vende, se reestructura.',
    },
    {
      q: '¿Qué es el WACC y por qué un proyecto puede dar ganancia y destruir valor?',
      a: 'El WACC es el costo promedio ponderado del capital: el peso del capital propio por su costo, más el peso de la deuda por su costo después de impuestos. Es el retorno mínimo que el negocio tiene que generar para dejar contentos a dueños y acreedores. Si tu capital cuesta 30% anual y el negocio rinde 20%, el resultado contable puede ser ganancia, pero estás destruyendo diez puntos de valor por año: ese mismo capital rendía más en otro lado. La cuenta que importa no es "¿gané?" sino "¿gané más que mi costo de capital?".',
    },
    {
      q: '¿Por qué la deuda cuesta menos que el capital propio?',
      a: 'Por dos razones. Primero, el acreedor cobra antes que el dueño y con garantías, así que asume menos riesgo y pide menos retorno. Segundo, los intereses son deducibles de Ganancias: si la tasa es 60% y la alícuota 35%, el costo real de esa deuda es 39%, porque el fisco te devuelve parte vía menor impuesto. Eso se llama escudo fiscal y sólo existe si tenés ganancia imponible contra la cual deducir. Ojo: más deuda baja el WACC hasta cierto punto y después lo sube, porque el riesgo de default encarece todas las fuentes.',
    },
    {
      q: '¿Qué es la depreciación y por qué separa el EBITDA de la ganancia neta?',
      a: 'La depreciación reparte el costo de un activo a lo largo de su vida útil. Por línea recta se calcula como valor de compra menos valor residual, dividido por los años de vida útil. Es un cargo contable que baja la ganancia pero no sale de la caja: la plata ya se fue el día que compraste la máquina. Por eso el EBITDA, que suma de vuelta las depreciaciones y amortizaciones, se usa para valuar: aproxima la generación de caja operativa y hace comparables empresas con políticas de amortización distintas. La contracara es que el EBITDA ignora que esa máquina hay que reponerla.',
    },
    {
      q: '¿Sirve proyectar ventas con una tasa de crecimiento fija?',
      a: 'Sirve como escenario, no como pronóstico. Aplicar un porcentaje compuesto mes a mes muestra bien el efecto acumulativo —un 4% mensual multiplica la facturación por 1,6 en un año— pero ninguna empresa sostiene una tasa constante: hay estacionalidad, capacidad instalada y saturación de mercado. Además, en un contexto inflacionario, crecer en pesos corrientes puede ser caer en términos reales. Usá la proyección para dimensionar necesidades de capital de trabajo y para comparar escenarios, y contrastala cada trimestre con lo que pasó de verdad.',
    },
  ],

  sources: [
    {
      name: 'Damodaran Online — EV/EBITDA multiples by industry sector',
      url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datacurrent.html',
      publisher: 'Stern School of Business, New York University',
    },
    {
      name: 'Dave Berkus — The Berkus Method: valuing the early stage investment',
      url: 'https://berkonomics.com/?p=2752',
      publisher: 'Berkonomics',
    },
    {
      name: 'Corporate Finance Institute — EV/EBITDA multiple',
      url: 'https://corporatefinanceinstitute.com/resources/valuation/ev-ebitda/',
      publisher: 'Corporate Finance Institute',
    },
    {
      name: 'Weighted Average Cost of Capital (WACC): definición y fórmula',
      url: 'https://www.investopedia.com/terms/w/wacc.asp',
      publisher: 'Investopedia',
    },
    {
      name: 'Ley 20.628 de Impuesto a las Ganancias — amortizaciones de bienes de uso (texto actualizado)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/44911/texact.htm',
      publisher: 'InfoLEG — Ministerio de Justicia',
    },
    {
      name: 'ARCA — Impuesto a las Ganancias: alícuotas para sociedades',
      url: 'https://www.arca.gob.ar/gananciasYBienes/',
      publisher: 'Agencia de Recaudación y Control Aduanero',
    },
    {
      name: 'FACPCE — Resoluciones Técnicas de valuación y medición contable',
      url: 'https://www.facpce.org.ar/normativa/',
      publisher: 'Federación Argentina de Consejos Profesionales de Ciencias Económicas',
    },
  ],

  replaces: [
    '/calculadora-capital-inicial-abrir-negocio',
    '/calculadora-rentabilidad-mensual-negocio',
    '/calculadora-proyeccion-ventas-crecimiento',
    '/calculadora-payback-periodo-recupero-inversion',
    '/calculadora-valor-empresa-multiplo-ebitda',
    '/calculadora-valuacion-startup-metodo-berkus',
    '/calculadora-wacc-costo-capital-promedio-ponderado',
    '/calculadora-depreciacion-activos-linea-recta',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
