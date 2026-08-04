import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const component = readFileSync('src/components/generated/NumerosLetrasExperience.astro', 'utf8');
const data = readFileSync('src/lib/hubs/numeros-a-letras.ts', 'utf8');
const page = readFileSync('src/pages/conversores/numeros-a-letras.astro', 'utf8');

describe('SEO canónico de números a letras', () => {
  it('responde la consulta principal en el H1 visible y en los datos del hub', () => {
    expect(component).toContain('<h1>Conversor de números a letras</h1>');
    expect(data).toContain("h1: 'Conversor de números a letras'");
  });

  it('describe la herramienta canónica como aplicación web gratuita', () => {
    expect(page).toContain("'@type': 'WebApplication'");
    expect(page).toContain("applicationCategory: 'UtilitiesApplication'");
    expect(page).toContain("price: '0'");
  });

  it('no enlaza ni canoniza la URL histórica retirada', () => {
    expect(component).not.toContain('href="/conversor-numero-a-letras-cantidad"');
    expect(page).not.toContain('conversor-numero-a-letras-cantidad');
  });
});
