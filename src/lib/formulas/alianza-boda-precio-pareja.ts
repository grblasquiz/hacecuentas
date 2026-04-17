/**
 * Calculadora de Alianza de Boda - Precio Pareja.
 */
export interface AlianzaBodaPrecioParejaInputs { presupuestoPareja:number; material:string; }
export interface AlianzaBodaPrecioParejaOutputs { precioPorAlianza:number; gramosOro:number; grabadoSugerido:string; costoGrabado:number; }
export function alianzaBodaPrecioPareja(inputs: AlianzaBodaPrecioParejaInputs): AlianzaBodaPrecioParejaOutputs {
  const preso = Number(inputs.presupuestoPareja);
  const mat = inputs.material;
  if (!preso || preso <= 0) throw new Error('Ingresá presupuesto');
  const precioPorAlianza = preso / 2;
  let gramosOro = 0;
  if (mat === 'plata925') gramosOro = precioPorAlianza / 2.5;
  else if (mat === 'oro14k') gramosOro = precioPorAlianza / 80;
  else if (mat === 'oro18k') gramosOro = precioPorAlianza / 110;
  else if (mat === 'platino') gramosOro = precioPorAlianza / 180;
  else gramosOro = precioPorAlianza / 40;
  const grabadoSugerido = 'Fecha + iniciales (ej: 15-12-2026 M & L)';
  const costoGrabado = 30;
  return {
    precioPorAlianza: Number(precioPorAlianza.toFixed(0)),
    gramosOro: Number(gramosOro.toFixed(1)),
    grabadoSugerido,
    costoGrabado,
  };
}
