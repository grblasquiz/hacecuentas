/**
 * Calorías quemadas caminando: fórmula MET estándar.
 * calorías = MET × peso(kg) × tiempo(horas)
 * MET por ritmo según el Compendium of Physical Activities (Ainsworth et al.):
 *   - Caminar ~3 km/h (lento, 2.0 mph) ≈ 2.8 MET
 *   - Caminar ~5 km/h (normal, 3.0 mph) ≈ 3.5 MET
 *   - Caminar ~6.5 km/h (rápido, 4.0 mph) ≈ 5.0 MET
 *   - Caminar ~7.5 km/h (muy rápido, 4.5 mph) ≈ 6.3 MET
 * Longitud de paso ≈ 0.76 m (paso humano promedio) → pasos = metros / 0.76.
 */
export interface Inputs {
  peso: number;
  distancia: number;
  ritmo?: string;
  __lang?: string;
}
export interface Outputs {
  calorias: number;
  tiempoMin: number;
  pasoEquivalente: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

// MET y velocidad (km/h) por ritmo. Fuente: Compendium of Physical Activities.
const RITMOS: Record<string, { met: number; vel: number }> = {
  lento: { met: 2.8, vel: 3.0 },
  normal: { met: 3.5, vel: 5.0 },
  rapido: { met: 5.0, vel: 6.5 },
  muyrapido: { met: 6.3, vel: 7.5 },
};
const LARGO_PASO_M = 0.76; // metros por paso (promedio adulto)

export function caloriasQuemadasCaminando(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá tu peso y la distancia',
      insightTitle: 'Cuánto quemaste',
      tone: 'good' as const,
      mins: 'min',
      chartAria: 'Calorías quemadas caminando según ritmo y distancia.',
      caminata: 'Esta caminata',
      restante: 'Para cerrar 300 kcal',
    },
    en: {
      errorRequired: 'Enter your weight and distance',
      insightTitle: 'How much you burned',
      tone: 'good' as const,
      mins: 'min',
      chartAria: 'Calories burned walking by pace and distance.',
      caminata: 'This walk',
      restante: 'To reach 300 kcal',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const distancia = Number(i.distancia);
  const ritmo = String(i.ritmo || 'normal');
  if (!peso || !distancia || peso <= 0 || distancia <= 0) throw new Error(T.errorRequired);

  const r = RITMOS[ritmo] || RITMOS.normal;
  const tiempoHoras = distancia / r.vel;
  const calorias = r.met * peso * tiempoHoras;
  const tiempoMin = tiempoHoras * 60;
  // Pasos ≈ metros recorridos / largo de paso
  const pasos = (distancia * 1000) / LARGO_PASO_M;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const cal = Math.round(calorias);
  const objetivo = 300;
  const restante = Math.max(0, objetivo - cal);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.caminata, value: Math.min(cal, objetivo) },
      { label: T.restante, value: restante },
    ],
    centerValue: cal.toLocaleString(locale) + ' kcal',
    centerLabel: T.caminata,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `Walking **${distancia} km** at this pace burns about **${cal} kcal** in **${Math.round(tiempoMin)} min** — roughly **${Math.round(pasos).toLocaleString(locale)} steps**.`
      : `Caminar **${distancia} km** a este ritmo quema unas **${cal} kcal** en **${Math.round(tiempoMin)} min** — unos **${Math.round(pasos).toLocaleString(locale)} pasos**.`,
    tone: T.tone,
    icon: '🚶',
  };

  return {
    calorias: cal,
    tiempoMin: Math.round(tiempoMin),
    pasoEquivalente: Math.round(pasos),
    formula: `kcal = ${r.met} MET × ${peso} kg × ${tiempoHoras.toFixed(3)} h = ${cal}`,
    _chart: chart,
    _insight: insight,
  };
}
