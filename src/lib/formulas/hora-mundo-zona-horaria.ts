/**
 * Conversor de Zona Horaria - Desde Buenos Aires (GMT-3)
 */
export interface HoraMundoInputs { horaLocal: number; minutosLocal: number; zonaDestino: string; }
export interface HoraMundoOutputs { horaDestino: string; diferencia: string; mismodia: string; }

const OFFSETS: Record<string, number> = {
  'EST': -5, 'CST': -6, 'PST': -8, 'CET': 1, 'GMT': 0,
  'MSK': 3, 'IST': 5.5, 'CST-CN': 8, 'JST': 9, 'AEST': 10,
  'NZST': 12, 'BRT': -3, 'CLT': -4, 'COT': -5,
};

export function horaMundoZonaHoraria(inputs: HoraMundoInputs): HoraMundoOutputs {
  const hora = Number(inputs.horaLocal);
  const minutos = Number(inputs.minutosLocal) || 0;
  const zona = inputs.zonaDestino || 'EST';

  if (hora < 0 || hora > 23) throw new Error('Ingresá una hora válida (0-23)');

  const ARG_OFFSET = -3;
  const destOffset = OFFSETS[zona] ?? 0;
  const diff = destOffset - ARG_OFFSET;

  // Calcular hora destino
  const totalMinutosArg = hora * 60 + minutos;
  const diffMinutos = diff * 60;
  let totalMinutosDest = totalMinutosArg + diffMinutos;

  let diasCambio = 0;
  while (totalMinutosDest < 0) { totalMinutosDest += 1440; diasCambio--; }
  while (totalMinutosDest >= 1440) { totalMinutosDest -= 1440; diasCambio++; }

  const horaDest = Math.floor(totalMinutosDest / 60);
  const minDest = totalMinutosDest % 60;
  const horaStr = `${horaDest.toString().padStart(2, '0')}:${minDest.toString().padStart(2, '0')}`;

  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
  const diffLabel = diff === 0 ? 'Misma hora' : diff > 0 ? `${diffStr} horas (adelantado)` : `${diffStr} horas (atrasado)`;

  let mismodia: string;
  if (diasCambio === 0) mismodia = 'Sí, mismo día';
  else if (diasCambio > 0) mismodia = 'No, es el día siguiente';
  else mismodia = 'No, es el día anterior';

  return { horaDestino: horaStr, diferencia: diffLabel, mismodia };
}
