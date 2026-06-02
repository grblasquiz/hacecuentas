const RHO: Record<string, number> = { cobre: 0.0172, aluminio: 0.0282 };
export interface CaidaTensionCableDistanciaInputs { corriente: number; distancia: number; seccion: number; voltaje: number; material: string; }
export interface CaidaTensionCableDistanciaOutputs { caidaV: string; porcentaje: string; voltajeFinal: string; resumen: string; _insight?: any; _chart?: any; }
export function caidaTensionCableDistancia(i: CaidaTensionCableDistanciaInputs): CaidaTensionCableDistanciaOutputs {
  const I = Number(i.corriente); const L = Number(i.distancia); const S = Number(i.seccion);
  const V = Number(i.voltaje); const rho = RHO[i.material] ?? 0.0172;
  if (!I || !L || !S || !V) throw new Error('Completá todos los campos');
  const dv = 2 * rho * L * I / S;
  const pct = (dv / V) * 100;
  const ok = pct < 3;
  const _insight = {
    title: 'Caída de tensión del tramo',
    text: ok
      ? `La caída es de **${dv.toFixed(2)} V** (**${pct.toFixed(2)}%**), por debajo del 3% recomendado. La sección de ${S} mm² alcanza para ${L} m a ${I} A.`
      : pct < 5
        ? `La caída llega a **${dv.toFixed(2)} V** (**${pct.toFixed(2)}%**), arriba del 3% ideal. Conviene subir la sección o acortar el tramo para no perder rendimiento.`
        : `La caída es de **${dv.toFixed(2)} V** (**${pct.toFixed(2)}%**), muy por encima del 5% límite. Aumentá la sección sí o sí: con esta el cable se calienta y el equipo trabaja con poca tensión.`,
    tone: ok ? 'good' : 'warn',
    icon: '⚡',
  };
  const pctR = Number(pct.toFixed(2));
  const _chart = {
    type: 'scale',
    marker: pctR,
    markerLabel: `${pctR}%`,
    min: 0,
    segments: [
      { nombre: 'Aceptable', max: 3, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Alto', max: 5, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Excesivo', max: Math.max(8, Math.ceil(pctR) + 1), color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Caída de tensión de ${pctR}% respecto al límite recomendado del 3%`,
  };
  return { caidaV: dv.toFixed(2) + ' V', porcentaje: pct.toFixed(2) + '%', voltajeFinal: (V - dv).toFixed(1) + ' V',
    resumen: `Caída ${dv.toFixed(2)} V (${pct.toFixed(2)}%). ${ok ? '✅ Aceptable (<3%)' : pct < 5 ? '⚠️ Alto — considerá aumentar sección' : '❌ Excesivo — aumentar sección obligatoriamente'}.`,
    _insight, _chart };
}
