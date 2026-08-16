// Selector de zona horaria de la superficie NFL 2026 en español.
// Server-side todo se renderiza en hora de México (mercado #1); este script
// re-formatea los nodos [data-nflt] con la zona elegida y la persiste.
(() => {
  const root = document.querySelector('[data-nfl-es]');
  if (!root) return;
  const select = root.querySelector('[data-tz-select]');
  if (!select) return;
  const KEY = 'hc-nfl-es-tz-v1';

  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { return null; }
  };
  const write = (value) => {
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (_) {}
  };

  const OPTS = {
    time: { hour: '2-digit', minute: '2-digit', hour12: false },
    day: { weekday: 'short', day: 'numeric', month: 'short' },
    daytime: { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false },
    longday: { weekday: 'long', day: 'numeric', month: 'long' },
  };

  const render = () => {
    const zone = select.value;
    const option = select.selectedOptions[0];
    root.querySelectorAll('[data-tz-name]').forEach((node) => {
      node.textContent = (option && option.dataset.name) || zone;
    });
    root.querySelectorAll('[data-nflt]').forEach((node) => {
      if (node.dataset.tbd === '1' || !node.dataset.utc) return;
      const kind = OPTS[node.dataset.nflt] ? node.dataset.nflt : 'time';
      try {
        node.textContent = new Intl.DateTimeFormat('es-MX', { timeZone: zone, ...OPTS[kind] })
          .format(new Date(node.dataset.utc))
          .replace(/\./g, '')
          .replace(',', '');
      } catch (_) {}
    });
  };

  const saved = read();
  if (saved && Array.from(select.options).some((option) => option.value === saved)) {
    select.value = saved;
  }
  select.addEventListener('change', () => { write(select.value); render(); });
  if (select.value !== 'America/Mexico_City') render();
})();
