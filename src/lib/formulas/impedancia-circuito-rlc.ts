export interface ImpedanciaCircuitoRlcInputs { r: number; xL: number; xC: number; }
export interface ImpedanciaCircuitoRlcOutputs { z: string; fase: string; resumen: string; _insight?: any; }
export function impedanciaCircuitoRlc(i: ImpedanciaCircuitoRlcInputs): ImpedanciaCircuitoRlcOutputs {
  const r = Number(i.r); const xL = Number(i.xL); const xC = Number(i.xC);
  const z = Math.sqrt(r*r + Math.pow(xL - xC, 2));
  const fase = Math.atan2(xL - xC, r) * 180 / Math.PI;
  const tipo = fase > 5 ? 'Inductivo' : fase < -5 ? 'Capacitivo' : 'Cerca de resonancia';
  const reactanciaNeta = xL - xC;
  const insight = {
    title: `Circuito ${tipo.toLowerCase()}`,
    text: tipo === 'Cerca de resonancia'
      ? `La reactancia inductiva y la capacitiva casi se cancelan (X_L − X_C = **${reactanciaNeta.toFixed(2)} Ω**), así que la impedancia **${z.toFixed(2)} Ω** queda dominada por la resistencia y el desfase es de apenas **${fase.toFixed(1)}°**: el circuito opera cerca de resonancia.`
      : `Con R=**${r}**, X_L=**${xL}** y X_C=**${xC} Ω**, la reactancia neta es **${reactanciaNeta.toFixed(2)} Ω**: la impedancia total es **${z.toFixed(2)} Ω** y la corriente ${tipo === 'Inductivo' ? 'va atrasada' : 'va adelantada'} respecto a la tensión **${Math.abs(fase).toFixed(1)}°** (comportamiento ${tipo.toLowerCase()}).`,
    tone: 'neutral',
    icon: '⚡',
  };
  return { z: z.toFixed(2) + ' Ω', fase: fase.toFixed(1) + '°',
    resumen: `Z = ${z.toFixed(2)} Ω, ángulo ${fase.toFixed(1)}°. ${tipo}.`,
    _insight: insight };
}
