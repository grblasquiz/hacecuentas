/** Arena para relleno de terreno: m³ y camiones */
export interface ArenaRellenoInputs {
  superficieM2: number;
  espesorCm: number;
  compactacion?: number;
  m3PorCamion?: number;
}
export interface ArenaRellenoOutputs {
  m3Necesarios: number;
  camiones: number;
  detalle: string;
}

export function arenaRellenoTerrenoM3(inputs: ArenaRellenoInputs): ArenaRellenoOutputs {
  const superficie = Number(inputs.superficieM2);
  const espesorCm = Number(inputs.espesorCm);
  const compactacion = Number(inputs.compactacion ?? 20);
  const m3Camion = Number(inputs.m3PorCamion) || 7;

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie en m²');
  if (!espesorCm || espesorCm <= 0) throw new Error('Ingresá el espesor de relleno en cm');
  if (compactacion < 0 || compactacion > 40) throw new Error('La compactación debe estar entre 0% y 40%');
  if (m3Camion <= 0) throw new Error('Los m³ por camión deben ser mayor a 0');

  const espesorM = espesorCm / 100;
  const volNeto = superficie * espesorM;
  const volTotal = Number((volNeto * (1 + compactacion / 100)).toFixed(1));
  const camiones = Math.ceil(volTotal / m3Camion);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    m3Necesarios: volTotal,
    camiones,
    detalle: `${fmt.format(superficie)} m² × ${espesorCm} cm = ${fmt.format(volNeto)} m³ netos. Con ${compactacion}% de compactación: ${fmt.format(volTotal)} m³ a pedir → ${camiones} camiones de ${m3Camion} m³.`,
  };
}
