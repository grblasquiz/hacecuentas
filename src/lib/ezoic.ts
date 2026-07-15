// Ezoic — flags de integración (display ads).
//
// Kill-switch: poné EZOIC_ENABLED = false para revertir TODO instantáneamente
// (no inyecta scripts de Ezoic, re-activa el loader de adsbygoogle, y el banner
// de cookies casero vuelve a manejar la UE). Mismo patrón que OFFERS_PAUSED.
//
// Decisiones (2026-06-25, Martin):
//  - CMP en UE: el gatekeeper certificado de Ezoic maneja el TCF vigente
//    en la UE/UK; el banner casero (CookieConsent.astro) se defiere ahí. En
//    LATAM/AR/US no cambia nada (Consent Mode default granted, sin banner).
//    ⚠️ Activar "Google Consent Mode" en el panel de Ezoic para que el gatekeeper
//       siga alimentando ad_storage/analytics_storage de GA4/Ads en la UE.
//  - Tráfico: anuncios a TODO el tráfico (sin gate por source). Si Google Ads
//    flaggea arbitraje en el 70% pago, gatear acá por gclid/utm=cpc.
//
// GO-LIVE 2026-06-25: true para que los header scripts estén vivos y Ezoic pase
//    su "check connection" (lo necesita Martin para destrabar el panel). Pendiente
//    en el panel Ezoic: (1) ads.txt → manager, (2) placements, (3) "Google Consent
//    Mode" ON, (4) CMP geo-targeteado a GDPR-only (no global, así AR/LATAM no ve
//    banner). Rollback instantáneo = volver a false + redeploy.
//
// OFF 2026-06-30 (Martin): Ezoic NO aprobó la cuenta → sacamos todo su stack
//    (CMP gatekeeper + sa.min.js + ezoicanalytics). Eran scripts render-blocking
//    de terceros que inflaban el INP en mobile sin devolver ni un peso. Al apagar,
//    el banner de cookies casero vuelve a manejar la UE y se reactiva el loader
//    diferido de adsbygoogle (rama !EZOIC_ENABLED en Layout.astro).
export const EZOIC_ENABLED = false;
