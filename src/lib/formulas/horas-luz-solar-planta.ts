/** Horas de luz solar necesarias por planta */
export interface Inputs {
  especie: string;
  horasDisponibles: number;
}
export interface Outputs {
  horasNecesarias: string;
  categoriaLuz: string;
  compatible: string;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

interface LuzData { min: number; max: number; categoria: string; }

const ESPECIES: Record<string, LuzData> = {
  tomate: { min: 6, max: 8, categoria: 'Sol pleno' },
  lechuga: { min: 3, max: 5, categoria: 'Media sombra' },
  pimiento: { min: 6, max: 8, categoria: 'Sol pleno' },
  albahaca: { min: 6, max: 8, categoria: 'Sol pleno' },
  espinaca: { min: 3, max: 5, categoria: 'Media sombra' },
  zanahoria: { min: 4, max: 6, categoria: 'Sol parcial' },
  menta: { min: 2, max: 4, categoria: 'Sombra tolerante' },
  perejil: { min: 3, max: 5, categoria: 'Media sombra' },
  zapallo: { min: 6, max: 8, categoria: 'Sol pleno' },
  frutilla: { min: 5, max: 7, categoria: 'Sol pleno' },
  maiz: { min: 6, max: 10, categoria: 'Sol pleno' },
  berenjena: { min: 6, max: 8, categoria: 'Sol pleno' },
  cebolla: { min: 5, max: 7, categoria: 'Sol parcial' },
  acelga: { min: 3, max: 5, categoria: 'Media sombra' },
  rucula: { min: 3, max: 5, categoria: 'Media sombra' },
  romero: { min: 6, max: 8, categoria: 'Sol pleno' },
};

export function horasLuzSolarPlanta(i: Inputs): Outputs {
  const especie = String(i.especie || 'tomate');
  const hDisp = Number(i.horasDisponibles);
  if (hDisp < 0) throw new Error('Las horas de sol no pueden ser negativas');

  const data = ESPECIES[especie];
  if (!data) throw new Error('Especie no encontrada');

  const esCompatible = hDisp >= data.min;
  const esIdeal = hDisp >= data.min && hDisp <= data.max + 2;
  let recomendacion = '';
  if (hDisp < data.min) {
    const faltan = data.min - hDisp;
    recomendacion = `Tu espacio tiene ${faltan} hs menos de las necesarias. Considerá plantar algo de media sombra o usar luz artificial complementaria.`;
  } else if (esIdeal) {
    recomendacion = `Tu espacio es ideal para esta planta. Va a crecer bien con ${hDisp} horas de sol.`;
  } else {
    recomendacion = `Tu espacio tiene suficiente sol. En verano, protegé con media sombra en las horas pico (12-15hs) si ves hojas quemadas.`;
  }

  const _insight = {
    title: esCompatible ? 'Tu espacio sirve para esta planta' : 'Te falta sol para esta planta',
    text: esCompatible
      ? `Con **${hDisp} h** de sol cubrís la necesidad de **${data.min}–${data.max} h/día** de esta especie (${data.categoria.toLowerCase()}).`
      : `Tenés **${hDisp} h** de sol y esta planta necesita al menos **${data.min} h/día**: te faltan **${(data.min - hDisp).toFixed(1)} h**. Mejor elegí algo de media sombra o sumá luz artificial.`,
    tone: esCompatible ? 'good' : 'warn',
    icon: '🌱',
  };

  const topeEscala = Math.max(data.max + 4, Math.ceil(hDisp) + 1);
  const _chart = {
    type: 'scale',
    marker: Number(hDisp.toFixed(1)),
    markerLabel: `${Number(hDisp.toFixed(1)).toLocaleString('es-AR')} h`,
    min: 0,
    segments: [
      { nombre: 'Insuficiente', max: data.min, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Ideal', max: data.max, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'De más', max: topeEscala, color: '#f59e0b', colorDark: '#d97706' },
    ],
    ariaLabel: 'Escala de horas de sol disponibles frente al rango ideal de la especie',
  };

  return {
    horasNecesarias: `${data.min}–${data.max} horas/día`,
    categoriaLuz: data.categoria,
    compatible: esCompatible ? 'Sí, tu espacio es compatible' : 'No, necesitás más horas de sol',
    recomendacion,
    _insight,
    _chart,
  };
}
