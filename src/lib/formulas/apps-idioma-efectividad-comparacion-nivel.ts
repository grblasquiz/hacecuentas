export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function appsIdiomaEfectividadComparacionNivel(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const n=String(i.nivel||'princ'); const o=String(i.objetivo||'vocab');
  const map:Record<string,Record<string,string>>={
    princ:{vocab:'Duolingo',gram:'Busuu',conv:'HelloTalk',pron:'Elsa Speak'},
    inter:{vocab:'Anki',gram:'Lingoda',conv:'iTalki',pron:'Pimsleur'},
    avan:{vocab:'Anki custom',gram:'Coach 1:1',conv:'iTalki Pro',pron:'Shadow coach'}
  };
  const r=map[n][o]||'—';
  const resumen = __lang === 'en' ? `${n} ${o}: recommended ${r}.` : __lang === 'pt' ? `${n} ${o}: recomendado ${r}.` : `${n} ${o}: recomendado ${r}.`;

  const nivelTxt: Record<string, Record<string, string>> = {
    es: { princ: 'principiante', inter: 'intermedio', avan: 'avanzado' },
    en: { princ: 'beginner', inter: 'intermediate', avan: 'advanced' },
    pt: { princ: 'iniciante', inter: 'intermediário', avan: 'avançado' },
  };
  const objetivoTxt: Record<string, Record<string, string>> = {
    es: { vocab: 'vocabulario', gram: 'gramática', conv: 'conversación', pron: 'pronunciación' },
    en: { vocab: 'vocabulary', gram: 'grammar', conv: 'conversation', pron: 'pronunciation' },
    pt: { vocab: 'vocabulário', gram: 'gramática', conv: 'conversação', pron: 'pronúncia' },
  };
  const nv = (nivelTxt[__lang] || nivelTxt.es)[n] || n;
  const ob = (objetivoTxt[__lang] || objetivoTxt.es)[o] || o;
  const insightTxt: Record<string, string> = {
    es: `Para tu nivel **${nv}** enfocado en **${ob}**, la app que mejor rinde es **${r}**. No la uses sola: combinala con práctica real (hablar o escribir) para que el progreso se fije.`,
    en: `For your **${nv}** level focused on **${ob}**, the app that performs best is **${r}**. Don't use it alone: pair it with real practice (speaking or writing) so progress sticks.`,
    pt: `Para o seu nível **${nv}** com foco em **${ob}**, o app que rende melhor é **${r}**. Não use sozinho: combine com prática real (falar ou escrever) para fixar o progresso.`,
  };
  const insightTitle: Record<string, string> = {
    es: 'App recomendada para tu objetivo',
    en: 'Recommended app for your goal',
    pt: 'App recomendado para o seu objetivo',
  };
  const _insight = {
    title: insightTitle[__lang] || insightTitle.es,
    text: insightTxt[__lang] || insightTxt.es,
    tone: 'good',
    icon: '📱',
  };

  return { recom:r, alter:'Busuu, Babbel, Preply', resumen, _insight };
}
