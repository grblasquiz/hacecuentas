export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function densidadPixelesPantallaPpiRetina(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { errDiag: 'Diagonal no puede ser 0.', yes: 'Sí', near: 'Cercano', no: 'No', enLabel: 'en' },
    en: { errDiag: 'Diagonal cannot be 0.', yes: 'Yes', near: 'Near', no: 'No', enLabel: 'in' },
  } as const)[__lang];
  const w=Number(i.ancho)||0; const h=Number(i.alto)||0; const d=Number(i.diag)||0;
  if (d===0) return { ppi:'—', retina:'—', resumen: T.errDiag };
  const ppi=Math.sqrt(w*w+h*h)/d;
  const retina=ppi>=300?T.yes:(ppi>=200?T.near:T.no);
  const resumen = __lang === 'en'
    ? `${w}×${h} at ${d}" = ${ppi.toFixed(0)} PPI.`
    : `${w}×${h} en ${d}" = ${ppi.toFixed(0)} PPI.`;
  return { ppi:ppi.toFixed(1), retina, resumen };
}
