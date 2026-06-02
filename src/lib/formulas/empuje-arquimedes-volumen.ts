export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function empujeArquimedesVolumen(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { error: 'Completá', title: 'Fuerza de empuje', icon: '🌊' },
    en: { error: 'Fill in all fields', title: 'Buoyant force', icon: '🌊' },
    pt: { error: 'Preencha todos os campos', title: 'Força de empuxo', icon: '🌊' },
  } as const)[__lang];
  const rho = Number(i.rho); const V = Number(i.vol); const g = Number(i.g) || 9.81;
  if (!rho || !V) throw new Error(T.error);
  const E = rho * V * g;
  // Masa equivalente que el fluido "sostiene" (E = peso => m = E/g)
  const masaEq = E / g;
  const resumen = __lang === 'en'
    ? `Buoyancy = ${E.toFixed(1)} N with V=${V}m³ of fluid ρ=${rho}kg/m³.`
    : __lang === 'pt'
    ? `Empuxo = ${E.toFixed(1)} N com V=${V}m³ de fluido ρ=${rho}kg/m³.`
    : `Empuje = ${E.toFixed(1)} N con V=${V}m³ de fluido ρ=${rho}kg/m³.`;
  const insightText = __lang === 'en'
    ? `The fluid pushes the body upward with **${E.toFixed(1)} N**, equal to the weight of **${masaEq.toFixed(1)} kg** of displaced fluid (V=${V} m³, ρ=${rho} kg/m³).`
    : __lang === 'pt'
    ? `O fluido empurra o corpo para cima com **${E.toFixed(1)} N**, igual ao peso de **${masaEq.toFixed(1)} kg** de fluido deslocado (V=${V} m³, ρ=${rho} kg/m³).`
    : `El fluido empuja el cuerpo hacia arriba con **${E.toFixed(1)} N**, igual al peso de **${masaEq.toFixed(1)} kg** de fluido desplazado (V=${V} m³, ρ=${rho} kg/m³).`;
  const _insight = { title: T.title, text: insightText, tone: 'neutral' as const, icon: T.icon };
  return { empuje: E.toFixed(2) + ' N', resumen, _insight };
}
