/** Bloques de hormigón por m² de pared */
export interface BloquesM2Inputs {
  superficieM2: number;
  tipoBloque?: string;
  porcentajeDesperdicio?: number;
}
export interface BloquesM2Outputs {
  cantidadBloques: number;
  morteroKg: number;
  detalle: string;
}

const TIPOS: Record<string, { nombre: string; cementoKgM2: number }> = {
  '20x20x40': { nombre: 'Bloque 20×20×40 cm (muro 20 cm)', cementoKgM2: 7 },
  '15x20x40': { nombre: 'Bloque 15×20×40 cm (muro 15 cm)', cementoKgM2: 6.5 },
  '10x20x40': { nombre: 'Bloque 10×20×40 cm (tabique 10 cm)', cementoKgM2: 5.5 },
};

const BLOQUES_POR_M2 = 12.5;

export function bloquesM2(inputs: BloquesM2Inputs): BloquesM2Outputs {
  const superficie = Number(inputs.superficieM2);
  const tipo = String(inputs.tipoBloque || '20x20x40');
  const desperdicio = Number(inputs.porcentajeDesperdicio ?? 5);

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie en m²');
  if (!TIPOS[tipo]) throw new Error('Tipo de bloque no válido');
  if (desperdicio < 0 || desperdicio > 30) throw new Error('El desperdicio debe estar entre 0% y 30%');

  const t = TIPOS[tipo];
  const bloquesNetos = superficie * BLOQUES_POR_M2;
  const bloquesConDesp = Math.ceil(bloquesNetos * (1 + desperdicio / 100));
  const mortero = Number((superficie * t.cementoKgM2).toFixed(1));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    cantidadBloques: bloquesConDesp,
    morteroKg: mortero,
    detalle: `${fmt.format(superficie)} m² de pared con ${t.nombre} → ${fmt.format(bloquesConDesp)} bloques (incluye ${desperdicio}% desperdicio) + ${fmt.format(mortero)} kg de cemento para mortero.`,
  };
}
