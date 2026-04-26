/** Tiempo objetivo realista para 42K según edad, género y experiencia. */
export interface Inputs { edad: number; genero: 'M' | 'F'; experiencia: 'primer' | 'segundo' | 'avanzado'; ritmoActual5kMinKm: number; }
export interface Outputs { tiempoObjetivoHoras: number; tiempoObjetivoTexto: string; ritmoObjetivoMinKm: number; explicacion: string; }
export function maratonTiempoObjetivoEdadExperiencia(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const r5k = Number(i.ritmoActual5kMinKm);
  if (!edad || edad < 16 || edad > 80) throw new Error('Edad debe estar entre 16 y 80 años');
  if (!r5k || r5k <= 0) throw new Error('Ingresá tu ritmo actual de 5K');
  // Riegel: T2 = T1 * (D2/D1)^1.06; ritmo maratón ≈ ritmo5k * (42.195/5)^0.06
  let factorRiegel = Math.pow(42.195 / 5, 0.06);
  // Ajuste por experiencia (corredores nuevos pierden más ritmo)
  if (i.experiencia === 'primer') factorRiegel *= 1.08;
  else if (i.experiencia === 'segundo') factorRiegel *= 1.03;
  // Ajuste por edad (después de 35 ~0,5% más lento por año)
  if (edad > 35) factorRiegel *= 1 + (edad - 35) * 0.005;
  // Ajuste por género (mujeres ~10% más lentas en élite, menos en aficionados)
  if (i.genero === 'F') factorRiegel *= 1.08;
  const ritmoObjetivo = r5k * factorRiegel;
  const tiempoMin = ritmoObjetivo * 42.195;
  const horas = tiempoMin / 60;
  const h = Math.floor(horas);
  const m = Math.floor(tiempoMin - h * 60);
  const s = Math.round((tiempoMin - h * 60 - m) * 60);
  return {
    tiempoObjetivoHoras: Number(horas.toFixed(2)),
    tiempoObjetivoTexto: `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`,
    ritmoObjetivoMinKm: Number(ritmoObjetivo.toFixed(2)),
    explicacion: `Con ritmo 5K de ${r5k.toFixed(2)} min/km y experiencia "${i.experiencia}", tu tiempo objetivo realista en 42K es ${h}h ${m}m (ritmo ${ritmoObjetivo.toFixed(2)} min/km). Estimación basada en fórmula de Riegel ajustada por edad y experiencia.`,
  };
}
