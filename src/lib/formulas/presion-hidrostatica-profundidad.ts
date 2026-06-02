export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function presionHidrostaticaProfundidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const rho = Number(i.rho); const h = Number(i.h); const g = Number(i.g) || 9.81;
  if (!rho || h === undefined) throw new Error(__lang === 'en' ? 'Fill in the required fields' : 'Completá');
  const P = rho * g * h;
  const resumen = __lang === 'en'
    ? `P = ${P.toFixed(0)} Pa (${(P/100000).toFixed(2)} bar) at ${h}m depth.`
    : `P = ${P.toFixed(0)} Pa (${(P/100000).toFixed(2)} bar) a ${h}m de profundidad.`;
  const atmEquiv = P / 101325;
  const _insight = {
    title: __lang === 'en' ? 'What this pressure means' : 'Qué significa esta presión',
    text: __lang === 'en'
      ? `At **${h} m** the fluid exerts **${(P/100000).toFixed(2)} bar**, equal to **${atmEquiv.toFixed(1)}×** atmospheric pressure. This is only the column's pressure; add ~1 atm if the surface is open to air.`
      : `A **${h} m** el fluido ejerce **${(P/100000).toFixed(2)} bar**, equivalente a **${atmEquiv.toFixed(1)}×** la presión atmosférica. Es solo la presión de la columna; sumá ~1 atm si la superficie está abierta al aire.`,
    tone: 'neutral',
    icon: '🌊',
  };
  return { presion: P.toFixed(0) + ' Pa', presionBar: (P/100000).toFixed(3) + ' bar', resumen, _insight };
}
