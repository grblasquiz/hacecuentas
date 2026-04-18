export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function etapasDueloPerdidaFamiliarMeses(i: Inputs): Outputs {
  const t=String(i.tipoPerdida||'esperada');
  const d:Record<string,[string,string]>={esperada:['6-12 meses','Normal si intensidad decrece'],subita:['12-18 meses','Shock prolongado puede requerir ayuda'],ninez:['Años con reevaluación en etapas'+'','Acompañar en hitos vitales']};
  const [dur,al]=d[t]||d.esperada;
  return { etapas:'Negación, ira, negociación, depresión, aceptación', duracion:dur, alerta:al, resumen:`${t}: ${dur}. ${al}.` };
}
