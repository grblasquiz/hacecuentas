/** Poda: frecuencia y época por especie */
export interface Inputs { especie: string; edadAnios: number; }
export interface Outputs { frecuencia: string; mejorEpoca: string; tipoPoda: string; consejo: string; _insight?: any; }

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
  let fase = 'mantenimiento';
  if (edad <= 3) { tipoPoda = 'Formación (dar estructura al árbol joven)'; fase = 'formación'; }
  else if (edad > 20) { tipoPoda = 'Rejuvenecimiento (renovar ramas productivas)'; fase = 'rejuvenecimiento'; }
  else { tipoPoda = 'Producción/Mantenimiento'; fase = 'producción'; }

  const _insight = {
    title: 'Tu plan de poda',
    text: fase === 'formación'
      ? `Con **${edad} año${edad === 1 ? '' : 's'}** estás en plena **poda de formación**: ahora definís la estructura que el árbol tendrá toda su vida. La mejor ventana es **${data.epoca}**, con cadencia **${data.freq.toLowerCase()}**.`
      : fase === 'rejuvenecimiento'
      ? `A los **${edad} años** conviene una **poda de rejuvenecimiento** para renovar ramas productivas y recuperar vigor. Hacela en **${data.epoca}** respetando la frecuencia **${data.freq.toLowerCase()}**.`
      : `A los **${edad} años** el árbol ya está formado: toca **poda de producción/mantenimiento** en **${data.epoca}**, con cadencia **${data.freq.toLowerCase()}**.`,
    tone: 'good',
    icon: '🌳',
  };

  return { frecuencia: data.freq, mejorEpoca: data.epoca, tipoPoda, consejo: data.consejo, _insight };
}
