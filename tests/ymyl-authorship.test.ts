/**
 * Autoría / revisión YMYL (Fase 3).
 *
 * Garantiza que:
 *   - Martín Rodríguez figure como AUTOR/EDITOR, nunca como revisor clínico.
 *   - En páginas de salud/temas sensibles SIN revisor profesional válido no
 *     aparezca ninguna frase que pueda leerse como "revisión médica" de Martín.
 *
 * No renderiza HTML (eso lo cubre la regresión de build en Fase 11/12): valida
 * (a) la política de content-policy.ts sobre calcs reales, y (b) que las
 * plantillas .astro gaten las frases prohibidas detrás de la señal correcta.
 *
 * Correr: npm test
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  isSensitiveCalc,
  hasValidProfessionalReviewer,
  isIndexableCalc,
} from '../src/lib/content-policy.ts';

const ROOT = process.cwd();

// Frases que NUNCA deben quedar como texto plano incondicional en las
// plantillas de calc (sólo permitidas dentro de una rama no-sensible).
const FORBIDDEN_MARTIN_REVIEW = [
  'Revisado por Martín Rodríguez',
  'Revisión médica por Martín Rodríguez',
];

describe('Fase 3 — autoría vs revisión clínica', () => {
  it('las calcs de salud sensibles se clasifican como sensibles', () => {
    const health = [
      { slug: 'calculadora-magnesio-glicinato-vs-citrato-vs-malato-dosis', category: 'salud' },
      { slug: 'alimentacion-complementaria', category: 'salud' },
      { slug: 'dosis-antipulgas-peso-mascota', category: 'mascotas' },
      { slug: 'calculadora-pubalgia-atletica-tiempo-recuperacion-fases', category: 'deportes' },
    ];
    for (const c of health) {
      expect(isSensitiveCalc(c), `${c.slug} debe ser sensible`).toBe(true);
    }
  });

  it('una calc sensible sin revisor profesional NO ofrece revisión profesional', () => {
    const c = { slug: 'x-dosis', category: 'salud', ymylRisk: 'high' as const };
    expect(hasValidProfessionalReviewer(c)).toBe(false);
    expect(isIndexableCalc(c)).toBe(false); // restringida => noindex
  });

  it('Martín Rodríguez sigue siendo el author editorial (schema en [...slug].astro)', () => {
    const src = readFileSync(join(ROOT, 'src/pages/[...slug].astro'), 'utf8');
    expect(src).toMatch(/author:\s*{[\s\S]*?name:\s*'Martín Rodríguez'/);
  });

  it('el revisor profesional entra como contributor (no reemplaza al author)', () => {
    const src = readFileSync(join(ROOT, 'src/pages/[...slug].astro'), 'utf8');
    expect(src).toMatch(/hasValidProfessionalReviewer\(calc\)/);
    expect(src).toMatch(/contributor:/);
  });

  it('CalcLayoutV2 usa "Editado por" en TODA la web y nunca "Fórmula revisada por"', () => {
    const src = readFileSync(join(ROOT, 'src/components/CalcLayoutV2.astro'), 'utf8');
    // Byline único e incondicional: "Editado por" / "Edited by".
    expect(src).toMatch(/'Edited by'\s*:\s*'Editado por'\}\s*<a href="\/autores\/martin-rodriguez"/);
    // Ya NO existe el literal "Fórmula revisada por" / "Formula reviewed by" en el markup.
    expect(src).not.toMatch(/'Formula reviewed by'\s*:\s*'Fórmula revisada por'/);
  });

  it('Calculator usa etiqueta editorial cuando no hay reviewer real', () => {
    const src = readFileSync(join(ROOT, 'src/components/Calculator.astro'), 'utf8');
    expect(src).toMatch(/config\.reviewer\s*\?\s*t\.reviewedBy\s*:\s*editorialByLabel/);
    expect(src).toMatch(/editorialOnLabel/);
  });

  it('Fase 6 — [...slug].astro usa effectiveNoindex y filtra schemas a BreadcrumbList', () => {
    const src = readFileSync(join(ROOT, 'src/pages/[...slug].astro'), 'utf8');
    expect(src).toMatch(/const effectiveNoindex\s*=\s*calc\.noindex === true \|\| isRestrictedCalc\(calc\)/);
    expect(src).toMatch(/noindex=\{effectiveNoindex\}/);
    // Con effectiveNoindex, el @graph se filtra dejando sólo BreadcrumbList.
    expect(src).toMatch(/effectiveNoindex\s*\?[\s\S]{0,160}?BreadcrumbList/);
  });

  it('Fase 6 — el resultado dinámico y el form de datos tienen data-nosnippet', () => {
    const src = readFileSync(join(ROOT, 'src/components/Calculator.astro'), 'utf8');
    expect(src).toMatch(/class="calc-results"[^>]*data-nosnippet/);
    expect(src).toMatch(/class="calc-form"[^>]*data-nosnippet/);
    // Estado inicial correcto (sin resultado personalizado precargado visible).
    expect(src).toMatch(/Tu resultado va a aparecer acá/);
  });

  it('las plantillas de calc no contienen frases de revisión clínica de Martín como texto plano', () => {
    const files = [
      'src/components/CalcLayoutV2.astro',
      'src/components/Calculator.astro',
      'src/components/AuthorByline.astro',
    ].map((f) => join(ROOT, f)).filter(existsSync);
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      for (const phrase of FORBIDDEN_MARTIN_REVIEW) {
        expect(src.includes(phrase), `${f} no debe contener "${phrase}"`).toBe(false);
      }
    }
  });
});
