/**
 * Dotación laboral Colombia 2026 — calzado y vestido de labor (CST arts. 230, 232, 233).
 * El empleador entrega calzado + vestido 3 veces/año (30-abr, 31-ago, 20-dic) a trabajadores
 * que ganen HASTA 2 SMLMV (2 × $1.750.905 = $3.501.810 en 2026) y lleven > 3 meses de servicio
 * a la fecha de entrega. NO se paga en dinero: es en especie (art. 233 CST).
 * Constantes (SMLMV, topeAuxilioSmlmv) de src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  antiguedadMeses?: number | string;
  valorDotacion?: number | string;
  desdeFecha?: string; // 'inicio-ano' | 'tras-30-abr' | 'tras-31-ago'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

// Las 3 entregas anuales del año (art. 232 CST), en orden cronológico.
const ENTREGAS = [
  { fecha: '30 de abril', clave: 'tras-30-abr' as const },
  { fecha: '31 de agosto', clave: 'tras-31-ago' as const },
  { fecha: '20 de diciembre', clave: 'fin-ano' as const },
];

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const salario = num(i.salarioMensual);
  if (salario <= 0) throw new Error('Ingresá el salario mensual del trabajador');

  const antiguedad = Math.max(0, num(i.antiguedadMeses, 0));
  const valorDotacion = Math.max(0, num(i.valorDotacion, 200_000));
  const desde = String(i.desdeFecha ?? 'inicio-ano');

  // Tope salarial: hasta 2 SMLMV. El SMLMV manda; 2 × $1.750.905 = $3.501.810.
  const topeSalario = C.smlmv * C.topeAuxilioSmlmv; // $3.501.810
  const cumpleSalario = salario <= topeSalario;
  // Antigüedad: derecho si lleva MÁS de 3 meses a la fecha de entrega.
  const cumpleAntiguedad = antiguedad > 3;
  const tieneDerecho = cumpleSalario && cumpleAntiguedad;

  // Cuántas de las 3 entregas anuales quedan por delante según desde dónde contemos.
  const idxDesde = desde === 'tras-30-abr' ? 1 : desde === 'tras-31-ago' ? 2 : 0;
  const entregasRestantes = tieneDerecho ? ENTREGAS.slice(idxDesde) : [];
  const nDotacionesRestantes = entregasRestantes.length;

  // Costo anual del empleador: 3 dotaciones × valor por dotación (siempre que tenga derecho).
  const dotacionesAnio = tieneDerecho ? 3 : 0;
  const costoAnual = dotacionesAnio * valorDotacion;
  const costoRestante = nDotacionesRestantes * valorDotacion;
  const costoMensualizado = costoAnual / 12; // provisión mensual orientativa

  // Próxima entrega (la primera de las que restan).
  const proxima = entregasRestantes[0]?.fecha ?? null;

  // Mensaje de motivo cuando NO tiene derecho.
  let motivoNoDerecho = '';
  if (!tieneDerecho) {
    if (!cumpleSalario && !cumpleAntiguedad) {
      motivoNoDerecho = `gana más de 2 SMLMV (${fmtCOP(topeSalario)}) y aún no cumple 3 meses de servicio`;
    } else if (!cumpleSalario) {
      motivoNoDerecho = `gana más de 2 SMLMV (el tope legal es ${fmtCOP(topeSalario)})`;
    } else {
      motivoNoDerecho = `aún no supera los 3 meses de servicio a la fecha de entrega`;
    }
  }

  const estado = tieneDerecho ? 'Tiene derecho a la dotación' : 'No tiene derecho a la dotación';

  const _insight = {
    title: 'Derecho a dotación de calzado y vestido',
    text: tieneDerecho
      ? `Con un salario de **${fmtCOP(salario)}** (≤ 2 SMLMV) y **${antiguedad} meses** de servicio, el trabajador **tiene derecho** a la dotación. Le quedan **${nDotacionesRestantes} ${nDotacionesRestantes === 1 ? 'entrega' : 'entregas'}** este año${proxima ? ` (la próxima, el ${proxima})` : ''}. Al empleador le cuesta **${fmtCOP(costoAnual)} al año** (3 × ${fmtCOP(valorDotacion)}), es decir **${fmtCOP(costoMensualizado)}/mes** provisionados. Recordá: se entrega **en especie**, nunca en dinero (art. 233 CST).`
      : `Con un salario de **${fmtCOP(salario)}** y **${antiguedad} meses** de servicio, el trabajador **no tiene derecho** a la dotación porque ${motivoNoDerecho}. El derecho aplica a quienes ganan hasta 2 SMLMV (${fmtCOP(topeSalario)}) y llevan más de 3 meses de servicio a la fecha de entrega.`,
    tone: tieneDerecho ? ('good' as const) : ('warn' as const),
    icon: '👕',
  };

  const _chart = tieneDerecho && costoAnual > 0
    ? {
        type: 'doughnut',
        slices: ENTREGAS.map((e, idx) => ({
          label: `Dotación ${e.fecha}`,
          value: Math.round(valorDotacion),
          muted: idx < idxDesde, // las ya entregadas se ven atenuadas
        })),
        prefix: '$',
        centerValue: fmtCOP(costoAnual),
        centerLabel: 'costo anual',
        ariaLabel: `Costo anual de la dotación: ${fmtCOP(costoAnual)}, tres entregas de ${fmtCOP(valorDotacion)} cada una (30 de abril, 31 de agosto y 20 de diciembre).`,
      }
    : undefined;

  return {
    tieneDerecho: estado,
    dotacionesRestantes: tieneDerecho
      ? `${nDotacionesRestantes} ${nDotacionesRestantes === 1 ? 'entrega' : 'entregas'}${proxima ? ` (próxima: ${proxima})` : ' este año'}`
      : 'No aplica',
    costoAnualEmpleador: tieneDerecho
      ? `${fmtCOP(costoAnual)} (3 × ${fmtCOP(valorDotacion)})`
      : `${fmtCOP(0)} — sin obligación de dotación`,
    costoRestanteAnio: tieneDerecho
      ? `${fmtCOP(costoRestante)} (${nDotacionesRestantes} × ${fmtCOP(valorDotacion)})`
      : 'No aplica',
    provisionMensual: tieneDerecho ? `${fmtCOP(costoMensualizado)} / mes` : 'No aplica',
    detalle: tieneDerecho
      ? `Salario ${fmtCOP(salario)} (≤ tope ${fmtCOP(topeSalario)}) + ${antiguedad} meses (> 3) ⇒ derecho a 3 dotaciones/año en especie (30-abr, 31-ago, 20-dic). Restan ${nDotacionesRestantes} este año = ${fmtCOP(costoRestante)}.`
      : `Salario ${fmtCOP(salario)}, ${antiguedad} meses de servicio ⇒ no aplica porque ${motivoNoDerecho}.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
