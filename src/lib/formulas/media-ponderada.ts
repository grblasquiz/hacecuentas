/** Promedio ponderado */
export interface Inputs { valores: string; pesos: string; }
export interface Outputs {
  mediaPonderada: number;
  sumaTotal: number;
  detalle: string;
}

export function mediaPonderada(i: Inputs): Outputs {
  const valoresStr = String(i.valores || '').trim();
  const pesosStr = String(i.pesos || '').trim();
  if (!valoresStr) throw new Error('Ingresá los valores separados por coma');
  if (!pesosStr) throw new Error('Ingresá los pesos separados por coma');

  const valores = valoresStr.split(',').map(v => Number(v.trim()));
  const pesos = pesosStr.split(',').map(v => Number(v.trim()));

  if (valores.some(v => isNaN(v))) throw new Error('Todos los valores deben ser números');
  if (pesos.some(v => isNaN(v))) throw new Error('Todos los pesos deben ser números');
  if (valores.length !== pesos.length) throw new Error('La cantidad de valores y pesos debe ser igual');
  if (pesos.some(v => v < 0)) throw new Error('Los pesos deben ser positivos');

  const sumaPesos = pesos.reduce((a, b) => a + b, 0);
  if (sumaPesos === 0) throw new Error('La suma de los pesos no puede ser cero');

  const sumaPonderada = valores.reduce((acc, val, idx) => acc + val * pesos[idx], 0);
  const media = sumaPonderada / sumaPesos;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  const paresStr = valores.map((v, idx) => `${v}×${pesos[idx]}`).join(' + ');

  return {
    mediaPonderada: Number(media.toFixed(4)),
    sumaTotal: Number(sumaPesos.toFixed(2)),
    detalle: `Promedio ponderado = (${paresStr}) / ${fmt.format(sumaPesos)} = ${fmt.format(sumaPonderada)} / ${fmt.format(sumaPesos)} = ${fmt.format(media)}.`,
  };
}
