/**
 * Registro de salas de decisión (/decidir/*).
 *
 * Auto-descubre TODOS los módulos `src/lib/decisions/*.ts` que exporten un
 * `room` (vía import.meta.glob de Vite/Astro). Agregar una sala = crear su
 * archivo; no hay que tocar este registro.
 *
 * Se consume en el cliente (DecisionRoom.astro corre room.compute en el browser)
 * y en el server (/decidir/[slug].astro arma SEO + baseline SSR). Para enumerar
 * slugs en scripts de build SIN arrastrar las fórmulas, usar `manifest.ts`
 * (metadata pura, generada por scripts/gen-decisions-manifest.ts).
 */
import type { DecisionRoom } from './types';

const modules = import.meta.glob<{ room?: DecisionRoom }>(
  ['./*.ts', '!./index.ts', '!./types.ts', '!./manifest.ts'],
  { eager: true },
);

export const DECISION_LIST: DecisionRoom[] = Object.values(modules)
  .map((m) => m.room)
  .filter((r): r is DecisionRoom => !!r && typeof r.slug === 'string')
  .sort((a, b) => a.slug.localeCompare(b.slug));

export const DECISION_ROOMS: Record<string, DecisionRoom> = Object.fromEntries(
  DECISION_LIST.map((r) => [r.slug, r]),
);

export function getRoom(slug: string): DecisionRoom | undefined {
  return DECISION_ROOMS[slug];
}
