/** Humedad absoluta (g/m³) a partir de humedad relativa (%) y temperatura (°C).
 *  Formula aproximada: AH = 216.7 · (RH/100 · 6.112 · exp(17.625·T/(T+243.04))) / (T+273.15). */
export interface Inputs {
  temperatura: number;
  humedadRelativa: number;
}
export interface Outputs {
  humedadAbsoluta: string;       // "15.3 g/m³"
  humedadAbsolutaNumero: number;
  zonaConfort: string;
  categoria: string;
  recomendacion: string;
  mensaje: string;
}

export function humedadAbsolutaRelativa(i: Inputs): Outputs {
  const T = Number(i.temperatura);
  const RH = Number(i.humedadRelativa);
  if (!Number.isFinite(T) || T < -40 || T > 60) throw new Error('Temperatura fuera de rango.');
  if (!Number.isFinite(RH) || RH <= 0 || RH > 100) throw new Error('Humedad relativa debe estar entre 1 y 100 %.');

  // Presión de vapor de saturación (hPa) - Magnus
  const es = 6.112 * Math.exp((17.625 * T) / (T + 243.04));
  const e = (RH / 100) * es;
  // Humedad absoluta g/m³
  const AH = (216.7 * e) / (T + 273.15);

  let categoria = 'Ideal';
  let zona = 'Zona de confort';
  let rec = 'Mantené así, clima agradable para la mayoría.';
  if (RH < 30) {
    categoria = 'Seco';
    zona = 'Fuera de confort — aire reseco';
    rec = 'Considerá humidificador: puede resecar mucosas, piel y garganta.';
  } else if (RH <= 50) {
    categoria = 'Ideal';
    zona = 'Zona de confort (30-50% HR)';
    rec = 'Rango óptimo según ASHRAE para salud respiratoria y confort.';
  } else if (RH <= 60) {
    categoria = 'Aceptable';
    zona = 'Límite superior aceptable';
    rec = 'Ventilar cuando sea posible para evitar moho en zonas frías.';
  } else if (RH <= 70) {
    categoria = 'Incómodo';
    zona = 'Fuera de confort — aire pesado';
    rec = 'Deshumidificador o ventilación cruzada recomendada.';
  } else {
    categoria = 'Muy alto — riesgo moho';
    zona = 'Peligro de moho y ácaros';
    rec = 'Revisar ventilación, filtraciones y usar deshumidificador. >70% prolongada daña muebles y salud.';
  }

  return {
    humedadAbsoluta: `${AH.toFixed(1)} g/m³`,
    humedadAbsolutaNumero: Number(AH.toFixed(2)),
    zonaConfort: zona,
    categoria,
    recomendacion: rec,
    mensaje: `Con ${T.toFixed(1)} °C y ${RH.toFixed(0)}% HR hay ${AH.toFixed(1)} g/m³ de agua en el aire (${categoria}).`,
  };
}
