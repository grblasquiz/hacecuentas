/** Proporción áurea (phi = 1.618) para diseño, fotografía, arquitectura */
export interface Inputs {
  valor: number;
  modo?: string; // 'lado-mayor' | 'lado-menor' | 'total'
}
export interface Outputs {
  phi: number;
  ladoMayor: number;
  ladoMenor: number;
  total: number;
  relacionAurea: string;
  rectanguloAureo: { ancho: number; alto: number };
  fibonacci: number[];
  resumen: string;
  _insight?: any;
  _chart?: any;
}

const PHI = (1 + Math.sqrt(5)) / 2; // 1.618033988749...

export function proporcionAureaPhi(i: Inputs): Outputs {
  const v = Number(i.valor);
  const modo = String(i.modo || 'lado-mayor');
  if (!v || v <= 0) throw new Error('Ingresá un valor positivo');

  let ladoMayor = 0, ladoMenor = 0, total = 0;
  if (modo === 'lado-mayor') {
    ladoMayor = v;
    ladoMenor = v / PHI;
    total = ladoMayor + ladoMenor;
  } else if (modo === 'lado-menor') {
    ladoMenor = v;
    ladoMayor = v * PHI;
    total = ladoMayor + ladoMenor;
  } else {
    // 'total'
    total = v;
    ladoMayor = v / PHI;
    ladoMenor = total - ladoMayor;
  }

  // Rectángulo áureo (ancho = mayor, alto = menor)
  const rectanguloAureo = {
    ancho: Number(ladoMayor.toFixed(3)),
    alto: Number(ladoMenor.toFixed(3)),
  };

  // Secuencia Fibonacci (primeros 15)
  const fib: number[] = [0, 1];
  for (let k = 2; k < 15; k++) fib.push(fib[k - 1] + fib[k - 2]);

  const fmtN = (n: number) => Number(n.toFixed(3)).toLocaleString('es-AR', { maximumFractionDigits: 3 });
  const pctMayor = total > 0 ? (ladoMayor / total) * 100 : 0;
  const pctMenor = total > 0 ? (ladoMenor / total) * 100 : 0;

  const _insight = {
    title: 'Tu división áurea',
    text: `El segmento se divide en **${fmtN(ladoMayor)}** (mayor) y **${fmtN(ladoMenor)}** (menor): el grande es **${pctMayor.toFixed(1)}%** del total y el chico **${pctMenor.toFixed(1)}%**. La razón entre ambos es **${PHI.toFixed(3)}** (phi), la misma proporción que el ojo percibe como armónica en diseño, fotografía y arquitectura.`,
    tone: 'neutral' as const,
    icon: '🌀',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Lado mayor', value: Number(ladoMayor.toFixed(3)) },
      { label: 'Lado menor', value: Number(ladoMenor.toFixed(3)) },
    ],
    centerValue: fmtN(total),
    centerLabel: 'Total',
    ariaLabel: `División áurea: lado mayor ${fmtN(ladoMayor)} y lado menor ${fmtN(ladoMenor)}, razón phi`,
  };

  return {
    phi: Number(PHI.toFixed(6)),
    ladoMayor: Number(ladoMayor.toFixed(3)),
    ladoMenor: Number(ladoMenor.toFixed(3)),
    total: Number(total.toFixed(3)),
    relacionAurea: `${ladoMayor.toFixed(2)} : ${ladoMenor.toFixed(2)} = ${PHI.toFixed(3)} : 1`,
    rectanguloAureo,
    fibonacci: fib,
    resumen: `Proporción áurea: lado mayor ${ladoMayor.toFixed(3)}, lado menor ${ladoMenor.toFixed(3)}, phi = ${PHI.toFixed(4)}.`,
    _insight,
    _chart,
  };
}
