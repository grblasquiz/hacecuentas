import { bebidasEventoLitrosPorPersona as f1 } from '../formulas/bebidas-evento-litros-por-persona';
import { carneAsadoKgPorPersona as f2 } from '../formulas/carne-asado-kg-por-persona';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
};
