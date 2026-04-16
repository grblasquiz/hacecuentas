/** Pausas activas en el trabajo */
export interface Inputs { horasJornada: number; tipoTrabajo: string; }
export interface Outputs { pausasTotales: number; frecuencia: string; duracion: string; regla202020: string; mensaje: string; }

export function pausasActivasTrabajo(i: Inputs): Outputs {
  const horas = Number(i.horasJornada) || 8;
  const tipo = String(i.tipoTrabajo || 'computadora');

  let intervaloMin: number;
  let duracionMin: number;
  if (tipo === 'computadora') { intervaloMin = 50; duracionMin = 5; }
  else if (tipo === 'mixto') { intervaloMin = 60; duracionMin = 5; }
  else { intervaloMin = 90; duracionMin = 10; }

  const pausasTotales = Math.floor((horas * 60) / intervaloMin);
  const frecuencia = `Cada ${intervaloMin} minutos`;
  const duracion = `${duracionMin} minutos por pausa`;
  const regla202020 = tipo === 'computadora' || tipo === 'mixto'
    ? 'Cada 20 min mirá algo a 6 metros durante 20 segundos (protege tus ojos)'
    : 'No aplica para trabajo físico';

  return {
    pausasTotales,
    frecuencia,
    duracion,
    regla202020,
    mensaje: `${pausasTotales} pausas de ${duracionMin} min cada ${intervaloMin} min en tu jornada de ${horas}h. Total tiempo de pausas: ${pausasTotales * duracionMin} min.`
  };
}