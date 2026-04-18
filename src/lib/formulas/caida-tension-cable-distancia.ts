const RHO: Record<string, number> = { cobre: 0.0172, aluminio: 0.0282 };
export interface CaidaTensionCableDistanciaInputs { corriente: number; distancia: number; seccion: number; voltaje: number; material: string; }
export interface CaidaTensionCableDistanciaOutputs { caidaV: string; porcentaje: string; voltajeFinal: string; resumen: string; }
export function caidaTensionCableDistancia(i: CaidaTensionCableDistanciaInputs): CaidaTensionCableDistanciaOutputs {
  const I = Number(i.corriente); const L = Number(i.distancia); const S = Number(i.seccion);
  const V = Number(i.voltaje); const rho = RHO[i.material] ?? 0.0172;
  if (!I || !L || !S || !V) throw new Error('Completá todos los campos');
  const dv = 2 * rho * L * I / S;
  const pct = (dv / V) * 100;
  const ok = pct < 3;
  return { caidaV: dv.toFixed(2) + ' V', porcentaje: pct.toFixed(2) + '%', voltajeFinal: (V - dv).toFixed(1) + ' V',
    resumen: `Caída ${dv.toFixed(2)} V (${pct.toFixed(2)}%). ${ok ? '✅ Aceptable (<3%)' : pct < 5 ? '⚠️ Alto — considerá aumentar sección' : '❌ Excesivo — aumentar sección obligatoriamente'}.` };
}
