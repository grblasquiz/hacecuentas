export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function titularidadCaratularAutoTrasladarProvincia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { tiempo: '5-15 días' },
    en: { tiempo: '5-15 days' },
  } as const)[__lang];
  const v=Number(i.valor)||0; const d=String(i.provDestino||'pba');
  const sel: Record<string,number> = { caba:0.015, pba:0.02, cba:0.02, sfe:0.018 };
  const c=85000+v*(sel[d]||0.02);
  const resumen = __lang === 'en'
    ? `Transfer to ${d.toUpperCase()} vehicle $${v.toLocaleString('es-AR')}: ~$${c.toFixed(0)}.`
    : `Radicación a ${d.toUpperCase()} auto $${v.toLocaleString('es-AR')}: ~$${c.toFixed(0)}.`;
  return { costo:'$'+c.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), tiempo: T.tiempo, resumen };
}
