/** Cuota de socio de clubes de fútbol top (Argentina + Europa) */
export interface Inputs {
  club: 'boca' | 'river' | 'racing' | 'san-lorenzo' | 'estudiantes-lp' | 'velez' | 'newells' | 'rosario-central' | 'real-madrid' | 'barcelona' | 'liverpool' | 'arsenal' | 'atletico-madrid' | 'juventus' | 'bayern' | 'psg';
  tipoSocio: 'activo' | 'cadete' | 'adherente' | 'vitalicio';
  meses?: number;
}
export interface Outputs {
  cuotaMensual: number;
  moneda: string;
  totalPeriodo: number;
  clubLabel: string;
  tipoLabel: string;
  observacion: string;
  mensaje: string;
}

// Valores 2026 (referenciales). Argentina en ARS mensuales; Europa usualmente anuales en EUR/GBP
const CLUBES: Record<string, { label: string; moneda: 'ARS' | 'EUR' | 'GBP'; activo: number; cadete: number; adherente: number; vitalicio: number; periodo: 'mes' | 'anio'; obs: string }> = {
  'boca':             { label: 'Boca Juniors',     moneda: 'ARS', activo: 40_000,  cadete: 18_000,  adherente: 15_000,  vitalicio: 0,         periodo: 'mes', obs: 'Cuota Boca Socio — categoría Activo Mayor. Lista de espera para nuevos socios.' },
  'river':            { label: 'River Plate',      moneda: 'ARS', activo: 42_000,  cadete: 20_000,  adherente: 16_000,  vitalicio: 0,         periodo: 'mes', obs: 'Cuota River Socio Activo. Incluye acceso a sede, escuelas deportivas y preferencia en entradas.' },
  'racing':           { label: 'Racing Club',      moneda: 'ARS', activo: 28_000,  cadete: 12_000,  adherente: 10_000,  vitalicio: 0,         periodo: 'mes', obs: 'Cuota Racing Socio Activo Pleno.' },
  'san-lorenzo':      { label: 'San Lorenzo',      moneda: 'ARS', activo: 25_000,  cadete: 11_000,  adherente: 9_000,   vitalicio: 0,         periodo: 'mes', obs: 'Cuota San Lorenzo Socio Activo.' },
  'estudiantes-lp':   { label: 'Estudiantes LP',   moneda: 'ARS', activo: 22_000,  cadete: 9_000,   adherente: 7_500,   vitalicio: 0,         periodo: 'mes', obs: 'Cuota Estudiantes La Plata Socio Activo.' },
  'velez':            { label: 'Vélez Sarsfield',  moneda: 'ARS', activo: 24_000,  cadete: 10_000,  adherente: 8_500,   vitalicio: 0,         periodo: 'mes', obs: 'Cuota Vélez Socio Activo. Incluye acceso a instalaciones polideportivas.' },
  'newells':          { label: "Newell's Old Boys", moneda: 'ARS', activo: 18_000, cadete: 8_000,   adherente: 6_500,   vitalicio: 0,         periodo: 'mes', obs: "Cuota Newell's Socio Activo." },
  'rosario-central':  { label: 'Rosario Central',  moneda: 'ARS', activo: 19_000,  cadete: 8_500,   adherente: 6_800,   vitalicio: 0,         periodo: 'mes', obs: 'Cuota Rosario Central Socio Activo.' },
  'real-madrid':      { label: 'Real Madrid',      moneda: 'EUR', activo: 149,     cadete: 15,      adherente: 80,      vitalicio: 0,         periodo: 'anio', obs: 'Cuota anual de socio (Socio Madridista). Lista de espera cerrada; sólo por herencia familiar.' },
  'barcelona':        { label: 'FC Barcelona',     moneda: 'EUR', activo: 210,     cadete: 18,      adherente: 105,     vitalicio: 0,         periodo: 'anio', obs: 'Cuota anual FC Barcelona Soci. Permite votar al presidente.' },
  'liverpool':        { label: 'Liverpool FC',     moneda: 'GBP', activo: 50,      cadete: 20,      adherente: 30,      vitalicio: 0,         periodo: 'anio', obs: 'Members Club (Official Members). La temporada de abono es aparte (~£750–£950/año).' },
  'arsenal':          { label: 'Arsenal FC',       moneda: 'GBP', activo: 47,      cadete: 30,      adherente: 35,      vitalicio: 0,         periodo: 'anio', obs: 'Arsenal Silver Membership (anual). Abono de temporada £1.000+ aparte.' },
  'atletico-madrid':  { label: 'Atlético Madrid',  moneda: 'EUR', activo: 130,     cadete: 20,      adherente: 75,      vitalicio: 0,         periodo: 'anio', obs: 'Cuota anual Atlético Madrid. Acceso a prioridad en entradas.' },
  'juventus':         { label: 'Juventus',         moneda: 'EUR', activo: 80,      cadete: 25,      adherente: 50,      vitalicio: 0,         periodo: 'anio', obs: 'Juventus Official Member (anual).' },
  'bayern':           { label: 'Bayern München',   moneda: 'EUR', activo: 70,      cadete: 15,      adherente: 40,      vitalicio: 0,         periodo: 'anio', obs: 'Bayern eV Mitglied (anual). Modelo mutual (socios eligen presidente).' },
  'psg':              { label: 'Paris Saint-Germain', moneda: 'EUR', activo: 150,  cadete: 35,      adherente: 90,      vitalicio: 0,         periodo: 'anio', obs: 'PSG Premium Member (anual).' },
};

export function cuotaSocioFutbol(i: Inputs): Outputs {
  const fila = CLUBES[i.club];
  if (!fila) throw new Error('Club inválido.');
  const meses = Math.max(1, Number(i.meses) || 12);
  let cuota = 0;
  const tipoLabel: Record<string, string> = { activo: 'Socio Activo', cadete: 'Cadete/Menor', adherente: 'Adherente', vitalicio: 'Vitalicio (sin cuota)' };

  if (i.tipoSocio === 'vitalicio') {
    cuota = 0;
  } else {
    cuota = (fila as any)[i.tipoSocio];
  }

  // Normalizar cuota a "mensual" para mostrar comparativa
  const cuotaMensual = fila.periodo === 'mes' ? cuota : cuota / 12;
  const totalPeriodo = fila.periodo === 'mes' ? cuota * meses : (cuota / 12) * meses;

  return {
    cuotaMensual: Math.round(cuotaMensual * 100) / 100,
    moneda: fila.moneda,
    totalPeriodo: Math.round(totalPeriodo * 100) / 100,
    clubLabel: fila.label,
    tipoLabel: tipoLabel[i.tipoSocio] || i.tipoSocio,
    observacion: fila.obs,
    mensaje: `${fila.label} — ${tipoLabel[i.tipoSocio]}: ${Math.round(cuotaMensual)} ${fila.moneda}/mes (${Math.round(totalPeriodo)} ${fila.moneda} en ${meses} meses).`,
  };
}
