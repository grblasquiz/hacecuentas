/** Talla de anillo por circunferencia del dedo */
export interface Inputs {
  circunferencia: number;
  sistema: string;
}
export interface Outputs {
  tallaAR: number;
  tallaUS: number;
  tallaEU: number;
  tallaUK: string;
  diametro: number;
  mensaje: string;
}

export function tallaAnilloDedo(i: Inputs): Outputs {
  const circ = Number(i.circunferencia); // mm
  if (!circ || circ < 35 || circ > 80) throw new Error('Ingresá la circunferencia del dedo en mm (35-80)');

  const diametro = circ / Math.PI;

  // Conversiones aproximadas
  // AR/EU: circunferencia en mm directamente es aprox la talla
  const tallaEU = Math.round(circ);

  // US: tabla de conversión
  const tallaUS = Number(((circ - 36.5) / 2.55).toFixed(1));

  // AR: similar a EU
  const tallaAR = tallaEU;

  // UK: letras
  const ukSizes = ['F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  const ukIndex = Math.round((circ - 44.2) / 1.25);
  const tallaUK = ukIndex >= 0 && ukIndex < ukSizes.length ? ukSizes[ukIndex] : '—';

  return {
    tallaAR,
    tallaUS: Math.max(0, tallaUS),
    tallaEU,
    tallaUK,
    diametro: Number(diametro.toFixed(1)),
    mensaje: `Circunferencia ${circ}mm → Diámetro ${diametro.toFixed(1)}mm. Talla AR/EU: ${tallaAR} | US: ${Math.max(0, tallaUS)} | UK: ${tallaUK}.`,
  };
}
