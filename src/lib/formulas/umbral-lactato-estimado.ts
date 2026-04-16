/** Umbral de lactato estimado */
export interface Inputs {
  fcMaxima: number;
  nivel: string;
  paceActual5k: number;
}
export interface Outputs {
  fcUmbral: number;
  porcentajeFcMax: number;
  paceUmbral: string;
  zonaUmbral: string;
  mensaje: string;
}

export function umbralLactatoEstimado(i: Inputs): Outputs {
  const fcMaxima = Number(i.fcMaxima);
  const nivel = String(i.nivel || 'intermedio');
  const pace5k = Number(i.paceActual5k) || 0;
  if (!fcMaxima || fcMaxima <= 0) throw new Error('Ingresá tu FC máxima');

  // LT2 as % of HRmax by training level
  const pctMap: Record<string, number> = {
    principiante: 0.81, intermedio: 0.86, avanzado: 0.89, elite: 0.91
  };
  const pct = pctMap[nivel] || 0.86;
  const fcUmbral = Math.round(fcMaxima * pct);
  const porcentajeFcMax = Math.round(pct * 100);

  // Pace de umbral: ~105-108% del pace 5K (5K is slightly above LT2)
  let paceUmbral = 'Ingresá tu pace de 5K para estimar';
  if (pace5k > 0) {
    const paceUmbralVal = pace5k * 1.07;
    const min = Math.floor(paceUmbralVal);
    const sec = Math.round((paceUmbralVal - min) * 60);
    paceUmbral = `${min}:${String(sec).padStart(2, '0')} min/km (estimado)`;
  }

  const zonaUmbral = `${Math.round(fcMaxima * (pct - 0.03))}-${Math.round(fcMaxima * (pct + 0.03))} lpm`;

  return {
    fcUmbral,
    porcentajeFcMax,
    paceUmbral,
    zonaUmbral,
    mensaje: `Umbral estimado: ${fcUmbral} lpm (${porcentajeFcMax}% FCmax). Zona: ${zonaUmbral}.`
  };
}