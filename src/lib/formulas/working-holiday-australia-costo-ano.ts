export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function workingHolidayAustraliaCostoAno(i: Inputs): Outputs {
  const m=Number(i.mesesPlan)||12;
  const visa=500; const savings=5000; const boletoVuelta=1500;
  const viviendaInicial=2000;
  const tot=visa+savings+boletoVuelta+viviendaInicial;
  return { costoInicial:`AUD ${tot.toLocaleString('en-US')}`, visaAud:`AUD 500`, buffer:`AUD 3000-5000 adicional recomendado por contingencias.` };
}
