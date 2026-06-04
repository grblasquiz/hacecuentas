export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }

export function pinturaParedesLitrosPorMetrosCuadrados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const superficie = Number(i.superficie_m2) || 0;
  const rendimiento = Number(i.rendimiento) || 10; // m²/L por mano
  const manos = Number(i.manos) || 2;
  const colchon = Number(i.colchon) || 10; // % de desperdicio

  // Litros base = (m² ÷ rendimiento por mano) × número de manos
  const litrosBase = rendimiento > 0 ? (superficie / rendimiento) * manos : 0;
  // Litros con colchón
  const litrosTotal = litrosBase * (1 + colchon / 100);

  const litrosBaseStr = litrosBase.toFixed(2);
  const litrosTotalStr = litrosTotal.toFixed(2);

  // Cantidad de latas comunes (4 L y 10 L)
  const latas4L = Math.ceil(litrosTotal / 4);
  const latas10L = Math.ceil(litrosTotal / 10);

  let resumen: string;
  if (__lang === 'en') {
    resumen = `Base: ${litrosBaseStr} L for ${manos} coat(s) at ${rendimiento} m²/L. With ${colchon}% buffer: **${litrosTotalStr} L** → approx. ${latas4L} × 4 L cans or ${latas10L} × 10 L cans.`;
  } else {
    resumen = `Base: ${litrosBaseStr} L para ${manos} mano(s) a ${rendimiento} m²/L. Con colchón del ${colchon}%: **${litrosTotalStr} L** → aprox. ${latas4L} latas de 4 L o ${latas10L} baldes de 10 L.`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Paint to buy' : 'Pintura a comprar',
    text: __lang === 'en'
      ? `You need **${litrosTotalStr} L** total (${litrosBaseStr} L base + ${colchon}% waste buffer). Round up when buying: approximately **${latas4L} × 4 L cans** or **${latas10L} × 10 L cans**.`
      : `Necesitás **${litrosTotalStr} L** en total (${litrosBaseStr} L base + ${colchon}% de colchón). Al comprar, redondeá hacia arriba: aproximadamente **${latas4L} latas de 4 L** o **${latas10L} baldes de 10 L**.`,
    tone: 'neutral' as const,
    icon: '🎨',
  };

  return {
    resultado: litrosTotalStr,
    resumen,
    _insight,
  };
}
