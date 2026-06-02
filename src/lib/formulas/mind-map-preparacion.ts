/** Tiempo para armar un Mind Map */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  tiempoTotal: number;
  totalNodos: number;
  minutosPorNodo: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
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
  let tone: 'good' | 'warn' | 'neutral';
  if (nodos > 80) { rec = 'Considerá dividir en sub-maps por tema.'; tone = 'warn'; }
  else if (nodos < 15) { rec = 'Mapa demasiado simple — podrías hacerlo en lista.'; tone = 'warn'; }
  else { rec = 'Tamaño ideal para foco y estudio.'; tone = 'good'; }

  const modoLabel = modo === 'papel' ? 'a mano (papel)' : 'en digital';
  const ultimoMax = Math.max(120, nodos + 5);

  return {
    tiempoTotal: tiempo,
    totalNodos: nodos,
    minutosPorNodo: minPorNodo,
    recomendacion: rec,
    _insight: {
      title: 'Tu mapa de un vistazo',
      text: `Con **${ramas} ramas** y **${sub} sub-ramas** cada una, tu mapa tiene **${nodos} nodos** y te lleva unos **${tiempo} minutos** armarlo ${modoLabel}. ${rec}`,
      tone,
      icon: '🧠'
    },
    _chart: {
      type: 'scale',
      marker: nodos,
      markerLabel: `${nodos} nodos`,
      min: 0,
      segments: [
        { nombre: 'Muy simple', max: 15, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Ideal', max: 80, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Sobrecargado', max: ultimoMax, color: '#ef4444', colorDark: '#dc2626' }
      ],
      ariaLabel: `Tamaño del mind map: ${nodos} nodos sobre una escala de complejidad`
    }
  };

}
