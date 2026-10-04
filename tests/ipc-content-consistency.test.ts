import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ipcContentFactor, ipcContentSeries, syncIpcContent, IPC_CALENDAR_URL } from '../src/lib/ipc-content';
import { inflacionIpc } from '../src/lib/formulas/inflacion-ipc';
import base from '../src/data/ipc-indec-serie.json';
import live from '../src/data/live/inflacion.json';
import calc from '../src/content/calcs/inflacion-ipc.json';

const series = ipcContentSeries(base, live);
const answer = (result: any, text: string) => result.faq.find((faq: any) => faq.q.includes(text))?.a;

describe('IPC: contenido coherente con la serie y el intervalo del simulador', () => {
  it('compone febrero–abril y enero–marzo inclusivos sin cambiar la fórmula', () => {
    expect(ipcContentFactor(series, '2026-02', '2026-04')).toBeCloseTo(1.091649636, 10);
    expect(ipcContentFactor(series, '2026-01', '2026-03')).toBeCloseTo(1.094841594, 10);
    expect(inflacionIpc({ montoOriginal: 400000, mesDesde: '2026-02', mesHasta: '2026-04' }).montoActualizado).toBe(436660);
    const result = syncIpcContent(calc, base, live);
    expect(answer(result, 'Cómo actualizar un sueldo')).toContain('$436.659,85');
    expect(answer(result, 'Cómo actualizar un sueldo')).toContain('$436.660');
    expect(answer(result, 'Cómo paso de IPC')).toContain('9,4842%');
  });

  it('calcula todas las filas históricas con los mismos factores de la fórmula', () => {
    const result = syncIpcContent(calc, base, live);
    const rows = [...result.explanation.matchAll(/\| Enero 2020 – (.*?) \| (.*?)% \| (.*?) \| (.*?) \|/g)];
    expect(rows).toHaveLength(7);
    const ends = ['2020-12', '2021-12', '2022-12', '2023-12', '2024-12', '2025-12', '2026-08'];
    ends.forEach((end, index) => {
      const f = ipcContentFactor(series, '2020-01', end);
      expect(rows[index][2]).toBe(((f - 1) * 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      expect(inflacionIpc({ montoOriginal: 100, mesDesde: '2020-01', mesHasta: end }).montoActualizado).toBe(Math.round(100 * f));
    });
    expect(result.explanation).not.toContain('2.150% est.');
    expect(answer(result, 'Cómo comparo $100')).toContain('mes inicial y el final están incluidos');
  });

  it('rechaza períodos incompletos en vez de publicar un acumulado parcial', () => {
    const gap = { ...series };
    delete gap['2026-03'];
    expect(() => ipcContentFactor(gap, '2026-02', '2026-04')).toThrow('falta IPC 2026-03');
    expect(() => ipcContentFactor(series, '2026-04', '2026-02')).toThrow('período invertido');
    expect(ipcContentFactor(series, '2026-02', '2026-02')).toBeCloseTo(1.029, 10);
  });

  it('es idempotente, conserva el título vigente y distingue supuestos de períodos reales', () => {
    const result = syncIpcContent(calc, base, live);
    expect(syncIpcContent(result, base, live)).toEqual(result);
    expect(result.title).toBe(calc.title);
    expect(result.faq).toHaveLength(calc.faq.length);
    expect(result.example.title).toContain('hipotético');
    expect(result.example.steps.join(' ')).toContain('no corresponde a un período fechado');
    expect(result.explanation).toContain('1.05×1.04×1.03');
    const datedAnswers = result.faq.map((f: any) => f.a).join(' ');
    expect(datedAnswers).not.toContain('$424.000');
    expect(datedAnswers).not.toContain('enero 2026 +2.5%');
    expect(datedAnswers).not.toContain('8.500%');
  });

  it('un mes nuevo y el cambio de año actualizan tabla, preguntas y respuestas', () => {
    // Tasas exclusivamente sintéticas para comprobar sincronización, no datos publicados.
    const synthetic = { ...live, last_12_months: [...live.last_12_months,
      { fecha: '2026-09-30', valor: 1 }, { fecha: '2026-10-31', valor: 1 },
      { fecha: '2026-11-30', valor: 1 }, { fecha: '2026-12-31', valor: 1 }, { fecha: '2027-01-31', valor: 2 }] };
    const result = syncIpcContent(calc, base, synthetic);
    expect(result.title).toBe('IPC enero 2027: calculadora de inflación INDEC');
    expect(result.referenceTables.find((t: any) => t.title.startsWith('IPC mes a mes'))?.rows).toEqual([['Enero', '2,0%', '2,0%']]);
    expect(answer(result, 'Cuál fue el IPC mensual de 2027')).toContain('enero +2,0%');
    expect(answer(result, 'Cuándo publica')).toContain('enero 2027');
    expect(result.explanation).toContain('Enero 2027');
    expect(syncIpcContent(result, base, synthetic)).toEqual(result);
    const september = syncIpcContent(calc, base, { ...live, last_12_months: synthetic.last_12_months.slice(0, -4) });
    expect(september.title).toContain('septiembre 2026');
    expect(answer(september, 'Cómo comparo $100')).toContain('septiembre 2026');
  });

  it('el mockup y el FAQ enlazan el calendario, sin una fecha futura fija', () => {
    const result = syncIpcContent(calc, base, live);
    expect(answer(result, 'Cuándo publica')).toContain(IPC_CALENDAR_URL);
    expect(answer(result, 'Cuándo publica')).not.toContain('13 de agosto');
    const mockup = readFileSync('src/components/mockups/InflacionIpcMockup.astro', 'utf8');
    expect(mockup).toContain('href={IPC_CALENDAR_URL}');
    expect(mockup).not.toContain('El IPC de julio de 2026 sale');
  });
});
