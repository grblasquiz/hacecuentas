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
  // Afiliados Mercado Libre — paso exacto para activar:
  //   1. Entrá al Linkbuilder del programa de afiliados de ML
  //      (https://www.mercadolibre.com.ar/afiliados → herramienta "Linkbuilder").
  //   2. El Linkbuilder genera UN link de afiliado POR URL: pegá la URL de
  //      listado de cada oferta ml() de abajo (ej.
  //      https://listado.mercadolibre.com.ar/balanza-digital-imc) y generá el link.
  //   3. Pegá el link GENERADO (el que trae tu tag de afiliado) en el `href` de
  //      esa oferta, repetí para cada ml(), y poné mercadolibreReady: true.
  //   El search URL default funciona y es útil; sin tu link NO paga comisión.
  mercadolibreReady: false,
  // Crypto referral (links de invitación completos)
  binance: '',   // ej. 'https://accounts.binance.com/register?ref=XXXXXXXX'
  lemon: '',     // ej. 'https://lemon.me/join/XXXX'
};

export type OfferVertical =
  | 'bebe' | 'mascotas' | 'cripto' | 'fiscal' | 'legal' | 'inmobiliario' | 'retail' | 'finanzas';

export interface Offer {
  id: string;            // id estable para tracking
  vertical: OfferVertical;
  label: string;         // título del bloque
  body: string;          // 1 línea de copy contextual
  cta: string;           // texto del botón
  href: string;          // destino — real y útil aun sin ID de afiliado
  enabled: boolean;      // false = no se renderiza (sin destino honesto todavía)
  note?: string;         // nota interna (no se muestra)
  /**
   * Template opcional con {value}: post-cálculo se pisa `body` con este texto,
   * reemplazando {value} por el resultado primario real del usuario (leído del
   * DOM tras la animación). Si no hay valor, queda el `body` estático.
   */
  bodyDynamic?: string;
  /**
   * 'link' (default) = CTA <a> hacia `href`.
   * 'lead' = mini-form (nombre + WhatsApp) que postea a /api/lead — para
   * verticales donde lo que se vende es el LEAD, no el click (ej. legal).
   */
  kind?: 'link' | 'lead';
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
    bodyDynamic: 'Fecha probable de parto: {value}. Andá armando lo esencial para las primeras semanas, con envío a todo el país.',
    cta: 'Ver productos para el embarazo',
    href: ml('embarazo'),
  },  'calculadora-edad-en-semanas': {
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
    bodyDynamic: 'Tu IMC dio {value}. Una balanza digital con IMC te ayuda a seguirlo en casa.',
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
  // ── Inmobiliario / alquiler ───────────────────────────────────────────────
  // SIN oferta por decisión de Martin (2026-06-09): NO mezclar Argenprop con
  // los proyectos personales. No volver a proponer cross-promo Argenprop acá.

  // ── Finanzas / plazo fijo — SLOT DE INTENCIÓN, destino PROPIO (interno) ────
  // Tesis: monetizar la INTENCIÓN, no el display. Quien acaba de calcular su
  // plazo fijo tiene la pregunta caliente "¿qué banco me paga más?". El destino
  // es NUESTRO comparador en vivo (/valores-bcra + /comparador-plazo-fijo), no
  // un anunciante externo → no necesita partner y es honesto hoy.
  // INACTIVO igual (enabled:false): no sumamos ningún bloque durante la revisión
  // de AdSense. Al activar (enabled:true post-aprobación) OJO: SponsoredOffer
  // hard-codea rel="sponsored nofollow" + tag "Publicidad" + target="_blank",
  // que NO corresponde a un link de primera parte. Antes de encender esta oferta
  // hay que darle a SponsoredOffer un modo "interno" (sin nofollow, sin
  // "Publicidad", same-tab) o el crawler ve un nofollow hacia nuestra propia URL.
  'calculadora-plazo-fijo': {
    id: 'finanzas-comparador-pf', vertical: 'finanzas', enabled: false,
    label: '¿Qué banco te paga más?',
    body: 'Compará la TNA de plazo fijo de todos los bancos, en vivo y ordenada de mayor a menor.',
    bodyDynamic: 'Tu plazo fijo rinde {value}. Fijate si otro banco te paga más: comparamos la TNA en vivo de todos los bancos.',
    cta: 'Ver tasas por banco hoy',
    href: '/valores-bcra',
    note: 'Oferta INTERNA (destino propio) → no requiere partner. enabled:false a propósito por la revisión de AdSense. Al encender, ver caveat de SponsoredOffer (nofollow/Publicidad no van en link interno).',
  },

  // ── Fiscal / contador — CTA de asesoría (ESPERANDO PARTNER) ───────────────
  // "Consultá con un contador" post-cálculo de monotributo/ganancias. Alto
  // intento fiscal (recategorización, categoría, retención de sueldo). enabled:
  // false hasta cerrar un estudio contable / red de contadores que compre el
  // lead. Al activar: definir kind — 'link' (URL del partner) o 'lead' (mini-
  // form → /api/lead, pero /api/lead hoy rutea a legal_leads con copy "estudio
  // laboral"; para fiscal hay que agregar routing + consent copy de contador).
  'calculadora-monotributo-2026': {
    id: 'fiscal-contador-monotributo', vertical: 'fiscal', enabled: false,
    label: '¿Dudas con tu categoría?',
    body: 'Consultá con un contador matriculado antes de recategorizar o pasar al régimen general.',
    cta: 'Consultá con un contador',
    href: '#',
    note: 'ACTIVAR (enabled:true) post-aprobación AdSense cuando haya partner (estudio contable). Definir kind link/lead al cerrar. Alto intento: monotributo es de los baldes fiscales con más tráfico.',
  },
  'calculadora-impuesto-ganancias-sueldo': {
    id: 'fiscal-contador-ganancias', vertical: 'fiscal', enabled: false,
    label: '¿Te retienen de más?',
    body: 'Un contador puede revisar tus deducciones (SiRADIG) y el cálculo de la retención de Ganancias.',
    cta: 'Consultá con un contador',
    href: '#',
    note: 'Mismo partner-slot que fiscal-contador-monotributo. ACTIVAR post-aprobación AdSense cuando haya partner contable. Definir kind link/lead al cerrar.',
  },

  // ── ESPERANDO PARTNER (no renderizan hasta tener comprador del lead) ──────
  'calculadora-indemnizacion-despido': {
    id: 'legal-indemnizacion', vertical: 'legal', enabled: false, kind: 'lead',
    label: '¿Te despidieron?',
    body: 'Consultá gratis tu caso con un abogado laboral antes de firmar.',
    cta: 'Consultar gratis',
    href: '#',
    note: 'Lead-form LISTO (kind:lead → /api/lead, tabla legal_leads). ACTIVAR (enabled:true) cuando haya estudio/red legal que compre el lead. ~960 ses/sem en este balde (indemnización+liquidación). El $/lead más alto del set.',
  },
  'calculadora-liquidacion-final-renuncia': {
    id: 'legal-liquidacion', vertical: 'legal', enabled: false, kind: 'lead',
    label: 'Antes de firmar la liquidación',
    body: 'Verificá que los montos estén bien con un abogado laboral.',
    cta: 'Consultar gratis',
    href: '#',
    note: 'Mismo partner que legal-indemnizacion. Lead-form listo; sólo falta enabled:true al cerrar partner.',
  },
};

/**
 * Kill-switch global de ofertas contextuales. En `true`, NINGÚN bloque
 * "Publicidad"/oferta se renderiza en ninguna ruta. Lo activamos durante la
 * revisión de AdSense: un sitio que todavía no está aprobado pero ya muestra
 * bloques "Publicidad" hacia comercios externos se lee como "made for
 * advertising" (justo la política que nos rechazó). Volver a `false`
 * post-aprobación para reactivar la monetización por intención.
 */
export const OFFERS_PAUSED_FOR_ADSENSE_REVIEW = true;

/** Devuelve la oferta habilitada para una calc, o null. */
export function getOfferForCalc(slug: string): Offer | null {
  if (OFFERS_PAUSED_FOR_ADSENSE_REVIEW) return null;
  const o = OFFERS[slug];
  return o && o.enabled ? o : null;
}
