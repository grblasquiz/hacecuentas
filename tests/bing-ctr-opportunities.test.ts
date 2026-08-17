import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { hub as generationsHub } from '../src/lib/hubs/generaciones';
import { hub as sizesHub } from '../src/lib/hubs/talles';

const read = (path: string) => readFileSync(path, 'utf8');

describe('oportunidades CTR observadas en Bing', () => {
  it('alinea snippets con las consultas de mayor impresión', () => {
    expect(read('src/pages/datos-monotributo-2026.astro')).toContain(
      "const title = 'Monotributo 2026: tabla de categorías, topes y cuotas'",
    );
    expect(read('src/pages/mx/datos-uma-imss-2026.astro')).toContain(
      "const title = 'UMA 2026 México: $117.31 diaria y $3,566.22 mensual'",
    );
    expect(generationsHub.title).toContain('Generaciones por edad 2026');
    expect(sizesHub.title).toContain('Conversor de talles 2026');
  });

  it('hace visible la respuesta directa y refuerza el cluster salarial', () => {
    expect(read('src/pages/datos-salario-basico-ecuador-2026.astro')).toContain(
      '<h1>Sueldo básico Ecuador 2026: $470 y neto con IESS</h1>',
    );
    expect(read('src/pages/mx/datos-uma-imss-2026.astro')).toContain(
      'href="/mx/datos-salario-minimo-mexico-2026"',
    );
    expect(read('src/pages/mx/datos-salario-minimo-mexico-2026.astro')).toContain(
      'href="/mx/datos-uma-imss-2026"',
    );
  });

  it('atiende la intención de ejercicios de geometría imprimibles', () => {
    const post = read('src/content/blog/geometria-figuras-y-cuerpos-paso-a-paso-2026.json');
    const renderer = read('src/pages/blog/[slug].astro');
    expect(post).toContain('ejercicios resueltos paso a paso para imprimir');
    expect(renderer).toContain('Ejercicios resueltos de geometría para imprimir');
    expect(renderer).toContain('data-print-geometry');
  });
});
