import type { APIRoute } from 'astro';

export const prerender = false;

const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/basketball';
const allowed = {
  scoreboard: `${ESPN}/nba/scoreboard`,
  summer: `${ESPN}/nba-summer-las-vegas/scoreboard`,
  standings: 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?region=us&lang=en&contentorigin=espn&season=2026',
} as const;

export const GET: APIRoute = async ({ url }) => {
  const kind = url.searchParams.get('kind') as keyof typeof allowed | null;
  if (!kind || !allowed[kind]) {
    return new Response(JSON.stringify({ error: 'kind inválido' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const upstream = new URL(allowed[kind]);
  if (kind !== 'standings') {
    const dates = url.searchParams.get('dates');
    if (dates && /^\d{8}(?:-\d{8})?$/.test(dates)) upstream.searchParams.set('dates', dates);
    upstream.searchParams.set('limit', '200');
  }

  try {
    const response = await fetch(upstream, { headers: { 'User-Agent': 'hacecuentas.com NBA live hub' } });
    if (!response.ok) throw new Error(`ESPN ${response.status}`);
    return new Response(await response.text(), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': kind === 'standings' ? 'public, max-age=300, s-maxage=900' : 'public, max-age=30, s-maxage=60',
        'cdn-cache-control': kind === 'standings' ? 'max-age=900' : 'max-age=60',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'fuente NBA temporalmente no disponible' }), {
      status: 502,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }
};
