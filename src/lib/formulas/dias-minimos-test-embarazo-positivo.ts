export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function diasMinimosTestEmbarazoPositivo(i: Inputs): Outputs {
  const f=String(i.fum||''); const c=Number(i.cicloDias)||28;
  if (!f) return { proxRegla:'—', testFiable:'—', betaHcg:'—', resumen:'Ingresá FUM.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { proxRegla:'—', testFiable:'—', betaHcg:'—', resumen:'Fecha inválida.' };
  const prox=new Date(d.getTime()+c*86400000);
  const testOk=new Date(prox.getTime()-0);
  const beta=new Date(d.getTime()+(c-14+9)*86400000);
  return { proxRegla:prox.toISOString().slice(0,10), testFiable:testOk.toISOString().slice(0,10)+' (orina)', betaHcg:beta.toISOString().slice(0,10)+' (sangre)', resumen:`Test orina confiable: ${testOk.toISOString().slice(0,10)}. Beta: desde ${beta.toISOString().slice(0,10)}.` };
}
