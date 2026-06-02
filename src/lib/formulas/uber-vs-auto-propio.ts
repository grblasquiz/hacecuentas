/** Uber/taxi vs auto propio */
export interface Inputs { viajesMes: number; costoPromedioViaje: number; costoMensualAuto: number; }
export interface Outputs { costoUberMes: number; costoAutoMes: number; diferencia: number; recomendacion: string; _insight?: any; }

export function uberVsAutoPropio(i: Inputs): Outputs {
  const viajes = Number(i.viajesMes);
  const costoViaje = Number(i.costoPromedioViaje);
  const costoAuto = Number(i.costoMensualAuto);
  if (viajes < 0) throw new Error('Los viajes no pueden ser negativos');
  if (!costoViaje || costoViaje <= 0) throw new Error('Ingresá el costo promedio del viaje');
  if (!costoAuto || costoAuto <= 0) throw new Error('Ingresá el costo mensual del auto');

  const costoUberMes = viajes * costoViaje;
  const diferencia = Math.abs(costoAuto - costoUberMes);
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const uberConviene = costoUberMes < costoAuto;
  const ahorroAnual = diferencia * 12;
  const insight = {
    title: uberConviene ? 'Te conviene moverte en apps' : 'Te conviene el auto propio',
    text: uberConviene
      ? `Con **${viajes} viajes/mes** gastás **$${fmt.format(costoUberMes)}** en Uber/taxi contra **$${fmt.format(costoAuto)}** del auto: ahorrás **$${fmt.format(diferencia)}/mes** (**$${fmt.format(ahorroAnual)}/año**) sin patente, seguro ni service.`
      : `Con **${viajes} viajes/mes** el auto propio cuesta **$${fmt.format(costoAuto)}** contra **$${fmt.format(costoUberMes)}** en apps: te ahorra **$${fmt.format(diferencia)}/mes** (**$${fmt.format(ahorroAnual)}/año**). Cuantos más viajes hagas, más conviene el auto.`,
    tone: (uberConviene ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: uberConviene ? '🚕' : '🚗',
  };

  return {
    costoUberMes: Math.round(costoUberMes),
    costoAutoMes: Math.round(costoAuto),
    diferencia: Math.round(diferencia),
    recomendacion: uberConviene
      ? `Uber/taxi te ahorra $${fmt.format(diferencia)}/mes. Conviene moverse con apps.`
      : `El auto propio te ahorra $${fmt.format(diferencia)}/mes. Conviene tener auto.`,
    _insight: insight,
  };
}
