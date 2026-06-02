export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function pensionViudezPorcentajeConyuge(i: Inputs): Outputs {
  const h=Number(i.haberJubilado)||0; const hij=Number(i.hijosMenores)||0;
  const pct=Math.min(1, 0.70+hij*0.10);
  const p=h*pct;
  const pctNum=Math.round(pct*100);
  const fmtAR=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const _insight={
    title: pctNum>=100 ? 'Cobrás el 100% del haber' : 'Porcentaje según hijos a cargo',
    text: hij>0
      ? `Con **${hij} hijo(s) a cargo** el porcentaje sube al **${pctNum}%** (70% base + 10% por hijo): la pensión queda en **${fmtAR(p)}/mes** sobre un haber de ${fmtAR(h)}.`
      : `Sin hijos a cargo se aplica el **70%** del haber: la pensión de viudez es **${fmtAR(p)}/mes** sobre ${fmtAR(h)}. Cada hijo a cargo suma 10% (tope 100%).`,
    tone: pctNum>=100 ? 'good' : 'neutral',
    icon:'🕊️',
  };
  const _chart={
    type:'scale',
    marker:pctNum,
    markerLabel:pctNum+'%',
    min:60,
    segments:[
      { nombre:'Solo cónyuge 70%', max:70, color:'#fcd34d', colorDark:'#b45309' },
      { nombre:'+ hijos', max:90, color:'#a7f3d0', colorDark:'#0f766e' },
      { nombre:'Tope 100%', max:100, color:'#86efac', colorDark:'#15803d' },
    ],
    ariaLabel:`Porcentaje del haber aplicado: ${pctNum}% (70% base más 10% por hijo a cargo, tope 100%)`,
  };
  return { pension:'$'+p.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), porcentaje:(pct*100).toFixed(0)+'%', resumen:`Haber $${h.toLocaleString('es-AR')} × ${(pct*100).toFixed(0)}% = $${p.toFixed(0)}/mes.`, _insight, _chart };
}
