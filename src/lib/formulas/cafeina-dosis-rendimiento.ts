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
    },
    en: {
      errorPeso: 'Enter your weight',
      cafesEquiv: (min: string, max: string) => `${min}-${max} filter coffees (~95 mg each)`,
      timingBaja: '45-60 min before training (start with the minimum dose)',
      timingNormal: '30-60 min before training',
      mensaje: (mgMin: number, mgMax: number, cMin: string, cMax: string) =>
        `Optimal dose: ${Math.round(mgMin)}-${Math.round(mgMax)} mg (${cMin}-${cMax} coffees). Take 30-60 min before training.`,
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
  if (mgMax > 400) mgMax = 400;
  if (mgMin > mgMax) mgMin = mgMax;

  const cafesMin = (mgMin / 95).toFixed(1);
  const cafesMax = (mgMax / 95).toFixed(1);

  return {
    dosisOptima: `${Math.round(mgMin)}-${Math.round(mgMax)} mg`,
    dosisMinima: Math.round(mgMin),
    dosisMaxima: Math.round(mgMax),
    cafesEquiv: T.cafesEquiv(cafesMin, cafesMax),
    timing: tolerancia === 'baja' ? T.timingBaja : T.timingNormal,
    mensaje: T.mensaje(mgMin, mgMax, cafesMin, cafesMax),
  };
}