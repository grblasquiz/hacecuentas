/** Reajuste del sueldo mínimo Chile 2026 — Ley 21.830 (D.O. 22-jun-2026).
 *  IMM general: $539.000 (ene–abr) → $553.553 desde el 01-may-2026, con efecto
 *  retroactivo (diferencia de $14.553/mes por mayo y junio si se pagó el valor viejo).
 *  Impactos: gratificación legal tope 4,75 IMM/año y valor hora extra (jornada 42 h
 *  desde el 26-abr-2026: factor DT 0,0083333 sobre el sueldo mensual).
 *  Fuente: DT — https://www.dt.gob.cl/portal/1628/w3-article-60141.html */
import { fmtCLP, IMM_MAYO_2026, CHILE_2026 } from '../data/chile-2026.ts';

export interface Inputs {
  sueldoBase: number;      // sueldo base mensual actual (CLP)
  mesesRetroactivo: number; // meses pagados al valor viejo desde mayo (0 a 3)
  horasExtrasMes: number;  // horas extra al 50% en el mes
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoBase) || 0;
  const mesesRetro = Math.min(3, Math.max(0, Math.round(Number(i.mesesRetroactivo) || 0)));
  const hExtras = Math.max(0, Number(i.horasExtrasMes) || 0);

  if (sueldo <= 0) throw new Error('Ingresá tu sueldo base mensual');

  const immNuevo = IMM_MAYO_2026.general;
  const immViejo = IMM_MAYO_2026.anteriorGeneral;
  const alza = immNuevo - immViejo; // 14.553
  const alzaPct = (alza / immViejo) * 100; // 2,7%

  const bajoMinimo = sueldo < immNuevo;
  const ajuste = bajoMinimo ? immNuevo - sueldo : 0;
  const sueldoAjustado = Math.max(sueldo, immNuevo);

  // Retroactivo: si venías cobrando el IMM viejo, diferencia por los meses indicados.
  const retroactivo = sueldo <= immViejo ? alza * mesesRetro : (bajoMinimo ? ajuste * mesesRetro : 0);

  // Gratificación legal Art. 50: tope 4,75 IMM al año (con el IMM nuevo).
  const gratifTopeAnual = CHILE_2026.gratificacionArt50.topeImmAnual * immNuevo;
  const gratifTopeMensual = gratifTopeAnual / 12;

  // Hora extra con jornada de 42 h (vigente desde 26-abr-2026): factor DT 0,0083333.
  const valorHoraExtra = sueldoAjustado * 0.0083333;
  const pagoExtras = valorHoraExtra * hExtras;

  const _insight = {
    title: bajoMinimo ? 'Tu sueldo debe subir al nuevo mínimo' : 'Así te impacta el nuevo mínimo',
    text: bajoMinimo
      ? `El ingreso mínimo subió a **${fmtCLP(immNuevo)}** desde el 1 de mayo de 2026 (Ley 21.830): tu sueldo base de ${fmtCLP(sueldo)} debe ajustarse en **+${fmtCLP(ajuste)}**.${retroactivo > 0 ? ` Además te deben **${fmtCLP(retroactivo)}** de retroactivo por ${mesesRetro} mes${mesesRetro > 1 ? 'es' : ''} pagado${mesesRetro > 1 ? 's' : ''} al valor anterior.` : ''} Con jornada de 42 h, tu hora extra vale **${fmtCLP(valorHoraExtra)}**.`
      : `Tu sueldo de ${fmtCLP(sueldo)} ya supera el nuevo mínimo de **${fmtCLP(immNuevo)}** (+${alzaPct.toLocaleString('es-CL', { maximumFractionDigits: 1 })}% vs $539.000). Igual te impacta: el tope de la gratificación legal sube a **${fmtCLP(gratifTopeMensual)}** mensuales (4,75 IMM al año) y tu hora extra con jornada de 42 h vale **${fmtCLP(valorHoraExtra)}**.`,
    tone: bajoMinimo ? 'warning' : 'neutral',
    icon: '💼',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'IMM ene–abr 2026', value: immViejo },
      { label: 'IMM desde may-2026', value: immNuevo },
    ],
    ariaLabel: `Ingreso mínimo: ${fmtCLP(immViejo)} entre enero y abril de 2026, ${fmtCLP(immNuevo)} desde mayo de 2026.`,
  };

  return {
    nuevoMinimo: `${fmtCLP(immNuevo)} desde el 01-05-2026 (antes ${fmtCLP(immViejo)}, +${alzaPct.toLocaleString('es-CL', { maximumFractionDigits: 1 })}%)`,
    ajusteATuSueldo: bajoMinimo ? `+${fmtCLP(ajuste)} para llegar al mínimo` : 'No corresponde: ya estás sobre el mínimo',
    retroactivoEstimado: retroactivo > 0 ? `${fmtCLP(retroactivo)} por ${mesesRetro} mes${mesesRetro > 1 ? 'es' : ''}` : '$0',
    gratificacionTope: `${fmtCLP(gratifTopeMensual)}/mes (tope legal 4,75 IMM = ${fmtCLP(gratifTopeAnual)} al año)`,
    valorHoraExtra: `${fmtCLP(valorHoraExtra)} (jornada 42 h, recargo 50%)`,
    pagoHorasExtras: hExtras > 0 ? `${fmtCLP(pagoExtras)} por ${hExtras.toLocaleString('es-CL')} horas` : '$0',
    detalle: `Ley 21.830 (D.O. 22-06-2026): IMM $553.553 desde el 01-05-2026 (retroactivo); menores de 18 y mayores de 65: ${fmtCLP(IMM_MAYO_2026.menores18Mayores65)}; fines no remuneracionales: ${fmtCLP(IMM_MAYO_2026.noRemuneracional)}. Gratificación Art. 50: 25% de lo devengado con tope 4,75 IMM/año = ${fmtCLP(gratifTopeAnual)} (${fmtCLP(gratifTopeMensual)}/mes). Hora extra = sueldo × 0,0083333 (factor DT para jornada de 42 h vigente desde el 26-04-2026) = ${fmtCLP(valorHoraExtra)}. Próximo reajuste: enero 2027 por IPC.`,
    _insight,
    _chart,
  };
}
