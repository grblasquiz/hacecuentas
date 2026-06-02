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
  _insight?: any;
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

  let insTitle: string, insText: string, insTone: 'good' | 'warn' | 'neutral', insIcon: string;
  if (Math.abs(dist) <= margen) {
    insTitle = 'Jugada al límite';
    insText = `La diferencia de **${dist.toFixed(1)} cm** cae dentro del margen de error de **±${margen} cm** del sistema ${saot === 'si' ? 'SAOT' : 'VAR manual'}. Es una decisión demasiado ajustada para resolver con certeza técnica: queda a criterio del árbitro.`;
    insTone = 'neutral';
    insIcon = '⚖️';
  } else if (dist > 0) {
    insTitle = 'Posición de offside';
    insText = `El atacante está **${dist.toFixed(1)} cm adelantado** respecto al penúltimo defensor, por encima del margen de **±${margen} cm**. La jugada se anula por fuera de juego.`;
    insTone = 'warn';
    insIcon = '🚩';
  } else {
    insTitle = 'Posición habilitada';
    insText = `El atacante está **${Math.abs(dist).toFixed(1)} cm detrás** del penúltimo defensor, fuera del margen de **±${margen} cm**. La posición es legal: el juego continúa.`;
    insTone = 'good';
    insIcon = '✅';
  }

  return {
    decisionOffside: decision,
    margenError: `Margen técnico de error: ±${margen} cm.`,
    _insight: { title: insTitle, text: insText, tone: insTone, icon: insIcon },
    porcentajeHombro: `${pctHombro}% del ancho de un hombro (referencia: ${hombro} cm).`,
    precisionTecnica: precisionTxt,
    mensaje: `Distancia ${dist.toFixed(1)} cm · margen ±${margen} cm · ${decision.split(':')[0]}.`
  };
}
