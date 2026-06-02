export interface Inputs { aparato: string; edadAnios: number; }
export interface Outputs { vidaUtilPromedio: string; porcentajeVida: number; decision: string; consejo: string; _insight?: any; _chart?: any; }
const VIDA: Record<string, number> = {
  heladera: 13, lavarropas: 10, microondas: 8, aire: 12, tv: 7, horno: 15, lavavajillas: 10, secarropas: 10, termotanque: 10,
};
export function vidaUtilElectrodomestico(i: Inputs): Outputs {
  const ap = String(i.aparato || 'heladera'); const edad = Number(i.edadAnios);
  if (edad < 0) throw new Error('La edad no puede ser negativa');
  const vida = VIDA[ap] || 10; const pct = Math.min(100, Math.round((edad / vida) * 100));
  let decision = ''; let consejo = '';
  if (pct < 50) { decision = 'Reparar conviene'; consejo = 'El aparato está en su primera mitad de vida. Una reparación razonable (menos del 30% del valor de uno nuevo) es buena inversión.'; }
  else if (pct < 80) { decision = 'Evaluar costo de reparación'; consejo = 'Si la reparación cuesta más del 40% de uno nuevo, considerá reemplazar por uno de mejor eficiencia energética.'; }
  else { decision = 'Conviene reemplazar'; consejo = 'El aparato está en la recta final. Un equipo nuevo será más eficiente y confiable. Buscá clase A de eficiencia.'; }
  const aniosRestantes = Math.max(0, Math.round((vida - edad) * 10) / 10);
  const tone = pct < 50 ? 'good' : pct < 80 ? 'neutral' : 'warn';
  const _insight = {
    title: decision,
    text: pct < 80
      ? `Con **${edad} años** de uso, tu ${ap} consumió el **${pct}%** de una vida útil típica de **${vida} años**; le quedan ~${aniosRestantes} años. ${pct < 50 ? 'Reparar suele convenir.' : 'Conviene comparar el costo de reparar contra uno nuevo.'}`
      : `Con **${edad} años** de uso, tu ${ap} ya consumió el **${pct}%** de su vida útil típica de **${vida} años**. Está en la recta final: un equipo nuevo clase A será más eficiente y confiable.`,
    tone,
    icon: pct < 50 ? '🔧' : pct < 80 ? '⚖️' : '🛒',
  };
  const _chart = {
    type: 'scale' as const,
    marker: pct,
    markerLabel: `${pct}% usado`,
    min: 0,
    segments: [
      { nombre: 'Reparar conviene', max: 50, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Evaluar reparación', max: 80, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Conviene reemplazar', max: 101, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Vida útil consumida del electrodoméstico: ${pct}% sobre una vida típica de ${vida} años`,
  };
  return { vidaUtilPromedio: `${vida} años`, porcentajeVida: pct, decision, consejo, _insight, _chart };
}