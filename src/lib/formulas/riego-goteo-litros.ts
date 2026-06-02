/** Riego por goteo: litros/hora por planta */
export interface Inputs {
  tipoPlanta: string;
  cantidadPlantas: number;
  estacion?: string;
  clima?: string;
}
export interface Outputs {
  litrosHora: number;
  minutosRiegoDia: number;
  litrosDiaTotalEstimado: number;
  litrosMesEstimado: number;
  _insight?: any;
}

const BASE_LITROS_HORA: Record<string, number> = {
  hortaliza: 2,
  frutal: 6,
  ornamental: 2,
  aromatica: 1,
  cesped: 4,
};

const LITROS_DIA_PLANTA: Record<string, number> = {
  hortaliza: 1.5,
  frutal: 8,
  ornamental: 1.5,
  aromatica: 0.5,
  cesped: 5,
};

const FACTOR_ESTACION: Record<string, number> = {
  verano: 1.5,
  primavera: 1.0,
  invierno: 0.5,
};

const FACTOR_CLIMA: Record<string, number> = {
  seco: 1.3,
  templado: 1.0,
  humedo: 0.7,
};

export function riegoGoteoLitros(i: Inputs): Outputs {
  const cant = Number(i.cantidadPlantas);
  if (!cant || cant <= 0) throw new Error('Ingresá la cantidad de plantas');
  const tipo = String(i.tipoPlanta || 'hortaliza');
  const est = String(i.estacion || 'verano');
  const clima = String(i.clima || 'templado');

  const baseLH = BASE_LITROS_HORA[tipo] || 2;
  const litrosDiaPlanta = (LITROS_DIA_PLANTA[tipo] || 1.5) * (FACTOR_ESTACION[est] || 1) * (FACTOR_CLIMA[clima] || 1);
  const minutosRiego = Math.round((litrosDiaPlanta / baseLH) * 60);
  const litrosDiaTotal = litrosDiaPlanta * cant;
  const litrosMes = litrosDiaTotal * 30;

  const litrosMesFmt = litrosMes.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  const _insight = {
    title: 'Tu consumo de riego por goteo',
    text: `Para tus **${cant} ${cant === 1 ? 'planta' : 'plantas'}** necesitás unos **${minutosRiego} min de goteo por día**, ` +
      `lo que suma **${litrosDiaTotal.toFixed(1)} L diarios** (~${litrosMesFmt} L al mes). ` +
      (est === 'verano'
        ? 'Es el pico de la temporada: revisá los goteros tapados, son la causa nº 1 de plantas que se secan con el sistema "andando".'
        : est === 'invierno'
        ? 'En invierno el consumo es bajo; un riego muy frecuente puede pudrir raíces, espaciá los ciclos.'
        : 'Controlá la humedad del sustrato un par de veces por semana y ajustá el tiempo si ves encharcamiento o estrés.'),
    tone: 'neutral' as const,
    icon: '🌱',
  };

  return {
    litrosHora: Number(baseLH.toFixed(1)),
    minutosRiegoDia: minutosRiego,
    litrosDiaTotalEstimado: Number(litrosDiaTotal.toFixed(1)),
    litrosMesEstimado: Number(litrosMes.toFixed(0)),
    _insight,
  };
}
