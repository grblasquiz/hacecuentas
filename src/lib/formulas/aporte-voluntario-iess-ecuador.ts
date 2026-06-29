/**
 * Afiliación voluntaria al IESS (Ecuador) 2026.
 * Aporte del afiliado voluntario = 17,60% sobre la materia gravada (ingreso declarado),
 * con base mínima = SBU vigente (USD 482 en 2026). Fuente: IESS, Reglamento de
 * Aseguramiento del Afiliado Voluntario; iess.gob.ec.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

// Tasa total de aporte del afiliado voluntario (personal + patronal lo paga el propio
// afiliado, sin relación de dependencia). 17,60% del ingreso declarado.
const TASA_VOLUNTARIO = 0.176;

export interface Inputs {
  ingresoDeclarado: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const SBU = ECUADOR_2026.sbu; // 482
  const ingreso = Number(i.ingresoDeclarado) || 0;

  const baseUsada = Math.max(ingreso, SBU);
  const aporteMensual = baseUsada * TASA_VOLUNTARIO;
  const aporteAnual = aporteMensual * 12;

  const usoMinimo = ingreso < SBU;

  const _insight = {
    title: 'Tu aporte como afiliado voluntario',
    text: usoMinimo
      ? `Declaraste **${fmtUSDec(ingreso)}**, por debajo del SBU. La afiliación voluntaria usa como mínimo **1 SBU (${fmtUSDec(SBU)})**, así que tu aporte se calcula sobre esa base: **${fmtUSDec(aporteMensual)}** al mes (17,60%).`
      : `Sobre un ingreso declarado de **${fmtUSDec(baseUsada)}** aportás el **17,60% = ${fmtUSDec(aporteMensual)}** al mes (**${fmtUSDec(aporteAnual)}** al año) para tener cobertura de salud, jubilación y riesgos del IESS sin estar en relación de dependencia.`,
    tone: 'neutral',
    icon: '🩺',
  };

  // Tabla computada: aporte mensual/anual por nivel de ingreso declarado (mismo 17,60% y misma
  // base mínima SBU que el resultado principal). La fila "(tu caso)" usa tu ingreso real.
  const fmt = (n: number) => fmtUSDec(n);
  const anclas = [SBU, 600, 800, 1000, 1500];
  type Fila = { ingreso: number; tuCaso: boolean };
  const filas: Fila[] = anclas.map((v) => ({ ingreso: v, tuCaso: false }));
  if (ingreso > 0) filas.push({ ingreso, tuCaso: true });
  const porIngreso = new Map<number, Fila>();
  for (const f of filas.sort((a, b) => Number(a.tuCaso) - Number(b.tuCaso))) porIngreso.set(f.ingreso, f);
  const filasFinales = Array.from(porIngreso.values()).sort((a, b) => a.ingreso - b.ingreso).slice(0, 7);
  const rows = filasFinales.map((f) => {
    const base = Math.max(f.ingreso, SBU);
    const mes = base * TASA_VOLUNTARIO;
    return [
      `${fmt(f.ingreso)}${f.tuCaso ? ' (tu caso)' : ''}`,
      fmt(base),
      fmt(mes),
      fmt(mes * 12),
    ];
  });
  const _table = {
    title: `Aporte voluntario al IESS por ingreso declarado (SBU 2026 = ${fmt(SBU)})`,
    headers: ['Ingreso declarado', 'Base usada', 'Aporte mensual (17,60%)', 'Aporte anual'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'La base no puede ser menor a 1 SBU. El afiliado voluntario asume el 17,60% completo (no hay empleador que aporte la parte patronal).',
  };

  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Aporte mensual (17,60%)', value: Math.round(aporteMensual * 100) / 100 },
      { label: 'Te queda del ingreso', value: Math.round(Math.max(baseUsada - aporteMensual, 0) * 100) / 100 },
    ],
    ariaLabel: `Aporte voluntario ${fmtUSDec(aporteMensual)} sobre base ${fmtUSDec(baseUsada)}.`,
  };

  return {
    baseUsada: fmtUSDec(baseUsada),
    aporteMensual: fmtUSDec(aporteMensual),
    aporteAnual: fmtUSDec(aporteAnual),
    detalle: `Base usada ${fmtUSDec(baseUsada)} (mín. 1 SBU = ${fmtUSDec(SBU)}) × 17,60% = ${fmtUSDec(aporteMensual)}/mes · ${fmtUSDec(aporteAnual)}/año.`,
    _insight,
    _chart,
    _table,
  };
}
