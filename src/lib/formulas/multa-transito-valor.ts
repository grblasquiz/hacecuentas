/** Valor de multas de tránsito */
export interface Inputs {
  tipoInfraccion: string;
  valorUF: number;
  cantidadMultas: number;
  reincidente?: string;
}
export interface Outputs {
  montoEstimado: number;
  unidadesFijas: number;
  montoTotal: number;
  puntosEstimados: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

const INFRACCIONES: Record<string, { ufMin: number; ufMax: number; puntos: number; desc: string }> = {
  leve:      { ufMin: 50,   ufMax: 150,  puntos: 2,  desc: 'Infracción leve (estacionamiento prohibido, documentación incompleta)' },
  moderada:  { ufMin: 150,  ufMax: 500,  puntos: 3,  desc: 'Infracción moderada (exceso velocidad <40%, semáforo rojo, uso celular)' },
  grave:     { ufMin: 500,  ufMax: 1000, puntos: 5,  desc: 'Infracción grave (exceso velocidad >40%, alcoholemia 0.5-1 g/l)' },
  muy_grave: { ufMin: 1000, ufMax: 2000, puntos: 10, desc: 'Infracción muy grave (picadas, fuga, alcoholemia >1 g/l)' },
};

export function multaTransitoValor(i: Inputs): Outputs {
  const tipo = String(i.tipoInfraccion);
  const valorUF = Number(i.valorUF);
  const cantidad = Number(i.cantidadMultas) || 1;
  const reincidente = i.reincidente === 'si';

  if (!INFRACCIONES[tipo]) throw new Error('Seleccioná un tipo de infracción válido');
  if (!valorUF || valorUF <= 0) throw new Error('Ingresá el valor de la Unidad Fija');

  const inf = INFRACCIONES[tipo];
  // Usamos el promedio de UF para la estimación
  const ufPromedio = Math.round((inf.ufMin + inf.ufMax) / 2);
  const montoBase = ufPromedio * valorUF;

  const multiplicador = reincidente ? 2 : 1;
  const montoEstimado = montoBase * multiplicador;
  const montoTotal = montoEstimado * cantidad;

  const chart = {
    type: 'scale' as const,
    marker: inf.puntos,
    markerLabel: `${inf.puntos} pts`,
    min: 0,
    segments: [
      { nombre: 'Leve', max: 2, color: '#4ade80', colorDark: '#22c55e' },
      { nombre: 'Moderada', max: 3, color: '#facc15', colorDark: '#eab308' },
      { nombre: 'Grave', max: 5, color: '#f87171', colorDark: '#ef4444' },
      { nombre: 'Muy grave', max: 20, color: '#b91c1c', colorDark: '#991b1b' },
    ],
    ariaLabel: `Gravedad de la infracción: ${inf.puntos} puntos de descuento sobre la licencia`,
  };

  const sev = tipo === 'leve' ? 'leve' : tipo === 'moderada' ? 'moderada' : tipo === 'grave' ? 'grave' : 'muy grave';
  const tone: 'good' | 'warn' = (tipo === 'grave' || tipo === 'muy_grave' || reincidente) ? 'warn' : 'neutral';
  const cantTxt = cantidad > 1 ? ` Por **${cantidad} multas** el total trepa a **$${Math.round(montoTotal).toLocaleString('es-AR')}** y **${inf.puntos * cantidad} puntos**.` : '';
  const reincTxt = reincidente ? ' Como **reincidente**, el monto se **duplica**.' : '';
  const insight = {
    title: `Infracción ${sev}`,
    text: `Una infracción **${sev}** ronda los **$${Math.round(montoEstimado).toLocaleString('es-AR')}** (${ufPromedio} UF) y descuenta **${inf.puntos} puntos**.${reincTxt}${cantTxt}`,
    tone,
    icon: '🚦',
  };

  return {
    montoEstimado: Math.round(montoEstimado),
    unidadesFijas: ufPromedio,
    montoTotal: Math.round(montoTotal),
    puntosEstimados: inf.puntos * cantidad,
    detalle: `${inf.desc}. ${ufPromedio} UF × $${valorUF} = $${montoBase.toLocaleString('es-AR')}${reincidente ? ' (×2 reincidencia)' : ''}`,
    _chart: chart,
    _insight: insight,
  };
}
