/** Multiplicación de matrices 3x3 */
export interface Inputs {
  a11: number; a12: number; a13: number;
  a21: number; a22: number; a23: number;
  a31: number; a32: number; a33: number;
  b11: number; b12: number; b13: number;
  b21: number; b22: number; b23: number;
  b31: number; b32: number; b33: number;
}

export interface Outputs {
  result: string;
  detalle: string;
}

export function matrizMultiplicacion3x3(i: Inputs): Outputs {
  const A = [
    [Number(i.a11), Number(i.a12), Number(i.a13)],
    [Number(i.a21), Number(i.a22), Number(i.a23)],
    [Number(i.a31), Number(i.a32), Number(i.a33)],
  ];
  const B = [
    [Number(i.b11), Number(i.b12), Number(i.b13)],
    [Number(i.b21), Number(i.b22), Number(i.b23)],
    [Number(i.b31), Number(i.b32), Number(i.b33)],
  ];

  // Validate
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (isNaN(A[r][c])) throw new Error(`Ingresá A[${r + 1},${c + 1}]`);
      if (isNaN(B[r][c])) throw new Error(`Ingresá B[${r + 1},${c + 1}]`);
    }
  }

  // Multiply
  const C: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const pasos: string[] = [];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      const parts: string[] = [];
      for (let k = 0; k < 3; k++) {
        sum += A[r][k] * B[k][c];
        parts.push(`${A[r][k]}×${B[k][c]}`);
      }
      C[r][c] = sum;
      pasos.push(`C[${r + 1},${c + 1}] = ${parts.join(' + ')} = **${sum}**`);
    }
  }

  const matrizStr = `| ${C[0].join('  ')} |\n| ${C[1].join('  ')} |\n| ${C[2].join('  ')} |`;

  return {
    result: matrizStr,
    detalle: `**Matriz A × B:**\n\n${matrizStr}\n\n**Cálculo por elemento:**\n${pasos.join('\n')}`,
  };
}
