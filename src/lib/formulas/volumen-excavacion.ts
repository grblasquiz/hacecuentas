/** Volumen de excavación en m³ */
export interface VolumenExcavacionInputs {
  largo: number;
  ancho: number;
  profundidad: number;
  factorEsponjamiento?: number;
}
export interface VolumenExcavacionOutputs {
  volumenExcavado: number;
  volumenEsponjado: number;
  cargasCamion: number;
  detalle: string;
}

const M3_POR_CAMION = 6;

export function volumenExcavacion(inputs: VolumenExcavacionInputs): VolumenExcavacionOutputs {
  const largo = Number(inputs.largo);
  const ancho = Number(inputs.ancho);
  const prof = Number(inputs.profundidad);
  const factor = Number(inputs.factorEsponjamiento ?? 1.25);

  if (!largo || largo <= 0) throw new Error('Ingresá el largo en metros');
  if (!ancho || ancho <= 0) throw new Error('Ingresá el ancho en metros');
  if (!prof || prof <= 0) throw new Error('Ingresá la profundidad en metros');
  if (factor < 1 || factor > 2) throw new Error('El factor de esponjamiento debe estar entre 1 y 2');

  const volBanco = largo * ancho * prof;
  const volEsponj = volBanco * factor;
  const cargas = Math.ceil(volEsponj / M3_POR_CAMION);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    volumenExcavado: Number(volBanco.toFixed(2)),
    volumenEsponjado: Number(volEsponj.toFixed(2)),
    cargasCamion: cargas,
    detalle: `Excavación de ${fmt.format(largo)} × ${fmt.format(ancho)} × ${fmt.format(prof)} m = ${fmt.format(volBanco)} m³ en banco → ${fmt.format(volEsponj)} m³ esponjados (×${fmt.format(factor)}) → ${cargas} cargas de camión volcador.`,
  };
}
