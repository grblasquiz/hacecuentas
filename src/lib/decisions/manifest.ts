/**
 * Metadata pura de las salas de decisión — SIN `compute` ni imports de fórmulas.
 *
 * Existe para que scripts de build (sobre todo el sitemap) puedan enumerar las
 * URLs `/decidir/*` y su `lastReviewed` sin cargar el orquestador completo (que
 * importa las fórmulas). Mantener en sync con los `room.slug`/`room.lastReviewed`
 * de cada módulo en src/lib/decisions/.
 */
export interface DecisionRoomMeta {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  icon: string;
  category: string;
  lastReviewed: string; // YYYY-MM-DD
}

export const DECISION_MANIFEST: DecisionRoomMeta[] = [
  {
    slug: 'aceptar-oferta-laboral',
    title: '¿Me conviene aceptar esta oferta laboral? Comparador real 2026',
    h1: '¿Me conviene aceptar esta oferta laboral?',
    description:
      'Compará tu trabajo actual contra una oferta nueva con números reales: sueldo neto, Ganancias, traslado, comidas, tiempo de viaje, bono y beneficios. Te decimos cuánto mejora de verdad y el sueldo mínimo que deberías pedir.',
    intro:
      'No alcanza con mirar el sueldo bruto. Comparamos tu trabajo actual contra la oferta corriendo por dentro el sueldo neto, Ganancias, los costos de traslado y el valor real de tu hora.',
    icon: '💼',
    category: 'finanzas',
    lastReviewed: '2026-06-29',
  },
];
