// Offer de schema.org para apps gratuitas (todas las calcs son free).
//
// Centraliza las props del `offers` que antes estaban inline y duplicadas en
// 23 rutas. El validador de datos estructurados marcaba (no crítico) la falta
// de `validFrom` en el Offer; lo agregamos acá junto con `availability` y
// `priceValidUntil` (recomendadas por Google para un Offer con precio).
//
// Nota sobre `highPrice`: NO se incluye a propósito. `highPrice`/`lowPrice`
// son propiedades de AggregateOffer (varios precios), no de un Offer simple.
// Esta es una calc gratis con un único precio ($0), así que inyectar highPrice
// sería markup inválido. La advertencia de highPrice no aplica a este nodo.
export function freeOfferSchema(
  opts: { priceCurrency?: string; validFrom?: string } = {},
): Record<string, unknown> {
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    price: '0',
    availability: 'https://schema.org/InStock',
    // La calc es gratis de forma permanente; renovamos la ventana cada año
    // (el deploy diario re-buildea) para no quedar "vencidos" ante Google.
    priceValidUntil: `${new Date().getUTCFullYear() + 1}-12-31`,
    // validFrom: fecha de publicación de la calc si está; si no, fecha de build.
    validFrom: opts.validFrom || new Date().toISOString().slice(0, 10),
  };
  if (opts.priceCurrency) offer.priceCurrency = opts.priceCurrency;
  return offer;
}

// Offer para las ENTRADAS de un evento deportivo (SportsEvent: Mundial, F1, NBA,
// NFL). A diferencia de las calcs (gratis, price 0), acá el `offers` son los
// tickets del evento, que NO vendemos: enlazamos la venta oficial. Search Console
// marcaba "Falta offers" en cada nodo SportsEvent; con esto el campo queda
// presente y válido. Incluimos url + availability + validFrom (recomendados por
// Google). NO ponemos price/lowPrice/highPrice a propósito: no fijamos ni
// inventamos el valor de la entrada (varía por evento, categoría y fecha) y un
// precio inventado sería markup engañoso. Al ser un Offer simple (no
// AggregateOffer) tampoco aplica la advertencia de highPrice/lowPrice.
export function eventTicketOffer(
  opts: { url: string; priceCurrency?: string; validFrom?: string },
): Record<string, unknown> {
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url: opts.url,
    availability: 'https://schema.org/InStock',
    // validFrom: fecha desde la que el offer es válido. El deploy re-buildea a
    // diario, así que la ventana se renueva sola (mismo criterio que freeOfferSchema).
    validFrom: opts.validFrom || new Date().toISOString().slice(0, 10),
  };
  if (opts.priceCurrency) offer.priceCurrency = opts.priceCurrency;
  return offer;
}
