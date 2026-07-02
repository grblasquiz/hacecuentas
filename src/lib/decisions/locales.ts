/**
 * Localización de salas de decisión — verticales país (/co|mx|cl|pe/decidir/*).
 *
 * Estrategia SEO (jul-2026): expansión CURADA, no clonado masivo. Cada país
 * recibe ~10 salas universales (deudas, cuotas/MSI, arriendo/renta, ahorro,
 * freelance) REESCRITAS con lógica económica local — tasa de usura CO, meses
 * sin intereses MX, UF/CAE CL, TCEA/CTS PE — terminología, moneda, magnitudes
 * y fuentes oficiales propias. Eso las hace contenido genuino (anti scaled
 * content) y les da keywords locales que la versión AR no puede atacar.
 *
 * Las salas AR-específicas (monotributo, UVA, paritaria, despido LCT) NO se
 * localizan: su lógica no existe fuera de AR.
 *
 * TS PURO (sin DOM, sin import.meta.glob): lo importan páginas .astro, los
 * módulos de sala (formateadores) y scripts de build (tsx).
 */

export type DecisionCountryCode = 'co' | 'mx' | 'cl' | 'pe';

export interface DecisionCountry {
  cc: DecisionCountryCode;
  /** Código audience del Layout (geo targeting + og:locale). */
  audience: 'CO' | 'MX' | 'CL' | 'PE';
  /** Locale BCP-47 para inLanguage / toLocaleDateString. */
  locale: string;
  /** ISO 4217 para el offer schema. */
  currency: 'COP' | 'MXN' | 'CLP' | 'PEN';
  name: string;
  flag: string;
  /** Separador de miles que usa el país al escribir montos (gobierna el
   *  formateo en vivo y el parseo de inputs en DecisionRoomIntl). */
  groupSep: '.' | ',';
  /** Copy del índice /<cc>/decidir (único por país — anti-templating). */
  indexTitle: string;
  indexDescription: string;
  indexLede: string;
}

export const DECISION_COUNTRIES: Record<DecisionCountryCode, DecisionCountry> = {
  co: {
    cc: 'co',
    audience: 'CO',
    locale: 'es-CO',
    currency: 'COP',
    name: 'Colombia',
    flag: '🇨🇴',
    groupSep: '.',
    indexTitle: 'Salas de decisión Colombia: decide con números reales | Hacé Cuentas',
    indexDescription:
      '¿Cuotas o de contado?, ¿cuánto arriendo puedes pagar?, ¿arrendar o comprar?, ¿pagar la deuda o invertir en un CDT? Decisiones de plata resueltas con números de Colombia: tasa de usura, ley de arriendo, aportes de independiente.',
    indexLede:
      'No son calculadoras sueltas: cada sala combina varias fórmulas con los números de Colombia — tasa de usura certificada, incremento legal del arriendo, aportes PILA de independiente — y te devuelve una conclusión clara, tres escenarios y próximos pasos. Sin registro.',
  },
  mx: {
    cc: 'mx',
    audience: 'MX',
    locale: 'es-MX',
    currency: 'MXN',
    name: 'México',
    flag: '🇲🇽',
    groupSep: ',',
    indexTitle: 'Salas de decisión México: decide con números reales | Hacé Cuentas',
    indexDescription:
      '¿Meses sin intereses o de contado?, ¿cuánta renta puedes pagar?, ¿rentar o comprar?, ¿liquidar la deuda o invertir en CETES? Decisiones de dinero resueltas con números de México: CAT, ISR, Buró de Crédito.',
    indexLede:
      'No son calculadoras sueltas: cada sala combina varias fórmulas con los números de México — CAT de tarjetas y créditos, rendimiento de CETES, meses sin intereses — y te devuelve una conclusión clara, tres escenarios y próximos pasos. Sin registro.',
  },
  cl: {
    cc: 'cl',
    audience: 'CL',
    locale: 'es-CL',
    currency: 'CLP',
    name: 'Chile',
    flag: '🇨🇱',
    groupSep: '.',
    indexTitle: 'Salas de decisión Chile: decide con números reales | Hacé Cuentas',
    indexDescription:
      '¿Cuotas o al contado?, ¿cuánto arriendo puedes pagar?, ¿arrendar o comprar con dividendo en UF?, ¿prepagar el crédito o invertir? Decisiones de plata resueltas con números de Chile: CAE, UF, carga financiera.',
    indexLede:
      'No son calculadoras sueltas: cada sala combina varias fórmulas con los números de Chile — CAE de los créditos, reajuste por UF e IPC, retención de boletas de honorarios — y te devuelve una conclusión clara, tres escenarios y próximos pasos. Sin registro.',
  },
  pe: {
    cc: 'pe',
    audience: 'PE',
    locale: 'es-PE',
    currency: 'PEN',
    name: 'Perú',
    flag: '🇵🇪',
    groupSep: ',',
    indexTitle: 'Salas de decisión Perú: decide con números reales | Hacé Cuentas',
    indexDescription:
      '¿Cuotas o al contado?, ¿cuánto alquiler puedes pagar?, ¿alquilar o comprar?, ¿cancelar la deuda o poner un depósito a plazo? Decisiones de plata resueltas con números del Perú: TCEA, CTS, recibos por honorarios.',
    indexLede:
      'No son calculadoras sueltas: cada sala combina varias fórmulas con los números del Perú — TCEA de tarjetas y préstamos, tu CTS como colchón, retención de cuarta categoría — y te devuelve una conclusión clara, tres escenarios y próximos pasos. Sin registro.',
  },
};

export const DECISION_COUNTRY_LIST: DecisionCountry[] = Object.values(DECISION_COUNTRIES);

// — Formateadores de moneda por país (mismo contrato que fmtMoney de types.ts) —

function fmtGrouped(n: number, locale: string, symbol: string): string {
  const r = Math.round(n);
  const sign = r < 0 ? '-' : '';
  return `${sign}${symbol}${Math.abs(r).toLocaleString(locale)}`;
}

/** COP: $1.234.567 (sin decimales — magnitudes grandes). */
export function fmtCOP(n: number): string {
  return fmtGrouped(n, 'es-CO', '$');
}
/** MXN: $1,234,567. */
export function fmtMXN(n: number): string {
  return fmtGrouped(n, 'es-MX', '$');
}
/** CLP: $1.234.567. */
export function fmtCLP(n: number): string {
  return fmtGrouped(n, 'es-CL', '$');
}
/** PEN: S/ 1,234. */
export function fmtPEN(n: number): string {
  return fmtGrouped(n, 'es-PE', 'S/ ');
}

/**
 * Equivalencias de slugs entre países — alimenta los clusters hreflang.
 * `es` = slug de la sala AR raíz (/decidir/<es>); el resto, slug bajo
 * /<cc>/decidir/. Los slugs difieren a propósito donde la keyword local
 * difiere (arriendo CO/CL, renta MX, meses sin intereses MX).
 *
 * Regla: TODA sala localizada debe tener fila acá (el hreflang simétrico
 * depende de eso). Sala AR sin fila = sala sin versiones país (válido).
 */
export interface DecisionEquivalents {
  es: string;
  co?: string;
  mx?: string;
  cl?: string;
  pe?: string;
}

export const DECISION_EQUIVALENTS: DecisionEquivalents[] = [
  {
    es: 'cuotas-o-contado',
    co: 'cuotas-o-de-contado',
    mx: 'meses-sin-intereses-o-contado',
    cl: 'cuotas-o-contado',
    pe: 'cuotas-o-contado',
  },
  {
    es: 'cuanto-alquiler-puedo-pagar',
    co: 'cuanto-arriendo-puedo-pagar',
    mx: 'cuanta-renta-puedo-pagar',
    cl: 'cuanto-arriendo-puedo-pagar',
    pe: 'cuanto-alquiler-puedo-pagar',
  },
  {
    es: 'alquilar-o-comprar',
    co: 'arrendar-o-comprar',
    mx: 'rentar-o-comprar',
    cl: 'arrendar-o-comprar',
    pe: 'alquilar-o-comprar',
  },
  {
    es: 'cancelar-deuda-o-invertir',
    co: 'pagar-deuda-o-invertir',
    mx: 'liquidar-deuda-o-invertir',
    cl: 'prepagar-deuda-o-invertir',
    pe: 'cancelar-deuda-o-invertir',
  },
  {
    es: 'como-salir-de-deudas',
    co: 'como-salir-de-deudas',
    mx: 'como-salir-de-deudas',
    cl: 'como-salir-de-deudas',
    pe: 'como-salir-de-deudas',
  },
  {
    es: 'puedo-pagar-este-prestamo',
    co: 'puedo-pagar-este-credito',
    mx: 'puedo-pagar-este-credito',
    cl: 'puedo-pagar-este-credito',
    pe: 'puedo-pagar-este-prestamo',
  },
  {
    es: 'cuanto-fondo-de-emergencia-necesito',
    co: 'cuanto-fondo-de-emergencia-necesito',
    mx: 'cuanto-fondo-de-emergencia-necesito',
    cl: 'cuanto-fondo-de-emergencia-necesito',
    pe: 'cuanto-fondo-de-emergencia-necesito',
  },
  {
    es: 'cuanto-puedo-gastar-por-mes',
    co: 'cuanto-puedo-gastar-al-mes',
    mx: 'cuanto-puedo-gastar-al-mes',
    cl: 'cuanto-puedo-gastar-al-mes',
    pe: 'cuanto-puedo-gastar-al-mes',
  },
  {
    es: 'cuanto-cobrar-por-hora-freelance',
    co: 'cuanto-cobrar-por-hora-independiente',
    mx: 'cuanto-cobrar-por-hora-freelance',
    cl: 'cuanto-cobrar-por-hora-freelance',
    pe: 'cuanto-cobrar-por-hora-freelance',
  },
  {
    es: 'cuando-alcanzo-mi-meta-de-ahorro',
    co: 'cuando-alcanzo-mi-meta-de-ahorro',
    mx: 'cuando-alcanzo-mi-meta-de-ahorro',
    cl: 'cuando-alcanzo-mi-meta-de-ahorro',
    pe: 'cuando-alcanzo-mi-meta-de-ahorro',
  },
];

/** Fila de equivalencias por slug AR raíz. */
export function equivalentsByEsSlug(esSlug: string): DecisionEquivalents | undefined {
  return DECISION_EQUIVALENTS.find((e) => e.es === esSlug);
}

/** Fila de equivalencias por (país, slug local). */
export function equivalentsByCountrySlug(
  cc: DecisionCountryCode,
  slug: string
): DecisionEquivalents | undefined {
  return DECISION_EQUIVALENTS.find((e) => e[cc] === slug);
}
