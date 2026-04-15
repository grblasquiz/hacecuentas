/** Corrección de sodio por glucemia — Katz (1,6) y Hillier (2,4) */
export interface Inputs {
  sodioMedido: number;
  glucemia: number;
}
export interface Outputs {
  sodioCorregido: number;
  sodioCorregido24: number;
  detalle: string;
}

export function correccionSodioGlucemia(i: Inputs): Outputs {
  const na = Number(i.sodioMedido);
  const glu = Number(i.glucemia);

  if (!na || na < 100 || na > 180) throw new Error('Ingresá el sodio medido (100-180 mEq/L)');
  if (!glu || glu < 0) throw new Error('Ingresá la glucemia en mg/dL');

  // Solo corregir si glucemia > 100
  const exceso = Math.max(0, (glu - 100) / 100);

  // Katz (1973): +1.6 por cada 100 mg/dL sobre 100
  const correccionKatz = 1.6 * exceso;
  const naCorregidoKatz = na + correccionKatz;

  // Hillier (1999): +2.4 por cada 100 mg/dL sobre 100
  const correccionHillier = 2.4 * exceso;
  const naCorregidoHillier = na + correccionHillier;

  // Interpretación
  let interpretacion: string;
  if (naCorregidoKatz < 135) {
    interpretacion = 'Hiponatremia real (no solo dilucional). Evaluar otras causas.';
  } else if (naCorregidoKatz <= 145) {
    interpretacion = 'Sodio corregido normal — la hiponatremia era dilucional por hiperglucemia.';
  } else {
    interpretacion = 'Hipernatremia oculta — el paciente está más deshidratado de lo que parece. Rehidratación agresiva.';
  }

  const detalle =
    `Na medido: ${na} mEq/L | Glucemia: ${glu} mg/dL | ` +
    `Exceso glucosa: ${exceso.toFixed(1)} × 100 mg/dL | ` +
    `Na corregido Katz (+1,6): ${naCorregidoKatz.toFixed(1)} mEq/L | ` +
    `Na corregido Hillier (+2,4): ${naCorregidoHillier.toFixed(1)} mEq/L | ` +
    `${interpretacion}`;

  return {
    sodioCorregido: Number(naCorregidoKatz.toFixed(1)),
    sodioCorregido24: Number(naCorregidoHillier.toFixed(1)),
    detalle,
  };
}
