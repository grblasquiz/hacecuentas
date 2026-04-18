export interface TransformadorRelacionVueltasInputs { modo: string; v1: number; n1?: number; n2?: number; i1?: number; }
export interface TransformadorRelacionVueltasOutputs { v2: string; i2: string; relacion: string; potencia: string; resumen: string; }
export function transformadorRelacionVueltas(i: TransformadorRelacionVueltasInputs): TransformadorRelacionVueltasOutputs {
  const v1 = Number(i.v1); const n1 = Number(i.n1 ?? 0); const n2 = Number(i.n2 ?? 0); const i1 = Number(i.i1 ?? 0);
  if (!v1 || v1 <= 0) throw new Error('Ingresá V1');
  if (!n1 || !n2) throw new Error('Ingresá N1 y N2');
  const v2 = v1 * n2 / n1;
  const i2 = i1 > 0 ? i1 * n1 / n2 : 0;
  const p = v1 * i1;
  const rel = n1 / n2;
  return {
    v2: v2.toFixed(2) + ' V',
    i2: i2 > 0 ? i2.toFixed(2) + ' A' : 'Ingresá I1',
    relacion: `${rel.toFixed(2)}:1`,
    potencia: i1 > 0 ? p.toFixed(1) + ' W' : 'Ingresá I1',
    resumen: `Transformador ${rel > 1 ? 'reductor' : 'elevador'} ${rel.toFixed(1)}:1. V2 = ${v2.toFixed(1)} V${i1 > 0 ? ', I2 = ' + i2.toFixed(1) + ' A' : ''}.`
  };
}
