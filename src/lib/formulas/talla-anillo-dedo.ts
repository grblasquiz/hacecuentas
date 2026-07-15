/** Talla de anillo por circunferencia del dedo */
export interface Inputs {
  circunferencia: number;
  diametro?: number;
  metodo?: string;
  unidad?: string;
  sistema: string;
  __lang?: string;
}
export interface Outputs {
  tallaAR: number;
  tallaUS: number;
  tallaEU: number;
  tallaUK: string;
  tallaES: number;
  diametro: number;
  mensaje: string;
  recomendacion: string;
  _insight?: any;
}

export function tallaAnilloDedo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const factor = i.unidad === 'in' ? 25.4 : 1;
  const circ = i.metodo === 'diametro' ? Number(i.diametro) * factor * Math.PI : Number(i.circunferencia) * factor; // mm
  if (!circ || circ < 35 || circ > 80) throw new Error(
    __lang === 'en'
      ? 'Enter the finger circumference in mm (35-80)'
      : 'Ingresá la circunferencia del dedo en mm (35-80)'
  );

  const diametro = circ / Math.PI;

  // Conversiones aproximadas
  // AR/EU: circunferencia en mm directamente es aprox la talla
  const tallaEU = Math.round(circ);

  // US: tabla de conversión
  const tallaUS = Number(((circ - 36.5) / 2.55).toFixed(1));

  // AR: similar a EU
  const tallaAR = tallaEU;
  const tallaES = Math.max(0, Math.round(circ - 40));

  // UK: letras
  const ukSizes = ['F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  const ukIndex = Math.round((circ - 44.2) / 1.25);
  const tallaUK = ukIndex >= 0 && ukIndex < ukSizes.length ? ukSizes[ukIndex] : '—';

  const usVal = Math.max(0, tallaUS);
  const recomendacion = 'Si quedás entre dos talles, elegí el mayor para anillos anchos o dedos que se hinchan; confirmá siempre con la guía de la joyería.';
  const diaFmt = diametro.toFixed(1);
  const _insight = {
    title: __lang === 'en' ? 'Your ring size' : 'Tu talla de anillo',
    text: __lang === 'en'
      ? `A circumference of **${circ} mm** means a diameter of **${diaFmt} mm** → size **${tallaAR}** (AR/EU). Measure at the end of the day, when fingers are slightly larger.`
      : `Una circunferencia de **${circ} mm** equivale a un diámetro de **${diaFmt} mm** → talla **${tallaAR}** (AR/EU). Medí al final del día, cuando el dedo está un poco más hinchado.`,
    tone: 'neutral',
    icon: '💍',
  };
  return {
    tallaAR,
    tallaUS: usVal,
    tallaEU,
    tallaUK,
    tallaES,
    diametro: Number(diametro.toFixed(1)),
    mensaje: __lang === 'en'
      ? `Circumference ${circ}mm → Diameter ${diametro.toFixed(1)}mm. Size AR/EU: ${tallaAR} | US: ${usVal} | UK: ${tallaUK}.`
      : `Circunferencia ${circ}mm → Diámetro ${diametro.toFixed(1)}mm. Talla AR/EU: ${tallaAR} | US: ${usVal} | UK: ${tallaUK}.`,
    recomendacion,
    _insight,
  };
}
