/** Calculadora de cafeína para rendimiento deportivo */
export interface Inputs {
  peso: number;
  tolerancia: string;
  __lang?: string;
}
export interface Outputs {
  dosisOptima: string;
  dosisMinima: number;
  dosisMaxima: number;
  cafesEquiv: string;
  timing: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function cafeinaDosisRendimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorPeso: 'Ingresá tu peso',
      cafesEquiv: (min: string, max: string) => `${min}-${max} cafés de filtro (~95 mg c/u)`,
      timingBaja: '45-60 min antes de entrenar (empezá con la dosis mínima)',
      timingNormal: '30-60 min antes de entrenar',
      mensaje: (mgMin: number, mgMax: number, cMin: string, cMax: string) =>
        `Dosis óptima: ${Math.round(mgMin)}-${Math.round(mgMax)} mg (${cMin}-${cMax} cafés). Tomá 30-60 min antes de entrenar.`,
      insightTitle: 'Tu dosis de cafeína',
      insightTitleCap: 'Dosis limitada al tope seguro',
      insightText: (mgMin: number, mgMax: number, cMin: string, cMax: string) =>
        `Tu rango óptimo es **${Math.round(mgMin)}-${Math.round(mgMax)} mg** (${cMin}-${cMax} cafés). Empezá por la dosis baja para probar tolerancia: más no rinde mejor.`,
      insightTextCap: (mgMax: number, cMax: string) =>
        `Tu peso pediría una dosis mayor, pero la recortamos a **${Math.round(mgMax)} mg** (${cMax} cafés), el tope diario que la EFSA considera seguro. No lo superes.`,
      segModerada: 'Moderada',
      segAlta: 'Alta (tope EFSA)',
      segExceso: 'Sobre el tope',
      chartAria: (mgMax: number) => `Dosis de ${Math.round(mgMax)} mg ubicada en la escala respecto al tope seguro de 400 mg diarios`,
    },
    en: {
      errorPeso: 'Enter your weight',
      cafesEquiv: (min: string, max: string) => `${min}-${max} filter coffees (~95 mg each)`,
      timingBaja: '45-60 min before training (start with the minimum dose)',
      timingNormal: '30-60 min before training',
      mensaje: (mgMin: number, mgMax: number, cMin: string, cMax: string) =>
        `Optimal dose: ${Math.round(mgMin)}-${Math.round(mgMax)} mg (${cMin}-${cMax} coffees). Take 30-60 min before training.`,
      insightTitle: 'Your caffeine dose',
      insightTitleCap: 'Dose capped at the safe limit',
      insightText: (mgMin: number, mgMax: number, cMin: string, cMax: string) =>
        `Your optimal range is **${Math.round(mgMin)}-${Math.round(mgMax)} mg** (${cMin}-${cMax} coffees). Start at the low end to test tolerance: more is not better.`,
      insightTextCap: (mgMax: number, cMax: string) =>
        `Your weight would call for a higher dose, but we capped it at **${Math.round(mgMax)} mg** (${cMax} coffees), the daily limit the EFSA considers safe. Do not exceed it.`,
      segModerada: 'Moderate',
      segAlta: 'High (EFSA limit)',
      segExceso: 'Above limit',
      chartAria: (mgMax: number) => `Dose of ${Math.round(mgMax)} mg placed on the scale relative to the safe limit of 400 mg per day`,
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const tolerancia = String(i.tolerancia || 'media');
  if (!peso || peso <= 0) throw new Error(T.errorPeso);

  // ISSN: 3-6 mg/kg para rendimiento
  let mgMin: number, mgMax: number;
  if (tolerancia === 'baja') {
    mgMin = peso * 2; mgMax = peso * 3;
  } else if (tolerancia === 'media') {
    mgMin = peso * 3; mgMax = peso * 5;
  } else {
    mgMin = peso * 4; mgMax = peso * 6;
  }

  // Cap at EFSA safe limit 400 mg
  const capped = mgMax > 400;
  if (mgMax > 400) mgMax = 400;
  if (mgMin > mgMax) mgMin = mgMax;

  const cafesMin = (mgMin / 95).toFixed(1);
  const cafesMax = (mgMax / 95).toFixed(1);

  const _insight = {
    title: capped ? T.insightTitleCap : T.insightTitle,
    text: capped
      ? T.insightTextCap(mgMax, cafesMax)
      : T.insightText(mgMin, mgMax, cafesMin, cafesMax),
    tone: capped ? 'warn' : 'good',
    icon: '⚡',
  };

  const _chart = {
    type: 'scale',
    marker: Math.round(mgMax),
    markerLabel: `${Math.round(mgMax)} mg`,
    min: 0,
    segments: [
      { nombre: T.segModerada, max: 200, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: T.segAlta, max: 400, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: T.segExceso, max: 450, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: T.chartAria(mgMax),
  };

  return {
    dosisOptima: `${Math.round(mgMin)}-${Math.round(mgMax)} mg`,
    dosisMinima: Math.round(mgMin),
    dosisMaxima: Math.round(mgMax),
    cafesEquiv: T.cafesEquiv(cafesMin, cafesMax),
    timing: tolerancia === 'baja' ? T.timingBaja : T.timingNormal,
    mensaje: T.mensaje(mgMin, mgMax, cafesMin, cafesMax),
    _insight,
    _chart,
  };
}