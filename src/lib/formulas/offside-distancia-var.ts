/** Offside / fuera de juego: distancia desde VAR / SAOT (Semi-Automated Offside Technology) */
export interface Inputs {
  distanciaCm: number;
  saotActivo: string;
  anchoHombro: number;
}
export interface Outputs {
  decisionOffside: string;
  margenError: string;
  porcentajeHombro: string;
  precisionTecnica: string;
  mensaje: string;
}

export function offsideDistanciaVar(i: Inputs): Outputs {
  const dist = Number(i.distanciaCm) || 0;
  const saot = String(i.saotActivo || 'si');
  const hombro = Number(i.anchoHombro) || 45; // cm ancho hombros promedio jugador adulto

  const margen = saot === 'si' ? 7 : 20; // SAOT ±7cm vs VAR manual ±20cm

  let decision = '';
  if (Math.abs(dist) <= margen) {
    decision = `LÍNEA LÍMITE: ${dist.toFixed(1)} cm está dentro del margen de error (${margen} cm). La decisión queda en manos del juez.`;
  } else if (dist > 0) {
    decision = `OFFSIDE: el atacante está ${dist.toFixed(1)} cm adelantado respecto al penúltimo defensor.`;
  } else {
    decision = `HABILITADO: el atacante está ${Math.abs(dist).toFixed(1)} cm detrás del penúltimo defensor (en juego).`;
  }

  const pctHombro = Math.round((Math.abs(dist) / hombro) * 1000) / 10;
  const precisionTxt = saot === 'si'
    ? 'SAOT (Semi-Automated Offside Technology): 12 cámaras de seguimiento a 50fps + sensor en la pelota (Adidas Al Rihla). Precisión ±7 cm en condiciones ideales. Decisión en ~25 segundos.'
    : 'VAR manual (línea trazada por operador): precisión ±15-20 cm por diferencias de frame y ángulo de cámara. Decisión en 40-120 segundos.';

  return {
    decisionOffside: decision,
    margenError: `Margen técnico de error: ±${margen} cm.`,
    porcentajeHombro: `${pctHombro}% del ancho de un hombro (referencia: ${hombro} cm).`,
    precisionTecnica: precisionTxt,
    mensaje: `Distancia ${dist.toFixed(1)} cm · margen ±${margen} cm · ${decision.split(':')[0]}.`
  };
}
