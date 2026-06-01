export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dilucionConcentracionC1v1C2v2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { volFinal: 'vol final', concFinal: 'conc final', volInicial: 'vol inicial' },
    en: { volFinal: 'final vol', concFinal: 'final conc', volInicial: 'initial vol' },
  } as const)[__lang];
  const modo = String(i.modo); const c1 = Number(i.c1); const v1 = Number(i.v1);
  const c2 = Number(i.c2); const v2 = Number(i.v2);
  let r: number; let unit: string;
  if (modo === 'v2') { r = c1 * v1 / c2; unit = T.volFinal; }
  else if (modo === 'c2') { r = c1 * v1 / v2; unit = T.concFinal; }
  else { r = c2 * v2 / c1; unit = T.volInicial; }
  const resumen = __lang === 'en'
    ? `${unit} = ${r.toFixed(3)}. To dilute ${c1} in ${v1} to ${c2}: prepare ${r.toFixed(1)} total vol.`
    : `${unit} = ${r.toFixed(3)}. Para diluir ${c1} en ${v1} a ${c2}: preparar ${r.toFixed(1)} de vol total.`;
  return { resultado: r.toFixed(3), resumen };
}
