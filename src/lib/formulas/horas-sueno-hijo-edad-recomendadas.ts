export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasSuenoHijoEdadRecomendadas(i: Inputs): Outputs {
  const e=Number(i.edad)||0;
  let h:string; let s:string; let etapa:string;
  // NSF / AASM 2024 — rangos recomendados por etapa
  if (e<0.25)       { h='14-17h'; s='Múltiples siestas'; etapa='recién nacido (0-3 meses)'; }
  else if (e<1)     { h='12-15h'; s='2-3 siestas'; etapa='lactante (4-11 meses)'; }
  else if (e<3)     { h='11-14h'; s='1 siesta'; etapa='niño pequeño (1-2 años)'; }
  else if (e<6)     { h='10-13h'; s='Siesta opcional'; etapa='preescolar (3-5 años)'; }
  else if (e<14)    { h='9-11h';  s='Sin siesta'; etapa='escolar (6-13 años)'; }
  else if (e<18)    { h='8-10h';  s='Sin siesta'; etapa='adolescente (14-17 años)'; }
  else if (e<26)    { h='7-9h';   s='Power-nap opcional'; etapa='adulto joven (18-25 años)'; }
  else if (e<65)    { h='7-9h';   s='Power-nap opcional'; etapa='adulto (26-64 años)'; }
  else              { h='7-8h';   s='Power-nap frecuente'; etapa='adulto mayor (65+)'; }

  const _insight = {
    title: 'Sueño recomendado por edad',
    text: `A los **${e} años** (${etapa}) la referencia es dormir **${h}** por día (${s.toLowerCase()}). Son rangos de las guías NSF/AASM internacionalmente adoptadas: lo importante es que se despierte descansado y de buen humor.`,
    tone: 'neutral' as const,
    icon: '🛌',
  };
  return { horas:h, siestas:s, resumen:`${etapa}: ${h}, ${s}.`, _insight };
}
