/** Área, perímetro y mediana de un trapecio */
export interface Inputs {
  baseMayor?: number;
  baseMenor?: number;
  altura?: number;
  lado1?: number;
  lado2?: number;
  __lang?: string;
}
export interface Outputs {
  area: number;
  mediana: number;
  perimetro: number;
  formula: string;
  _insight?: any;
}

export function areaPerimetroTrapecio(i: Inputs): Outputs {
  const B = Number(i.baseMayor) || 0;
  const b = Number(i.baseMenor) || 0;
  const h = Number(i.altura) || 0;
  const l1 = Number(i.lado1) || 0;
  const l2 = Number(i.lado2) || 0;

  if (B <= 0 || b <= 0) throw new Error('Ingresá las dos bases del trapecio (valores mayores a cero)');
  if (h <= 0) throw new Error('Ingresá la altura del trapecio (mayor a cero)');
  if (b > B) throw new Error('La base mayor tiene que ser mayor o igual a la base menor. Revisá si las cargaste al revés');
  if (l1 < 0 || l2 < 0) throw new Error('Los lados no paralelos no pueden ser negativos');
  if ((l1 > 0 && l1 < h) || (l2 > 0 && l2 < h)) throw new Error('Un lado no paralelo no puede ser más corto que la altura: no cierra el trapecio');

  const mediana = (B + b) / 2;
  const area = mediana * h;

  let perimetro = 0;
  let formula = `Área = (${B} + ${b}) / 2 × ${h} = ${mediana} × ${h} = ${area.toFixed(4)}`;
  if (l1 > 0 && l2 > 0) {
    perimetro = B + b + l1 + l2;
    formula += ` · Perímetro = ${B} + ${b} + ${l1} + ${l2} = ${perimetro.toFixed(4)}`;
  }

  const areaR = Number(area.toFixed(4));
  const perimR = Number(perimetro.toFixed(4));
  const medianaR = Number(mediana.toFixed(4));

  const perimTxt =
    perimetro > 0
      ? ` Sumando los cuatro lados, el perímetro da **${perimR.toLocaleString('es-AR')} u**.`
      : ' Cargá los dos lados no paralelos si querés el perímetro también.';

  return {
    area: areaR,
    mediana: medianaR,
    perimetro: perimR,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `El trapecio de bases ${B} y ${b} con altura ${h} encierra un área de **${areaR.toLocaleString('es-AR')} u²**. Su mediana (el segmento medio entre las bases) mide **${medianaR.toLocaleString('es-AR')} u**: el área es simplemente mediana × altura.${perimTxt}`,
      tone: 'neutral',
      icon: '📐',
    },
  };
}
