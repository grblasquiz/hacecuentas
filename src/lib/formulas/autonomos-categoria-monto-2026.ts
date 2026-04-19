export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function autonomosCategoriaMonto2026(i: Inputs): Outputs {
  const c=String(i.categoria||'I');
  const montos: Record<string,number> = { I:38000, II:53000, III:76000, IV:122000, V:168000 };
  const m=montos[c]||38000;
  return { aporte:'$'+m.toLocaleString('es-AR'), anual:'$'+(m*12).toLocaleString('es-AR'), resumen:`Categoría ${c}: $${m}/mes = $${(m*12).toLocaleString('es-AR')}/año.` };
}
