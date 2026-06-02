/** Calculadora de pH — pH = -log[H⁺] */
export interface Inputs { ph?: number; concentracionH?: number; __lang?: string; }
export interface Outputs { phOut: number; pOH: number; concentracionHOut: string; concentracionOH: string; clasificacion: string; _insight?: any; _chart?: any; }

export function phConcentracionHidrogeno(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorInput: 'Ingresá el pH o la concentración de H⁺',
      acida: 'Ácida',
      neutra: 'Neutra',
      basica: 'Básica (alcalina)',
      insTitle: 'Lectura del pH',
      insAcida: (ph: string, c: string) => `Con pH **${ph}** la solución es **ácida**: hay más iones H⁺ (**${c}**) que OH⁻. Cuanto más bajo el pH, mayor la acidez.`,
      insNeutra: (ph: string) => `Con pH **${ph}** la solución es prácticamente **neutra**: las concentraciones de H⁺ y OH⁻ están equilibradas (referencia: agua pura pH 7 a 25 °C).`,
      insBasica: (ph: string, c: string) => `Con pH **${ph}** la solución es **básica (alcalina)**: predominan los iones OH⁻ (**${c}**) sobre los H⁺. Cuanto más alto el pH, mayor la alcalinidad.`,
      segAcida: 'Ácida',
      segNeutra: 'Neutra',
      segBasica: 'Básica',
      chartAria: 'Escala de pH de 0 a 14 con la solución ubicada según su valor',
    },
    en: {
      errorInput: 'Enter the pH or the H⁺ concentration',
      acida: 'Acidic',
      neutra: 'Neutral',
      basica: 'Basic (alkaline)',
      insTitle: 'pH reading',
      insAcida: (ph: string, c: string) => `At pH **${ph}** the solution is **acidic**: there are more H⁺ ions (**${c}**) than OH⁻. The lower the pH, the stronger the acidity.`,
      insNeutra: (ph: string) => `At pH **${ph}** the solution is essentially **neutral**: H⁺ and OH⁻ concentrations are balanced (reference: pure water is pH 7 at 25 °C).`,
      insBasica: (ph: string, c: string) => `At pH **${ph}** the solution is **basic (alkaline)**: OH⁻ ions (**${c}**) outweigh H⁺. The higher the pH, the stronger the alkalinity.`,
      segAcida: 'Acidic',
      segNeutra: 'Neutral',
      segBasica: 'Basic',
      chartAria: 'pH scale from 0 to 14 with the solution placed according to its value',
    },
  } as const)[__lang];

  let pH: number;
  let H: number;

  const phVal = i.ph != null && String(i.ph) !== '' ? Number(i.ph) : null;
  const hVal = i.concentracionH != null && Number(i.concentracionH) > 0 ? Number(i.concentracionH) : null;

  if (phVal !== null) {
    pH = phVal;
    H = Math.pow(10, -pH);
  } else if (hVal !== null) {
    H = hVal;
    pH = -Math.log10(H);
  } else {
    throw new Error(T.errorInput);
  }

  const pOH = 14 - pH;
  const OH = Math.pow(10, -pOH);

  let clasif: string;
  if (pH < 6.5) clasif = T.acida;
  else if (pH <= 7.5) clasif = T.neutra;
  else clasif = T.basica;

  const phFmt = Number(pH.toFixed(2)).toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');
  const hFmt = `${H.toExponential(2)} mol/L`;
  const ohFmt = `${OH.toExponential(2)} mol/L`;

  let insText: string;
  let insTone: 'good' | 'warn' | 'neutral';
  if (pH < 6.5) { insText = T.insAcida(phFmt, hFmt); insTone = 'warn'; }
  else if (pH <= 7.5) { insText = T.insNeutra(phFmt); insTone = 'good'; }
  else { insText = T.insBasica(phFmt, ohFmt); insTone = 'warn'; }

  const _insight = {
    title: T.insTitle,
    text: insText,
    tone: insTone,
    icon: '🧪',
  };

  // Marcador sobre la escala 0-14; se acota para que entre en el rango visual
  const marker = Math.max(0, Math.min(14, pH));
  const _chart = {
    type: 'scale',
    marker: Number(marker.toFixed(2)),
    markerLabel: `pH ${phFmt}`,
    min: 0,
    segments: [
      { nombre: T.segAcida, max: 6.5, color: '#ef4444', colorDark: '#f87171' },
      { nombre: T.segNeutra, max: 7.5, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: T.segBasica, max: 14, color: '#3b82f6', colorDark: '#60a5fa' },
    ],
    ariaLabel: T.chartAria,
  };

  return {
    phOut: Number(pH.toFixed(4)),
    pOH: Number(pOH.toFixed(4)),
    concentracionHOut: `${H.toExponential(4)} mol/L`,
    concentracionOH: `${OH.toExponential(4)} mol/L`,
    clasificacion: clasif,
    _insight,
    _chart,
  };
}
