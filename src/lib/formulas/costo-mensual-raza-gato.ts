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
  _insight?: any;
  _chart?: any;
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

  const rTotal = round(total);
  const rAlim = round(alimento);
  const rArena = round(arena);
  const rVet = round(vet);
  const rAcc = round(acc);
  const rAnual = round(total * 12);
  const fmtN = (n: number) => n.toLocaleString('es-AR');
  const prefix = cfg.moneda === 'EUR' ? '€' : '$';
  const fc = (n: number) => prefix + fmtN(n);
  const peludo = raza === 'persa' || raza === 'maine-coon' || raza === 'ragdoll' || raza === 'sphynx';

  const rubros = [
    { label: 'Alimento', value: rAlim },
    { label: 'Arena', value: rArena },
    { label: 'Veterinario', value: rVet },
    { label: 'Accesorios/peluquería', value: rAcc },
  ];
  const mayor = rubros.reduce((a, b) => (b.value > a.value ? b : a), rubros[0]);
  const pctMayor = rTotal > 0 ? Math.round((mayor.value / rTotal) * 100) : 0;
  const razaLabel = raza.replace(/-/g, ' ');

  return {
    costoTotal: rTotal,
    costoAlimento: rAlim,
    costoArena: rArena,
    costoVeterinario: rVet,
    costoAccesorios: rAcc,
    costoAnual: rAnual,
    moneda: cfg.moneda,
    resumen: `Costo mensual estimado: ${round(total)} ${cfg.moneda}. Anual: ${round(total * 12)} ${cfg.moneda}.`,
    _insight: {
      title: peludo ? `Un ${razaLabel} pide cuidado extra` : `Cuánto cuesta tu ${razaLabel}`,
      text: peludo
        ? `Tener un **${razaLabel}** sale **${fc(rTotal)} ${cfg.moneda}/mes** (**${fc(rAnual)}** al año). Es una raza de mantenimiento alto: la **peluquería y los accesorios** suman **${fc(rAcc)}** porque el pelo${raza === 'sphynx' ? ' (o la falta de él)' : ' largo'} exige cuidado frecuente. El rubro que más pesa es **${mayor.label}** (**${pctMayor}%**).`
        : `Mantener tu **${razaLabel}** cuesta **${fc(rTotal)} ${cfg.moneda}/mes** (**${fc(rAnual)}** al año). El gasto que más pesa es **${mayor.label}**, con **${fc(mayor.value)}** (**${pctMayor}%** del total). Tenelo en cuenta para armar el presupuesto mensual.`,
      tone: 'neutral',
      icon: '🐱',
    },
    _chart: {
      type: 'doughnut',
      slices: rubros,
      prefix,
      centerValue: fc(rTotal),
      centerLabel: 'Total/mes',
      ariaLabel: `Desglose del costo mensual del gato: alimento ${fmtN(rAlim)}, arena ${fmtN(rArena)}, veterinario ${fmtN(rVet)}, accesorios ${fmtN(rAcc)} ${cfg.moneda}.`,
    },
  };
}
