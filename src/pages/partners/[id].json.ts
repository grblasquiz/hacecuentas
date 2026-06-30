import type { APIRoute } from 'astro';
import partners from '../../data/partners.json';

// Config pública de cada partner (Partner Studio). El web component <hace-cuentas>
// lo consume para aplicar tema por defecto y decidir si puede ocultar la
// atribución (sólo si attributionWaived=true y el dominio está autorizado).
//
// Sólo se expone un subconjunto seguro: nunca campos internos/privados.
export const prerender = true;

export function getStaticPaths() {
  return Object.keys(partners as Record<string, unknown>).map((id) => ({ params: { id } }));
}

export const GET: APIRoute = ({ params }) => {
  const id = params.id || '';
  const p = (partners as Record<string, any>)[id];
  if (!p) {
    return new Response('{}', {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
    });
  }
  const body = {
    id,
    name: p.name || id,
    accent: p.accent || null,
    logo: p.logo || null,
    attributionWaived: !!p.attributionWaived,
    authorizedDomains: Array.isArray(p.authorizedDomains) ? p.authorizedDomains : [],
    plan: p.plan || 'free',
  };
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
