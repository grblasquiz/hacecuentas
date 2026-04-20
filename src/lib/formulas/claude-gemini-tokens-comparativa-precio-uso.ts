export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function claudeGeminiTokensComparativaPrecioUso(i: Inputs): Outputs {
  const m=String(i.modelo||'claude_sonnet'); const ti=Number(i.tokensEntrada)||0; const to=Number(i.tokensSalida)||0;
  const pricing={'claude_sonnet':[3,15,'200k'],'claude_opus':[15,75,'200k'],'gemini_pro':[3.5,10.5,'2M'],'gemini_ultra':[7,21,'1M'],'gpt_4o':[5,15,'128k']}[m];
  const total=ti*pricing[0]+to*pricing[1];
  const rec={'claude_sonnet':'Balance precio/calidad. Buena opción.','claude_opus':'Máxima calidad. Use cases complejos.','gemini_pro':'Mejor contexto largo (2M).','gemini_ultra':'Potente pero evaluar vs Claude Opus.','gpt_4o':'Buen multimodal. Ecosistema OpenAI.'}[m];
  return { costoMensualUsd:`USD ${total.toFixed(2)}`, contexto:pricing[2], recomendacion:rec };
}
