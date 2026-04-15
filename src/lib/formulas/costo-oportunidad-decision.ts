/** Costo de oportunidad: comparar ganancia de 2 opciones y lo que dejás de ganar */
export interface Inputs {
  gananciaOpcionA: number;
  gananciaOpcionB: number;
  nombreA?: string;
  nombreB?: string;
}
export interface Outputs {
  mejorOpcion: string;
  costoOportunidad: number;
  gananciaMejor: number;
  gananciaRechazada: number;
  diferenciaPorcentual: number;
  resumen: string;
}

export function costoOportunidadDecision(i: Inputs): Outputs {
  const a = Number(i.gananciaOpcionA);
  const b = Number(i.gananciaOpcionB);
  const nombreA = (i.nombreA || 'Opción A').trim();
  const nombreB = (i.nombreB || 'Opción B').trim();

  if (isNaN(a)) throw new Error('Ingresá la ganancia esperada de la Opción A');
  if (isNaN(b)) throw new Error('Ingresá la ganancia esperada de la Opción B');

  const mejor = a >= b ? nombreA : nombreB;
  const gananciaMejor = Math.max(a, b);
  const gananciaRechazada = Math.min(a, b);
  const costoOportunidad = gananciaRechazada;
  const diferencia = gananciaMejor - gananciaRechazada;
  const diferenciaPorcentual = gananciaRechazada !== 0 ? (diferencia / Math.abs(gananciaRechazada)) * 100 : 0;

  const resumen = `Elegir ${mejor} (gana ${gananciaMejor.toLocaleString()}) implica un costo de oportunidad de ${costoOportunidad.toLocaleString()} — eso es lo que dejás de ganar con la otra.`;

  return {
    mejorOpcion: mejor,
    costoOportunidad: Math.round(costoOportunidad),
    gananciaMejor: Math.round(gananciaMejor),
    gananciaRechazada: Math.round(gananciaRechazada),
    diferenciaPorcentual: Number(diferenciaPorcentual.toFixed(2)),
    resumen,
  };
}
