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
  return {
    tiempoMinutos: minutos,
    horaSalidaSugerida: `Sumar al anticipo del vuelo (2-3 hs) + buffer 30 min.`,
    nota: pico ? "Hora pico: sumá margen de seguridad." : "Tráfico normal: evitá pico si podés."
  };
}
