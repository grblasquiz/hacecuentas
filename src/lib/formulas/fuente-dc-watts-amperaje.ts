export interface FuenteDcWattsAmperajeInputs { v: number; cargas: number; factor?: number; __lang?: string; }
export interface FuenteDcWattsAmperajeOutputs { potencia: string; corriente: string; corrienteMinima: string; resumen: string; }
export function fuenteDcWattsAmperaje(i: FuenteDcWattsAmperajeInputs): FuenteDcWattsAmperajeOutputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v = Number(i.v); const p = Number(i.cargas); const f = Number(i.factor ?? 1.3);
  if (!v || v <= 0 || !p || p <= 0) throw new Error(__lang === 'en' ? 'Enter V and loads' : 'Ingresá V y cargas');
  const pRec = p * f; const iMin = p / v; const iRec = pRec / v;
  return {
    potencia: pRec.toFixed(1) + ' W',
    corriente: iRec.toFixed(2) + ' A',
    corrienteMinima: iMin.toFixed(2) + ' A',
    resumen: __lang === 'en'
      ? `Power supply ${v}V ${iRec.toFixed(1)}A (${pRec.toFixed(0)} W) with ${((f-1)*100).toFixed(0)}% margin. Absolute minimum: ${iMin.toFixed(1)} A.`
      : `Fuente ${v}V ${iRec.toFixed(1)}A (${pRec.toFixed(0)} W) con ${((f-1)*100).toFixed(0)}% de margen. Mínimo absoluto: ${iMin.toFixed(1)} A.`
  };
}
