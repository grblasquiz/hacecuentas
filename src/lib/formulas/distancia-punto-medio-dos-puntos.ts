/** Distancia euclidiana, punto medio y pendiente entre dos puntos del plano */
export interface Inputs {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  __lang?: string;
}
export interface Outputs {
  distancia: number;
  puntoMedio: string;
  pendiente: string;
  deltaX: number;
  deltaY: number;
  formula: string;
  _insight?: any;
}

export function distanciaPuntoMedioDosPuntos(i: Inputs): Outputs {
  const vals = [i.x1, i.y1, i.x2, i.y2];
  if (vals.some((v) => v === undefined || v === null || Number.isNaN(Number(v))))
    throw new Error('Ingresá las cuatro coordenadas: x₁, y₁, x₂ e y₂');
  const x1 = Number(i.x1);
  const y1 = Number(i.y1);
  const x2 = Number(i.x2);
  const y2 = Number(i.y2);
  if (x1 === x2 && y1 === y2)
    throw new Error('Los dos puntos son el mismo: la distancia es 0 y el segmento no existe. Ingresá puntos distintos');

  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.sqrt(dx * dx + dy * dy);
  const xm = (x1 + x2) / 2;
  const ym = (y1 + y2) / 2;

  const fmt = (n: number) => String(Number(n.toFixed(4)));
  const pendiente =
    dx === 0
      ? 'Indefinida (segmento vertical, Δx = 0)'
      : fmt(dy / dx);

  const dR = Number(d.toFixed(4));
  const pendTxt =
    dx === 0
      ? 'el segmento es **vertical** (pendiente indefinida)'
      : dy === 0
        ? 'el segmento es **horizontal** (pendiente 0)'
        : `la pendiente es **${fmt(dy / dx)}**`;

  return {
    distancia: dR,
    puntoMedio: `(${fmt(xm)}, ${fmt(ym)})`,
    pendiente,
    deltaX: Number(dx.toFixed(4)),
    deltaY: Number(dy.toFixed(4)),
    formula: `d = √((${x2} − ${x1})² + (${y2} − ${y1})²) = √(${fmt(dx * dx)} + ${fmt(dy * dy)}) = ${dR}`,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `Entre (${fmt(x1)}, ${fmt(y1)}) y (${fmt(x2)}, ${fmt(y2)}) hay **${dR.toLocaleString('es-AR')} unidades** en línea recta (es Pitágoras con Δx = ${fmt(dx)} y Δy = ${fmt(dy)}). El punto medio exacto del segmento es **(${fmt(xm)}, ${fmt(ym)})** y ${pendTxt}.`,
      tone: 'neutral',
      icon: '🗺️',
    },
  };
}
