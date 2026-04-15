/** Frecuencia óptima de publicación por red social */
export interface FrecuenciaPublicacionInputs {
  red?: string;
  objetivo?: string;
  recursosSemana: number;
}
export interface FrecuenciaPublicacionOutputs {
  publicacionesSemana: number;
  mejoresHorarios: string;
  tipoContenido: string;
  detalle: string;
}

interface RedConfig {
  nombre: string;
  minSemana: number;
  idealSemana: number;
  horasPromPorPost: number;
  horarios: string;
  contenido: Record<string, string>;
}

const REDES: Record<string, RedConfig> = {
  instagram: {
    nombre: 'Instagram',
    minSemana: 3,
    idealSemana: 5,
    horasPromPorPost: 1.5,
    horarios: 'Martes a viernes 11-13 hs y 19-21 hs',
    contenido: {
      awareness: 'Reels cortos (15-30s), Stories con hashtags, colaboraciones',
      engagement: 'Carruseles educativos, encuestas en Stories, Reels con CTA de guardado',
      conversion: 'Testimonios, demos de producto, Stories con link y ofertas con deadline',
    },
  },
  facebook: {
    nombre: 'Facebook',
    minSemana: 3,
    idealSemana: 5,
    horasPromPorPost: 1,
    horarios: 'Miércoles a viernes 12-14 hs',
    contenido: {
      awareness: 'Videos cortos, posts con imagen llamativa, eventos',
      engagement: 'Preguntas, encuestas, contenido nostálgico, lives',
      conversion: 'Ofertas con link, Lead Ads, catálogo de productos',
    },
  },
  twitter: {
    nombre: 'Twitter / X',
    minSemana: 15,
    idealSemana: 25,
    horasPromPorPost: 0.3,
    horarios: 'Lunes a viernes 8-10 hs y 12-13 hs',
    contenido: {
      awareness: 'Threads informativos, retweets con opinión, trending topics',
      engagement: 'Encuestas, preguntas directas, memes relevantes, debates',
      conversion: 'Links con copy persuasivo, threads con CTA final',
    },
  },
  linkedin: {
    nombre: 'LinkedIn',
    minSemana: 2,
    idealSemana: 4,
    horasPromPorPost: 1.5,
    horarios: 'Martes a jueves 8-10 hs y 17-18 hs',
    contenido: {
      awareness: 'Artículos de liderazgo, logros de empresa, tendencias de industria',
      engagement: 'Historias personales, lecciones aprendidas, encuestas profesionales',
      conversion: 'Casos de éxito, demostraciones, webinars, ofertas laborales',
    },
  },
  tiktok: {
    nombre: 'TikTok',
    minSemana: 3,
    idealSemana: 6,
    horasPromPorPost: 2,
    horarios: 'Todos los días 19-22 hs, fines de semana 12-15 hs',
    contenido: {
      awareness: 'Trends adaptados a tu marca, behind the scenes, challenges',
      engagement: 'Duets, respuestas a comentarios en video, tutorials rápidos',
      conversion: 'Reviews de producto, unboxings, ofertas exclusivas para TikTok',
    },
  },
  youtube: {
    nombre: 'YouTube',
    minSemana: 1,
    idealSemana: 2,
    horasPromPorPost: 6,
    horarios: 'Publicar jueves 17 hs para pico viernes-domingo',
    contenido: {
      awareness: 'Tutoriales, listas de tips, vlogs de marca',
      engagement: 'Q&A, reacciones, colaboraciones con otros canales',
      conversion: 'Comparativas de producto, testimonios largos, webinars grabados',
    },
  },
};

export function frecuenciaPublicacion(inputs: FrecuenciaPublicacionInputs): FrecuenciaPublicacionOutputs {
  const redKey = String(inputs.red || 'instagram');
  const objetivo = String(inputs.objetivo || 'engagement');
  const horas = Number(inputs.recursosSemana);

  if (!horas || horas <= 0) throw new Error('Ingresá las horas semanales disponibles');
  if (!REDES[redKey]) throw new Error('Red social no válida');

  const red = REDES[redKey];
  const maxPosts = Math.floor(horas / red.horasPromPorPost);
  const publicaciones = Math.max(red.minSemana, Math.min(maxPosts, red.idealSemana * 2));
  const contenido = red.contenido[objetivo] || red.contenido.engagement;

  return {
    publicacionesSemana: publicaciones,
    mejoresHorarios: red.horarios,
    tipoContenido: contenido,
    detalle: `${red.nombre} con objetivo ${objetivo} y ${horas} hs/semana → ${publicaciones} publicaciones/semana. Horarios: ${red.horarios}. Contenido recomendado: ${contenido}.`,
  };
}
