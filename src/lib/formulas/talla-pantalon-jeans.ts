export interface TallaPantalonInputs { cintura: number; cadera: number; entrepierna: number; altura?: number; perfil: string; ajuste: string; unidad: string; }
export interface TallaPantalonOutputs { tallaAR: string; tallaEU: string; tallaMX: string; tallaCO: string; tallaUS: string; jeansWL: string; alfa: string; recomendacion: string; _insight?: any; }
export function tallaPantalonJeans(i: TallaPantalonInputs): TallaPantalonOutputs {
  const factor = i.unidad === 'in' ? 2.54 : 1;
  const cintura = Number(i.cintura) * factor, cadera = Number(i.cadera) * factor, entrepierna = Number(i.entrepierna) * factor;
  if (cintura < 45 || cintura > 180 || cadera < 55 || cadera > 200 || entrepierna < 45 || entrepierna > 110) throw new Error('Revisá cintura, cadera, entrepierna y unidad');
  const holgura = i.ajuste === 'holgado' ? 4 : i.ajuste === 'cenido' ? -2 : 0;
  const base = Math.max(cintura + holgura, cadera * (i.perfil === 'mujer' ? 0.78 : 0.9));
  const eu = Math.max(30, Math.min(64, Math.round((base - 62) / 2) * 2 + 34));
  const us = i.perfil === 'mujer' ? Math.max(0, Math.round((eu - 32) / 2)) : Math.round(cintura / 2.54);
  const w = Math.round(cintura / 2.54), l = Math.round(entrepierna / 2.54 / 2) * 2;
  const alfa = eu <= 34 ? 'XS' : eu <= 38 ? 'S' : eu <= 42 ? 'M' : eu <= 46 ? 'L' : eu <= 52 ? 'XL' : 'XXL';
  const recomendacion = 'Las marcas no comparten una tabla única. Si quedás entre dos talles, compará cintura, cadera y entrepierna con la ficha del producto.';
  return { tallaAR: String(eu), tallaEU: String(eu), tallaMX: String(eu), tallaCO: String(eu), tallaUS: String(us), jeansWL: `W${w}/L${l}`, alfa, recomendacion,
    _insight: { title: `Talle orientativo ${eu} · ${alfa}`, text: `Tus medidas equivalen aproximadamente a **${eu} AR/EU**, **${us} US** y jeans **W${w}/L${l}**. La recomendación incorpora un ajuste **${i.ajuste || 'regular'}**.`, tone: 'neutral', icon: '👖' } };
}
