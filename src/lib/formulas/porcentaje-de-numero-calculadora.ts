export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: any; }
export function porcentajeDeNumeroCalculadora(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const modo=String(i.modo||'deN'); const x=Number(i.x)||0; const n=Number(i.n)||0;
  const T = {
    title: __lang==='en' ? 'Your result' : __lang==='pt' ? 'Seu resultado' : 'Tu resultado',
  };
  if (modo==='deN') {
    const res = (n*x/100).toFixed(2);
    return {
      resultado:res,
      resumen: __lang==='en' ? `${x}% of ${n} = ${res}.` : __lang==='pt' ? `${x}% de ${n} = ${res}.` : `${x}% de ${n} = ${res}.`,
      _insight: {
        title: T.title,
        text: __lang==='en' ? `**${x}%** of **${n}** is **${res}**.` : __lang==='pt' ? `**${x}%** de **${n}** é **${res}**.` : `El **${x}%** de **${n}** es **${res}**.`,
        tone: 'neutral',
        icon: '🔢',
      },
    };
  }
  if (n===0) return { resultado:'—', resumen: __lang==='en' ? 'B cannot be 0.' : __lang==='pt' ? 'B não pode ser 0.' : 'B no puede ser 0.' };
  const pct = (x/n*100).toFixed(2);
  return {
    resultado:`${pct} %`,
    resumen: __lang==='en' ? `${x} is ${pct}% of ${n}.` : __lang==='pt' ? `${x} é ${pct}% de ${n}.` : `${x} es ${pct}% de ${n}.`,
    _insight: {
      title: T.title,
      text: __lang==='en' ? `**${x}** is **${pct}%** of **${n}**.` : __lang==='pt' ? `**${x}** é **${pct}%** de **${n}**.` : `**${x}** es el **${pct}%** de **${n}**.`,
      tone: 'neutral',
      icon: '🔢',
    },
  };
}
