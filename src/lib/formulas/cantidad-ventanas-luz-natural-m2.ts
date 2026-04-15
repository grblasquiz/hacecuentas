/** Ventanas necesarias para luz natural según código de edificación */
export interface VentanasLuzInputs {
  superficiePisoM2: number;
  anchoVentanaM?: number;
  altoVentanaM?: number;
  factorIluminacion?: string;
}
export interface VentanasLuzOutputs {
  ventanasNecesarias: number;
  superficieVidriadaMin: number;
  superficieVentilacionMin: number;
  detalle: string;
}

export function cantidadVentanasLuzNaturalM2(inputs: VentanasLuzInputs): VentanasLuzOutputs {
  const superficie = Number(inputs.superficiePisoM2);
  const anchoV = Number(inputs.anchoVentanaM) || 1.5;
  const altoV = Number(inputs.altoVentanaM) || 1.1;
  const factor = Number(inputs.factorIluminacion) || 0.125;

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie del piso en m²');
  if (anchoV <= 0 || altoV <= 0) throw new Error('Las medidas de ventana deben ser mayores a 0');

  const supVidriadaMin = Number((superficie * factor).toFixed(2));
  const supVentilacionMin = Number((superficie * factor / 2).toFixed(2)); // 1/16 = mitad de 1/8
  const m2Ventana = anchoV * altoV;
  const ventanas = Math.ceil(supVidriadaMin / m2Ventana);
  const supReal = Number((ventanas * m2Ventana).toFixed(2));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const pct = (factor * 100).toFixed(1);

  return {
    ventanasNecesarias: ventanas,
    superficieVidriadaMin: supVidriadaMin,
    superficieVentilacionMin: supVentilacionMin,
    detalle: `Para ${fmt.format(superficie)} m² de piso con factor ${pct}%: mínimo ${fmt.format(supVidriadaMin)} m² vidriados. Con ventanas de ${fmt.format(anchoV)}×${fmt.format(altoV)} m (${fmt.format(m2Ventana)} m² c/u): ${ventanas} ventanas (${fmt.format(supReal)} m² reales).`,
  };
}
