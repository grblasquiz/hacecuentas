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
  _insight?: any;
  _chart?: any;
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

  // tono dinámico según brecha SOV vs SOM (si hay SOM) o según SOV
  let tone: 'good' | 'warn' | 'neutral';
  if (som > 0) tone = brechaPuntos >= 5 ? 'good' : brechaPuntos < -2 ? 'warn' : 'neutral';
  else tone = sov >= 25 ? 'good' : sov < 3 ? 'warn' : 'neutral';

  const brechaTxt = som > 0
    ? ` Con un market share del **${som.toFixed(1)}%**, tu brecha es de **${brechaPuntos >= 0 ? '+' : ''}${brechaPuntos.toFixed(1)} pp**: ${brechaPuntos >= 5 ? 'invertís más de lo que vendés, base para ganar participación.' : brechaPuntos < -2 ? 'vendés más de lo que comunicás, riesgo de erosión si los competidores aprietan.' : 'estás en equilibrio, defendiendo tu posición.'}`
    : '';

  const _insight = {
    title: 'Tu peso en la conversación',
    text: `Tu share of voice es **${sov.toFixed(1)}%** del mercado: **${diagnostico}**${brechaTxt}`,
    tone,
    icon: '📢',
  };

  const _chart = {
    type: 'scale',
    marker: Number(sov.toFixed(1)),
    markerLabel: `${sov.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Marginal', max: 3, color: '#fca5a5', colorDark: '#7f1d1d' },
      { nombre: 'Challenger', max: 10, color: '#fdba74', colorDark: '#7c2d12' },
      { nombre: 'Relevante', max: 25, color: '#fde047', colorDark: '#713f12' },
      { nombre: 'Líder', max: 50, color: '#86efac', colorDark: '#14532d' },
      { nombre: 'Dominante', max: 100, color: '#4ade80', colorDark: '#166534' },
    ],
    ariaLabel: `Share of voice de ${sov.toFixed(1)}% sobre el mercado, ubicado en la zona ${diagnostico}`,
  };

  return {
    sov: Number(sov.toFixed(2)),
    sovVsSom,
    diagnostico,
    brechaPuntos: Number(brechaPuntos.toFixed(2)),
    resumen,
    _insight,
    _chart,
  };
}
