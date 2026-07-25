export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function titulacionAcidoBase(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const ct = Number(i.ct); const vt = Number(i.vt); const nt = Number(i.nt);
  const va = Number(i.va); const na = Number(i.na);
  if (!ct || !vt || !nt || !va || !na) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  const c = (ct * vt * nt) / (va * na);
  const normalidad = c * na;
  const moles = c * (va / 1000);
  const resumen = __lang === 'en'
    ? `The sample is ${c.toFixed(4)} M (${normalidad.toFixed(4)} N): ${(moles * 1000).toFixed(3)} mmol of analyte in the ${va} mL aliquot.`
    : `La muestra es ${c.toFixed(4)} M (${normalidad.toFixed(4)} N): ${(moles * 1000).toFixed(3)} mmol de analito en la alícuota de ${va} mL.`;
  const poliprotico = na > 1 || nt > 1;
  const _insight = {
    title: __lang === 'en' ? 'Concentration at the equivalence point' : 'Concentración en el punto de equivalencia',
    text: __lang === 'en'
      ? `Equivalents match at ${vt} mL of titrant, giving **${c.toFixed(4)} M**.${poliprotico ? ` Note the n factors (${nt} and ${na}) are doing real work here — dropping them would change the result by a factor of ${(nt / na).toFixed(2)}.` : ' Both species are monoprotic, so molarity and normality coincide.'}`
      : `Los equivalentes se igualan a los ${vt} mL de titulante, lo que da **${c.toFixed(4)} M**.${poliprotico ? ` Ojo que los factores n (${nt} y ${na}) están pesando de verdad acá: ignorarlos cambiaría el resultado por un factor de ${(nt / na).toFixed(2)}.` : ' Las dos especies son monopróticas, así que molaridad y normalidad coinciden.'}`,
    tone: 'neutral',
    icon: '🧫',
  };
  return { concentracion: c.toFixed(4), normalidad: normalidad.toFixed(4) + ' N', moles: (moles * 1000).toFixed(3) + ' mmol', resumen, _insight };
}
