export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cargaSemanalRunningRegla10(i: Inputs): Outputs {
  const km = Number(i.kmActuales) || 0;
  const prox = km * 1.1;
  const m4 = km * Math.pow(1.1, 4);
  return { kmProxima: prox.toFixed(1) + ' km', km4Semanas: m4.toFixed(0) + ' km', resumen: `Próx sem ${prox.toFixed(0)} km. En 4 semanas: ${m4.toFixed(0)} km.` };
}
