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
  _insight?: any;
  _chart?: any;
}

export function costoMensualPezAcuario(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar.
  (i as any).invierno = (i as any).invierno === true || (i as any).invierno === 'true';
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

  const rTotal = round(total);
  const rElec = round(elec);
  const rAlim = round(alim);
  const rMant = round(mant);
  const rAnual = round(total * 12);
  const pctElec = total > 0 ? Math.round((elec / total) * 100) : 0;
  const esMarino = tipo === 'marino';
  const fmtN = (n: number) => n.toLocaleString('es-AR');
  const prefix = cfg.moneda === 'EUR' ? '€' : '$';
  const fc = (n: number) => prefix + fmtN(n);

  return {
    costoTotal: rTotal,
    electricidad: rElec,
    alimentoYAgua: rAlim,
    filtroYMantenimiento: rMant,
    costoAnual: rAnual,
    moneda: cfg.moneda,
    _insight: {
      title: esMarino ? 'Acuario marino: el más exigente' : 'Lo que más pesa: la electricidad',
      text: esMarino
        ? `Mantener tus **${litros} L marinos** cuesta **${fc(rTotal)} ${cfg.moneda}/mes** (**${fc(rAnual)}** al año). Es el tipo más caro: la sal, los test kits y el equipamiento elevan el mantenimiento muy por encima de un acuario de agua dulce del mismo tamaño.`
        : `Tu acuario de **${litros} L** cuesta **${fc(rTotal)} ${cfg.moneda}/mes** (**${fc(rAnual)}** al año). La **electricidad** se lleva el **${pctElec}%** (**${fc(rElec)}**): filtro, luz y calefactor son el gasto fijo que más mueve la aguja${invierno ? ', y en invierno el calefactor lo sube todavía más' : ''}.`,
      tone: esMarino ? 'warn' : (pctElec >= 50 ? 'warn' : 'neutral'),
      icon: esMarino ? '🐠' : '🐟',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Electricidad', value: rElec },
        { label: 'Alimento y agua', value: rAlim },
        { label: 'Filtro y mantenimiento', value: rMant },
      ],
      prefix,
      centerValue: fc(rTotal),
      centerLabel: 'Total/mes',
      ariaLabel: `Desglose del costo mensual del acuario: electricidad ${fmtN(rElec)}, alimento y agua ${fmtN(rAlim)}, filtro y mantenimiento ${fmtN(rMant)} ${cfg.moneda}.`,
    },
  };
}
