export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, unknown>; }
export function patenteArgentinaAntiguedadVehiculo(i: Inputs): Outputs {
  const v=Number(i.valor)||0;
  const anual=v*0.045;
  const mensual=anual/12;

  const _insight = v > 0 ? {
    title: 'Lo que pagás de patente',
    text: `Sobre un valor fiscal de **$${v.toLocaleString('es-AR')}** la patente ronda **$${anual.toLocaleString('es-AR', {maximumFractionDigits:0})}/año** (~$${mensual.toLocaleString('es-AR', {maximumFractionDigits:0})}/mes). Es una estimación con alícuota promedio del 4,5%: la real varía por jurisdicción y antigüedad del vehículo.`,
    tone: 'warn',
    icon: '🚗',
  } : undefined;

  return {
    cuotaAnual:`$${anual.toFixed(0)}`,
    mensual:`$${mensual.toFixed(0)}`,
    resumen:`Valor fiscal $${v.toLocaleString()}: patente ~$${anual.toFixed(0)}/año.`,
    ...(_insight ? { _insight } : {}),
  };
}
