/** Voltaje de salida de un transformador según relación de espiras */
export interface Inputs { voltajePrimario: number; espirasPrimario: number; espirasSecundario: number; }
export interface Outputs { voltajeSecundario: number; relacionEspiras: number; tipo: string; detalle: string; }

export function transformadorRelacionEspiras(i: Inputs): Outputs {
  const vp = Number(i.voltajePrimario);
  const np = Number(i.espirasPrimario);
  const ns = Number(i.espirasSecundario);

  if (!vp || vp <= 0) throw new Error('Ingresá el voltaje del primario');
  if (!np || np <= 0) throw new Error('Ingresá las espiras del primario');
  if (!ns || ns <= 0) throw new Error('Ingresá las espiras del secundario');

  const vs = vp * (ns / np);
  const relacion = np / ns;
  let tipo: string;
  if (relacion > 1) tipo = 'Reductor (step-down)';
  else if (relacion < 1) tipo = 'Elevador (step-up)';
  else tipo = 'Aislador (1:1)';

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    voltajeSecundario: Number(vs.toFixed(2)),
    relacionEspiras: Number(relacion.toFixed(2)),
    tipo,
    detalle: `Vs = ${fmt.format(vp)}V × (${fmt.format(ns)} / ${fmt.format(np)}) = ${fmt.format(vs)}V. Relación: ${fmt.format(relacion)}:1. Tipo: ${tipo}.`,
  };
}
