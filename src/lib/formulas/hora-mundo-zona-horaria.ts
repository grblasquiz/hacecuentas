/**
 * Conversor de Zona Horaria - Desde Buenos Aires (GMT-3)
 */
export interface HoraMundoInputs { horaLocal: number; minutosLocal: number; zonaDestino: string; }
export interface HoraMundoOutputs { horaDestino: string; diferencia: string; mismodia: string; _insight?: any; }

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

  const ZONA_LABELS: Record<string, string> = {
    'EST': 'Nueva York (EST)', 'CST': 'Chicago/México (CST)', 'PST': 'Los Ángeles (PST)',
    'CET': 'Madrid/París (CET)', 'GMT': 'Londres (GMT)', 'MSK': 'Moscú (MSK)',
    'IST': 'India (IST)', 'CST-CN': 'China (CST)', 'JST': 'Tokio (JST)',
    'AEST': 'Sídney (AEST)', 'NZST': 'Nueva Zelanda (NZST)', 'BRT': 'Brasil (BRT)',
    'CLT': 'Chile (CLT)', 'COT': 'Colombia (COT)',
  };
  const zonaLabel = ZONA_LABELS[zona] || zona;
  const origenStr = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  // ¿Hora razonable para coordinar del otro lado? (8:00–21:59 = ok)
  const horaRazonable = horaDest >= 8 && horaDest < 22;
  const diaTxt = diasCambio === 0 ? 'el mismo día' : diasCambio > 0 ? 'ya del día siguiente' : 'todavía del día anterior';
  let insight_text: string;
  let insight_tone: 'good' | 'warn' | 'neutral';
  if (diff === 0) {
    insight_tone = 'good';
    insight_text = `**${zonaLabel}** está en la misma hora que Buenos Aires: cuando son las **${origenStr}** acá, allá también. Coordinar es directo, sin matemática de husos.`;
  } else if (horaRazonable) {
    insight_tone = 'good';
    insight_text = `Las **${origenStr}** de Buenos Aires son las **${horaStr}** en ${zonaLabel} (${diaTxt}). Cae en horario activo, así que es un buen momento para una llamada o mensaje.`;
  } else {
    insight_tone = 'warn';
    insight_text = `Las **${origenStr}** de Buenos Aires son las **${horaStr}** en ${zonaLabel} (${diaTxt}). Ojo: del otro lado es madrugada o noche cerrada, mal momento para contactar. Buscá una franja entre sus 8 y 22 h.`;
  }
  const _insight = {
    title: `Qué hora es en ${zonaLabel}`,
    text: insight_text,
    tone: insight_tone,
    icon: '🌍',
  };

  return { horaDestino: horaStr, diferencia: diffLabel, mismodia, _insight };
}
