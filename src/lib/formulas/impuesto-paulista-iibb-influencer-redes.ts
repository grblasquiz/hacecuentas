export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function impuestoPaulistaIibbInfluencerRedes(i: Inputs): Outputs {
  const i_=Number(i.ingresos)||0; const p=String(i.provincia||'caba');
  const alic: Record<string,number> = { caba:0.04, pba:0.045, cba:0.05 };
  const a=alic[p]||0.04;
  const iibb=i_*a;
  const neto=i_-iibb;
  const fmt=(n:number)=>'$'+Math.round(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const _insight={
    title:'Cuánto te queda después de IIBB',
    text:`Por **${fmt(i_)}** facturados como creador en **${p.toUpperCase()}** pagás **${fmt(iibb)}** de Ingresos Brutos (alícuota **${(a*100).toFixed(1)}%**), y te quedan **${fmt(neto)}** netos. Recordá que IIBB se tributa por convenio multilateral si trabajás con plataformas o clientes de varias provincias.`,
    tone:'warn',
    icon:'📱'
  };
  return { iibb:'$'+iibb.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), alicuota:(a*100).toFixed(1)+'%', resumen:`$${i_.toLocaleString('es-AR')} en ${p.toUpperCase()}: IIBB $${iibb.toFixed(0)} (${(a*100).toFixed(1)}%).`, _insight };
}
