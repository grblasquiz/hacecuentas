/** Sanción por extemporaneidad DIAN (Colombia) — arts. 639, 641 y 642 del Estatuto Tributario.
 *  Antes de emplazamiento: 5% del impuesto a cargo por mes o fracción, tope 100% (art. 641).
 *  Después de emplazamiento: 10% por mes o fracción, tope 200% (art. 642).
 *  Siempre rige la sanción mínima de 10 UVT (art. 639). */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  impuestoACargo: number;
  mesesRetraso?: number;
  fechaVencimiento?: string;
  fechaPresentacion?: string;
  emplazamiento?: string; // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default (Number('') === 0 pisaría valores reales con ||). */
const num = (v: unknown, d = 0): number =>
  v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? d : Number(v);

// Tope del art. 642 ET = 200% del impuesto (2× el tope del art. 641). Porcentaje
// estatutario fijo desde la Ley 1111/2006, no se indexa por año.
const FACTOR_TOPE_CON_EMPLAZAMIENTO = 2;

function parseLocalDate(value?: string): Date | null {
  if (!value) return null;
  const parts = String(value).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function mesesOMesFraccion(fechaVencimiento?: string, fechaPresentacion?: string): number | null {
  const vencimiento = parseLocalDate(fechaVencimiento);
  if (!vencimiento) return null;
  const presentacion = parseLocalDate(fechaPresentacion) || new Date();
  presentacion.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);
  if (presentacion <= vencimiento) throw new Error('La fecha de presentación debe ser posterior al vencimiento');
  const diffMs = presentacion.getTime() - vencimiento.getTime();
  const dias = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return Math.max(1, Math.ceil(dias / 30));
}

export function compute(i: Inputs): Outputs {
  const impuesto = Math.max(0, num(i.impuestoACargo));
  const mesesPorFechas = mesesOMesFraccion(i.fechaVencimiento, i.fechaPresentacion);
  const mesesIngresados = mesesPorFechas ?? num(i.mesesRetraso);
  const conEmplazamiento = String(i.emplazamiento ?? 'no') === 'si';
  if (mesesIngresados <= 0) throw new Error('Ingresá los meses de retraso (una fracción de mes cuenta como mes completo)');

  // "Mes o fracción": 2,1 meses de retraso liquidan 3 meses completos.
  const meses = Math.ceil(mesesIngresados);

  const S = COLOMBIA_2026.sanciones;
  const tasaMes = conEmplazamiento ? S.extemporaneidadConEmplazamientoPorMes : S.extemporaneidadPorMes;
  const tope = conEmplazamiento ? S.extemporaneidadTope * FACTOR_TOPE_CON_EMPLAZAMIENTO : S.extemporaneidadTope;

  const porcentajeSinTope = tasaMes * meses;
  const porcentaje = Math.min(porcentajeSinTope, tope);
  const topeAplicado = porcentajeSinTope > tope;

  const sancionCalculada = impuesto * porcentaje;
  const sancionMinima = S.minimaUvt * COLOMBIA_2026.uvt; // 10 UVT = $523.740 en 2026
  const minimaAplicada = sancionCalculada < sancionMinima;
  const sancion = Math.max(sancionCalculada, sancionMinima);
  const total = impuesto + sancion;

  const articulo = conEmplazamiento ? 'art. 642 ET: 10%/mes, tope 200%' : 'art. 641 ET: 5%/mes, tope 100%';

  let texto: string;
  if (impuesto === 0) {
    texto = `Tu declaración no arroja impuesto a cargo, así que aplica directo la **sanción mínima de 10 UVT = ${fmtCOP(sancionMinima)}** (art. 639 ET). Ojo: cuando no hay impuesto, la DIAN puede liquidar la sanción sobre tus **ingresos brutos** del período (art. 641 inc. 3), por lo que este valor es el **piso legal**, no necesariamente el definitivo.`;
  } else if (minimaAplicada) {
    texto = `Con ${meses} ${meses === 1 ? 'mes' : 'meses'} de retraso, el ${(porcentaje * 100).toFixed(0)}% de tu impuesto da **${fmtCOP(sancionCalculada)}**, pero rige la **sanción mínima de 10 UVT = ${fmtCOP(sancionMinima)}** (art. 639 ET). Total a pagar con impuesto: **${fmtCOP(total)}**.`;
  } else {
    texto = `Por declarar ${meses} ${meses === 1 ? 'mes' : 'meses'} tarde ${conEmplazamiento ? 'después del emplazamiento' : 'antes de emplazamiento'}, la sanción es el **${(porcentaje * 100).toFixed(0)}% del impuesto** (${articulo})${topeAplicado ? ', ya en el tope legal' : ''}: **${fmtCOP(sancion)}**. Sumando el impuesto, pagás **${fmtCOP(total)}** — sin contar intereses de mora, que corren aparte.`;
  }

  const _insight = {
    title: minimaAplicada || impuesto === 0 ? 'Aplica la sanción mínima' : 'Tu sanción por extemporaneidad',
    text: texto,
    tone: 'warn',
    icon: '⏰',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Impuesto a cargo', value: Math.round(impuesto) },
      { label: 'Sanción extemporaneidad', value: Math.round(sancion) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtCOP(total),
    centerLabel: 'Total a pagar',
    ariaLabel: `Total a pagar de ${fmtCOP(total)}: impuesto de ${fmtCOP(impuesto)} más sanción por extemporaneidad de ${fmtCOP(sancion)}.`,
  };

  return {
    sancion: fmtCOP(sancion),
    porcentajeAplicado: minimaAplicada || impuesto === 0
      ? `Sanción mínima 10 UVT (art. 639 ET)`
      : `${(porcentaje * 100).toFixed(0)}% del impuesto (${articulo})${topeAplicado ? ' — tope legal alcanzado' : ''}`,
    totalAPagar: fmtCOP(total),
    detalle: impuesto === 0
      ? `Sin impuesto a cargo → sanción mínima ${S.minimaUvt} UVT × ${fmtCOP(COLOMBIA_2026.uvt)} = ${fmtCOP(sancionMinima)}. No incluye intereses de mora.`
      : `${fmtCOP(impuesto)} × ${(tasaMes * 100).toFixed(0)}% × ${meses} ${meses === 1 ? 'mes' : 'meses'}${topeAplicado ? ` (topado al ${(tope * 100).toFixed(0)}%)` : ''} = ${fmtCOP(sancionCalculada)}${minimaAplicada ? ` → rige la mínima ${fmtCOP(sancionMinima)}` : ''}. Total con impuesto: ${fmtCOP(total)}. No incluye intereses de mora.`,
    _insight,
    _chart,
  };
}
