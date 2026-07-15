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

export function isAdsenseExcludedPath(pathname: string): boolean {
  const clean = pathname.split(/[?#]/, 1)[0].replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  return NO_ADS_PATH_RE.test(clean);
}
