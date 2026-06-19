/**
 * Sanción por corrección de declaraciones DIAN — Colombia 2026 (art. 644 ET).
 * Sanción = 10% del mayor valor a pagar (o menor saldo a favor) si se corrige ANTES del
 * emplazamiento para corregir; 20% si se corrige DESPUÉS (y antes del requerimiento especial).
 * Piso: sanción mínima de 10 UVT = $523.740 en 2026 (art. 639 ET; UVT $52.374).
 * Constantes de src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  mayorValor: number | string;     // mayor valor a pagar (o menor saldo a favor) que resulta de corregir
  momento?: string;                // 'antes' | 'despues' (del emplazamiento para corregir)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const mayorValor = num(i.mayorValor);
  if (mayorValor <= 0) throw new Error('Ingresá el mayor valor a pagar que resulta de la corrección');

  const despues = String(i.momento ?? 'antes') === 'despues';
  const tarifa = despues ? 0.20 : 0.10; // art. 644 ET

  // Sanción mínima = 10 UVT (art. 639 ET).
  const sancionMinima = C.sanciones.minimaUvt * C.uvt; // 10 × $52.374 = $523.740
  const uvtTxt = fmtCOP(C.uvt);

  const sancionBase = mayorValor * tarifa;
  const aplicaMinima = sancionBase < sancionMinima;
  const sancion = Math.max(sancionBase, sancionMinima);

  // Cuánto se ahorra corrigiendo voluntariamente (antes del emplazamiento) vs. después.
  const sancion10 = Math.max(mayorValor * 0.10, sancionMinima);
  const sancion20 = Math.max(mayorValor * 0.20, sancionMinima);
  const ahorroVoluntario = sancion20 - sancion10;

  const pctTarifa = despues ? '20%' : '10%';
  const totalAPagar = mayorValor + sancion;

  const _insight = {
    title: 'Tu sanción por corrección',
    text: `Por un mayor valor a pagar de **${fmtCOP(mayorValor)}**, la sanción del art. 644 ET es el **${pctTarifa}** (${fmtCOP(sancionBase)})${despues ? ' porque corregís después del emplazamiento para corregir' : ' por corregir voluntariamente, antes del emplazamiento'}. ${aplicaMinima ? `Pero como ese ${pctTarifa} queda por debajo de la **sanción mínima de 10 UVT (${fmtCOP(sancionMinima)})**, pagás el piso: **${fmtCOP(sancion)}**.` : `Tu sanción es **${fmtCOP(sancion)}**.`} ${despues ? `Si hubieras corregido antes del emplazamiento, habrías pagado la mitad de tarifa y te ahorrabas **${fmtCOP(ahorroVoluntario)}**.` : ahorroVoluntario > 0 ? `Esperar al emplazamiento te costaría ${fmtCOP(ahorroVoluntario)} más (subiría al 20%).` : `Aun corrigiendo después subirías al 20%, pero el piso de 10 UVT manda igual.`} Sumá esta sanción al mayor impuesto en tu corrección.`,
    tone: despues ? ('warn' as const) : ('good' as const),
    icon: '📝',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Mayor impuesto a pagar', value: Math.round(mayorValor) },
      { label: `Sanción por corrección (${aplicaMinima ? 'mínima 10 UVT' : pctTarifa})`, value: Math.round(sancion) },
    ],
    prefix: '$',
    centerValue: fmtCOP(totalAPagar),
    centerLabel: 'a pagar con la corrección',
    ariaLabel: `Total a pagar con la corrección: ${fmtCOP(totalAPagar)} (mayor impuesto ${fmtCOP(mayorValor)} más sanción ${fmtCOP(sancion)}).`,
  };

  return {
    sancion: fmtCOP(sancion),
    tarifaAplicada: `${pctTarifa} del mayor valor (art. 644 ET)`,
    sancionCalculada: `${fmtCOP(sancionBase)} (${pctTarifa} de ${fmtCOP(mayorValor)})`,
    sancionMinima: `${fmtCOP(sancionMinima)} (10 UVT, UVT ${uvtTxt})`,
    pisoAplicado: aplicaMinima ? 'Sí — pagás la sanción mínima de 10 UVT' : 'No — la sanción calculada supera el mínimo',
    totalAPagar: `${fmtCOP(totalAPagar)} (mayor impuesto ${fmtCOP(mayorValor)} + sanción ${fmtCOP(sancion)})`,
    comparacion: `Antes del emplazamiento: ${fmtCOP(sancion10)} (10%) · Después: ${fmtCOP(sancion20)} (20%). Diferencia: ${fmtCOP(ahorroVoluntario)}.`,
    detalle: `Mayor valor a pagar ${fmtCOP(mayorValor)} × ${pctTarifa} = ${fmtCOP(sancionBase)}${aplicaMinima ? ` → por debajo del piso de 10 UVT, se aplica ${fmtCOP(sancionMinima)}` : ''}. Sanción: ${fmtCOP(sancion)}.`,
    _insight,
    _chart,
  };
}
