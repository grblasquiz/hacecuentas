import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { hub, SANCIONES, UVT } from '../src/lib/hubs/co/sanciones-dian';

const mockup = readFileSync('src/mockups/approved/co/sanciones-dian.html', 'utf8');

describe('snippet de sanción mínima DIAN 2026', () => {
  const minimum = SANCIONES.minimaUvt * UVT;

  it('responde la consulta con UVT y monto vigente en metadata y H1 real', () => {
    expect(minimum).toBe(523_740);
    expect(hub.title).toContain('Sanción mínima DIAN 2026: 10 UVT ($523.740)');
    expect(hub.description).toContain('10 UVT ($523.740)');
    expect(hub.h1).toContain('Sanción mínima DIAN 2026');
    expect(mockup).toContain('<h1>Sanción mínima DIAN 2026: ¿cuánto pagás por declarar tarde?</h1>');
  });

  it('mantiene retiradas las cinco calculadoras absorbidas por el hub', () => {
    expect(hub.replaces).toHaveLength(5);
    expect(hub.replaces).toContain('/co/calculadora-sancion-minima-dian-colombia-2026-10-uvt');
  });
});
