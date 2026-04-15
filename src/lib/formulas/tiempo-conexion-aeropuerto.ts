/** Tiempo mínimo de conexión recomendado en aeropuertos */
export interface Inputs {
  tipoOrigen: string; // 'domestico' | 'internacional'
  tipoDestino: string; // 'domestico' | 'internacional'
  mismaTerminal: string; // 'si' | 'no'
  cambioAerolinea: string; // 'si' | 'no'
  aeropuertoGrande: string; // 'si' | 'no' - aeropuertos tipo JFK, LHR, CDG
}

export interface Outputs {
  minutosRecomendados: number;
  minutosMinimo: number;
  tiempoFormato: string;
  riesgo: string;
  resumen: string;
}

export function tiempoConexionAeropuerto(i: Inputs): Outputs {
  const origen = String(i.tipoOrigen || 'domestico');
  const destino = String(i.tipoDestino || 'domestico');
  const mismaTerm = i.mismaTerminal === 'si';
  const cambioAerol = i.cambioAerolinea === 'si';
  const grande = i.aeropuertoGrande === 'si';

  // Tiempos base según combinación (IATA Minimum Connecting Times)
  let base = 45; // domestico-domestico
  if (origen === 'internacional' && destino === 'domestico') base = 90;
  else if (origen === 'domestico' && destino === 'internacional') base = 60;
  else if (origen === 'internacional' && destino === 'internacional') base = 75;

  let minutos = base;
  if (!mismaTerm) minutos += 30;
  if (cambioAerol) minutos += 15;
  if (grande) minutos += 30;

  const minimo = Math.max(30, minutos - 30);

  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const formato = h > 0 ? `${h}h ${m}m` : `${m} minutos`;

  let riesgo = 'Bajo — tenés margen cómodo';
  if (minutos < 60) riesgo = 'Alto — muy ajustado, riesgo de perder conexión';
  else if (minutos < 90) riesgo = 'Moderado — ajustado pero factible';

  return {
    minutosRecomendados: minutos,
    minutosMinimo: minimo,
    tiempoFormato: formato,
    riesgo,
    resumen: `Para tu conexión ${origen} → ${destino} el tiempo recomendado es de **${formato}** (mínimo legal ${minimo} min). Riesgo: ${riesgo.toLowerCase()}.`,
  };
}
