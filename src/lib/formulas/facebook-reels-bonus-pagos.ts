/** Facebook Reels Bonus */
export interface Inputs { vistasMensuales: number; rpm: number; tipoContenido: string; }
export interface Outputs { ingresoMensual: string; ingresoAnual: string; ajusteOriginalidad: string; comparativa: string; _insight?: any; }

export function facebookReelsBonusPagos(i: Inputs): Outputs {
  const v = Number(i.vistasMensuales) || 0;
  const rpm = Number(i.rpm);
  const tipo = String(i.tipoContenido);
  if (rpm <= 0) throw new Error('RPM inválido');
  const ajuste = tipo.startsWith('Original') ? 1.0 : 0.4;
  const base = (v / 1000) * rpm;
  const mensual = base * ajuste;
  const anual = mensual * 12;
  const penalizado = !tipo.startsWith('Original');
  const insightText = penalizado
    ? `Con **${v.toLocaleString('es-AR')} vistas/mes** ganarías unos **$${mensual.toFixed(2)} USD** mensuales, pero el contenido re-subido pierde el **60%**: subiéndolo original cobrarías $${base.toFixed(2)} USD.`
    : `Con **${v.toLocaleString('es-AR')} vistas/mes** a $${rpm} RPM sumás unos **$${mensual.toFixed(2)} USD/mes** ($${anual.toFixed(2)} al año). Tratalo como ingreso complementario: TikTok paga 10-20× más por las mismas vistas.`;

  return {
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anual.toFixed(2)} USD/año`,
    ajusteOriginalidad: penalizado ? 'Penalizado 60% (re-subido de TikTok/IG)' : 'Sin penalización (contenido original)',
    comparativa: 'Vs TikTok Creator Rewards: Facebook Reels paga 10-20x menos. Úsalo como complementario',
    _insight: {
      title: 'Cuánto rinde el bonus',
      text: insightText,
      tone: 'warn',
      icon: '📱',
    },
  };
}
