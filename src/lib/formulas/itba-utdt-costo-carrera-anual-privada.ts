export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function itbaUtdtCostoCarreraAnualPrivada(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      anios_label: (anios: number) => `${anios} años`,
      beca: 'Becas mérito 20-50%. Info en sitio univ.',
    },
    en: {
      anios_label: (anios: number) => `${anios} years`,
      beca: 'Merit scholarships 20-50%. Info on univ. website.',
    },
  } as const)[__lang];
  const u=String(i.universidad||'itba'); const c=String(i.carrera||'ingenieria');
  const base={'itba':12000,'utdt':10000,'udesa':14000,'austral':12000,'uca':6500,'ucema':8500}[u];
  const mult={'ingenieria':1.1,'economia':1,'derecho':1,'medicina':1.3,'administracion':1}[c];
  const anual=base*mult;
  const anios={'medicina':6,'ingenieria':5,'derecho':5,'economia':4,'administracion':4}[c];
  const total=anual*anios;
  return { costoAnual:`USD ${Math.round(anual).toLocaleString('en-US')}`, costoCarrera:`USD ${Math.round(total).toLocaleString('en-US')} (${T.anios_label(anios)})`, beca:T.beca };
}
