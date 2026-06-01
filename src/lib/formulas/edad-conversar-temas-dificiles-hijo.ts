export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function edadConversarTemasDificilesHijo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t=String(i.tema||'sexo');
  const g:Record<string,{es:[string,string],en:[string,string]}>={
    sexo:{es:['Desde 3 años (partes del cuerpo)','Información progresiva honesta'],en:['From age 3 (body parts)','Progressive, honest information']},
    muerte:{es:['Desde 4 años','Palabras claras, no eufemismos confusos'],en:['From age 4','Clear words, no confusing euphemisms']},
    drogas:{es:['Desde 8-10 años','Prevención y factores riesgo'],en:['From age 8-10','Prevention and risk factors']},
    divorcio:{es:['Apenas decidido','Juntos, no culpabilizar al niño'],en:['As soon as decided','Together, do not blame the child']},
    redes:{es:['Antes de abrir cuentas','Privacidad y límites claros'],en:['Before opening accounts','Privacy and clear boundaries']},
  };
  const entry=g[t]||g.sexo;
  const [e,en]=entry[__lang];
  return { edad:e, enfoque:en, resumen:`${t}: ${e}. ${en}.` };
}
