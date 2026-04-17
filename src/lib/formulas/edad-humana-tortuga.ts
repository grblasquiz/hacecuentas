/** Edad de la tortuga en años humanos según especie. */
export interface Inputs {
  edadAnios: number;
  especie?: string;
}
export interface Outputs {
  edadHumana: number;
  etapaVital: string;
  madurezSexual: string;
  expectativaTotal: number;
}

export function edadHumanaTortuga(i: Inputs): Outputs {
  const e = Math.max(0, Number(i.edadAnios));
  const especie = String(i.especie || 'mediterranea');

  // Factores: primeros años más lentos, luego lineal
  const factores: Record<string, { primerosAnios: number; ratioPrimeros: number; ratioAdulto: number; expectativa: number; madurez: number }> = {
    'mediterranea': { primerosAnios: 5, ratioPrimeros: 1.6, ratioAdulto: 1.1, expectativa: 70, madurez: 8 },
    'rusa': { primerosAnios: 5, ratioPrimeros: 1.8, ratioAdulto: 1.3, expectativa: 50, madurez: 7 },
    'sulcata': { primerosAnios: 5, ratioPrimeros: 1.2, ratioAdulto: 1.05, expectativa: 85, madurez: 17 },
    'leopardo': { primerosAnios: 5, ratioPrimeros: 1.2, ratioAdulto: 1.05, expectativa: 70, madurez: 12 },
    'trachemys': { primerosAnios: 5, ratioPrimeros: 2.0, ratioAdulto: 1.6, expectativa: 25, madurez: 4 },
    'matamata': { primerosAnios: 5, ratioPrimeros: 1.6, ratioAdulto: 1.3, expectativa: 30, madurez: 7 },
    'otra-acuatica': { primerosAnios: 5, ratioPrimeros: 1.8, ratioAdulto: 1.4, expectativa: 30, madurez: 5 },
  };
  const f = factores[especie] ?? factores['mediterranea'];

  let humana = 0;
  if (e <= f.primerosAnios) humana = e * f.ratioPrimeros;
  else humana = f.primerosAnios * f.ratioPrimeros + (e - f.primerosAnios) * f.ratioAdulto;

  // Etapa vital (tomando expectativa)
  const pct = e / f.expectativa;
  let etapa = '';
  if (e < 2) etapa = 'Cría';
  else if (e < f.madurez) etapa = 'Juvenil';
  else if (pct < 0.3) etapa = 'Adulto joven';
  else if (pct < 0.7) etapa = 'Adulto';
  else if (pct < 0.9) etapa = 'Adulto mayor';
  else etapa = 'Anciano';

  const madurezTxt = e >= f.madurez
    ? 'Ya alcanzó madurez sexual'
    : `~${Math.round(f.madurez - e)} años hasta madurez sexual`;

  return {
    edadHumana: Math.round(humana),
    etapaVital: etapa,
    madurezSexual: madurezTxt,
    expectativaTotal: f.expectativa,
  };
}
