/**
 * Salario de un aprendiz del SENA — Colombia 2026.
 * Ley 2466/2025 art. 21 + Decreto 0223/2026: contrato laboral especial a término fijo.
 * Etapa lectiva: 75% del SMLMV ($1.313.179), EPS + ARL pagadas 100% por la empresa, sin descuentos.
 * Etapa productiva: 100% del SMLMV ($1.750.905) con pensión, prima y vacaciones;
 * como trabajador aporta salud 4% + pensión 4%.
 * Constantes: src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  etapa?: string;            // 'lectiva' | 'productiva' (etapa actual)
  mesesLectiva?: number | string;    // meses de etapa lectiva del contrato
  mesesProductiva?: number | string; // meses de etapa productiva del contrato
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Guard de defaults: ''/null/undefined → default; el 0 explícito se respeta.
function num(v: unknown, def: number): number {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const etapa = String(i.etapa || 'lectiva') === 'productiva' ? 'productiva' : 'lectiva';
  const mesesLectiva = Math.max(0, Math.floor(num(i.mesesLectiva, 6)));
  const mesesProductiva = Math.max(0, Math.floor(num(i.mesesProductiva, 6)));
  const mesesTotales = mesesLectiva + mesesProductiva;
  if (mesesTotales <= 0) throw new Error('Ingresá los meses de al menos una etapa del contrato');
  if (mesesTotales > 36) throw new Error('El contrato de aprendizaje no puede superar 3 años (36 meses) — Decreto 0223/2026');

  // Etapa lectiva: 75% SMLMV, la empresa asume EPS + ARL, sin descuentos al aprendiz.
  const apoyoLectiva = C.smlmv * C.aprendizSena.lectivaPorcentajeSmlmv;       // $1.313.178,75
  // Etapa productiva: 100% SMLMV; el aprendiz aporta salud 4% + pensión 4% como cualquier trabajador.
  const salarioProductiva = C.smlmv * C.aprendizSena.productivaPorcentajeSmlmv; // $1.750.905
  const descuentosProductiva = salarioProductiva * (C.aportes.saludEmpleado + C.aportes.pensionEmpleado); // 8%
  const netoProductiva = salarioProductiva - descuentosProductiva;            // $1.610.832,60

  // Prima de servicios en la etapa productiva: 1/12 del salario por mes trabajado.
  const primaProductiva = salarioProductiva * C.prestaciones.primaPorcentaje * mesesProductiva;

  const totalLectiva = apoyoLectiva * mesesLectiva;
  const totalProductivaNeto = netoProductiva * mesesProductiva;
  const totalContrato = totalLectiva + totalProductivaNeto + primaProductiva;

  const mensualActual = etapa === 'lectiva' ? apoyoLectiva : netoProductiva;
  const brutoActual = etapa === 'lectiva' ? apoyoLectiva : salarioProductiva;

  const _insight = {
    title: etapa === 'lectiva' ? 'Tu apoyo en etapa lectiva' : 'Tu salario en etapa productiva',
    text: etapa === 'lectiva'
      ? `En la etapa lectiva cobrás **${fmtCOP(apoyoLectiva)}** al mes (75% del SMLMV 2026), **sin descuentos**: la empresa paga el 100% de tu EPS y ARL. Cuando pases a la etapa productiva tu salario sube a ${fmtCOP(salarioProductiva)} (neto ${fmtCOP(netoProductiva)} tras salud y pensión) y ganás derecho a prima y vacaciones. El contrato completo (${mesesLectiva} + ${mesesProductiva} meses) te deja unos **${fmtCOP(totalContrato)}** netos, prima incluida.`
      : `En la etapa productiva tu salario es **${fmtCOP(salarioProductiva)}** (100% del SMLMV 2026) y, tras aportar salud 4% y pensión 4% como cualquier trabajador, te quedan **${fmtCOP(netoProductiva)}** al mes — más prima de servicios y vacaciones. El contrato completo (${mesesLectiva} + ${mesesProductiva} meses) suma unos **${fmtCOP(totalContrato)}** netos, prima incluida.`,
    tone: 'good',
    icon: '🎓',
  };

  const slices = [
    { label: `Etapa lectiva (${mesesLectiva} m)`, value: Math.round(totalLectiva) },
    { label: `Etapa productiva neto (${mesesProductiva} m)`, value: Math.round(totalProductivaNeto) },
    { label: 'Prima de servicios', value: Math.round(primaProductiva) },
  ].filter((s) => s.value > 0);

  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '$ ',
    centerValue: fmtCOP(totalContrato),
    centerLabel: 'Total del contrato',
    ariaLabel: `Contrato de aprendizaje SENA de ${mesesTotales} meses: ${fmtCOP(totalLectiva)} en etapa lectiva, ${fmtCOP(totalProductivaNeto)} netos en productiva y ${fmtCOP(primaProductiva)} de prima; total ${fmtCOP(totalContrato)}.`,
  };

  return {
    mensualActual: fmtCOP(mensualActual),
    brutoActual: fmtCOP(brutoActual),
    netoProductiva: fmtCOP(netoProductiva),
    totalContrato: fmtCOP(totalContrato),
    primaProductiva: fmtCOP(primaProductiva),
    detalle: `Lectiva: ${fmtCOP(apoyoLectiva)}/mes × ${mesesLectiva} = ${fmtCOP(totalLectiva)} (sin descuentos). Productiva: ${fmtCOP(salarioProductiva)}/mes − 8% de aportes = ${fmtCOP(netoProductiva)} × ${mesesProductiva} = ${fmtCOP(totalProductivaNeto)} + prima ${fmtCOP(primaProductiva)}. Total: ${fmtCOP(totalContrato)}.`,
    _insight,
    _chart,
  };
}
