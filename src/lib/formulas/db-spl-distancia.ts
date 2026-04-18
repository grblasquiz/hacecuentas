export interface DbSplDistanciaInputs { dbOrigen: number; distanciaOrigen: number; distanciaDestino: number; }
export interface DbSplDistanciaOutputs { dbDestino: string; atenuacion: string; resumen: string; }
export function dbSplDistancia(i: DbSplDistanciaInputs): DbSplDistanciaOutputs {
  const L1 = Number(i.dbOrigen); const d1 = Number(i.distanciaOrigen); const d2 = Number(i.distanciaDestino);
  if (!L1 || !d1 || !d2) throw new Error('Completá campos');
  const aten = 20 * Math.log10(d2 / d1);
  const L2 = L1 - aten;
  return { dbDestino: L2.toFixed(1) + ' dB SPL', atenuacion: aten.toFixed(1) + ' dB',
    resumen: `${L1} dB a ${d1}m → ${L2.toFixed(1)} dB a ${d2}m (atenuación ${aten.toFixed(1)} dB por distancia).` };
}
