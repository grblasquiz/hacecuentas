export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }

// Time blocking: cantidad de bloques que entran en la jornada
// v1 = horas disponibles netas, v2 = duración de cada bloque (en horas)
// Bloques = horas disponibles / duración del bloque
export function timeBlockingCalendarHorasProductividad(i: Inputs): Outputs {
  const horas = Number(i.v1) || 0;
  const bloque = Number(i.v2) || 0;

  if (bloque <= 0 || horas <= 0) {
    return {
      resultado: '0.00',
      resumen: 'Ingresá horas disponibles netas (> 0) y una duración de bloque válida (> 0).',
    };
  }

  const totalBloques = horas / bloque;
  const completos = Math.floor(totalBloques);
  const fraccion = totalBloques - completos;
  const minutosSobrantes = Math.round(fraccion * bloque * 60);

  // Lectura honesta de la sobra
  let cierre = '';
  if (minutosSobrantes <= 5) {
    cierre = `Tu jornada se divide casi exacto en ${completos} bloques de ${bloque} h.`;
  } else if (fraccion >= 0.5) {
    cierre = `Tenés ${completos} bloques completos de ${bloque} h más ~${minutosSobrantes} min para una tarea corta o buffer.`;
  } else {
    cierre = `Tenés ${completos} bloques completos de ${bloque} h y ~${minutosSobrantes} min sueltos: usalos como transición o buffer.`;
  }

  const _insight = {
    title: 'Tu calendario en bloques',
    text: `Con **${horas} h** netas y bloques de **${bloque} h** entran **${totalBloques.toFixed(2)}** bloques: **${completos} completos** y ~${minutosSobrantes} min de sobra. ${cierre} Si una tarea no entra en estos bloques, no estaba en tu capacidad real del día.`,
    tone: (totalBloques < 2 ? 'warning' : 'positive') as const,
    icon: '🗓️',
  };

  return {
    resultado: totalBloques.toFixed(2),
    resumen: `${horas} h ÷ ${bloque} h = ${totalBloques.toFixed(2)} bloques → ${completos} completos + ~${minutosSobrantes} min.`,
    _insight,
  };
}
