export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function macetasTamanoPlanta(i: Inputs): Outputs {
  const d = Number(i.diametroRaiz) || 10;
  const mult: Record<string, number> = { hojas: 1.5, frutal: 2, cactus: 1.2 };
  const tipo = String(i.tipo);
  const dMaceta = d * (mult[tipo] || 1.5);
  const r = dMaceta / 2;
  // Volume using tapered pot approximation: depth ≈ 0.7 × diameter
  const V = Math.PI * r * r * dMaceta * 0.0007;
  const isEn = String(i.__lang) === 'en';
  const tipoTxtEs: Record<string, string> = { hojas: 'planta de hojas', frutal: 'frutal', cactus: 'cactus o suculenta' };
  const tipoTxtEn: Record<string, string> = { hojas: 'leafy plant', frutal: 'fruit/vegetable plant', cactus: 'cactus or succulent' };
  const plantLabel = isEn ? (tipoTxtEn[tipo] || 'plant') : (tipoTxtEs[tipo] || 'tu planta');
  const margin = (dMaceta - d).toFixed(0);
  const _insight = isEn ? {
    title: 'Recommended Pot',
    text: `For a **${d} cm** root ball (${plantLabel}), use a **${dMaceta.toFixed(0)} cm diameter pot** (≈ **${V.toFixed(1)} L**). This leaves **${margin} cm** of growing space around the root ball — enough for healthy root expansion without excess wet soil.`,
    tone: 'neutral',
    icon: '🪴',
  } : {
    title: 'Maceta recomendada',
    text: `Para una raíz de **${d} cm** en ${plantLabel}, conviene una maceta de **${dMaceta.toFixed(0)} cm de diámetro** (≈ **${V.toFixed(1)} L** de sustrato). Dejá ${margin} cm de margen alrededor del cepellón para que la raíz crezca sin estrangularse.`,
    tone: 'neutral',
    icon: '🪴',
  };
  const resumen = isEn
    ? `Pot: ${dMaceta.toFixed(0)} cm Ø (${V.toFixed(0)} L) for ${plantLabel}.`
    : `Maceta ${dMaceta.toFixed(0)}cm Ø (${V.toFixed(0)}L) para ${i.tipo}.`;
  return { diametro: dMaceta.toFixed(0) + ' cm', volumen: V.toFixed(1) + ' L', resumen, _insight };
}
