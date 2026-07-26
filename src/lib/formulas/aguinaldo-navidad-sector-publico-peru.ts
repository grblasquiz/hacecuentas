/**
 * Aguinaldo por Navidad 2026 — sector público Perú.
 * El monto lo fija el MEF por decreto supremo hacia noviembre-diciembre; en los últimos
 * ejercicios (2023-2026, incluido julio 2026 vía D.S. 128-2026-EF) fue de S/ 300.
 * Requisitos análogos al de Fiestas Patrias: vínculo laboral al 30-nov-2026 (o vacaciones,
 * licencia con goce o subsidio Ley 26790) y mínimo 3 meses de servicio; con menos de 3 meses
 * se paga proporcional a los días laborados (base 90 días). Se abona en la planilla de diciembre.
 * Alcanza a: D.L. 276, docentes (Ley 29944 y Ley 30512), docentes universitarios (Ley 30220),
 * personal de salud (D.L. 1153), FF.AA. y PNP, y pensionistas a cargo del Estado.
 * CAS: situación en revisión por la Ley 32563 (gratificación reconocida, sin presupuesto a jul-2026).
 * D.L. 728: gratificación de Navidad de un sueldo completo, no aguinaldo.
 * Valor de referencia S/ 300 — verificado contra D.S. 128-2026-EF (julio 2026). Actualizar al
 * publicarse el decreto de Navidad 2026.
 */
import { fmtPEN2 } from '../data/peru-2026.ts';

const MONTO_REFERENCIA = 300;
const BASE_DIAS = 90;

export interface Inputs {
  regimen?: string;
  meses?: number | string;
  dias?: number | string;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const REGIMENES: Record<string, string> = {
  dl276: 'Carrera administrativa (D.L. 276)',
  docente: 'Docente (Ley 29944 / Ley 30512)',
  universitario: 'Docente universitario (Ley 30220)',
  salud: 'Personal de la salud (D.L. 1153)',
  ffaa_pnp: 'FF.AA. y PNP',
  pensionista: 'Pensionista a cargo del Estado',
  cas: 'CAS (D.L. 1057)',
  dl728: 'Régimen privado en entidad pública (D.L. 728)',
};

export function compute(i: Inputs): Outputs {
  const regimen = String(i.regimen || 'dl276');
  const meses = Math.max(0, Math.min(60, Math.floor(Number(i.meses) || 0)));
  const dias = Math.max(0, Math.min(29, Math.floor(Number(i.dias) || 0)));
  const label = REGIMENES[regimen] || REGIMENES.dl276;

  if (regimen === 'cas') {
    return {
      aguinaldo: 'Por definir — caso especial CAS',
      regimenLabel: label,
      diasComputados: '—',
      detalle: 'La Ley 32563 (marzo 2026) reemplazó el aguinaldo CAS por gratificaciones tipo régimen privado, pero a mediados de 2026 esa gratificación seguía sin presupuesto asignado. Qué cobrarán los CAS en diciembre 2026 depende de lo que apruebe el Congreso antes de fin de año.',
      _insight: {
        title: 'CAS: pendiente de definición para diciembre 2026',
        text: 'La **Ley 32563** reconoció a los CAS gratificaciones de julio y diciembre en reemplazo del aguinaldo, pero **sin presupuesto asignado** a mitad de año. Si el Congreso financia la gratificación antes de diciembre, cobrarían un monto tipo sueldo; si no, quedarían como en julio: sin aguinaldo ni gratificación. Seguí la noticia oficial del MEF.',
        tone: 'warn',
        icon: '🏛️',
      },
    };
  }
  if (regimen === 'dl728') {
    return {
      aguinaldo: 'No aplica — te corresponde gratificación',
      regimenLabel: label,
      diasComputados: '—',
      detalle: 'Los servidores públicos bajo régimen privado (D.L. 728) no reciben el aguinaldo de monto fijo: les corresponde la gratificación de Navidad equivalente a un sueldo completo más la bonificación extraordinaria del 9%, pagada hasta el 15 de diciembre.',
      _insight: {
        title: 'D.L. 728: gratificación, no aguinaldo',
        text: 'Si estás en una entidad pública bajo el **régimen privado (D.L. 728)**, en diciembre recibes la **gratificación de Navidad de un sueldo completo** (+9% de bonificación extraordinaria), no el aguinaldo de monto fijo. Usa nuestra calculadora de gratificación para ver tu monto.',
        tone: 'neutral',
        icon: '🏛️',
      },
    };
  }

  const diasServicio = meses * 30 + dias;
  const completo = diasServicio >= BASE_DIAS;
  const aguinaldo = completo ? MONTO_REFERENCIA : Math.round((MONTO_REFERENCIA * diasServicio / BASE_DIAS) * 100) / 100;

  const _insight = {
    title: completo ? 'Te corresponde el aguinaldo completo' : 'Te corresponde aguinaldo proporcional',
    text: (completo
      ? `Con **${meses} meses${dias ? ` y ${dias} días` : ''}** de servicio al 30 de noviembre de 2026 (≥ 3 meses), como **${label}** te corresponderían los **${fmtPEN2(MONTO_REFERENCIA)} completos** en la planilla de diciembre.`
      : `Con **${meses} meses y ${dias} días** de servicio (${diasServicio} días, menos de 90), el aguinaldo se pagaría **proporcional**: ${fmtPEN2(MONTO_REFERENCIA)} × ${diasServicio}/90 = **${fmtPEN2(aguinaldo)}**.`)
      + ' Monto de referencia S/ 300 (igual al de julio 2026, D.S. 128-2026-EF); el valor oficial de Navidad lo confirma el MEF por decreto hacia noviembre-diciembre.',
    tone: 'good',
    icon: '🎄',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Tu aguinaldo', value: aguinaldo },
      ...(completo ? [] : [{ label: 'Resto (por menos de 3 meses)', value: Math.round((MONTO_REFERENCIA - aguinaldo) * 100) / 100 }]),
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN2(aguinaldo),
    centerLabel: 'Aguinaldo',
    ariaLabel: `Aguinaldo de Navidad estimado de ${fmtPEN2(aguinaldo)} sobre un máximo de referencia de ${fmtPEN2(MONTO_REFERENCIA)}.`,
  };

  return {
    aguinaldo: fmtPEN2(aguinaldo),
    regimenLabel: label,
    diasComputados: `${diasServicio} días de servicio al 30-nov-2026`,
    detalle: completo
      ? `${label}: 3 o más meses de servicio al 30-nov-2026 → aguinaldo completo de ${fmtPEN2(MONTO_REFERENCIA)} (referencia) en la planilla de diciembre.`
      : `${label}: ${diasServicio} días de servicio → ${fmtPEN2(MONTO_REFERENCIA)} × ${diasServicio}/90 = ${fmtPEN2(aguinaldo)} (proporcional, monto de referencia).`,
    _insight,
    _chart,
  };
}
