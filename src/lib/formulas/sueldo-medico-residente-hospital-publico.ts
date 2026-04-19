export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sueldoMedicoResidenteHospitalPublico(i: Inputs): Outputs {
  const a=String(i.anioResidencia||'r1'); const j=String(i.juridiccion||'caba');
  const base: Record<string,number> = { r1:780000, r2:880000, r3:980000, r4:1100000, r5:1200000 };
  const mult: Record<string,number> = { caba:1.0, pba:0.88, nac:0.95, interior:0.85 };
  const b=(base[a]||780000)*(mult[j]||1);
  const guardias=b*0.45;
  const neto=(b+guardias)*0.87;
  return { basico:'$'+b.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), guardias:'$'+guardias.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), neto:'$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${a.toUpperCase()} ${j.toUpperCase()}: básico ${b.toFixed(0)} + guardias = ${neto.toFixed(0)} neto.` };
}
