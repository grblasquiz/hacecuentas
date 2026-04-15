/** Ahorro hormiga: cuánto ahorrás eliminando un gasto diario */

export interface Inputs {
  gastoDiario: number;
  tasaAnual: number;
}

export interface Outputs {
  ahorroMensual: number;
  ahorroAnual: number;
  ahorro5Anios: number;
  ahorro10Anios: number;
}

function calcularVFAnualidad(aporteMensual: number, tasaMensual: number, meses: number): number {
  if (tasaMensual === 0) return aporteMensual * meses;
  return aporteMensual * ((Math.pow(1 + tasaMensual, meses) - 1) / tasaMensual);
}

export function ahorroHormiga(i: Inputs): Outputs {
  const gastoDiario = Number(i.gastoDiario);
  const tasaAnual = Number(i.tasaAnual);

  if (isNaN(gastoDiario) || gastoDiario <= 0) throw new Error('Ingresá el gasto diario a eliminar');
  if (isNaN(tasaAnual) || tasaAnual < 0) throw new Error('La tasa anual no puede ser negativa');

  const ahorroMensual = gastoDiario * 30;
  const tasaMensual = tasaAnual / 100 / 12;

  const ahorroAnual = calcularVFAnualidad(ahorroMensual, tasaMensual, 12);
  const ahorro5Anios = calcularVFAnualidad(ahorroMensual, tasaMensual, 60);
  const ahorro10Anios = calcularVFAnualidad(ahorroMensual, tasaMensual, 120);

  return {
    ahorroMensual: Math.round(ahorroMensual),
    ahorroAnual: Math.round(ahorroAnual),
    ahorro5Anios: Math.round(ahorro5Anios),
    ahorro10Anios: Math.round(ahorro10Anios),
  };
}
