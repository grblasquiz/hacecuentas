/**
 * Emisor central de eventos de producto — ÚNICA fuente de verdad para analytics.
 * ---------------------------------------------------------------------------
 * Antes cada superficie llamaba `window.gtag('event', ...)` a mano, con nombres
 * de evento y parámetros inconsistentes (ver los ~30 gtag sueltos de
 * Calculator.astro). Este módulo unifica:
 *   · el catálogo de eventos `hc_*` (funnel entrada → resultado → acción),
 *   · la whitelist de parámetros permitidos (todo lo demás se descarta),
 *   · el saneo anti-PII (nunca se emiten valores ingresados, resultados,
 *     sueldos, deudas, datos médicos/fiscales, fechas personales ni emails).
 *
 * ADITIVO Y NO INVASIVO (regla operativa del proyecto: cero cambios de tracking
 * sin aviso). Reusa el `window.gtag`/`dataLayer` YA existentes; si no hay, es un
 * no-op silencioso. NO define, renombra ni desactiva ningún tag de GA4/Ads.
 *
 * El mismo saneo se expone al front vía `window.hcTrack` (shim inline en
 * Layout.astro alimentado por las constantes de este archivo → sin drift).
 */

/** Catálogo cerrado de eventos del funnel. Cualquier evento nuevo se agrega acá. */
export const HC_EVENTS = [
  // Funnel unificado cross-calculator (nombres estables para GA4/BI).
  'calculator_start',
  'calculator_complete',
  'result_share',
  'save_to_dashboard',
  'related_click',
  // Búsqueda / home
  'hc_home_search_focus',
  'hc_search_started',
  'hc_search_submitted',
  'hc_search_result_clicked',
  'hc_search_no_results',
  // Categorías
  'hc_category_filter_used',
  // Calculadora
  'hc_calculator_view',
  'hc_calculator_input_started',
  'hc_calculator_submit',
  'hc_calculator_success',
  'hc_calculator_abandoned',
  'hc_calculator_validation_error',
  'hc_calculator_runtime_error',
  // Resultado / acciones
  'hc_result_copy',
  'hc_result_share',
  'hc_result_save',
  'hc_result_email_open',
  'hc_result_email_sent',
  'hc_formula_expanded',
  'hc_related_calculator_clicked',
  // Profundidad y recurrencia. Se emiten sólo en hitos (2/3/5 calcs distintas)
  // y al volver en otro día; nunca incluyen inputs ni resultados.
  'hc_session_depth',
  'hc_return_visit',
  // Post-resultado (segunda acción) — mide post_result_interaction_rate
  'hc_scenario_viewed',
  'hc_next_step_clicked',
  'hc_decision_room_impression',
  'hc_decision_room_clicked',
  'hc_post_result_scroll',
  'hc_post_result_interaction',
  // Feedback / historial
  'hc_feedback_positive',
  'hc_feedback_negative',
  'hc_recent_calculator_opened',
  // Banda de captura de email (CalcEmailBand) — view/focus/signup permiten
  // medir viewability y CVR real de la banda (antes solo se veía el éxito).
  'hc_email_band_view',
  'hc_email_band_focus',
  'hc_email_band_signup',
  // Web Push (PushOptIn) — funnel de opt-in: view → subscribe | dismiss | denied.
  // KPI del plan de tráfico directo (suscriptores push = canal de retorno propio).
  'hc_push_view',
  'hc_push_subscribe',
  'hc_push_dismiss',
  'hc_push_denied',
  'hc_push_unsubscribe',
  // Datos abiertos: click en una descarga first-party CSV/JSON bajo /datos/.
  'hc_dataset_download',
  'hc_api_playground_run',
] as const;

export type HcEvent = (typeof HC_EVENTS)[number];

/**
 * Únicas claves de parámetro permitidas. TODAS son categóricas / no
 * identificatorias. Cualquier otra clave (value, result, salary, email, monto,
 * deuda, fecha…) se descarta en `sanitizeAnalyticsParams`.
 */
export const HC_ALLOWED_PARAMS = [
  'calculator_slug',
  'calculator_category',
  'country',
  'input_mode',
  'search_term',
  'result_position',
  'error_field',
  'error_type',
  'device_type',
  'logged_in',
  'source_page',
  'target_slug',
  'dataset_file',
  'file_extension',
  // Tipo de la primera acción post-resultado (scroll|next_step|decision_room|save).
  // Categórico, no identificatorio.
  'interaction_type',
  'calculator_count',
  'return_window',
] as const;

export type HcParamKey = (typeof HC_ALLOWED_PARAMS)[number];
export type HcEventParams = Partial<Record<HcParamKey, string | number | boolean>>;

const ALLOWED = new Set<string>(HC_ALLOWED_PARAMS);
const EVENTS = new Set<string>(HC_EVENTS);

const MAX_STR = 120; // recorte anti-texto-libre (search_term, etc.)

/**
 * Descarta toda clave no whitelisteada y normaliza valores.
 * Garantía: la salida SÓLO contiene claves de `HC_ALLOWED_PARAMS`. Por ser una
 * whitelist, cualquier dato sensible pasado por error nunca sale de acá.
 */
export function sanitizeAnalyticsParams(params: Record<string, unknown> = {}): HcEventParams {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (!ALLOWED.has(k)) continue;
    if (v == null) continue;
    if (typeof v === 'number') {
      if (Number.isFinite(v)) out[k] = v;
    } else if (typeof v === 'boolean') {
      out[k] = v;
    } else {
      const s = String(v).slice(0, MAX_STR).trim();
      if (s) out[k] = s;
    }
  }
  return out as HcEventParams;
}

/** ¿Es un nombre de evento válido del catálogo? */
export function isHcEvent(name: string): name is HcEvent {
  return EVENTS.has(name);
}

/**
 * Devuelve parámetros seguros sólo para descargas de datasets first-party.
 * No conserva query strings, hashes ni URLs completas: únicamente el basename
 * del archivo y su extensión, más el pathname de la página de origen.
 */
export function getDatasetDownloadParams(
  href: string,
  sourcePage: string,
  origin = 'https://hacecuentas.com',
): HcEventParams | null {
  try {
    const url = new URL(href, origin);
    if (url.origin !== new URL(origin).origin) return null;
    if (!url.pathname.startsWith('/datos/')) return null;
    const filename = url.pathname.split('/').pop() || '';
    const extension = filename.toLowerCase().match(/\.(csv|json)$/)?.[1];
    if (!extension) return null;
    return sanitizeAnalyticsParams({
      dataset_file: filename,
      file_extension: extension,
      source_page: sourcePage.split(/[?#]/, 1)[0],
    });
  } catch {
    return null;
  }
}

type GtagFn = (...args: unknown[]) => void;
interface AnalyticsWindow extends Window {
  gtag?: GtagFn;
  dataLayer?: unknown[];
}

/**
 * Emite un evento del funnel. Seguro de llamar en cualquier lado: si no hay
 * window/gtag/dataLayer, no hace nada. Nunca lanza (analytics jamás rompe la UI).
 */
export function hcTrack(event: HcEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as AnalyticsWindow;
  const clean = sanitizeAnalyticsParams(params);
  try {
    if (typeof w.gtag === 'function') {
      w.gtag('event', event, clean);
    }
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...clean });
    }
  } catch {
    /* no-op: analytics nunca rompe la UI */
  }
}
