/**
 * Subsidio por lactancia EsSalud — Perú: S/ 820 por cada hijo nacido (parto múltiple:
 * se paga por cada uno). Lo cobra la MADRE del recién nacido, aunque el asegurado sea el padre.
 * Requisitos: asegurado titular acreditado y con vínculo al momento del nacimiento, con
 * 3 aportes mensuales consecutivos o 4 no consecutivos dentro de los 6 meses previos al parto.
 * Plazo para pedirlo: 98 días + 6 meses desde el nacimiento. Es independiente y acumulable
 * con el subsidio por maternidad (98 días de descanso).
 * Fuente: EsSalud / gob.pe. Verificado 2026-07-18.
 */
import { SUBSIDIO_LACTANCIA_2026, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  hijos?: number | string;   // hijos nacidos en el parto (1 = simple, 2 = mellizos…)
  aportes?: string;          // 'si' | 'no' — ¿cumple 3 consecutivos o 4 no consecutivos en 6 meses?
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const hijos = Math.max(1, Math.min(5, Math.floor(Number(i.hijos) || 1)));
  const cumpleAportes = String(i.aportes || 'si') === 'si';
  const porHijo = SUBSIDIO_LACTANCIA_2026;

  if (!cumpleAportes) {
    return {
      subsidio: 'S/ 0 — no cumples el requisito de aportes',
      porHijoOut: fmtPEN2(porHijo) + ' por hijo (si calificas)',
      detalle: 'Para cobrar el subsidio necesitas 3 aportes mensuales consecutivos o 4 no consecutivos a EsSalud dentro de los 6 meses anteriores al mes del nacimiento, y que el titular esté acreditado y con vínculo laboral en la fecha del parto.',
      _insight: {
        title: 'Aún no calificas para el subsidio',
        text: `El subsidio por lactancia exige **3 aportes consecutivos o 4 no consecutivos** dentro de los 6 meses previos al parto. Si el titular recién empezó a aportar, revisa cuántos meses acumulará al mes del nacimiento: cumpliendo el requisito, la madre cobra **${fmtPEN2(porHijo)} por cada hijo**.`,
        tone: 'warn',
        icon: '🍼',
      },
    };
  }

  const total = porHijo * hijos;
  const _insight = {
    title: hijos > 1 ? `Parto múltiple: ${fmtPEN2(total)}` : `Te corresponden ${fmtPEN2(total)}`,
    text: hijos > 1
      ? `Por un parto múltiple de **${hijos} bebés**, EsSalud paga el subsidio **por cada hijo**: ${hijos} × ${fmtPEN2(porHijo)} = **${fmtPEN2(total)}**, en un solo pago a nombre de la madre. Con el sistema "Lactancia Cero Trámites", si el nacimiento se registró con CNV en línea, el pago se activa sin formularios.`
      : `La madre cobra **${fmtPEN2(total)}** en un solo pago. Si el parto se registró con Certificado de Nacido Vivo (CNV) en línea, EsSalud lo activa automáticamente con "Cero Trámites"; si no, se presenta el Formulario 8011. Tienes **98 días + 6 meses** desde el nacimiento para reclamarlo.`,
    tone: 'good',
    icon: '🍼',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['1 hijo', 'Mellizos', 'Trillizos'],
    values: [porHijo, porHijo * 2, porHijo * 3],
    prefix: 'S/ ',
    ariaLabel: `Subsidio por lactancia: ${fmtPEN2(porHijo)} por hijo; en partos múltiples se multiplica.`,
  };

  return {
    subsidio: fmtPEN2(total),
    porHijoOut: `${fmtPEN2(porHijo)} por hijo`,
    detalle: `${hijos} hijo(s) × ${fmtPEN2(porHijo)} = ${fmtPEN2(total)}. Pago único a la madre (BBVA o abono directo), acumulable con el subsidio por maternidad.`,
    _insight,
    _chart,
  };
}
