/** Costo mensual de un gato según raza, alimento y país. Valores de referencia 2026. */
export interface Inputs {
  raza?: string;
  edad?: string;
  tipoAlimento?: string;
  pais?: string;
}
export interface Outputs {
  costoTotal: number;
  costoAlimento: number;
  costoArena: number;
  costoVeterinario: number;
  costoAccesorios: number;
  costoAnual: number;
  moneda: string;
  resumen: string;
}

export function costoMensualRazaGato(i: Inputs): Outputs {
  const raza = String(i.raza || 'mestizo');
  const edad = String(i.edad || 'adulto');
  const tipo = String(i.tipoAlimento || 'premium');
  const pais = String(i.pais || 'ar');

  // Factor por raza (multiplicador sobre mestizo base)
  const razaFactor: Record<string, number> = {
    'mestizo': 1.0,
    'siames': 1.05,
    'persa': 1.8,
    'britanico': 1.3,
    'maine-coon': 2.0,
    'ragdoll': 1.7,
    'bengali': 1.5,
    'sphynx': 1.65,
  };
  const fRaza = razaFactor[raza] ?? 1.0;

  // Factor por etapa
  const fEdad = edad === 'cachorro' ? 1.1 : edad === 'senior' ? 1.2 : 1.0;

  // Factor por tipo de alimento
  const fAlim = tipo === 'standard' ? 0.7 : tipo === 'super-premium' ? 1.4 : 1.0;

  // Base mensual en ARS para mestizo, adulto, premium (abril 2026)
  const baseAlimento = 30000;
  const baseArena = 12000;
  const baseVet = 10000;
  const baseAcc = 5000;

  // Ajustes por país (multiplicador) y moneda
  const paisCfg: Record<string, { mult: number; moneda: string }> = {
    'ar': { mult: 1.0, moneda: 'ARS' },
    'mx': { mult: 0.025, moneda: 'MXN' },
    'es': { mult: 0.0012, moneda: 'EUR' },
    'us': { mult: 0.0013, moneda: 'USD' },
  };
  const cfg = paisCfg[pais] ?? paisCfg['ar'];

  const alimento = baseAlimento * fRaza * fEdad * fAlim * cfg.mult;
  const arena = baseArena * Math.min(fRaza, 1.6) * cfg.mult;
  const vet = baseVet * fEdad * (raza === 'persa' || raza === 'sphynx' ? 1.3 : 1.0) * cfg.mult;
  // Peluquería/accesorios premium para razas de pelo largo o sin pelo
  const peluFactor = raza === 'persa' || raza === 'maine-coon' || raza === 'ragdoll' ? 2.2 : raza === 'sphynx' ? 1.8 : 1.0;
  const acc = baseAcc * peluFactor * cfg.mult;

  const total = alimento + arena + vet + acc;

  const round = (n: number) => cfg.moneda === 'EUR' || cfg.moneda === 'USD' ? Number(n.toFixed(1)) : Math.round(n);

  return {
    costoTotal: round(total),
    costoAlimento: round(alimento),
    costoArena: round(arena),
    costoVeterinario: round(vet),
    costoAccesorios: round(acc),
    costoAnual: round(total * 12),
    moneda: cfg.moneda,
    resumen: `Costo mensual estimado: ${round(total)} ${cfg.moneda}. Anual: ${round(total * 12)} ${cfg.moneda}.`,
  };
}
