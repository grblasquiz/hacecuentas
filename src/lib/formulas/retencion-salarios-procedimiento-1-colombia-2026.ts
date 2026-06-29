import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  salario_bruto: number;
  interes_vivienda: number;
  prepagada: number;
  dependientes: string; // "si" | "no"
  aporte_voluntario: number;
}

export interface Outputs {
  base_gravable: number;
  base_uvt: number;
  retencion: number;
  tarifa_efectiva: number;
  _insight?: any;
  _table?: any;
}

// Tabla art. 383 ET (mensual, en UVT). Helper PURO sobre COLOMBIA_2026.retefuenteArt383.
function tabla383Uvt(baseUvt: number): number {
  const u = Math.max(0, baseUvt);
  for (const t of COLOMBIA_2026.retefuenteArt383) {
    if (u > t.desdeUvt && u <= t.hastaUvt) {
      return (u - t.desdeUvt) * t.tasa + t.adicionUvt;
    }
  }
  return 0;
}

// Tarifa marginal del tramo del art. 383 (para mostrar el "escalón" en el que cae).
function tarifaMarginal383(baseUvt: number): number {
  const u = Math.max(0, baseUvt);
  for (const t of COLOMBIA_2026.retefuenteArt383) {
    if (u > t.desdeUvt && u <= t.hastaUvt) return t.tasa;
  }
  return 0;
}

function calcularRetencion(
  salarioBruto: number,
  interesVivienda: number,
  prepagada: number,
  dependientes: boolean,
  aporteVoluntario: number,
) {
  const SMMLV = COLOMBIA_2026.smlmv;
  const UVT = COLOMBIA_2026.uvt;
  const bruto = Math.max(0, salarioBruto || 0);

  // Aportes obligatorios: 8% (salud 4% + pensión 4%) + FSP 1% si > 4 SMMLV.
  const aportes = bruto * 0.08 + (bruto > 4 * SMMLV ? bruto * 0.01 : 0);
  const ingresoNeto = bruto - aportes;

  // Deducciones (art. 387 ET) — topes mensuales en UVT.
  const dedVivienda = Math.min(Math.max(0, interesVivienda || 0), (100 * UVT) / 12); // intereses vivienda, tope 100 UVT/mes
  const dedPrepagada = Math.min(Math.max(0, prepagada || 0), (16 * UVT) / 12);        // medicina prepagada, tope 16 UVT/mes
  const dedDependientes = dependientes ? Math.min(bruto * 0.10, (32 * UVT) / 12) : 0; // 10% ingreso, tope 32 UVT/mes
  const aporteVol = Math.max(0, aporteVoluntario || 0);

  // Renta exenta 25% (art. 206-10), tope 790 UVT/año.
  const exenta25 = Math.min(ingresoNeto * COLOMBIA_2026.rentaExentaLaboral.porcentaje, (790 * UVT) / 12);

  const totalBeneficios = dedVivienda + dedPrepagada + dedDependientes + aporteVol + exenta25;
  // Límite global del 40% (art. 336 ET), tope 1.340 UVT/año.
  const limite40 = Math.min(totalBeneficios, ingresoNeto * 0.40, (1340 * UVT) / 12);

  const baseGravable = Math.max(0, ingresoNeto - limite40);
  const baseUVT = baseGravable / UVT;
  const retencion = tabla383Uvt(baseUVT) * UVT;
  const tarifaEfectiva = bruto > 0 ? retencion / bruto : 0;
  const marginal = tarifaMarginal383(baseUVT);

  return { bruto, aportes, baseGravable, baseUVT, retencion, tarifaEfectiva, marginal };
}

export function compute(i: Inputs): Outputs {
  const dependientes = String(i.dependientes) === 'si';
  const r = calcularRetencion(
    i.salario_bruto || 0,
    i.interes_vivienda || 0,
    i.prepagada || 0,
    dependientes,
    i.aporte_voluntario || 0,
  );

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const _insight = {
    title: r.retencion > 0 ? 'Te retienen en la fuente' : 'No te retienen en la fuente',
    text:
      r.retencion > 0
        ? `Tu base gravable es **${(Math.round(r.baseUVT * 100) / 100).toLocaleString('es-CO')} UVT** (${fmtCOP(r.baseGravable)}), que cae en el tramo del **${(r.marginal * 100).toLocaleString('es-CO')}%** marginal. Te retienen **${fmtCOP(r.retencion)}** al mes (tarifa efectiva ${(r.tarifaEfectiva * 100).toFixed(2)}%).`
        : `Tu base gravable es **${(Math.round(r.baseUVT * 100) / 100).toLocaleString('es-CO')} UVT**, por debajo de las 95 UVT donde arranca la tabla del art. 383. **No te retienen** este mes.`,
    tone: (r.retencion > 0 ? 'warn' : 'good') as 'warn' | 'good',
    icon: '🧾',
  };

  // Tabla: retención por nivel de salario, sin deducciones extra (solo aportes + exenta 25%),
  // para mostrar el escalón base. Recorre el MISMO núcleo.
  const SMMLV = COLOMBIA_2026.smlmv;
  const anclas = [3, 4, 6, 8, 12].map((m) => Math.round(m * SMMLV));
  const filas = new Map<number, boolean>();
  for (const a of anclas) filas.set(a, false);
  if (r.bruto > 0) filas.set(r.bruto, true);
  const ordenadas = Array.from(filas.entries()).sort((a, b) => a[0] - b[0]).slice(0, 7);
  const rows = ordenadas.map(([sal, tuCaso]) => {
    const c = calcularRetencion(sal, tuCaso ? (i.interes_vivienda || 0) : 0, tuCaso ? (i.prepagada || 0) : 0, tuCaso ? dependientes : false, tuCaso ? (i.aporte_voluntario || 0) : 0);
    return [
      `${fmtCOP(sal)}${tuCaso ? ' (tu caso)' : ''}`,
      fmtCOP(c.baseGravable),
      fmtCOP(c.retencion),
      `${(c.tarifaEfectiva * 100).toFixed(2)} %`,
    ];
  });
  const _table = {
    title: `Retención en la fuente por salario (Procedimiento 1, ${fmtCOP(COLOMBIA_2026.uvt)}/UVT)`,
    headers: ['Salario bruto', 'Base gravable', 'Retención mensual', 'Tarifa efectiva'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'Filas de referencia con aportes obligatorios y renta exenta 25%, sin deducciones extra (salvo tu caso). La retención real depende de vivienda, dependientes, prepagada y aportes voluntarios.',
  };

  return {
    base_gravable: Math.round(r.baseGravable),
    base_uvt: Math.round(r.baseUVT * 100) / 100,
    retencion: Math.round(r.retencion),
    tarifa_efectiva: Math.round(r.tarifaEfectiva * 10000) / 100, // porcentaje con 2 decimales
    _insight,
    _table,
  };
}
