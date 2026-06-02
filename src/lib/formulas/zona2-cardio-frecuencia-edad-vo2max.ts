/** Rango FC zona 2 según edad y método (Karvonen vs simple) */
export interface Inputs { edad: number; fcReposo: number; metodo: 'karvonen' | 'simple'; }
export interface Outputs { fcMax: number; zona2Min: number; zona2Max: number; explicacion: string; _insight?: any; }
export function zona2CardioFrecuenciaEdadVo2max(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const fcRep = Number(i.fcReposo);
  if (!edad || edad < 10 || edad > 100) throw new Error('Ingresá una edad entre 10 y 100 años');
  const fcMax = 220 - edad;
  let zMin: number, zMax: number;
  if (i.metodo === 'karvonen') {
    if (!fcRep || fcRep < 30 || fcRep > 120) throw new Error('Ingresá FC de reposo entre 30 y 120 bpm');
    const reserva = fcMax - fcRep;
    zMin = fcRep + reserva * 0.60;
    zMax = fcRep + reserva * 0.70;
  } else {
    zMin = fcMax * 0.60;
    zMax = fcMax * 0.70;
  }
  return {
    fcMax: Math.round(fcMax),
    zona2Min: Math.round(zMin),
    zona2Max: Math.round(zMax),
    explicacion: `Zona 2 (60-70% intensidad) con método ${i.metodo === 'karvonen' ? 'Karvonen (reserva FC)' : 'simple (% FC máx)'}: ${Math.round(zMin)}-${Math.round(zMax)} bpm. FC máxima estimada: ${Math.round(fcMax)} bpm.`,
    _insight: {
      title: 'Tu ritmo de base aeróbica',
      text: `Tu Zona 2 va de **${Math.round(zMin)} a ${Math.round(zMax)} bpm** (FC máx estimada **${Math.round(fcMax)} bpm**). Es el ritmo conversacional donde quemás grasa y construís resistencia: deberías poder hablar sin quedarte sin aire. ${i.metodo === 'karvonen' ? 'El método Karvonen usa tu FC de reposo, así que es más personalizado que el simple.' : 'Para mayor precisión, usá el método Karvonen con tu FC de reposo.'}`,
      tone: 'neutral' as const,
      icon: '🏃',
    },
  };
}
