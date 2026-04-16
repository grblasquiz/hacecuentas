export interface Inputs { aparato: string; edadAnios: number; }
export interface Outputs { vidaUtilPromedio: string; porcentajeVida: number; decision: string; consejo: string; }
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
  return { vidaUtilPromedio: `${vida} años`, porcentajeVida: pct, decision, consejo };
}