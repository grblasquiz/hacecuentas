import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_HUBS } from '../src/lib/hubs/registry';

const ROOT = process.cwd();
const read = (file: string) => readFileSync(join(ROOT, file), 'utf8');

describe('superficies públicas de confianza para AdSense', () => {
  it.each([
    'src/pages/sobre-nosotros.astro',
    'src/pages/autores/martin-rodriguez.astro',
    'src/pages/prensa.astro',
  ])('%s no publica métricas dinámicas que puedan renderizar cero', (file) => {
    const source = read(file);
    expect(source).not.toMatch(/ROOT_CATALOG_EXACT|LOCALIZED_VERSION_EXACT|PUBLIC_URL_EXACT|CATEGORY_COUNT/);
    expect(source).not.toMatch(/0 (?:categorías|herramientas|URLs|páginas públicas)/i);
  });

  it('todos los hubs muestran editor, revisión, fecha, alcance y metodología', () => {
    for (const file of ['src/components/hub/DecisionHubClassic.astro', 'src/components/hub/HubEditorialSupport.astro']) {
      const source = read(file);
      expect(source, file).toContain('href="/autores/martin-rodriguez" rel="author"');
      expect(source, file).toContain('datetime={data.lastReviewed}');
      expect(source, file).toContain('Fórmula y fuentes verificadas');
      expect(source, file).toContain('No reemplaza asesoramiento profesional');
      expect(source, file).toContain('href="/politica-editorial"');
      expect(source, file).toContain('href="/metodologia"');
    }
  });

  it('todo el catálogo de hubs tiene el mínimo editorial verificable', () => {
    expect(ALL_HUBS.length).toBeGreaterThanOrEqual(475);
    for (const hub of ALL_HUBS) {
      expect(hub.sources.length, `${hub.slug}: necesita al menos una fuente`).toBeGreaterThan(0);
      expect(hub.faq.length, `${hub.slug}: necesita al menos siete FAQ`).toBeGreaterThanOrEqual(7);
      expect(hub.lastReviewed, `${hub.slug}: necesita fecha de revisión`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(hub.lede.trim().length, `${hub.slug}: lede demasiado corto`).toBeGreaterThanOrEqual(80);
      expect(hub.fineprint.trim().length, `${hub.slug}: alcance demasiado corto`).toBeGreaterThanOrEqual(40);
    }
  });
});
