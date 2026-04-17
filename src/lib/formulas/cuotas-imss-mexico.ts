/**
 * Calculadora de cuotas IMSS México (obrero-patronales)
 * Incluye enfermedad/maternidad, invalidez/vida, retiro/cesantía e Infonavit
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  sueldoDiarioIntegrado: number;
  diasPeriodo?: number;
}

export interface Outputs {
  aporteObrero: number;
  aportePatron: number;
  totalCuotas: number;
  desglose: Record<string, { obrero: number; patron: number }>;
  mensaje: string;
}

export function cuotasImssMexico(i: Inputs): Outputs {
  const sdi = Number(i.sueldoDiarioIntegrado);
  const dias = Number(i.diasPeriodo ?? 30);

  if (!sdi || sdi <= 0) throw new Error('Ingresá el sueldo diario integrado (SDI)');
  if (!dias || dias <= 0) throw new Error('Ingresá los días del período');

  const base = sdi * dias;
  // Valores proyectados 2026 (porcentajes sobre SDI)
  const pct = {
    enfMatPatron: 20.40, // cuota fija estimada como % indicativo (incluye UMA fija + excedente)
    enfMatObrero: 0.40,
    invVidaPatron: 1.75,
    invVidaObrero: 0.625,
    retPatron: 2.00,
    cesPatron: 3.15,
    cesObrero: 1.125,
    guarderiaPatron: 1.00,
    riesgoPatron: 0.50, // promedio
    infonavitPatron: 5.00,
  };

  const enfMat = { obrero: base * pct.enfMatObrero / 100, patron: base * pct.enfMatPatron / 100 };
  const invVida = { obrero: base * pct.invVidaObrero / 100, patron: base * pct.invVidaPatron / 100 };
  const retiro = { obrero: 0, patron: base * pct.retPatron / 100 };
  const cesantia = { obrero: base * pct.cesObrero / 100, patron: base * pct.cesPatron / 100 };
  const guarderia = { obrero: 0, patron: base * pct.guarderiaPatron / 100 };
  const riesgo = { obrero: 0, patron: base * pct.riesgoPatron / 100 };
  const infonavit = { obrero: 0, patron: base * pct.infonavitPatron / 100 };

  const desglose = {
    'Enfermedad y maternidad': enfMat,
    'Invalidez y vida': invVida,
    'Retiro': retiro,
    'Cesantía y vejez': cesantia,
    'Guarderías': guarderia,
    'Riesgo de trabajo': riesgo,
    'Infonavit': infonavit,
  };

  const aporteObrero = Object.values(desglose).reduce((s, v) => s + v.obrero, 0);
  const aportePatron = Object.values(desglose).reduce((s, v) => s + v.patron, 0);
  const totalCuotas = aporteObrero + aportePatron;

  // Redondear desglose
  const desgloseRedondeado: Record<string, { obrero: number; patron: number }> = {};
  for (const [k, v] of Object.entries(desglose)) {
    desgloseRedondeado[k] = {
      obrero: Number(v.obrero.toFixed(2)),
      patron: Number(v.patron.toFixed(2)),
    };
  }

  return {
    aporteObrero: Number(aporteObrero.toFixed(2)),
    aportePatron: Number(aportePatron.toFixed(2)),
    totalCuotas: Number(totalCuotas.toFixed(2)),
    desglose: desgloseRedondeado,
    mensaje: `Cuota obrera: $${aporteObrero.toFixed(2)} | Cuota patronal: $${aportePatron.toFixed(2)} | Total: $${totalCuotas.toFixed(2)} sobre ${dias} días.`,
  };
}
