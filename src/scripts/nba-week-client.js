(() => {
  const root = document.querySelector('[data-nba]');
  if (!root) return;

  const api = root.dataset.api;
  const summerApi = root.dataset.summerApi;
  const standingsApi = root.dataset.standingsApi;
  const GAME_DURATION = 165 * 60 * 1000;
  const RESULT_RETRY = 15 * 60 * 1000;
  const AR = 'America/Argentina/Buenos_Aires';
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  root.querySelector('[data-today]').textContent = today.charAt(0).toUpperCase() + today.slice(1);

  const esc = (value = '') => String(value).replace(/[&<>\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' })[character]);
  const time = (iso) => new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
  const dateKey = (value) => new Intl.DateTimeFormat('en-CA', { timeZone: AR, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
  const currentWeek = () => {
    const key = dateKey(new Date());
    const cursor = new Date(`${key}T12:00:00Z`);
    cursor.setUTCDate(cursor.getUTCDate() - ((cursor.getUTCDay() + 6) % 7));
    const start = cursor.toISOString().slice(0, 10);
    cursor.setUTCDate(cursor.getUTCDate() + 6);
    const end = cursor.toISOString().slice(0, 10);
    return { start, end, range: `${start.replaceAll('-', '')}-${end.replaceAll('-', '')}` };
  };
  const week = currentWeek();
  const snapshot = (() => {
    try { return JSON.parse(document.querySelector('#nba-week-snapshot')?.textContent || '{}'); }
    catch (_) { return {}; }
  })();
  const readStore = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (_) { return null; }
  };
  const writeStore = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (_) {}
  };
  const scheduleKey = `hc-nba-week-schedule-v2:${week.start}`;
  const resultsKey = `hc-nba-week-results-v2:${week.start}`;
  let finalResults = readStore(resultsKey) || {};
  let scheduleGames = [];
  let activeDate = dateKey(new Date());
  let resultTimer;

  const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(String(response.status));
    return response.json();
  };
  const norm = (event, league = 'NBA') => {
    const competition = event.competitions?.[0] || {};
    const teams = competition.competitors || [];
    const away = teams.find((team) => team.homeAway === 'away') || teams[0] || {};
    const home = teams.find((team) => team.homeAway === 'home') || teams[1] || {};
    const final = competition.status?.type?.state === 'post';
    const team = (entry) => ({
      name: entry.team?.displayName || 'Por confirmar',
      abbr: entry.team?.abbreviation || '—',
      score: final ? entry.score ?? null : null,
      logo: entry.team?.logo || '',
    });
    return {
      id: event.id,
      league,
      date: event.date,
      state: final ? 'post' : 'pre',
      status: final ? competition.status?.type?.name || 'Final' : 'Programado',
      detail: final ? competition.status?.type?.detail || 'Final' : '',
      away: team(away),
      home: team(home),
      venue: competition.venue?.fullName || '',
      href: event.links?.find((link) => link.text === 'Gamecast')?.href || `https://www.espn.com/nba/game/_/gameId/${event.id}`,
    };
  };
  const scheduleOnly = (game) => ({
    ...game,
    state: 'pre',
    status: 'Programado',
    detail: '',
    away: { ...game.away, score: null },
    home: { ...game.home, score: null },
  });
  const seedGames = (games) => {
    const clean = [];
    for (const game of games || []) {
      if (game.state === 'post') finalResults[game.id] = game;
      clean.push(scheduleOnly(game));
    }
    writeStore(resultsKey, finalResults);
    return clean;
  };
  const dedupe = (games) => games
    .filter((game, index, all) => all.findIndex((item) => item.id === game.id) === index)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const fetchWeekSchedule = async () => {
    const [regular, summer] = await Promise.all([
      fetchJson(`${api}?dates=${week.range}&limit=200`),
      fetchJson(`${summerApi}?dates=${week.range}&limit=200`),
    ]);
    const games = dedupe([
      ...(regular.events || []).map((event) => norm(event, 'NBA')),
      ...(summer.events || []).map((event) => norm(event, 'Summer League')),
    ]);
    const schedule = seedGames(games);
    writeStore(scheduleKey, schedule);
    return schedule;
  };
  const loadSchedule = async () => {
    const cached = readStore(scheduleKey);
    if (Array.isArray(cached)) return cached;
    if (snapshot.weekStart === week.start && Array.isArray(snapshot.games)) {
      const schedule = seedGames(snapshot.games);
      writeStore(scheduleKey, schedule);
      return schedule;
    }
    return fetchWeekSchedule();
  };
  const mergedGames = () => scheduleGames
    .map((game) => finalResults[game.id] || game)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const relativeDay = (iso) => dateKey(iso) === dateKey(new Date())
    ? 'Hoy'
    : new Intl.DateTimeFormat('es-AR', { timeZone: AR, weekday: 'short', day: 'numeric' }).format(new Date(iso)).replace('.', '');
  const fullDay = (key) => new Intl.DateTimeFormat('es-AR', { timeZone: AR, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${key}T12:00:00Z`));
  const shortWeekday = (key) => new Intl.DateTimeFormat('es-AR', { timeZone: AR, weekday: 'short' }).format(new Date(`${key}T12:00:00Z`)).replace('.', '');
  const gameUrl = (game) => `<a href="${esc(game.href)}" target="_blank" rel="noopener">`;
  const gameMoment = (game) => game.state === 'post' ? 'FINAL' : Date.now() >= new Date(game.date).getTime() ? 'EN CURSO' : time(game.date);
  const renderRow = (game) => `${gameUrl(game)}<span class="schedule-row"><span>${gameMoment(game)}<small>${esc(game.league)} · ${game.state === 'post' ? esc(game.detail || 'Finalizado') : Date.now() >= new Date(game.date).getTime() ? 'Resultado al finalizar' : 'Programado'}</small></span><b><img src="${esc(game.away.logo)}" alt=""/>${esc(game.away.name)}</b><strong>${game.state === 'post' ? `${esc(game.away.score)} <i>—</i> ${esc(game.home.score)}` : '<i>vs</i>'}</strong><b><img src="${esc(game.home.logo)}" alt=""/>${esc(game.home.name)}</b><em>${game.state === 'post' ? 'Ver resultado' : 'Ver previa'} ›</em></span></a>`;

  const renderWeek = (games) => {
    const calendar = root.querySelector('[data-schedule]');
    const dates = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(`${week.start}T12:00:00Z`);
      day.setUTCDate(day.getUTCDate() + index);
      return day.toISOString().slice(0, 10);
    });
    if (!dates.includes(activeDate)) activeDate = dates[0];
    calendar.innerHTML = `<div class="week-tabs" role="tablist" aria-label="Fechas de la semana">${dates.map((key) => {
      const count = games.filter((game) => dateKey(game.date) === key).length;
      return `<button type="button" role="tab" aria-selected="${key === activeDate}" class="${key === activeDate ? 'active' : ''}" data-week-day="${key}"><small>${shortWeekday(key)}</small><strong>${key.slice(-2)}</strong><em>${count} ${count === 1 ? 'partido' : 'partidos'}</em></button>`;
    }).join('')}</div><div class="week-panels">${dates.map((key) => {
      const dayGames = games.filter((game) => dateKey(game.date) === key);
      return `<section class="week-panel" data-week-panel="${key}" ${key === activeDate ? '' : 'hidden'}><header><h3>${fullDay(key)}</h3><span>${dayGames.length} ${dayGames.length === 1 ? 'partido' : 'partidos'}</span></header>${dayGames.length ? dayGames.map(renderRow).join('') : '<div class="empty-schedule"><strong>Sin partidos en esta fecha.</strong><span>Elegí otro día de la semana.</span></div>'}</section>`;
    }).join('')}</div>`;
    calendar.querySelectorAll('[data-week-day]').forEach((button) => button.addEventListener('click', () => {
      activeDate = button.dataset.weekDay;
      calendar.querySelectorAll('[data-week-day]').forEach((item) => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-selected', String(selected));
      });
      calendar.querySelectorAll('[data-week-panel]').forEach((panel) => { panel.hidden = panel.dataset.weekPanel !== activeDate; });
    }));
  };

  const render = () => {
    const games = mergedGames();
    const nextGame = games.find((game) => game.state === 'pre' && new Date(game.date) > new Date());
    const featured = nextGame || [...games].reverse().find((game) => game.state === 'post');
    const upcoming = games.filter((game) => game.state === 'pre' && new Date(game.date) > new Date()).slice(0, 3);
    root.querySelector('[data-status]').textContent = 'SEMANA ACTUALIZADA';
    if (featured) {
      const final = featured.state === 'post';
      root.querySelector('[data-primary-game]').innerHTML = `<div class="game-tag"><span>${final ? 'ÚLTIMO RESULTADO' : 'PRÓXIMO PARTIDO'}</span><b>${esc(featured.league)} · ${final ? esc(featured.detail || 'Final') : `${relativeDay(featured.date)}, ${time(featured.date)}`}</b></div><div class="duel"><div class="team"><img src="${esc(featured.away.logo)}" alt=""/><strong>${esc(featured.away.name)}</strong><em>${final ? esc(featured.away.score) : '—'}</em></div><div class="middle"><span>${time(featured.date)}</span><b>${final ? 'FINAL' : 'VS'}</b></div><div class="team"><img src="${esc(featured.home.logo)}" alt=""/><strong>${esc(featured.home.name)}</strong><em>${final ? esc(featured.home.score) : '—'}</em></div></div>${gameUrl(featured)}<span class="orange-button">${final ? 'Ver resultado' : 'Ver previa'} <b>›</b></span></a>`;
    }
    const next = root.querySelector('[data-upcoming]');
    next.innerHTML = upcoming.length
      ? upcoming.map((game) => `${gameUrl(game)}<span class="next-row"><b>${relativeDay(game.date)}<small>${time(game.date)}</small></b><span><img src="${esc(game.away.logo)}" alt=""/>${esc(game.away.abbr)} <small>vs</small> <img src="${esc(game.home.logo)}" alt=""/>${esc(game.home.abbr)}</span><i>›</i></span></a>`).join('')
      : '<p class="muted">No quedan partidos programados esta semana.</p>';
    renderWeek(games);
  };

  const renderStandings = (payload) => {
    const west = (payload.children || []).find((group) => group.abbreviation === 'West' || group.name === 'Western Conference');
    const entries = (west?.standings?.entries || []).map((entry) => {
      const stat = (name) => entry.stats?.find((item) => item.name === name);
      return {
        rank: stat('playoffSeed')?.value || stat('rank')?.value || 0,
        team: entry.team?.displayName || '',
        abbr: entry.team?.abbreviation || '',
        logo: entry.team?.logos?.[0]?.href || '',
        wins: stat('wins')?.value || 0,
        losses: stat('losses')?.value || 0,
        pct: stat('winPercent')?.displayValue || '—',
      };
    }).sort((a, b) => a.rank - b.rank).slice(0, 8);
    const table = root.querySelector('[data-standings]');
    if (table && entries.length) table.innerHTML = entries.map((team) => `<a href="https://www.espn.com/nba/team/_/name/${esc(team.abbr.toLowerCase())}" target="_blank" rel="noopener" class="standing"><b>${esc(team.rank)}</b><span><img src="${esc(team.logo)}" alt=""/>${esc(team.team)}</span><em>${Number(team.wins) + Number(team.losses)}</em><em>${esc(team.wins)}</em><em>${esc(team.pct)}</em></a>`).join('');
  };

  const planResultCheck = () => {
    clearTimeout(resultTimer);
    const pending = scheduleGames.filter((game) => !finalResults[game.id]);
    const nextAt = Math.min(...pending.map((game) => new Date(game.date).getTime() + GAME_DURATION));
    if (Number.isFinite(nextAt)) resultTimer = setTimeout(refreshResults, Math.max(nextAt - Date.now(), RESULT_RETRY));
  };
  const refreshResults = async () => {
    const due = scheduleGames.filter((game) => !finalResults[game.id] && Date.now() >= new Date(game.date).getTime() + GAME_DURATION);
    if (!due.length) { planResultCheck(); return; }
    root.querySelector('[data-status]').textContent = 'ACTUALIZANDO RESULTADOS';
    try {
      const days = [...new Set(due.map((game) => dateKey(game.date)))];
      const payloads = await Promise.all(days.flatMap((key) => [
        fetchJson(`${api}?dates=${key.replaceAll('-', '')}`),
        fetchJson(`${summerApi}?dates=${key.replaceAll('-', '')}`),
      ]));
      const finals = payloads.flatMap((payload, index) => (payload.events || []).map((event) => norm(event, index % 2 === 0 ? 'NBA' : 'Summer League'))).filter((game) => game.state === 'post');
      let changed = false;
      for (const game of finals) {
        if (due.some((item) => item.id === game.id) && !finalResults[game.id]) {
          finalResults[game.id] = game;
          changed = true;
        }
      }
      if (changed) {
        writeStore(resultsKey, finalResults);
        render();
        fetchJson(standingsApi).then(renderStandings).catch(() => {});
      } else {
        root.querySelector('[data-status]').textContent = 'ESPERANDO RESULTADOS';
      }
    } catch (_) {
      root.querySelector('[data-status]').textContent = 'ÚLTIMO SNAPSHOT';
    }
    planResultCheck();
  };
  const hydrate = async () => {
    try {
      scheduleGames = dedupe(await loadSchedule());
      render();
      refreshResults();
    } catch (_) {
      scheduleGames = seedGames(snapshot.games || []);
      render();
      root.querySelector('[data-status]').textContent = 'ÚLTIMO SNAPSHOT';
      planResultCheck();
    }
  };

  hydrate();
  root.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', () => {
    root.querySelectorAll('.nav-links a').forEach((item) => item.classList.toggle('active', item === link));
  }));
})();
