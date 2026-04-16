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

  return {
    montoEstimado: Math.round(montoEstimado),
    unidadesFijas: ufPromedio,
    montoTotal: Math.round(montoTotal),
    puntosEstimados: inf.puntos * cantidad,
    detalle: `${inf.desc}. ${ufPromedio} UF × $${valorUF} = $${montoBase.toLocaleString('es-AR')}${reincidente ? ' (×2 reincidencia)' : ''}`,
  };
}
