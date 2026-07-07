export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | Record<string, any> | undefined; _insight?: any; }
export function tiempoCrackearPasswordLongitud(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const l=Math.floor(Number(i.largo)||0); const cs=String(i.charset||'min');
  const sz:Record<string,number>={num:10,min:26,alnum:62,todo:95};
  const n=sz[cs]||26;
  const total=Math.pow(n,l);
  const seg=total/1e9;
  let txt:string;
  if (seg<60) txt=__lang==='en'?`${seg.toFixed(1)} sec`:`${seg.toFixed(1)} seg`;
  else if (seg<3600) txt=`${(seg/60).toFixed(1)} min`;
  else if (seg<86400) txt=__lang==='en'?`${(seg/3600).toFixed(1)} hours`:`${(seg/3600).toFixed(1)} horas`;
  else if (seg<86400*365) txt=__lang==='en'?`${(seg/86400).toFixed(1)} days`:`${(seg/86400).toFixed(1)} días`;
  else txt=__lang==='en'?`${(seg/(86400*365)).toExponential(2)} years`:`${(seg/(86400*365)).toExponential(2)} años`;
  // Insight dinámico según resistencia: <1 día = débil, <100 años = aceptable, más = fuerte
  const anios = seg / (86400 * 365);
  const tone = anios < 1 ? 'warn' : anios < 100 ? 'neutral' : 'good';
  const insightText = __lang === 'en'
    ? (anios < 1
        ? `A ${l}-character password (${cs}) falls in just **${txt}** at 1 billion guesses/sec. Add length and mix symbols to make it resist real attacks.`
        : anios < 100
          ? `**${txt}** to crack: decent, but a serious attacker with more hardware would still get there. Each extra character multiplies the time.`
          : `**${txt}** to crack at 1 billion guesses/sec — effectively unbreakable by brute force. Length is doing the heavy lifting here.`)
    : (anios < 1
        ? `Una contraseña de ${l} caracteres (${cs}) cae en apenas **${txt}** a mil millones de intentos/seg. Sumá largo y mezclá símbolos para que resista ataques reales.`
        : anios < 100
          ? `**${txt}** para crackearla: razonable, pero un atacante con más hardware igual llegaría. Cada carácter extra multiplica el tiempo.`
          : `**${txt}** para crackearla a mil millones de intentos/seg: prácticamente irrompible por fuerza bruta. El largo es lo que más pesa acá.`);
  return {
    intentos:total.toExponential(2),
    tiempo:txt,
    resumen:__lang==='en'?`Password length ${l} charset ${cs}: ${txt} at 1B/s.`:`Password largo ${l} charset ${cs}: ${txt} a 1B/s.`,
    _insight: {
      title: __lang === 'en' ? 'Password strength' : 'Fortaleza de la clave',
      text: insightText,
      tone,
      icon: '🔐',
    },
  };
}
