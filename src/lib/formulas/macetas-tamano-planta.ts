export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function macetasTamanoPlanta(i: Inputs): Outputs {
  const d = Number(i.diametroRaiz) || 10;
  const mult: Record<string, number> = { hojas: 1.5, frutal: 2, cactus: 1.2 };
  const tipo = String(i.tipo);
  const dMaceta = d * (mult[tipo] || 1.5);
  const r = dMaceta / 2;
  const V = Math.PI * r * r * dMaceta * 0.0007;
  const tipoTxt: Record<string, string> = { hojas: 'planta de hojas', frutal: 'frutal', cactus: 'cactus o suculenta' };
  const _insight = {
    title: 'Maceta recomendada',
    text: `Para una raíz de **${d} cm** en ${tipoTxt[tipo] || 'tu planta'}, conviene una maceta de **${dMaceta.toFixed(0)} cm de diámetro** (≈ **${V.toFixed(1)} L** de sustrato). Dejá ${(dMaceta - d).toFixed(0)} cm de margen alrededor del cepellón para que la raíz crezca sin estrangularse.`,
    tone: 'neutral',
    icon: '🪴',
  };
  return { diametro: dMaceta.toFixed(0) + ' cm', volumen: V.toFixed(1) + ' L', resumen: `Maceta ${dMaceta.toFixed(0)}cm Ø (${V.toFixed(0)}L) para ${i.tipo}.`, _insight };
}
