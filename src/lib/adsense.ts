/**
 * Interruptor de serving de AdSense.
 *
 * La verificación del sitio sigue activa mediante google-adsense-account y
 * ads.txt. No habilitar serving hasta que la cuenta tenga un CMP certificado
 * por Google activo para EEA/UK/Switzerland (TCF vigente). Esto evita requests
 * publicitarios sin consentimiento y también protege LCP durante la revisión.
 */
export const ADSENSE_SERVING_ENABLED = false;
