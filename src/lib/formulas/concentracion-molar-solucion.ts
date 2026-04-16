/** Calculadora de Concentración Molar — M = n/V */
export interface Inputs { molessoluto?: number; volumenL?: number; molaridad?: number; }
export interface Outputs { resultado: string; molaridadOut: number; molesOut: number; volumenOut: number; }

export function concentracionMolarSolucion(i: Inputs): Outputs {
  const n = i.molessoluto != null && Number(i.molessoluto) > 0 ? Number(i.molessoluto) : null;
  const V = i.volumenL != null && Number(i.volumenL) > 0 ? Number(i.volumenL) : null;
  const M = i.molaridad != null && Number(i.molaridad) > 0 ? Number(i.molaridad) : null;
  const filled = [n, V, M].filter(x => x !== null).length;
  if (filled < 2) throw new Error('Ingresá al menos dos de los tres valores');

  let moles: number, vol: number, molar: number;
  if (M === null) { moles = n!; vol = V!; molar = moles / vol; }
  else if (n === null) { molar = M; vol = V!; moles = molar * vol; }
  else { molar = M; moles = n; vol = moles / molar; }

  return {
    resultado: `Molaridad: ${molar.toFixed(4)} M, Moles: ${moles.toFixed(6)} mol, Volumen: ${vol.toFixed(4)} L`,
    molaridadOut: Number(molar.toFixed(6)),
    molesOut: Number(moles.toFixed(6)),
    volumenOut: Number(vol.toFixed(6)),
  };
}
