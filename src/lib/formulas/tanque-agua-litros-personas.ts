export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tanqueAguaLitrosPersonas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p = Number(i.personas) || 1; const r = Number(i.reserva) || 1;
  const L = p * 200 * r;
  const comerciales = [500, 750, 1000, 1100, 1500, 2000, 2500, 3000, 5000];
  const next = comerciales.find(x => x >= L) || L;
  const resumen = __lang === 'en'
    ? `${L.toFixed(0)} L needed (${p} people × 200 L × ${r} days reserve). Commercial tank ${next} L.`
    : `${L.toFixed(0)} L necesarios (${p} personas × 200 L × ${r} días reserva). Tanque comercial ${next} L.`;
  const holgura = next - L;
  const _insight = __lang === 'en'
    ? {
        title: `Buy a ${next} L tank`,
        text: `For **${p} ${p === 1 ? 'person' : 'people'}** with **${r} ${r === 1 ? 'day' : 'days'}** of reserve you need **${L.toFixed(0)} L**, so the closest commercial size is **${next} L**${holgura > 0 ? ` — that leaves **${holgura.toFixed(0)} L** of extra margin` : ' (an exact fit)'}.`,
        tone: 'neutral',
        icon: '🚰',
      }
    : {
        title: `Comprá un tanque de ${next} L`,
        text: `Para **${p} ${p === 1 ? 'persona' : 'personas'}** con **${r} ${r === 1 ? 'día' : 'días'}** de reserva necesitás **${L.toFixed(0)} L**, así que el tamaño comercial más cercano es **${next} L**${holgura > 0 ? ` — te queda un colchón extra de **${holgura.toFixed(0)} L**` : ' (te calza justo)'}.`,
        tone: 'neutral',
        icon: '🚰',
      };
  return { litrosTotal: L.toFixed(0) + ' L', tanqueComercial: next.toString() + ' L', resumen, _insight };
}
