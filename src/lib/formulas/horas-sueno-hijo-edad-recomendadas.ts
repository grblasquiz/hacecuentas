export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasSuenoHijoEdadRecomendadas(i: Inputs): Outputs {
  const e=Number(i.edad)||0;
  let h:string; let s:string; let etapa:string;
  if (e<1) { h='12-17h'; s='3-4 siestas'; etapa='bebé'; }
  else if (e<3) { h='11-14h'; s='1-2 siestas'; etapa='niño pequeño'; }
  else if (e<6) { h='10-13h'; s='1 siesta opcional'; etapa='preescolar'; }
  else if (e<14) { h='9-11h'; s='Sin siesta'; etapa='edad escolar'; }
  else { h='8-10h'; s='Sin siesta'; etapa='adolescente'; }
  const _insight = {
    title: 'Sueño recomendado por edad',
    text: `A los **${e} años** (${etapa}) la referencia es dormir **${h}** por día (${s.toLowerCase()}). Son rangos orientativos de las guías de sueño infantil: lo importante es que tu hijo se despierte descansado y de buen humor.`,
    tone: 'neutral' as const,
    icon: '🛌',
  };
  return { horas:h, siestas:s, resumen:`Edad ${e}: ${h}, ${s}.`, _insight };
}
