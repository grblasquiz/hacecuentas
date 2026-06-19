/**
 * Retención en la fuente por arrendamientos — Colombia 2026.
 * Bienes INMUEBLES: 3,5% sobre el canon, con base mínima de 27 UVT ($1.414.098 en 2026).
 *   Si el canon mensual es inferior a la base mínima, NO se practica retención.
 * Bienes MUEBLES: 4% sobre el canon, sin cuantía mínima (art. 1.2.4.9.1 DUR 1625/2016).
 * La retención la practica el agente retenedor (inmobiliaria o arrendatario declarante) al pagar el canon.
 * Constantes de retefuenteConceptos / UVT en src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  canonMensual: number | string;
  tipoBien?: string; // 'inmueble' | 'mueble'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const canon = num(i.canonMensual);
  if (canon <= 0) throw new Error('Ingresá el valor del canon mensual');

  const tipo = String(i.tipoBien ?? 'inmueble');
  const inmueble = C.retefuenteConceptos.find((c) => c.concepto === 'Arrendamiento bienes inmuebles')!;
  const baseMinima = inmueble.basePesos;           // 27 UVT = $1.414.098 (2026)
  const baseMinimaUvt = inmueble.baseUvt;           // 27

  let tarifa: number;
  let aplicaBase: boolean;       // ¿hay base mínima que el canon debe superar?
  let superaBase: boolean;
  if (tipo === 'mueble') {
    tarifa = 0.04;
    aplicaBase = false;
    superaBase = true;
  } else {
    tarifa = inmueble.declarante;  // 3,5%
    aplicaBase = true;
    superaBase = canon >= baseMinima;
  }

  const retencion = superaBase ? canon * tarifa : 0;
  const neto = canon - retencion;
  const tarifaTxt = `${(tarifa * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`;

  const _insight = {
    title: 'Retención sobre tu canon de arrendamiento',
    text: superaBase
      ? `Sobre un canon de **${fmtCOP(canon)}** (${tipo === 'mueble' ? 'bien mueble' : 'bien inmueble'}), el agente retenedor te descuenta el **${tarifaTxt}** = **${fmtCOP(retencion)}**, y te consigna **${fmtCOP(neto)}**. Esa retención no es un costo: es un **anticipo** de tu impuesto de renta que descontás en tu declaración.`
      : `Un canon de **${fmtCOP(canon)}** está **por debajo** de la base mínima de 27 UVT (**${fmtCOP(baseMinima)}** en 2026), así que **no se practica retención** sobre el arrendamiento de inmuebles. Recibís el canon completo: ${fmtCOP(canon)}.`,
    tone: superaBase ? ('info' as const) : ('good' as const),
    icon: '🏠',
  };

  const _chart = retencion > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Neto que recibís', value: Math.round(neto) },
          { label: `Retención (${tarifaTxt})`, value: Math.round(retencion) },
        ],
        prefix: '$',
        centerValue: fmtCOP(canon),
        centerLabel: 'canon',
        ariaLabel: `Canon ${fmtCOP(canon)}: retención ${fmtCOP(retencion)} y neto ${fmtCOP(neto)}.`,
      }
    : undefined;

  return {
    retencion: fmtCOP(retencion),
    netoRecibido: fmtCOP(neto),
    tarifa: `${tarifaTxt} (${tipo === 'mueble' ? 'bienes muebles' : 'bienes inmuebles'})`,
    baseMinima: aplicaBase ? `${fmtCOP(baseMinima)} (${baseMinimaUvt} UVT)` : 'Sin cuantía mínima',
    superaBase: aplicaBase ? (superaBase ? 'Sí, supera la base → se retiene' : 'No supera la base → no se retiene') : 'No aplica',
    detalle: superaBase
      ? `${fmtCOP(canon)} × ${tarifaTxt} = ${fmtCOP(retencion)}; neto ${fmtCOP(neto)}.`
      : `${fmtCOP(canon)} < ${fmtCOP(baseMinima)} (base mínima) → retención $0.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
