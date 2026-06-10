/**
 * PILA de independientes Colombia 2026 — Ley 100/1993 + Ley 2277/2022 art. 89.
 * IBC = 40% del ingreso mensual (piso 1 SMLMV, tope 25 SMLMV).
 * Salud 12,5% + pensión 16% del IBC, FSP desde 4 SMLMV de IBC, ARL opcional (clase I-V).
 * Reforma pensional Ley 2381/2024 SUSPENDIDA (Auto 841/2025 Corte Constitucional): rige Ley 100.
 */
import { COLOMBIA_2026, tasaFsp, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  ingresoMensual: number;
  claseArl?: string; // 'ninguna' | 'I' | 'II' | 'III' | 'IV' | 'V'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: unknown): number {
  if (v === '' || v === null || v === undefined) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export function compute(i: Inputs): Outputs {
  const ingreso = num(i.ingresoMensual);
  if (!(ingreso > 0)) throw new Error('Ingresá tus ingresos mensuales en pesos');

  const C = COLOMBIA_2026;
  const IND = C.independientes;
  const clase = String(i.claseArl ?? 'ninguna').trim().toUpperCase();
  const tasaArl: number = (C.aportes.arl as Record<string, number>)[clase] ?? 0;

  const base40 = ingreso * IND.ibcPorcentajeIngresos;
  const piso = C.smlmv * C.aportes.ibcMinimoSmlmv;
  const tope = C.smlmv * C.aportes.ibcTopeSmlmv;
  const ibc = Math.min(Math.max(base40, piso), tope);
  const enPiso = base40 < piso;
  const enTope = base40 > tope;
  const bajoMinimo = ingreso < C.smlmv;

  const salud = ibc * IND.salud;
  const pension = ibc * IND.pension;
  const tFsp = tasaFsp(ibc);
  const fsp = ibc * tFsp;
  const arl = ibc * tasaArl;
  const total = salud + pension + fsp + arl;
  const pctEfectivo = (total / ingreso) * 100;

  const fmtPct = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 1 });

  const partes = [`salud **${fmtCOP(salud)}** (12,5%)`, `pensión **${fmtCOP(pension)}** (16%)`];
  if (fsp > 0) partes.push(`FSP **${fmtCOP(fsp)}** (${(tFsp * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%)`);
  if (arl > 0) partes.push(`ARL clase ${clase} **${fmtCOP(arl)}**`);

  const _insight = bajoMinimo
    ? {
        title: 'Ingresos por debajo del salario mínimo',
        text: `Con ingresos menores a 1 SMLMV (**${fmtCOP(C.smlmv)}**) no estás obligado a cotizar como independiente. Si igual querés cotizar, el IBC mínimo legal es 1 SMLMV: ${partes.join(' + ')} = **${fmtCOP(total)}** al mes (el **${fmtPct(pctEfectivo)}%** de tu ingreso).`,
        tone: 'warn' as const,
        icon: '🧾',
      }
    : {
        title: 'Tu PILA del mes',
        text: `Sobre ingresos de **${fmtCOP(ingreso)}** cotizás por un IBC de **${fmtCOP(ibc)}** (${enPiso ? 'piso de 1 SMLMV, porque el 40% de tu ingreso queda por debajo del mínimo' : enTope ? 'tope de 25 SMLMV' : '40% del ingreso'}): ${partes.join(' + ')} = **${fmtCOP(total)}** al mes, el **${fmtPct(pctEfectivo)}%** de tu ingreso. Se paga mes vencido por la planilla PILA.`,
        tone: 'good' as const,
        icon: '🧾',
      };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salud (12,5%)', value: Math.round(salud) },
      { label: 'Pensión (16%)', value: Math.round(pension) },
      { label: 'FSP', value: Math.round(fsp) },
      { label: `ARL clase ${clase}`, value: Math.round(arl) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCOP(total),
    centerLabel: 'PILA mensual',
    ariaLabel: `Aportes PILA de ${fmtCOP(total)} al mes: ${fmtCOP(salud)} a salud, ${fmtCOP(pension)} a pensión${fsp > 0 ? `, ${fmtCOP(fsp)} al FSP` : ''}${arl > 0 ? ` y ${fmtCOP(arl)} a ARL` : ''}`,
  };

  return {
    total_pila: fmtCOP(total),
    ibc: `${fmtCOP(ibc)}${enPiso ? ' (piso: 1 SMLMV)' : enTope ? ' (tope: 25 SMLMV)' : ' (40% del ingreso)'}`,
    salud: fmtCOP(salud),
    pension: fmtCOP(pension),
    fsp: fsp > 0 ? `${fmtCOP(fsp)} (${(tFsp * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%)` : '$0 (IBC menor a 4 SMLMV)',
    arl: arl > 0 ? `${fmtCOP(arl)} (clase ${clase}, ${(tasaArl * 100).toLocaleString('es-CO', { maximumFractionDigits: 3 })}%)` : '$0 (no incluida)',
    pct_efectivo: `${fmtPct(pctEfectivo)}% de tu ingreso`,
    detalle: `IBC = 40% × ${fmtCOP(ingreso)} = ${fmtCOP(base40)}${enPiso ? ` → se eleva al piso de ${fmtCOP(piso)}` : ''}${enTope ? ` → se limita al tope de ${fmtCOP(tope)}` : ''}. Salud 12,5% + pensión 16%${tFsp > 0 ? ` + FSP ${(tFsp * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%` : ''}${tasaArl > 0 ? ` + ARL ${(tasaArl * 100).toLocaleString('es-CO', { maximumFractionDigits: 3 })}%` : ''} sobre el IBC = ${fmtCOP(total)}.`,
    _insight,
    _chart,
  };
}
