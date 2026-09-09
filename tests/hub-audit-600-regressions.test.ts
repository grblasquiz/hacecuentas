import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const tools = JSON.parse(read('src/lib/current-tools-index.json'));
const decision = read('src/components/SitewideHubDecisionLayer.astro');
const accessibility = read('src/components/AccessibilityBaseline.astro');

describe('auditoría transversal de los hubs canónicos', () => {
  it('cubre el catálogo canónico completo sin alterar analytics', () => {
    const published = [...read('public/sitemap-hubs.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    expect(new Set(tools.map((t: any) => t.url)).size).toBe(tools.length);
    expect(tools.map((t: any) => t.url).sort()).toEqual(published.sort());
    expect(read('src/layouts/Layout.astro')).toContain('<HubCalculationTracking />');
  });

  it('sólo recomienda herramientas con afinidad suficiente', () => {
    expect(decision).toContain('.filter(({ score }) => score >= 3)');
    expect(decision).toContain('sameCategory');
    expect(decision).toContain('parentChild');
  });

  it('distingue revisión de experiencia de vigencia del dato', () => {
    expect(decision).toContain("const experienceReviewed = modified || '2026-08-16'");
    expect(decision).toContain('La fecha de vigencia de cada valor se informa junto a su fuente.');
    expect(decision).not.toContain("checked: 'Fórmula y fuentes verificadas'");
  });

  it('nombra controles legacy, incluso matrices y campos compactos', () => {
    expect(accessibility).toContain("control.closest('td, th')");
    expect(accessibility).toContain("control.setAttribute('aria-labelledby'");
    expect(accessibility).toContain('optionName');
  });

  it('corrige los seis saltos de encabezado identificados', () => {
    expect(read('src/mockups/approved/en/blood-test-numbers.html')).not.toContain('<h3>LAB RESULTS</h3>');
    expect(read('src/mockups/approved/es/alquilar-piso.html')).not.toContain('<h3>Primera mensualidad</h3>');
    expect(read('src/mockups/approved/pe/costos-del-auto.html')).not.toContain('<h3 id="serviceAmount"></h3>');
    expect(read('src/mockups/approved/pt/treino-e-desempenho.html')).not.toContain('<h3 id=status></h3>');
    expect(read('src/components/generated/ComisionesPlataformaExperience.astro')).not.toContain('<h3>Liquidación</h3>');
    expect(read('src/components/generated/LiquidacionLotttExperience.astro')).not.toContain('<h3>Se paga el cálculo mayor</h3>');
  });

  it('etiqueta los siete grupos de controles que no cubría la capa común', () => {
    expect(read('src/mockups/approved/en/strength-and-training-volume.html')).toContain('aria-label="Bench press sets"');
    expect(read('src/mockups/approved/en/home-energy-savings.html')).toContain('aria-label="Include air sealing"');
    expect(read('src/mockups/approved/en/get-out-of-debt.html')).toContain('aria-label="Card A balance"');
    expect(read('src/mockups/approved/en/gpa-and-grades.html')).toContain('aria-label="Biology credits"');
    expect(read('src/components/EdadExactaExperience.astro')).toContain('id="birth-time"');
    expect(read('src/components/generated/CaloriasQuemadasExperience.astro')).toContain('id="estimated-efficiency"');
    expect(read('src/components/generated/AguinaldoExperience.astro')).toContain('id="sac-discount-status"');
  });
});
