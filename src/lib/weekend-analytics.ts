/**
 * Capa reutilizable de eventos para el cluster de fin de semana (Fase 14).
 *
 * ADITIVO Y NO INVASIVO: reusa el `window.gtag` YA existente si está presente
 * (o `dataLayer` como fallback). NO define, renombra ni modifica ningún tag de
 * GA4/Google Ads (regla operativa del proyecto: cero cambios de tracking sin
 * aviso). Si no hay gtag/dataLayer, es un no-op silencioso.
 *
 * ⚠️ TODAVÍA NO ESTÁ CABLEADO en las calcs/hubs — es la base para hacerlo con OK
 * explícito. Al cablear, disparar los eventos desde los componentes usando SOLO
 * las claves de parámetro whitelisteadas de abajo.
 *
 * Privacidad: NUNCA enviar nombres, emails, direcciones, texto libre del usuario
 * ni valores que identifiquen personas. `sanitizeParams` descarta toda clave que
 * no esté en ALLOWED_PARAM_KEYS y recorta strings largos.
 */

export const WEEKEND_EVENTS = [
  'calculator_view',
  'calculator_start',
  'calculator_complete',
  'calculator_share',
  'calculator_copy_result',
  'calculator_copy_link',
  'calculator_print',
  'calculator_download',
  'calculator_related_click',
  'weekend_hub_click',
  'weekend_recommendation_click',
  'shopping_list_generate',
  'expense_split_use',
] as const;

export type WeekendEvent = (typeof WEEKEND_EVENTS)[number];

/** Únicas claves permitidas. Todas son categóricas/no-identificatorias. */
export const ALLOWED_PARAM_KEYS = [
  'calculator_slug',
  'calculator_category',
  'calculator_family',
  'traffic_context',
  'day_type',
  'result_type',
  'share_channel',
  'weekend_module',
  'content_cluster',
] as const;

export type WeekendEventParams = Partial<Record<(typeof ALLOWED_PARAM_KEYS)[number], string>>;

const ALLOWED = new Set<string>(ALLOWED_PARAM_KEYS);

/** Descarta claves no whitelisteadas y recorta valores (anti-PII / anti-texto-libre). */
export function sanitizeParams(params: Record<string, unknown> = {}): WeekendEventParams {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (!ALLOWED.has(k)) continue;
    if (v == null) continue;
    // solo strings/números → string corto (categórico). Nada de objetos/texto largo.
    const s = String(v).slice(0, 64);
    if (s) out[k] = s;
  }
  return out as WeekendEventParams;
}

type GtagFn = (...args: unknown[]) => void;
interface AnalyticsWindow extends Window {
  gtag?: GtagFn;
  dataLayer?: unknown[];
}

/**
 * Dispara un evento reusando el gtag existente. Seguro de llamar en cualquier
 * lado: si no hay window/gtag/dataLayer, no hace nada.
 */
export function trackWeekendEvent(event: WeekendEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as AnalyticsWindow;
  const clean = sanitizeParams(params);
  try {
    if (typeof w.gtag === 'function') {
      w.gtag('event', event, clean);
    } else if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...clean });
    }
  } catch {
    /* nunca romper la UI por analytics */
  }
}
