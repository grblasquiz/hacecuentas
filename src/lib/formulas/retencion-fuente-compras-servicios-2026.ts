/** Retención en la fuente por conceptos (Colombia 2026) — perspectiva del agente retenedor que paga una factura.
 *  Verifica la base mínima en UVT del concepto (Decreto 1625/2016; arts. 2-8 del D. 572/2025 suspendidos
 *  por el Consejo de Estado) y aplica la tarifa según si el beneficiario es declarante de renta o no. */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  concepto?: string;     // 'compras' | 'servicios' | 'honorarios' | 'arrendamiento'
  montoFactura: number;  // valor antes de IVA
  declarante?: string;   // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default (Number('') === 0 pisaría valores reales con ||). */
const num = (v: unknown, d = 0): number =>
  v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? d : Number(v);

const MAPA_CONCEPTO: Record<string, string> = {
  compras: 'Compras generales',
  servicios: 'Servicios generales',
  honorarios: 'Honorarios y comisiones',
  arrendamiento: 'Arrendamiento bienes inmuebles',
};

export function compute(i: Inputs): Outputs {
  const clave = String(i.concepto ?? 'compras');
  const monto = num(i.montoFactura);
  const esDeclarante = String(i.declarante ?? 'si') !== 'no';
  if (monto <= 0) throw new Error('Ingresá el valor de la factura (antes de IVA)');

  const nombre = MAPA_CONCEPTO[clave] ?? MAPA_CONCEPTO.compras;
  const row = COLOMBIA_2026.retefuenteConceptos.find((c) => c.concepto === nombre);
  if (!row) throw new Error('Concepto de retención no encontrado');

  const superaBase = monto >= row.basePesos || row.basePesos === 0;
  const tarifa = esDeclarante ? row.declarante : row.noDeclarante;
  const retencion = superaBase ? monto * tarifa : 0;
  const neto = monto - retencion;

  const etiquetaBase = row.baseUvt > 0
    ? `${row.baseUvt} UVT = ${fmtCOP(row.basePesos)}`
    : 'sin base mínima (se retiene desde $1)';

  const _insight = superaBase
    ? {
        title: 'Cuánto retener en este pago',
        text: `Por **${nombre.toLowerCase()}** a un beneficiario **${esDeclarante ? 'declarante' : 'no declarante'}** aplicás el **${(tarifa * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%** sobre ${fmtCOP(monto)}: retenés **${fmtCOP(retencion)}** y girás **${fmtCOP(neto)}**. La retención se declara y paga a la DIAN en la declaración mensual de retefuente.`,
        tone: 'neutral',
        icon: '🧾',
      }
    : {
        title: 'No aplica retención',
        text: `La factura de **${fmtCOP(monto)}** no alcanza la base mínima de **${etiquetaBase}** para ${nombre.toLowerCase()} en 2026. **No practicás retención** y pagás el valor completo.`,
        tone: 'good',
        icon: '✅',
      };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto a pagar al proveedor', value: Math.round(neto) },
      { label: 'Retención en la fuente', value: Math.round(retencion) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtCOP(retencion),
    centerLabel: 'Retención',
    ariaLabel: `Sobre una factura de ${fmtCOP(monto)}, la retención en la fuente es ${fmtCOP(retencion)} y el neto a pagar ${fmtCOP(neto)}.`,
  };

  return {
    retencion: fmtCOP(retencion),
    tarifaAplicada: superaBase
      ? `${(tarifa * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}% (${nombre}, ${esDeclarante ? 'declarante' : 'no declarante'})`
      : `0% — no supera la base mínima (${etiquetaBase})`,
    netoAPagar: fmtCOP(neto),
    detalle: superaBase
      ? `${nombre}: base mínima ${etiquetaBase} superada → ${fmtCOP(monto)} × ${(tarifa * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}% = ${fmtCOP(retencion)}. La base es el valor antes de IVA.`
      : `${nombre}: la factura (${fmtCOP(monto)}) está por debajo de la base mínima ${etiquetaBase} → retención $0.`,
    _insight,
    _chart,
  };
}
