/** Depreciación y valor residual estimado de un auto por antigüedad */
export interface Inputs {
  precio0km: number;
  anosAntiguedad: number;
  tasaAnual?: number;
}
export interface Outputs {
  valorActual: number;
  depreciacionTotal: number;
  porcentajePerdido: number;
  valorProximoAnio: number;
  depreciacionPorAnio: { anio: number; valor: number; perdida: number }[];
  resumen: string;
}

export function antiguedadAutoAmortizacion(i: Inputs): Outputs {
  const precio = Number(i.precio0km);
  const anos = Number(i.anosAntiguedad);
  const tasa = Number(i.tasaAnual) || 18; // 18% anual típico en Argentina

  if (!precio || precio <= 0) throw new Error('Ingresá el precio 0km del vehículo');
  if (anos < 0 || anos > 50) throw new Error('Los años de antigüedad deben estar entre 0 y 50');
  if (tasa < 5 || tasa > 40) throw new Error('La tasa anual debe estar entre 5% y 40%');

  const factor = 1 - tasa / 100;
  let valorActual = precio * Math.pow(factor, anos);
  const valorProximoAnio = valorActual * factor;
  const depreciacionTotal = precio - valorActual;
  const porcentajePerdido = (depreciacionTotal / precio) * 100;

  // Tabla por año (máximo 10 años)
  const depreciacionPorAnio = [];
  for (let a = 0; a <= Math.min(10, Math.ceil(anos) + 2); a++) {
    const val = precio * Math.pow(factor, a);
    const perdida = precio - val;
    depreciacionPorAnio.push({
      anio: a,
      valor: Math.round(val),
      perdida: Math.round(perdida),
    });
  }

  return {
    valorActual: Math.round(valorActual),
    depreciacionTotal: Math.round(depreciacionTotal),
    porcentajePerdido: Number(porcentajePerdido.toFixed(1)),
    valorProximoAnio: Math.round(valorProximoAnio),
    depreciacionPorAnio,
    resumen: `Tras ${anos} año(s), el auto vale ~$${Math.round(valorActual).toLocaleString('es-AR')} (perdió ${porcentajePerdido.toFixed(1)}% del valor inicial).`,
  };
}
