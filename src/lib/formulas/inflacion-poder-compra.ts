/** Calculadora de inflación y poder de compra */
export interface Inputs {
  montoOriginal: number;
  inflacionAnual: number;
  anios: number;
}
export interface Outputs {
  valorReal: number;
  perdida: number;
  perdidaPct: string;
  necesitasHoy: number;
}

export function inflacionPoderCompra(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal);
  const inflAnual = Number(i.inflacionAnual);
  const anios = Number(i.anios);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto original');
  if (inflAnual < 0) throw new Error('La inflación no puede ser negativa');
  if (!anios || anios <= 0) throw new Error('Ingresá la cantidad de años');

  const factor = Math.pow(1 + inflAnual / 100, anios);
  const valorReal = monto / factor;
  const perdida = monto - valorReal;
  const perdidaPct = ((perdida / monto) * 100).toFixed(1);
  const necesitasHoy = monto * factor;

  return {
    valorReal: Math.round(valorReal),
    perdida: Math.round(perdida),
    perdidaPct: `${perdidaPct}%`,
    necesitasHoy: Math.round(necesitasHoy),
  };
}
