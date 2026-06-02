/** Evaluación de ping/latencia para gaming según tipo de juego */
export interface Inputs { pingMs: number; tipoJuego?: string; }
export interface Outputs { clasificacion: string; pingIdeal: number; pingMaximo: number; detalle: string; _insight?: any; _chart?: any; }

const rangos: Record<string, { excelente: number; bueno: number; aceptable: number; nombre: string }> = {
  fps: { excelente: 15, bueno: 30, aceptable: 50, nombre: 'FPS competitivo' },
  moba: { excelente: 30, bueno: 50, aceptable: 80, nombre: 'MOBA' },
  battle_royale: { excelente: 30, bueno: 50, aceptable: 70, nombre: 'Battle Royale' },
  mmorpg: { excelente: 50, bueno: 80, aceptable: 150, nombre: 'MMORPG' },
  casual: { excelente: 100, bueno: 150, aceptable: 250, nombre: 'Casual / Estrategia' },
};

export function pingLatenciaGamingAceptable(i: Inputs): Outputs {
  const ping = Number(i.pingMs);
  const tipo = String(i.tipoJuego || 'fps');

  if (isNaN(ping) || ping < 0) throw new Error('Ingresá un valor de ping válido en ms');

  const rango = rangos[tipo] || rangos.fps;

  let clasificacion: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (ping <= rango.excelente) { clasificacion = 'Excelente'; tone = 'good'; }
  else if (ping <= rango.bueno) { clasificacion = 'Bueno'; tone = 'good'; }
  else if (ping <= rango.aceptable) { clasificacion = 'Aceptable'; tone = 'neutral'; }
  else { clasificacion = 'Malo — vas a tener lag'; tone = 'warn'; }

  const insText = tone === 'warn'
    ? `Con **${ping} ms** vas a notar lag en ${rango.nombre}: el máximo tolerable es **${rango.aceptable} ms** y lo ideal sería bajar de **${rango.bueno} ms**.`
    : tone === 'neutral'
      ? `Tus **${ping} ms** son jugables en ${rango.nombre}, pero estás por encima del ideal de **${rango.bueno} ms** — en jugadas reñidas se va a sentir.`
      : `**${ping} ms** es un ping de sobra para ${rango.nombre}: estás dentro del rango ideal (<${rango.bueno} ms) y la respuesta va a sentirse instantánea.`;

  const segMax = Math.max(rango.aceptable + Math.ceil(rango.aceptable * 0.3), Math.ceil(ping) + 1);

  return {
    clasificacion,
    pingIdeal: rango.bueno,
    pingMaximo: rango.aceptable,
    detalle: `Tu ping de ${ping} ms es "${clasificacion}" para ${rango.nombre}. Ideal: <${rango.bueno} ms. Máximo tolerable: <${rango.aceptable} ms.`,
    _insight: {
      title: `${clasificacion.split(' — ')[0]} para ${rango.nombre}`,
      text: insText,
      tone,
      icon: '🎮',
    },
    _chart: {
      type: 'scale',
      marker: Math.round(ping),
      markerLabel: `${Math.round(ping)} ms`,
      min: 0,
      segments: [
        { nombre: 'Excelente', max: rango.excelente, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Bueno', max: rango.bueno, color: '#65a30d', colorDark: '#84cc16' },
        { nombre: 'Aceptable', max: rango.aceptable, color: '#ca8a04', colorDark: '#eab308' },
        { nombre: 'Lag', max: segMax, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Ping de ${Math.round(ping)} ms ubicado en la escala de latencia para ${rango.nombre}, donde menos es mejor.`,
    },
  };
}
