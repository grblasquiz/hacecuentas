/**
 * Calculadora de Traslado Aeropuerto-Ciudad
 */
export interface TrasladoAeropuertoCiudadTiempoInputs {
  distanciaKm: number;
  medio: string;
  horaPico: string;
}
export interface TrasladoAeropuertoCiudadTiempoOutputs {
  tiempoMinutos: number;
  horaSalidaSugerida: string;
  nota: string;
  _insight?: any;
}
export function trasladoAeropuertoCiudadTiempo(i: TrasladoAeropuertoCiudadTiempoInputs): TrasladoAeropuertoCiudadTiempoOutputs {
  const km = Number(i.distanciaKm);
  if (!km || km <= 0) throw new Error("Ingresá distancia válida");
  const medio = String(i.medio || "taxi");
  const pico = String(i.horaPico || "normal") === "pico";
  const velMap: Record<string, [number, number]> = {
    taxi: [50, 30], tren: [80, 80], bus: [40, 25], metro: [35, 30]
  };
  const [vNormal, vPico] = velMap[medio] || velMap.taxi;
  const vel = pico ? vPico : vNormal;
  const minutos = Math.round((km / vel) * 60);
  const medioTxt: Record<string, string> = { taxi: 'taxi', tren: 'tren', bus: 'bus', metro: 'metro' };
  const medioNombre = medioTxt[medio] || 'taxi';
  const tiempoTxt = minutos >= 60
    ? `${Math.floor(minutos / 60)} h ${minutos % 60} min`
    : `${minutos} min`;
  const insight = {
    title: `Traslado de ~${tiempoTxt}`,
    text: pico
      ? `${km} km en ${medioNombre} en **hora pico** tardan unos **${tiempoTxt}** (a ${vel} km/h con tráfico). Sumalo a las 2-3 hs de anticipo del vuelo más un buffer de 30 min y salí con margen extra.`
      : `${km} km en ${medioNombre} con tráfico normal tardan unos **${tiempoTxt}** (a ${vel} km/h). Sumalo a las 2-3 hs de anticipo del vuelo más un buffer de 30 min.`,
    tone: pico ? 'warn' : 'neutral',
    icon: pico ? '🚦' : '✈️',
  };
  return {
    tiempoMinutos: minutos,
    horaSalidaSugerida: `Sumar al anticipo del vuelo (2-3 hs) + buffer 30 min.`,
    nota: pico ? "Hora pico: sumá margen de seguridad." : "Tráfico normal: evitá pico si podés.",
    _insight: insight,
  };
}
