export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
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
  return { recom:r, alter:'Busuu, Babbel, Preply', resumen };
}
