/** Volumen de pileta de natación en litros y m³ */
export interface PiletaInputs {
  forma?: string;
  largoM: number;
  anchoM: number;
  profMinM: number;
  profMaxM: number;
}
export interface PiletaOutputs {
  litros: number;
  m3: number;
  detalle: string;
}

const FACTORES_FORMA: Record<string, number> = {
  rectangular: 1,
  circular: Math.PI / 4, // π/4 para convertir largo×ancho en área circular
  rinon: 0.85,
};

export function piletaNatacionLitrosM3(inputs: PiletaInputs): PiletaOutputs {
  const forma = String(inputs.forma || 'rectangular');
  const largo = Number(inputs.largoM);
  const ancho = Number(inputs.anchoM);
  const profMin = Number(inputs.profMinM);
  const profMax = Number(inputs.profMaxM);

  if (!largo || largo <= 0) throw new Error('Ingresá el largo de la pileta');
  if (!ancho || ancho <= 0) throw new Error('Ingresá el ancho de la pileta');
  if (!profMin || profMin <= 0) throw new Error('Ingresá la profundidad mínima');
  if (!profMax || profMax <= 0) throw new Error('Ingresá la profundidad máxima');
  if (!FACTORES_FORMA[forma]) throw new Error('Forma no válida');

  const profPromedio = (profMin + profMax) / 2;
  const factor = FACTORES_FORMA[forma];
  const m3 = Number((largo * ancho * profPromedio * factor).toFixed(2));
  const litros = Math.round(m3 * 1000);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const fmtL = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const formaLabel = forma === 'rectangular' ? 'rectangular' : forma === 'circular' ? 'circular' : 'riñón';

  return {
    litros,
    m3,
    detalle: `Pileta ${formaLabel} de ${fmt.format(largo)}×${fmt.format(ancho)} m con profundidad promedio ${fmt.format(profPromedio)} m → ${fmt.format(m3)} m³ = ${fmtL.format(litros)} litros.`,
  };
}
