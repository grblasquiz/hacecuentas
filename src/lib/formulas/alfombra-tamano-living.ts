export interface Inputs { largoLiving: number; anchoLiving: number; distribucion?: string; }
export interface Outputs { largoAlfombra: number; anchoAlfombra: number; tamanoComercial: string; regla: string; }
const TAMANOS = [[1.2, 1.8], [1.6, 2.3], [2, 3], [2.4, 3.4], [2.5, 3.5], [3, 4], [3.5, 4.5]];
export function alfombraTamanoLiving(i: Inputs): Outputs {
  const largo = Number(i.largoLiving); const ancho = Number(i.anchoLiving);
  if (!largo || !ancho) throw new Error('Ingresá las medidas del living');
  const dist = String(i.distribucion || 'clasica');
  let factor = 0.65; let regla = '';
  if (dist === 'clasica') { factor = 0.65; regla = 'La alfombra debe ser lo suficientemente grande para que las patas delanteras de todos los muebles estén sobre ella.'; }
  else if (dist === 'sofa_tv') { factor = 0.6; regla = 'La alfombra debe ir del sofá hasta antes del mueble de TV, con 30-40 cm de borde libre.'; }
  else if (dist === 'comedor') { factor = 0.7; regla = 'Debe sobresalir 60-70 cm de cada lado de la mesa para que las sillas queden adentro al retirarse.'; }
  else { factor = 0.5; regla = 'Al pie de la cama: 2/3 del largo, que sobresalga 60 cm de cada lado.'; }
  const la = Number((largo * factor).toFixed(1)); const aa = Number((ancho * factor).toFixed(1));
  const comercial = TAMANOS.reduce((prev, curr) => Math.abs(curr[0]*curr[1] - la*aa) < Math.abs(prev[0]*prev[1] - la*aa) ? curr : prev);
  return { largoAlfombra: la, anchoAlfombra: aa, tamanoComercial: `${comercial[0]} × ${comercial[1]} m`, regla };
}