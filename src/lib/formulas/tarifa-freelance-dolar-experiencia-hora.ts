export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tarifaFreelanceDolarExperienciaHora(i: Inputs): Outputs {
  const a=Number(i.experienciaAnos)||0; const ar=String(i.area||'fullstack');
  const base=a<2?20:a<5?40:a<10?70:110;
  const mult={'frontend':1,'backend':1.1,'fullstack':1.15,'devops':1.3,'data':1.35,'design':1,'pm':1.2,'marketing':0.9}[ar];
  const rate=Math.round(base*mult);
  const rateMax=Math.round(rate*1.5);
  const mes=rate*160;
  return { rangoHora:`USD ${rate}-${rateMax}/h`, promedioMensual:`USD ${mes.toLocaleString('en-US')}/mes (160h)`, observacion:`${a} años en ${ar}: rango ${rate}-${rateMax} USD/h típico mercado internacional.` };
}
