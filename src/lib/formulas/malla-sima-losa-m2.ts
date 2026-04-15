/** Malla electrosoldada SIMA para losa: paños y peso */
export interface MallaSimaInputs {
  superficieM2: number;
  tipoMalla?: string;
  solapeCm?: number;
  desperdicio?: number;
}
export interface MallaSimaOutputs {
  panos: number;
  pesoKg: number;
  detalle: string;
}

const PANO_LARGO = 6.0; // m
const PANO_ANCHO = 2.4; // m

const PESO_POR_PANO: Record<string, { nombre: string; pesoKg: number }> = {
  Q92: { nombre: 'Q-92 (4,2 mm)', pesoKg: 21 },
  Q131: { nombre: 'Q-131 (5,0 mm)', pesoKg: 30 },
  Q188: { nombre: 'Q-188 (6,0 mm)', pesoKg: 42 },
  Q257: { nombre: 'Q-257 (7,0 mm)', pesoKg: 58 },
};

export function mallaSimaLosaM2(inputs: MallaSimaInputs): MallaSimaOutputs {
  const superficie = Number(inputs.superficieM2);
  const tipo = String(inputs.tipoMalla || 'Q188');
  const solapeCm = Number(inputs.solapeCm ?? 25);
  const desperdicio = Number(inputs.desperdicio ?? 5);

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie en m²');
  if (!PESO_POR_PANO[tipo]) throw new Error('Tipo de malla no válido');
  if (solapeCm < 15 || solapeCm > 40) throw new Error('El solape debe estar entre 15 y 40 cm');
  if (desperdicio < 0 || desperdicio > 20) throw new Error('El desperdicio debe estar entre 0% y 20%');

  const solapeM = solapeCm / 100;
  const areaNeta = (PANO_ANCHO - solapeM) * (PANO_LARGO - solapeM);
  const supConDesp = superficie * (1 + desperdicio / 100);
  const panos = Math.ceil(supConDesp / areaNeta);

  const t = PESO_POR_PANO[tipo];
  const pesoTotal = Number((panos * t.pesoKg).toFixed(1));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    panos,
    pesoKg: pesoTotal,
    detalle: `Para ${fmt.format(superficie)} m² con malla ${t.nombre} y ${solapeCm} cm de solape: ${panos} paños (${fmt.format(areaNeta)} m² netos/paño) → ${fmt.format(pesoTotal)} kg totales.`,
  };
}
