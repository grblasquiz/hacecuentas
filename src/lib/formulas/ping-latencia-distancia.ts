/** Calculadora de Ping y Latencia según Distancia */
export interface Inputs {
  distanciaKm: number;
  pingReal?: number;
  __lang?: string;
}
export interface Outputs {
  pingTeorico: number;
  pingEstimado: number;
  overhead: number;
  diagnostico: string;
  _insight?: any;
}

export function pingLatenciaDistancia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const km = Number(i.distanciaKm);
  const pingReal = i.pingReal ? Number(i.pingReal) : null;

  if (!km || km <= 0) throw new Error(
    __lang === 'en' ? 'Enter the distance to the server' : 'Ingresá la distancia al servidor'
  );

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
    if (ratio < 2) diagnostico = __lang === 'en'
      ? `Your ping of ${pingReal} ms is excellent for ${km} km. The routing is very efficient.`
      : `Tu ping de ${pingReal} ms es excelente para ${km} km. El ruteo es muy eficiente.`;
    else if (ratio < 3) diagnostico = __lang === 'en'
      ? `Your ping of ${pingReal} ms is normal for ${km} km. The overhead of ${(pingReal - pingTeorico).toFixed(0)} ms is expected.`
      : `Tu ping de ${pingReal} ms es normal para ${km} km. El overhead de ${(pingReal - pingTeorico).toFixed(0)} ms es esperable.`;
    else if (ratio < 5) diagnostico = __lang === 'en'
      ? `Your ping of ${pingReal} ms is high. We would expect ~${pingEstimado.toFixed(0)} ms. Possible bad routing from your ISP.`
      : `Tu ping de ${pingReal} ms es alto. Esperaríamos ~${pingEstimado.toFixed(0)} ms. Posible mal ruteo del ISP.`;
    else diagnostico = __lang === 'en'
      ? `Your ping of ${pingReal} ms is excessive. The theoretical minimum is ${pingTeorico.toFixed(0)} ms. Check your connection or try another ISP.`
      : `Tu ping de ${pingReal} ms es excesivo. El mínimo teórico es ${pingTeorico.toFixed(0)} ms. Revisá tu conexión o probá otro ISP.`;
  } else {
    diagnostico = __lang === 'en'
      ? `For ${km} km, the theoretical minimum ping is ${pingTeorico.toFixed(0)} ms. In practice expect ~${pingEstimado.toFixed(0)} ms.`
      : `Para ${km} km, el ping teórico mínimo es ${pingTeorico.toFixed(0)} ms. En la práctica esperá ~${pingEstimado.toFixed(0)} ms.`;
  }

  const pTeo = Number(pingTeorico.toFixed(1));
  const pEst = Number(pingEstimado.toFixed(0));

  let insTone: 'good' | 'warn' | 'neutral';
  let insTitle: string;
  let insText: string;
  if (pingReal !== null) {
    const ratio = pingReal / pingTeorico;
    if (ratio < 2) {
      insTone = 'good';
      insTitle = __lang === 'en' ? 'Efficient routing' : 'Ruteo eficiente';
      insText = __lang === 'en'
        ? `A real ping of **${pingReal} ms** over ${km} km is close to the theoretical floor of **${pTeo} ms** — your ISP is routing well.`
        : `Un ping real de **${pingReal} ms** para ${km} km está cerca del piso teórico de **${pTeo} ms** — tu ISP rutea bien.`;
    } else if (ratio < 3) {
      insTone = 'neutral';
      insTitle = __lang === 'en' ? 'Normal overhead' : 'Overhead normal';
      insText = __lang === 'en'
        ? `Your **${pingReal} ms** carries **${(pingReal - pingTeorico).toFixed(0)} ms** of overhead over the **${pTeo} ms** minimum — that's expected for ${km} km.`
        : `Tus **${pingReal} ms** llevan **${(pingReal - pingTeorico).toFixed(0)} ms** de overhead sobre el mínimo de **${pTeo} ms** — es lo esperable para ${km} km.`;
    } else {
      insTone = 'warn';
      insTitle = __lang === 'en' ? 'Ping above expected' : 'Ping por encima de lo esperado';
      insText = __lang === 'en'
        ? `Your **${pingReal} ms** is well above the expected **~${pEst} ms** for ${km} km — likely bad ISP routing rather than distance.`
        : `Tus **${pingReal} ms** están muy por encima de los **~${pEst} ms** esperados para ${km} km — probable mal ruteo del ISP, no la distancia.`;
    }
  } else {
    insTone = 'neutral';
    insTitle = __lang === 'en' ? 'Distance floor' : 'Piso por distancia';
    insText = __lang === 'en'
      ? `Distance alone sets a floor of **${pTeo} ms**; with real-world routing expect around **${pEst} ms** to a server ${km} km away.`
      : `Solo la distancia fija un piso de **${pTeo} ms**; con el ruteo real esperá cerca de **${pEst} ms** a un servidor a ${km} km.`;
  }

  return {
    pingTeorico: pTeo,
    pingEstimado: pEst,
    overhead: Number(overhead.toFixed(0)),
    diagnostico,
    _insight: {
      title: insTitle,
      text: insText,
      tone: insTone,
      icon: '📡',
    },
  };
}
