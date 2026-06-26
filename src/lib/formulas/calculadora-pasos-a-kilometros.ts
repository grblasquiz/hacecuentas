/**
 * Pasos a kilómetros: estima la distancia a partir de pasos y altura.
 * Longitud de zancada (m) ≈ altura(cm)/100 × 0.414  (factor estándar de longitud de paso ≈ 0,414 × altura).
 * km = pasos × zancada / 1000
 * Cadencia típica de caminata ≈ 100 pasos/min → tiempoMin = pasos / 100.
 * Calorías (opcional, si hay peso): se calcula como caminata a ritmo normal
 *   con la fórmula MET estándar — caminar normal ≈ 3,5 MET a ~5 km/h.
 *   calorías = MET × peso × horas, con horas = (km / 5).
 */
export interface Inputs {
  pasos: number;
  altura: number;
  peso?: number;
  __lang?: string;
}
export interface Outputs {
  km: number;
  tiempoMin: number;
  calorias: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

const FACTOR_ZANCADA = 0.414; // longitud de paso ≈ 0,414 × altura
const CADENCIA_PPM = 100; // pasos por minuto (caminata típica)
const MET_NORMAL = 3.5; // MET caminar ~5 km/h (Compendium of Physical Activities)
const VEL_NORMAL = 5; // km/h

export function pasosAKilometros(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá la cantidad de pasos y tu altura',
      insightTitle: 'Tu distancia',
      mins: 'min',
      chartAria: 'Distancia recorrida según pasos y altura, comparada con la meta de 10.000 pasos.',
      caminado: 'Lo caminado',
      meta: 'Hasta 10.000 pasos',
    },
    en: {
      errorRequired: 'Enter the number of steps and your height',
      insightTitle: 'Your distance',
      mins: 'min',
      chartAria: 'Distance covered by steps and height, compared with the 10,000-step goal.',
      caminado: 'Walked',
      meta: 'To 10,000 steps',
    },
  } as const)[__lang];

  const pasos = Number(i.pasos);
  const altura = Number(i.altura);
  const peso = i.peso != null && i.peso !== ('' as any) ? Number(i.peso) : 0;
  if (!pasos || !altura || pasos <= 0 || altura <= 0) throw new Error(T.errorRequired);

  const zancadaM = (altura / 100) * FACTOR_ZANCADA;
  const metros = pasos * zancadaM;
  const km = metros / 1000;
  const tiempoMin = pasos / CADENCIA_PPM;

  // Calorías solo si hay peso válido (>0). Si no, devolvemos 0.
  let calorias = 0;
  if (peso > 0) {
    const horas = km / VEL_NORMAL;
    calorias = MET_NORMAL * peso * horas;
  }

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const metaPasos = 10000;
  const restante = Math.max(0, metaPasos - pasos);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.caminado, value: Math.min(pasos, metaPasos) },
      { label: T.meta, value: restante },
    ],
    centerValue: km.toFixed(2) + ' km',
    centerLabel: T.caminado,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `**${pasos.toLocaleString(locale)} steps** cover about **${km.toFixed(2)} km** in roughly **${Math.round(tiempoMin)} min**${peso > 0 ? `, burning around **${Math.round(calorias)} kcal**` : ''}.`
      : `**${pasos.toLocaleString(locale)} pasos** equivalen a unos **${km.toFixed(2)} km** en aproximadamente **${Math.round(tiempoMin)} min**${peso > 0 ? `, quemando unas **${Math.round(calorias)} kcal**` : ''}.`,
    tone: 'good' as const,
    icon: '👣',
  };

  return {
    km: Math.round(km * 100) / 100,
    tiempoMin: Math.round(tiempoMin),
    calorias: Math.round(calorias),
    formula: `km = ${pasos} pasos × ${zancadaM.toFixed(3)} m/paso ÷ 1000 = ${(Math.round(km * 100) / 100).toFixed(2)}`,
    _chart: chart,
    _insight: insight,
  };
}
