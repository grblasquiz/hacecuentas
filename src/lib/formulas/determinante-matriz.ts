/** Determinante e inversa de matriz 2×2 */
export interface Inputs { a11: number; a12: number; a21: number; a22: number; }
export interface Outputs {
  determinante: number;
  inversaTexto: string;
  esInvertible: string;
  detalle: string;
}

export function determinanteMatriz(i: Inputs): Outputs {
  const a = Number(i.a11);
  const b = Number(i.a12);
  const c = Number(i.a21);
  const d = Number(i.a22);
  if ([a, b, c, d].some(v => isNaN(v))) throw new Error('Ingresá los 4 valores de la matriz');

  const det = a * d - b * c;
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });

  let inversaTexto: string;
  let esInvertible: string;

  if (det === 0) {
    inversaTexto = 'No existe (determinante = 0)';
    esInvertible = 'No — la matriz es singular';
  } else {
    const inv11 = d / det;
    const inv12 = -b / det;
    const inv21 = -c / det;
    const inv22 = a / det;
    inversaTexto = `[[${fmt.format(inv11)}, ${fmt.format(inv12)}], [${fmt.format(inv21)}, ${fmt.format(inv22)}]]`;
    esInvertible = 'Sí';
  }

  return {
    determinante: Number(det.toFixed(4)),
    inversaTexto,
    esInvertible,
    detalle: `Matriz [[${fmt.format(a)}, ${fmt.format(b)}], [${fmt.format(c)}, ${fmt.format(d)}]] → det = ${fmt.format(a)}×${fmt.format(d)} − ${fmt.format(b)}×${fmt.format(c)} = ${fmt.format(det)}. ${esInvertible === 'Sí' ? `Inversa: ${inversaTexto}` : 'No tiene inversa.'}`,
  };
}
