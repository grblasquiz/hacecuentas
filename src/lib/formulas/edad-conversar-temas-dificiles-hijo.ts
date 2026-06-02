export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
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

  const _insight = {
    title: __lang === 'en' ? 'How to approach it' : 'Cómo encararlo',
    text: __lang === 'en'
      ? `For the topic **${t}**, the recommended window is **${e}**. The key is not a single talk but an open, ongoing conversation adapted to your child's questions: **${en}**.`
      : `Para el tema **${t}**, la ventana recomendada es **${e}**. La clave no es una única charla sino una conversación abierta y sostenida en el tiempo, adaptada a las preguntas de tu hijo/a: **${en}**.`,
    tone: 'neutral',
    icon: '🗣️',
  };

  return { edad:e, enfoque:en, resumen:`${t}: ${e}. ${en}.`, _insight };
}
