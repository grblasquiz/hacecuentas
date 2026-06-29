import { fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  cobertura: string;     // "sin-fonasa" | "individual" | "conyuge" | "hijos"
  mesesActividad: number;
  ingresoAnual: number;
}

export interface Outputs {
  cuotaMensual: number;
  cuotaConGradualidad: number;
  superaTope: string;
  topeRestante: number;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// ⚠️ Montos de cuota DUDOSOS — verificar valores vigentes con BPS antes de pagar.
// La gradualidad (25%/50%/100% del aporte jubilatorio en los primeros tramos de
// antigüedad) está VERIFICADA; los montos base son referenciales y deben
// contrastarse con la tabla oficial del BPS del año en curso.
const BASES: Record<string, number> = {
  'sin-fonasa': 3900,
  individual: 6500,
  conyuge: 8600,
  hijos: 9300,
};
const APORTE_JUBILATORIO_BASE = 3900; // parte jubilatoria sobre la que aplica la gradualidad
const TOPE_ANUAL = 1175537;           // tope de facturación anual (referencial — verificar BPS)

function factorGradualidad(meses: number): number {
  if (meses <= 12) return 0.25;
  if (meses <= 24) return 0.50;
  return 1.0;
}

function calcular(cobertura: string, meses: number) {
  const base = BASES[cobertura] ?? BASES.individual;
  const fonasaPart = base - APORTE_JUBILATORIO_BASE; // diferencia por cobertura de salud
  const factor = factorGradualidad(meses);
  const cuotaMensual = base;
  const cuotaConGradualidad = APORTE_JUBILATORIO_BASE * factor + fonasaPart;
  return { base, fonasaPart, factor, cuotaMensual, cuotaConGradualidad };
}

export function compute(i: Inputs): Outputs {
  const meses = Math.max(0, i.mesesActividad || 0);
  const ingresoAnual = Math.max(0, i.ingresoAnual || 0);
  const c = calcular(i.cobertura || 'individual', meses);

  const superaTope = ingresoAnual > TOPE_ANUAL ? 'Sí' : 'No';
  const topeRestante = TOPE_ANUAL - ingresoAnual;

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const pctGrad = Math.round(c.factor * 100);

  const _insight = {
    title: `Cuota mensual de monotributo: ${fmtUYU(c.cuotaConGradualidad)}`,
    text: c.factor < 1
      ? `Por estar en los primeros **${meses <= 12 ? '12' : '24'} meses** pagás la parte jubilatoria al **${pctGrad}%** (gradualidad): **${fmtUYU(c.cuotaConGradualidad)}**/mes en lugar de los **${fmtUYU(c.cuotaMensual)}** plenos.`
      : `Ya pagás la cuota plena: **${fmtUYU(c.cuotaMensual)}**/mes (gradualidad agotada tras 24 meses).`,
    tone: superaTope === 'Sí' ? 'warn' as const : 'info' as const,
    icon: '🧾',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: `Con gradualidad (${pctGrad}%)`, value: r2(c.cuotaConGradualidad), color: '#16a34a', colorDark: '#22c55e' },
      { label: 'Cuota plena', value: r2(c.cuotaMensual), color: '#2563eb', colorDark: '#3b82f6' },
    ],
    format: 'currency',
    ariaLabel: `Cuota con gradualidad ${fmtUYU(c.cuotaConGradualidad)} frente a cuota plena ${fmtUYU(c.cuotaMensual)}`,
  };

  // Tabla: cuota por tramo de antigüedad para la cobertura elegida.
  const tramos = [
    { label: 'Primeros 12 meses (25%)', meses: 6 },
    { label: 'Meses 13 a 24 (50%)', meses: 18 },
    { label: 'Mes 25 en adelante (100%)', meses: 30 },
  ];
  const _table = {
    title: 'Cuota mensual de monotributo BPS por antigüedad',
    headers: ['Tramo de antigüedad', 'Aporte jubilatorio', 'Parte salud', 'Cuota total'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tramos.map((t) => {
      const x = calcular(i.cobertura || 'individual', t.meses);
      return [
        t.label,
        fmtUYU(APORTE_JUBILATORIO_BASE * x.factor),
        fmtUYU(x.fonasaPart),
        fmtUYU(x.cuotaConGradualidad),
      ];
    }),
    note: 'Montos referenciales 2026 — verificá la tabla vigente en BPS. La gradualidad reduce el aporte jubilatorio al 25% (año 1), 50% (año 2) y 100% (desde el mes 25).',
  };

  return {
    cuotaMensual: r2(c.cuotaMensual),
    cuotaConGradualidad: r2(c.cuotaConGradualidad),
    superaTope,
    topeRestante: r2(topeRestante),
    _insight,
    _chart,
    _table,
  };
}
