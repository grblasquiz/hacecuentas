export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vocabularioNivelMcerA1C2Palabras(i: Inputs): Outputs {
  const n=String(i.nivel||'a1');
  const v:Record<string,[number,number]>={a1:[500,1000],a2:[1000,2000],b1:[2000,4000],b2:[4000,8000],c1:[8000,12000],c2:[16000,20000]};
  const [act,pas]=v[n]||v.a1;
  const NU=n.toUpperCase();
  const ctx:Record<string,string>={a1:'arrancás a entender frases simples', a2:'manejás temas cotidianos', b1:'sostenés una conversación general', b2:'usás el idioma con fluidez', c1:'dominás registros y matices', c2:'nivel cercano al nativo culto'};
  const _insight = {
    title: `Vocabulario en ${NU}`,
    text: `En **${NU}** se manejan unas **${act.toLocaleString()}** palabras activas (las que usás al hablar) y **${pas.toLocaleString()}** pasivas (las que reconocés al leer): ${ctx[n]||ctx.a1}.`,
    tone: 'neutral',
    icon: '📖',
  };
  return { palabras:act.toLocaleString(), pasivas:pas.toLocaleString(), resumen:`${NU}: ${act} activas, ${pas} pasivas.`, _insight };
}
