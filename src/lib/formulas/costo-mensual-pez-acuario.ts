/** Costo mensual de mantener un acuario según tipo, litros y país. */
export interface Inputs {
  litros: number;
  tipo?: string;
  pais?: string;
  invierno?: boolean;
}
export interface Outputs {
  costoTotal: number;
  electricidad: number;
  alimentoYAgua: number;
  filtroYMantenimiento: number;
  costoAnual: number;
  moneda: string;
}

export function costoMensualPezAcuario(i: Inputs): Outputs {
  const litros = Number(i.litros);
  if (!litros || litros <= 0) throw new Error('Ingresá los litros del acuario');

  const tipo = String(i.tipo || 'comunitario');
  const pais = String(i.pais || 'ar');
  const invierno = i.invierno === true;

  // Factor por tipo
  const factorTipo: Record<string, number> = {
    'basico': 0.6,
    'comunitario': 1.0,
    'plantado-basico': 1.3,
    'plantado-co2': 1.8,
    'ciclidos': 1.4,
    'marino': 3.5,
  };
  const fT = factorTipo[tipo] ?? 1.0;

  // Base mensual para un acuario de 60 L comunitario en Argentina, verano (ARS)
  // Electricidad (60L, filtro + luz + calefactor): ~6500
  // Alimento + acondicionador: ~4000
  // Mantenimiento: ~3000
  // Total: ~13500

  const baseLitros = litros / 60;
  const factorInvierno = invierno ? 1.35 : 1.0;

  let elec = 6500 * baseLitros * fT * factorInvierno;
  let alim = 4000 * baseLitros * fT;
  let mant = 3000 * baseLitros * fT;

  // Ajuste marino: sal + test kits suman fijo
  if (tipo === 'marino') {
    mant += 10000 * baseLitros;
  }

  // Ajuste país
  const paisCfg: Record<string, { mult: number; moneda: string }> = {
    'ar': { mult: 1.0, moneda: 'ARS' },
    'mx': { mult: 0.025, moneda: 'MXN' },
    'es': { mult: 0.0012, moneda: 'EUR' },
    'us': { mult: 0.0013, moneda: 'USD' },
  };
  const cfg = paisCfg[pais] ?? paisCfg['ar'];

  elec *= cfg.mult;
  alim *= cfg.mult;
  mant *= cfg.mult;

  const total = elec + alim + mant;
  const round = (n: number) => (cfg.moneda === 'EUR' || cfg.moneda === 'USD' ? Number(n.toFixed(1)) : Math.round(n));

  return {
    costoTotal: round(total),
    electricidad: round(elec),
    alimentoYAgua: round(alim),
    filtroYMantenimiento: round(mant),
    costoAnual: round(total * 12),
    moneda: cfg.moneda,
  };
}
