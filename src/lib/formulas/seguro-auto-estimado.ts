/** Estimación costo seguro auto */
export interface Inputs { categoriaAuto: string; cobertura: string; zona?: string; }
export interface Outputs { costoMensual: number; costoAnual: number; detalle: string; }

export function seguroAutoEstimado(i: Inputs): Outputs {
  const cat = i.categoriaAuto || 'mediano';
  const cob = i.cobertura || 'terceros-completo';
  const zona = i.zona || 'gba';

  const base: Record<string, Record<string, number>> = {
    'economico': { 'terceros': 25000, 'terceros-completo': 45000, 'todo-riesgo': 72000, 'todo-riesgo-0': 100000 },
    'mediano': { 'terceros': 38000, 'terceros-completo': 62000, 'todo-riesgo': 100000, 'todo-riesgo-0': 135000 },
    'suv': { 'terceros': 45000, 'terceros-completo': 75000, 'todo-riesgo': 115000, 'todo-riesgo-0': 155000 },
    'premium': { 'terceros': 50000, 'terceros-completo': 90000, 'todo-riesgo': 140000, 'todo-riesgo-0': 185000 },
    'pickup': { 'terceros': 45000, 'terceros-completo': 75000, 'todo-riesgo': 120000, 'todo-riesgo-0': 165000 },
  };

  const zonaMult: Record<string, number> = { 'caba': 1.20, 'gba': 1.0, 'interior': 0.80 };

  const costoBase = (base[cat] || base['mediano'])[cob] || 62000;
  const mult = zonaMult[zona] || 1.0;
  const costoMensual = costoBase * mult;
  const costoAnual = costoMensual * 12;

  return {
    costoMensual: Math.round(costoMensual),
    costoAnual: Math.round(costoAnual),
    detalle: `${cat} / ${cob} / ${zona}: $${Math.round(costoMensual).toLocaleString('es-AR')}/mes`,
  };
}
