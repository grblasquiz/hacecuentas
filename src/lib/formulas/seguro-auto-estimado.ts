/** Estimación costo seguro auto */
export interface Inputs { categoriaAuto: string; cobertura: string; zona?: string; }
export interface Outputs { costoMensual: number; costoAnual: number; detalle: string; _insight?: any; }

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

  const mensualFmt = Math.round(costoMensual).toLocaleString('es-AR');
  const anualFmt = Math.round(costoAnual).toLocaleString('es-AR');
  const zonaTxt = zona === 'caba' ? 'CABA (+20% por siniestralidad)' : zona === 'interior' ? 'interior (-20% más barato que GBA)' : 'GBA';
  const esTerceros = cob === 'terceros';
  const esTodoRiesgo = cob === 'todo-riesgo' || cob === 'todo-riesgo-0';
  const _insight = {
    title: esTerceros ? 'Cobertura básica: cuidado' : esTodoRiesgo ? 'Cobertura amplia' : 'Estimación de prima',
    text: esTerceros
      ? `Un auto **${cat}** con cobertura **terceros** en ${zonaTxt} ronda los **$${mensualFmt}/mes** ($${anualFmt}/año). Es lo más barato, pero **no cubre daños a tu propio vehículo** (choque, robo total parcial): solo responde frente a terceros.`
      : esTodoRiesgo
        ? `Un auto **${cat}** con **${cob.replace('-', ' ')}** en ${zonaTxt} ronda los **$${mensualFmt}/mes** ($${anualFmt}/año). Cubre daños propios además de terceros; es la opción más completa, ideal si el auto tiene valor de mercado alto.`
        : `Un auto **${cat}** con **terceros completo** en ${zonaTxt} ronda los **$${mensualFmt}/mes** ($${anualFmt}/año). Suma robo, incendio y cristales al RC básico: el punto de equilibrio entre precio y cobertura.`,
    tone: esTerceros ? 'warn' : esTodoRiesgo ? 'good' : 'neutral',
    icon: '🚗',
  };

  return {
    costoMensual: Math.round(costoMensual),
    costoAnual: Math.round(costoAnual),
    detalle: `${cat} / ${cob} / ${zona}: $${Math.round(costoMensual).toLocaleString('es-AR')}/mes`,
    _insight,
  };
}
