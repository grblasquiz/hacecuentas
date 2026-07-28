import { bebidasEventoLitrosPorPersona as f1 } from '../formulas/bebidas-evento-litros-por-persona';
import { carneAsadoKgPorPersona as f2 } from '../formulas/carne-asado-kg-por-persona';
import { maratonSerieTiempo as f3 } from '../formulas/maraton-serie-tiempo';
import { propinasCompleta as f4 } from '../formulas/propinas-completa';
import { splitGastosGrupoAmigos as f5 } from '../formulas/split-gastos-grupo-amigos';
import { compute as f6 } from '../formulas/conversion-medidas-cocina-tazas-gramos';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
  c6: f6,
};
