/** Evaluación de ping/latencia para gaming según tipo de juego */
export interface Inputs { pingMs: number; tipoJuego?: string; }
export interface Outputs { clasificacion: string; pingIdeal: number; pingMaximo: number; detalle: string; }

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
  if (ping <= rango.excelente) clasificacion = 'Excelente';
  else if (ping <= rango.bueno) clasificacion = 'Bueno';
  else if (ping <= rango.aceptable) clasificacion = 'Aceptable';
  else clasificacion = 'Malo — vas a tener lag';

  return {
    clasificacion,
    pingIdeal: rango.bueno,
    pingMaximo: rango.aceptable,
    detalle: `Tu ping de ${ping} ms es "${clasificacion}" para ${rango.nombre}. Ideal: <${rango.bueno} ms. Máximo tolerable: <${rango.aceptable} ms.`,
  };
}
