export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function idiomasMasUtilesProfesionInternacional(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const p=String(i.profesion||'tech');
  const tEs:Record<string,string>={tech:'Inglés, Mandarín, Alemán',negocios:'Inglés, Mandarín, Español',diplomatico:'Inglés, Francés, Árabe',salud:'Inglés, Español, Francés',academia:'Inglés, Alemán, Francés'};
  const tEn:Record<string,string>={tech:'English, Mandarin, German',negocios:'English, Mandarin, Spanish',diplomatico:'English, French, Arabic',salud:'English, Spanish, French',academia:'English, German, French'};
  const tPt:Record<string,string>={tech:'Inglês, Mandarim, Alemão',negocios:'Inglês, Mandarim, Espanhol',diplomatico:'Inglês, Francês, Árabe',salud:'Inglês, Espanhol, Francês',academia:'Inglês, Alemão, Francês'};
  const t = __lang === 'en' ? tEn : __lang === 'pt' ? tPt : tEs;
  const top = t[p] || t.tech;
  const resumen = __lang === 'en' ? `Profession ${p}: top languages are ${t[p]}.` : __lang === 'pt' ? `Profissão ${p}: os principais idiomas são ${t[p]}.` : `Profesión ${p}: top idiomas son ${t[p]}.`;
  return { top, resumen };
}
