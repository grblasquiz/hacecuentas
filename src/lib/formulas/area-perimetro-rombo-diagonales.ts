/** Área, lado y perímetro de un rombo (por diagonales o por lado y altura) */
export interface Inputs {
  modo?: string;
  diagonalMayor?: number;
  diagonalMenor?: number;
  lado?: number;
  altura?: number;
  __lang?: string;
}
export interface Outputs {
  area: number;
  ladoRombo: number;
  perimetro: number;
  formula: string;
  _insight?: any;
}

export function areaPerimetroRomboDiagonales(i: Inputs): Outputs {
  const modo = String(i.modo || 'diagonales');

  let area = 0;
  let lado = 0;
  let formula = '';

  if (modo === 'diagonales') {
    const D = Number(i.diagonalMayor) || 0;
    const d = Number(i.diagonalMenor) || 0;
    if (D <= 0 || d <= 0) throw new Error('Ingresá las dos diagonales del rombo (valores mayores a cero)');
    if (d > D) throw new Error('La diagonal mayor tiene que ser mayor o igual a la menor. Revisá si las cargaste al revés');
    area = (D * d) / 2;
    lado = Math.sqrt((D / 2) ** 2 + (d / 2) ** 2);
    formula = `Área = (${D} × ${d}) / 2 = ${area.toFixed(4)} · Lado = √((${D}/2)² + (${d}/2)²) = ${lado.toFixed(4)}`;
  } else {
    // lado-altura
    const l = Number(i.lado) || 0;
    const h = Number(i.altura) || 0;
    if (l <= 0) throw new Error('Ingresá el lado del rombo (mayor a cero)');
    if (h <= 0) throw new Error('Ingresá la altura del rombo (mayor a cero)');
    if (h > l) throw new Error('La altura no puede superar al lado: el rombo no cierra. La altura máxima es igual al lado (caso cuadrado)');
    area = l * h;
    lado = l;
    formula = `Área = base × altura = ${l} × ${h} = ${area.toFixed(4)}`;
  }

  const perimetro = 4 * lado;
  const areaR = Number(area.toFixed(4));
  const ladoR = Number(lado.toFixed(4));
  const perimR = Number(perimetro.toFixed(4));

  const extra =
    modo === 'diagonales'
      ? ' El lado sale por Pitágoras: las diagonales se cortan en ángulo recto y cada semidiagonal es un cateto.'
      : ' Con lado y altura el rombo se calcula igual que un paralelogramo: base × altura.';

  return {
    area: areaR,
    ladoRombo: ladoR,
    perimetro: perimR,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `El rombo encierra un área de **${areaR.toLocaleString('es-AR')} u²**, cada lado mide **${ladoR.toLocaleString('es-AR')} u** y el perímetro total es **${perimR.toLocaleString('es-AR')} u**.${extra}`,
      tone: 'neutral',
      icon: '🔷',
    },
  };
}
