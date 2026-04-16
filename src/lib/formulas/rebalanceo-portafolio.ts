/** Rebalanceo de portafolio — cuánto comprar/vender para volver al target */

export interface Inputs {
  valorTotal: number;
  activo1Valor: number;
  activo1Target: number;
  activo2Valor: number;
  activo2Target: number;
  activo3Valor: number;
  activo3Target: number;
  activo4Valor: number;
  activo4Target: number;
}

export interface Outputs {
  activo1Accion: number;
  activo2Accion: number;
  activo3Accion: number;
  activo4Accion: number;
  desvioMaximo: number;
  necesitaRebalanceo: string;
  formula: string;
  explicacion: string;
}

export function rebalanceoPortafolio(i: Inputs): Outputs {
  const total = Number(i.valorTotal);

  if (!total || total <= 0) throw new Error('Ingresá el valor total del portafolio');

  const activos: Array<{
    valor: number; target: number; nombre: string;
  }> = [];

  for (let n = 1; n <= 4; n++) {
    const valor = Number((i as Record<string, number>)[`activo${n}Valor`]) || 0;
    const target = Number((i as Record<string, number>)[`activo${n}Target`]) || 0;
    if (target > 0 || valor > 0) {
      activos.push({ valor, target, nombre: `Activo ${n}` });
    }
  }

  if (activos.length === 0) throw new Error('Ingresá al menos un activo con su target');

  const resultados: number[] = [];
  let desvioMaximo = 0;
  const detalles: string[] = [];

  for (const a of activos) {
    const pesoActual = (a.valor / total) * 100;
    const valorTarget = total * (a.target / 100);
    const accion = valorTarget - a.valor;
    resultados.push(accion);

    const desvio = Math.abs(pesoActual - a.target);
    if (desvio > desvioMaximo) desvioMaximo = desvio;

    detalles.push(
      `${a.nombre}: actual ${pesoActual.toFixed(1)}% ($${a.valor.toLocaleString()}) → target ${a.target}% ($${Math.round(valorTarget).toLocaleString()}) → ${accion >= 0 ? 'comprar' : 'vender'} $${Math.abs(Math.round(accion)).toLocaleString()}`
    );
  }

  // Pad results to 4
  while (resultados.length < 4) resultados.push(0);

  const necesitaRebalanceo = desvioMaximo > 5 ? 'Sí — desvío mayor a 5%' : desvioMaximo > 2 ? 'Opcional — desvío moderado' : 'No necesario — portafolio alineado';

  const formula = `Target - Actual para cada activo`;
  const explicacion = `Portafolio total: $${total.toLocaleString()}. ${detalles.join('. ')}. Desvío máximo: ${desvioMaximo.toFixed(1)}%. ${necesitaRebalanceo}.`;

  return {
    activo1Accion: Math.round(resultados[0]),
    activo2Accion: Math.round(resultados[1]),
    activo3Accion: Math.round(resultados[2]),
    activo4Accion: Math.round(resultados[3]),
    desvioMaximo: Number(desvioMaximo.toFixed(2)),
    necesitaRebalanceo,
    formula,
    explicacion,
  };
}
