import policy from '../data/football-policy.json';

export const FOOTBALL_BLOCKED_TERMS = [...policy.terms];
export const FOOTBALL_BLOCKED_CLUBS = [...policy.clubs];
const normalize = (value:unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const footballNameAllowed = (value:unknown) => {
  const name=normalize(value);
  return !FOOTBALL_BLOCKED_TERMS.some(term=>name.includes(term)) && !FOOTBALL_BLOCKED_CLUBS.some(club=>name.includes(club));
};
export const footballEventAllowed = (event:any) => {
  const competitors = event?.competitions?.[0]?.competitors || [];
  return competitors.length >= 2 && competitors.every((entry:any) =>
    footballNameAllowed(entry.team?.displayName) && footballNameAllowed(entry.team?.shortDisplayName),
  );
};

export const footballLeagueAllowed = (league:any) => ({
  ...league,
  events: (league?.events || []).filter(footballEventAllowed),
  groups: (league?.groups || []).map((group:any) => ({
    ...group,
    standings: {
      ...group.standings,
      entries: (group.standings?.entries || []).filter((entry:any) =>
        footballNameAllowed(entry.team?.displayName) && footballNameAllowed(entry.team?.shortDisplayName),
      ),
    },
  })),
});
