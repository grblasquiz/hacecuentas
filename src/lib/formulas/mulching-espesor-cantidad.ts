export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function mulchingEspesorCantidad(i: Inputs): Outputs {
  const m = Number(i.m2) || 0; const e = Number(i.espesor) || 5;
  const V = m * (e / 100); const kg = V * 100;
  const tone = e < 3 ? 'warn' : 'good';
  const text = e < 3
    ? `Para **${m} m²** a **${e} cm** vas a necesitar **${V.toFixed(1)} m³** (**${kg.toFixed(0)} kg**) de paja. Ojo: **menos de 5 cm** controla poco las malezas y se seca rápido; para acolchado efectivo apuntá a 5-8 cm.`
    : `Para **${m} m²** a **${e} cm** vas a necesitar **${V.toFixed(1)} m³** (**${kg.toFixed(0)} kg**) de paja. Ese espesor retiene bien la humedad y frena las malezas. Reponé 1-2 cm por temporada a medida que se descompone.`;
  const insight = { title: 'Mulch que necesitás', text, tone: tone as 'good' | 'warn', icon: '🌱' };
  return { m3: V.toFixed(2), kg: kg.toFixed(0), resumen: `${V.toFixed(1)} m³ = ${kg.toFixed(0)} kg paja para ${m} m² a ${e} cm espesor.`, _insight: insight };
}
