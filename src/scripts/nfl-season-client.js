(() => {
  const root = document.querySelector('[data-nfl]');
  if (!root) return;

  const snapshotNode = document.querySelector('#nfl-season-snapshot');
  let snapshot = {};
  try { snapshot = JSON.parse(snapshotNode?.textContent || '{}'); } catch (_) {}

  const api = root.dataset.scoreboardApi;
  const standingsApi = root.dataset.standingsApi;
  const season = Number(snapshot.season || 2026);
  const WEEK_CACHE = 7 * 24 * 60 * 60 * 1000;
  const STANDINGS_CACHE = 6 * 60 * 60 * 1000;
  const GAME_DURATION = 4 * 60 * 60 * 1000;
  const RESULT_RETRY = 15 * 60 * 1000;
  const teamMeta = Object.fromEntries((snapshot.teams || []).map((team) => [team.abbr, team]));
  const readStore = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } };
  const writeStore = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const esc = (value = '') => String(value).replace(/[&<>\"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;' })[character]);
  const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(String(response.status));
    return response.json();
  };

  let games = snapshot.games || [];
  let finalResults = readStore(`hc-nfl-results-${season}-v1`) || {};
  let standings = readStore(`hc-nfl-standings-${season}-v1`)?.entries || snapshot.standings || [];
  const nextScheduled = games.find((game) => game.state !== 'post' && new Date(game.date) > new Date()) || games[0];
  let activeType = Number(nextScheduled?.seasonType || 1);
  let activeWeek = Number(nextScheduled?.week || 1);
  let activeConference = 'AFC';
  let timezone = readStore('hc-nfl-timezone-v1') || 'America/New_York';
  let resultTimer;

  const normalize = (event) => {
    const competition = event.competitions?.[0] || {};
    const competitors = competition.competitors || [];
    const away = competitors.find((team) => team.homeAway === 'away') || competitors[0] || {};
    const home = competitors.find((team) => team.homeAway === 'home') || competitors[1] || {};
    const final = competition.status?.type?.state === 'post';
    const team = (entry) => ({
      id: entry.team?.id || '', name: entry.team?.displayName || 'TBD', shortName: entry.team?.shortDisplayName || 'TBD',
      abbr: entry.team?.abbreviation || 'TBD', logo: entry.team?.logo || '', color: `#${entry.team?.color || '8ba39a'}`,
      score: final ? entry.score ?? null : null, record: entry.records?.find((record) => record.name === 'overall')?.summary || '',
    });
    const seasonType = Number(event.season?.type || activeType);
    return {
      id:event.id, date:event.date, seasonType, phase:seasonType === 1 ? 'Preseason' : seasonType === 3 ? 'Postseason' : 'Regular Season',
      week:Number(event.week?.number || activeWeek), weekLabel:seasonType === 1 && Number(event.week?.number) === 1 ? 'Hall of Fame' : `${seasonType === 1 ? 'Preseason ' : ''}Week ${event.week?.number || ''}`.trim(),
      state:final ? 'post' : 'pre', status:final ? competition.status?.type?.description || 'Final' : 'Scheduled', detail:final ? competition.status?.type?.detail || 'Final' : '',
      timeValid:competition.timeValid !== false, away:team(away), home:team(home), broadcasts:[...new Set((competition.broadcasts || []).flatMap((broadcast) => broadcast.names || []))],
      venue:competition.venue?.fullName || '', city:competition.venue?.address?.city || '', stateCode:competition.venue?.address?.state || '', country:competition.venue?.address?.country || 'USA',
      neutralSite:Boolean(competition.neutralSite), href:event.links?.find((link) => link.text === 'Gamecast')?.href || `https://www.espn.com/nfl/game/_/gameId/${event.id}`,
    };
  };
  const scheduleOnly = (game) => ({ ...game, state:'pre', status:'Scheduled', detail:'', away:{...game.away,score:null}, home:{...game.home,score:null} });
  const seedFinals = (items) => {
    let changed = false;
    for (const game of items || []) if (game.state === 'post' && !finalResults[game.id]) { finalResults[game.id] = game; changed = true; }
    if (changed) writeStore(`hc-nfl-results-${season}-v1`, finalResults);
    return changed;
  };
  seedFinals(games);
  games = games.map(scheduleOnly);

  const mergedGames = () => games.map((game) => finalResults[game.id] || game).sort((a, b) => new Date(a.date) - new Date(b.date));
  const format = (iso, options) => new Intl.DateTimeFormat('en-US', { timeZone:timezone === 'local' ? undefined : timezone, ...options }).format(new Date(iso));
  const gameDate = (game) => format(game.date, { weekday:'short', month:'short', day:'numeric' });
  const gameTime = (game) => game.timeValid === false ? 'TBD' : format(game.date, { hour:'numeric', minute:'2-digit' });
  const timeZoneLabel = () => timezone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ') : ({'America/New_York':'ET','America/Chicago':'CT','America/Denver':'MT','America/Los_Angeles':'PT','Europe/London':'UK'})[timezone] || timezone;
  const phaseLabel = (type) => type === 1 ? 'Preseason' : type === 3 ? 'Playoffs' : 'Regular season';
  const weekEntries = (type) => snapshot.calendar?.find((phase) => Number(phase.value) === Number(type))?.entries || [];
  const selectedGames = () => mergedGames().filter((game) => Number(game.seasonType) === activeType && Number(game.week) === activeWeek);
  const statusText = () => {
    const now = Date.now();
    const first = Math.min(...games.map((game) => new Date(game.date).getTime()));
    if (now < first) return 'SCHEDULE RELEASED';
    if (mergedGames().some((game) => game.state === 'pre' && now >= new Date(game.date).getTime() && now < new Date(game.date).getTime() + GAME_DURATION)) return 'GAMES IN PROGRESS';
    return 'SEASON UPDATED';
  };

  const gameCard = (game) => {
    const final = game.state === 'post';
    const location = [game.venue, game.city, game.stateCode].filter(Boolean).join(' · ');
    return `<a class="game-card" href="${esc(game.href)}" target="_blank" rel="noopener"><div class="game-meta"><span>${final ? 'FINAL' : `${gameDate(game)} · ${gameTime(game)} ${timeZoneLabel()}`}</span><b>${esc(game.broadcasts?.join(' · ') || 'TV TBD')}</b></div><div class="matchup"><div><img src="${esc(game.away.logo)}" alt=""/><span><strong>${esc(game.away.shortName)}</strong><small>${esc(game.away.record || 'Away')}</small></span><em>${final ? esc(game.away.score) : ''}</em></div><div><img src="${esc(game.home.logo)}" alt=""/><span><strong>${esc(game.home.shortName)}</strong><small>${esc(game.home.record || 'Home')}</small></span><em>${final ? esc(game.home.score) : ''}</em></div></div><footer><span>${esc(location || 'Venue TBD')}</span><b>${final ? 'Game recap' : 'Matchup details'} →</b></footer></a>`;
  };

  const renderHero = () => {
    const all = mergedGames();
    const upcoming = all.filter((game) => game.state !== 'post' && new Date(game.date) > new Date());
    const featured = upcoming[0] || [...all].reverse().find((game) => game.state === 'post');
    if (!featured) return;
    const final = featured.state === 'post';
    root.querySelector('[data-season-status]').textContent = statusText();
    root.querySelector('[data-featured]').innerHTML = `<div class="spotlight-kicker"><span>${final ? 'LATEST FINAL' : 'NEXT KICKOFF'}</span><b>${esc(featured.weekLabel)}</b></div><div class="spotlight-teams"><div><img src="${esc(featured.away.logo)}" alt=""/><strong>${esc(featured.away.abbr)}</strong><em>${final ? esc(featured.away.score) : '—'}</em></div><i>@</i><div><img src="${esc(featured.home.logo)}" alt=""/><strong>${esc(featured.home.abbr)}</strong><em>${final ? esc(featured.home.score) : '—'}</em></div></div><div class="spotlight-details"><b>${final ? 'Final' : `${gameDate(featured)} · ${gameTime(featured)} ${timeZoneLabel()}`}</b><span>${esc(featured.broadcasts?.join(' · ') || 'TV TBD')} · ${esc(featured.venue || 'Venue TBD')}</span></div><a href="${esc(featured.href)}" target="_blank" rel="noopener">${final ? 'View recap' : 'Game details'} <b>→</b></a>`;
    const next = root.querySelector('[data-upcoming]');
    next.innerHTML = upcoming.slice(1, 4).map((game) => `<a href="${esc(game.href)}" target="_blank" rel="noopener"><span><img src="${esc(game.away.logo)}" alt=""/>${esc(game.away.abbr)} <i>at</i> <img src="${esc(game.home.logo)}" alt=""/>${esc(game.home.abbr)}</span><b>${gameDate(game)}<small>${gameTime(game)} ${timeZoneLabel()}</small></b></a>`).join('') || '<p>The next slate will appear here as soon as it is confirmed.</p>';
  };

  const renderScheduleControls = () => {
    root.querySelector('[data-phase-tabs]').innerHTML = [1,2,3].map((type) => `<button type="button" data-phase="${type}" class="${type === activeType ? 'active' : ''}" aria-pressed="${type === activeType}">${phaseLabel(type)}</button>`).join('');
    const entries = weekEntries(activeType);
    const select = root.querySelector('[data-week-select]');
    select.innerHTML = entries.length ? entries.map((entry) => `<option value="${entry.value}" ${Number(entry.value) === activeWeek ? 'selected' : ''}>${esc(entry.label)} · ${esc(entry.detail || '')}</option>`).join('') : '<option value="1">Schedule pending</option>';
    root.querySelector('[data-tz-label]').textContent = `Times shown in ${timeZoneLabel()}`;
    root.querySelector('[data-phase-tabs]').querySelectorAll('[data-phase]').forEach((button) => button.addEventListener('click', async () => {
      activeType = Number(button.dataset.phase);
      activeWeek = Number(weekEntries(activeType)[0]?.value || 1);
      await loadWeek(activeType, activeWeek);
      render();
      refreshResults();
    }));
    select.onchange = async () => {
      activeWeek = Number(select.value);
      await loadWeek(activeType, activeWeek);
      render();
      refreshResults();
    };
  };

  const renderSchedule = () => {
    const entries = weekEntries(activeType);
    const entry = entries.find((item) => Number(item.value) === activeWeek);
    const items = selectedGames();
    root.querySelector('[data-week-label]').innerHTML = `<span>${esc(entry?.label || phaseLabel(activeType))}</span><b>${esc(entry?.detail || '')}</b>`;
    root.querySelector('[data-game-list]').innerHTML = items.length ? items.map(gameCard).join('') : '<div class="empty-week"><strong>Matchups are not set yet.</strong><span>The postseason bracket will populate when the NFL confirms each game.</span></div>';
  };

  const renderStandings = () => {
    root.querySelector('[data-conference-tabs]').innerHTML = ['AFC','NFC'].map((conference) => `<button type="button" class="${conference === activeConference ? 'active' : ''}" data-conference="${conference}" aria-pressed="${conference === activeConference}">${conference}</button>`).join('');
    const divisions = ['East','North','South','West'];
    root.querySelector('[data-standings]').innerHTML = divisions.map((division) => {
      const live = standings.filter((team) => team.conference === activeConference && team.division === division);
      const fallback = (snapshot.teams || []).filter((team) => team.conference === activeConference && team.division === division).map((team) => ({...team,wins:0,losses:0,ties:0,pct:'.000'}));
      const rows = (live.length ? live : fallback).sort((a,b) => Number(a.rank || 99) - Number(b.rank || 99) || a.name.localeCompare(b.name));
      return `<section class="division"><header><span>${activeConference}</span><h3>${division}</h3></header><div class="standing-head"><span>Team</span><b>W</b><b>L</b><b>T</b><b>PCT</b></div>${rows.map((team) => `<a href="https://www.espn.com/nfl/team/_/name/${esc(team.abbr.toLowerCase())}" target="_blank" rel="noopener"><span><img src="${esc(team.logo)}" alt=""/>${esc(team.shortName || team.name)}</span><b>${team.wins ?? 0}</b><b>${team.losses ?? 0}</b><b>${team.ties ?? 0}</b><b>${esc(team.pct ?? '.000')}</b></a>`).join('')}</section>`;
    }).join('');
    root.querySelector('[data-conference-tabs]').querySelectorAll('[data-conference]').forEach((button) => button.addEventListener('click', () => { activeConference = button.dataset.conference; renderStandings(); }));
  };

  const render = () => {
    renderHero();
    renderScheduleControls();
    renderSchedule();
    renderStandings();
  };

  const loadWeek = async (type, week, force = false) => {
    const key = `hc-nfl-week-${season}-${type}-${week}-v1`;
    const cached = readStore(key);
    if (!force && cached?.fetchedAt && Date.now() - cached.fetchedAt < WEEK_CACHE && Array.isArray(cached.games)) {
      const ids = new Set(cached.games.map((game) => game.id));
      games = [...games.filter((game) => !ids.has(game.id)), ...cached.games].sort((a,b) => new Date(a.date) - new Date(b.date));
      return cached.games;
    }
    try {
      const payload = await fetchJson(`${api}?dates=${season}&seasontype=${type}&week=${week}&limit=100`);
      const fresh = (payload.events || []).map(normalize);
      seedFinals(fresh);
      const ids = new Set(fresh.map((game) => game.id));
      games = [...games.filter((game) => !ids.has(game.id)), ...fresh.map(scheduleOnly)].sort((a,b) => new Date(a.date) - new Date(b.date));
      writeStore(key, { fetchedAt:Date.now(), games:fresh.map(scheduleOnly) });
      return fresh;
    } catch (_) { return selectedGames(); }
  };

  const normalizeStandings = (payload) => (payload.children || []).flatMap((conference) => (conference.standings?.entries || []).map((entry, index) => {
    const stat = (name, fallback = 0) => { const item = entry.stats?.find((value) => value.name === name); return item?.displayValue ?? item?.value ?? fallback; };
    const abbr = entry.team?.abbreviation || '';
    const meta = teamMeta[abbr] || {};
    return { rank:Number(stat('playoffSeed',index+1)),conference:conference.abbreviation || meta.conference,division:meta.division,team:entry.team?.displayName || meta.name,shortName:entry.team?.shortDisplayName || meta.shortName,abbr,logo:entry.team?.logos?.[0]?.href || meta.logo,wins:Number(stat('wins')),losses:Number(stat('losses')),ties:Number(stat('ties')),pct:String(stat('winPercent','.000')) };
  }));
  const loadStandings = async (force = false) => {
    const key = `hc-nfl-standings-${season}-v1`;
    const cached = readStore(key);
    if (!force && cached?.fetchedAt && Date.now() - cached.fetchedAt < STANDINGS_CACHE) { standings = cached.entries || standings; return; }
    try {
      const entries = normalizeStandings(await fetchJson(standingsApi));
      if (entries.length) { standings = entries; writeStore(key, {fetchedAt:Date.now(),entries}); renderStandings(); }
    } catch (_) {}
  };

  const planResultCheck = () => {
    clearTimeout(resultTimer);
    const pending = selectedGames().filter((game) => game.state !== 'post');
    const nextAt = Math.min(...pending.map((game) => new Date(game.date).getTime() + GAME_DURATION));
    if (!Number.isFinite(nextAt)) return;
    resultTimer = setTimeout(refreshResults, nextAt <= Date.now() ? RESULT_RETRY : nextAt - Date.now());
  };
  const refreshResults = async () => {
    const due = selectedGames().filter((game) => game.state !== 'post' && Date.now() >= new Date(game.date).getTime() + GAME_DURATION);
    if (!due.length) { planResultCheck(); return; }
    root.querySelector('[data-season-status]').textContent = 'CHECKING FINAL SCORES';
    const before = Object.keys(finalResults).length;
    await loadWeek(activeType, activeWeek, true);
    const changed = Object.keys(finalResults).length > before;
    render();
    if (changed) await loadStandings(true);
    planResultCheck();
  };

  const timezoneSelect = root.querySelector('[data-timezone]');
  timezoneSelect.value = timezone;
  timezoneSelect.addEventListener('change', () => { timezone = timezoneSelect.value; writeStore('hc-nfl-timezone-v1', timezone); render(); });

  render();
  loadWeek(activeType, activeWeek).then(() => { render(); refreshResults(); });
  loadStandings();
})();
