/** Multiplicar/dividir receta por cantidad de porciones */
export interface Inputs {
  porcionesOriginal: number;
  porcionesDeseadas: number;
  ingredientes: string; // "harina: 200, azucar: 100, huevos: 3"
}
export interface Outputs {
  factor: number;
  porcionesOriginal: number;
  porcionesDeseadas: number;
  ingredientesAjustados: string;
  advertencia: string;
}

export function multiplicarReceta(i: Inputs): Outputs {
  const orig = Number(i.porcionesOriginal);
  const des = Number(i.porcionesDeseadas);
  const ing = String(i.ingredientes || '').trim();
  if (!orig || orig <= 0) throw new Error('Porciones originales inválidas');
  if (!des || des <= 0) throw new Error('Porciones deseadas inválidas');

  const factor = des / orig;

  // Parsear: "harina: 200g, azúcar: 100 g, huevos: 3 unidades"
  const lines = ing.split(/\n|,(?=[^0-9])/).map(s => s.trim()).filter(Boolean);
  const ajustados: string[] = [];

  for (const line of lines) {
    // Match número (con posible decimal) en la línea
    const m = line.match(/([\d.,]+)\s*([a-zA-Z]*)/);
    if (m) {
      const cant = parseFloat(m[1].replace(',', '.'));
      const unidad = m[2] || '';
      const nueva = (cant * factor);
      const formateado = nueva % 1 === 0 ? nueva.toFixed(0) : nueva.toFixed(2);
      const nuevaLine = line.replace(/([\d.,]+)\s*([a-zA-Z]*)/, `${formateado} ${unidad}`.trim());
      ajustados.push(nuevaLine);
    } else {
      ajustados.push(line + ' (sin número detectado)');
    }
  }

  let adv = '';
  if (factor > 3) adv = 'Factor >3x: verificá que la cocción y los moldes sean adecuados.';
  else if (factor < 0.33) adv = 'Factor muy chico: algunos ingredientes (huevos, levadura) pueden perder precisión.';

  return {
    factor: Number(factor.toFixed(4)),
    porcionesOriginal: orig,
    porcionesDeseadas: des,
    ingredientesAjustados: ajustados.join('\n'),
    advertencia: adv,
  };
}
