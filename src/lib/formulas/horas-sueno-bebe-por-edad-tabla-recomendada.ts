export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasSuenoBebePorEdadTablaRecomendada(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  let h='',s='',n='';
  if(m<3){h='16-17 h';s='5+ siestas';n='4-5 h seguidas a veces'}
  else if(m<6){h='14-15 h';s='3-4 siestas';n='6-8 h noche ideal'}
  else if(m<12){h='14-15 h';s='2-3 siestas';n='10-12 h noche'}
  else if(m<24){h='12-14 h';s='1-2 siestas';n='10-12 h'}
  else {h='10-12 h';s='Siesta opcional';n='10-11 h'}
  const etapa = m<3?'recién nacido':m<6?'lactante':m<12?'bebé':m<24?'1-2 años':'2+ años';
  const _insight = {
    title: 'Sueño recomendado por edad',
    text: `A los **${m} meses** (${etapa}) la referencia es **${h} totales** al día, repartidas en **${s.toLowerCase()}** más el sueño nocturno (${n}). Son rangos orientativos: cada bebé tiene su ritmo y un pediatra es la mejor guía.`,
    tone: 'neutral' as const,
    icon: '👶',
  };
  return { horasDia:h, siestas:s, sueno:n, _insight };
}
