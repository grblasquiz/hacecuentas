export interface Inputs {
  peso: number;
  unidad_peso: string;
  estilo: string;
  intensidad: string;
  modo_duracion: string;
  tiempo?: number;
  distancia?: number;
}

export interface Outputs {
  calorias_totales: number;
  calorias_por_100m: number;
  duracion_estimada: string;
  comparativa: string;
}

const MET_VALUES: Record<string, Record<string, number>> = {
  pecho: { baja: 5, moderada: 6, alta: 7 },
  espalda: { baja: 5, moderada: 6.5, alta: 8 },
  libre: { baja: 8, moderada: 9, alta: 10 },
  mariposa: { baja: 10, moderada: 11, alta: 12 }
};

const VELOCIDADES: Record<string, number> = {
  baja: 0.8,
  moderada: 1.2,
  alta: 1.6
};

export function compute(i: Inputs): Outputs {
  let pesoKg = Number(i.peso) || 70;
  if (i.unidad_peso === 'lb') {
    pesoKg = pesoKg / 2.20462;
  }
  if (pesoKg <= 0) pesoKg = 70;

  const estilo = i.estilo || 'libre';
  const intensidad = i.intensidad || 'moderada';
  const met = MET_VALUES[estilo]?.[intensidad] || 9;

  let tiempoMin = 0;
  let distanciaM = 0;

  if (i.modo_duracion === 'tiempo') {
    tiempoMin = Number(i.tiempo) || 30;
    const velocidadMs = VELOCIDADES[intensidad] || 1.2;
    distanciaM = velocidadMs * tiempoMin * 60;
  } else {
    distanciaM = Number(i.distancia) || 1000;
    const velocidadMs = VELOCIDADES[intensidad] || 1.2;
    tiempoMin = (distanciaM / velocidadMs) / 60;
  }

  const duracionHoras = tiempoMin / 60;
  const calorias = Math.round(pesoKg * met * duracionHoras);
  const calorisPor100m = distanciaM > 0 ? (calorias * 100) / distanciaM : 0;

  const minutos = Math.round(tiempoMin);
  const metros = Math.round(distanciaM);
  const duracionTexto = `${minutos} min (aprox. ${metros} m)`;

  const compEstilos = Object.entries(MET_VALUES).map(([est, mets]) => {
    const metVal = mets[intensidad] || mets['moderada'];
    const cal = Math.round(pesoKg * metVal * duracionHoras);
    return `${est.charAt(0).toUpperCase() + est.slice(1)}: ${cal} kcal`;
  }).join(' | ');

  return {
    calorias_totales: calorias,
    calorias_por_100m: parseFloat(calorisPor100m.toFixed(1)),
    duracion_estimada: duracionTexto,
    comparativa: compEstilos
  };
}
