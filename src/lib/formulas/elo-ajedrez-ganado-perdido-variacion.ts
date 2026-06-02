export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function eloAjedrezGanadoPerdidoVariacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const ea=Number(i.eloActual)||0; const eo=Number(i.eloOponente)||0; const r=String(i.resultado||'gane'); const k=Number(i.kFactor)||20;
  const exp=1/(1+Math.pow(10,(eo-ea)/400));
  const resNum={'gane':1,'tabla':0.5,'perdi':0}[r];
  const delta=k*(resNum-exp);
  const nuevo=ea+delta;
  const expectativaStr = __lang === 'en'
    ? `${(exp*100).toFixed(0)}% chance of winning`
    : __lang === 'pt'
    ? `${(exp*100).toFixed(0)}% de chance de ganhar`
    : `${(exp*100).toFixed(0)}% de ganar`;
  const dR=Math.round(delta); const nR=Math.round(nuevo); const pct=(exp*100).toFixed(0);
  const favorito = exp >= 0.5;
  const T:any = {
    es: {
      title: 'Cómo te cambia el Elo',
      text: r==='perdi'
        ? `Perdiste ${favorito?`siendo favorito (**${pct}%** esperado)`:`contra un rival más fuerte (solo **${pct}%** esperado)`}, así que tu Elo baja **${dR}** puntos hasta **${nR}**.${favorito?' La derrota duele más justamente porque te daban como ganador.':' La caída es chica porque ya partías en desventaja.'}`
        : r==='tabla'
        ? `Empataste con un **${pct}%** de probabilidad de ganar; tu Elo ${dR>=0?'sube':'baja'} **${Math.abs(dR)}** hasta **${nR}**. ${favorito?'Empatar siendo favorito te resta, porque se esperaba la victoria.':'Para vos las tablas suman, porque el rival era más fuerte.'}`
        : `Ganaste ${favorito?`como favorito (**${pct}%** esperado)`:`siendo el underdog (solo **${pct}%** esperado)`}, sumás **+${dR}** puntos y llegás a **${nR}**.${!favorito?' El upset paga bien: por eso ganás tantos puntos.':''}`,
    },
    en: {
      title: 'How your Elo changes',
      text: r==='perdi'
        ? `You lost ${favorito?`as the favorite (**${pct}%** expected)`:`to a stronger opponent (only **${pct}%** expected)`}, so your Elo drops **${dR}** points to **${nR}**.${favorito?' The loss stings more precisely because you were favored.':' The drop is small because you were already the underdog.'}`
        : r==='tabla'
        ? `You drew with a **${pct}%** win probability; your Elo ${dR>=0?'rises':'falls'} **${Math.abs(dR)}** to **${nR}**. ${favorito?'Drawing as the favorite costs you, since a win was expected.':'A draw works in your favor here, since the opponent was stronger.'}`
        : `You won ${favorito?`as the favorite (**${pct}%** expected)`:`as the underdog (only **${pct}%** expected)`}, gaining **+${dR}** points to reach **${nR}**.${!favorito?' The upset pays off — that is why you gain so many points.':''}`,
    },
    pt: {
      title: 'Como seu Elo muda',
      text: r==='perdi'
        ? `Você perdeu ${favorito?`sendo favorito (**${pct}%** esperado)`:`para um adversário mais forte (apenas **${pct}%** esperado)`}, então seu Elo cai **${dR}** pontos para **${nR}**.${favorito?' A derrota dói mais justamente porque você era o favorito.':' A queda é pequena porque você já era o azarão.'}`
        : r==='tabla'
        ? `Você empatou com **${pct}%** de chance de ganhar; seu Elo ${dR>=0?'sobe':'cai'} **${Math.abs(dR)}** para **${nR}**. ${favorito?'Empatar como favorito custa pontos, pois esperava-se a vitória.':'O empate joga a seu favor aqui, pois o adversário era mais forte.'}`
        : `Você venceu ${favorito?`como favorito (**${pct}%** esperado)`:`como azarão (apenas **${pct}%** esperado)`}, ganhando **+${dR}** pontos e chegando a **${nR}**.${!favorito?' A zebra paga bem — por isso você ganha tantos pontos.':''}`,
    },
  };
  return {
    nuevoElo:`${nR}`, variacion:`${delta>=0?'+':''}${dR}`, expectativa:expectativaStr,
    _insight: {
      title: T[__lang].title,
      text: T[__lang].text,
      tone: dR > 0 ? 'good' : dR < 0 ? 'warn' : 'neutral',
      icon: '♟️',
    },
  };
}
