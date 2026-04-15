/** Anion Gap: detección de acidosis metabólica a partir de Na, Cl, HCO3 */
export interface Inputs {
  sodio: number;
  cloro: number;
  bicarbonato: number;
  potasio?: number;
  albumina?: number;
}
export interface Outputs {
  anionGap: number;
  anionGapCorregido: number;
  categoria: string;
  interpretacion: string;
  rangoNormal: string;
  requiereAtencion: boolean;
  resumen: string;
}

export function anionGapElectrolitos(i: Inputs): Outputs {
  const na = Number(i.sodio);
  const cl = Number(i.cloro);
  const hco3 = Number(i.bicarbonato);
  const k = Number(i.potasio) || 0;
  const alb = Number(i.albumina) || 0;

  if (!na || na < 100 || na > 180) throw new Error('Ingresá sodio válido (100-180 mEq/L)');
  if (!cl || cl < 70 || cl > 140) throw new Error('Ingresá cloro válido (70-140 mEq/L)');
  if (!hco3 || hco3 < 2 || hco3 > 50) throw new Error('Ingresá bicarbonato válido (2-50 mEq/L)');

  // Fórmula clásica: AG = (Na + K) - (Cl + HCO3); a veces sólo Na
  const ag = k > 0 ? (na + k) - (cl + hco3) : na - (cl + hco3);

  // Corrección por albúmina (si se conoce)
  // Por cada 1 g/dL debajo de 4, sumar 2.5 al AG
  let agCorr = ag;
  if (alb > 0 && alb < 4) {
    agCorr = ag + 2.5 * (4 - alb);
  }

  const rangoNormal = k > 0 ? '10-16 mEq/L' : '8-12 mEq/L';
  const limMin = k > 0 ? 10 : 8;
  const limMax = k > 0 ? 16 : 12;

  let categoria = '';
  let interpretacion = '';
  let requiereAtencion = false;

  if (ag < limMin) {
    categoria = 'Anion gap bajo';
    interpretacion = 'Puede verse en hipoalbuminemia (causa más común), mieloma múltiple, hipermagnesemia.';
  } else if (ag <= limMax) {
    categoria = 'Anion gap normal ✅';
    if (hco3 < 22) {
      interpretacion = 'Acidosis metabólica con AG normal (hiperclorémica): diarrea, acidosis tubular renal, RTA.';
      requiereAtencion = true;
    } else {
      interpretacion = 'Sin evidencia de acidosis con AG elevado.';
    }
  } else if (ag <= 20) {
    categoria = 'Anion gap levemente elevado';
    interpretacion = 'Considerar causas (MUDPILES): metformina, uremia, cetoacidosis, aspirina, lactacidosis.';
    requiereAtencion = true;
  } else {
    categoria = 'Anion gap muy elevado';
    interpretacion = 'Acidosis metabólica con AG aumentado. Causas graves: cetoacidosis diabética, acidosis láctica, intoxicación. Urgente.';
    requiereAtencion = true;
  }

  return {
    anionGap: Number(ag.toFixed(1)),
    anionGapCorregido: Number(agCorr.toFixed(1)),
    categoria,
    interpretacion,
    rangoNormal,
    requiereAtencion,
    resumen: `Anion gap: ${ag.toFixed(1)} mEq/L (normal ${rangoNormal}). ${categoria}. ${interpretacion}`,
  };
}
