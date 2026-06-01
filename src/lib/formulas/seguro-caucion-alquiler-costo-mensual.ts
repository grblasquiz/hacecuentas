export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function seguroCaucionAlquilerCostoMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { resumen: (a: number, p: number, prima: number) => `Alquiler $${a.toLocaleString('es-AR')} × ${p} meses: prima $${prima.toFixed(0)}.` },
    en: { resumen: (a: number, p: number, prima: number) => `Rent $${a.toLocaleString('en-US')} × ${p} months: premium $${prima.toFixed(0)}.` },
  } as const)[__lang];
  const a=Number(i.alquilerMensual)||0; const p=Number(i.plazo)||24;
  const tasa=p===12?0.10:p===24?0.15:0.20;
  const prima=a*tasa;
  return { prima:'$'+prima.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), mensualizada:'$'+(prima/p).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:T.resumen(a,p,prima) };
}
