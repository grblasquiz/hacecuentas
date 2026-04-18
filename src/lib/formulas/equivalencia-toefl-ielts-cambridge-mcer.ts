export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function equivalenciaToeflIeltsCambridgeMcer(i: Inputs): Outputs {
  const e=String(i.examen||'toefl'); const s=Number(i.score)||0;
  let toefl=0, ielts=0, cam='', mcer='';
  if (e==='toefl') { toefl=s; ielts=s>=100?7.5:s>=80?6.5:s>=60?5.5:4.5; cam=s>=100?'CAE':s>=80?'FCE':'PET'; mcer=s>=100?'C1':s>=80?'B2':s>=60?'B1':'A2'; }
  else if (e==='ielts') { ielts=s; toefl=Math.round(s*14.3); cam=s>=7.5?'CAE':s>=5.5?'FCE':'PET'; mcer=s>=7.5?'C1':s>=5.5?'B2':s>=4?'B1':'A2'; }
  else { cam=s.toString(); toefl=100; ielts=7; mcer='C1'; }
  return { toefl:toefl.toString(), ielts:ielts.toString(), cambridge:cam, mcer, resumen:`${e} ${s} ≈ MCER ${mcer}.` };
}
