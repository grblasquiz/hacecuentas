export interface TransformadorRelacionVueltasInputs { modo: string; v1: number; n1?: number; n2?: number; i1?: number; }
export interface TransformadorRelacionVueltasOutputs { v2: string; i2: string; relacion: string; potencia: string; resumen: string; _insight?: any; }
export function transformadorRelacionVueltas(i: TransformadorRelacionVueltasInputs): TransformadorRelacionVueltasOutputs {
  const v1 = Number(i.v1); const n1 = Number(i.n1 ?? 0); const n2 = Number(i.n2 ?? 0); const i1 = Number(i.i1 ?? 0);
  if (!v1 || v1 <= 0) throw new Error('Ingresá V1');
  if (!n1 || !n2) throw new Error('Ingresá N1 y N2');
  const v2 = v1 * n2 / n1;
  const i2 = i1 > 0 ? i1 * n1 / n2 : 0;
  const p = v1 * i1;
  const rel = n1 / n2;
  const sentido = rel > 1
    ? `baja la tensión de ${v1.toFixed(0)} V a **${v2.toFixed(1)} V**`
    : rel < 1
      ? `sube la tensión de ${v1.toFixed(0)} V a **${v2.toFixed(1)} V**`
      : `mantiene la tensión en **${v2.toFixed(1)} V** (relación 1:1)`;
  const corrienteTxt = i1 > 0
    ? ` La corriente hace lo inverso: pasa de ${i1.toFixed(1)} A a **${i2.toFixed(1)} A**, conservando ~${p.toFixed(0)} W de potencia.`
    : ' Ingresá la corriente del primario (I1) para ver la corriente del secundario y la potencia.';
  const insight = {
    title: rel > 1 ? 'Transformador reductor' : rel < 1 ? 'Transformador elevador' : 'Transformador 1:1',
    text: `Con ${n1} vueltas en el primario y ${n2} en el secundario, el transformador ${sentido}.${corrienteTxt}`,
    tone: 'neutral',
    icon: '🔌',
  };
  return {
    v2: v2.toFixed(2) + ' V',
    i2: i2 > 0 ? i2.toFixed(2) + ' A' : 'Ingresá I1',
    relacion: `${rel.toFixed(2)}:1`,
    potencia: i1 > 0 ? p.toFixed(1) + ' W' : 'Ingresá I1',
    resumen: `Transformador ${rel > 1 ? 'reductor' : 'elevador'} ${rel.toFixed(1)}:1. V2 = ${v2.toFixed(1)} V${i1 > 0 ? ', I2 = ' + i2.toFixed(1) + ' A' : ''}.`,
    _insight: insight,
  };
}
