/**
 * Calculadora de Alianza de Boda - Precio Pareja.
 */
export interface AlianzaBodaPrecioParejaInputs { presupuestoPareja:number; material:string; }
export interface AlianzaBodaPrecioParejaOutputs { precioPorAlianza:number; gramosOro:number; grabadoSugerido:string; costoGrabado:number; _insight?:any; }
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
  const precioRedondeado = Number(precioPorAlianza.toFixed(0));
  const gramos = Number(gramosOro.toFixed(1));
  const totalConGrabado = precioRedondeado * 2 + costoGrabado * 2;
  const matLabel: Record<string, string> = {
    plata925: 'plata 925', oro14k: 'oro 14k', oro18k: 'oro 18k', platino: 'platino',
  };
  const matTxt = matLabel[mat] ?? 'oro';
  const _insight = {
    title: 'Tu presupuesto por alianza',
    text: `Te alcanza para **$${precioRedondeado.toLocaleString('es-AR')} por alianza** en ${matTxt}, equivalente a unos **${gramos} g** de material. Sumando el grabado ($${costoGrabado} c/u), el par te queda en **$${totalConGrabado.toLocaleString('es-AR')}**.`,
    tone: 'neutral',
    icon: '💍',
  };
  return {
    precioPorAlianza: precioRedondeado,
    gramosOro: gramos,
    grabadoSugerido,
    costoGrabado,
    _insight,
  };
}
