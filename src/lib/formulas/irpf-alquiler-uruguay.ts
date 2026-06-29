import { fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  alquilerMensual: number;
  modo: string;            // "anticipo" | "anual"
  deduciblesAnuales: number;
}

export interface Outputs {
  retencionMensual: number;
  irpfAnual: number;
  creditoDGI: number;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// IRPF Categoría I (rendimientos de capital — arrendamientos), DGI. VERIFICADO:
// - Anticipo mensual: 10,5% del alquiler bruto (retención del inquilino/agente).
// - Liquidación anual: 12% sobre la renta neta (alquiler anual − gastos deducibles).
//   El art. 17 admite deducir hasta cierto tope de gastos reales o ficto; acá se
//   resta el monto deducible que ingrese el usuario.
const TASA_ANTICIPO = 0.105;
const TASA_ANUAL = 0.12;

function liquidar(alquilerMensual: number, modo: string, deducibles: number) {
  const retencionMensual = alquilerMensual * TASA_ANTICIPO;
  let irpfAnual = 0;
  let creditoDGI = 0;
  if (modo === 'anual') {
    const baseAnual = Math.max(alquilerMensual * 12 - deducibles, 0);
    irpfAnual = baseAnual * TASA_ANUAL;
    creditoDGI = Math.max(retencionMensual * 12 - irpfAnual, 0);
  }
  return { retencionMensual, irpfAnual, creditoDGI };
}

export function compute(i: Inputs): Outputs {
  const alquiler = Math.max(0, i.alquilerMensual || 0);
  const deducibles = Math.max(0, i.deduciblesAnuales || 0);
  const modo = i.modo === 'anual' ? 'anual' : 'anticipo';
  const r = liquidar(alquiler, modo, deducibles);
  const r2 = (n: number) => Math.round(n * 100) / 100;

  const _insight = modo === 'anual'
    ? {
        title: r.creditoDGI > 0
          ? `Te sobra un crédito de ${fmtUYU(r.creditoDGI)}`
          : `IRPF anual del alquiler: ${fmtUYU(r.irpfAnual)}`,
        text: `Sobre un alquiler de **${fmtUYU(alquiler)}**/mes el impuesto anual al 12% es **${fmtUYU(r.irpfAnual)}**. Como ya anticipaste **${fmtUYU(r.retencionMensual * 12)}** (10,5% mensual), ${r.creditoDGI > 0 ? `te queda un crédito a favor de **${fmtUYU(r.creditoDGI)}**.` : 'no te queda crédito a favor.'}`,
        tone: r.creditoDGI > 0 ? 'good' as const : 'info' as const,
        icon: '🏠',
      }
    : {
        title: `Retención mensual: ${fmtUYU(r.retencionMensual)}`,
        text: `El anticipo de IRPF sobre un alquiler de **${fmtUYU(alquiler)}** es el **10,5%**: **${fmtUYU(r.retencionMensual)}** por mes (**${fmtUYU(r.retencionMensual * 12)}** al año), que luego se imputa contra la liquidación anual al 12%.`,
        tone: 'info' as const,
        icon: '🏠',
      };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Anticipos 10,5% (año)', value: r2(r.retencionMensual * 12), color: '#2563eb', colorDark: '#3b82f6' },
      { label: 'IRPF anual 12%', value: r2(r.irpfAnual), color: '#dc2626', colorDark: '#ef4444' },
      { label: 'Crédito DGI', value: r2(r.creditoDGI), color: '#16a34a', colorDark: '#22c55e' },
    ],
    format: 'currency',
    ariaLabel: `Anticipos ${fmtUYU(r.retencionMensual * 12)} contra IRPF anual ${fmtUYU(r.irpfAnual)}`,
  };

  // Tabla: anticipo y liquidación anual por nivel de alquiler (sin deducibles).
  const anclas = [15000, 25000, 40000, 60000];
  if (alquiler > 0 && !anclas.includes(alquiler)) anclas.push(alquiler);
  anclas.sort((a, b) => a - b);
  const _table = {
    title: 'Anticipo y liquidación anual de IRPF por alquiler mensual',
    headers: ['Alquiler mensual', 'Anticipo 10,5%/mes', 'Anticipos año', 'IRPF anual 12%'],
    align: ['right', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: anclas.slice(0, 7).map((a) => {
      const x = liquidar(a, 'anual', 0);
      return [
        `${fmtUYU(a)}${a === alquiler ? ' (tu caso)' : ''}`,
        fmtUYU(x.retencionMensual),
        fmtUYU(x.retencionMensual * 12),
        fmtUYU(x.irpfAnual),
      ];
    }),
    note: 'DGI: anticipo mensual 10,5% del alquiler bruto; liquidación anual 12% sobre la renta neta (alquiler anual − gastos deducibles). Los anticipos se acreditan contra el impuesto anual.',
  };

  return {
    retencionMensual: r2(r.retencionMensual),
    irpfAnual: r2(r.irpfAnual),
    creditoDGI: r2(r.creditoDGI),
    _insight,
    _chart,
    _table,
  };
}
