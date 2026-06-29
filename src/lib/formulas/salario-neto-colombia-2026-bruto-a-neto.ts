import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  salario_bruto: number;
  incluye_auxilio: string; // "si" | "no"
}

export interface Outputs {
  salud: number;
  pension: number;
  fsp: number;
  auxilio: number;
  retencion: number;
  neto: number;
  _insight?: any;
  _table?: any;
}

// Tabla art. 383 ET (mensual, en UVT). Helper PURO: misma escala que COLOMBIA_2026.retefuenteArt383.
// Devuelve el impuesto en UVT a partir de la base gravable expresada en UVT.
function tabla383Uvt(baseUvt: number): number {
  const u = Math.max(0, baseUvt);
  for (const t of COLOMBIA_2026.retefuenteArt383) {
    if (u > t.desdeUvt && u <= t.hastaUvt) {
      return (u - t.desdeUvt) * t.tasa + t.adicionUvt;
    }
  }
  return 0;
}

// Núcleo de cálculo del salario neto. Misma lógica para el resultado y cada fila de la tabla.
function calcularNeto(salarioBruto: number, incluyeAuxilio: boolean) {
  const SMMLV = COLOMBIA_2026.smlmv;
  const UVT = COLOMBIA_2026.uvt;
  const bruto = Math.max(0, salarioBruto || 0);

  const ibc = bruto;
  const salud = ibc * COLOMBIA_2026.aportes.saludEmpleado;   // 4%
  const pension = ibc * COLOMBIA_2026.aportes.pensionEmpleado; // 4%
  const fsp = bruto > 4 * SMMLV ? ibc * 0.01 : 0;             // FSP solo > 4 SMMLV

  const auxilio = incluyeAuxilio && bruto <= 2 * SMMLV ? COLOMBIA_2026.auxilioTransporte : 0;

  // Depuración para renta exenta del 25% (art. 206-10 ET).
  const baseDep = bruto - salud - pension - fsp;
  const topeExentaMes = (COLOMBIA_2026.rentaExentaLaboral.topeAnualUvt * UVT) / 12; // 790 UVT/año → mensual
  const exenta25 = Math.min(baseDep * COLOMBIA_2026.rentaExentaLaboral.porcentaje, topeExentaMes);
  // Límite global del 40% de los ingresos netos (art. 336 ET).
  const limite40 = Math.min(exenta25, bruto * 0.40);

  const baseGravable = Math.max(0, baseDep - limite40);
  const baseUVT = baseGravable / UVT;
  const retencion = tabla383Uvt(baseUVT) * UVT;

  const neto = bruto + auxilio - salud - pension - fsp - retencion;

  return { bruto, salud, pension, fsp, auxilio, baseGravable, retencion, neto };
}

export function compute(i: Inputs): Outputs {
  const incluyeAuxilio = String(i.incluye_auxilio) === 'si';
  const r = calcularNeto(i.salario_bruto || 0, incluyeAuxilio);

  const SMMLV = COLOMBIA_2026.smlmv;
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const descuentos = r.salud + r.pension + r.fsp + r.retencion;
  const pctDescuento = r.bruto > 0 ? (descuentos / r.bruto) * 100 : 0;

  const _insight = {
    title: r.retencion > 0 ? 'Te aplican retención en la fuente' : 'Sin retención en la fuente',
    text:
      r.retencion > 0
        ? `Tu salario de **${fmtCOP(r.bruto)}** supera el umbral de retención (95 UVT ≈ ${fmtCOP(95 * COLOMBIA_2026.uvt)} de base gravable). Te quedan **${fmtCOP(r.neto)}** netos tras descontar **${fmtCOP(descuentos)}** (${pctDescuento.toFixed(1)}% del bruto).`
        : `Con **${fmtCOP(r.bruto)}** brutos no te aplican retención en la fuente. Tras EPS, pensión${r.fsp > 0 ? ' y FSP' : ''} te quedan **${fmtCOP(r.neto)}** netos.`,
    tone: (r.retencion > 0 ? 'warn' : 'good') as 'warn' | 'good',
    icon: '💵',
  };

  // Tabla: neto por nivel de salario, recorriendo el MISMO núcleo (calcularNeto).
  const anclas = [1, 2, 4, 6, 10].map((m) => Math.round(m * SMMLV));
  const filas = new Map<number, boolean>();
  for (const a of anclas) filas.set(a, false);
  if (r.bruto > 0) filas.set(r.bruto, true);
  const ordenadas = Array.from(filas.entries()).sort((a, b) => a[0] - b[0]).slice(0, 7);
  const rows = ordenadas.map(([sal, tuCaso]) => {
    const c = calcularNeto(sal, incluyeAuxilio);
    return [
      `${fmtCOP(sal)}${tuCaso ? ' (tu caso)' : ''}`,
      fmtCOP(c.salud + c.pension + c.fsp),
      fmtCOP(c.retencion),
      fmtCOP(c.neto),
    ];
  });
  const _table = {
    title: `Salario neto por nivel de ingreso (SMMLV 2026 = ${fmtCOP(SMMLV)})`,
    headers: ['Salario bruto', 'EPS + Pensión + FSP', 'Retención fuente', 'Salario neto'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'EPS 4% + Pensión 4% siempre; FSP 1% solo sobre salarios > 4 SMMLV; retención según art. 383 ET (depuración con renta exenta 25% y límite 40%). Auxilio de transporte se suma si el salario es ≤ 2 SMMLV.',
  };

  return {
    salud: Math.round(r.salud),
    pension: Math.round(r.pension),
    fsp: Math.round(r.fsp),
    auxilio: Math.round(r.auxilio),
    retencion: Math.round(r.retencion),
    neto: Math.round(r.neto),
    _insight,
    _table,
  };
}
