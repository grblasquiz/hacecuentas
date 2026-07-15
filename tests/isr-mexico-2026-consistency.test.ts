import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compute } from '../src/lib/formulas/isr-mexico-2026-tarifa-mensual-empleado';
import {
  MEXICO_2026,
  cuotaImssObreroMensual,
  isrMensual2026,
  subsidioEmpleoMensual2026,
} from '../src/lib/data/mexico-2026';

const content = JSON.parse(
  readFileSync(
    new URL('../src/content/calcs-mx/calculadora-isr-mexico-2026-tarifa-mensual-empleado.json', import.meta.url),
    'utf8',
  ),
);

describe('ISR mensual México 2026', () => {
  it('usa la fuente única oficial para ISR, subsidio e IMSS', () => {
    const result = compute({ salario_bruto_mensual: 20_000, aplicar_subsidio: true });

    expect(result.isr_bruto).toBe(isrMensual2026(20_000));
    expect(result.isr_neto).toBe(2_383.65);
    expect(result.subsidio_empleo).toBe(0);
    expect(result.aportacion_imss).toBe(cuotaImssObreroMensual(20_000));
    expect(result.neto_en_mano).toBe(17_104.14);
    expect(result.tramo_aplicado).toBe(21.36);
  });

  it('aplica el subsidio fijo sólo hasta el tope legal', () => {
    expect(subsidioEmpleoMensual2026(11_492.66)).toBe(536.22);
    expect(subsidioEmpleoMensual2026(11_492.67)).toBe(0);

    const eligible = compute({ salario_bruto_mensual: 10_000, aplicar_subsidio: true });
    expect(eligible.subsidio_empleo).toBe(536.22);
    expect(eligible.isr_neto).toBe(192.8);
  });

  it('mantiene tabla, ejemplo y respuesta rápida alineados con el motor', () => {
    expect(content.referenceTables[0].rows).toEqual(
      MEXICO_2026.isrTarifaMensual.map(([lower, upper, fixed, rate]) => [
        `$${lower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        Number.isFinite(upper)
          ? `$${upper.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : 'En adelante',
        `$${fixed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `${(rate * 100).toFixed(2)}%`,
      ]),
    );
    expect(content.example.result).toContain('$2,383.65');
    expect(content.example.result).toContain('$17,104.14');
    expect(content.answerSnippet).toContain('$2,383.65');
    expect(content.keyTakeaway).toContain('$17,104.14');
    expect(JSON.stringify(content)).not.toMatch(/\$1,144|\$2,149\.31|\$3,071\.25/);
  });
});
