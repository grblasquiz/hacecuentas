/** Mundial 2026: convierte hora UTC del partido a las zonas horarias relevantes */
export interface Inputs {
  horaUtc: string; // "HH:MM"
  sede: string;
}

export interface Outputs {
  horaBsAs: string;
  horaMadrid: string;
  horaCdmx: string;
  horaBogota: string;
  horaSantiago: string;
  horaLima: string;
  horaLocalSede: string;
  resumen: string;
}

// Offset en horas (junio-julio 2026, DST donde aplica)
const ZONAS = {
  bsas: -3,
  madrid: 2,
  cdmx: -6,
  bogota: -5,
  santiago: -4,
  lima: -5,
};

const SEDE_OFFSET: Record<string, { nombre: string; offset: number }> = {
  ny: { nombre: 'New York/NJ', offset: -4 },
  miami: { nombre: 'Miami', offset: -4 },
  atlanta: { nombre: 'Atlanta', offset: -4 },
  boston: { nombre: 'Boston', offset: -4 },
  philadelphia: { nombre: 'Philadelphia', offset: -4 },
  toronto: { nombre: 'Toronto', offset: -4 },
  dallas: { nombre: 'Dallas', offset: -5 },
  houston: { nombre: 'Houston', offset: -5 },
  'kansas-city': { nombre: 'Kansas City', offset: -5 },
  cdmx: { nombre: 'CDMX', offset: -6 },
  guadalajara: { nombre: 'Guadalajara', offset: -6 },
  monterrey: { nombre: 'Monterrey', offset: -6 },
  'los-angeles': { nombre: 'Los Angeles', offset: -7 },
  seattle: { nombre: 'Seattle', offset: -7 },
  'sf-bay': { nombre: 'SF Bay Area', offset: -7 },
  vancouver: { nombre: 'Vancouver', offset: -7 },
};

function parseUtc(s: string): { h: number; m: number } {
  const clean = String(s || '').trim().replace(/\s/g, '');
  const match = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) throw new Error('Formato inválido. Usá HH:MM (ej: 21:00).');
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) throw new Error('Hora fuera de rango.');
  return { h, m };
}

function fmt(hBase: number, mBase: number, offset: number): string {
  // Suma offset en horas (fraccional no aplica aquí)
  let total = hBase * 60 + mBase + offset * 60;
  // Normalizar a 0-1439
  let dayShift = 0;
  while (total < 0) { total += 1440; dayShift -= 1; }
  while (total >= 1440) { total -= 1440; dayShift += 1; }
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  const label = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  if (dayShift === 1) return `${label} (día siguiente)`;
  if (dayShift === -1) return `${label} (día anterior)`;
  return label;
}

export function mundial2026HorarioZonaHoraria(i: Inputs): Outputs {
  const { h, m } = parseUtc(i.horaUtc);
  const sede = SEDE_OFFSET[String(i.sede || 'ny').toLowerCase()] || SEDE_OFFSET.ny;

  const hBsAs = fmt(h, m, ZONAS.bsas);
  const hMadrid = fmt(h, m, ZONAS.madrid);
  const hCdmx = fmt(h, m, ZONAS.cdmx);
  const hBogota = fmt(h, m, ZONAS.bogota);
  const hSantiago = fmt(h, m, ZONAS.santiago);
  const hLima = fmt(h, m, ZONAS.lima);
  const hLocal = fmt(h, m, sede.offset);

  return {
    horaBsAs: hBsAs + ' hs',
    horaMadrid: hMadrid + ' hs',
    horaCdmx: hCdmx + ' hs',
    horaBogota: hBogota + ' hs',
    horaSantiago: hSantiago + ' hs',
    horaLima: hLima + ' hs',
    horaLocalSede: `${hLocal} hs (${sede.nombre})`,
    resumen: `Partido **${i.horaUtc} UTC** en ${sede.nombre}: ${hBsAs} BsAs · ${hMadrid} Madrid · ${hCdmx} CDMX · ${hBogota} Bogotá · ${hSantiago} Santiago · ${hLima} Lima. Local: ${hLocal}.`,
  };
}
