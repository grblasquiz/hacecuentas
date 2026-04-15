/** Presupuesto diario estimado para viajar como mochilero según país */
export interface Inputs {
  pais: string;
  estilo: string; // 'mochilero' | 'moderado' | 'confort'
  dias: number;
  personas: number;
}

export interface Outputs {
  costoDiarioUsd: number;
  costoTotalUsd: number;
  costoTotalPorPersonaUsd: number;
  desgloseUsd: { alojamiento: number; comida: number; transporte: number; extras: number };
  resumen: string;
}

// Presupuestos diarios por persona en USD (base: estilo mochilero)
const PAISES: Record<string, number> = {
  'argentina': 35,
  'brasil': 45,
  'chile': 50,
  'uruguay': 55,
  'peru': 30,
  'bolivia': 25,
  'colombia': 35,
  'ecuador': 30,
  'mexico': 40,
  'usa': 80,
  'canada': 75,
  'espana': 60,
  'francia': 75,
  'italia': 70,
  'uk': 85,
  'alemania': 65,
  'portugal': 55,
  'grecia': 55,
  'tailandia': 30,
  'vietnam': 25,
  'india': 20,
  'japon': 90,
  'china': 45,
  'indonesia': 30,
  'australia': 85,
  'sudafrica': 45,
  'marruecos': 35,
  'egipto': 30,
  'turquia': 40,
};

const MULTIPLICADOR: Record<string, number> = {
  mochilero: 1.0,
  moderado: 2.0,
  confort: 3.5,
};

export function costoMochileroPorPais(i: Inputs): Outputs {
  const pais = String(i.pais || 'argentina');
  const estilo = String(i.estilo || 'mochilero');
  const dias = Number(i.dias);
  const personas = Math.max(1, Number(i.personas) || 1);

  if (!dias || dias <= 0) throw new Error('Ingresá cantidad de días');

  const base = PAISES[pais] || 50;
  const mult = MULTIPLICADOR[estilo] || 1;
  const diario = base * mult;

  // Desglose aproximado: 40% alojamiento, 30% comida, 20% transporte, 10% extras
  const alojamiento = diario * 0.40;
  const comida = diario * 0.30;
  const transporte = diario * 0.20;
  const extras = diario * 0.10;

  const totalPorPersona = diario * dias;
  const total = totalPorPersona * personas;

  return {
    costoDiarioUsd: Math.round(diario),
    costoTotalUsd: Math.round(total),
    costoTotalPorPersonaUsd: Math.round(totalPorPersona),
    desgloseUsd: {
      alojamiento: Math.round(alojamiento),
      comida: Math.round(comida),
      transporte: Math.round(transporte),
      extras: Math.round(extras),
    },
    resumen: `Presupuesto estimado en ${pais} (estilo ${estilo}): **US$ ${Math.round(diario)} por día por persona**. Total ${dias} días × ${personas} personas: **US$ ${Math.round(total).toLocaleString()}**.`,
  };
}
