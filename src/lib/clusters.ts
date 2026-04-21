/**
 * Clusters temáticos: grupos de calcs relacionadas que se renderizan
 * prominentes (chip bar) en cada miembro del cluster.
 *
 * Ej: usuario entra a /calculadora-embarazo → arriba del form ve chips
 * de las otras 5 calcs del cluster. Cross-linking fuerte.
 */

export interface ClusterSlug {
  slug: string;
  label: string;
  icon: string;
}

export interface Cluster {
  id: string;
  title: string;
  items: ClusterSlug[];
}

export const CLUSTERS: Record<string, Cluster> = {
  embarazo: {
    id: 'embarazo',
    title: 'Herramientas de embarazo y bebé',
    items: [
      { slug: 'calculadora-embarazo', label: 'Semana actual', icon: '🤰' },
      { slug: 'calculadora-fecha-probable-parto-ultima-menstruacion', label: 'Fecha de parto', icon: '📅' },
      { slug: 'tracker-embarazo-semana-a-semana', label: 'Tracker semanal', icon: '📆' },
      { slug: 'calculadora-calorias-embarazo-trimestre', label: 'Calorías extra', icon: '🍎' },
      { slug: 'calculadora-aumento-peso-embarazo-imc-semana', label: 'Aumento peso', icon: '⚖️' },
      { slug: 'calculadora-peso-ideal-bebe-mes-percentil', label: 'Peso bebé', icon: '👶' },
      { slug: 'calculadora-indice-masa-corporal-pediatrico', label: 'IMC pediátrico', icon: '📊' },
      { slug: 'calculadora-calendario-vacunas-bebe-argentina-2026-completo', label: 'Vacunas bebé', icon: '💉' },
    ],
  },
  dolar: {
    id: 'dolar',
    title: 'Dashboard cambiario',
    items: [
      { slug: 'cambio-de-monedas', label: 'Cambio monedas', icon: '💱' },
      { slug: 'valores-bcra', label: 'Valores BCRA', icon: '🏦' },
      { slug: 'calculadora-brecha-dolar-blue-mep-ccl-oficial', label: 'Brecha dólar', icon: '📊' },
      { slug: 'inflacion-argentina', label: 'Inflación', icon: '📈' },
      { slug: 'comparador-plazo-fijo', label: 'Plazo fijo', icon: '💰' },
    ],
  },
};

/** Busca cluster al que pertenece un slug. */
export function findClusterForSlug(slug: string): Cluster | null {
  for (const cluster of Object.values(CLUSTERS)) {
    if (cluster.items.some((it) => it.slug === slug)) return cluster;
  }
  return null;
}
