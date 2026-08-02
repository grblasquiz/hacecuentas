const terms = ['independiente','diablo','diablos','diabo','diabos','demonio','demonios','demon','demons','devil','devils','satan','satanas','lucifer'];
const clubs = ['manchester united','toluca','america de cali','nublense','crawley town','kaiserslautern','piratas'];
const normalize = (value:unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const footballNameAllowed = (value:unknown) => {
  const name=normalize(value);
  return !terms.some(term=>name.includes(term)) && !clubs.some(club=>name.includes(club));
};
export const footballEventAllowed = (event:any) => (event.competitions?.[0]?.competitors || []).every((entry:any)=>footballNameAllowed(entry.team?.displayName) && footballNameAllowed(entry.team?.shortDisplayName));
