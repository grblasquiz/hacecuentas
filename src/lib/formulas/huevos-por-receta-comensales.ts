/** Huevos y resto de ingredientes escalados por receta y comensales */
export interface Inputs {
  receta: string; // 'tortilla_espanola' | 'budin_ingles' | 'flan' | 'tarta_queso' | 'pancakes' | 'huevos_revueltos'
  comensales: number;
}

interface RecetaBase {
  nombre: string;
  baseComensales: number;
  huevos: number;
  otros: Record<string, { cantidad: number; unidad: string; nombre: string }>;
}

const RECETAS: Record<string, RecetaBase> = {
  tortilla_espanola: {
    nombre: 'Tortilla española',
    baseComensales: 4,
    huevos: 6,
    otros: {
      papa: { cantidad: 800, unidad: 'g', nombre: 'papas' },
      cebolla: { cantidad: 1, unidad: 'u', nombre: 'cebolla mediana' },
      aceiteOliva: { cantidad: 250, unidad: 'ml', nombre: 'aceite de oliva' },
      sal: { cantidad: 1, unidad: 'cdita', nombre: 'sal' },
    },
  },
  budin_ingles: {
    nombre: 'Budín inglés',
    baseComensales: 8,
    huevos: 3,
    otros: {
      harina: { cantidad: 250, unidad: 'g', nombre: 'harina 0000' },
      manteca: { cantidad: 150, unidad: 'g', nombre: 'manteca' },
      azucar: { cantidad: 150, unidad: 'g', nombre: 'azúcar' },
      frutasSecas: { cantidad: 150, unidad: 'g', nombre: 'frutas secas/abrillantadas' },
      polvoHornear: { cantidad: 10, unidad: 'g', nombre: 'polvo para hornear' },
    },
  },
  flan: {
    nombre: 'Flan casero',
    baseComensales: 6,
    huevos: 6,
    otros: {
      leche: { cantidad: 1, unidad: 'L', nombre: 'leche entera' },
      azucar: { cantidad: 200, unidad: 'g', nombre: 'azúcar' },
      esenciaVainilla: { cantidad: 1, unidad: 'cdita', nombre: 'esencia de vainilla' },
      caramelo: { cantidad: 150, unidad: 'g', nombre: 'azúcar para caramelo' },
    },
  },
  tarta_queso: {
    nombre: 'Tarta de queso (cheesecake)',
    baseComensales: 8,
    huevos: 3,
    otros: {
      queso: { cantidad: 600, unidad: 'g', nombre: 'queso crema' },
      azucar: { cantidad: 150, unidad: 'g', nombre: 'azúcar' },
      galletitas: { cantidad: 200, unidad: 'g', nombre: 'galletitas (base)' },
      manteca: { cantidad: 80, unidad: 'g', nombre: 'manteca (base)' },
      cremaLeche: { cantidad: 200, unidad: 'ml', nombre: 'crema de leche' },
    },
  },
  pancakes: {
    nombre: 'Pancakes',
    baseComensales: 4,
    huevos: 2,
    otros: {
      harina: { cantidad: 200, unidad: 'g', nombre: 'harina 0000' },
      leche: { cantidad: 300, unidad: 'ml', nombre: 'leche' },
      azucar: { cantidad: 30, unidad: 'g', nombre: 'azúcar' },
      polvoHornear: { cantidad: 10, unidad: 'g', nombre: 'polvo para hornear' },
      sal: { cantidad: 1, unidad: 'pizca', nombre: 'sal' },
    },
  },
  huevos_revueltos: {
    nombre: 'Huevos revueltos',
    baseComensales: 2,
    huevos: 4,
    otros: {
      leche: { cantidad: 30, unidad: 'ml', nombre: 'leche (opcional)' },
      manteca: { cantidad: 20, unidad: 'g', nombre: 'manteca' },
      sal: { cantidad: 1, unidad: 'pizca', nombre: 'sal y pimienta' },
    },
  },
};

export interface Outputs {
  recetaNombre: string;
  huevosNecesarios: number;
  escala: string;
  ingredientes: string;
  resumen: string;
}

export function huevosPorRecetaComensales(i: Inputs): Outputs {
  const key = (i.receta || 'tortilla_espanola') as keyof typeof RECETAS;
  const comensales = Number(i.comensales) || 0;
  if (comensales <= 0) throw new Error('Ingresá cantidad de comensales.');

  const base = RECETAS[key];
  if (!base) throw new Error('Receta no encontrada.');

  const factor = comensales / base.baseComensales;
  const huevos = Math.ceil(base.huevos * factor);

  const ingredientes: string[] = [];
  for (const k of Object.keys(base.otros)) {
    const ing = base.otros[k];
    const cant = ing.cantidad * factor;
    const cantRed =
      ing.unidad === 'g' || ing.unidad === 'ml'
        ? Math.round(cant)
        : Number(cant.toFixed(1));
    ingredientes.push(`${ing.nombre}: ${cantRed} ${ing.unidad}`);
  }

  return {
    recetaNombre: base.nombre,
    huevosNecesarios: huevos,
    escala: `×${factor.toFixed(2)} (base ${base.baseComensales} pax → ${comensales} pax)`,
    ingredientes: ingredientes.join(' | '),
    resumen: `Para ${comensales} comensales de ${base.nombre}: ${huevos} huevos + ${ingredientes.join(', ')}.`,
  };
}
