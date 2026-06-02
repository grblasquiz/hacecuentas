/** Facturación mínima para cubrir costos + margen objetivo */
export interface Inputs {
  costosFijosMensuales: number;
  margenContribucion: number;
  gananciaObjetivoMensual?: number;
}
export interface Outputs {
  facturacionMinima: number;
  facturacionConGanancia: number;
  facturacionDiaria: number;
  facturacionDiariaConGanancia: number;
  _insight?: any;
}

export function facturacionMinima(i: Inputs): Outputs {
  const cf = Number(i.costosFijosMensuales);
  const margen = Number(i.margenContribucion) / 100;
  const ganancia = Number(i.gananciaObjetivoMensual) || 0;
  if (!cf || cf <= 0) throw new Error('Ingresá los costos fijos');
  if (margen <= 0 || margen > 1) throw new Error('El margen debe estar entre 0 y 100 %');

  const facturacionBE = cf / margen;
  const facturacionTotal = (cf + ganancia) / margen;

  const beFmt = Math.round(facturacionBE).toLocaleString();
  const diaFmt = Math.round(facturacionBE / 30).toLocaleString();
  const margenPct = (margen * 100).toFixed(0);
  const insight = ganancia > 0
    ? {
        title: 'Tu punto de equilibrio',
        text: `Para no perder plata necesitás facturar **$${beFmt}/mes** (unos **$${diaFmt}/día**). Para llegar a tu ganancia objetivo, la meta sube a **$${Math.round(facturacionTotal).toLocaleString()}/mes**. Con un margen del **${margenPct}%**, cada peso de venta deja **$${margen.toFixed(2)}** para cubrir costos y utilidad.`,
        tone: 'neutral' as const,
        icon: '🎯'
      }
    : {
        title: 'Tu punto de equilibrio',
        text: `Por debajo de **$${beFmt}/mes** (unos **$${diaFmt}/día**) operás a pérdida. Con un margen de contribución del **${margenPct}%**, cada $100 facturados aportan solo **$${(margen * 100).toFixed(0)}** para cubrir tus costos fijos.`,
        tone: 'warn' as const,
        icon: '⚖️'
      };

  return {
    facturacionMinima: Math.round(facturacionBE),
    facturacionConGanancia: Math.round(facturacionTotal),
    facturacionDiaria: Math.round(facturacionBE / 30),
    facturacionDiariaConGanancia: Math.round(facturacionTotal / 30),
    _insight: insight,
  };
}
