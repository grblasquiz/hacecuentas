/** Costo total de un viaje en auto vs avión vs bus */
export interface Inputs {
  distanciaKm: number;
  consumoLitros100km: number;
  precioLitroNafta: number;
  peajesTotal: number;
  precioVueloUsd: number;
  precioBusUsd: number;
  cotizacionUsd: number;
  pasajeros: number;
  idaVuelta: string;
}

export interface Outputs {
  litrosTotales: number;
  costoNaftaArs: number;
  costoTotalAutoArs: number;
  costoPorPersonaArs: number;
  costoVueloArs: number;
  costoBusArs: number;
  mejorOpcion: string;
  resumen: string;
}

export function kilometrosAutoViaje(i: Inputs): Outputs {
  const km = Number(i.distanciaKm);
  const cons = Number(i.consumoLitros100km);
  const precio = Number(i.precioLitroNafta);
  const peajes = Number(i.peajesTotal) || 0;
  const vueloUsd = Number(i.precioVueloUsd) || 0;
  const busUsd = Number(i.precioBusUsd) || 0;
  const cotiz = Number(i.cotizacionUsd) || 1000;
  const pax = Math.max(1, Number(i.pasajeros) || 1);
  const idaVuelta = i.idaVuelta === 'si';

  if (!km || km <= 0) throw new Error('Ingresá distancia en km');
  if (!cons || cons <= 0) throw new Error('Ingresá consumo en L/100km');
  if (!precio || precio <= 0) throw new Error('Ingresá precio del litro');

  const distEfectiva = idaVuelta ? km * 2 : km;
  const litros = (distEfectiva / 100) * cons;
  const costoNafta = litros * precio;
  const peajesTotal = idaVuelta ? peajes * 2 : peajes;
  const costoAuto = costoNafta + peajesTotal;
  const porPersona = costoAuto / pax;

  const costoVuelo = vueloUsd * cotiz * pax;
  const costoBus = busUsd * cotiz * pax;

  // Determinar mejor opción según costo por pasajero
  const opciones = [
    { nombre: 'Auto', costo: costoAuto },
    { nombre: 'Avión', costo: costoVuelo || Infinity },
    { nombre: 'Bus', costo: costoBus || Infinity },
  ].filter(o => o.costo < Infinity);
  opciones.sort((a, b) => a.costo - b.costo);
  const mejor = opciones[0].nombre;

  return {
    litrosTotales: Number(litros.toFixed(2)),
    costoNaftaArs: Math.round(costoNafta),
    costoTotalAutoArs: Math.round(costoAuto),
    costoPorPersonaArs: Math.round(porPersona),
    costoVueloArs: Math.round(costoVuelo),
    costoBusArs: Math.round(costoBus),
    mejorOpcion: mejor,
    resumen: `Tu viaje en auto de **${distEfectiva} km** consume ${litros.toFixed(1)} L y cuesta **AR$ ${Math.round(costoAuto).toLocaleString()}** total (${Math.round(porPersona).toLocaleString()} por persona). La mejor opción económica es: **${mejor}**.`,
  };
}
