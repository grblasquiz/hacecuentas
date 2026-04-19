export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function deduccionAlquilerGanancias40Porciento(i: Inputs): Outputs {
  const a=Number(i.alquilerMensual)||0; const mni=Number(i.mniActual)||21000000;
  const anualBruto=a*12*0.4;
  const anual=Math.min(anualBruto,mni);
  const mensual=anual/12;
  return { deduccionAnual:'$'+anual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), dedMensual:'$'+mensual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Alquiler $${a}/mes: deducción anual $${anual.toFixed(0)} (40%, con tope MNI).` };
}
