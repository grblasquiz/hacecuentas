/** Conversión colesterol/triglicéridos mg/dL ↔ mmol/L */
export interface Inputs {
  valor: number;
  unidadOrigen?: string;
  tipoLipido?: string;
}
export interface Outputs {
  resultado: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function conversionColesterolMgMmol(i: Inputs): Outputs {
  const valor = Number(i.valor);
  const unidad = String(i.unidadOrigen || 'mg');
  const tipo = String(i.tipoLipido || 'colesterol');

  if (valor < 0) throw new Error('El valor debe ser positivo');
  if (valor === 0) throw new Error('Ingresá un valor a convertir');

  // Factores de conversión
  const factorCol = 38.67; // mg/dL per mmol/L for cholesterol
  const factorTg = 88.57; // mg/dL per mmol/L for triglycerides
  const factor = tipo === 'trigliceridos' ? factorTg : factorCol;
  const tipoLabel = tipo === 'trigliceridos' ? 'Triglicéridos' : 'Colesterol';

  let resultado: number;
  let unidadDestino: string;
  let unidadOrigenLabel: string;

  if (unidad === 'mg') {
    resultado = valor / factor;
    unidadOrigenLabel = 'mg/dL';
    unidadDestino = 'mmol/L';
  } else {
    resultado = valor * factor;
    unidadOrigenLabel = 'mmol/L';
    unidadDestino = 'mg/dL';
  }

  // Clasificación para colesterol total en mg/dL
  let clasificacion = '';
  if (tipo === 'colesterol') {
    const mgVal = unidad === 'mg' ? valor : resultado;
    if (mgVal < 200) clasificacion = 'Deseable (<200 mg/dL)';
    else if (mgVal < 240) clasificacion = 'Limítrofe alto (200-239 mg/dL)';
    else clasificacion = 'Alto (≥240 mg/dL)';
  } else {
    const mgVal = unidad === 'mg' ? valor : resultado;
    if (mgVal < 150) clasificacion = 'Normal (<150 mg/dL)';
    else if (mgVal < 200) clasificacion = 'Limítrofe alto (150-199 mg/dL)';
    else if (mgVal < 500) clasificacion = 'Alto (200-499 mg/dL)';
    else clasificacion = 'Muy alto (≥500 mg/dL)';
  }

  const detalle =
    `${tipoLabel}: ${valor} ${unidadOrigenLabel} = ${resultado.toFixed(2)} ${unidadDestino} | ` +
    `Factor: ${tipo === 'trigliceridos' ? '÷ 88,57' : '÷ 38,67'} | ` +
    `Referencia: ${clasificacion}.`;

  // Valor en mg/dL para clasificar (sea cual sea la unidad de entrada)
  const mgVal = unidad === 'mg' ? valor : resultado;

  // Tono dinámico según la clasificación clínica
  const esBueno = (tipo === 'colesterol' && mgVal < 200) || (tipo === 'trigliceridos' && mgVal < 150);
  const esLimitrofe = (tipo === 'colesterol' && mgVal >= 200 && mgVal < 240) || (tipo === 'trigliceridos' && mgVal >= 150 && mgVal < 200);
  const tone: 'good' | 'warn' | 'neutral' = esBueno ? 'good' : esLimitrofe ? 'neutral' : 'warn';

  const _insight = {
    title: 'Cómo se interpreta',
    text: `**${valor} ${unidadOrigenLabel}** de ${tipoLabel.toLowerCase()} equivalen a **${resultado.toFixed(2)} ${unidadDestino}**. Según las guías, ese valor (**${mgVal.toFixed(0)} mg/dL**) se clasifica como **${clasificacion}**.`,
    tone,
    icon: '🩺',
  };

  // Gauge con los umbrales clínicos en mg/dL (distintos para colesterol vs triglicéridos)
  const segments = tipo === 'trigliceridos'
    ? [
        { nombre: 'Normal', max: 150, color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Limítrofe', max: 200, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Alto', max: 500, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Muy alto', max: Math.max(700, Math.ceil(mgVal * 1.1)), color: '#ef4444', colorDark: '#f87171' },
      ]
    : [
        { nombre: 'Deseable', max: 200, color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Limítrofe', max: 240, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Alto', max: Math.max(320, Math.ceil(mgVal * 1.1)), color: '#ef4444', colorDark: '#f87171' },
      ];

  const _chart = {
    type: 'scale',
    marker: Math.round(mgVal),
    markerLabel: `${Math.round(mgVal)} mg/dL`,
    min: 0,
    segments,
    ariaLabel: `Nivel de ${tipoLabel.toLowerCase()}: ${Math.round(mgVal)} mg/dL, clasificado como ${clasificacion}`,
  };

  return {
    resultado: Number(resultado.toFixed(2)),
    detalle,
    _insight,
    _chart,
  };
}
