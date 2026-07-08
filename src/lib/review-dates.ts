// Fechas de lastReviewed compartidas por 50+ calcs = bulk-bump histórico.
// Renderizar "Última revisión: <misma fecha exacta>" en cientos de páginas es
// un fingerprint de refresh en lote (auditoría AdSense 2026-07-08: 803 calcs
// mostraban 2026-06-20). Para esas fechas se suprime la fecha exacta visible;
// el sello editorial queda, y el badge "Actualizado <mes año>" (granularidad
// mes, o dataUpdate del pipeline) sigue cubriendo la señal de frescura.
// El schema JSON-LD y el sitemap NO cambian.
const modules = import.meta.glob<any>(
  ['../content/calcs/*.json', '../content/calcs-*/*.json'],
  { eager: true },
);

const counts = new Map<string, number>();
for (const m of Object.values(modules)) {
  const d = (m as any).default || m;
  const lr = d?.lastReviewed;
  if (typeof lr === 'string' && lr) counts.set(lr, (counts.get(lr) || 0) + 1);
}

const CLUSTER_THRESHOLD = 50;

export const CLUSTER_DATES: Set<string> = new Set(
  [...counts].filter(([, n]) => n >= CLUSTER_THRESHOLD).map(([d]) => d),
);

export function shouldShowReviewDate(date?: string | null): boolean {
  return Boolean(date) && !CLUSTER_DATES.has(date as string);
}
