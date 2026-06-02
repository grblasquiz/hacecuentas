export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function claudeGeminiTokensComparativaPrecioUso(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const m=String(i.modelo||'claude_sonnet'); const ti=Number(i.tokensEntrada)||0; const to=Number(i.tokensSalida)||0;
  const pricing={'claude_sonnet':[3,15,'200k'],'claude_opus':[15,75,'200k'],'gemini_pro':[3.5,10.5,'2M'],'gemini_ultra':[7,21,'1M'],'gpt_4o':[5,15,'128k']}[m];
  const total=ti*pricing[0]+to*pricing[1];
  const rec = __lang === 'en'
    ? {'claude_sonnet':'Price/quality balance. Great general option.','claude_opus':'Top quality. Best for complex use cases.','gemini_pro':'Best long context (2M).','gemini_ultra':'Powerful but compare against Claude Opus.','gpt_4o':'Good multimodal. OpenAI ecosystem.'}[m]
    : __lang === 'pt'
    ? {'claude_sonnet':'Equilíbrio preço/qualidade. Boa opção geral.','claude_opus':'Máxima qualidade. Ideal para casos complexos.','gemini_pro':'Melhor contexto longo (2M).','gemini_ultra':'Poderoso, mas compare com Claude Opus.','gpt_4o':'Bom multimodal. Ecossistema OpenAI.'}[m]
    : {'claude_sonnet':'Balance precio/calidad. Buena opción.','claude_opus':'Máxima calidad. Use cases complejos.','gemini_pro':'Mejor contexto largo (2M).','gemini_ultra':'Potente pero evaluar vs Claude Opus.','gpt_4o':'Buen multimodal. Ecosistema OpenAI.'}[m];

  const modelLabel={'claude_sonnet':'Claude Sonnet','claude_opus':'Claude Opus','gemini_pro':'Gemini Pro','gemini_ultra':'Gemini Ultra','gpt_4o':'GPT-4o'}[m] || m;
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
