/**
 * Devolución del IVA (Prosperidad Social, Colombia) 2026 — elegibilidad orientativa y monto anual estimado.
 * Giros bimestrales: 6 ciclos/año. Monto por ciclo según hogar ($90.000–$110.000; referencia 2026: $99.100).
 * Focalización automática con Sisbén IV: grupos A (A1–A5) y B (B1–B4). Datos importados de la data país.
 */
import { DEVOLUCION_IVA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  grupo_sisben: 'a' | 'b' | 'c_o_mas' | 'sin_sisben';
  monto_ciclo: number;
  ciclos_restantes: number;
}
export interface Outputs { [k: string]: any; _insight?: any; }

export function compute(i: Inputs): Outputs {
  const D = DEVOLUCION_IVA_2026;
  const elegible = i.grupo_sisben === 'a' || i.grupo_sisben === 'b';
  const monto = Number(i.monto_ciclo) > 0 ? Number(i.monto_ciclo) : D.montoCicloReferencia;
  let ciclos = Math.round(Number(i.ciclos_restantes));
  if (!Number.isFinite(ciclos) || ciclos < 0) ciclos = 0;
  if (ciclos > D.ciclosPorAnio) ciclos = D.ciclosPorAnio;

  const totalRestante = elegible ? monto * ciclos : 0;
  const totalAnual = elegible ? monto * D.ciclosPorAnio : 0;

  const grupoLabel = i.grupo_sisben === 'a' ? 'Grupo A (pobreza extrema, A1–A5)'
    : i.grupo_sisben === 'b' ? 'Grupo B (pobreza moderada, B1–B4)'
    : i.grupo_sisben === 'c_o_mas' ? 'Grupo C o superior' : 'Sin registro en Sisbén IV';

  const _insight = elegible
    ? {
        title: `Tu hogar podría recibir ${fmtCOP(totalAnual)} al año`,
        text: `Con ${grupoLabel} tu hogar entra en la población focalizada de la Devolución del IVA. A **${fmtCOP(monto)} por ciclo** y **${D.ciclosPorAnio} ciclos bimestrales al año**, el beneficio anual estimado es **${fmtCOP(totalAnual)}**${ciclos > 0 && ciclos < D.ciclosPorAnio ? ` (${fmtCOP(totalRestante)} por los ${ciclos} ciclos que quedan)` : ''}. La selección es automática: verifica tu estado en devolucioniva.prosperidadsocial.gov.co — estar en el grupo no garantiza el giro.`,
        tone: 'good',
        icon: '🧾',
      }
    : {
        title: 'Tu hogar no está en la población focalizada',
        text: `La Devolución del IVA se asigna automáticamente a hogares del **Sisbén IV grupos A y B** cruzados con otros registros oficiales. Con ${grupoLabel} no entras en la focalización actual. Si tu situación cambió, puedes pedir una nueva encuesta Sisbén en tu alcaldía.`,
        tone: 'warn',
        icon: '🧾',
      };

  return {
    elegibilidad: elegible ? `Focalizado (${grupoLabel})` : `No focalizado (${grupoLabel})`,
    monto_por_ciclo: elegible ? fmtCOP(monto) : fmtCOP(0),
    total_ciclos_restantes: elegible ? `${fmtCOP(totalRestante)} (${ciclos} ${ciclos === 1 ? 'ciclo' : 'ciclos'})` : fmtCOP(0),
    total_anual_estimado: fmtCOP(totalAnual),
    detalle: elegible
      ? `${fmtCOP(monto)} × ${D.ciclosPorAnio} ciclos bimestrales = ${fmtCOP(totalAnual)} al año. El monto real por ciclo varía entre ${fmtCOP(D.montoRango.min)} y ${fmtCOP(D.montoRango.max)} según la composición del hogar.`
      : `Solo los hogares Sisbén IV de los grupos A (A1–A5) y B (B1–B4) entran en la focalización automática del programa.`,
    _insight,
  };
}
