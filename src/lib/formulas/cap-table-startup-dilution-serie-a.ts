export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function capTableStartupDilutionSerieA(i: Inputs): Outputs {
  const pre=Number(i.equityPreRound)||0; const inv=Number(i.porcentajeInversor)||0;
  const post=pre*(1-inv/100);
  const dil=pre-post;
  return { equityPost:`${post.toFixed(1)}%`, dilucion:`-${dil.toFixed(1)}pp (${((dil/pre)*100).toFixed(0)}%)`, observacion:`Inversor tomó ${inv}%, diluíste proporcionalmente. Post: ${post.toFixed(1)}%.` };
}
