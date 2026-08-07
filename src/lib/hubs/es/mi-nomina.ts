import type { HubData } from '../types';
import { SMI_2026, FUNCIONARIOS_SUBIDA } from '../../data/espana-2026';

/**
 * Hub de decisión ES — "¿Está bien lo que me pagan?"
 *
 * Absorbe 8 calculadoras: horas extra, paga extra y prorrateo, vacaciones,
 * SMI, convenios de comercio y hostelería, subida de funcionarios y coste del
 * trabajador para la empresa (la contracara de la misma nómina).
 *
 * El neto fino con IRPF vive en /es/impuestos/irpf-nomina: aquí el IRPF se
 * estima con el tipo de retención que el usuario ve en su nómina, y se enlaza
 * conceptualmente en la FAQ.
 *
 * Tablas de convenio: espejo de
 * src/lib/formulas/convenio-comercio-espana-sueldo-categoria-2026.ts y
 * src/lib/formulas/convenio-hosteleria-espana-sueldo-2026-categoria.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio fiscal/plata). */
const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'es/trabajo/mi-nomina',
  title: 'Sueldo convenio hostelería y comercio 2026 — Nómina España',
  description:
    'Comprueba si tu nómina cuadra: sueldo del convenio de hostelería y comercio 2026 por categoría y nivel, valor real de la hora extra, paga extra y prorrateo, días de vacaciones y lo que le cuestas a la empresa.',
  silo: 'Trabajo',
  siloHref: '/es/trabajo',

  eyebrow: 'Guía laboral y estimación',
  h1: 'Tu sueldo por convenio en España 2026: hostelería, comercio y tu nómina',
  lede:
    'Una nómina española se arma por capas: el salario base que fija tu convenio, los pluses, las pagas extra —cobradas aparte o prorrateadas—, las horas extra con su recargo y, al final, lo que descuentan la Seguridad Social y el IRPF. Aquí puedes rehacer cada capa y ver también la cifra que casi nadie enseña: lo que le cuestas de verdad a la empresa.',
  stamps: ['Salario mínimo y convenios sectoriales', 'Cotización de trabajador y de empresa', '8 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿De dónde sale tu salario?',
    intro: 'El convenio manda sobre el contrato: nadie puede cobrar por debajo de su tabla salarial.',
    items: [
      {
        id: 'smi',
        label: 'Salario mínimo o jornada parcial',
        hint: 'Suelo legal de cualquier contrato',
        answer:
          'El salario mínimo es el suelo absoluto: a jornada parcial se prorratea, nunca se paga por debajo de la parte proporcional.',
        yes: [
          'Salario mínimo interprofesional a jornada completa',
          'Prorrateo estricto de la jornada parcial',
          'Reparto en 12 o en 14 pagas, a elección del convenio',
          'Cotización del trabajador sobre el bruto',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'El salario mínimo se compara en cómputo anual, no mes a mes: los pluses de convenio pueden absorberlo según lo que diga la norma que lo fija cada año',
          'A jornada parcial las horas complementarias tienen que estar pactadas por escrito',
        ],
        plazo: 'el salario mínimo se revisa cada año y se aplica con efectos del 1 de enero.',
      },
      {
        id: 'comercio',
        label: 'Convenio de comercio',
        hint: 'Dependiente, cajero, encargado…',
        answer:
          'En comercio el salario sale de la tabla de tu categoría, más el plus del convenio y los trienios de antigüedad.',
        yes: [
          'Salario base de la tabla por categoría profesional',
          'Plus de convenio propio de cada categoría',
          'Antigüedad por tramos: 3%, 6% y más a partir de los diez años',
          'Prorrateo de la jornada si es parcial',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Los convenios de comercio son en su mayoría provinciales: la tabla estatal es sólo una referencia y tu provincia puede pagar más',
          'La categoría que figura en tu contrato tiene que corresponderse con las funciones reales, no con lo que le convenga a la empresa',
        ],
        plazo: 'las tablas salariales se publican en el BOE o boletín provincial al firmarse cada convenio.',
      },
      {
        id: 'hosteleria',
        label: 'Convenio de hostelería',
        hint: 'Camarero, cocinero, recepción…',
        answer:
          'En hostelería el salario base cambia mucho por provincia y se suman nocturnidad y antigüedad.',
        yes: [
          'Salario base de la tabla por categoría',
          'Plus de nocturnidad del 15% cuando se trabaja de noche',
          'Antigüedad del 1% por año, con tope del 20%',
          'Pagas extra cobradas aparte o prorrateadas',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La tabla usada es una media de referencia: la de tu provincia puede diferir varios cientos de euros',
          'Las horas extra en hostelería suelen pagarse como horas ordinarias por convenio, pero nunca por debajo de su valor',
        ],
        plazo: 'el convenio estatal marca el suelo; el provincial suele mejorarlo.',
      },
      {
        id: 'funcionario',
        label: 'Empleado público',
        hint: 'Subida y atrasos del acuerdo',
        answer:
          'La subida de los empleados públicos se pacta por acuerdo plurianual, con una parte fija y otra ligada al IPC.',
        yes: [
          'Subida consolidable del ' + FUNCIONARIOS_SUBIDA.pct2025 + '% del primer año, con atrasos retroactivos',
          'Subida fija del ' + FUNCIONARIOS_SUBIDA.pct2026Fijo + '% del segundo año',
          'Hasta un ' + FUNCIONARIOS_SUBIDA.pct2026Variable + '% adicional si el IPC alcanza el umbral pactado',
          'Se aplica sobre todas las retribuciones, en 12 o 14 pagas',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La parte variable no está garantizada: depende de que el IPC llegue al umbral y se cobra con retraso',
          'Trienios, complemento de destino y específico varían por cuerpo y administración: aquí se aplica el porcentaje sobre el bruto que introduzcas',
        ],
        plazo: 'los atrasos se abonan de una vez cuando se publica el acuerdo.',
      },
      {
        id: 'empresa',
        label: 'Soy la empresa: ¿cuánto me cuesta?',
        hint: 'Bruto + cuota patronal',
        answer:
          'Un trabajador cuesta en torno a un 30-33% más que su bruto, por la cotización a cargo de la empresa.',
        yes: [
          'Contingencias comunes a cargo de la empresa',
          'Desempleo, con tipo distinto para indefinido y temporal',
          'FOGASA, formación profesional y mecanismo de equidad intergeneracional',
          'Todo se calcula sobre la base de cotización, con su tope máximo mensual',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'No incluye accidentes de trabajo y enfermedad profesional, cuyo tipo depende de la actividad según la tarifa de primas',
          'Tampoco incluye indemnizaciones, formación, equipo ni bonificaciones a la contratación',
        ],
        plazo: 'las cuotas se ingresan mediante el sistema de liquidación directa dentro del mes siguiente.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'Si conoces tu salario base del convenio, ponlo; si lo dejas en cero usamos la tabla de referencia de tu categoría.',
  fields: [
    {
      id: 'salarioBase',
      label: 'Salario base mensual (0 = usar tabla del convenio)',
      prefix: '€',
      value: '0',
      thousands: true,
    },
    {
      id: 'categoria',
      label: 'Categoría profesional',
      type: 'select',
      value: 'dependiente',
      options: [
        { value: 'director_gerente', label: 'Comercio · Director o gerente' },
        { value: 'jefe_seccion', label: 'Comercio · Jefe de sección' },
        { value: 'encargado_establecimiento', label: 'Comercio · Encargado de establecimiento' },
        { value: 'dependiente_mayor', label: 'Comercio · Dependiente mayor' },
        { value: 'dependiente', label: 'Comercio · Dependiente' },
        { value: 'cajero', label: 'Comercio · Cajero' },
        { value: 'mozo_almacen', label: 'Comercio · Mozo de almacén' },
        { value: 'encargado_sector', label: 'Hostelería · Encargado de sector' },
        { value: 'jefe_rango', label: 'Hostelería · Jefe de rango' },
        { value: 'gobernanta', label: 'Hostelería · Gobernanta' },
        { value: 'cocinero', label: 'Hostelería · Cocinero' },
        { value: 'recepcionista', label: 'Hostelería · Recepcionista' },
        { value: 'camarero', label: 'Hostelería · Camarero' },
        { value: 'ayudante_cocina', label: 'Hostelería · Ayudante de cocina' },
      ],
    },
    {
      id: 'jornada',
      label: 'Jornada',
      type: 'select',
      value: '100',
      options: [
        { value: '100', label: 'Completa' },
        { value: '75', label: 'Parcial 75% (30 h/semana)' },
        { value: '50', label: 'Media jornada' },
        { value: '25', label: 'Parcial 25% (10 h/semana)' },
      ],
    },
    { id: 'antiguedad', label: 'Años en la empresa', type: 'number', value: '3', min: 0, max: 45, step: 1 },
    {
      id: 'pagas',
      label: 'Número de pagas al año',
      type: 'select',
      value: '14',
      options: [
        { value: '14', label: '14 pagas (extras aparte)' },
        { value: '12', label: '12 pagas (extras prorrateadas)' },
      ],
    },
    {
      id: 'horasExtra',
      label: 'Horas extra al año',
      type: 'number',
      value: '0',
      min: 0,
      max: 500,
      step: 1,
      help: 'El máximo legal de horas extra ordinarias son 80 al año.',
    },
    {
      id: 'recargo',
      label: 'Recargo de la hora extra',
      type: 'number',
      value: '0',
      min: 0,
      max: 100,
      step: 5,
      suffix: '%',
      help: 'Lo fija tu convenio. Por ley la hora extra no puede valer menos que la ordinaria.',
    },
    {
      id: 'jornadaAnual',
      label: 'Jornada anual de tu convenio',
      type: 'number',
      value: '1800',
      min: 1200,
      max: 2000,
      step: 10,
      suffix: ' h',
      help: 'Está en tu convenio. Si usas una jornada que no es la tuya, el valor de la hora extra sale mal.',
    },
    {
      id: 'contrato',
      label: 'Tipo de contrato',
      type: 'select',
      value: 'indefinido',
      options: [
        { value: 'indefinido', label: 'Indefinido' },
        { value: 'temporal', label: 'Temporal' },
      ],
    },
  ],
  fineprint: DISCLAIMER_FISCAL,

  chart: {
    type: 'donut',
    title: 'Cómo se compone tu bruto anual',
    caption:
      'El salario base es sólo una parte: pluses, antigüedad y horas extra suman, y de ese total salen después los descuentos.',
  },
  breakdownTitle: 'Tu nómina, capa por capa',
  breakdownIntro:
    'Los importes son anuales salvo donde se indica. Las filas de horas, días y porcentaje llevan su unidad.',

  faq: [
    {
      q: '¿Cuánto vale mi hora extra?',
      a: 'El punto de partida es tu salario bruto anual dividido entre la jornada anual de tu convenio. Sobre esa hora ordinaria se aplica el recargo que fije el convenio. La ley sólo garantiza un mínimo: la hora extra nunca puede pagarse por debajo de la ordinaria. Muchos convenios prefieren compensarlas con descanso en vez de con dinero.',
    },
    {
      q: '¿Cuántas horas extra puedo hacer al año?',
      a: 'El máximo legal de horas extra ordinarias son 80 al año. No cuentan para ese tope las compensadas con descanso dentro de los cuatro meses siguientes ni las de fuerza mayor. Superar el tope es una infracción de la empresa, no tuya.',
    },
    {
      q: '¿Me conviene cobrar las pagas extra prorrateadas?',
      a: 'En dinero anual da exactamente igual: el bruto es el mismo repartido en 12 o en 14 veces. Cambia el flujo de caja: con 14 pagas cobras menos cada mes y recibes dos ingresos grandes; con 12 tienes la nómina más alta pero ningún colchón en junio ni en diciembre. Ojo, algunos convenios prohíben el prorrateo.',
    },
    {
      q: '¿Cuántos días de vacaciones me corresponden?',
      a: 'El mínimo legal son 30 días naturales al año, que en muchos convenios se traducen en 22 días laborables. Son irrenunciables y no se pueden cambiar por dinero salvo cuando el contrato termina sin haberlas disfrutado: ahí se pagan en el finiquito.',
    },
    {
      q: '¿Cuál es el sueldo del convenio de hostelería en España 2026 por categoría y nivel?',
      a: 'Como referencia estatal media, el salario base mensual por categoría es: encargado de sector 1.580 €, jefe de rango 1.510 €, gobernanta 1.445 €, cocinero 1.385 €, recepcionista 1.365 €, camarero 1.345 € y ayudante de cocina 1.245 €. A eso se suman el plus de nocturnidad del 15% cuando se trabaja de noche y la antigüedad de alrededor de un 1% por año con tope del 20%. Ojo: cada convenio provincial agrupa las categorías en niveles y puede pagar varios cientos de euros más que esta media; consulta la tabla de tu provincia en el BOE o el boletín provincial.',
    },
    {
      q: '¿Qué es la antigüedad y cuánto suma?',
      a: 'Es un complemento por permanencia que fija cada convenio, normalmente en trienios o en un porcentaje anual con tope. En comercio suele ir por tramos de tres, seis y diez años; en hostelería, alrededor de un 1% por año con un techo del 20%. Hay convenios que la han congelado o suprimido para nuevas incorporaciones.',
    },
    {
      q: '¿La empresa puede pagarme por debajo del convenio?',
      a: 'No. El convenio es el suelo de tu sector y de tu categoría, y un contrato que pague menos es nulo en esa cláusula: te corresponde la diferencia, reclamable hasta un año atrás. Sí puede pagarte por encima, y eso se llama mejora voluntaria.',
    },
    {
      q: '¿Cómo sé qué convenio se me aplica?',
      a: 'Por la actividad principal de la empresa, no por tu puesto. Tiene que figurar en tu contrato y en tu nómina. Si hay convenio de empresa, prevalece en salario sobre el sectorial; si no, se aplica el provincial y, en su defecto, el estatal.',
    },
    {
      q: '¿Cuánto le cuesto a mi empresa?',
      a: 'Entre un 30% y un 33% más de tu bruto. La empresa aporta contingencias comunes, desempleo (más caro si el contrato es temporal), FOGASA, formación profesional y el mecanismo de equidad intergeneracional, todo sobre tu base de cotización y con un tope mensual. A eso se suman los accidentes de trabajo, cuyo tipo depende de la actividad.',
    },
    {
      q: '¿Por qué mi base de cotización no coincide con mi bruto mensual?',
      a: 'Porque la base incluye la parte proporcional de las pagas extra aunque las cobres aparte, y porque tiene un tope máximo mensual. Por encima de ese tope no se cotiza más por la vía ordinaria, sólo por la cotización adicional de solidaridad.',
    },
    {
      q: '¿Y el IRPF que me descuentan?',
      a: 'Es una retención a cuenta que la empresa calcula con el algoritmo oficial según tu bruto anual estimado y tu situación familiar. No es un porcentaje fijo ni un impuesto cerrado. El cálculo fino, con la escala de tu comunidad autónoma y si te sale a devolver, está en el hub de IRPF de la nómina.',
    },
    {
      q: '¿Cuándo suben los salarios de los empleados públicos?',
      a: 'Cuando se firma el acuerdo plurianual con los sindicatos y se publica la norma que lo desarrolla. Suele tener una parte fija consolidable y otra ligada a que el IPC alcance un umbral. Las subidas del año ya vencido se abonan como atrasos en un solo pago.',
    },
  ],

  sources: [
    {
      name: 'Estatuto de los Trabajadores — jornada, horas extra, pagas extra y vacaciones',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Salario mínimo interprofesional vigente',
      url: 'https://www.mites.gob.es/es/Guia/texto/guia_6/contenidos/guia_6_13_2.htm',
      publisher: 'Ministerio de Trabajo y Economía Social',
    },
    {
      name: 'Bases y tipos de cotización a la Seguridad Social',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537',
      publisher: 'Tesorería General de la Seguridad Social',
    },
    {
      name: 'Registro y publicación de convenios colectivos (REGCON)',
      url: 'https://expinterweb.mites.gob.es/regcon/',
      publisher: 'Ministerio de Trabajo y Economía Social',
    },
    {
      name: 'Acuerdo de subida retributiva de los empleados públicos',
      url: 'https://www.hacienda.gob.es/es-ES/Areas%20Tematicas/Funcion%20Publica/Paginas/default.aspx',
      publisher: 'Ministerio de Hacienda y Función Pública',
    },
  ],

  replaces: [
    '/calculadora-horas-extras-valor-espana',
    '/calculadora-paga-extra-prorrateo-espana',
    '/calculadora-vacaciones-pagadas-espana-22-dias-laborables',
    '/calculadora-smi-2026-espana-neto-14-pagas-media-jornada',
    '/calculadora-convenio-comercio-espana-sueldo-categoria-2026',
    '/calculadora-convenio-hosteleria-espana-sueldo-2026-categoria',
    '/calculadora-subida-sueldo-funcionarios-2026-espana',
    '/calculadora-coste-trabajador-empresa-seguridad-social-espana',
  ],

  lastReviewed: '2026-08-07',
  audience: 'global',
  locale: 'es',
};

/** Salario mínimo y cotización del trabajador. Espejo de src/lib/data/espana-2026.ts. */
export const SMI = SMI_2026;

/** Porcentajes del acuerdo de empleados públicos. Espejo de src/lib/data/espana-2026.ts. */
export const FUNCIONARIOS = FUNCIONARIOS_SUBIDA;

/**
 * Tablas salariales de referencia: salario base y plus mensuales por categoría.
 * Comercio: espejo de convenio-comercio-espana-sueldo-categoria-2026.ts.
 * Hostelería: espejo de convenio-hosteleria-espana-sueldo-2026-categoria.ts
 * (columna 'otras', media nacional; el convenio provincial puede mejorarla).
 */
export const TABLAS_CONVENIO: Record<
  string,
  { sector: 'comercio' | 'hosteleria'; nombre: string; base: number; plus: number }
> = {
  director_gerente: { sector: 'comercio', nombre: 'Director o gerente', base: 2210, plus: 95 },
  jefe_seccion: { sector: 'comercio', nombre: 'Jefe de sección', base: 1620, plus: 70 },
  encargado_establecimiento: { sector: 'comercio', nombre: 'Encargado de establecimiento', base: 1490, plus: 65 },
  dependiente_mayor: { sector: 'comercio', nombre: 'Dependiente mayor', base: 1380, plus: 58 },
  dependiente: { sector: 'comercio', nombre: 'Dependiente', base: 1220, plus: 52 },
  cajero: { sector: 'comercio', nombre: 'Cajero', base: 1190, plus: 50 },
  mozo_almacen: { sector: 'comercio', nombre: 'Mozo de almacén', base: 1080, plus: 43 },
  encargado_sector: { sector: 'hosteleria', nombre: 'Encargado de sector', base: 1580, plus: 0 },
  jefe_rango: { sector: 'hosteleria', nombre: 'Jefe de rango', base: 1510, plus: 0 },
  gobernanta: { sector: 'hosteleria', nombre: 'Gobernanta', base: 1445, plus: 0 },
  cocinero: { sector: 'hosteleria', nombre: 'Cocinero', base: 1385, plus: 0 },
  recepcionista: { sector: 'hosteleria', nombre: 'Recepcionista', base: 1365, plus: 0 },
  camarero: { sector: 'hosteleria', nombre: 'Camarero', base: 1345, plus: 0 },
  ayudante_cocina: { sector: 'hosteleria', nombre: 'Ayudante de cocina', base: 1245, plus: 0 },
};

/**
 * Cotización a cargo de la EMPRESA. Espejo de
 * src/lib/formulas/coste-trabajador-empresa-seguridad-social-espana.ts.
 *
 * OJO: esa fórmula usa una base máxima mensual de 4.909,50 € mientras que la
 * fórmula de retenciones del IRPF usa 5.101,20 €. Se deja la del IRPF, que es la
 * que sigue el algoritmo oficial vigente, y se reporta la discrepancia.
 */
export const COSTE_EMPRESA = {
  contingenciasComunes: 0.236,
  desempleoIndefinido: 0.055,
  desempleoTemporal: 0.067,
  fogasa: 0.002,
  formacion: 0.006,
  mei: 0.0075,
  baseMaximaMensual: 5101.2,
};

/** Días de vacaciones: mínimo legal del art. 38 del Estatuto. */
export const VACACIONES = {
  diasNaturales: 30,
  diasLaborables: 22,
};
