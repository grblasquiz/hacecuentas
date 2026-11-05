import type { APIRoute } from 'astro';
import { readFxLive } from '../../lib/fx-live';
import { validTrm } from '../../lib/trm-live';

export const prerender = false;

export const GET: APIRoute = async () => {
  const trm = validTrm(await readFxLive('colombia'));
  return new Response(JSON.stringify({ trm }), {
    status: trm ? 200 : 503,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': trm ? 'public, max-age=60, must-revalidate' : 'no-store',
    },
  });
};
