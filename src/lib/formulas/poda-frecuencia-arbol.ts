/** Poda: frecuencia y época por especie */
export interface Inputs { especie: string; edadAnios: number; }
export interface Outputs { frecuencia: string; mejorEpoca: string; tipoPoda: string; consejo: string; }

interface PodaData { freq: string; epoca: string; consejo: string; }
const ESPECIES: Record<string, PodaData> = {
  limonero: { freq: 'Anual (poda ligera)', epoca: 'Febrero–Marzo (post-cosecha)', consejo: 'Sacá chupones, ramas secas y aclará el interior. No podes más del 20%.' },
  durazno: { freq: 'Anual', epoca: 'Julio–Agosto (reposo invernal)', consejo: 'Poda en vaso abierto. Eliminá ramas que crecen hacia adentro.' },
  manzano: { freq: 'Anual', epoca: 'Julio–Agosto', consejo: 'Poda de fructificación: acortá ramas del año dejando 4-5 yemas.' },
  peral: { freq: 'Anual', epoca: 'Julio–Agosto', consejo: 'Similar al manzano. El peral tolera menos poda que el manzano.' },
  olivo: { freq: 'Cada 2 años', epoca: 'Febrero–Marzo (post-cosecha)', consejo: 'Aclareo interior, no poda drástica. El olivo fructifica en ramas de 2 años.' },
  vid: { freq: 'Anual', epoca: 'Julio (reposo total)', consejo: 'Poda de producción: dejá 2 sarmientos de 6-8 yemas por brazo.' },
  rosal: { freq: 'Anual + limpieza en temporada', epoca: 'Julio (poda fuerte)', consejo: 'Dejá 3-5 yemas por rama. Cortá 1 cm arriba de la yema orientada hacia afuera.' },
  ornamental_caduco: { freq: 'Cada 2–3 años', epoca: 'Junio–Agosto (sin hojas)', consejo: 'Solo poda de mantenimiento: ramas secas, cruzadas y chupones.' },
  ornamental_perenne: { freq: 'Cada 2–3 años', epoca: 'Marzo–Abril (fin de verano)', consejo: 'Poda ligera de forma. Los perennes no toleran podas drásticas.' },
  higuera: { freq: 'Anual', epoca: 'Julio–Agosto', consejo: 'Aclará ramas viejas y chupones. La higuera rebrota muy fuerte.' },
};

export function podaFrecuenciaArbol(i: Inputs): Outputs {
  const especie = String(i.especie || 'limonero');
  const edad = Number(i.edadAnios);
  if (!edad || edad <= 0) throw new Error('Ingresá la edad del árbol');
  const data = ESPECIES[especie];
  if (!data) throw new Error('Especie no encontrada');

  let tipoPoda = 'Mantenimiento';
  if (edad <= 3) tipoPoda = 'Formación (dar estructura al árbol joven)';
  else if (edad > 20) tipoPoda = 'Rejuvenecimiento (renovar ramas productivas)';
  else tipoPoda = 'Producción/Mantenimiento';

  return { frecuencia: data.freq, mejorEpoca: data.epoca, tipoPoda, consejo: data.consejo };
}
