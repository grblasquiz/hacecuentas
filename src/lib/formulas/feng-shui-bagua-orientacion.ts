export interface Inputs { orientacion: string; }
export interface Outputs { zonaEntrada: string; zonaFondo: string; zonaCentro: string; consejo: string; }
const BAGUA: Record<string, { entrada: string; fondo: string; centro: string; consejo: string }> = {
  norte: { entrada: 'Carrera/Profesión (agua)', fondo: 'Fama/Reputación (fuego)', centro: 'Salud/Equilibrio (tierra)', consejo: 'Puerta al norte: activá la zona con fuentes de agua o espejos. El color azul potencia la carrera.' },
  sur: { entrada: 'Fama/Reputación (fuego)', fondo: 'Carrera/Profesión (agua)', centro: 'Salud/Equilibrio (tierra)', consejo: 'Puerta al sur: zona de fuego. Usá velas, luces cálidas y colores rojos o naranjas en la entrada.' },
  este: { entrada: 'Familia/Salud (madera)', fondo: 'Creatividad/Hijos (metal)', centro: 'Salud/Equilibrio (tierra)', consejo: 'Puerta al este: zona de crecimiento. Plantas verdes en la entrada activan la energía de madera.' },
  oeste: { entrada: 'Creatividad/Hijos (metal)', fondo: 'Familia/Salud (madera)', centro: 'Salud/Equilibrio (tierra)', consejo: 'Puerta al oeste: zona de creatividad. Objetos metálicos y colores blancos potencian esta zona.' },
  noreste: { entrada: 'Sabiduría/Conocimiento (tierra)', fondo: 'Relaciones/Amor (tierra)', centro: 'Salud/Equilibrio (tierra)', consejo: 'Puerta al noreste: zona de sabiduría. Ideal para biblioteca o espacio de estudio cerca de la entrada.' },
  noroeste: { entrada: 'Viajes/Mentores (metal)', fondo: 'Riqueza/Prosperidad (madera)', centro: 'Salud/Equilibrio (tierra)', consejo: 'Puerta al noroeste: zona de ayuda y viajes. Objetos de viajes o imágenes de mentores en la entrada.' },
  sureste: { entrada: 'Riqueza/Prosperidad (madera)', fondo: 'Viajes/Mentores (metal)', centro: 'Salud/Equilibrio (tierra)', consejo: 'Puerta al sureste: zona de prosperidad. Plantas de hojas redondeadas y elementos de madera en la entrada.' },
  suroeste: { entrada: 'Relaciones/Amor (tierra)', fondo: 'Sabiduría/Conocimiento (tierra)', centro: 'Salud/Equilibrio (tierra)', consejo: 'Puerta al suroeste: zona de relaciones. Objetos en pares (velas, floreros) activan el amor.' },
};
export function fengShuiBaguaOrientacion(i: Inputs): Outputs {
  const ori = String(i.orientacion || 'norte');
  const data = BAGUA[ori]; if (!data) throw new Error('Orientación no válida');
  return { zonaEntrada: data.entrada, zonaFondo: data.fondo, zonaCentro: data.centro, consejo: data.consejo };
}