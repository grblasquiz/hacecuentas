/** Conversión colesterol/triglicéridos mg/dL ↔ mmol/L */
export interface Inputs {
  valor: number;
  unidadOrigen?: string;
  tipoLipido?: string;
}
export interface Outputs {
  resultado: number;
  detalle: string;
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

  return {
    resultado: Number(resultado.toFixed(2)),
    detalle,
  };
}
