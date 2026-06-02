export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined | { [k: string]: any }; _insight?: any; }
export function itbaUtdtCostoCarreraAnualPrivada(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      anios_label: (anios: number) => `${anios} años`,
      beca: 'Becas mérito 20-50%. Info en sitio univ.',
      insight_title: 'Costo total de la carrera',
      insight_text: (anual: string, total: string, anios: number) =>
        `Cursar esta carrera cuesta **USD ${anual}** por año y suma **USD ${total}** en los **${anios} años** de duración. Una beca por mérito (20-50%) puede bajar bastante ese total.`,
    },
    en: {
      anios_label: (anios: number) => `${anios} years`,
      beca: 'Merit scholarships 20-50%. Info on univ. website.',
      insight_title: 'Total cost of the degree',
      insight_text: (anual: string, total: string, anios: number) =>
        `This degree costs **USD ${anual}** per year, adding up to **USD ${total}** over its **${anios} years**. A merit scholarship (20-50%) can lower that total significantly.`,
    },
  } as const)[__lang];
  const u=String(i.universidad||'itba'); const c=String(i.carrera||'ingenieria');
  const base={'itba':12000,'utdt':10000,'udesa':14000,'austral':12000,'uca':6500,'ucema':8500}[u];
  const mult={'ingenieria':1.1,'economia':1,'derecho':1,'medicina':1.3,'administracion':1}[c];
  const anual=base*mult;
  const anios={'medicina':6,'ingenieria':5,'derecho':5,'economia':4,'administracion':4}[c];
  const total=anual*anios;
  const anualFmt=Math.round(anual).toLocaleString('en-US');
  const totalFmt=Math.round(total).toLocaleString('en-US');
  const _insight={ title:T.insight_title, text:T.insight_text(anualFmt,totalFmt,anios), tone:'neutral' as const, icon:'🎓' };
  return { costoAnual:`USD ${anualFmt}`, costoCarrera:`USD ${totalFmt} (${T.anios_label(anios)})`, beca:T.beca, _insight };
}
