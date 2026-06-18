export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function autonomosCategoriaMonto2026(i: Inputs): Outputs {
  const c=String(i.categoria||'I');
  // Aporte mensual al SIPA por categoría — valores jun-2026 (movilidad +2,58% s/IPC abril, DNU 274/2024)
  const montos: Record<string,number> = { I:72446, II:101423, III:144890, IV:231825, V:318759 };
  const m=montos[c]||72446;
  const _insight = {
    title: 'Tu aporte como autónomo',
    text: `La categoría **${c}** paga **$${m.toLocaleString('es-AR')} por mes**, lo que suma **$${(m*12).toLocaleString('es-AR')} en el año**. Es un aporte fijo: no depende de lo que facturás, así que conviene revisar que tu categoría sea la correcta según tu actividad para no pagar de más.`,
    tone: 'neutral',
    icon: '🧾',
  };
  return { aporte:'$'+m.toLocaleString('es-AR'), anual:'$'+(m*12).toLocaleString('es-AR'), resumen:`Categoría ${c}: $${m}/mes = $${(m*12).toLocaleString('es-AR')}/año.`, _insight };
}
