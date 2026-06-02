export interface DbSplDistanciaInputs { dbOrigen: number; distanciaOrigen: number; distanciaDestino: number; }
export interface DbSplDistanciaOutputs { dbDestino: string; atenuacion: string; resumen: string; _insight?: any; }
export function dbSplDistancia(i: DbSplDistanciaInputs): DbSplDistanciaOutputs {
  const L1 = Number(i.dbOrigen); const d1 = Number(i.distanciaOrigen); const d2 = Number(i.distanciaDestino);
  if (!L1 || !d1 || !d2) throw new Error('Completá campos');
  const aten = 20 * Math.log10(d2 / d1);
  const L2 = L1 - aten;
  const aleja = d2 > d1;
  const tone = Math.abs(aten) >= 6 ? 'warn' : 'neutral';
  const texto = aleja
    ? `Al pasar de ${d1} m a ${d2} m el nivel cae **${aten.toFixed(1)} dB** hasta **${L2.toFixed(1)} dB SPL**. Recordá la ley de cuadrado inverso: cada vez que duplicás la distancia perdés ~6 dB, que el oído percibe como "la mitad de fuerte".`
    : `Al acercarte de ${d1} m a ${d2} m el nivel sube **${(-aten).toFixed(1)} dB** hasta **${L2.toFixed(1)} dB SPL**: cada vez que reducís la distancia a la mitad ganás ~6 dB de presión sonora.`;
  return { dbDestino: L2.toFixed(1) + ' dB SPL', atenuacion: aten.toFixed(1) + ' dB',
    resumen: `${L1} dB a ${d1}m → ${L2.toFixed(1)} dB a ${d2}m (atenuación ${aten.toFixed(1)} dB por distancia).`,
    _insight: {
      title: aleja ? 'Cuánto se atenúa' : 'Cuánto sube el nivel',
      text: texto,
      tone,
      icon: '🔊',
    } };
}
