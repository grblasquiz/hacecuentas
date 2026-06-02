/** m² de terreno irregular - shoelace formula para polígonos 3-8 lados */
export interface Inputs {
  x1?: number; y1?: number;
  x2?: number; y2?: number;
  x3?: number; y3?: number;
  x4?: number; y4?: number;
  x5?: number; y5?: number;
  x6?: number; y6?: number;
  x7?: number; y7?: number;
  x8?: number; y8?: number;
  nLados: number | string;
}

export interface Outputs {
  areaM2: number;
  areaHa: number;
  perimetroM: number;
  resumen: string;
  _insight?: any;
}

export function m2TerrenoIrregularPoligono(i: Inputs): Outputs {
  const n = Number(i.nLados);
  if (!n || n < 3 || n > 8) throw new Error('Cantidad de lados debe ser entre 3 y 8');

  const pts: Array<[number, number]> = [];
  for (let k = 1; k <= n; k++) {
    const x = Number((i as any)[`x${k}`]);
    const y = Number((i as any)[`y${k}`]);
    if (!isFinite(x) || !isFinite(y)) throw new Error(`Faltan coordenadas del vértice ${k}`);
    pts.push([x, y]);
  }

  // Shoelace formula
  let sum = 0;
  let perim = 0;
  for (let k = 0; k < n; k++) {
    const [x1, y1] = pts[k];
    const [x2, y2] = pts[(k + 1) % n];
    sum += x1 * y2 - x2 * y1;
    perim += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
  const area = Math.abs(sum) / 2;

  const areaR = Number(area.toFixed(2));
  const haR = Number((area / 10000).toFixed(4));
  const perimR = Number(perim.toFixed(2));

  const insight = {
    title: 'Tu terreno en números',
    text: haR >= 1
      ? `El polígono de ${n} lados encierra **${areaR.toLocaleString('es-AR')} m²**, equivalente a **${haR.toFixed(2)} ha**. Con ${perimR.toLocaleString('es-AR')} m de perímetro, dimensioná el alambrado y verificá estas medidas contra la escritura o el plano de mensura.`
      : `El polígono de ${n} lados encierra **${areaR.toLocaleString('es-AR')} m²** (${haR.toFixed(4)} ha), con un perímetro de **${perimR.toLocaleString('es-AR')} m** para cerco o muro. Cargá los vértices en el mismo orden (horario o antihorario) para que el área cierre bien.`,
    tone: 'neutral',
    icon: '📐',
  };

  return {
    areaM2: areaR,
    areaHa: haR,
    perimetroM: perimR,
    resumen: `Terreno de ${n} lados: **${area.toFixed(2)} m²** (${(area / 10000).toFixed(4)} ha). Perímetro: ${perim.toFixed(2)} m.`,
    _insight: insight,
  };
}
