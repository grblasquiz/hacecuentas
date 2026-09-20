import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { hub, GENERACIONES } from '../src/lib/hubs/generaciones';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects';

const component = readFileSync(
  new URL('../src/components/GeneracionesCompleteExperience.astro', import.meta.url),
  'utf8',
);

describe('hub canónico de generaciones', () => {
  it('conserva retirada la calculadora histórica y apunta al hub', () => {
    expect(PRUNING_REDIRECTS['/calculadora-generacion-perteneces']).toBe('/fechas/generaciones');
  });

  it('responde explícitamente la intención de búsqueda observada', () => {
    expect(hub.title.toLowerCase()).toContain('de qué generación soy');
    expect(hub.description.toLowerCase()).toContain('generaciones por edad');
    expect(component).toContain('Generaciones por edad y año de nacimiento en 2026');
    expect(component).toContain('Generaciones por año y edad en 2026');
  });

  it('la tabla usa los siete rangos canónicos sin huecos', () => {
    expect(GENERACIONES).toHaveLength(7);
    for (let i = 1; i < GENERACIONES.length; i += 1) {
      expect(GENERACIONES[i].desde).toBe(GENERACIONES[i - 1].hasta + 1);
    }
    expect(component).toContain('generations.map');
  });
});
