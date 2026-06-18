export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function autonomosCategorias2026Aportes(i: Inputs): Outputs {
  const c=String(i.categoria||'III');
  // Aporte mensual al SIPA — valores jun-2026 (movilidad mensual +2,58% s/IPC abril, DNU 274/2024).
  // Régimen general (I–V) y régimen diferencial/prima (I'–V', actividades penosas o riesgosas).
  const tab:Record<string,number>={'I':72446,'II':101423,'III':144890,'IV':231825,'V':318759,'I\'':79238,'II\'':110931,'III\'':158474,'IV\'':253559,'V\'':348643};
  const a=tab[c]||144890;
  const _insight = {
    title: 'Tu aporte mensual',
    text: `La categoría **${c}** aporta **$${a.toLocaleString('es-AR')} por mes** al SIPA (≈$${(a*12).toLocaleString('es-AR')} al año), según los valores de ARCA de junio 2026. Es un monto fijo independiente de tu facturación; confirmá la categoría que te corresponde para evitar deuda o pagos de más.`,
    tone: 'neutral',
    icon: '💼',
  };
  return { aporteMensual:`$${a.toLocaleString('es-AR')}`, descripcion:`Categoría ${c}: aporte mensual al SIPA $${a.toLocaleString('es-AR')}/mes (ARCA, junio 2026).`, _insight };
}
