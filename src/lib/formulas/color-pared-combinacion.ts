/** Combinación de colores para paredes */
export interface Inputs { colorBase: string; ambiente?: string; }
export interface Outputs { complementario: string; analogos: string; acento: string; consejo: string; }

interface ColorData { comp: string; analogos: string; acento: string; }
const COLORES: Record<string, ColorData> = {
  blanco: { comp: 'Negro (grafito)', analogos: 'Gris perla, Marfil, Crema', acento: 'Cualquier color saturado — el blanco es la base universal' },
  gris: { comp: 'Amarillo mostaza', analogos: 'Blanco, Grafito, Greige', acento: 'Amarillo, Rosa empolvado o Azul petróleo' },
  beige: { comp: 'Azul grisáceo', analogos: 'Arena, Marfil, Tostado', acento: 'Verde salvia, Terracota o Azul denim' },
  azul: { comp: 'Naranja / Terracota', analogos: 'Verde azulado, Violeta azul, Celeste', acento: 'Naranja quemado, Dorado o Blanco' },
  verde: { comp: 'Rojo / Borgoña', analogos: 'Verde azulado, Verde lima, Oliva', acento: 'Rosa, Mostaza o Cobre' },
  amarillo: { comp: 'Violeta', analogos: 'Naranja claro, Verde lima, Dorado', acento: 'Gris, Azul marino o Blanco' },
  rojo: { comp: 'Verde', analogos: 'Naranja, Borgoña, Rosa', acento: 'Gris, Blanco o Dorado' },
  naranja: { comp: 'Azul', analogos: 'Amarillo, Rojo, Terracota', acento: 'Azul petróleo, Gris o Crema' },
  violeta: { comp: 'Amarillo', analogos: 'Rosa, Azul, Lavanda', acento: 'Dorado, Verde menta o Gris' },
  rosa: { comp: 'Verde menta', analogos: 'Lavanda, Salmón, Melocotón', acento: 'Verde salvia, Gris o Dorado' },
  marron: { comp: 'Azul cielo', analogos: 'Terracota, Ocre, Arena', acento: 'Turquesa, Crema o Verde oliva' },
  negro: { comp: 'Blanco', analogos: 'Grafito, Gris oscuro, Antracita', acento: 'Dorado, Blanco puro o Rojo' },
};

const CONSEJOS_AMB: Record<string, string> = {
  living: 'Para el living usá el color base en la pared principal y neutros en las demás. El acento va en almohadones, cuadros o una pared focal.',
  dormitorio: 'En el dormitorio optá por tonos suaves del color elegido. Evitá saturación alta que dificulte el descanso.',
  cocina: 'La cocina tolera colores más vivos. El color de acento queda bien en la pared detrás de la mesada o en los muebles.',
  bano: 'En baños chicos, usá el color más claro de la paleta. El color de acento va bien en toallas y accesorios.',
  escritorio: 'Para el escritorio, colores que favorezcan la concentración: azules, verdes o grises. Evitá rojos y naranjas intensos.',
  infantil: 'Para niños, combiná pasteles con un color vivo de acento. Evitá saturar todo el cuarto con colores fuertes.',
};

export function colorParedCombinacion(i: Inputs): Outputs {
  const color = String(i.colorBase || 'azul');
  const amb = String(i.ambiente || 'living');
  const data = COLORES[color];
  if (!data) throw new Error('Color no encontrado');

  return {
    complementario: data.comp,
    analogos: data.analogos,
    acento: data.acento,
    consejo: CONSEJOS_AMB[amb] || 'Usá el color base como dominante y el acento en detalles decorativos.',
  };
}
