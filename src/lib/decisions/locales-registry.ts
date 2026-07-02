/**
 * Registro de salas de decisión LOCALIZADAS (/co|mx|cl|pe/decidir/*).
 *
 * Espejo de index.ts pero para los subdirectorios país: auto-descubre
 * src/lib/decisions/{co,mx,cl,pe}/*.ts que exporten un `room`. Agregar una
 * sala país = crear su archivo; no hay que tocar este registro.
 *
 * Registro SEPARADO a propósito: el <script> de DecisionRoom.astro importa
 * index.ts (solo salas AR) y el de DecisionRoomIntl.astro importa este —
 * así las páginas AR no cargan el bundle de las salas país ni viceversa.
 *
 * Claves del mapa: `${cc}/${slug}` (ej. 'co/cuanto-arriendo-puedo-pagar').
 */
import type { DecisionRoom } from './types';
import type { DecisionCountryCode } from './locales';

const modules = import.meta.glob<{ room?: DecisionRoom }>(
  ['./co/*.ts', './mx/*.ts', './cl/*.ts', './pe/*.ts'],
  { eager: true },
);

export const DECISION_ROOMS_INTL: Record<string, DecisionRoom> = {};

for (const [path, mod] of Object.entries(modules)) {
  const room = mod.room;
  if (!room || typeof room.slug !== 'string') continue;
  const cc = path.split('/')[1]; // './co/xxx.ts' → 'co'
  DECISION_ROOMS_INTL[`${cc}/${room.slug}`] = room;
}

/** Salas de un país, ordenadas por slug. */
export function roomsOfCountry(cc: DecisionCountryCode): DecisionRoom[] {
  const prefix = `${cc}/`;
  return Object.entries(DECISION_ROOMS_INTL)
    .filter(([k]) => k.startsWith(prefix))
    .map(([, r]) => r)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getIntlRoom(cc: DecisionCountryCode, slug: string): DecisionRoom | undefined {
  return DECISION_ROOMS_INTL[`${cc}/${slug}`];
}
