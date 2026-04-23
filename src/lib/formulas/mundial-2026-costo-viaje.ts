/** Mundial 2026: presupuesto total viaje (vuelo + hotel + entradas + extras) */
export interface Inputs {
  origen: string;
  destino: string;
  nivelHotel: string; // 'economico' | 'medio' | 'premium'
  personas: number;
  noches: number;
}

export interface Outputs {
  costoVuelos: number;
  costoHotel: number;
  costoEntradas: number;
  costoComida: number;
  costoTotal: number;
  costoPorPersona: number;
  costoPesos: string;
  resumen: string;
}

// Vuelos ida + vuelta (USD por persona)
const VUELOS: Record<string, Record<string, number>> = {
  argentina: {
    miami: 950, nyc: 1050, dallas: 1100, houston: 1100, 'los-angeles': 1250,
    atlanta: 1150, boston: 1200, toronto: 1200, vancouver: 1450,
    cdmx: 650, guadalajara: 680, monterrey: 700,
  },
  espana: {
    miami: 620, nyc: 550, dallas: 720, houston: 750, 'los-angeles': 750,
    atlanta: 680, boston: 560, toronto: 540, vancouver: 820,
    cdmx: 680, guadalajara: 750, monterrey: 780,
  },
  mexico: {
    miami: 350, nyc: 420, dallas: 280, houston: 260, 'los-angeles': 380,
    atlanta: 370, boston: 450, toronto: 480, vancouver: 550,
    cdmx: 150, guadalajara: 180, monterrey: 180,
  },
  colombia: {
    miami: 450, nyc: 620, dallas: 580, houston: 540, 'los-angeles': 720,
    atlanta: 500, boston: 650, toronto: 680, vancouver: 850,
    cdmx: 420, guadalajara: 480, monterrey: 500,
  },
  chile: {
    miami: 850, nyc: 950, dallas: 1000, houston: 1000, 'los-angeles': 1050,
    atlanta: 1050, boston: 1100, toronto: 1150, vancouver: 1300,
    cdmx: 780, guadalajara: 820, monterrey: 850,
  },
};

// Hotel por noche (USD) por ciudad y nivel
const HOTEL: Record<string, Record<string, number>> = {
  miami: { economico: 100, medio: 280, premium: 700 },
  nyc: { economico: 180, medio: 350, premium: 800 },
  dallas: { economico: 130, medio: 240, premium: 500 },
  houston: { economico: 125, medio: 230, premium: 480 },
  'los-angeles': { economico: 160, medio: 320, premium: 750 },
  atlanta: { economico: 110, medio: 220, premium: 480 },
  boston: { economico: 170, medio: 330, premium: 700 },
  toronto: { economico: 140, medio: 260, premium: 600 },
  vancouver: { economico: 160, medio: 300, premium: 650 },
  cdmx: { economico: 70, medio: 180, premium: 450 },
  guadalajara: { economico: 60, medio: 150, premium: 400 },
  monterrey: { economico: 70, medio: 160, premium: 420 },
};

// Gasto diario (comida + transporte + extras) por persona
const GASTO_DIARIO: Record<string, number> = {
  miami: 120, nyc: 140, dallas: 95, houston: 90, 'los-angeles': 130,
  atlanta: 95, boston: 125, toronto: 115, vancouver: 120,
  cdmx: 60, guadalajara: 55, monterrey: 60,
};

const NOMBRES_CIUDAD: Record<string, string> = {
  miami: 'Miami', nyc: 'New York/NJ', dallas: 'Dallas', houston: 'Houston',
  'los-angeles': 'Los Angeles', atlanta: 'Atlanta', boston: 'Boston',
  toronto: 'Toronto', vancouver: 'Vancouver',
  cdmx: 'CDMX', guadalajara: 'Guadalajara', monterrey: 'Monterrey',
};

const ARS_USD = 1130;

export function mundial2026CostoViaje(i: Inputs): Outputs {
  const origen = String(i.origen || 'argentina').toLowerCase();
  const destino = String(i.destino || 'miami').toLowerCase();
  const nivel = String(i.nivelHotel || 'medio').toLowerCase();
  const personas = Math.max(1, Math.min(8, Number(i.personas || 2)));
  const noches = Math.max(3, Math.min(30, Number(i.noches || 7)));

  const precioVuelo = VUELOS[origen]?.[destino];
  const precioHotel = HOTEL[destino]?.[nivel];
  const gastoDia = GASTO_DIARIO[destino];

  if (!precioVuelo || !precioHotel || !gastoDia) throw new Error('Combinación origen/destino no disponible.');

  const costoVuelos = precioVuelo * personas;
  // Hotel: asume 2 personas por habitación (suma el valor completo dividido en grupos de 2)
  const habitaciones = Math.ceil(personas / 2);
  const costoHotel = precioHotel * noches * habitaciones;
  // Entradas: 3 partidos fase grupos Tier 3 = $450 por persona
  const costoEntradas = 450 * personas;
  // Extras
  const costoComida = gastoDia * personas * noches;

  const costoTotal = costoVuelos + costoHotel + costoEntradas + costoComida;
  const costoPorPersona = Math.round(costoTotal / personas);
  const costoArs = costoTotal * ARS_USD;

  const origenLabel = origen.charAt(0).toUpperCase() + origen.slice(1);
  const destinoLabel = NOMBRES_CIUDAD[destino];

  return {
    costoVuelos,
    costoHotel,
    costoEntradas,
    costoComida,
    costoTotal,
    costoPorPersona,
    costoPesos: `ARS ${Math.round(costoArs).toLocaleString('es-AR')} (blue $${ARS_USD})`,
    resumen: `**${personas} persona${personas > 1 ? 's' : ''} ${origenLabel} → ${destinoLabel}, ${noches} noches, hotel ${nivel}**: vuelos $${costoVuelos.toLocaleString('en-US')} + hotel $${costoHotel.toLocaleString('en-US')} + entradas $${costoEntradas} + comida/extras $${costoComida.toLocaleString('en-US')} = **$${costoTotal.toLocaleString('en-US')} USD** total ($${costoPorPersona.toLocaleString('en-US')} por persona).`,
  };
}
