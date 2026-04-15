/** Comparación de costo: lavar en casa vs lavandería */
export interface Inputs {
  lavadosPorSemana: number;
  kgPorLavado?: number;
  costoLavanderiaKg: number;
  costoAgua?: number;
  costoLuz?: number;
  costoJabon?: number;
  precioLavarropas?: number;
  vidaUtilAnos?: number;
}
export interface Outputs {
  costoPorLavadoCasa: number;
  costoPorLavadoLavanderia: number;
  ahorroMensual: number;
  detalle: string;
}

export function costoLavadoRopaLavadoraVsLavanderia(i: Inputs): Outputs {
  const lavadosSem = Number(i.lavadosPorSemana);
  const kgLavado = Number(i.kgPorLavado) || 5;
  const precioLavKg = Number(i.costoLavanderiaKg);
  const agua = Number(i.costoAgua) || 200;
  const luz = Number(i.costoLuz) || 300;
  const jabon = Number(i.costoJabon) || 400;
  const precioEquipo = Number(i.precioLavarropas) || 0;
  const vidaUtil = Number(i.vidaUtilAnos) || 10;

  if (!lavadosSem || lavadosSem <= 0) throw new Error('Ingresá cuántos lavados hacés por semana');
  if (!precioLavKg || precioLavKg <= 0) throw new Error('Ingresá el precio de la lavandería por kg');

  const lavadosMes = lavadosSem * 4.33;

  // Costo lavandería
  const costoLavanderiaPorLavado = kgLavado * precioLavKg;
  const costoLavanderiaMes = costoLavanderiaPorLavado * lavadosMes;

  // Costo casa (operativo)
  const costoOperativoPorLavado = agua + luz + jabon;

  // Amortización
  const lavadosTotalesVidaUtil = lavadosSem * 52 * vidaUtil;
  const amortizacionPorLavado = lavadosTotalesVidaUtil > 0 ? precioEquipo / lavadosTotalesVidaUtil : 0;

  const costoCasaPorLavado = costoOperativoPorLavado + amortizacionPorLavado;
  const costoCasaMes = costoCasaPorLavado * lavadosMes;

  const ahorro = Math.abs(costoLavanderiaMes - costoCasaMes);
  const masBarato = costoCasaMes <= costoLavanderiaMes ? 'casa' : 'lavandería';

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    costoPorLavadoCasa: Math.round(costoCasaPorLavado),
    costoPorLavadoLavanderia: Math.round(costoLavanderiaPorLavado),
    ahorroMensual: Math.round(ahorro),
    detalle: `${fmt.format(lavadosMes)} lavados/mes de ${kgLavado} kg: en casa $${fmt.format(costoCasaMes)}/mes (operativo $${fmt.format(costoOperativoPorLavado)} + amortización $${fmt.format(amortizacionPorLavado)} por lavado) vs lavandería $${fmt.format(costoLavanderiaMes)}/mes. Lavar en ${masBarato} ahorra $${fmt.format(ahorro)}/mes.`,
  };
}
