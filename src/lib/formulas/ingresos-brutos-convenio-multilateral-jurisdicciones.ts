export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
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
  return { coefCABA:(cCaba*100).toFixed(1)+'%', coefPBA:(cPba*100).toFixed(1)+'%', iibbCABA:'$'+iibbC.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), iibbPBA:'$'+iibbP.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Coef CABA ${(cCaba*100).toFixed(1)}% · Coef PBA ${(cPba*100).toFixed(1)}%.` };
}
