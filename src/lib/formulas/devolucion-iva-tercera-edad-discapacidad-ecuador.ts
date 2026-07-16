/**
 * Devolución del IVA a personas adultas mayores y personas con discapacidad (Ecuador).
 * Base legal: LORTI y Reglamento; devolución del IVA pagado en bienes/servicios de
 * primera necesidad de uso personal.
 * - Tope mensual tercera edad 2026 = IVA (15%) × 2 SBU = 0,15 × 2 × 482 = USD 144,60.
 *   Fuente: SRI (sri.gob.ec), verificado 2026-07-16.
 * - Discapacidad: el tope se aplica en proporción al grado certificado por el CONADIS
 *   (tabla de proporcionalidad de la Ley Orgánica de Discapacidades):
 *   30-49% → 60% · 50-74% → 70% · 75-84% → 80% · 85-100% → 100%.
 * IVA general 15% (ECUADOR_2026.iva).
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  gastoConIva: number;         // total de compras del mes GRAVADAS con IVA 15% (valor con IVA)
  beneficiario?: string;       // 'tercera_edad' | 'discapacidad'
  gradoDiscapacidad?: number;  // % de discapacidad certificado (solo si beneficiario = discapacidad)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const SBU = ECUADOR_2026.sbu;   // 482
const IVA = ECUADOR_2026.iva;   // 0,15

/** Factor de proporcionalidad por grado de discapacidad (Ley Orgánica de Discapacidades). */
function factorDiscapacidad(grado: number): number {
  if (grado >= 85) return 1.00;
  if (grado >= 75) return 0.80;
  if (grado >= 50) return 0.70;
  if (grado >= 30) return 0.60;
  return 0; // menos de 30% no accede al beneficio
}

export function compute(i: Inputs): Outputs {
  const gasto = Number(i.gastoConIva) || 0;
  const tipo = String(i.beneficiario || 'tercera_edad');
  const grado = Math.max(0, Math.min(100, Number(i.gradoDiscapacidad) || 0));
  if (gasto <= 0) throw new Error('Ingresá el total de tus compras del mes gravadas con IVA (15%)');

  // Tope base mensual: IVA sobre 2 SBU.
  const topeBase = IVA * 2 * SBU;                 // 144,60
  const factor = tipo === 'discapacidad' ? factorDiscapacidad(grado) : 1;
  const tope = topeBase * factor;

  // IVA efectivamente pagado dentro del gasto ingresado (valor con IVA → componente IVA).
  const ivaPagado = gasto * (IVA / (1 + IVA));    // gasto × 0,15/1,15
  const devolucion = Math.min(ivaPagado, tope);
  const devolucionAnual = devolucion * 12;
  const topeado = ivaPagado > tope;

  const beneficiarioLabel = tipo === 'discapacidad'
    ? `persona con discapacidad (${grado}%, factor ${Math.round(factor * 100)}%)`
    : 'adulto mayor (65+)';

  const _insight = {
    title: 'Tu devolución de IVA del mes',
    text: factor === 0
      ? `Con un grado de discapacidad de **${grado}%** no se accede a la devolución del IVA: la Ley exige al menos **30%** certificado por el CONADIS.`
      : `Como **${beneficiarioLabel}**, sobre compras por **${fmtUSDec(gasto)}** pagaste **${fmtUSDec(ivaPagado)}** de IVA. El SRI te devuelve **${fmtUSDec(devolucion)}** este mes${topeado ? ` (llegaste al tope de **${fmtUSDec(tope)}**)` : ''}. En un año, hasta **${fmtUSDec(devolucionAnual)}**.`,
    tone: factor === 0 ? 'warn' : 'good',
    icon: '🧾',
  };
  const _chart = {
    type: 'bar',
    labels: ['IVA pagado', 'Te devuelven', 'Tope mensual'],
    values: [Math.round(ivaPagado * 100) / 100, Math.round(devolucion * 100) / 100, Math.round(tope * 100) / 100],
    prefix: '$ ',
    ariaLabel: `IVA pagado ${fmtUSDec(ivaPagado)}, devolución ${fmtUSDec(devolucion)}, tope ${fmtUSDec(tope)}.`,
  };

  return {
    devolucionMensual: fmtUSDec(devolucion),
    ivaPagado: fmtUSDec(ivaPagado),
    topeMensual: fmtUSDec(tope),
    devolucionAnual: fmtUSDec(devolucionAnual),
    detalle: `IVA pagado ${fmtUSDec(ivaPagado)} · tope ${fmtUSDec(tope)} (${tipo === 'discapacidad' ? `${Math.round(factor * 100)}% por grado ${grado}%` : 'tercera edad 100%'}) → devolución ${fmtUSDec(devolucion)}.`,
    _insight,
    _chart,
  };
}
