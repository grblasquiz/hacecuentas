// Ezoic — flags de integración (display ads).
//
// Kill-switch: poné EZOIC_ENABLED = false para revertir TODO instantáneamente
// (no inyecta scripts de Ezoic, re-activa el loader de adsbygoogle, y el banner
// de cookies casero vuelve a manejar la UE). Mismo patrón que OFFERS_PAUSED.
//
// Decisiones (2026-06-25, Martin):
//  - CMP en UE: el gatekeeper de Ezoic (TCF 2.2 certificado) maneja el consent
//    en la UE/UK; el banner casero (CookieConsent.astro) se defiere ahí. En
//    LATAM/AR/US no cambia nada (Consent Mode default granted, sin banner).
//    ⚠️ Activar "Google Consent Mode" en el panel de Ezoic para que el gatekeeper
//       siga alimentando ad_storage/analytics_storage de GA4/Ads en la UE.
//  - Tráfico: anuncios a TODO el tráfico (sin gate por source). Si Google Ads
//    flaggea arbitraje en el 70% pago, gatear acá por gclid/utm=cpc.
export const EZOIC_ENABLED = true;
