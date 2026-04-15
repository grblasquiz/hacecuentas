/** Calorías aproximadas de un plato por macronutrientes */
export interface Inputs { gramosProteina: number; gramosCarbs: number; gramosGrasa: number; porciones: number; }
export interface Outputs { caloriasTotales: number; caloriasPorPorcion: number; distribucion: string; detalle: string; }

export function caloriasReceta(i: Inputs): Outputs {
  const prot = Number(i.gramosProteina) || 0;
  const carbs = Number(i.gramosCarbs) || 0;
  const grasa = Number(i.gramosGrasa) || 0;
  const porc = Number(i.porciones);

  if (prot < 0 || carbs < 0 || grasa < 0) throw new Error('Los valores no pueden ser negativos');
  if (!porc || porc <= 0) throw new Error('Ingresá la cantidad de porciones');
  if (prot === 0 && carbs === 0 && grasa === 0) throw new Error('Ingresá al menos un macronutriente');

  const calProt = prot * 4;
  const calCarbs = carbs * 4;
  const calGrasa = grasa * 9;
  const total = calProt + calCarbs + calGrasa;
  const porPorcion = total / porc;

  const pctProt = total > 0 ? ((calProt / total) * 100).toFixed(0) : '0';
  const pctCarbs = total > 0 ? ((calCarbs / total) * 100).toFixed(0) : '0';
  const pctGrasa = total > 0 ? ((calGrasa / total) * 100).toFixed(0) : '0';

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    caloriasTotales: Math.round(total),
    caloriasPorPorcion: Math.round(porPorcion),
    distribucion: `Proteína: ${pctProt}% (${fmt.format(calProt)} kcal) | Carbs: ${pctCarbs}% (${fmt.format(calCarbs)} kcal) | Grasa: ${pctGrasa}% (${fmt.format(calGrasa)} kcal)`,
    detalle: `Total: ${fmt.format(total)} kcal en ${porc} porciones = ${fmt.format(porPorcion)} kcal/porción. Macros: ${fmt.format(prot)} g prot, ${fmt.format(carbs)} g carbs, ${fmt.format(grasa)} g grasa.`,
  };
}
