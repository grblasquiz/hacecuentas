export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tierraCanteroM3Litros(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const l = Number(i.largo) || 0; const a = Number(i.ancho) || 0; const p = Number(i.prof) || 0;
  const V = l * a * p;
  const litros = V * 1000;
  const bolsas50 = Math.ceil(litros / 50);
  const bolsas40 = Math.ceil(litros / 40);
  const _insight = __lang === 'en' ? {
    title: 'How much soil to buy',
    text: `Your raised bed needs **${litros.toFixed(0)} liters** of growing mix (${V.toFixed(2)} m³), which equals about **${bolsas40} bags of 40 L** or **${bolsas50} bags of 50 L**. Add 10–15% extra to account for settling and compaction.`,
    tone: 'neutral',
    icon: '🪴',
  } : {
    title: 'Cuánta tierra comprar',
    text: `Tu cantero necesita **${litros.toFixed(0)} litros** de tierra (${V.toFixed(2)} m³), equivalentes a unas **${bolsas50} bolsas de 50 L**. Sumá un 10% extra para compactación y asentamiento.`,
    tone: 'neutral',
    icon: '🪴',
  };
  return {
    m3: V.toFixed(3),
    litros: litros.toFixed(0),
    resumen: __lang === 'en'
      ? `Soil needed: ${V.toFixed(2)} m³ = ${litros.toFixed(0)} L.`
      : `Tierra necesaria: ${V.toFixed(2)} m³ = ${litros.toFixed(0)} L.`,
    _insight,
  };
}
