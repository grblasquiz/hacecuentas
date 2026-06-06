export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function claudeGeminiTokensComparativaPrecioUso(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const m=String(i.modelo||'claude_sonnet'); const ti=Number(i.tokensEntrada)||0; const to=Number(i.tokensSalida)||0;
  const pricing={'claude_sonnet':[3,15,'1M'],'claude_opus':[5,25,'1M'],'gemini_pro':[1.25,10,'1M'],'gemini_flash':[0.3,2.5,'1M'],'gpt_4o':[2.5,10,'128k']}[m];
  const total=ti*pricing[0]+to*pricing[1];
  const rec = __lang === 'en'
    ? {'claude_sonnet':'Best price/quality balance for production. Great default.','claude_opus':'Top reasoning. Worth it only for complex, high-stakes tasks.','gemini_pro':'Cheapest input ($1.25/MTok) of the premium tier.','gemini_flash':'Cheapest overall. Ideal for high-volume, simpler tasks.','gpt_4o':'Legacy model. Good multimodal + OpenAI ecosystem.'}[m]
    : __lang === 'pt'
    ? {'claude_sonnet':'Melhor equilíbrio preço/qualidade para produção. Ótimo padrão.','claude_opus':'Raciocínio máximo. Vale só para tarefas complexas e críticas.','gemini_pro':'Entrada mais barata ($1,25/MTok) do tier premium.','gemini_flash':'Mais barato no geral. Ideal para alto volume e tarefas simples.','gpt_4o':'Modelo legado. Bom multimodal + ecossistema OpenAI.'}[m]
    : {'claude_sonnet':'Mejor balance precio/calidad para producción. Buen default.','claude_opus':'Máximo razonamiento. Conviene solo en tareas complejas y críticas.','gemini_pro':'Entrada más barata ($1,25/MTok) del tier premium.','gemini_flash':'El más barato en general. Ideal para alto volumen y tareas simples.','gpt_4o':'Modelo legado. Buen multimodal + ecosistema OpenAI.'}[m];

  const modelLabel={'claude_sonnet':'Claude Sonnet','claude_opus':'Claude Opus','gemini_pro':'Gemini Pro','gemini_flash':'Gemini Flash','gpt_4o':'GPT-4o'}[m] || m;
  const costInput=ti*pricing[0];
  const costOutput=to*pricing[1];
  const pctOut=total>0?(costOutput/total)*100:0;
  const usd=(n:number)=>`US$${n.toFixed(2)}`;
  const T = {
    es: {
      title: 'Costo y contexto',
      text: `Con **${modelLabel}**, esta carga sale **${usd(total)}**, y el **${Math.round(pctOut)}%** lo aporta la salida (que se cobra más cara que la entrada). Ventana de contexto: **${pricing[2]} tokens**.`,
      slIn: 'Entrada', slOut: 'Salida', center: 'Costo',
      aria: `Costo total ${usd(total)}: entrada ${usd(costInput)} y salida ${usd(costOutput)}.`,
    },
    en: {
      title: 'Cost and context',
      text: `With **${modelLabel}**, this workload costs **${usd(total)}**, and **${Math.round(pctOut)}%** comes from output (priced higher than input). Context window: **${pricing[2]} tokens**.`,
      slIn: 'Input', slOut: 'Output', center: 'Cost',
      aria: `Total cost ${usd(total)}: input ${usd(costInput)} and output ${usd(costOutput)}.`,
    },
    pt: {
      title: 'Custo e contexto',
      text: `Com **${modelLabel}**, esta carga custa **${usd(total)}**, e **${Math.round(pctOut)}%** vem da saída (mais cara que a entrada). Janela de contexto: **${pricing[2]} tokens**.`,
      slIn: 'Entrada', slOut: 'Saída', center: 'Custo',
      aria: `Custo total ${usd(total)}: entrada ${usd(costInput)} e saída ${usd(costOutput)}.`,
    },
  }[__lang];

  const _insight = { title: T.title, text: T.text, tone: 'neutral', icon: '🤖' };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: T.slIn, value: Math.round(costInput * 100) / 100 },
      { label: T.slOut, value: Math.round(costOutput * 100) / 100 },
    ].filter(s => s.value > 0),
    prefix: 'US$',
    centerValue: usd(total),
    centerLabel: T.center,
    ariaLabel: T.aria,
  };

  return { costoMensualUsd:`USD ${total.toFixed(2)}`, contexto:pricing[2], recomendacion:rec, _insight, _chart };
}
