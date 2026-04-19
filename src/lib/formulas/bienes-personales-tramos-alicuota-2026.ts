export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function bienesPersonalesTramosAlicuota2026(i: Inputs): Outputs {
  const p=Number(i.patrimonio)||0; const v=Number(i.vivienda)||0;
  const MNI=292000000; const VIV_EX=584000000;
  const vivExenta=Math.min(v,VIV_EX);
  const base=Math.max(0, p-vivExenta-MNI);
  let imp=0; let alic='0%';
  if (base>0) {
    if (base<=5000000000) { imp=base*0.005; alic='0.5%'; }
    else if (base<=10000000000) { imp=5000000000*0.005+(base-5000000000)*0.0075; alic='0.75%'; }
    else if (base<=20000000000) { imp=5000000000*0.005+5000000000*0.0075+(base-10000000000)*0.01; alic='1%'; }
    else { imp=5000000000*0.005+5000000000*0.0075+10000000000*0.01+(base-20000000000)*0.0125; alic='1.25%'; }
  }
  return { base:'$'+base.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), impuesto:'$'+imp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), alicuota:alic, resumen:`Patrimonio $${p.toLocaleString('es-AR')}: impuesto $${imp.toFixed(0)} (${alic}).` };
}
