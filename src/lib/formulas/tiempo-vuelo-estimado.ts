/** Duración estimada de un vuelo según distancia y tipo de avión */
export interface Inputs {
  distanciaKm: number;
  tipoAvion: string; // 'comercial' | 'regional' | 'privado' | 'lowcost'
  vientoProa: number; // km/h
}

export interface Outputs {
  tiempoHoras: number;
  tiempoFormato: string;
  velocidadCrucero: number;
  tiempoTaxeo: number;
  resumen: string;
}

const VELOCIDADES: Record<string, number> = {
  comercial: 880,
  regional: 720,
  privado: 780,
  lowcost: 850,
  turbohelice: 550,
};

export function tiempoVueloEstimado(i: Inputs): Outputs {
  const km = Number(i.distanciaKm);
  const tipo = String(i.tipoAvion || 'comercial');
  const viento = Number(i.vientoProa) || 0;

  if (!km || km <= 0) throw new Error('Ingresá la distancia en km');

  const vel = VELOCIDADES[tipo] || 880;
  const velEfectiva = Math.max(200, vel - viento); // viento de proa resta velocidad
  const taxeo = 0.5; // 30 minutos de taxeo y maniobras
  const horasAire = km / velEfectiva;
  const horasTotales = horasAire + taxeo;

  const h = Math.floor(horasTotales);
  const m = Math.round((horasTotales - h) * 60);

  return {
    tiempoHoras: Number(horasTotales.toFixed(2)),
    tiempoFormato: `${h}h ${String(m).padStart(2, '0')}m`,
    velocidadCrucero: vel,
    tiempoTaxeo: Math.round(taxeo * 60),
    resumen: `Tu vuelo de **${km} km** en un avión ${tipo} duraría aproximadamente **${h}h ${m}m** incluyendo taxeo y maniobras (velocidad efectiva ${velEfectiva} km/h).`,
  };
}
