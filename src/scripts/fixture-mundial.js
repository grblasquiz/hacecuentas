// ════════════════════════════════════════════════════════════════════════
// Fixture Mundial 2026 — interacción del rediseño (tabs, filtros, refresh live)
// Plain JS servido desde /public (sin bundling): corre igual en dev, build y prod.
// La página es estática (prerender): este script hidrata las 4 vistas, convierte
// horarios a la zona del visitante, filtra el calendario, y repollea el JSON de
// openfootball para completar marcadores sin recargar. Todo defensivo.
// ════════════════════════════════════════════════════════════════════════
(function () {
  var cfgEl = document.getElementById('fx-live-config');
  var root = document.querySelector('[data-fx]');
  if (!cfgEl || !root) return;
  var cfg;
  try { cfg = JSON.parse(cfgEl.textContent || '{}'); } catch (e) { return; }
  var TEAMS = cfg.teams || {};

  // ── Zona horaria ──────────────────────────────────────────────────────
  var AR_TZ = 'America/Argentina/Buenos_Aires';
  var ZONES = [
    AR_TZ, 'America/Mexico_City', 'America/Bogota', 'America/Santiago', 'America/Lima',
    'America/Guayaquil', 'America/Caracas', 'America/Asuncion', 'America/Montevideo',
    'America/La_Paz', 'America/Sao_Paulo', 'Europe/Madrid', 'America/New_York', 'America/Los_Angeles'
  ];
  var currentTZ = AR_TZ;
  try {
    var saved = localStorage.getItem('fx-tz');
    if (saved && ZONES.indexOf(saved) >= 0) currentTZ = saved;
    else { var det = Intl.DateTimeFormat().resolvedOptions().timeZone; if (det && ZONES.indexOf(det) >= 0) currentTZ = det; }
  } catch (e) {}

  function dayInTZ(d, tz) {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); }
    catch (e) { return ''; }
  }
  function fmtTimeTZ(utc) {
    if (!utc) return '';
    var d = new Date(utc);
    if (isNaN(d.getTime())) return '';
    var t;
    try { t = new Intl.DateTimeFormat('es-AR', { timeZone: currentTZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d); }
    catch (e) { return ''; }
    var ar = dayInTZ(d, AR_TZ), loc = dayInTZ(d, currentTZ);
    var off = '';
    if (loc && ar && loc !== ar) off = loc > ar ? ' +1' : ' −1';
    return t + off;
  }
  function reformatTimes(scope) {
    (scope || document).querySelectorAll('[data-time][data-utc]').forEach(function (el) {
      var utc = el.getAttribute('data-utc');
      if (utc) el.textContent = fmtTimeTZ(utc);
    });
  }

  function label(name) {
    if (!name) return { es: 'A definir', flag: '⚽' };
    if (TEAMS[name]) return TEAMS[name];
    var m = name.match(/^([123])([A-L])$/);
    if (m) return { es: m[1] + '.º Grupo ' + m[2], flag: '🏳️' };
    m = name.match(/^3([A-L/]+)$/);
    if (m) return { es: '3.º (' + m[1] + ')', flag: '🏳️' };
    m = name.match(/^W(\d+)$/);
    if (m) return { es: 'Ganador M' + m[1], flag: '🏳️' };
    m = name.match(/^L(\d+)$/);
    if (m) return { es: 'Perdedor M' + m[1], flag: '🏳️' };
    return { es: name, flag: '🏳️' };
  }

  function fmtResult(score) {
    if (!score || !score.ft) return null;
    var base = score.et || score.ft;
    var a = base[0], b = base[1];
    var detail = '';
    var winner = a > b ? 1 : b > a ? 2 : 0;
    if (score.et) detail = 'Tras alargue';
    if (score.p) { detail = 'Penales ' + score.p[0] + '-' + score.p[1]; winner = score.p[0] > score.p[1] ? 1 : 2; }
    return { a: a, b: b, detail: detail, winner: winner };
  }

  // ── Aplicar un partido (score + resolución de placeholders) a un elemento ──
  function applyMatch(el, m) {
    var l1 = label(m.team1), l2 = label(m.team2);
    el.querySelectorAll('[data-side="1"] .name').forEach(function (n) { n.textContent = l1.es; });
    el.querySelectorAll('[data-side="1"] .flag').forEach(function (n) { n.textContent = l1.flag; });
    el.querySelectorAll('[data-side="2"] .name').forEach(function (n) { n.textContent = l2.es; });
    el.querySelectorAll('[data-side="2"] .flag').forEach(function (n) { n.textContent = l2.flag; });
    var r = fmtResult(m.score);
    if (!r) return;
    el.classList.add('is-played');
    el.querySelectorAll('.fx-mcard-score[data-score], .fx-arg-vs[data-score]').forEach(function (s) { s.textContent = r.a + ' – ' + r.b; });
    var sa = el.querySelector('[data-score-a]'); if (sa) sa.textContent = String(r.a);
    var sb = el.querySelector('[data-score-b]'); if (sb) sb.textContent = String(r.b);
    var argRes = el.querySelector('.fx-argtl-res');
    if (argRes) { var isArg1 = m.team1 === 'Argentina'; argRes.textContent = (isArg1 ? r.a : r.b) + ' – ' + (isArg1 ? r.b : r.a); }
    var bigVs = el.querySelector('.fx-argnext-vs[data-score]'); if (bigVs) bigVs.textContent = r.a + ' – ' + r.b;
    var det = el.querySelector('[data-detail]'); if (det) det.textContent = r.detail;
  }

  function cardHTML(m) {
    var t1 = label(m.team1), t2 = label(m.team2);
    var r = fmtResult(m.score);
    var st = r ? 'FINAL' : (m.isNext ? 'PRÓXIMO' : '');
    var stHtml = st ? '<span class="fx-st fx-st-' + (r ? 'final' : 'next') + '">' + st + '</span>' : '';
    var scoreTxt = r ? (r.a + ' – ' + r.b) : 'vs';
    var trailing = m.isNext
      ? '<a class="fx-aviso" href="#fx-avisos">Activar aviso</a>'
      : '<span class="fx-mcard-detail" data-detail>' + (r ? r.detail : '') + '</span>';
    return '<article class="fx-mcard' + (m.isNext ? ' is-next' : '') + (r ? ' is-played' : '') + '" data-match data-num="' + m.num + '" data-team1="' + (m.team1 || '') + '" data-team2="' + (m.team2 || '') + '">' +
      '<div class="fx-mcard-badge">' + stHtml + '<span class="fx-mcard-round">' + m.round + '</span></div>' +
      '<div class="fx-mcard-body">' +
        '<div class="fx-mcard-time"><span class="t" data-time data-utc="' + m.utc + '">' + (m.utc ? fmtTimeTZ(m.utc) : m.time) + '</span><span class="g">' + m.ground + '</span></div>' +
        '<div class="fx-mcard-teams">' +
          '<span class="fx-side s1" data-side="1"><span class="flag">' + t1.flag + '</span><span class="name">' + t1.es + '</span></span>' +
          '<span class="fx-mcard-score" data-score>' + scoreTxt + '</span>' +
          '<span class="fx-side s2" data-side="2"><span class="name">' + t2.es + '</span><span class="flag">' + t2.flag + '</span></span>' +
        '</div>' + trailing +
      '</div></article>';
  }

  function todayKeyAR() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: AR_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }

  function renderHoyDay(dayKey) {
    var day = (cfg.days || []).find(function (d) { return d.key === dayKey; });
    if (!day) return;
    var isToday = dayKey === todayKeyAR();
    var titleEl = document.getElementById('fx-hoy-title');
    var dateEl = document.querySelector('[data-hoy-date]');
    var cardsEl = document.getElementById('fx-hoy-cards');
    if (titleEl) titleEl.textContent = cfg.tournamentFinished ? 'Resultados del Mundial 2026' : (isToday ? 'Partidos de hoy' : 'Próximos partidos');
    if (dateEl) dateEl.textContent = day.label;
    if (cardsEl) { cardsEl.innerHTML = day.matches.map(cardHTML).join(''); reformatTimes(cardsEl); }
    document.querySelectorAll('.fx-chip[data-chip]').forEach(function (c) {
      c.classList.toggle('is-active', c.getAttribute('data-chip') === dayKey);
    });
  }

  // ── Tabs ──────────────────────────────────────────────────────────────
  var TAB_NAMES = ['hoy', 'calendario', 'argentina', 'fases'];
  function activateTab(name, push) {
    if (TAB_NAMES.indexOf(name) < 0) return;
    root.querySelectorAll('[data-fxpanel]').forEach(function (p) {
      var on = p.getAttribute('data-fxpanel') === name;
      p.hidden = !on;
      p.classList.toggle('is-active', on);
    });
    root.querySelectorAll('[data-fxtab]').forEach(function (t) {
      var on = t.getAttribute('data-fxtab') === name;
      t.classList.toggle('is-active', on);
      if (t.getAttribute('role') === 'tab') t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (push !== false) { try { history.replaceState(null, '', '#' + name); } catch (e) {} }
  }
  root.querySelectorAll('[data-fxtab]').forEach(function (t) {
    t.addEventListener('click', function () { activateTab(t.getAttribute('data-fxtab') || 'hoy'); });
  });
  root.querySelectorAll('[data-goto]').forEach(function (b) {
    b.addEventListener('click', function () {
      activateTab(b.getAttribute('data-goto') || 'hoy');
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  var initHash = (location.hash || '').replace('#', '');
  if (TAB_NAMES.indexOf(initHash) >= 0) activateTab(initHash, false);

  // ── Chips de fecha (Hoy) ──────────────────────────────────────────────
  root.querySelectorAll('.fx-chip[data-chip]').forEach(function (c) {
    c.addEventListener('click', function () { renderHoyDay(c.getAttribute('data-chip') || ''); });
  });

  // ── Tira de fechas (Calendario) → scroll a la jornada ─────────────────
  root.querySelectorAll('.fx-chip[data-calchip]').forEach(function (c) {
    c.addEventListener('click', function () {
      var key = c.getAttribute('data-calchip');
      root.querySelectorAll('.fx-chip[data-calchip]').forEach(function (x) { x.classList.toggle('is-active', x === c); });
      var day = document.querySelector('.fx-cal-day[data-day="' + key + '"]');
      if (day) day.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Selector de zona horaria ──────────────────────────────────────────
  var tzSel = document.getElementById('fx-tz');
  var tzFlag = document.querySelector('[data-tz-flag]');
  function applyTZ() {
    reformatTimes();
    if (tzSel && tzFlag) {
      var opt = tzSel.options[tzSel.selectedIndex];
      if (opt) tzFlag.textContent = opt.getAttribute('data-flag') || '🕐';
    }
    updateCountdown();
  }
  if (tzSel) {
    tzSel.value = currentTZ;
    tzSel.addEventListener('change', function () {
      currentTZ = tzSel.value;
      try { localStorage.setItem('fx-tz', currentTZ); } catch (e) {}
      applyTZ();
    });
  }

  // ── Countdown (Argentina) ─────────────────────────────────────────────
  function updateCountdown() {
    document.querySelectorAll('[data-countdown][data-utc]').forEach(function (el) {
      var utc = el.getAttribute('data-utc');
      if (!utc) return;
      var d = new Date(utc).getTime();
      if (isNaN(d)) return;
      var diff = d - Date.now();
      var wrap = el.closest('.fx-argnext-cd');
      var lbl = wrap ? wrap.querySelector('.fx-argnext-cdlabel') : null;
      if (diff <= 0 && diff > -3 * 3600 * 1000) { if (lbl) lbl.textContent = ''; el.textContent = 'En juego'; return; }
      if (diff <= -3 * 3600 * 1000) { if (lbl) lbl.textContent = ''; el.textContent = 'Finalizado'; return; }
      var mins = Math.floor(diff / 60000);
      var h = Math.floor(mins / 60), mm = mins % 60;
      if (lbl) lbl.textContent = 'Empieza en';
      el.textContent = h > 0 ? (h + ' h ' + mm + ' min') : (mm + ' min');
    });
  }

  // ── Filtros del calendario ────────────────────────────────────────────
  var cal = document.getElementById('fx-cal');
  function applyFilters() {
    if (!cal) return;
    var monthEl = document.querySelector('[data-filter="month"]');
    var phaseEl = document.querySelector('[data-filter="phase"]');
    var teamEl = document.querySelector('[data-filter="team"]');
    var searchEl = document.querySelector('[data-filter="search"]');
    var argEl = document.querySelector('[data-arg-toggle]');
    var month = monthEl ? monthEl.value : '';
    var phase = phaseEl ? phaseEl.value : '';
    var team = teamEl ? teamEl.value : '';
    var q = (searchEl ? searchEl.value : '').trim().toLowerCase();
    var argOnly = argEl ? argEl.checked : false;
    var anyVisible = false;
    cal.querySelectorAll('.fx-cal-day').forEach(function (day) {
      var dayMonth = day.getAttribute('data-month') || '';
      if (month && dayMonth !== month) { day.hidden = true; return; }
      var visibleInDay = 0;
      day.querySelectorAll('.fx-mcard').forEach(function (card) {
        var cPhase = card.getAttribute('data-phase') || '';
        var cTeams = card.getAttribute('data-teams') || '';
        var cSearch = card.getAttribute('data-search') || '';
        var ok = true;
        if (phase && cPhase !== phase) ok = false;
        if (team && cTeams.split(' ').indexOf(team) < 0) ok = false;
        if (argOnly && cTeams.indexOf('Argentina') < 0) ok = false;
        if (q && cSearch.indexOf(q) < 0) ok = false;
        card.hidden = !ok;
        if (ok) visibleInDay++;
      });
      day.hidden = visibleInDay === 0;
      if (visibleInDay > 0) anyVisible = true;
    });
    var empty = cal.querySelector('.fx-cal-empty');
    if (empty) empty.hidden = anyVisible;
  }
  document.querySelectorAll('[data-filter], [data-arg-toggle]').forEach(function (el) {
    el.addEventListener('input', applyFilters);
    el.addEventListener('change', applyFilters);
  });
  root.querySelectorAll('.fx-phasebtn').forEach(function (b) {
    b.addEventListener('click', function () {
      var val = b.getAttribute('data-phasebtn') || '';
      root.querySelectorAll('.fx-phasebtn').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      var sel = document.querySelector('[data-filter="phase"]');
      if (sel) sel.value = val;
      applyFilters();
    });
  });
  var phaseSel = document.querySelector('[data-filter="phase"]');
  if (phaseSel) phaseSel.addEventListener('change', function () {
    root.querySelectorAll('.fx-phasebtn').forEach(function (x) { x.classList.toggle('is-active', x.getAttribute('data-phasebtn') === phaseSel.value); });
  });
  var clearBtn = document.querySelector('[data-clear-filters]');
  if (clearBtn) clearBtn.addEventListener('click', function () {
    document.querySelectorAll('[data-filter]').forEach(function (el) { el.value = ''; });
    var at = document.querySelector('[data-arg-toggle]'); if (at) at.checked = false;
    root.querySelectorAll('.fx-phasebtn').forEach(function (x) { x.classList.toggle('is-active', x.getAttribute('data-phasebtn') === ''); });
    applyFilters();
  });

  // ── Toggle Llaves / Lista ─────────────────────────────────────────────
  root.querySelectorAll('.fx-vt').forEach(function (b) {
    b.addEventListener('click', function () {
      var view = b.getAttribute('data-view');
      root.querySelectorAll('.fx-vt').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      root.querySelectorAll('[data-viewpanel]').forEach(function (p) {
        p.hidden = p.getAttribute('data-viewpanel') !== view;
      });
    });
  });

  // ── Refresh en vivo ───────────────────────────────────────────────────
  function refresh() {
    return fetch(cfg.url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) return null;
      return res.json();
    }).then(function (data) {
      if (!data || !Array.isArray(data.matches)) return null;
      var byNum = {};
      data.matches.forEach(function (m, i) { byNum[m.num != null ? m.num : i + 1] = m; });
      var playedNums = {};
      var playedCount = 0, totalCount = 0;
      document.querySelectorAll('[data-match]').forEach(function (el) {
        var num = Number(el.dataset.num);
        var m = byNum[num];
        if (!m) return;
        applyMatch(el, m);
      });
      Object.keys(byNum).forEach(function (k) { totalCount++; var m = byNum[k]; if (m.score && m.score.ft) { playedNums[k] = 1; playedCount++; } });
      var uEl = document.querySelector('[data-live-updated]');
      if (uEl) uEl.textContent = new Intl.DateTimeFormat('es-AR', { timeZone: AR_TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
      return { played: playedCount, total: totalCount };
    }).catch(function () { return null; });
  }

  // ── Cambio de día (medianoche) ────────────────────────────────────────
  var lastTodayKey = cfg.todayKey;
  function syncToday() {
    var k = todayKeyAR();
    if (k === lastTodayKey) return;
    lastTodayKey = k;
    document.querySelectorAll('.fx-cal-day').forEach(function (el) {
      var isT = el.getAttribute('data-day') === k;
      var h = el.querySelector('.fx-cal-dayh');
      if (!h) return;
      var badge = h.querySelector('.fx-chip-hoy');
      if (isT && !badge) { var bb = document.createElement('span'); bb.className = 'fx-chip-hoy'; bb.textContent = 'HOY'; h.insertBefore(bb, h.firstChild); }
      else if (!isT && badge) badge.remove();
    });
    var days = cfg.days || [];
    var day = days.find(function (d) { return d.key >= k; }) || days[days.length - 1];
    if (day) renderHoyDay(day.key);
  }

  // ── Boot ──────────────────────────────────────────────────────────────
  applyTZ();
  updateCountdown();
  applyFilters();
  var stopped = false;
  var poll = null;
  function tick() {
    syncToday();
    refresh().then(function (st) {
      updateCountdown();
      if (st && st.total > 0 && st.played >= st.total) { stopped = true; if (poll) { clearInterval(poll); poll = null; } }
    });
  }
  tick();
  poll = setInterval(function () { if (!document.hidden && !stopped) tick(); }, 120000);
  setInterval(updateCountdown, 30000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !stopped) tick(); });
})();
