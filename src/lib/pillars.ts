/**
 * Los 4 PILARES de la arquitectura de autoridad interna (jul-2026).
 *
 * Concentran el menú y el enlazado principal del sitio: en vez de repartir
 * link equity entre 26 categorías planas, el header/home/footer enlazan a
 * estos 4 hubs curados, y cada hub reparte hacia su guía-pilar, su
 * calculadora principal, sus salas de decisión y sus destacadas
 * (Guía → calculadora → sala de decisión → contenido relacionado).
 *
 * El resto de las categorías sigue existiendo (/categoria/*, /calculadoras)
 * pero con prominencia menor.
 *
 * Los slugs de `calcs` se validan contra el catálogo en PillarHub.astro
 * (los inexistentes se filtran) — pero mantenelos reales: cada slug acá
 * es un link sitewide que concentra autoridad.
 */
export interface PillarDef {
  slug: string; // URL raíz: /<slug>
  nav: string; // label corto para el header
  title: string; // <title> SEO
  h1: string;
  description: string;
  intro: string;
  icon: string;
  color: string;
  domain: 'money' | 'data' | 'health' | 'home' | 'knowledge' | 'life';
  mainCalc: string; // slug de la calculadora principal (hero)
  calcs: string[]; // destacadas
  rooms: string[]; // slugs de salas de decisión (/decidir/*)
  guide: string; // slug de guía-pilar (/guia/*)
  categories: string[]; // categorías relacionadas (/categoria/*)
  dataPages: Array<{ href: string; label: string }>; // superficies de datos
}

export const PILLARS: PillarDef[] = [
  {
    slug: 'sueldos-y-trabajo',
    nav: 'Sueldos y trabajo',
    title: 'Sueldos y trabajo en Argentina 2026 — calculadoras y guía',
    h1: 'Sueldos y trabajo en Argentina',
    description:
      'Calculá tu sueldo en mano, aguinaldo, indemnización, vacaciones y horas extras con las fórmulas oficiales 2026. Guía completa + salas de decisión para aumentos, ofertas y despidos.',
    intro:
      'Todo lo que pasa entre tu recibo de sueldo y tu bolsillo: bruto a neto, aguinaldo (SAC), indemnización por despido, vacaciones, horas extras y jubilación. Con la escala de Ganancias y los topes vigentes de 2026.',
    icon: '💼',
    color: '#2563eb',
    domain: 'money',
    mainCalc: 'sueldo-en-mano-argentina',
    calcs: [
      'calculadora-aguinaldo-sac',
      'calculadora-indemnizacion-despido',
      'calculadora-impuesto-ganancias-sueldo',
      'calculadora-antiguedad-laboral',
      'calculadora-horas-extras-50-100',
      'calculadora-vacaciones-argentina',
      'salario-minimo-vital-movil-argentina',
      'calculadora-ajuste-sueldo-inflacion',
      'calculadora-liquidacion-final-renuncia',
      'calculadora-jubilacion-anses-monto-minimo-maxima-2026',
    ],
    rooms: [
      'cuanto-aumento-pedir',
      'aceptar-oferta-laboral',
      'me-despidieron',
      'cuanto-cambia-mi-sueldo-con-la-paritaria',
      'trabajo-remoto-hibrido-o-presencial',
      'cuanto-vale-mi-hora',
    ],
    guide: 'sueldos-argentina-2026',
    categories: ['finanzas', 'impuestos'],
    dataPages: [
      { href: '/datos-aguinaldo-2026', label: 'Datos del aguinaldo 2026' },
      { href: '/datos-topes-sipa-2026', label: 'Topes SIPA 2026' },
    ],
  },
  {
    slug: 'impuestos-argentina',
    nav: 'Impuestos',
    title: 'Impuestos en Argentina 2026 — monotributo, Ganancias, IVA',
    h1: 'Impuestos en Argentina',
    description:
      'Monotributo 2026 por categoría, Ganancias sobre el sueldo, IVA, Bienes Personales, Ingresos Brutos y sellos. Calculadoras con los valores ARCA vigentes + guía completa.',
    intro:
      'Monotributo, Ganancias, IVA, Bienes Personales, Ingresos Brutos: cuánto pagás, cuándo te conviene cada régimen y cómo recategorizarte. Con las escalas y categorías ARCA vigentes de 2026.',
    icon: '🧾',
    color: '#0ea5e9',
    domain: 'money',
    mainCalc: 'calculadora-monotributo-2026',
    calcs: [
      'calculadora-impuesto-ganancias-sueldo',
      'calculadora-monotributo-vs-responsable-inscripto',
      'calculadora-monotributo-categoria-2026-recategorizacion-julio',
      'calculadora-iva-agregar-discriminar',
      'calculadora-bienes-personales-2026',
      'calculadora-ingresos-brutos-provincial',
      'calculadora-impuesto-cheque-debitos-creditos',
      'calculadora-impuesto-sellos-inmueble-contrato',
      'calculadora-autonomos-categoria-monto-2026',
    ],
    rooms: [
      'monotributo-o-responsable-inscripto',
      'que-categoria-de-monotributo-me-corresponde',
      'relacion-dependencia-o-facturar',
      'cuanto-facturar-para-ganar-x-neto',
    ],
    guide: 'impuestos-argentina-2026',
    categories: ['impuestos', 'finanzas'],
    dataPages: [
      { href: '/datos-monotributo-2026', label: 'Categorías del monotributo 2026' },
      { href: '/datos-ganancias-2026', label: 'Escala de Ganancias 2026' },
      { href: '/datos-bienes-personales-2026', label: 'Bienes Personales 2026' },
    ],
  },
  {
    slug: 'finanzas-personales',
    nav: 'Finanzas',
    title: 'Finanzas personales y créditos — calculadoras 2026',
    h1: 'Finanzas personales y créditos',
    description:
      'Cuota de préstamo, plazo fijo, interés compuesto, CFT, crédito UVA, deuda de tarjeta y fondo de emergencia. Calculadoras para decidir con números reales en 2026.',
    intro:
      'Préstamos, plazos fijos, inflación, tarjeta y ahorro: las cuentas que definen tu mes. Compará CFT real, simulá créditos UVA vs tasa fija y armá tu fondo de emergencia con números 2026.',
    icon: '💰',
    color: '#16a34a',
    domain: 'money',
    mainCalc: 'calculadora-cuota-prestamo',
    calcs: [
      'calculadora-plazo-fijo',
      'calculadora-interes-compuesto',
      'calculadora-costo-financiero-total-cft',
      'calculadora-credito-uva-vs-tasa-fija',
      'calculadora-tarjeta-credito-pago-minimo-intereses',
      'calculadora-fondo-emergencia-meses',
      'calculadora-presupuesto-50-30-20',
      'calculadora-inflacion-acumulada-periodo',
      'calculadora-ahorro-uva-vs-pesos-vs-dolar-12-meses',
    ],
    rooms: [
      'puedo-pagar-este-prestamo',
      'cancelar-deuda-o-invertir',
      'como-salir-de-deudas',
      'cuotas-o-contado',
      'me-conviene-adelantar-cuotas',
      'que-hago-con-mis-ahorros',
      'cuanto-fondo-de-emergencia-necesito',
      'puedo-afrontar-un-credito-uva',
    ],
    guide: 'finanzas-personales',
    categories: ['finanzas'],
    dataPages: [
      { href: '/comparador-plazo-fijo', label: 'Comparador de plazos fijos (tasas hoy)' },
      { href: '/plazo-fijo-vs-billeteras', label: 'Plazo fijo vs billeteras: dónde rinde más hoy' },
      { href: '/valores-bcra', label: 'Dólar y valores BCRA hoy' },
      { href: '/presupuesto-familiar', label: 'Presupuesto familiar' },
    ],
  },
  {
    slug: 'negocios-e-independientes',
    nav: 'Negocios',
    title: 'Negocios y trabajadores independientes — calculadoras 2026',
    h1: 'Negocios y trabajadores independientes',
    description:
      'Margen de ganancia, punto de equilibrio, precios con IVA, costo laboral, tarifa freelance por hora, ROAS y CAC/LTV. Calculadoras para pymes e independientes en 2026.',
    intro:
      'Para el que factura: márgenes, punto de equilibrio, cuánto cobrar por hora, costo real de un empleado y retorno de la publicidad. Con el monotributo y las cargas vigentes de 2026.',
    icon: '📊',
    color: '#7c3aed',
    domain: 'money',
    mainCalc: 'calculadora-margen-ganancia-markup',
    calcs: [
      'calculadora-punto-equilibrio-break-even',
      'calculadora-iva-agregar-discriminar',
      'calculadora-costo-laboral-empleado',
      'calculadora-cuanto-cobro-por-hora-freelance',
      'calculadora-impuestos-monotributo-freelance',
      'calculadora-hora-freelance-por-pais-mercado',
      'calculadora-roas-retorno-inversion-publicitaria',
      'calculadora-cac-ltv-costo-adquisicion-cliente',
      'calculadora-tasa-de-conversion',
    ],
    rooms: [
      'mi-negocio-es-rentable',
      'cuanto-cobrar-por-hora-freelance',
      'cuanto-cobrar-por-mi-producto-o-servicio',
      'puedo-contratar-a-una-persona',
      'me-conviene-aceptar-este-cliente',
      'cuanto-invertir-en-publicidad',
    ],
    guide: 'marketing-roi-metricas',
    categories: ['negocios', 'marketing'],
    dataPages: [
      { href: '/datos-monotributo-2026', label: 'Categorías del monotributo 2026' },
    ],
  },
];

export const PILLAR_BY_SLUG: Record<string, PillarDef> = Object.fromEntries(
  PILLARS.map((p) => [p.slug, p]),
);
