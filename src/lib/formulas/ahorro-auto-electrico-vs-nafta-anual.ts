export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ahorroAutoElectricoVsNaftaAnual(i: Inputs): Outputs {
  const km=Number(i.km)||0; const ev=Number(i.evKwh)||18; const n=Number(i.nkm)||12; const pe=Number(i.pElec)||0.15; const pn=Number(i.pNafta)||1.2;
  const evC=km*ev/100*pe; const nC=km/n*pn;
  return { evCosto:`$${evC.toFixed(0)}`, nCosto:`$${nC.toFixed(0)}`, ahorro:`$${(nC-evC).toFixed(0)}`, resumen:`EV $${evC.toFixed(0)}/año vs Nafta $${nC.toFixed(0)} → ahorro $${(nC-evC).toFixed(0)}.` };
}
