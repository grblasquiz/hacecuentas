/** Estima el costo de multas de tránsito y puntos descontados de la licencia */
export interface Inputs {
  tipoInfraccion: number;
  valorUf: number;
}
export interface Outputs {
  montoEstimado: number;
  puntosDescuento: number;
  descripcionInfraccion: string;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

interface InfoInfraccion {
  nombre: string;
  ufMin: number;
  ufMax: number;
  puntos: number;
}

export function multaTransitoPuntosLicencia(i: Inputs): Outputs {
  const tipo = Number(i.tipoInfraccion);
  const uf = Number(i.valorUf);

  if (tipo < 1 || tipo > 8) throw new Error('El tipo de infracción debe ser entre 1 y 8');
  if (!uf || uf <= 0) throw new Error('Ingresá el valor de la Unidad Fija (UF)');

  const infracciones: Record<number, InfoInfraccion> = {
    1: { nombre: 'Exceso de velocidad leve (hasta 20 km/h de más)', ufMin: 100, ufMax: 300, puntos: 3 },
    2: { nombre: 'Exceso de velocidad grave (+20-40 km/h)', ufMin: 300, ufMax: 1000, puntos: 5 },
    3: { nombre: 'Cruzar semáforo en rojo', ufMin: 100, ufMax: 500, puntos: 5 },
    4: { nombre: 'Estacionar en lugar prohibido', ufMin: 50, ufMax: 200, puntos: 1 },
    5: { nombre: 'Sin cinturón de seguridad / usar celular', ufMin: 50, ufMax: 300, puntos: 3 },
    6: { nombre: 'Alcoholemia positiva (>0.5 g/L)', ufMin: 300, ufMax: 1000, puntos: 10 },
    7: { nombre: 'VTV vencida', ufMin: 100, ufMax: 300, puntos: 2 },
    8: { nombre: 'Sin seguro obligatorio', ufMin: 200, ufMax: 500, puntos: 4 },
  };

  const info = infracciones[tipo];
  const ufPromedio = (info.ufMin + info.ufMax) / 2;
  const montoEstimado = ufPromedio * uf;
  const montoMin = info.ufMin * uf;
  const montoMax = info.ufMax * uf;

  const chart = {
    type: 'scale' as const,
    marker: info.puntos,
    markerLabel: `${info.puntos} pts`,
    min: 0,
    segments: [
      { nombre: 'Leve', max: 3, color: '#4ade80', colorDark: '#22c55e' },
      { nombre: 'Moderada', max: 6, color: '#facc15', colorDark: '#eab308' },
      { nombre: 'Grave', max: 12, color: '#f87171', colorDark: '#ef4444' },
      { nombre: 'Pérdida de licencia', max: 20, color: '#b91c1c', colorDark: '#991b1b' },
    ],
    ariaLabel: `Severidad por puntos: ${info.puntos} de 20 puntos descontados`,
  };

  const tone: 'good' | 'warn' = info.puntos >= 5 ? 'warn' : 'good';
  const cercaTxt = info.puntos >= 10
    ? ` Con **${info.puntos} puntos** de una sola vez estás a la mitad del tope: otra grave y perdés la licencia.`
    : info.puntos >= 5
      ? ` Son **${info.puntos} de 20 puntos**: cuidá las próximas, porque al llegar a 20 te suspenden la licencia.`
      : ` Solo descuenta **${info.puntos} ${info.puntos === 1 ? 'punto' : 'puntos'}** de 20, bajo impacto en tu licencia.`;
  const insight = {
    title: 'Multa y puntos estimados',
    text: `**${info.nombre}** ronda los **$${Math.round(montoEstimado).toLocaleString('es-AR')}** (entre $${Math.round(montoMin).toLocaleString('es-AR')} y $${Math.round(montoMax).toLocaleString('es-AR')}).${cercaTxt}`,
    tone,
    icon: '🚦',
  };

  return {
    montoEstimado: Math.round(montoEstimado),
    puntosDescuento: info.puntos,
    descripcionInfraccion: info.nombre,
    detalle: `${info.nombre}: multa estimada $${Math.round(montoMin).toLocaleString('es-AR')} a $${Math.round(montoMax).toLocaleString('es-AR')} (promedio $${Math.round(montoEstimado).toLocaleString('es-AR')}). Puntos de descuento: ${info.puntos} de 20. UF: ${info.ufMin}-${info.ufMax} × $${uf}.`,
    _chart: chart,
    _insight: insight,
  };
}
