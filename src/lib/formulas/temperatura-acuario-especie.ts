/** Temperatura ideal del acuario según especie, con potencia de calefactor. */
export interface Inputs {
  especie?: string;
  litros: number;
  tempAmbiente?: number;
}
export interface Outputs {
  tempIdealMin: number;
  tempIdealMax: number;
  calefactorWatts: number;
  ventiladorNecesario: string;
  notas: string;
}

export function temperaturaAcuarioEspecie(i: Inputs): Outputs {
  const litros = Number(i.litros);
  if (!litros || litros <= 0) throw new Error('Ingresá los litros del acuario');

  const especie = String(i.especie || 'tropical-comunitario');
  const tempAmb = Number(i.tempAmbiente ?? 18);

  const rango: Record<string, { min: number; max: number; ideal: number }> = {
    'tropical-comunitario': { min: 24, max: 26, ideal: 25 },
    'betta': { min: 25, max: 27, ideal: 26 },
    'disco': { min: 28, max: 30, ideal: 29 },
    'angel': { min: 25, max: 28, ideal: 26 },
    'goldfish': { min: 18, max: 22, ideal: 20 },
    'ciclidos-africanos': { min: 24, max: 28, ideal: 26 },
    'amazonicos': { min: 26, max: 29, ideal: 27 },
    'killifish': { min: 22, max: 26, ideal: 24 },
    'agua-fria': { min: 14, max: 22, ideal: 18 },
  };
  const r = rango[especie] ?? rango['tropical-comunitario'];

  // Potencia del calefactor
  let wattsPorLitro = 1.5;
  if (tempAmb <= 14) wattsPorLitro = 2.5;
  else if (tempAmb <= 18) wattsPorLitro = 2.0;
  else if (tempAmb <= 22) wattsPorLitro = 1.5;
  else wattsPorLitro = 1.0;

  // Si objetivo es agua fría, calefactor opcional o cero
  let watts = Math.round(litros * wattsPorLitro);
  if (especie === 'goldfish' || especie === 'agua-fria') {
    // Goldfish típicamente no necesita calefactor salvo invierno extremo
    watts = tempAmb < 14 ? Math.round(litros * 1.0) : 0;
  }

  const ventilador = r.max >= 28
    ? 'Recomendable: discos y amazónicos tropicales necesitan control estricto, ventilador o chiller en verano.'
    : especie === 'goldfish' || especie === 'agua-fria'
      ? 'Crítico en verano: sobre 25°C sufren. Ventilador de superficie, hielo flotante en bolsa, reducir luz.'
      : 'Ventilador de superficie (clip fan) si supera 28°C. Bajá nivel del agua 2-3 cm para evaporación.';

  const notas = especie === 'disco'
    ? 'Requieren cambios frecuentes de agua y temperatura muy estable. No mezclar con peces de rangos menores.'
    : especie === 'betta'
      ? 'No ponerlo sin calefactor bajo ningún concepto. Bajo 24°C enferma.'
      : especie === 'goldfish'
        ? 'Agua fría, NO calefactor en general. Oxígeno disuelto alto (necesitan mucha superficie).'
        : especie === 'ciclidos-africanos'
          ? 'pH alto (7.8-8.5) y dureza alta. Temperatura estable en 26°C.'
          : 'Mantener rango estable con calefactor de termostato y chequeo diario con termómetro separado.';

  return {
    tempIdealMin: r.min,
    tempIdealMax: r.max,
    calefactorWatts: watts,
    ventiladorNecesario: ventilador,
    notas,
  };
}
