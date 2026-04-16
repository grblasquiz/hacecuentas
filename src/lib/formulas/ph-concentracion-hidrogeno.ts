/** Calculadora de pH — pH = -log[H⁺] */
export interface Inputs { ph?: number; concentracionH?: number; }
export interface Outputs { phOut: number; pOH: number; concentracionHOut: string; concentracionOH: string; clasificacion: string; }

export function phConcentracionHidrogeno(i: Inputs): Outputs {
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
    throw new Error('Ingresá el pH o la concentración de H⁺');
  }

  const pOH = 14 - pH;
  const OH = Math.pow(10, -pOH);

  let clasif: string;
  if (pH < 6.5) clasif = 'Ácida';
  else if (pH <= 7.5) clasif = 'Neutra';
  else clasif = 'Básica (alcalina)';

  return {
    phOut: Number(pH.toFixed(4)),
    pOH: Number(pOH.toFixed(4)),
    concentracionHOut: `${H.toExponential(4)} mol/L`,
    concentracionOH: `${OH.toExponential(4)} mol/L`,
    clasificacion: clasif,
  };
}
