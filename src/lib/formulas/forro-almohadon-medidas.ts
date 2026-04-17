/**
 * Calculadora de forro de almohadón por medidas
 */

export interface Inputs {
  ancho: number; alto: number; tipoCierre: number; overlap: number; cantidad: number;
}

export interface Outputs {
  cortes: string; telaUnidad: string; telaTotal: string;
}

export function forroAlmohadonMedidas(inputs: Inputs): Outputs {
  const a = Number(inputs.ancho);
  const h = Number(inputs.alto);
  const tc = Math.round(Number(inputs.tipoCierre));
  const ov = Number(inputs.overlap);
  const n = Math.round(Number(inputs.cantidad));
  if (!a || !h || !tc || !n) throw new Error('Completá los campos');
  const margen = 1.5;
  let cortes = '';
  let areaUnidad = 0;
  if (tc === 1) {
    // Sobre
    const ancho = a + 2 * margen;
    const alto = h + ov + 10;
    areaUnidad = ancho * alto;
    cortes = `1 rectángulo de ${ancho.toFixed(1)} × ${alto.toFixed(1)} cm`;
  } else if (tc === 2) {
    // Cierre
    const ancho = a + 2 * margen;
    const alto = h + 2 * margen;
    areaUnidad = 2 * ancho * alto;
    cortes = `2 rectángulos de ${ancho.toFixed(1)} × ${alto.toFixed(1)} cm + cierre de ${a} cm`;
  } else {
    // Botones
    const ancho = a + 2 * margen;
    const alto = h + 2 * margen;
    const altoPanel = h / 2 + 5 + margen;
    areaUnidad = ancho * alto + 2 * ancho * altoPanel;
    cortes = `1 panel frontal ${ancho.toFixed(1)} × ${alto.toFixed(1)} + 2 panels ${ancho.toFixed(1)} × ${altoPanel.toFixed(1)}`;
  }
  const areaTotal = areaUnidad * n / 10000; // m²
  const metrosTela = areaTotal / 1.40 * 1.10; // Tela 140 cm, 10% margen
  return {
    cortes: cortes,
    telaUnidad: `${(areaUnidad / 10000).toFixed(3)} m² por funda`,
    telaTotal: `${areaTotal.toFixed(2)} m² total → ${metrosTela.toFixed(2)} m de tela 140 cm`,
  };
}
