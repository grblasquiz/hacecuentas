export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function gananciasAguinaldoSacRetencion(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoMensual)||0;
  const sac=s*0.5;
  const anualSinSac=s*13;
  const base=anualSinSac*0.85;
  const gan=Math.max(0,(base-21000000)*0.27);
  return { sacSemestral:'$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), retencionAnual:'$'+gan.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Bruto $${s}: SAC $${sac.toFixed(0)} c/u, Ganancias anuales ~$${gan.toFixed(0)}.` };
}
