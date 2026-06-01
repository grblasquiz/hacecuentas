/** Corrección de sodio por glucemia — Katz (1,6) y Hillier (2,4) */
export interface Inputs {
  sodioMedido: number;
  glucemia: number;
}
export interface Outputs {
  sodioCorregido: number;
  sodioCorregido24: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
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

  const naKatz = Number(naCorregidoKatz.toFixed(1));
  const chart = {
    type: 'scale' as const,
    marker: naKatz,
    markerLabel: 'Na corregido (Katz): ' + naKatz.toFixed(1) + ' mEq/L',
    min: Math.min(120, Math.floor(naKatz) - 5),
    unit: ' mEq/L',
    segments: [
      { nombre: 'Hiponatremia', max: 135, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Normal', max: 145, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Hipernatremia', max: Math.max(160, Math.ceil(naKatz) + 5), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de sodio corregido: hiponatremia, normal e hipernatremia',
  };

  // Insight clínico: interpreta la zona del sodio corregido (Katz)
  let insight: any;
  if (naCorregidoKatz < 135) {
    insight = {
      title: 'Hiponatremia real',
      text: `El sodio corregido es **${naKatz.toFixed(1)} mEq/L**, por debajo de 135 aun descontando la glucemia: no es solo dilucional. Buscá otras causas de hiponatremia.`,
      tone: 'warn' as const,
      icon: '🩸',
    };
  } else if (naCorregidoKatz <= 145) {
    insight = {
      title: 'Sodio corregido normal',
      text: `Corregido por glucemia da **${naKatz.toFixed(1)} mEq/L** (rango normal): la hiponatremia que veías era **dilucional** por la hiperglucemia, no un déficit real de sodio.`,
      tone: 'good' as const,
      icon: '✅',
    };
  } else {
    insight = {
      title: 'Hipernatremia oculta',
      text: `El corregido sube a **${naKatz.toFixed(1)} mEq/L**: el paciente está **más deshidratado** de lo que sugiere el sodio medido. Considerá rehidratación.`,
      tone: 'warn' as const,
      icon: '⚠️',
    };
  }

  return {
    sodioCorregido: naKatz,
    sodioCorregido24: Number(naCorregidoHillier.toFixed(1)),
    detalle,
    _chart: chart,
    _insight: insight,
  };
}
