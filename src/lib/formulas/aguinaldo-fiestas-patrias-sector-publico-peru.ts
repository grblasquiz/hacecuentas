/**
 * Aguinaldo por Fiestas Patrias 2026 — sector público Perú (D.S. 128-2026-EF): S/ 300
 * pagados en la planilla de julio. Requisitos: vínculo laboral al 30-jun-2026 (o vacaciones,
 * licencia con goce o subsidio Ley 26790) y mínimo 3 meses de servicio; con menos de 3 meses
 * se paga proporcional a los meses y días laborados (base 90 días).
 * Alcanza a: D.L. 276, docentes (Ley 29944 y Ley 30512), docentes universitarios (Ley 30220),
 * personal de salud (D.L. 1153), FF.AA. y PNP, y pensionistas a cargo del Estado.
 * NO alcanza a: CAS (Ley 32563 reemplazó su aguinaldo por gratificación, aún sin presupuesto)
 * ni al régimen privado D.L. 728 (recibe gratificación de un sueldo, no S/ 300).
 * Fuente: El Peruano / MEF. Verificado 2026-07-18.
 */
import { AGUINALDO_FIESTAS_PATRIAS_2026, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  regimen?: string;  // 'dl276' | 'docente' | 'universitario' | 'salud' | 'ffaa_pnp' | 'pensionista' | 'cas' | 'dl728'
  meses?: number | string;  // meses completos de servicio al 30-jun-2026
  dias?: number | string;   // días adicionales de servicio
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
  const { monto, baseDias } = AGUINALDO_FIESTAS_PATRIAS_2026;
  const label = REGIMENES[regimen] || REGIMENES.dl276;

  if (regimen === 'cas') {
    return {
      aguinaldo: 'S/ 0 — no corresponde',
      regimenLabel: label,
      diasComputados: '—',
      detalle: 'Los trabajadores CAS ya no reciben el aguinaldo de S/ 300: la Ley 32563 (marzo 2026) lo reemplazó por gratificaciones, pero a julio 2026 esa gratificación no tiene presupuesto asignado y no se pagó.',
      _insight: {
        title: 'CAS: sin aguinaldo en julio 2026',
        text: 'El D.S. 128-2026-EF **excluyó a los CAS** del aguinaldo de S/ 300 porque la **Ley 32563** les reconoció gratificaciones de julio y diciembre en su lugar. El problema: a julio 2026 esa gratificación **no tiene presupuesto** (costaría ~S/ 3.500 millones al año) y el Congreso aún debate cómo financiarla, así que este mes no se pagó ni aguinaldo ni gratificación.',
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
      detalle: 'Los servidores públicos bajo el régimen privado (D.L. 728) no reciben el aguinaldo de S/ 300: les corresponde la gratificación de Fiestas Patrias equivalente a un sueldo completo más la bonificación extraordinaria del 9%.',
      _insight: {
        title: 'D.L. 728: gratificación, no aguinaldo',
        text: 'Si estás en una entidad pública bajo el **régimen privado (D.L. 728)**, en julio recibes la **gratificación de un sueldo completo** (+9% de bonificación extraordinaria), no el aguinaldo de S/ 300. Usa nuestra calculadora de gratificación para ver tu monto.',
        tone: 'neutral',
        icon: '🏛️',
      },
    };
  }

  const diasServicio = meses * 30 + dias;
  const completo = diasServicio >= baseDias;
  const aguinaldo = completo ? monto : Math.round((monto * diasServicio / baseDias) * 100) / 100;

  const _insight = {
    title: completo ? 'Te corresponde el aguinaldo completo' : 'Te corresponde aguinaldo proporcional',
    text: completo
      ? `Con **${meses} meses${dias ? ` y ${dias} días` : ''}** de servicio al 30 de junio de 2026 (≥ 3 meses), como **${label}** te corresponden los **S/ 300 completos** en la planilla de julio, siempre que hayas estado laborando (o de vacaciones, licencia con goce o subsidio) en esa fecha.`
      : `Con **${meses} meses y ${dias} días** de servicio (${diasServicio} días, menos de 90), el aguinaldo se paga **proporcional**: S/ 300 × ${diasServicio}/90 = **${fmtPEN2(aguinaldo)}**.`,
    tone: 'good',
    icon: '🎆',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Tu aguinaldo', value: aguinaldo },
      ...(completo ? [] : [{ label: 'Resto (por menos de 3 meses)', value: Math.round((monto - aguinaldo) * 100) / 100 }]),
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN2(aguinaldo),
    centerLabel: 'Aguinaldo',
    ariaLabel: `Aguinaldo de ${fmtPEN2(aguinaldo)} sobre un máximo de ${fmtPEN2(monto)}.`,
  };

  return {
    aguinaldo: fmtPEN2(aguinaldo),
    regimenLabel: label,
    diasComputados: `${diasServicio} días de servicio al 30-jun-2026`,
    detalle: completo
      ? `${label}: 3 o más meses de servicio al 30-jun-2026 → aguinaldo completo de ${fmtPEN2(monto)} en la planilla de julio (D.S. 128-2026-EF).`
      : `${label}: ${diasServicio} días de servicio → ${fmtPEN2(monto)} × ${diasServicio}/90 = ${fmtPEN2(aguinaldo)} (proporcional, D.S. 128-2026-EF).`,
    _insight,
    _chart,
  };
}
