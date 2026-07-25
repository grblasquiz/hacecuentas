export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function porcentajeMasaVolumenSolucion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const soluto = Number(i.soluto); const solvente = Number(i.solvente);
  if (!soluto || solvente === undefined || Number.isNaN(solvente)) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  const total = soluto + solvente;
  const pct = (soluto / total) * 100;
  const gl = pct * 10;
  const ppm = pct * 10000;
  const resumen = __lang === 'en'
    ? `${soluto} of solute in ${total} of solution = ${pct.toFixed(3)}% (${gl.toFixed(1)} g/L, ${Math.round(ppm).toLocaleString('en-US')} ppm if read as w/v).`
    : `${soluto} de soluto en ${total} de solución = ${pct.toFixed(3)}% (${gl.toFixed(1)} g/L, ${Math.round(ppm).toLocaleString('es-AR')} ppm si se lee como p/v).`;
  const _insight = {
    title: __lang === 'en' ? 'Percent concentration' : 'Concentración porcentual',
    text: __lang === 'en'
      ? `The denominator is the **whole solution** (${total}), not just the solvent — that is the single most common mistake here. Read as w/v, ${pct.toFixed(3)}% equals **${gl.toFixed(1)} g/L**.`
      : `El denominador es la **solución completa** (${total}), no solo el solvente — es el error más frecuente en este cálculo. Leído como p/v, ${pct.toFixed(3)}% equivale a **${gl.toFixed(1)} g/L**.`,
    tone: 'neutral',
    icon: '💧',
  };
  return { porcentaje: pct.toFixed(3), gl: gl.toFixed(1) + ' g/L', ppm: Math.round(ppm).toString() + ' ppm', resumen, _insight };
}
