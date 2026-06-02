/** Discord Server Boost */
export interface Inputs { boostsActuales: number; nivelObjetivo: string; }
export interface Outputs { boostsFaltantes: string; costoMensualFaltante: string; costoAnual: string; perksDesbloqueados: string; _insight?: any; _chart?: any; }

export function discordServerBoostNitro(i: Inputs): Outputs {
  const actuales = Number(i.boostsActuales) || 0;
  const nivel = String(i.nivelObjetivo);
  const metas: Record<string, number> = {
    'Nivel 1 (2 boosts)': 2,
    'Nivel 2 (7 boosts)': 7,
    'Nivel 3 (14 boosts)': 14,
  };
  const meta = metas[nivel];
  if (!meta) throw new Error('Nivel inválido');
  const faltantes = Math.max(0, meta - actuales);
  const costoMensual = faltantes * 4.99;
  const costoAnual = costoMensual * 12;
  const perksByNivel: Record<string, string> = {
    'Nivel 1 (2 boosts)': 'Emojis 50→100, audio 128kbps, banner animado',
    'Nivel 2 (7 boosts)': 'Audio 256kbps, stream 1080p, 50MB upload non-Nitro, 150 emojis',
    'Nivel 3 (14 boosts)': 'Audio 384kbps, stream 4K, 100MB upload, vanity URL, 250 emojis',
  };
  const yaTiene = Math.min(actuales, meta);
  const insight = faltantes === 0
    ? {
        title: 'Nivel alcanzado',
        text: `Con **${actuales} boosts** ya tenés el **${nivel.split(' (')[0]}** desbloqueado. No necesitás pagar nada más para mantener estos perks mientras los boosts sigan activos.`,
        tone: 'good',
        icon: '🚀',
      }
    : {
        title: 'Lo que falta',
        text: `Te faltan **${faltantes} boosts** para el **${nivel.split(' (')[0]}**. Si los pagás todos vos, son **$${costoMensual.toFixed(2)} USD/mes** (**$${costoAnual.toFixed(2)} USD/año**) — conviene repartirlos entre miembros del server.`,
        tone: 'warn',
        icon: '🚀',
      };
  const chart = {
    type: 'doughnut',
    slices: [
      { label: 'Ya tenés', value: yaTiene },
      { label: 'Faltan', value: faltantes },
    ],
    prefix: '',
    centerValue: `${meta} boosts`,
    centerLabel: nivel.split(' (')[0],
    ariaLabel: `Para el ${nivel.split(' (')[0]} hacen falta ${meta} boosts: tenés ${yaTiene} y faltan ${faltantes}.`,
  };
  return {
    boostsFaltantes: faltantes === 0 ? 'Nivel alcanzado ✅' : `${faltantes} boosts faltantes`,
    costoMensualFaltante: `$${costoMensual.toFixed(2)} USD/mes`,
    costoAnual: `$${costoAnual.toFixed(2)} USD/año`,
    perksDesbloqueados: perksByNivel[nivel] || '',
    _insight: insight,
    _chart: chart,
  };
}
