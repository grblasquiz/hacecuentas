/** Calculadora de Ping y Latencia según Distancia */
export interface Inputs {
  distanciaKm: number;
  pingReal?: number;
}
export interface Outputs {
  pingTeorico: number;
  pingEstimado: number;
  overhead: number;
  diagnostico: string;
}

export function pingLatenciaDistancia(i: Inputs): Outputs {
  const km = Number(i.distanciaKm);
  const pingReal = i.pingReal ? Number(i.pingReal) : null;

  if (!km || km <= 0) throw new Error('Ingresá la distancia al servidor');

  // Speed of light in fiber: ~200,000 km/s (2/3 speed of light in vacuum)
  // Round trip = distance * 2
  const pingTeorico = (km * 2) / 200000 * 1000;

  // Real ping typically 1.5-3x theoretical due to routing, processing
  const factor = km < 1000 ? 2.5 : km < 5000 ? 2.0 : 1.8;
  const pingEstimado = pingTeorico * factor;
  const overhead = pingEstimado - pingTeorico;

  let diagnostico: string;
  if (pingReal !== null) {
    const ratio = pingReal / pingTeorico;
    if (ratio < 2) diagnostico = `Tu ping de ${pingReal} ms es excelente para ${km} km. El ruteo es muy eficiente.`;
    else if (ratio < 3) diagnostico = `Tu ping de ${pingReal} ms es normal para ${km} km. El overhead de ${(pingReal - pingTeorico).toFixed(0)} ms es esperable.`;
    else if (ratio < 5) diagnostico = `Tu ping de ${pingReal} ms es alto. Esperaríamos ~${pingEstimado.toFixed(0)} ms. Posible mal ruteo del ISP.`;
    else diagnostico = `Tu ping de ${pingReal} ms es excesivo. El mínimo teórico es ${pingTeorico.toFixed(0)} ms. Revisá tu conexión o probá otro ISP.`;
  } else {
    diagnostico = `Para ${km} km, el ping teórico mínimo es ${pingTeorico.toFixed(0)} ms. En la práctica esperá ~${pingEstimado.toFixed(0)} ms.`;
  }

  return {
    pingTeorico: Number(pingTeorico.toFixed(1)),
    pingEstimado: Number(pingEstimado.toFixed(0)),
    overhead: Number(overhead.toFixed(0)),
    diagnostico,
  };
}
