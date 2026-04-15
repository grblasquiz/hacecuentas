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

  return {
    phi: Number(PHI.toFixed(6)),
    ladoMayor: Number(ladoMayor.toFixed(3)),
    ladoMenor: Number(ladoMenor.toFixed(3)),
    total: Number(total.toFixed(3)),
    relacionAurea: `${ladoMayor.toFixed(2)} : ${ladoMenor.toFixed(2)} = ${PHI.toFixed(3)} : 1`,
    rectanguloAureo,
    fibonacci: fib,
    resumen: `Proporción áurea: lado mayor ${ladoMayor.toFixed(3)}, lado menor ${ladoMenor.toFixed(3)}, phi = ${PHI.toFixed(4)}.`,
  };
}
