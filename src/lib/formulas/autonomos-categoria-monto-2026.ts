export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function autonomosCategoriaMonto2026(i: Inputs): Outputs {
  const c=String(i.categoria||'I');
  // Aporte mensual al SIPA por categoría — valores oficiales ARCA vigentes desde abril 2026 (RG / Valores-autonomos-desde-abril-2026)
  const montos: Record<string,number> = { I:68315, II:95640, III:136629, IV:218606, V:300582 };
  const m=montos[c]||38000;
  const _insight = {
    title: 'Tu aporte como autónomo',
    text: `La categoría **${c}** paga **$${m.toLocaleString('es-AR')} por mes**, lo que suma **$${(m*12).toLocaleString('es-AR')} en el año**. Es un aporte fijo: no depende de lo que facturás, así que conviene revisar que tu categoría sea la correcta según tu actividad para no pagar de más.`,
    tone: 'neutral',
    icon: '🧾',
  };
  return { aporte:'$'+m.toLocaleString('es-AR'), anual:'$'+(m*12).toLocaleString('es-AR'), resumen:`Categoría ${c}: $${m}/mes = $${(m*12).toLocaleString('es-AR')}/año.`, _insight };
}
