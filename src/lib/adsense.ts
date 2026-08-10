/**
 * Interruptor de serving de AdSense.
 *
 * La verificación del sitio sigue activa mediante google-adsense-account y
 * ads.txt. No habilitar serving hasta que la cuenta tenga un CMP certificado
 * por Google activo para EEA/UK/Switzerland (TCF vigente). Esto evita requests
 * publicitarios sin consentimiento y también protege LCP durante la revisión.
 */
/** Se activa sólo después de verificar en AdSense una CMP certificada y TCF. */
export const GOOGLE_CERTIFIED_CMP_ENABLED = false;

/** Interruptor solicitado para servir anuncios. El guard impide activarlos sin CMP. */
const ADSENSE_SERVING_REQUESTED = false;
export const ADSENSE_SERVING_ENABLED = ADSENSE_SERVING_REQUESTED && GOOGLE_CERTIFIED_CMP_ENABLED;

const NO_ADS_PATH_RE = /^\/(?:buscar(?:\/|$)|mi-hacecuentas(?:\/|$)|mi(?:\/|$)|login(?:\/|$)|auth(?:\/|$)|cuenta(?:\/|$)|recuperar(?:-[^/]+)?(?:\/|$)|sugerir(?:\/|$)|sugerencias(?:\/|$)|contacto(?:\/|$)|embed(?:\/|$)|descarg(?:a|ar|as)(?:\/|$)|cookies(?:\/|$)|privacidad(?:\/|$)|terminos(?:\/|$)|aviso-legal(?:\/|$)|404(?:\/|$)|500(?:\/|$)|confirm(?:acion)?(?:\/|$)|gracias(?:\/|$)|error(?:\/|$))/i;

/**
 * Allowlist positiva de inventario publicitario.
 *
 * Tener una URL indexable no la vuelve automáticamente monetizable. Cuando la
 * cuenta y la CMP estén aprobadas, las primeras páginas se agregan acá después
 * de una revisión manual individual. Un catálogo nuevo, una ruta localizada o
 * un hub recién publicado queda sin anuncios por defecto.
 */
export const ADSENSE_APPROVED_PATHS: ReadonlySet<string> = new Set<string>([
  // Intencionalmente vacío durante la revisión de la cuenta.
]);

function normalizePath(pathname: string): string {
  const clean = pathname.split(/[?#]/, 1)[0].replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean;
}

export function isAdsenseApprovedPath(pathname: string): boolean {
  return ADSENSE_APPROVED_PATHS.has(normalizePath(pathname));
}

export function isAdsenseExcludedPath(pathname: string): boolean {
  const clean = normalizePath(pathname);
  return NO_ADS_PATH_RE.test(clean) || isLegacyReviewNoindexPath(clean);
}
import { isLegacyReviewNoindexPath } from './route-policy';
