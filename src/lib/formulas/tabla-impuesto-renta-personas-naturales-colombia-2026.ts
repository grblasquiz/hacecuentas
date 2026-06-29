import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  renta_liquida: number;
}

export interface Outputs {
  renta_uvt: number;
  impuesto: number;
  tarifa_marginal: number;
  tarifa_efectiva: number;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Helper puro: tabla del art. 241 ET (cédula general) sobre la base gravable ANUAL en COP.
// Rangos en UVT anuales (fuente única: COLOMBIA_2026.rentaArt241). Devuelve impuesto en COP,
// la tarifa marginal del tramo y la base en UVT. Misma lógica para el resultado y la tabla.
function tabla241(baseGravableAnual: number, uvt: number) {
  const base = Math.max(0, baseGravableAnual || 0);
  const baseUvt = base / uvt;
  for (const t of COLOMBIA_2026.rentaArt241) {
    if (baseUvt > t.desdeUvt && baseUvt <= t.hastaUvt) {
      const impuestoUvt = (baseUvt - t.desdeUvt) * t.tasa + t.adicionUvt;
      return { baseUvt, impuesto: impuestoUvt * uvt, tarifaMarginal: t.tasa };
    }
  }
  // baseUvt === 0 cae acá (primer tramo es desde 0 con > estricto)
  return { baseUvt, impuesto: 0, tarifaMarginal: 0 };
}

export function compute(i: Inputs): Outputs {
  const UVT = COLOMBIA_2026.uvt; // UVT 2026 = $52.374 (Resolución DIAN 000238/2025)
  const rentaLiquida = Math.max(0, i.renta_liquida || 0);

  const r = tabla241(rentaLiquida, UVT);
  const rentaUvt = r.baseUvt;
  const impuesto = r.impuesto;
  const tarifaMarginal = r.tarifaMarginal;
  const tarifaEfectiva = rentaLiquida > 0 ? impuesto / rentaLiquida : 0;

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const fmtPct = (n: number) => (n * 100).toLocaleString('es-CO', { maximumFractionDigits: 2 }) + '%';

  const exento = rentaUvt <= 1090;
  const _insight = exento
    ? {
        title: 'No pagás impuesto de renta',
        text: `Tu renta líquida gravable de **${fmtCOP(rentaLiquida)}** equivale a **${(Math.round(rentaUvt * 10) / 10).toLocaleString('es-CO')} UVT**, por debajo del piso de **1.090 UVT** (${fmtCOP(1090 * UVT)}). Impuesto: **$0**.`,
        tone: 'good' as const,
        icon: '🧾',
      }
    : {
        title: `Impuesto de renta: ${fmtCOP(impuesto)}`,
        text: `Sobre una renta líquida gravable de **${fmtCOP(rentaLiquida)}** (${(Math.round(rentaUvt * 10) / 10).toLocaleString('es-CO')} UVT) pagás **${fmtCOP(impuesto)}**. Tu tarifa marginal es **${fmtPct(tarifaMarginal)}** y la efectiva (lo que realmente pagás sobre el total) es **${fmtPct(tarifaEfectiva)}**.`,
        tone: 'warn' as const,
        icon: '🧾',
      };

  const _chart = {
    type: 'scale',
    marker: Math.min(rentaUvt, 31000),
    markerLabel: `${(Math.round(rentaUvt * 10) / 10).toLocaleString('es-CO')} UVT`,
    min: 0,
    segments: [
      { nombre: '0%', max: 1090, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: '19%', max: 1700, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: '28%', max: 4100, color: '#eab308', colorDark: '#facc15' },
      { nombre: '33%', max: 8670, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: '35%', max: 18970, color: '#f97316', colorDark: '#fb923c' },
      { nombre: '37%', max: 31000, color: '#ea580c', colorDark: '#f97316' },
      { nombre: '39%', max: Math.max(34000, Math.ceil(rentaUvt) + 1000), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Renta líquida de ${(Math.round(rentaUvt * 10) / 10).toLocaleString('es-CO')} UVT ubicada en la tabla del art. 241`,
  };

  // Tabla computada: impuesto por nivel de renta líquida. Cada fila pasa por el MISMO
  // helper tabla241 → tramos/tarifas idénticos al resultado principal. La fila "(tu caso)"
  // usa tu renta real. Anclas expresadas en UVT para cubrir un punto de cada tramo.
  const anclasUvt = [1090, 1700, 4100, 8670, 18970, 31000];
  type Fila = { renta: number; tuCaso: boolean };
  const filas: Fila[] = anclasUvt.map((u) => ({ renta: Math.round(u * UVT), tuCaso: false }));
  if (rentaLiquida > 0) filas.push({ renta: Math.round(rentaLiquida), tuCaso: true });
  const porRenta = new Map<number, Fila>();
  for (const f of filas.sort((a, b) => Number(a.tuCaso) - Number(b.tuCaso))) porRenta.set(f.renta, f);
  const filasFinales = Array.from(porRenta.values()).sort((a, b) => a.renta - b.renta).slice(0, 7);
  const tableRows = filasFinales.map((f) => {
    const c = tabla241(f.renta, UVT);
    const efectiva = f.renta > 0 ? c.impuesto / f.renta : 0;
    return [
      `${fmtCOP(f.renta)}${f.tuCaso ? ' (tu caso)' : ''}`,
      `${(Math.round(c.baseUvt * 10) / 10).toLocaleString('es-CO')} UVT`,
      fmtPct(c.tarifaMarginal),
      fmtCOP(c.impuesto),
      fmtPct(efectiva),
    ];
  });
  const _table = {
    title: `Impuesto de renta por nivel de renta líquida gravable (UVT 2026 = ${fmtCOP(UVT)})`,
    headers: ['Renta líquida anual', 'En UVT', 'Tarifa marginal', 'Impuesto', 'Tarifa efectiva'],
    align: ['left', 'right', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: 'Tabla del art. 241 ET (cédula general): exento bajo 1.090 UVT; luego tramos marginales del 19% al 39%. La tarifa efectiva es siempre menor que la marginal porque solo el excedente de cada tramo se grava a la tasa mayor.',
  };

  return {
    renta_uvt: Math.round(rentaUvt * 100) / 100,
    impuesto: Math.round(impuesto),
    tarifa_marginal: Math.round(tarifaMarginal * 10000) / 100, // en %
    tarifa_efectiva: Math.round(tarifaEfectiva * 10000) / 100, // en %
    _insight,
    _chart,
    _table,
  };
}
