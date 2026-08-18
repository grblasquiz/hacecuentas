import { describe, expect, it } from 'vitest';
import { SALARIO_MINIMO_2027 } from '../src/lib/data/salario-minimo-2027';

// Guardas del tracker 2027: datos completos, sin montos "2027" afirmados como
// oficiales (formato anti-especulación) y links internos con forma válida.
describe('trackers salario mínimo 2027', () => {
  const paises = Object.values(SALARIO_MINIMO_2027);

  it('cubre los 5 países con ficha completa', () => {
    expect(paises).toHaveLength(5);
    for (const p of paises) {
      expect(p.slug, p.pais).toMatch(/2027$/);
      expect(p.vigenteHoy.length, p.pais).toBeGreaterThan(5);
      expect(p.estado2027.length, p.pais).toBeGreaterThan(20);
      expect(p.queSeSabe.length, p.pais).toBeGreaterThanOrEqual(3);
      expect(p.historico.length, p.pais).toBeGreaterThanOrEqual(3);
      expect(p.fuentes.length, p.pais).toBeGreaterThanOrEqual(3);
      expect(p.advertencia.length, p.pais).toBeGreaterThan(20);
      expect(p.proximaRevision.length, p.pais).toBeGreaterThan(5);
    }
  });

  it('todo estado2027 deja claro que no hay monto oficial decretado', () => {
    for (const p of paises) {
      // Cada ficha debe contener una señal explícita de no-oficialidad.
      const señal = /NO está definido|no existe todavía|sin decreto|se conocerá|pendiente/i;
      expect(señal.test(p.estado2027 + ' ' + p.advertencia), `${p.pais}: ${p.estado2027}`).toBe(true);
    }
  });

  it('los links internos apuntan a rutas propias válidas', () => {
    for (const p of paises) {
      expect(p.slug2026, p.pais).toMatch(/^\/[a-z0-9/-]+$/);
      if (p.calcRelacionada) expect(p.calcRelacionada.href, p.pais).toMatch(/^\/[a-z0-9/-]+$/);
    }
  });
});
