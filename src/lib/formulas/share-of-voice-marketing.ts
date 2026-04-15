/** Share of Voice (SOV) = inversión/menciones de tu marca / total del mercado */
export interface Inputs {
  metricaMarca: number; // impresiones, menciones, gasto
  metricaTotalMercado: number;
  sharOfMarketActual?: number; // market share actual, opcional
}
export interface Outputs {
  sov: number;
  sovVsSom: string;
  diagnostico: string;
  brechaPuntos: number;
  resumen: string;
}

export function shareOfVoiceMarketing(i: Inputs): Outputs {
  const marca = Number(i.metricaMarca);
  const total = Number(i.metricaTotalMercado);
  const som = Number(i.sharOfMarketActual) || 0;

  if (!marca || marca < 0) throw new Error('Ingresá la métrica de tu marca');
  if (!total || total <= 0) throw new Error('Ingresá el total del mercado');
  if (marca > total) throw new Error('La métrica de tu marca no puede ser mayor al total del mercado');

  const sov = (marca / total) * 100;
  const brechaPuntos = sov - som;

  let sovVsSom = '';
  if (som === 0) sovVsSom = 'Ingresá tu market share para comparar SOV vs SOM.';
  else if (brechaPuntos >= 5) sovVsSom = 'SOV > SOM (eSOV+): deberías ganar market share en los próximos meses.';
  else if (brechaPuntos >= -2) sovVsSom = 'SOV ≈ SOM: estás defendiendo tu posición.';
  else sovVsSom = 'SOV < SOM: riesgo de perder participación frente a competidores que invierten más.';

  let diagnostico = '';
  if (sov >= 50) diagnostico = 'Dominio del mercado en comunicación.';
  else if (sov >= 25) diagnostico = 'Marca líder de un segmento.';
  else if (sov >= 10) diagnostico = 'Jugador relevante.';
  else if (sov >= 3) diagnostico = 'Challenger.';
  else diagnostico = 'Participación marginal — difícil mover la aguja.';

  const resumen = `Tu share of voice es del ${sov.toFixed(1)}% del mercado. ${som > 0 ? `Brecha SOV vs SOM: ${brechaPuntos >= 0 ? '+' : ''}${brechaPuntos.toFixed(1)} pp.` : ''}`;

  return {
    sov: Number(sov.toFixed(2)),
    sovVsSom,
    diagnostico,
    brechaPuntos: Number(brechaPuntos.toFixed(2)),
    resumen,
  };
}
