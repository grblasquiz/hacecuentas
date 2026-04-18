export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function idiomasMasUtilesProfesionInternacional(i: Inputs): Outputs {
  const p=String(i.profesion||'tech');
  const t:Record<string,string>={tech:'Inglés, Mandarín, Alemán',negocios:'Inglés, Mandarín, Español',diplomatico:'Inglés, Francés, Árabe',salud:'Inglés, Español, Francés',academia:'Inglés, Alemán, Francés'};
  return { top:t[p]||t.tech, resumen:`Profesión ${p}: top idiomas son ${t[p]}.` };
}
