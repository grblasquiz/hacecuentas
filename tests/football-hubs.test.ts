import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  FOOTBALL_BLOCKED_CLUBS,
  FOOTBALL_BLOCKED_TERMS,
  footballEventAllowed,
  footballNameAllowed,
} from '../src/lib/football-policy';

const root = join(__dirname, '..');
const normalize = (value: unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

describe('hubs de fútbol', () => {
  it('mantiene bloqueados los equipos y términos pedidos', () => {
    for (const name of [...FOOTBALL_BLOCKED_CLUBS, ...FOOTBALL_BLOCKED_TERMS]) {
      expect(footballNameAllowed(name), `se filtró la regla ${name}`).toBe(false);
    }

    expect(footballNameAllowed('Club Atlético Independiente')).toBe(false);
    expect(footballNameAllowed('Manchester United FC')).toBe(false);
    expect(footballNameAllowed('Piratas FC')).toBe(false);
    expect(footballNameAllowed('River Plate')).toBe(true);
  });

  it('descarta partidos incompletos o con un equipo bloqueado', () => {
    const event = (home: string, away: string) => ({
      competitions: [{ competitors: [
        { homeAway: 'home', team: { displayName: home, shortDisplayName: home } },
        { homeAway: 'away', team: { displayName: away, shortDisplayName: away } },
      ] }],
    });

    expect(footballEventAllowed(event('River Plate', 'Boca Juniors'))).toBe(true);
    expect(footballEventAllowed(event('River Plate', 'Independiente'))).toBe(false);
    expect(footballEventAllowed({ competitions: [{ competitors: [] }] })).toBe(false);
  });

  it('no deja equipos bloqueados en los snapshots versionados', () => {
    const files = [
      join(root, 'src/data/live/futbol-argentino.json'),
      ...readdirSync(join(root, 'src/data/live/football')).map((file) => join(root, 'src/data/live/football', file)),
    ];
    const failures: string[] = [];

    for (const file of files) {
      const payload = JSON.parse(readFileSync(file, 'utf8'));
      const visit = (value: unknown): void => {
        if (!value || typeof value !== 'object') return;
        if (Array.isArray(value)) return value.forEach(visit);
        const record = value as Record<string, unknown>;
        if (record.team && typeof record.team === 'object') {
          const team = record.team as Record<string, unknown>;
          for (const name of [team.displayName, team.shortDisplayName]) {
            if (name && !footballNameAllowed(name)) failures.push(`${file}: ${normalize(name)}`);
          }
        }
        Object.values(record).forEach(visit);
      };
      visit(payload);
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('conecta cada hub live con el refresh first-party y el filtro de torneo', () => {
    const argentina = readFileSync(join(root, 'src/pages/futbol-argentino-hoy.astro'), 'utf8');
    const market = readFileSync(join(root, 'src/components/FootballMarketHub.astro'), 'utf8');

    for (const source of [argentina, market]) {
      expect(source).toContain('data-football-root');
      expect(source).toContain('/api/football.json?market=');
      expect(source).toContain('data-football-league-filter');
      expect(source).toContain('data-football-next');
    }
  });
});
