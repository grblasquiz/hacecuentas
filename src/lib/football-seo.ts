const normalize=(value:unknown)=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const SEARCH_NAMES:Record<string,string>={
  'gimnasia lp':'Gimnasia y Esgrima',
  'gimnasia la plata':'Gimnasia y Esgrima',
  'club de gimnasia y esgrima la plata':'Gimnasia y Esgrima',
  'union (sf)':'Unión',
  'union de santa fe':'Unión',
  'club atletico union':'Unión',
  'newells old boys':"Newell's Old Boys",
  'central cordoba (se)':'Central Córdoba',
  'estudiantes lp':'Estudiantes de La Plata',
  'argentinos juniors':'Argentinos Juniors',
};
export const footballTeamSearchName=(entry:any)=>{
  const candidates=[entry?.team?.displayName,entry?.team?.shortDisplayName,entry?.team?.name].filter(Boolean);
  for(const candidate of candidates){const mapped=SEARCH_NAMES[normalize(candidate)];if(mapped)return mapped}
  return candidates[0]||'Equipo';
};
export const footballMatchName=(event:any)=>{
  const entries=event.competitions?.[0]?.competitors||[];
  const home=entries.find((x:any)=>x.homeAway==='home')||entries[0];
  const away=entries.find((x:any)=>x.homeAway==='away')||entries[1];
  return `${footballTeamSearchName(home)} - ${footballTeamSearchName(away)}`;
};
export const footballMatchFragment=(event:any)=>`partido-${footballMatchName(event).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${event.id}`;
export const footballSportsEvent=(event:any,country:string,url:string)=>{
  const entries=event.competitions?.[0]?.competitors||[];
  const home=entries.find((x:any)=>x.homeAway==='home')||entries[0];
  const away=entries.find((x:any)=>x.homeAway==='away')||entries[1];
  const status=event.competitions?.[0]?.status?.type;
  return {'@type':'SportsEvent',name:footballMatchName(event),startDate:event.date,eventStatus:status?.completed||status?.state==='post'?'https://schema.org/EventCompleted':status?.state==='in'?'https://schema.org/EventInProgress':'https://schema.org/EventScheduled',homeTeam:{'@type':'SportsTeam',name:footballTeamSearchName(home)},awayTeam:{'@type':'SportsTeam',name:footballTeamSearchName(away)},location:{'@type':'Place',name:country},url:`${url}#${footballMatchFragment(event)}`};
};
