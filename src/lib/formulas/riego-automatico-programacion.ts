/** Riego automático: programación por zona */
export interface Inputs { zona: string; estacion?: string; tipoSuelo?: string; }
export interface Outputs { minutosRiego: number; frecuenciaSemanal: string; mejorHorario: string; consejo: string; }

interface RiegoData { minutos: number; vecesXsemana: number; }
const BASE: Record<string, RiegoData> = {
  cesped: { minutos: 25, vecesXsemana: 3 },
  cantero_goteo: { minutos: 40, vecesXsemana: 3 },
  macetas_goteo: { minutos: 20, vecesXsemana: 4 },
  huerta: { minutos: 35, vecesXsemana: 4 },
  arboles: { minutos: 60, vecesXsemana: 2 },
};
const FACTOR_EST: Record<string, number> = { verano: 1.0, primavera: 0.7, invierno: 0.3 };
const FACTOR_SUELO: Record<string, number> = { arenoso: 1.2, franco: 1.0, arcilloso: 0.8 };

export function riegoAutomaticoProgramacion(i: Inputs): Outputs {
  const zona = String(i.zona || 'cesped');
  const est = String(i.estacion || 'verano');
  const suelo = String(i.tipoSuelo || 'franco');
  const base = BASE[zona];
  if (!base) throw new Error('Zona no encontrada');

  const fEst = FACTOR_EST[est] || 1;
  const fSuelo = FACTOR_SUELO[suelo] || 1;
  const minutos = Math.round(base.minutos * fEst * fSuelo);
  const veces = Math.max(1, Math.round(base.vecesXsemana * fEst));

  return {
    minutosRiego: minutos,
    frecuenciaSemanal: `${veces} ${veces === 1 ? 'vez' : 'veces'} por semana`,
    mejorHorario: 'Temprano a la mañana (6:00–9:00)',
    consejo: suelo === 'arcilloso'
      ? 'Dividí en 2 ciclos con pausa de 30 min para mejor absorción.'
      : suelo === 'arenoso'
      ? 'El agua drena rápido: regá más seguido con menos tiempo.'
      : 'Suelo franco ideal. Controlá la humedad con un destornillador a 15 cm.',
  };
}
