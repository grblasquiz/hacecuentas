export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function comisionInmobiliariaAlquilerCabaPba(i: Inputs): Outputs {
  const a=Number(i.alquilerMensual)||0; const p=Number(i.plazo)||24; const j=String(i.jurisdiccion||'caba');
  const pct=j==='caba'?0.0415:0.05;
  const total=a*p*pct*1.21;
  const propPct=j==='caba'?1:0.5;
  const montoInquilino=total*(1-propPct);
  const montoPropietario=total*propPct;
  const fmt=(n:number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const _insight={
    title: j==='caba'?'En CABA la comisión la paga el propietario':'En PBA la comisión se reparte 50/50',
    text: j==='caba'
      ? `La comisión total es de **${fmt(total)}** (${(pct*100).toFixed(2)}% del contrato + IVA). En CABA, por la Ley 5.859, **el inquilino no paga nada**: los ${fmt(total)} corren por cuenta del propietario.`
      : `La comisión total es de **${fmt(total)}** (${(pct*100).toFixed(0)}% del contrato + IVA). En PBA se reparte 50/50: vos como inquilino pagás **${fmt(montoInquilino)}** y el propietario la otra mitad.`,
    tone: 'neutral',
    icon: '🏠'
  };
  const out:Outputs={ total:fmt(total), inquilino:fmt(montoInquilino), propietario:fmt(montoPropietario), resumen:`${j.toUpperCase()}: comisión total $${total.toFixed(0)} ${j==='caba'?'(propietario paga 100%)':'(50/50)'}.`, _insight };
  if(propPct>0 && propPct<1){
    out._chart={
      type:'doughnut',
      slices:[{label:'Paga el inquilino',value:Math.round(montoInquilino)},{label:'Paga el propietario',value:Math.round(montoPropietario)}],
      prefix:'$',
      centerValue:fmt(total),
      centerLabel:'Comisión total',
      ariaLabel:`Reparto de la comisión inmobiliaria: inquilino ${fmt(montoInquilino)}, propietario ${fmt(montoPropietario)}.`
    };
  }
  return out;
}
