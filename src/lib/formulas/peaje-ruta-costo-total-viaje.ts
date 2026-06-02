/** Calcula el costo total de peajes para un viaje en ruta */
export interface Inputs {
  cantidadPeajes: number;
  costoPromedioPeaje: number;
  idaYVuelta: number;
  ocupantes?: number;
}
export interface Outputs {
  costoTotalPeajes: number;
  costoPorPersona: number;
  detalle: string;
  _insight?: any;
}

export function peajeRutaCostoTotalViaje(i: Inputs): Outputs {
  const cantidad = Number(i.cantidadPeajes);
  const costo = Number(i.costoPromedioPeaje);
  const factor = Number(i.idaYVuelta) === 2 ? 2 : 1;
  const ocupantes = Number(i.ocupantes) || 1;

  if (!cantidad || cantidad < 1) throw new Error('Ingresá la cantidad de peajes (mínimo 1)');
  if (!costo || costo <= 0) throw new Error('Ingresá el costo promedio por peaje');
  if (ocupantes < 1 || ocupantes > 10) throw new Error('Los ocupantes deben ser entre 1 y 10');

  const costoTotalPeajes = cantidad * costo * factor;
  const costoPorPersona = costoTotalPeajes / ocupantes;

  const tramo = factor === 2 ? 'ida y vuelta' : 'solo ida';

  const totalR = Math.round(costoTotalPeajes);
  const porPersR = Math.round(costoPorPersona);
  const insightText = ocupantes > 1
    ? `El viaje suma **$${totalR.toLocaleString('es-AR')}** en peajes (${tramo}). Dividido entre ${ocupantes} ocupantes, cada uno pone **$${porPersR.toLocaleString('es-AR')}**.`
    : `El viaje suma **$${totalR.toLocaleString('es-AR')}** en peajes (${tramo}). Si viajás acompañado podés dividir el gasto y bajar el costo por persona.`;

  return {
    costoTotalPeajes: totalR,
    costoPorPersona: porPersR,
    detalle: `Total peajes (${tramo}): $${totalR.toLocaleString('es-AR')} (${cantidad} peajes × $${costo.toLocaleString('es-AR')}${factor === 2 ? ' × 2' : ''}). Por persona (${ocupantes}): $${porPersR.toLocaleString('es-AR')}.`,
    _insight: {
      title: 'Costo de peajes del viaje',
      text: insightText,
      tone: 'neutral',
      icon: '🛣️',
    },
  };
}
