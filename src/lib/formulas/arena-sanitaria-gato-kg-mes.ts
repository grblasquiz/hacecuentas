/** Kg de arena sanitaria por mes según cantidad de gatos y tipo */
export interface Inputs {
  cantidadGatos: number;
  tipoArena?: string;
  tamañoBandeja?: string;
}
export interface Outputs {
  kgMes: number;
  costoMes: number;
  bandejas: number;
  frecuenciaCambio: string;
  detalle: string;
}

interface ArenaData {
  kgMesBase: number;
  precioPorKg: number;
  cambio: string;
}

const ARENAS: Record<string, ArenaData> = {
  aglomerante: { kgMesBase: 8, precioPorKg: 750, cambio: 'Cambio total cada 10-15 días. Limpieza de grumos diaria.' },
  absorbente: { kgMesBase: 17, precioPorKg: 500, cambio: 'Cambio total cada 5-7 días. Retirar sólidos diariamente.' },
  silice: { kgMesBase: 4, precioPorKg: 2000, cambio: 'Cambio total cada 20-30 días. Retirar sólidos diariamente y revolver.' },
  biodegradable: { kgMesBase: 8, precioPorKg: 1100, cambio: 'Cambio total cada 7-14 días. Limpieza diaria de grumos/sólidos.' },
};

const NOMBRES_ARENA: Record<string, string> = {
  aglomerante: 'Aglomerante (bentonita)',
  absorbente: 'Absorbente (piedritas)',
  silice: 'Sílice gel (cristales)',
  biodegradable: 'Biodegradable',
};

// Factor bandeja: bandejas más grandes usan un poco más de arena
const FACTOR_BANDEJA: Record<string, number> = {
  chica: 0.8,
  mediana: 1.0,
  grande: 1.2,
};

export function arenaSanitariaGatoKgMes(i: Inputs): Outputs {
  const gatos = Number(i.cantidadGatos);
  const tipo = String(i.tipoArena || 'aglomerante');
  const bandeja = String(i.tamañoBandeja || 'mediana');

  if (!gatos || gatos < 1 || gatos > 10) throw new Error('Ingresá la cantidad de gatos (1-10)');

  const arena = ARENAS[tipo] || ARENAS.aglomerante;
  const factorBandeja = FACTOR_BANDEJA[bandeja] || 1.0;

  // Cada gato adicional agrega ~80% del consumo base (comparten bandejas parcialmente)
  const factorGatos = 1 + (gatos - 1) * 0.8;
  const kgMes = Math.round(arena.kgMesBase * factorGatos * factorBandeja);
  const costoMes = Math.round(kgMes * arena.precioPorKg);

  // Regla AAFP: N° gatos + 1 bandejas
  const bandejas = gatos + 1;

  const nombreArena = NOMBRES_ARENA[tipo] || tipo;

  return {
    kgMes,
    costoMes,
    bandejas,
    frecuenciaCambio: arena.cambio,
    detalle: `Para ${gatos} gato${gatos > 1 ? 's' : ''} con arena ${nombreArena}: ~${kgMes} kg/mes. Costo: ~$${costoMes.toLocaleString('es-AR')}/mes. Necesitás ${bandejas} bandejas. ${arena.cambio}`,
  };
}
