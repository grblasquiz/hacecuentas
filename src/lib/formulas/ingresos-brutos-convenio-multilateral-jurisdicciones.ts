export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function ingresosBrutosConvenioMultilateralJurisdicciones(i: Inputs): Outputs {
  const vC=Number(i.ventasCABA)||0; const vP=Number(i.ventasPBA)||0;
  const gC=Number(i.gastosCABA)||0; const gP=Number(i.gastosPBA)||0;
  const total=Number(i.totalBase)||0;
  const totV=vC+vP; const totG=gC+gP;
  if (totV===0 || totG===0) return { coefCABA:'—', coefPBA:'—', iibbCABA:'—', iibbPBA:'—', resumen:'Sin datos suficientes.' };
  const cCaba=(vC/totV*0.5+gC/totG*0.5);
  const cPba=(vP/totV*0.5+gP/totG*0.5);
  const iibbC=total*cCaba*0.04;
  const iibbP=total*cPba*0.045;
  const iibbTotal=iibbC+iibbP;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const _insight={
    title:'Reparto de IIBB entre jurisdicciones',
    text:
      `Tu base se distribuye **${(cCaba*100).toFixed(1)}%** a CABA y **${(cPba*100).toFixed(1)}%** a PBA según el Convenio Multilateral. `+
      `Eso son **${fmt(iibbC)}** de Ingresos Brutos en CABA (4%) y **${fmt(iibbP)}** en PBA (4,5%): un total combinado de **${fmt(iibbTotal)}**.`,
    tone:'neutral' as const,
    icon:'🗺️',
  };
  const _chart=(iibbTotal>0)?{
    type:'doughnut' as const,
    slices:[
      {label:'IIBB CABA',value:Math.round(iibbC)},
      {label:'IIBB PBA',value:Math.round(iibbP)},
    ].filter((s)=>s.value>0),
    prefix:'$',
    centerValue:fmt(iibbTotal),
    centerLabel:'IIBB total',
    ariaLabel:'Composición del Ingresos Brutos total a pagar entre las jurisdicciones de CABA y Buenos Aires según el coeficiente unificado.',
  }:undefined;
  return { coefCABA:(cCaba*100).toFixed(1)+'%', coefPBA:(cPba*100).toFixed(1)+'%', iibbCABA:'$'+iibbC.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), iibbPBA:'$'+iibbP.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Coef CABA ${(cCaba*100).toFixed(1)}% · Coef PBA ${(cPba*100).toFixed(1)}%.`, _insight, _chart };
}
