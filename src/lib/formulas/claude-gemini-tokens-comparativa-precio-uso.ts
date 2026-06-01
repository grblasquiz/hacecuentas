export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
  return { costoMensualUsd:`USD ${total.toFixed(2)}`, contexto:pricing[2], recomendacion:rec };
}
