/**
 * Ejercicio diario del perro por raza.
 */
export interface Inputs { raza: string; edad: string; }
export interface Outputs { minutosDia: number; sesiones: number; intensidad: string; tipos: string; _insight?: any; _chart?: any; }

const RAZAS: Record<string, { ejercicioMin: number; tamano: string }> = {
  'labrador-retriever': { ejercicioMin: 90, tamano: 'grande' },
  'golden-retriever': { ejercicioMin: 90, tamano: 'grande' },
  'bulldog-frances': { ejercicioMin: 30, tamano: 'pequeno' },
  'bulldog-ingles': { ejercicioMin: 30, tamano: 'mediano' },
  'pastor-aleman': { ejercicioMin: 120, tamano: 'grande' },
  'beagle': { ejercicioMin: 60, tamano: 'mediano' },
  'caniche-poodle': { ejercicioMin: 60, tamano: 'mediano' },
  'chihuahua': { ejercicioMin: 30, tamano: 'toy' },
  'rottweiler': { ejercicioMin: 90, tamano: 'grande' },
  'yorkshire-terrier': { ejercicioMin: 30, tamano: 'toy' },
  'boxer': { ejercicioMin: 90, tamano: 'grande' },
  'dachshund-salchicha': { ejercicioMin: 45, tamano: 'pequeno' },
  'husky-siberiano': { ejercicioMin: 120, tamano: 'grande' },
  'shih-tzu': { ejercicioMin: 30, tamano: 'pequeno' },
  'pitbull': { ejercicioMin: 90, tamano: 'mediano' },
};

export function ejercicioDiarioRazaPerro(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'beagle');
  const edad = String(inputs.edad || 'adulto');
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  let min = r.ejercicioMin;
  if (edad === 'cachorro') min = Math.min(min, 40);
  else if (edad === 'senior') min = Math.round(min * 0.65);

  const sesiones = min > 60 ? 2 : min > 30 ? 2 : 1;
  const intensidad = min >= 90 ? 'Alta' : min >= 60 ? 'Media' : 'Suave';
  const tipos = r.tamano === 'toy' || r.tamano === 'pequeno'
    ? 'Caminatas cortas, juegos en casa'
    : r.tamano === 'grande'
      ? 'Caminatas largas, running, juegos de cobro, agility'
      : 'Caminatas, juegos con pelota, olfato';

  // Tono dinámico: alta exigencia = warn (cuidar de cumplirla), media = good, suave = neutral.
  const tone = intensidad === 'Alta' ? 'warn' : intensidad === 'Media' ? 'good' : 'neutral';
  const edadTxt = edad === 'cachorro' ? ' (ajustado por ser cachorro)' : edad === 'senior' ? ' (reducido por ser senior)' : '';
  const insight = {
    title: 'El ejercicio diario de tu perro',
    text: `Tu ${raza.replace(/-/g, ' ')} necesita unos **${min} minutos** de ejercicio por día${edadTxt}, repartidos en **${sesiones} ${sesiones === 1 ? 'sesión' : 'sesiones'}**, con intensidad **${intensidad.toLowerCase()}**.`,
    tone,
    icon: '🐕',
  };
  // Gauge: minutos/día con las mismas zonas que la intensidad (Suave / Media / Alta).
  const chart = {
    type: 'scale',
    marker: min,
    markerLabel: min + ' min',
    min: 0,
    segments: [
      { nombre: 'Suave', max: 60, color: '#86efac', colorDark: '#4ade80' },
      { nombre: 'Media', max: 90, color: '#fde68a', colorDark: '#fbbf24' },
      { nombre: 'Alta', max: Math.max(120, min + 10), color: '#fca5a5', colorDark: '#f87171' },
    ],
    ariaLabel: `Necesidad de ejercicio de ${min} minutos por día en una escala de suave a alta`,
  };
  return { minutosDia: min, sesiones, intensidad, tipos, _insight: insight, _chart: chart };
}
