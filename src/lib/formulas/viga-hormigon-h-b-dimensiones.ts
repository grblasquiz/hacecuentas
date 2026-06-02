export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function vigaHormigonHBDimensiones(i: Inputs): Outputs {
  const L = Number(i.luz) || 0;
  const h = L * 100 / 12; const b = h / 2;

  const _insight = {
    title: 'Predimensionado de la viga',
    text: `Para una luz de **${L} m**, el predimensionado sugiere una viga de **${h.toFixed(0)}×${b.toFixed(0)} cm** (alto ≈ luz/12, ancho ≈ alto/2). Es una estimación inicial: el cálculo final lo define un ingeniero según cargas y armadura.`,
    tone: 'neutral',
    icon: '🏗️',
  };

  return { altura: h.toFixed(0), ancho: b.toFixed(0), resumen: `Viga ${h.toFixed(0)}×${b.toFixed(0)} cm para luz ${L} m.`, _insight };
}
