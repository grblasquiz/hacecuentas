/** Teorema de Tales — segmentos proporcionales */
export interface Inputs { a: number; b: number; c: number; }
export interface Outputs {
  segmentoD: number;
  proporcion: string;
  detalle: string;
}

export function teoremaTales(i: Inputs): Outputs {
  const a = Number(i.a);
  const b = Number(i.b);
  const c = Number(i.c);
  if (!a || a <= 0) throw new Error('Ingresá un valor válido para el segmento a');
  if (!b || b <= 0) throw new Error('Ingresá un valor válido para el segmento b');
  if (!c || c <= 0) throw new Error('Ingresá un valor válido para el segmento c');

  // a/b = c/d → d = b*c/a
  const d = (b * c) / a;
  const razon = a / b;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });

  return {
    segmentoD: Number(d.toFixed(4)),
    proporcion: `${fmt.format(a)} / ${fmt.format(b)} = ${fmt.format(c)} / ${fmt.format(d)} (razón: ${fmt.format(razon)})`,
    detalle: `Teorema de Tales: a/b = c/d → ${fmt.format(a)}/${fmt.format(b)} = ${fmt.format(c)}/d → d = ${fmt.format(b)} × ${fmt.format(c)} / ${fmt.format(a)} = ${fmt.format(d)}.`,
  };
}
