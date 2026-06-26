// fetch con timeout que LIMPIA el timer (clearTimeout en finally).
//
// 🔴 Por qué existe: `AbortSignal.timeout(ms)` NO se puede cancelar. Si el fetch
// resuelve antes de `ms`, el timer interno queda PENDIENTE. En el prerender del
// adapter @astrojs/cloudflare las páginas se renderizan dentro de un worker
// miniflare/workerd, una por "invocación". workerd no permite que sobreviva I/O
// pendiente (timers, streams) al terminar una invocación: lo arrastra a la
// SIGUIENTE página y tira `TypeError: Illegal invocation`, que el adapter
// escribe como el HTML de esa página → queda un stub roto de ~300 bytes.
// Es order-dependent: la víctima es la página que renderiza justo después de la
// que hizo el fetch (por eso "se movía" al cambiar el set de páginas).
//
// AbortController + clearTimeout garantiza CERO I/O pendiente tras el await.
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  ms = 8000,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// fetch + JSON con drenado SIEMPRE del body y fallback seguro.
//
// 🔴 Segunda fuente del bug "Illegal invocation": un Response cuyo body NO se
// consume deja un STREAM I/O abierto. En el prerender workerd ese stream
// pendiente se arrastra a la página siguiente y la rompe. El patrón típico
// `if (r.ok) data = await r.json()` filtra el body en el path !ok (p.ej. cuando
// la API rate-limitea con 429). Acá drenamos con `r.body?.cancel()` en todos
// los caminos. Usar esto en TODO fetch de build-time (frontmatter de pages
// prerender), no fetch crudo.
export async function fetchJSON<T>(
  url: string,
  fallback: T,
  init: RequestInit = {},
  ms = 8000,
): Promise<T> {
  try {
    const r = await fetchWithTimeout(url, init, ms);
    if (!r.ok) {
      try { await r.body?.cancel(); } catch {}
      return fallback;
    }
    return (await r.json()) as T;
  } catch {
    return fallback;
  }
}
