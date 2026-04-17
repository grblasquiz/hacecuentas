/** Facebook Reels Bonus */
export interface Inputs { vistasMensuales: number; rpm: number; tipoContenido: string; }
export interface Outputs { ingresoMensual: string; ingresoAnual: string; ajusteOriginalidad: string; comparativa: string; }

export function facebookReelsBonusPagos(i: Inputs): Outputs {
  const v = Number(i.vistasMensuales) || 0;
  const rpm = Number(i.rpm);
  const tipo = String(i.tipoContenido);
  if (rpm <= 0) throw new Error('RPM inválido');
  const ajuste = tipo.startsWith('Original') ? 1.0 : 0.4;
  const base = (v / 1000) * rpm;
  const mensual = base * ajuste;
  const anual = mensual * 12;
  return {
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anual.toFixed(2)} USD/año`,
    ajusteOriginalidad: tipo.startsWith('Original') ? 'Sin penalización (contenido original)' : 'Penalizado 60% (re-subido de TikTok/IG)',
    comparativa: 'Vs TikTok Creator Rewards: Facebook Reels paga 10-20x menos. Úsalo como complementario',
  };
}
