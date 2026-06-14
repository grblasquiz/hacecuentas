export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function autonomosCategorias2026Aportes(i: Inputs): Outputs {
  const c=String(i.categoria||'III');
  // Aporte mensual al SIPA — valores oficiales ARCA vigentes desde abril 2026.
  // Régimen general (I–V) y régimen diferencial/prima (I'–V', actividades penosas o riesgosas).
  const tab:Record<string,number>={'I':68315,'II':95640,'III':136629,'IV':218606,'V':300582,'I\'':74720,'II\'':104606,'III\'':149438,'IV\'':239101,'V\'':328762};
  const a=tab[c]||136629;
  const _insight = {
    title: 'Tu aporte mensual',
    text: `La categoría **${c}** aporta **$${a.toLocaleString('es-AR')} por mes** al SIPA (≈$${(a*12).toLocaleString('es-AR')} al año), según los valores oficiales de ARCA vigentes desde abril 2026. Es un monto fijo independiente de tu facturación; confirmá la categoría que te corresponde para evitar deuda o pagos de más.`,
    tone: 'neutral',
    icon: '💼',
  };
  return { aporteMensual:`$${a.toLocaleString('es-AR')}`, descripcion:`Categoría ${c}: aporte mensual al SIPA $${a.toLocaleString('es-AR')}/mes (ARCA, abril 2026).`, _insight };
}
