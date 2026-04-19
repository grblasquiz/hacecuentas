export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function prestamoAnsesJubiladoArgentaMonto(i: Inputs): Outputs {
  const h=Number(i.haberMensual)||0; const p=Number(i.plazo)||24;
  const cuotaMax=h*0.30;
  const tnaMensual=0.55/12;
  const maxPrest=cuotaMax*(1-Math.pow(1+tnaMensual,-p))/tnaMensual;
  return { maximoPrestable:'$'+maxPrest.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), cuotaEstim:'$'+cuotaMax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Haber $${h.toLocaleString('es-AR')}, ${p} cuotas: máx $${maxPrest.toFixed(0)} prestable.` };
}
