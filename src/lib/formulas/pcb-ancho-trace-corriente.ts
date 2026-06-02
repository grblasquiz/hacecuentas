export interface PcbAnchoTraceCorrienteInputs { corriente: number; espesorCu: number; ubicacion: string; deltaTemp: number; }
export interface PcbAnchoTraceCorrienteOutputs { anchoMin: string; anchoMil: string; resumen: string; _insight?: any; }
export function pcbAnchoTraceCorriente(i: PcbAnchoTraceCorrienteInputs): PcbAnchoTraceCorrienteOutputs {
  const I = Number(i.corriente); const cu = Number(i.espesorCu); const dT = Number(i.deltaTemp);
  if (!I || !cu || !dT) throw new Error('Completá campos');
  const k = i.ubicacion === 'interna' ? 0.024 : 0.048;
  const area = Math.pow(I / (k * Math.pow(dT, 0.44)), 1 / 0.725);
  const widthMil = area / (cu * 1.378);
  const widthMm = widthMil * 0.0254;
  const esInterna = i.ubicacion === 'interna';
  const insight = {
    title: 'Ancho mínimo según IPC-2221',
    text: `Para llevar **${I}A** con un ΔT de **${dT}°C** necesitás al menos **${widthMm.toFixed(2)} mm** (${widthMil.toFixed(1)} mil) de pista en cobre de ${cu} oz. ${esInterna ? 'Al ser **capa interna**, el cobre disipa peor el calor y por eso la pista sale más ancha que la misma corriente en superficie.' : 'Es una pista **externa** (en superficie), que disipa mejor: una interna para la misma corriente saldría bastante más ancha.'} Dejá margen y no la corras al límite térmico.`,
    tone: 'neutral',
    icon: '🔌',
  };
  return { anchoMin: widthMm.toFixed(2) + ' mm', anchoMil: widthMil.toFixed(1) + ' mil',
    resumen: `Ancho mínimo de pista: ${widthMm.toFixed(2)} mm (${widthMil.toFixed(1)} mil) para conducir ${I}A con ΔT de ${dT}°C sobre ambiente.`,
    _insight: insight };
}
