/** Tiempo para armar un Mind Map */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  tiempoTotal: number;
  totalNodos: number;
  minutosPorNodo: number;
  recomendacion: string;
}

export function mindMapPreparacion(i: Inputs): Outputs {
  const ramas = Number(i.ramasPrincipales) || 6;
  const sub = Number(i.subRamas) || 5;
  const modo = String(i.modo || 'digital');
  if (ramas <= 0 || sub <= 0) throw new Error('Datos inválidos');

  const nodos = 1 + ramas + (ramas * sub);
  const minPorNodo = modo === 'papel' ? 2 : 1.5;
  const tiempo = Math.round(nodos * minPorNodo) + 10;

  let rec = '';
  if (nodos > 80) rec = 'Considerá dividir en sub-maps por tema.';
  else if (nodos < 15) rec = 'Mapa demasiado simple — podrías hacerlo en lista.';
  else rec = 'Tamaño ideal para foco y estudio.';

  return {
    tiempoTotal: tiempo,
    totalNodos: nodos,
    minutosPorNodo: minPorNodo,
    recomendacion: rec,
  };

}
