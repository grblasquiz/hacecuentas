export interface FuenteDcWattsAmperajeInputs { v: number; cargas: number; factor?: number; }
export interface FuenteDcWattsAmperajeOutputs { potencia: string; corriente: string; corrienteMinima: string; resumen: string; }
export function fuenteDcWattsAmperaje(i: FuenteDcWattsAmperajeInputs): FuenteDcWattsAmperajeOutputs {
  const v = Number(i.v); const p = Number(i.cargas); const f = Number(i.factor ?? 1.3);
  if (!v || v <= 0 || !p || p <= 0) throw new Error('Ingresá V y cargas');
  const pRec = p * f; const iMin = p / v; const iRec = pRec / v;
  return {
    potencia: pRec.toFixed(1) + ' W',
    corriente: iRec.toFixed(2) + ' A',
    corrienteMinima: iMin.toFixed(2) + ' A',
    resumen: `Fuente ${v}V ${iRec.toFixed(1)}A (${pRec.toFixed(0)} W) con ${((f-1)*100).toFixed(0)}% de margen. Mínimo absoluto: ${iMin.toFixed(1)} A.`
  };
}
