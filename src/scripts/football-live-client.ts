import { footballEventAllowed, footballNameAllowed } from '../lib/football-policy';
import { footballMatchFragment, footballTeamSearchName } from '../lib/football-seo';

type FootballEvent = any;

const copy = {
  es: {
    live: 'EN VIVO', final: 'Final', today: 'Partidos de hoy', recent: 'Resultados recientes',
    emptyToday: 'No hay partidos programados hoy en estas categorías.',
    emptyUpcoming: 'El próximo cronograma todavía no fue publicado.',
    refresh: 'Actualizar', refreshing: 'Actualizando…', updated: 'Actualizado', stale: 'Datos desactualizados',
    team: 'Equipo', group: 'Grupo', matches: 'partidos', noNext: 'No hay un próximo partido publicado.',
    agenda: 'Ver agenda →', highZone: 'Zona alta', record: 'G-E-P: ganados, empatados, perdidos',
  },
  pt: {
    live: 'AO VIVO', final: 'Final', today: 'Jogos de hoje', recent: 'Resultados recentes',
    emptyToday: 'Não há jogos programados hoje nestas categorias.',
    emptyUpcoming: 'O próximo calendário ainda não foi publicado.',
    refresh: 'Atualizar', refreshing: 'Atualizando…', updated: 'Atualizado', stale: 'Dados desatualizados',
    team: 'Time', group: 'Grupo', matches: 'jogos', noNext: 'Não há próximo jogo publicado.',
    agenda: 'Ver agenda →', highZone: 'Zona alta', record: 'V-E-D: vitórias, empates, derrotas',
  },
  en: {
    live: 'LIVE', final: 'Final', today: "Today's matches", recent: 'Recent results',
    emptyToday: 'No matches are scheduled today in these competitions.',
    emptyUpcoming: 'The next schedule has not been published yet.',
    refresh: 'Refresh', refreshing: 'Refreshing…', updated: 'Updated', stale: 'Stale data',
    team: 'Team', group: 'Group', matches: 'matches', noNext: 'No upcoming match published.',
    agenda: 'View schedule →', highZone: 'Top zone', record: 'W-D-L: wins, draws, losses',
  },
} as const;

const esc = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char] || char));

const langOf = (root: HTMLElement) => (root.dataset.language === 'pt' || root.dataset.language === 'en' ? root.dataset.language : 'es');
const dateKey = (value: string | Date, timeZone: string) => new Intl.DateTimeFormat('en-CA', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date(value));
const hour = (value: string, locale: string, timeZone: string) => new Intl.DateTimeFormat(locale, {
  timeZone, hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(value));
const day = (value: string, locale: string, timeZone: string) => new Intl.DateTimeFormat(locale, {
  timeZone, weekday: 'short', day: '2-digit', month: 'short',
}).format(new Date(value)).replace('.', '');
const stat = (entry: any, name: string) => entry?.stats?.find((item: any) => item.name === name)?.displayValue || '0';
const sides = (event: FootballEvent) => event.competitions?.[0]?.competitors || [];
const statusOf = (event: FootballEvent) => event.competitions?.[0]?.status;
const isLive = (event: FootballEvent) => statusOf(event)?.type?.state === 'in';
const isDone = (event: FootballEvent) => Boolean(statusOf(event)?.type?.completed || statusOf(event)?.type?.state === 'post');

function languageLocale(root: HTMLElement) {
  return root.dataset.locale || (langOf(root) === 'en' ? 'en-GB' : langOf(root) === 'pt' ? 'pt-BR' : 'es-AR');
}

function leaguesFor(root: HTMLElement, data: any) {
  let names: string[] = [];
  try { names = JSON.parse(root.dataset.leagues || '[]'); } catch { names = []; }
  if (data.first || data.national) {
    return [data.first, data.national].filter(Boolean).map((league, index) => ({ ...league, league: names[index] || (index === 0 ? 'Primera' : 'Nacional') }));
  }
  return (data.leagues || []).map((league: any, index: number) => ({ ...league, league: names[index] || league.code || 'Liga' }));
}

function allEvents(root: HTMLElement, data: any) {
  return leaguesFor(root, data)
    .flatMap((league: any) => (league.events || []).filter(footballEventAllowed).map((event: any) => ({ ...event, league: league.league })))
    .sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date));
}

function renderMatch(event: FootballEvent, root: HTMLElement, showDay: boolean) {
  const language = copy[langOf(root)];
  const locale = languageLocale(root);
  const timeZone = root.dataset.timeZone || 'America/Argentina/Buenos_Aires';
  const teams = sides(event);
  const home = teams.find((team: any) => team.homeAway === 'home') || teams[0];
  const away = teams.find((team: any) => team.homeAway === 'away') || teams[1];
  const live = isLive(event);
  const done = isDone(event);
  const state = live ? `${language.live} · ${statusOf(event)?.displayClock || ''}` : done ? language.final : showDay ? `${day(event.date, locale, timeZone)} · ${hour(event.date, locale, timeZone)}` : hour(event.date, locale, timeZone);
  const team = (entry: any) => `<div class="team"><span class="crest" aria-hidden="true"><span>⚽</span>${entry?.team?.logo ? `<img src="${esc(entry.team.logo)}" alt="" width="29" height="29" loading="lazy" onerror="this.remove()">` : ''}</span><strong>${esc(footballTeamSearchName(entry))}</strong><b>${done || live ? esc(entry?.score) : '—'}</b></div>`;
  const name = `${footballTeamSearchName(home)} - ${footballTeamSearchName(away)}`;
  return `<article id="${esc(footballMatchFragment(event))}" data-match-id="${esc(event.id)}" class="match${live ? ' liveMatch' : ''}"><h3 class="matchName">${esc(name)}</h3><div class="matchTop"><span class="league">${esc(event.league)}</span><span class="state${live ? ' live' : done ? ' final' : ''}">${esc(state)}</span></div>${team(home)}${team(away)}</article>`;
}

function renderMatches(target: Element | null, events: FootballEvent[], root: HTMLElement, showDay: boolean, empty: string) {
  if (!target) return;
  target.innerHTML = events.length ? events.map((event) => renderMatch(event, root, showDay)).join('') : `<div class="empty">${esc(empty)}</div>`;
}

function renderTables(target: Element | null, leagues: any[], root: HTMLElement) {
  if (!target) return;
  const language = copy[langOf(root)];
  target.innerHTML = leagues.flatMap((league: any) => (league.groups || []).map((group: any, groupIndex: number) => {
    const title = group.name || `${language.group} ${groupIndex + 1}`;
    const entries = (group.standings?.entries || []).filter((entry: any) => footballNameAllowed(entry.team?.displayName) && footballNameAllowed(entry.team?.shortDisplayName));
    return `<article class="table tableCard"><h3>${esc(league.league || '')}${league.league ? ' · ' : ''}${esc(title.replace('Group', language.group).replace('Zona', language.group))}</h3><div class="tableWrap"><table><thead><tr><th>#</th><th>${language.team}</th><th>PJ</th><th>G-E-P</th><th>DG</th><th>PTS</th></tr></thead><tbody>${entries.map((entry: any, index: number) => {
      const rank = stat(entry, 'rank') || String(index + 1);
      const record = stat(entry, 'overall') || `${stat(entry, 'wins')}-${stat(entry, 'ties')}-${stat(entry, 'losses')}`;
      const logo = entry.team?.logos?.[0]?.href || entry.team?.logo;
      return `<tr><td><span class="rank${Number(rank) <= 4 ? ' top' : ''}">${esc(rank)}</span></td><td><div class="club"><span class="crest small" aria-hidden="true"><span>⚽</span>${logo ? `<img src="${esc(logo)}" alt="" width="23" height="23" loading="lazy" onerror="this.remove()">` : ''}</span><span>${esc(footballTeamSearchName({ team: entry.team }))}</span></div></td><td>${esc(stat(entry, 'gamesPlayed'))}</td><td>${esc(record)}</td><td>${esc(stat(entry, 'pointDifferential'))}</td><td><strong>${esc(stat(entry, 'points'))}</strong></td></tr>`;
    }).join('')}</tbody></table></div></article>`;
  })).join('');
}

function renderNext(root: HTMLElement, events: FootballEvent[]) {
  const target = root.querySelector('[data-football-next]');
  if (!target) return;
  const language = copy[langOf(root)];
  const locale = languageLocale(root);
  const timeZone = root.dataset.timeZone || 'America/Argentina/Buenos_Aires';
  const today = dateKey(new Date(), timeZone);
  const next = events.find((event) => isLive(event)) || events.find((event) => dateKey(event.date, timeZone) === today && !isDone(event)) || events.find((event) => dateKey(event.date, timeZone) > today);
  if (!next) {
    target.innerHTML = `<div><span class="nextLabel">${esc(language.today)}</span><strong>${esc(language.noNext)}</strong></div><a href="#proximos">${esc(language.agenda)}</a>`;
    return;
  }
  const teams = sides(next);
  const home = teams.find((team: any) => team.homeAway === 'home') || teams[0];
  const away = teams.find((team: any) => team.homeAway === 'away') || teams[1];
  const currentLabel = isLive(next) ? `${language.live} · ${statusOf(next)?.displayClock || ''}` : `${day(next.date, locale, timeZone)} · ${hour(next.date, locale, timeZone)}`;
  target.innerHTML = `<div><span class="nextLabel">${esc(next.league)} · ${esc(currentLabel)}</span><strong>${esc(footballTeamSearchName(home))} <i>vs.</i> ${esc(footballTeamSearchName(away))}</strong><small>${isLive(next) ? esc(language.live) : esc(language.agenda)}</small></div><a href="#proximos">${esc(language.agenda)}</a>`;
}

function updateFreshness(root: HTMLElement, fetchedAt: string, error = false) {
  const language = copy[langOf(root)];
  const targets = root.querySelectorAll<HTMLElement>('[data-football-freshness-text]');
  const locale = languageLocale(root);
  const timeZone = root.dataset.timeZone || 'America/Argentina/Buenos_Aires';
  const date = new Date(fetchedAt);
  const ageMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  const label = error ? language.stale : `${language.updated} ${ageMinutes < 1 ? 'ahora' : `hace ${ageMinutes} min`}`;
  targets.forEach((target) => { target.textContent = label; });
  root.classList.toggle('is-stale', error || ageMinutes > 30);
  const dateTargets = root.querySelectorAll<HTMLElement>('[data-football-fetched-at]');
  const formatted = new Intl.DateTimeFormat(locale, { timeZone, hour: '2-digit', minute: '2-digit' }).format(date);
  dateTargets.forEach((target) => { target.textContent = `${language.updated} ${formatted}`; });
}

function render(root: HTMLElement, data: any, selectedLeague: string) {
  const events = allEvents(root, data);
  const timeZone = root.dataset.timeZone || 'America/Argentina/Buenos_Aires';
  const today = dateKey(new Date(), timeZone);
  const todays = events.filter((event) => dateKey(event.date, timeZone) === today);
  const recent = events.filter((event) => dateKey(event.date, timeZone) < today && isDone(event)).sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 12);
  const upcoming = events.filter((event) => dateKey(event.date, timeZone) > today && (selectedLeague === 'all' || event.league === selectedLeague)).slice(0, 12);
  const liveCount = todays.filter(isLive).length;
  const count = (selector: string, value: number) => root.querySelectorAll<HTMLElement>(selector).forEach((node) => { node.textContent = String(value); });
  count('[data-football-today-count]', todays.length);
  count('[data-football-live-count]', liveCount);
  count('[data-football-upcoming-count]', upcoming.length);
  renderMatches(root.querySelector('[data-football-today]'), todays, root, false, copy[langOf(root)].emptyToday);
  renderMatches(root.querySelector('[data-football-recent]'), recent, root, true, copy[langOf(root)].emptyToday);
  renderMatches(root.querySelector('[data-football-upcoming]'), upcoming, root, true, copy[langOf(root)].emptyUpcoming);
  const tableTargets = root.querySelectorAll<HTMLElement>('[data-football-tables]');
  const tableLeagues = leaguesFor(root, data);
  if (tableTargets.length > 1) tableTargets.forEach((target, index) => renderTables(target, tableLeagues[index] ? [tableLeagues[index]] : [], root));
  else renderTables(tableTargets[0] || null, tableLeagues, root);
  renderNext(root, events);
  const recentSection = root.querySelector<HTMLElement>('[data-football-recent-section]');
  if (recentSection) recentSection.hidden = recent.length === 0;
  updateFreshness(root, data.fetchedAt || new Date().toISOString());
  root.dispatchEvent(new CustomEvent('football:data-updated', { detail: { fetchedAt: data.fetchedAt } }));
}

async function refresh(root: HTMLElement, button?: HTMLButtonElement) {
  const language = copy[langOf(root)];
  const original = button?.textContent || language.refresh;
  if (button) { button.disabled = true; button.textContent = language.refreshing; }
  try {
    const response = await fetch(root.dataset.refreshUrl || '/api/football.json?market=ar', { cache: 'no-store', headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`football ${response.status}`);
    const data = await response.json();
    root.dataset.footballSnapshot = JSON.stringify(data);
    render(root, data, root.querySelector<HTMLSelectElement>('[data-football-league-filter]')?.value || 'all');
  } catch {
    updateFreshness(root, new Date().toISOString(), true);
  } finally {
    if (button) { button.disabled = false; button.textContent = original; }
  }
}

export function initFootballLiveClient() {
  document.querySelectorAll<HTMLElement>('[data-football-root]').forEach((root) => {
    const filter = root.querySelector<HTMLSelectElement>('[data-football-league-filter]');
    filter?.addEventListener('change', () => {
      const snapshot = root.dataset.footballSnapshot;
      if (!snapshot) return;
      try { render(root, JSON.parse(snapshot), filter.value); } catch { /* snapshot is only an enhancement */ }
    });
    root.querySelectorAll<HTMLButtonElement>('[data-football-refresh]').forEach((button) => button.addEventListener('click', () => refresh(root, button)));
    updateFreshness(root, root.dataset.fetchedAt || new Date().toISOString());
    window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh(root);
    }, 60_000);
    refresh(root);
  });
}
