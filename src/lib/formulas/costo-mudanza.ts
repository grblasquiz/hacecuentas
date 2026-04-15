/** Estimador de costo de mudanza */
export interface Inputs { ambientes?: string; distanciaKm: number; piso?: string; ascensor?: string; }
export interface Outputs { costoEstimado: number; detalle: string; }

export function costoMudanza(i: Inputs): Outputs {
  const amb = String(i.ambientes || '2-dormitorios');
  const dist = Number(i.distanciaKm);
  const piso = String(i.piso || 'pb');
  const asc = String(i.ascensor || 'si');

  if (!dist || dist <= 0) throw new Error('Ingresá la distancia entre origen y destino');

  // Costos base por ambientes
  const baseMap: Record<string, number> = {
    'monoambiente': 70000,
    '1-dormitorio': 100000,
    '2-dormitorios': 140000,
    '3-dormitorios': 220000,
    '4-o-mas': 320000,
  };
  let costo = baseMap[amb] || 140000;

  // Recargo distancia (más de 10 km)
  if (dist > 10) {
    costo += (dist - 10) * 2000;
  }
  // Base incluye hasta 10 km
  costo += Math.min(dist, 10) * 1000;

  // Recargo piso con ascensor
  if (asc === 'si') {
    if (piso === '1-3') costo *= 1.05;
    else if (piso === '4-6') costo *= 1.10;
    else if (piso === '7-mas') costo *= 1.15;
  } else {
    // Sin ascensor: recargo mayor
    if (piso === '1-3') costo *= 1.30;
    else if (piso === '4-6') costo *= 1.45;
    else if (piso === '7-mas') costo *= 1.50;
  }

  costo = Math.round(costo / 1000) * 1000; // Redondear a miles

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const ambLabel: Record<string, string> = {
    'monoambiente': 'monoambiente',
    '1-dormitorio': '1 dormitorio',
    '2-dormitorios': '2 dormitorios',
    '3-dormitorios': '3 dormitorios',
    '4-o-mas': '4+ dormitorios',
  };
  const pisoLabel: Record<string, string> = {
    'pb': 'PB/Casa',
    '1-3': 'piso 1-3',
    '4-6': 'piso 4-6',
    '7-mas': 'piso 7+',
  };

  return {
    costoEstimado: costo,
    detalle: `Mudanza de ${ambLabel[amb] || amb}, ${pisoLabel[piso] || piso} ${asc === 'no' ? 'sin ascensor' : 'con ascensor'}, ${fmt.format(dist)} km de distancia. Costo estimado: $${fmt.format(costo)}. Pedí al menos 3 presupuestos para comparar.`,
  };
}
