import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const calc = JSON.parse(readFileSync('src/content/calcs-ec/prestamo-quirografario-iess-ecuador.json', 'utf8'));

describe('snippet Bing de préstamos quirografarios BIESS', () => {
  it('abre con la consulta plural y conserva el dato que resuelve la intención', () => {
    expect(calc.title).toBe('Préstamos quirografarios BIESS 2026: monto y cuota');
    expect(calc.h1).toContain('Préstamos quirografarios BIESS 2026');
    expect(calc.description).toContain('$38.560');
  });

  it('publica la tasa oficial para afiliados y distingue otros perfiles', () => {
    expect(calc.answerSnippet).toContain('12,84%');
    expect(calc.intro).toContain('Jubilados y pensionistas tienen una tabla distinta');
    expect(calc.sources.some((source: { url: string }) => source.url.includes('TARIFARIO_febrero-2026'))).toBe(true);
  });
});
