/** Conversiones tazas a gramos por ingrediente */
export interface Inputs { ingrediente: string; tazas: number; }
export interface Outputs { gramos: number; cucharadas: number; densidad: string; consejo: string; }

const GRAMOS_TAZA: Record<string, number> = {
  harina: 125, azucar: 200, azucar_impalpable: 120, arroz: 185,
  manteca: 225, leche: 245, aceite: 220, cacao: 85,
  avena: 90, miel: 340, sal: 290, nueces: 120,
};

export function conversionesTazasGramos(i: Inputs): Outputs {
  const ingr = String(i.ingrediente || 'harina');
  const tazas = Number(i.tazas);
  if (!tazas || tazas <= 0) throw new Error('Ingresá la cantidad de tazas');
  const gPorTaza = GRAMOS_TAZA[ingr];
  if (!gPorTaza) throw new Error('Ingrediente no encontrado');

  const gramos = tazas * gPorTaza;
  const cucharadas = tazas * 16;

  return {
    gramos: Math.round(gramos),
    cucharadas: Math.round(cucharadas),
    densidad: `1 taza (240 ml) = ${gPorTaza} g`,
    consejo: ingr === 'harina' ? 'No compactes la harina en la taza: echala con cuchara y nivelá.' :
             ingr === 'manteca' ? 'Medí manteca sólida (no derretida) cuando la receta dice "taza".' :
             'Para mayor precisión, usá balanza de cocina.',
  };
}
