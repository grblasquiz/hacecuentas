export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function upworkFreelancerComisionNetaArgentina(i: Inputs): Outputs {
  const b=Number(i.brutoHora)||0; const h=Number(i.horasMes)||0; const p=String(i.plataforma||'upwork');
  const comRates={'upwork':0.1,'freelancer':0.1,'toptal':0,'fiverr':0.2,'direct':0};
  const bruto=b*h; const comision=bruto*comRates[p]; const neto=bruto-comision;
  return { netoMensual:`USD ${Math.round(neto).toLocaleString('en-US')}`, comision:`USD ${Math.round(comision).toLocaleString('en-US')} (${(comRates[p]*100).toFixed(0)}%)`, observacion:p==='toptal'?'Toptal: no te cobra comisión directa.':`Neto USD ${Math.round(neto).toLocaleString('en-US')}/mes.` };
}
