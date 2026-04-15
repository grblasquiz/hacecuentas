/** Calculadora de agua y sal para cocinar pasta */
export interface Inputs {
  gramosPasta: number;
  tipoPasta?: string;
}
export interface Outputs {
  litrosAgua: number;
  gramosSal: number;
  tamanoOlla: string;
  detalle: string;
}

export function aguaPastaLitrosGramos(i: Inputs): Outputs {
  const gramos = Number(i.gramosPasta);
  const tipo = i.tipoPasta || 'seca';

  if (!gramos || gramos <= 0) throw new Error('Ingresá los gramos de pasta');

  // Litros por 100 g
  let litrosPor100g = 1.0;
  if (tipo === 'fresca') litrosPor100g = 0.8;
  if (tipo === 'rellena') litrosPor100g = 1.2; // Más espacio para que no se rompan

  const litros = (gramos / 100) * litrosPor100g;
  const sal = litros * 10; // 10 g por litro

  // Olla: agua + 40% de margen
  const ollaLitros = Math.ceil(litros * 1.4);

  const tipoNombre = tipo === 'fresca' ? 'fresca' : tipo === 'rellena' ? 'rellena' : 'seca';
  const cucharadasSal = (sal / 20).toFixed(1); // 1 cucharada ~20g de sal gruesa

  return {
    litrosAgua: Number(litros.toFixed(1)),
    gramosSal: Math.round(sal),
    tamanoOlla: `${ollaLitros} litros mínimo`,
    detalle: `Para ${gramos} g de pasta ${tipoNombre}: ${litros.toFixed(1)} litros de agua + ${Math.round(sal)} g de sal (~${cucharadasSal} cucharadas de sal gruesa). Olla de al menos ${ollaLitros} litros.`,
  };
}
