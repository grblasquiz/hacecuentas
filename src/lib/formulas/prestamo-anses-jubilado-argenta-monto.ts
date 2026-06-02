export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function prestamoAnsesJubiladoArgentaMonto(i: Inputs): Outputs {
  const h=Number(i.haberMensual)||0; const p=Number(i.plazo)||24;
  const cuotaMax=h*0.30;
  const tnaMensual=0.55/12;
  const maxPrest=cuotaMax*(1-Math.pow(1+tnaMensual,-p))/tnaMensual;
  const fmt=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const insight={
    title:'Qué significa tu resultado',
    text:`Con un haber de **$${h.toLocaleString('es-AR')}**, ANSES limita la cuota al 30% (**$${fmt(cuotaMax)}/mes**), así que podés tomar hasta **$${fmt(maxPrest)}** en ${p} cuotas. Ojo: a una TNA del **55%**, el total a devolver supera con holgura el monto prestado.`,
    tone:'warn',
    icon:'🏦',
  };
  return { maximoPrestable:'$'+fmt(maxPrest), cuotaEstim:'$'+fmt(cuotaMax), resumen:`Haber $${h.toLocaleString('es-AR')}, ${p} cuotas: máx $${maxPrest.toFixed(0)} prestable.`, _insight:insight };
}
