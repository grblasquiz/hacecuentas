/** Piso flotante: cajas, m² y zócalo necesario */
export interface PisoFlotanteInputs {
  superficieM2: number;
  m2PorCaja?: number;
  tipoColocacion?: string;
  perimetroMl?: number;
  aberturasML?: number;
}
export interface PisoFlotanteOutputs {
  cajasNecesarias: number;
  m2Totales: number;
  zocaloMl: number;
  detalle: string;
}

const DESPERDICIO: Record<string, number> = {
  recta: 5,
  diagonal: 12,
};

export function pisoFlotanteM2Tablas(inputs: PisoFlotanteInputs): PisoFlotanteOutputs {
  const superficie = Number(inputs.superficieM2);
  const m2Caja = Number(inputs.m2PorCaja) || 2.4;
  const tipo = String(inputs.tipoColocacion || 'recta');
  const perimetro = Number(inputs.perimetroMl) || 0;
  const aberturas = Number(inputs.aberturasML) || 0;

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie en m²');
  if (m2Caja <= 0) throw new Error('Los m² por caja deben ser mayores a 0');
  if (!DESPERDICIO[tipo]) throw new Error('Tipo de colocación no válido');

  const desp = DESPERDICIO[tipo];
  const m2Totales = superficie * (1 + desp / 100);
  const cajas = Math.ceil(m2Totales / m2Caja);
  const zocalo = perimetro > 0 ? Math.max(0, perimetro - aberturas) : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    cajasNecesarias: cajas,
    m2Totales: Number(m2Totales.toFixed(2)),
    zocaloMl: Number(zocalo.toFixed(2)),
    detalle: `Para ${fmt.format(superficie)} m² con colocación ${tipo} (${desp}% desperdicio) necesitás ${fmt.format(m2Totales)} m² → ${cajas} cajas de ${fmt.format(m2Caja)} m².${zocalo > 0 ? ` Zócalo: ${fmt.format(zocalo)} m lineales.` : ''}`,
  };
}
