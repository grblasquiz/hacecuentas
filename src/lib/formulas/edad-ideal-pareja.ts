/** Edad ideal de tu pareja — fórmula half-your-age-plus-seven */
export interface Inputs { edad: number; }
export interface Outputs { edadMinima: number; edadMaxima: number; mensaje: string; }

export function edadIdealPareja(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edad));
  if (!edad || edad < 14) throw new Error('Ingresá una edad válida (mínimo 14)');

  const minima = Math.round(edad / 2 + 7);
  const maxima = Math.round((edad - 7) * 2);
  const rango = maxima - minima;

  const msg = `Con ${edad} años, el rango ideal según la fórmula va de ${minima} a ${maxima} años (rango de ${rango} años). ` +
    (rango <= 10 ? 'Rango acotado — típico de gente joven.' :
     rango <= 30 ? 'Rango amplio — tenés bastante margen.' :
     'Rango muy amplio — a esta edad la diferencia importa menos.');

  return { edadMinima: Math.max(14, minima), edadMaxima: Math.max(minima, maxima), mensaje: msg };
}
