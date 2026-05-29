import type { APIRoute } from 'astro';

// Endpoint estático: genera /search-index.json en build time.
// Se carga lazy desde Header.astro al abrir el modal de search,
// evitando inlinear ~444 KB de JSON en cada una de las 3.234 páginas.
//
// CRÍTICO: prerender=true es obligatorio. Sin esto, en output:'server'
// el import.meta.glob eager empaqueta TODOS los JSONs de calcs (~21 MiB)
// dentro del Worker y el deploy falla por Worker size limit (3 MiB free /
// 10 MiB paid). Con prerender=true este endpoint se resuelve en build
// time generando /search-index.json como asset estático — fuera del Worker.
export const prerender = true;

// IMPORTANTE: las claves DEBEN ser las abreviadas {s, h, d, c, i, a}.
// El consumer (src/pages/buscar.astro:240 + src/components/Header.astro modal)
// espera EXACTAMENTE esas claves. Si las cambiás acá, el buscador deja de
// mostrar resultados (quedan undefined). Bug del 28-may-2026: alguien las
// puso como {slug, h1, description, category, icon} y el buscador rompió.
const calcModules = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules)
  .map((m: any) => m.default || m)
  .filter((c: any) => c.slug && c.h1 && !c.noindex)
  .map((c: any) => {
    const entry: any = {
      s: c.slug,
      h: c.h1,
      d: c.description ?? '',
      c: c.category ?? 'otros',
      i: c.icon ?? '🔢',
    };
    // Preservamos cualquier audience seteado (AR, ES, MX, CO, CL, BO, PE...).
    // El modal del Header rankea +30 si matchea path actual, -20 si es de otro país,
    // así que necesitamos el valor real, no sólo 'AR'.
    if (c.audience) entry.a = c.audience;
    return entry;
  });

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(calcs), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // SWR edge: 10 min fresh, 24 h stale-while-revalidate.
      // El JSON se invalida en cada deploy via hash de build (Vite asset),
      // pero como esta ruta no tiene hash en el nombre, dependemos de
      // CF Pages purge en deploy + revalidación en background.
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
    },
  });
};
