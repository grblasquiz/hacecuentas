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
  _insight?: any;
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

  const ventajaClara = diferenciaPorcentual >= 25;
  const _insight = {
    title: ventajaClara ? 'La elección es clara' : 'Opciones parejas: decidí con cuidado',
    text: ventajaClara
      ? `**${mejor}** rinde **${diferenciaPorcentual.toFixed(0)}% más** que la alternativa: ganás **$${Math.round(gananciaMejor).toLocaleString('es-AR')}** y resignás **$${Math.round(costoOportunidad).toLocaleString('es-AR')}**. La diferencia justifica la decisión.`
      : `Las opciones están parejas: **${mejor}** apenas supera a la otra por **${diferenciaPorcentual.toFixed(0)}%**. Tu costo de oportunidad de **$${Math.round(costoOportunidad).toLocaleString('es-AR')}** es casi tan grande como lo que ganás — pesá factores no monetarios (riesgo, tiempo, esfuerzo) antes de decidir.`,
    tone: ventajaClara ? 'good' : 'warn',
    icon: '⚖️',
  };

  return {
    mejorOpcion: mejor,
    costoOportunidad: Math.round(costoOportunidad),
    gananciaMejor: Math.round(gananciaMejor),
    gananciaRechazada: Math.round(gananciaRechazada),
    diferenciaPorcentual: Number(diferenciaPorcentual.toFixed(2)),
    resumen,
    _insight,
  };
}
