/**
 * offers.ts — Motor de monetización contextual.
 *
 * Mapea calcs de ALTO INTENTO → una oferta/CTA relevante que se revela DESPUÉS
 * de calcular (evento `hc-calc-result`), en el momento caliente. La selección de
 * calcs sale de la data real de tráfico PAGO (GA4 google/cpc, jun-2026): los
 * baldes que más sesiones reciben son alquiler/ICL, laboral-legal, bebé/salud,
 * mascotas y FX. Ver memoria [[monetizacion-reset-2026-06]].
 *
 * REGLAS (no negociables):
 * - SEO-safe: NADA de reescritura global de links (eso era Skimlinks y dañó la
 *   señal de calidad). Cada oferta es explícita, por-calc, con rel="sponsored
 *   nofollow" y etiqueta visible "Publicidad".
 * - Cero churn de sitemap: este archivo es .ts → no mueve lastmod de los JSON.
 * - Honestidad: si no hay un destino real y útil (ej. lead a abogado sin partner
 *   que lo compre), enabled:false hasta que exista. No mandamos al usuario a
 *   cualquier lado.
 *
 * ▶ PARA EMPEZAR A COBRAR: pegá tus IDs en AFF abajo y/o reemplazá el `href` de
 *   cada oferta por tu link de afiliado/referido. Las URLs default ya funcionan
 *   (destino real y útil) — el ID sólo agrega el tracking que paga.
 *   Cada click dispara gtag('offer_click', {calc_slug, offer_id, vertical}) →
 *   en GA4 medís RPM por calc y decidís dónde meter más.
 */

// ── IDs de afiliado / referido — COMPLETAR (Martin) ─────────────────────────
const AFF = {
  // Afiliados Mercado Libre: reemplazá el href de las ofertas ML por tu deep-link
  // del Linkbuilder (https://www.mercadolibre.com.ar/afiliados). El search URL
  // default funciona y es útil; sin tu link NO paga comisión.
  mercadolibreReady: false,
  // Crypto referral (links de invitación completos)
  binance: '',   // ej. 'https://accounts.binance.com/register?ref=XXXXXXXX'
  lemon: '',     // ej. 'https://lemon.me/join/XXXX'
};

export type OfferVertical =
  | 'bebe' | 'mascotas' | 'cripto' | 'fiscal' | 'legal' | 'inmobiliario' | 'retail';

export interface Offer {
  id: string;            // id estable para tracking
  vertical: OfferVertical;
  label: string;         // título del bloque
  body: string;          // 1 línea de copy contextual
  cta: string;           // texto del botón
  href: string;          // destino — real y útil aun sin ID de afiliado
  enabled: boolean;      // false = no se renderiza (sin destino honesto todavía)
  note?: string;         // nota interna (no se muestra)
}

const ml = (slug: string) => `https://listado.mercadolibre.com.ar/${slug}`;

/**
 * Una oferta por calc. Sólo las calcs acá listadas muestran bloque; el resto
 * del sitio queda intacto. Mantener este set chico y de alto intento.
 */
const OFFERS: Record<string, Offer> = {
  // ── Bebé / embarazo (ML afiliados — paga en LATAM) ───────────────────────
  'calculadora-embarazo': {
    id: 'ml-embarazo', vertical: 'bebe', enabled: true,
    label: 'Preparando la llegada',
    body: 'Lo esencial para las primeras semanas, con envío a todo el país.',
    cta: 'Ver productos para el embarazo',
    href: ml('embarazo'),
  },
  'calculadora-sexo-bebe-tabla-china': {
    id: 'ml-bebe-ajuar', vertical: 'bebe', enabled: true,
    label: '¿Nene o nena?',
    body: 'Armá el ajuar sin apuro: bodies, mantas y lo básico para el primer mes.',
    cta: 'Ver ropa y ajuar de bebé',
    href: ml('ajuar-bebe'),
  },
  'calculadora-edad-en-semanas': {
    id: 'ml-bebe-semanas', vertical: 'bebe', enabled: true,
    label: 'Semana a semana',
    body: 'Juguetes y artículos por etapa, elegidos por edad del bebé.',
    cta: 'Ver artículos por etapa',
    href: ml('bebes'),
  },
  // ── Salud / IMC (retail tasteful, no consejo médico) ─────────────────────
  'calculadora-imc': {
    id: 'ml-balanza', vertical: 'retail', enabled: true,
    label: 'Seguí tu progreso',
    body: 'Una balanza digital con IMC integrado para medir en casa.',
    cta: 'Ver balanzas digitales',
    href: ml('balanza-digital-imc'),
  },
  // ── Mascotas ─────────────────────────────────────────────────────────────
  'calculadora-edad-perro-anos-humanos': {
    id: 'ml-perro', vertical: 'mascotas', enabled: true,
    label: 'Para tu compañero',
    body: 'Alimento balanceado y accesorios según la edad de tu perro.',
    cta: 'Ver productos para perros',
    href: ml('perros'),
  },
  // ── FX / dólar / cripto (referral — el único vertical donde el geo no mata) ─
  'conversor-moneda-dolar-peso-real-latam': {
    id: 'cripto-fx', vertical: 'cripto', enabled: true,
    label: 'Operá dólar y cripto',
    body: 'Comprá USDT/dólar a un tipo de cambio competitivo desde la app.',
    cta: 'Abrir cuenta gratis',
    href: AFF.binance || 'https://www.binance.com/es-LA/activity/referral',
    note: 'Reemplazar por tu link de referido Binance/Lemon para cobrar comisión.',
  },
  // ── Inmobiliario / alquiler (Argenprop — canal propio de Martin) ─────────
  'calculadora-actualizacion-alquiler-icl': {
    id: 'argenprop-alquiler', vertical: 'inmobiliario', enabled: true,
    label: '¿El aumento te parece mucho?',
    body: 'Mirá qué alquileres hay disponibles hoy en tu zona.',
    cta: 'Buscar alquileres en Argenprop',
    href: 'https://www.argenprop.com/departamentos/alquiler',
    note: 'Canal propio (Martin = CMO Argenprop). Evaluar UTM/deal de referido interno.',
  },

  // ── ESPERANDO PARTNER (no renderizan hasta tener comprador del lead) ──────
  'calculadora-indemnizacion-despido': {
    id: 'legal-indemnizacion', vertical: 'legal', enabled: false,
    label: '¿Te despidieron?',
    body: 'Consultá gratis tu caso con un abogado laboral antes de firmar.',
    cta: 'Consultar gratis',
    href: '#',
    note: 'ACTIVAR cuando haya estudio/red legal que compre el lead. ~960 ses/sem en este balde (indemnización+liquidación). El $/lead más alto del set.',
  },
  'calculadora-liquidacion-final-renuncia': {
    id: 'legal-liquidacion', vertical: 'legal', enabled: false,
    label: 'Antes de firmar la liquidación',
    body: 'Verificá que los montos estén bien con un abogado laboral.',
    cta: 'Consultar gratis',
    href: '#',
    note: 'Mismo partner que legal-indemnizacion.',
  },
};

/** Devuelve la oferta habilitada para una calc, o null. */
export function getOfferForCalc(slug: string): Offer | null {
  const o = OFFERS[slug];
  return o && o.enabled ? o : null;
}
