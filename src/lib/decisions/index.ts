/**
 * Registro de salas de decisión (/decidir/*).
 *
 * Importa los módulos completos (con `compute`, que a su vez importa fórmulas).
 * Se consume en:
 *   - el cliente: DecisionRoom.astro corre `room.compute(inputs)` en el browser.
 *   - el server: /decidir/[slug].astro arma SEO + baseline SSR.
 *
 * Para enumerar slugs en scripts de build SIN arrastrar las fórmulas, usar
 * `manifest.ts` (metadata pura, sin compute).
 */
import type { DecisionRoom } from './types';
import { room as aceptarOfertaLaboral } from './aceptar-oferta-laboral';

export const DECISION_LIST: DecisionRoom[] = [aceptarOfertaLaboral];

export const DECISION_ROOMS: Record<string, DecisionRoom> = Object.fromEntries(
  DECISION_LIST.map((r) => [r.slug, r]),
);

export function getRoom(slug: string): DecisionRoom | undefined {
  return DECISION_ROOMS[slug];
}
