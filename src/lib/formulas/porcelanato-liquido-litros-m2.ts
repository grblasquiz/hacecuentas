/** Porcelanato líquido: litros de resina, primer y sellador por m² */
export interface PorcelanatoLiquidoInputs {
  superficieM2: number;
  espesorMm?: number;
  capas?: number;
  desperdicio?: number;
}
export interface PorcelanatoLiquidoOutputs {
  litrosResina: number;
  litrosPrimer: number;
  litrosSellador: number;
  detalle: string;
}

const RENDIMIENTO_RESINA_L_POR_M2_POR_MM = 1.0;
const PRIMER_L_POR_M2 = 0.2;
const SELLADOR_L_POR_M2 = 0.15;

export function porcelanatoLiquidoLitrosM2(inputs: PorcelanatoLiquidoInputs): PorcelanatoLiquidoOutputs {
  const superficie = Number(inputs.superficieM2);
  const espesor = Number(inputs.espesorMm) || 1.5;
  const capas = Number(inputs.capas) || 2;
  const desperdicio = Number(inputs.desperdicio ?? 10);

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie en m²');
  if (espesor <= 0 || espesor > 5) throw new Error('El espesor debe estar entre 0,5 y 5 mm');
  if (capas < 1 || capas > 4) throw new Error('Las capas deben ser entre 1 y 4');
  if (desperdicio < 0 || desperdicio > 25) throw new Error('El desperdicio debe estar entre 0% y 25%');

  const factor = 1 + desperdicio / 100;
  const litrosResina = Number((superficie * espesor * RENDIMIENTO_RESINA_L_POR_M2_POR_MM * factor).toFixed(1));
  const litrosPrimer = Number((superficie * PRIMER_L_POR_M2 * factor).toFixed(1));
  const litrosSellador = Number((superficie * SELLADOR_L_POR_M2 * factor).toFixed(1));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    litrosResina,
    litrosPrimer,
    litrosSellador,
    detalle: `Para ${fmt.format(superficie)} m² con ${fmt.format(espesor)} mm de espesor en ${capas} capas (${desperdicio}% desperdicio): ${fmt.format(litrosResina)} L de resina epoxi, ${fmt.format(litrosPrimer)} L de primer y ${fmt.format(litrosSellador)} L de sellador UV.`,
  };
}
