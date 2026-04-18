export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function edadConversarTemasDificilesHijo(i: Inputs): Outputs {
  const t=String(i.tema||'sexo');
  const g:Record<string,[string,string]>={sexo:['Desde 3 años (partes del cuerpo)','Información progresiva honesta'],muerte:['Desde 4 años','Palabras claras, no eufemismos confusos'],drogas:['Desde 8-10 años','Prevención y factores riesgo'],divorcio:['Apenas decidido','Juntos, no culpabilizar al niño'],redes:['Antes de abrir cuentas','Privacidad y límites claros']};
  const [e,en]=g[t]||g.sexo;
  return { edad:e, enfoque:en, resumen:`${t}: ${e}. ${en}.` };
}
