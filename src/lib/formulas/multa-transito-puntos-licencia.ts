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

  return {
    montoEstimado: Math.round(montoEstimado),
    puntosDescuento: info.puntos,
    descripcionInfraccion: info.nombre,
    detalle: `${info.nombre}: multa estimada $${Math.round(montoMin).toLocaleString('es-AR')} a $${Math.round(montoMax).toLocaleString('es-AR')} (promedio $${Math.round(montoEstimado).toLocaleString('es-AR')}). Puntos de descuento: ${info.puntos} de 20. UF: ${info.ufMin}-${info.ufMax} × $${uf}.`,
  };
}
