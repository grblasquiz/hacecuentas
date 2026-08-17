import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/pages/fixture-mundial-2026.astro', 'utf8');
const client = readFileSync('src/scripts/fixture-mundial.js', 'utf8');

describe('fixture Mundial 2026 después del torneo', () => {
  it('responde la intención de partidos y resultados desde el snippet', () => {
    expect(page).toContain("const title = 'Partidos del Mundial 2026: 104 resultados y España campeón'");
    expect(page).toContain('<h1 class="fx-hero-title">Partidos del Mundial 2026: los 104 resultados</h1>');
    expect(page).toContain('<strong>No hay partidos del Mundial hoy:</strong>');
    expect(page).toContain("const canonical = '/fixture-mundial-2026'");
  });

  it('no presenta la final jugada como un próximo partido', () => {
    expect(page).toContain('const tournamentFinished = played >= total');
    expect(page).toContain("tournamentFinished ? 'Final del Mundial 2026'");
    expect(page).toContain("tournamentFinished ? 'Resultados' : 'Hoy'");
    expect(client).toContain("cfg.tournamentFinished ? 'Resultados del Mundial 2026'");
  });

  it('enlaza los resultados oficiales de FIFA', () => {
    expect(page).toContain('https://www.fifa.com/en/es/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums');
    expect(page).toContain('calendario y resultados oficiales de FIFA');
  });
});
