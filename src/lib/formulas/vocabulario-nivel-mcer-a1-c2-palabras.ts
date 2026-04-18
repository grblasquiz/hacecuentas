export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vocabularioNivelMcerA1C2Palabras(i: Inputs): Outputs {
  const n=String(i.nivel||'a1');
  const v:Record<string,[number,number]>={a1:[500,1000],a2:[1000,2000],b1:[2000,4000],b2:[4000,8000],c1:[8000,12000],c2:[16000,20000]};
  const [act,pas]=v[n]||v.a1;
  return { palabras:act.toLocaleString(), pasivas:pas.toLocaleString(), resumen:`${n.toUpperCase()}: ${act} activas, ${pas} pasivas.` };
}
