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

const calcModules = import.meta.glob<any>('../content/calcs/*.json', { eager: true });
const calcs = Object.values(calcModules).map((m: any) => m.default || m).map((c: any) => ({
  slug: c.slug,
  h1: c.h1,
  icon: c.icon,
  description: c.description,
  category: c.category,
}));

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
