/**
 * Tests del helper compuesto isSensitiveCalculator (content-policy §23).
 * Verifica que para riesgo alto sin revisor TODOS los permisos son false,
 * y que un revisor profesional válido los rehabilita.
 */
import { describe, it, expect } from 'vitest';
import { isSensitiveCalculator, type SensitivePermissions } from '../src/lib/content-policy';

const PERMISSION_KEYS: Array<keyof SensitivePermissions> = [
  'allowIndex', 'allowSitemap', 'allowSearch', 'allowRelated', 'allowWidget',
  'allowPdf', 'allowImage', 'allowEmail', 'allowShareLink', 'allowEmbed',
];

const validReviewer = {
  name: 'Dra. Ejemplo', profession: 'Médica', credential: 'MN 12345',
  profileUrl: 'https://hacecuentas.com/autores/ejemplo', reviewedAt: '2026-07-01',
};

describe('isSensitiveCalculator', () => {
  it('calc normal (low risk) → todos los permisos true, isSensitive false', () => {
    const p = isSensitiveCalculator({ slug: 'herramienta-fixture-no-podada', category: 'finanzas', ymylRisk: 'low' });
    expect(p.isSensitive).toBe(false);
    expect(p.riskLevel).toBe('low');
    for (const k of PERMISSION_KEYS) expect(p[k], `${k} debería ser true`).toBe(true);
  });

  it('riesgo alto SIN revisor → TODOS los permisos false, isSensitive true', () => {
    const p = isSensitiveCalculator({ slug: 'calculadora-dosis-x', category: 'salud', ymylRisk: 'high' });
    expect(p.isSensitive).toBe(true);
    expect(p.riskLevel).toBe('high');
    for (const k of PERMISSION_KEYS) expect(p[k], `${k} debería ser false para riesgo alto`).toBe(false);
  });

  it('riesgo alto CON revisor profesional válido → permisos rehabilitados', () => {
    const p = isSensitiveCalculator({ slug: 'calculadora-x', category: 'salud', ymylRisk: 'high', professionalReviewer: validReviewer });
    expect(p.isSensitive).toBe(false);
    for (const k of PERMISSION_KEYS) expect(p[k], `${k} debería ser true con revisor válido`).toBe(true);
  });

  it("distribution:'restricted' explícito → todos false aunque el riesgo sea bajo", () => {
    const p = isSensitiveCalculator({ slug: 'calculadora-x', category: 'finanzas', ymylRisk: 'low', distribution: 'restricted' });
    expect(p.isSensitive).toBe(true);
    for (const k of PERMISSION_KEYS) expect(p[k], `${k} debería ser false`).toBe(false);
  });

  it('noindex:true explícito → no indexable pero embed/share dependen de restricción', () => {
    const p = isSensitiveCalculator({ slug: 'calculadora-x', category: 'finanzas', ymylRisk: 'low', noindex: true });
    expect(p.allowIndex).toBe(false);
    expect(p.allowSitemap).toBe(false);
  });

  it('null/undefined → no rompe, isSensitive false', () => {
    const p = isSensitiveCalculator(null);
    expect(p.isSensitive).toBe(false);
    expect(p.allowIndex).toBe(true);
  });
});
