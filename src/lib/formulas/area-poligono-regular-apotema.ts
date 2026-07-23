/** Apotema, área, perímetro y ángulos de un polígono regular */
export interface Inputs {
  lados?: number;
  longitudLado?: number;
  __lang?: string;
}
export interface Outputs {
  apotema: number;
  area: number;
  perimetro: number;
  anguloInterior: number;
  sumaAngulos: number;
  formula: string;
  _insight?: any;
}

const NOMBRES: Record<number, string> = {
  3: 'triángulo equilátero',
  4: 'cuadrado',
  5: 'pentágono',
  6: 'hexágono',
  7: 'heptágono',
  8: 'octógono',
  9: 'eneágono',
  10: 'decágono',
  11: 'endecágono',
  12: 'dodecágono',
  15: 'pentadecágono',
  20: 'icoságono',
};

export function areaPoligonoRegularApotema(i: Inputs): Outputs {
  const n = Math.round(Number(i.lados) || 0);
  const L = Number(i.longitudLado) || 0;

  if (n < 3) throw new Error('Un polígono necesita al menos 3 lados');
  if (n > 20) throw new Error('Esta calculadora cubre polígonos de 3 a 20 lados. Para más lados, el resultado se acerca al círculo (usá la calc de círculo)');
  if (L <= 0) throw new Error('Ingresá la longitud del lado (mayor a cero)');

  const apotema = L / (2 * Math.tan(Math.PI / n));
  const perimetro = n * L;
  const area = (perimetro * apotema) / 2;
  const anguloInterior = ((n - 2) * 180) / n;
  const sumaAngulos = (n - 2) * 180;

  const apotemaR = Number(apotema.toFixed(4));
  const areaR = Number(area.toFixed(4));
  const perimR = Number(perimetro.toFixed(4));
  const angR = Number(anguloInterior.toFixed(2));

  const nombre = NOMBRES[n] || `polígono de ${n} lados`;
  const formula = `Apotema = ${L} / (2 × tan(180°/${n})) = ${apotemaR} · Área = (${perimR} × ${apotemaR}) / 2 = ${areaR}`;

  return {
    apotema: apotemaR,
    area: areaR,
    perimetro: perimR,
    anguloInterior: angR,
    sumaAngulos,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `Un **${nombre}** regular de lado ${L} tiene una apotema de **${apotemaR.toLocaleString('es-AR')} u** y encierra un área de **${areaR.toLocaleString('es-AR')} u²**. Cada ángulo interior mide **${angR}°** y entre los ${n} ángulos suman ${sumaAngulos}°.`,
      tone: 'neutral',
      icon: '⬡',
    },
  };
}
