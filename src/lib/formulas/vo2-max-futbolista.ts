/** VO2max de un futbolista - test de Cooper 12 min + comparativa profesional/amateur */
export interface Inputs {
  distanciaMetros: number;
  nivel: string; // 'profesional' | 'semipro' | 'amateur'
  edad: number;
}

export interface Outputs {
  vo2max: number;
  categoria: string;
  diferenciaElite: number;
  nivelEsperado: string;
  detalle: string;
}

// VO2max esperado por nivel (mL/kg/min)
const RANGOS: Record<string, { min: number; max: number; nombre: string }> = {
  'profesional': { min: 60, max: 70, nombre: 'Profesional élite' },
  'semipro':     { min: 52, max: 60, nombre: 'Semiprofesional' },
  'amateur':     { min: 45, max: 55, nombre: 'Amateur' },
};

function getCategoria(vo2: number): string {
  if (vo2 >= 70) return 'Excepcional (mundial)';
  if (vo2 >= 60) return 'Élite profesional';
  if (vo2 >= 52) return 'Muy bueno';
  if (vo2 >= 45) return 'Bueno (amateur avanzado)';
  if (vo2 >= 38) return 'Promedio';
  return 'Bajo';
}

export function vo2MaxFutbolista(i: Inputs): Outputs {
  const dist = Number(i.distanciaMetros);
  const nivel = String(i.nivel || 'amateur');
  const edad = Number(i.edad);

  if (!dist || dist <= 0) throw new Error('Ingresá la distancia recorrida en 12 min (m)');
  if (!edad || edad <= 0) throw new Error('Ingresá la edad');

  // Fórmula Cooper: VO2max = (distancia_m - 504.9) / 44.73
  const vo2 = (dist - 504.9) / 44.73;
  const cat = getCategoria(vo2);
  const rango = RANGOS[nivel] || RANGOS['amateur'];
  const elite = 65; // punto medio élite
  const dif = vo2 - elite;
  const nivelEsperado = `${rango.nombre}: ${rango.min}-${rango.max} mL/kg/min`;

  return {
    vo2max: Number(vo2.toFixed(1)),
    categoria: cat,
    diferenciaElite: Number(dif.toFixed(1)),
    nivelEsperado,
    detalle: `Distancia ${dist} m en 12 min → **VO2max ${vo2.toFixed(1)} mL/kg/min** (${cat}). Esperado para ${rango.nombre}: ${rango.min}-${rango.max}. Diferencia vs élite (65): ${dif > 0 ? '+' : ''}${dif.toFixed(1)}.`,
  };
}
