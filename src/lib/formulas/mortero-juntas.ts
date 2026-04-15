/** Mortero para juntas de ladrillos por m² de pared */
export interface MorteroJuntasInputs {
  superficieM2: number;
  tipoLadrillo?: string;
  espesorJunta?: number;
}
export interface MorteroJuntasOutputs {
  cementoKg: number;
  arenaM3: number;
  aguaLitros: number;
  detalle: string;
}

const TIPOS: Record<string, { nombre: string; morteroM3PorM2: number }> = {
  comun: { nombre: 'Ladrillo común 24×12×6 cm', morteroM3PorM2: 0.04 },
  'hueco-8': { nombre: 'Hueco 8×18×33 cm (tabique)', morteroM3PorM2: 0.02 },
  'hueco-12': { nombre: 'Hueco 18×12×33 cm (pared 12)', morteroM3PorM2: 0.025 },
  'hueco-18': { nombre: 'Hueco 18×18×33 cm (pared 18)', morteroM3PorM2: 0.03 },
};

const CEMENTO_KG_POR_M3 = 350; // receta 1:3
const ARENA_M3_POR_M3 = 1.0;
const AGUA_L_POR_M3 = 200;

export function morteroJuntas(inputs: MorteroJuntasInputs): MorteroJuntasOutputs {
  const superficie = Number(inputs.superficieM2);
  const tipo = String(inputs.tipoLadrillo || 'comun');
  const espesor = Number(inputs.espesorJunta ?? 1.5);

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie en m²');
  if (!TIPOS[tipo]) throw new Error('Tipo de ladrillo no válido');
  if (espesor < 0.5 || espesor > 3) throw new Error('El espesor de junta debe estar entre 0,5 y 3 cm');

  const t = TIPOS[tipo];
  // Ajustar mortero por espesor de junta (base es 1.5 cm)
  const factorEspesor = espesor / 1.5;
  const morteroM3 = superficie * t.morteroM3PorM2 * factorEspesor;

  const cementoKg = Number((morteroM3 * CEMENTO_KG_POR_M3).toFixed(1));
  const arenaM3 = Number((morteroM3 * ARENA_M3_POR_M3).toFixed(3));
  const aguaLitros = Number((morteroM3 * AGUA_L_POR_M3).toFixed(0));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const bolsas = Math.ceil(cementoKg / 50);

  return {
    cementoKg,
    arenaM3,
    aguaLitros,
    detalle: `${fmt.format(superficie)} m² de ${t.nombre} con junta de ${fmt.format(espesor)} cm → ${fmt.format(morteroM3)} m³ de mortero = ${fmt.format(cementoKg)} kg cemento (${bolsas} bolsas de 50 kg) + ${fmt.format(arenaM3)} m³ arena + ${fmt.format(aguaLitros)} L agua.`,
  };
}
